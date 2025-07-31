<template>
  <div class="chat-page">
    <!-- 头部导航 -->
    <div class="header-nav">
      <div class="nav-left" @click="goBack">
        <span class="back-arrow">←</span>
        <span class="back-text">返回</span>
      </div>
      <div class="nav-center">
        <div class="nav-title">{{ chatTitle }}</div>
        <div class="nav-status">当前在线</div>
      </div>
      <div class="nav-right">
        <div class="profile-avatar">
          <img :src="chatAvatar" alt="头像" class="avatar-content" @click="goToUserProfile" />
        </div>
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content">
      <!-- 太空主题背景装饰 -->
      <div class="space-background">
        <div class="space-pattern"></div>
      </div>

      <!-- 消息内容 -->
      <div class="messages-container" ref="chatContentRef">
        <div v-if="loading" class="chat-loading">加载中...</div>
        <template v-else>
          <div class="chat-tip">您已添加了 {{ chatTitle }}，现在可以开始聊天了</div>
          <div class="chat-divider">- 以下是以往消息 -</div>
          <div v-for="msg in messages" :key="msg.id">
            <div class="msg-time" :style="{ 'text-align': isSelf(msg) ? 'right' : 'left' }">{{ msg.sendTime.slice(11, 16) }}</div>
            <div :class="['chat-msg', isSelf(msg) ? 'chat-msg-right' : 'chat-msg-left']">
              <div :class="['msg-bubble', isSelf(msg) ? 'msg-bubble-self' : 'msg-bubble-other']">
                <template v-if="msg.msgType === 'image'">
                  <img :src="msg.content" alt="" class="msg-img" @load="onImageLoad" />
                </template>
                <template v-else>
                  <span class="msg-text">{{ msg.content }}</span>
                </template>
              </div>
            </div>
          </div>
          <div v-if="!messages.length" class="chat-empty">暂无聊天记录</div>
        </template>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 工具栏 -->
      <div v-if="showToolBar" class="tool-bar">
        <div class="tool-item" @click="onSelectImage">
          <div class="tool-icon">📷</div>
          <div class="tool-label">相册</div>
        </div>
        <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onImageChange" />
        <div class="tool-item" @click="onTakePhoto">
          <div class="tool-icon">📸</div>
          <div class="tool-label">拍摄</div>
        </div>
        <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" style="display:none"
          @change="onImageChange" />
      </div>

      <div class="input-bar">
        <button class="input-plus" :class="{ active: showToolBar }" @click="toggleToolBar">+</button>
        <input class="input-field" v-model="inputText" placeholder="输入消息" @keydown="handleKeydown" />
        <!-- <button class="input-keyboard" :class="{ active: showEmoji }" @click="toggleEmoji">⌨</button> -->
        <button class="input-voice" @click="sendMsg">发送</button>
      </div>

      <!-- 表情分类栏 -->
      <div v-if="showEmoji" class="emoji-categories">
        <div class="category-item active">
          <span class="category-icon">🕐</span>
        </div>
        <div class="category-item">
          <span class="category-icon">😊</span>
        </div>
        <div class="category-item">
          <span class="category-icon">🐱</span>
        </div>
        <div class="category-item">
          <span class="category-icon">🍔</span>
        </div>
        <div class="category-item">
          <span class="category-icon">⚽</span>
        </div>
        <div class="category-item">
          <span class="category-icon">🚗</span>
        </div>
        <div class="category-item">
          <span class="category-icon">💡</span>
        </div>
        <div class="category-item">
          <span class="category-icon">x=</span>
        </div>
        <div class="category-item">
          <span class="category-icon">🏁</span>
        </div>
      </div>

      <!-- 表情键盘 -->
      <div v-if="showEmoji" class="emoji-keyboard">
        <div class="emoji-title">笑脸&人物</div>
        <div class="emoji-grid">
          <span class="emoji-item" @click="insertEmoji('😀')">😀</span>
          <span class="emoji-item" @click="insertEmoji('😃')">😃</span>
          <span class="emoji-item" @click="insertEmoji('😄')">😄</span>
          <span class="emoji-item" @click="insertEmoji('😁')">😁</span>
          <span class="emoji-item" @click="insertEmoji('😆')">😆</span>
          <span class="emoji-item" @click="insertEmoji('😅')">😅</span>
          <span class="emoji-item" @click="insertEmoji('😂')">😂</span>
          <span class="emoji-item" @click="insertEmoji('🤣')">🤣</span>
          <span class="emoji-item" @click="insertEmoji('😊')">😊</span>
          <span class="emoji-item" @click="insertEmoji('😇')">😇</span>
          <span class="emoji-item" @click="insertEmoji('🙂')">🙂</span>
          <span class="emoji-item" @click="insertEmoji('🙃')">🙃</span>
          <span class="emoji-item" @click="insertEmoji('😉')">😉</span>
          <span class="emoji-item" @click="insertEmoji('😌')">😌</span>
          <span class="emoji-item" @click="insertEmoji('😍')">😍</span>
          <span class="emoji-item" @click="insertEmoji('🥰')">🥰</span>
          <span class="emoji-item" @click="insertEmoji('😘')">😘</span>
          <span class="emoji-item" @click="insertEmoji('😗')">😗</span>
          <span class="emoji-item" @click="insertEmoji('😙')">😙</span>
          <span class="emoji-item" @click="insertEmoji('😚')">😚</span>
          <span class="emoji-item" @click="insertEmoji('😋')">😋</span>
          <span class="emoji-item" @click="insertEmoji('😛')">😛</span>
          <span class="emoji-item" @click="insertEmoji('😝')">😝</span>
        </div>
        <button class="emoji-close" @click="toggleEmoji">✕</button>
      </div>
    </div>

    <div v-if="showToast" class="toast">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/config'
