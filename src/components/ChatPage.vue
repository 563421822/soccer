<template>
  <div class="chat-page">
    <div class="chat-header">
      <span class="chat-back" @click="goBack">&lt; 返回</span>
      <div class="chat-header-info">
        <span class="chat-title">{{ chatTitle }}</span>
        <span class="chat-status">当前在线</span>
      </div>
      <img :src="chatAvatar" class="chat-avatar" alt="头像" @click="goToUserProfile"/>
    </div>
    <div class="chat-content" ref="chatContentRef">
      <div class="chat-bg"></div>
      <div v-if="loading" class="chat-loading">加载中...</div>
      <div v-else>
        <div class="chat-date">今天</div>
        <div class="chat-divider">- 以下是未读消息 -</div>
        <div v-for="msg in messages" :key="msg.id"
          :class="['chat-msg', isSelf(msg) ? 'chat-msg-right' : 'chat-msg-left']">
          <div class="msg-avatar">
            <img
              :src="isSelf(msg) ? (profileData?.avatar || './images/avatar.svg') : (msg.user?.avatar || './images/user.svg')"
              alt="头像" />
          </div>
          <div :class="['msg-body', isSelf(msg) ? 'msg-body-self' : '']">
            <div class="msg-text">{{ msg.content }}</div>
            <div class="msg-time">{{ msg.sendTime }}</div>
          </div>
        </div>
        <div v-if="!messages.length" class="chat-empty">暂无聊天记录</div>
        <div class="chat-tip">您已添加了 {{ chatTitle }}，现在可以开始聊天了</div>
      </div>
    </div>
    <div class="chat-bottom-area" :class="{ expanded: showToolBar }">
      <transition name="tool-bar-push">
        <div v-if="showToolBar" class="chat-tool-bar">
          <div class="tool-item"><span class="icon-img"></span>相册</div>
          <div class="tool-item"><span class="icon-camera"></span>拍摄</div>
          <div class="tool-item"><span class="icon-phone"></span>语音通话</div>
          <div class="tool-item"><span class="icon-video"></span>视频通话</div>
          <div class="tool-item"><span class="icon-user"></span>名片</div>
          <div class="tool-item"><span class="icon-group"></span>群名片</div>
          <div class="tool-item"><span class="icon-file"></span>文件</div>
        </div>
      </transition>
      <div class="chat-input-bar">
        <button class="chat-plus" @click="toggleToolBar"><span>＋</span></button>
        <input v-model="inputText" class="chat-input" placeholder="输入消息..." @keyup.enter="sendMsg" />
        <button class="chat-voice"><span class="icon-voice"></span></button>
        <button class="chat-send-btn" @click="sendMsg">发送</button>
      </div>
    </div>
    <div v-if="showToast" class="toast">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
