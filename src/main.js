import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useHomeStore } from '@/store/home'
import { baseURL } from '@/api/config'

const pinia = createPinia()
const app = createApp(App)
app.use(router).use(pinia).mount('#app')

// WebSocket 逻辑
let ws = null
let wsInitialized = false
let heartbeatTimer = null

// 构造 WebSocket 地址
const wsURL = baseURL.replace(/^http/, 'ws')

function setupWebSocket() {
  if (wsInitialized) return;
  wsInitialized = true;
  const homeStore = useHomeStore()
  ws = new WebSocket(wsURL + '/ws/chat?token=' + localStorage.getItem('token'))
  window.$ws = ws

  // 启动心跳定时器，每3秒发送一次心跳
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
    }
  }, 3000)

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    console.log('收到新消息:', msg)
    msg.receiverId = msg.type === 'private' ? msg.user.id : msg.groupId
    // 正确获取当前路由
    const route = router.currentRoute.value
    const isActiveChatPage = route.path === '/chat' && route.query.type === msg.type &&
      (
        (msg.type === 'private' && (route.query.id == msg.user.id || route.query.id == msg.receiverId)) ||
        (msg.type === 'group' && route.query.id == msg.groupId)
      )
    homeStore.incrementUnreadByMsg(msg, isActiveChatPage)

    if (isActiveChatPage && window.$chatPageRef && window.$chatPageRef.appendMessage) {
      window.$chatPageRef.appendMessage(msg)
    }
  }

  ws.onclose = function () {
    wsInitialized = false;
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    setTimeout(() => {
      if (!isAuthPage(router.currentRoute.value.path)) {
        setupWebSocket()
      }
    }, 3000)
  }
}

function isAuthPage(path) {
  return path === '/login' || path === '/register';
}

router.afterEach((to) => {
  if (localStorage.getItem('token') && !wsInitialized && !isAuthPage(to.path)) {
    setupWebSocket();
  }
  if (isAuthPage(to.path) && wsInitialized && ws) {
    ws.close();
    ws = null;
    wsInitialized = false;
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }
});