import { useHomeStore } from '@/store/home'
import { storeToRefs } from 'pinia'
import { useErrorToast } from "@/utils/toast.js"

const homeStore = useHomeStore()
const { profileData, contacts } = storeToRefs(homeStore)

const route = useRoute()
const router = useRouter()
const chatContentRef = ref(null)
const messages = ref([])
const loading = ref(true)
const pageSize = 20
const inputText = ref('')
const showToolBar = ref(false)
const showEmoji = ref(false)
const fileInputRef = ref(null)
const cameraInputRef = ref(null)

const chatType = computed(() => route.query.type)
const chatId = computed(() => route.query.id)
const chatTitle = computed(() => route.query.name || '聊天')
const { showToast, toastMsg, showErrorToast } = useErrorToast()

const chatAvatar = computed(() => {
  if (chatType.value === 'private') {
    const item = contacts.value.find(
      m => String(m.id) === String(chatId.value)
    )
    return parseInt(chatId.value) === 1 ? 'https://th.bing.com/th/id/OIP.dwEgyh_FlgXObvZP-iurSQHaHa?rs=1&pid=ImgDetMain' : item?.avatar || '/images/user.svg'
  }
  return '/images/avatar.svg'
})

function isSelf(msg) {
  return profileData.value && msg.senderId === profileData.value.id
}

function handleKeydown(e) {
  if (e.key === 'Enter' && e.shiftKey) {
    // 阻止浏览器默认插入换行
    e.preventDefault()

    // 手动在光标处插入一个换行符
    const el = e.target
    const start = el.selectionStart
    const end = el.selectionEnd
    const value = inputText.value
    inputText.value = value.slice(0, start) + '\n' + value.slice(end)

    // 恢复光标位置
    nextTick(() => {
      el.selectionStart = el.selectionEnd = start + 1
    })
  } else if (e.key === 'Enter') {
    // Enter 单独按，发送消息
    e.preventDefault()
    sendMsg()
  }
}