function goToUserProfile() {
  // 头像信息优先取 profileData
  const avatar = profileData.value?.avatar || './images/avatar.svg';
  const username = profileData.value?.username || chatTitle.value;
  const userId = profileData.value?.id || '';
  const bio = profileData.value?.bio || '';
  // 可根据实际业务调整 onlineStatus
  const onlineStatus = '4分钟前在线';
  router.push({
    path: '/user-profile',
    query: { avatar, username, userId, bio, onlineStatus }
  });
}
import { ref, onMounted, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/config'
import { useHomeStore } from '@/store/home'
import { storeToRefs } from 'pinia'
import { useErrorToast } from "@/utils/toast.js"

const homeStore = useHomeStore()
const { profileData } = storeToRefs(homeStore)

const route = useRoute()
const router = useRouter()
const chatContentRef = ref(null)
const messages = ref([])
const loading = ref(true)
const pageSize = 20
const inputText = ref('')
const showToolBar = ref(false)
const toolBarHeight = 300 // px

const chatType = computed(() => route.query.type)
const chatId = computed(() => route.query.id)
const chatTitle = computed(() => route.query.name || '聊天')
const { showToast, toastMsg, showErrorToast } = useErrorToast()

function isSelf(msg) {
  if (!profileData.value) return false
  return msg.senderId === profileData.value.id
}

async function fetchMessages(pageNum = 1) {
  loading.value = true
  const res = await api.get('/message/records', {
    params: {
      type: chatType.value,
      identity: chatId.value,
      pageNum,
      pageSize: pageSize
    }
  })
  let list = res.data?.list || []
  loading.value = false
  return list
}

watch(
  [chatType, chatId],
  async ([newType, newId]) => {
    if (newType && newId) {
      messages.value = []
      loading.value = true
      let pageNum = 1
      let totalList = []
      while (true) {
        const list = await fetchMessages(pageNum)
        if (!list.length) break
        totalList = totalList.concat(list)
        if (list.length < pageSize) break
        pageNum++
      }
      messages.value = totalList
      loading.value = false
      nextTick(() => {
        if (chatContentRef.value) {
          chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
        }
      })
    }
  },
  { immediate: true }
)

const emit = defineEmits(['refreshMessageList'])

function goBack() {
  const lastTab = sessionStorage.getItem('lastTab') || 'message'
  router.replace({ path: '/', query: { tab: lastTab } })
  emit('refreshMessageList')
}

function sendMsg() {
  if (!inputText.value.trim()) return
  let msg = {
    type: chatType.value,
    user: {
      id: profileData.value.id,
      username: profileData.value.username,
      avatar: profileData.value.avatar
    },
    receiverId: chatType.value === 'private' ? chatId.value : undefined,
    groupId: chatType.value === 'group' ? chatId.value : undefined,
    groupChat: { name: chatTitle.value },
    username: chatTitle.value,
    content: inputText.value,
    sendTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    id: 'local-' + Date.now()
  }

  if (window.$ws && window.$ws.readyState === 1) {
    window.$ws.send(JSON.stringify(msg))
    messages.value.push({
      id: msg.id,
      senderId: profileData.value.id,
      user: { ...profileData.value },
      content: msg.content,
      sendTime: msg.sendTime
    })
    homeStore.incrementUnreadByMsg(msg, true)
  } else {
    showErrorToast("消息通道未连接")
  }
  inputText.value = ''
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

function appendMessage(msg) {
  messages.value.push(msg)
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

function onResize() {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

onMounted(() => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
  window.addEventListener('resize', onResize)
  window.$chatPageRef = { appendMessage }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.$chatPageRef = null
})

defineExpose({
  appendMessage
})

function toggleToolBar() {
  showToolBar.value = !showToolBar.value
}
</script>

<style scoped>

.chat-page {
  position: relative;
  min-height: 100vh;
  background: #f3fcf6;
  overflow: hidden;
}
.chat-bg {
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  background: url('/images/chat-bg-green.png') repeat;
  opacity: 0.5;
  z-index: 0;
}
.chat-header {
  display: flex;
  align-items: center;
  padding: 10px 16px 6px 10px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  z-index: 2;
}
.chat-back {
  color: #27c16e;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 8px;
}
.chat-header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.chat-title {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  margin-bottom: 2px;
}
.chat-status {
  font-size: 15px;
  color: #27c16e;
  font-weight: 500;
}
.chat-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-left: 8px;
  object-fit: cover;
  border: 2px solid #eafaf1;
}
.chat-content {
  position: relative;
  z-index: 1;
  padding: 16px 0 0 0;
  min-height: 320px;
  max-height: 52vh;
  overflow-y: auto;
  transition: padding-bottom 0.2s;
}
.chat-bottom-area.expanded ~ .chat-content,
.chat-content.expanded {
  padding-bottom: 360px;
}
.chat-bottom-area:not(.expanded) ~ .chat-content,
.chat-content:not(.expanded) {
  padding-bottom: 60px;
}
.chat-date {
  text-align: center;
  color: #b2b2b2;
  font-size: 14px;
  margin-bottom: 8px;
}
.chat-divider {
  text-align: center;
  color: #b2b2b2;
  font-size: 13px;
  margin-bottom: 12px;
  background: #eafaf1;
  border-radius: 8px;
  padding: 2px 0;
}
.chat-msg {
  display: flex;
  align-items: flex-end;
  margin-bottom: 14px;
}
.chat-msg-left {
  flex-direction: row;
}
.chat-msg-right {
  flex-direction: row-reverse;
}
.msg-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 6px;
}
.msg-body {
  max-width: 70vw;
  background: #fff;
  border-radius: 18px;
  padding: 10px 16px 8px 16px;
  margin: 0 8px;
  box-shadow: 0 2px 12px rgba(39,193,110,0.08);
  position: relative;
}
.msg-body-self {
  background: #d6f5e6;
}
.msg-text {
  font-size: 17px;
  color: #222;
  margin-bottom: 6px;
  word-break: break-word;
}
.msg-time {
  font-size: 12px;
  color: #b2b2b2;
  text-align: right;
}
.chat-tip {
  text-align: center;
  color: #b2b2b2;
  font-size: 15px;
  margin: 18px 0 0 0;
}
/* 底部输入区和工具栏整体区域 */
.chat-bottom-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: transparent;
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
}
.chat-bottom-area .chat-input-bar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  z-index: 2;
}
.chat-bottom-area .chat-plus {
  background: none;
  border: none;
  font-size: 28px;
  color: #b2b2b2;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-bottom-area .chat-input {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 18px;
  background: #f6f6f6;
  padding: 0 14px;
  font-size: 16px;
  color: #222;
  margin-right: 8px;
}
.chat-bottom-area .chat-voice {
  background: none;
  border: none;
  font-size: 22px;
  color: #b2b2b2;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-bottom-area .chat-send-btn {
  background: #27c16e;
  color: #fff;
  border: none;
  border-radius: 18px;
  height: 38px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(39,193,110,0.08);
  min-width: 60px;
  white-space: nowrap;
}
.chat-tool-bar {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  padding: 0;
  border-top: 1px solid #e0e0e0;
  max-height: 300px;
  overflow: hidden;
  box-shadow: 0 -2px 12px rgba(39,193,110,0.08);
}
/* 工具栏推高动画 */
.tool-bar-push-enter-active, .tool-bar-push-leave-active {
  transition: max-height 0.2s ease-out, opacity 0.2s ease-out;
}
.tool-bar-push-enter-from, .tool-bar-push-leave-to {
  max-height: 0;
  opacity: 0;
}
.tool-bar-push-enter-to, .tool-bar-push-leave-from {
  max-height: 300px;
  opacity: 1;
}
.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25%;
  padding: 16px 0;
  font-size: 15px;
  color: #888;
}
.icon-img, .icon-camera, .icon-phone, .icon-video, .icon-user, .icon-group, .icon-file {
  display: block;
  width: 32px;
  height: 32px;
  background: #eaeaea;
  border-radius: 10px;
  margin-bottom: 6px;
}
.toast {
  margin-top: 12px;
  color: #e74c3c;
  text-align: center;
  font-size: 15px;
}
.tool-bar-slide-enter-active, .tool-bar-slide-leave-active {
  transition: max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s;
}
.tool-bar-slide-enter-from, .tool-bar-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.tool-bar-slide-enter-to, .tool-bar-slide-leave-from {
  max-height: 300px;
  opacity: 1;
}
/* loading 动画样式 */
.chat-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  color: #27c16e;
  font-size: 16px;
  font-weight: 500;
  background: none;
  gap: 16px;
}
</style>