// 优化：批量拉取消息，滚动只在最后一次触发
async function fetchMessages(pageNum = 1) {
  loading.value = true
  const res = await api.get('/message/records', {
    params: {
      type: chatType.value,
      identity: chatId.value,
      pageNum,
      pageSize
    }
  })
  loading.value = false
  return res.data?.list || []
}

// 优化：watch 只在 chatType/chatId 变化时拉取消息
watch([chatType, chatId], async ([newType, newId]) => {
  if (newType && newId) {
    // 强制清空消息缓存
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
    scrollToBottom()
  }
}, { immediate: true })


const emit = defineEmits(['refreshMessageList'])

function goBack() {
  const lastTab = sessionStorage.getItem('lastTab') || 'message'
  router.replace({ path: '/', query: { tab: lastTab } })
  emit('refreshMessageList')
}

// 优化：滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (chatContentRef.value) {
      // 使用平滑滚动效果
      chatContentRef.value.scrollTo({
        top: chatContentRef.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

function sendMsg() {
  if (!inputText.value.trim()) return
  const msg = {
    type: chatType.value,
    user: {
      id: profileData.value.id,
      username: profileData.value.username,
      avatar: profileData.value.avatar
    },
    ...(chatType.value === 'private' ? { receiverId: chatId.value } : {}),
    ...(chatType.value === 'group' ? { groupId: chatId.value, groupChat: { name: chatTitle.value, groupId: chatId.value } } : {}),
    content: inputText.value,
    sendTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    msgType: 'text',
    id: 'local-' + Date.now()
  }
  if (window.$ws && window.$ws.readyState === 1) {
    window.$ws.send(JSON.stringify(msg))
    messages.value.push({
      id: msg.id,
      senderId: profileData.value.id,
      content: msg.content,
      sendTime: msg.sendTime
    })
    msg.user.id = chatId.value
    msg.user.username = chatTitle.value
    msg.user.avatar = chatAvatar.value
    console.log('发送消息:', msg)
    homeStore.incrementUnreadByMsg(msg, true)
  } else {
    showErrorToast("消息通道未连接")
  }
  inputText.value = ''
  scrollToBottom()
}

function appendMessage(msg) {
  messages.value.push(msg)
  scrollToBottom()
}

function onResize() {
  scrollToBottom()
}

onMounted(() => {
  scrollToBottom()
  window.addEventListener('resize', onResize)
  window.$chatPageRef = { appendMessage }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.$chatPageRef = null
})

defineExpose({ appendMessage })

function toggleToolBar() {
  showToolBar.value = !showToolBar.value
  if (showToolBar.value) {
    showEmoji.value = false // 关闭表情键盘
  }
}

function toggleEmoji() {
  showEmoji.value = !showEmoji.value
  if (showEmoji.value) {
    showToolBar.value = false // 关闭工具栏
  }
}

function insertEmoji(emoji) {
  const el = document.querySelector('.input-field')
  if (el) {
    const start = el.selectionStart
    const end = el.selectionEnd
    inputText.value = inputText.value.slice(0, start) + emoji + inputText.value.slice(end)
    nextTick(() => {
      el.selectionStart = el.selectionEnd = start + emoji.length
    })
  }
}

function onSelectImage() {
  fileInputRef.value && (fileInputRef.value.value = '', fileInputRef.value.click())
}

function onTakePhoto() {
  cameraInputRef.value && (cameraInputRef.value.value = '', cameraInputRef.value.click())
}

// 优化：图片上传逻辑抽取
async function onImageChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const localUrl = URL.createObjectURL(file)
  const tempId = 'pending-' + Date.now()
  const msg = {
    type: chatType.value,
    user: {
      id: profileData.value.id,
      username: profileData.value.username,
      avatar: profileData.value.avatar
    },
    ...(chatType.value === 'private' ? { receiverId: chatId.value } : {}),
    ...(chatType.value === 'group' ? { groupId: chatId.value, groupChat: { name: chatTitle.value, groupId: chatId.value } } : {}),
    content: localUrl,
    msgType: 'image',
    senderId: profileData.value.id,
    sendTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    id: tempId
  }
  messages.value.push(msg)
  // 立即滚动到底部，显示本地图片
  scrollToBottom()

  const formData = new FormData()
  formData.append('file', file)
  let imageUrl = ''
  try {
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    imageUrl = res.data?.url
    if (!imageUrl) throw new Error('上传失败')
  } catch (err) {
    showErrorToast(err.message || '图片上传失败')
    return
  }
  msg.content = imageUrl
  if (window.$ws && window.$ws.readyState === 1) {
    window.$ws.send(JSON.stringify(msg))
    homeStore.incrementUnreadByMsg(msg, true)
  } else {
    showErrorToast("消息通道未连接")
  }
}

function onImageLoad() {
  // 图片加载完成后延迟滚动，确保图片完全渲染
  setTimeout(() => {
    scrollToBottom()
  }, 100)
}

function goToUserProfile() {
  let targetUser = null
  if (chatType.value === 'private') {
    const item = contacts.value.find(
      m => String(m.id) === String(chatId.value)
    )
    targetUser = item
  }
  const avatar = parseInt(chatId.value) === 1 ? 'https://th.bing.com/th/id/OIP.dwEgyh_FlgXObvZP-iurSQHaHa?rs=1&pid=ImgDetMain' : targetUser?.avatar
  const username = targetUser?.username || chatTitle.value
  const userId = parseInt(chatId.value) === 1 ? 'ailiaoqiu' : targetUser?.usrSn || ''
  const bio = targetUser?.bio || ''
  const onlineStatus = '当前在线'
  router.push({
    path: '/user-profile',
    query: { avatar, username, userId, bio, onlineStatus }
  })
}
</script>

<style scoped>
.chat-page {
  background: #f0f8f0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部导航 */
.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  height: 60px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #267efb;
  font-size: 16px;
  cursor: pointer;
}

.back-arrow {
  font-size: 18px;
  font-weight: bold;
}

.back-text {
  font-size: 16px;
}

.nav-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  line-height: 1.2;
}

.nav-status {
  font-size: 14px;
  color: #27c16e;
  margin-top: 2px;
}

.nav-right {
  display: flex;
  align-items: center;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-content {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  position: relative;
}

.avatar-content::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
}

.avatar-content::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-radius: 50%;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.space-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f0f8f0;
  z-index: 1;
}

.space-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    /* 星星 */
    radial-gradient(circle at 20% 30%, #d0e8d0 2px, transparent 2px),
    radial-gradient(circle at 80% 20%, #d0e8d0 1px, transparent 1px),
    radial-gradient(circle at 40% 70%, #d0e8d0 1px, transparent 1px),
    radial-gradient(circle at 90% 80%, #d0e8d0 1px, transparent 1px),
    radial-gradient(circle at 10% 90%, #d0e8d0 1px, transparent 1px),
    radial-gradient(circle at 70% 10%, #d0e8d0 1px, transparent 1px),
    /* 行星 */
    radial-gradient(circle at 60% 40%, #c0e0c0 3px, transparent 3px),
    radial-gradient(circle at 30% 60%, #c0e0c0 2px, transparent 2px),
    /* 火箭 */
    linear-gradient(45deg, transparent 40%, #d0e8d0 40%, #d0e8d0 60%, transparent 60%),
    /* 宇航员头盔 */
    radial-gradient(circle at 85% 15%, #d0e8d0 4px, transparent 4px),
    /* 卫星 */
    radial-gradient(circle at 15% 25%, #d0e8d0 2px, transparent 2px),
    /* 望远镜 */
    radial-gradient(circle at 75% 85%, #d0e8d0 3px, transparent 3px),
    /* 太阳 */
    radial-gradient(circle at 50% 50%, #f0f8f0 8px, transparent 8px),
    /* 猫咪宇航员 */
    radial-gradient(circle at 25% 75%, #d0e8d0 5px, transparent 5px),
    /* 机器人 */
    radial-gradient(circle at 80% 45%, #d0e8d0 4px, transparent 4px),
    /* 外星人 */
    radial-gradient(circle at 45% 85%, #d0e8d0 3px, transparent 3px),
    /* 纸飞机 */
    radial-gradient(circle at 95% 35%, #d0e8d0 2px, transparent 2px),
    /* 彗星 */
    radial-gradient(circle at 5% 15%, #d0e8d0 2px, transparent 2px),
    /* 数字和符号 */
    radial-gradient(circle at 35% 25%, #d0e8d0 1px, transparent 1px),
    radial-gradient(circle at 65% 75%, #d0e8d0 1px, transparent 1px),
    radial-gradient(circle at 55% 95%, #d0e8d0 1px, transparent 1px);
  background-size:
    60px 60px, 80px 80px, 100px 100px, 70px 70px, 90px 90px, 50px 50px,
    120px 120px, 150px 150px,
    200px 200px,
    80px 80px,
    60px 60px,
    100px 100px,
    160px 160px,
    100px 100px,
    80px 80px,
    60px 60px,
    40px 40px,
    50px 50px,
    30px 30px, 30px 30px, 30px 30px;
  opacity: 0.4;
}

.messages-container {
  position: relative;
  z-index: 2;
  height: 100%;
  overflow-y: auto;
  padding: 20px 16px;
}

.chat-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.chat-divider {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin: 20px 0;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.chat-msg {
  margin-bottom: 12px;
  display: flex;
}

.chat-msg-left {
  justify-content: flex-start;
}

.chat-msg-right {
  justify-content: flex-end;
}

.msg-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 14px;
  position: relative;
  word-wrap: break-word;
}

.msg-bubble-other {
  background: #fff;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 0;
}

.msg-bubble-self {
  background: #27c16e;
  color: #fff;
  border-top-right-radius: 0;
}

.msg-text {
  font-size: 16px;
  line-height: 1.4;
}

.msg-time {
  font-size: 12px;
  color: #999;
}

.msg-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  display: block;
}

.chat-empty {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 40px;
}

.chat-loading {
  text-align: center;
  color: #27c16e;
  font-size: 16px;
  margin-top: 40px;
}

/* 输入区域 */
.input-area {
  background: #fff;
  border-top: 1px solid #e0e0e0;
}

/* 工具栏 */
.tool-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 32px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 8px;
  border-radius: 8px;
}

.tool-item:hover {
  transform: scale(1.05);
  background: #f5f5f5;
}

.tool-item:active {
  transform: scale(0.95);
}

.tool-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.tool-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.input-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
}

.input-plus {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.input-plus:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.input-plus:active {
  transform: scale(0.95);
}

/* 激活状态 */
.input-plus.active {
  background: #27c16e;
  color: #fff;
  transform: rotate(90deg);
}

.input-field {
  flex: 1;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 18px;
  padding: 0 16px;
  font-size: 16px;
  color: #333;
  outline: none;
}

.input-field::placeholder {
  color: #999;
  font-size: 16px;
}

.input-keyboard {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.input-keyboard:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.input-keyboard:active {
  transform: scale(0.95);
}

/* 激活状态 */
.input-keyboard.active {
  background: #27c16e;
  color: #fff;
}

.input-voice {
  padding: 6px 14px;
  font-size: 14px;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 20px;
  cursor: pointer;
}

/* 表情分类栏 */
.emoji-categories {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-item.active {
  background: #e0f0e0;
}

.category-icon {
  font-size: 18px;
}

/* 表情键盘 */
.emoji-keyboard {
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  position: relative;
  min-height: 200px;
}

.emoji-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 500;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  user-select: none;
}

.emoji-item:hover {
  background: #f0f0f0;
}

.emoji-item:active {
  background: #e0e0e0;
}

.emoji-close {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.emoji-close:hover {
  background: #e0e0e0;
}

/* Toast */
.toast {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 9999;
  pointer-events: none;
}
</style>
