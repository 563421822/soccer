<template>
  <div class="chat-page">
    <div class="chat-header">
      <span class="chat-back" @click="goBack">&lt; 返回</span>
      <div class="chat-header-info">
        <span class="chat-title">{{ chatTitle }}</span>
        <span class="chat-status">当前在线</span>
      </div>
      <img :src="chatAvatar" class="chat-avatar" alt="头像" @click="goToUserProfile" />
    </div>
    <div class="chat-content" ref="chatContentRef"
      :style="{ height: showToolBar ? `calc(114vh - 72px - 300px)` : `calc(100vh - 72px - 58px)`, transition: 'height 0.2s' }">
      <div class="chat-bg"></div>
      <div v-if="loading" class="chat-loading">加载中...</div>
      <div v-else>
        <div class="chat-date">今天</div>
        <div class="chat-divider">- 以下是未读消息 -</div>
        <div v-for="msg in messages" :key="msg.id"
          :class="['chat-msg', isSelf(msg) ? 'chat-msg-right' : 'chat-msg-left']"
          @mousedown="onMsgMouseDown(msg, $event)" @mouseup="onMsgMouseUp(msg, $event)"
          @mouseleave="onMsgMouseUp(msg, $event)" @touchstart="onMsgTouchStart(msg, $event)"
          @touchend="onMsgTouchEnd(msg, $event)">
          <div class="msg-avatar">
            <img
              :src="isSelf(msg) ? (profileData?.avatar || '/images/avatar.svg') : (msg.user?.avatar || '/images/user.svg')"
              alt="头像" />
          </div>
          <div :class="['msg-body', isSelf(msg) ? 'msg-body-self' : '']" ref="msgBodyRefs" :data-msg-id="msg.id">
            <transition name="revoke-slide">
              <div v-if="showRevokeMenu && revokeMsg && revokeMsg.id === msg.id" class="revoke-popup">
                <div class="revoke-btn" @click="revokeMessage(msg)">撤回</div>
              </div>
            </transition>
            <div class="msg-text">
              <template v-if="msg.msgType === 'image'">
                <img :src="msg.content" alt="图片消息" />
              </template>
              <template v-else>
                {{ msg.content }}
              </template>
            </div>
            <div class="msg-time">{{ msg.sendTime }}</div>
          </div>
        </div>
        <div v-if="!messages.length" class="chat-empty">暂无聊天记录</div>
        <div class="chat-tip">您已添加了 {{ chatTitle }}，现在可以开始聊天了</div>
        <UploadingImage v-for="img in pendingImages" :key="img.id" :previewUrl="img.url" :finalUrl="img.finalUrl"
          :avatar="profileData?.avatar || '/images/avatar.svg'" :time="img.time" :progress="img.progress"
          :done="img.done" />
      </div>
    </div>
    <div class="chat-bottom-area" :class="{ expanded: showToolBar }">
      <transition name="tool-bar-push">
        <div v-if="showToolBar" class="chat-tool-bar">
          <div class="tool-item" @click="onSelectImage"><span class="icon-img"></span>相册</div>
          <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onImageChange" />
          <div class="tool-item" @click="onTakePhoto"><span class="icon-camera"></span>拍摄</div>
          <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" style="display:none"
            @change="onCameraChange" />
        </div>
      </transition>
      <div class="chat-input-bar">
        <button class="chat-plus" @click="toggleToolBar">
          <span v-if="!showToolBar">＋</span>
          <span v-else style="display:inline-block;transform:rotate(45deg);font-size:28px;">＋</span>
        </button>
        <input v-model="inputText" class="chat-input" placeholder="输入消息..." @keyup.enter="sendMsg" />
        <button class="chat-send-btn" @click="sendMsg">发送</button>
      </div>
    </div>
    <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    <!-- 在消息区下方展示拍摄图片预览 -->
    <div v-if="cameraPreviewUrl" class="chat-msg chat-msg-right">
      <div class="msg-avatar">
        <img :src="profileData?.avatar || '/images/avatar.svg'" alt="头像" />
      </div>
      <div class="msg-body msg-body-self">
        <div class="msg-text">
          <img :src="cameraPreviewUrl" alt="拍摄图片" />
          <div style="font-size:12px;color:#aaa;">[拍摄图片预览]</div>
        </div>
        <div class="msg-time">{{ cameraPreviewTime }}</div>
      </div>
    </div>
    <div v-if="showUploadOverlay" class="upload-overlay">
      <div class="upload-progress">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
        <div class="progress-text">{{ uploadProgress }}%</div>
      </div>
    </div>
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
import UploadingImage from '@/components/UploadingImage.vue'

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
const fileInputRef = ref(null)
const cameraInputRef = ref(null)
const cameraPreviewUrl = ref('')
const cameraPreviewTime = ref('')

const chatType = computed(() => route.query.type)
const chatId = computed(() => route.query.id)
const chatTitle = computed(() => route.query.name || '聊天')
const { showToast, toastMsg, showErrorToast } = useErrorToast()
const showUploadOverlay = ref(false)
const uploadProgress = ref(0)
const pendingImages = ref([])

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

function onSelectImage() {
  if (fileInputRef.value) {
    fileInputRef.value.value = '' // 清空上次选择
    fileInputRef.value.click()
  }
}

function onTakePhoto() {
  if (cameraInputRef.value) {
    cameraInputRef.value.value = ''
    cameraInputRef.value.click()
  }
}

async function onImageChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showErrorToast('请选择图片文件')
    return
  }

  const localUrl = URL.createObjectURL(file)
  const tempId = 'pending-' + Date.now()
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16)

  pendingImages.value.push({
    id: tempId,
    url: localUrl,
    progress: 0,
    time: now,
    done: false,
    finalUrl: ''
  })


  // 模拟进度
  let progress = 0
  const timer = setInterval(() => {
    if (progress < 95) {
      progress += Math.floor(Math.random() * 5) + 1
      const item = pendingImages.value.find(p => p.id === tempId)
      if (item) item.progress = Math.min(progress, 95)
    }
  }, 100)

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
    showErrorToast('图片上传失败')
    clearInterval(timer)
    pendingImages.value = pendingImages.value.filter(p => p.id !== tempId)
    return
  }

  clearInterval(timer)
  const item = pendingImages.value.find(p => p.id === tempId)
  if (item) {
    item.progress = 100
    item.done = true
    item.finalUrl = imageUrl
  }

  // ✅ 保留展示动画 500ms 再移除（可以调整时间）
  setTimeout(() => {
    pendingImages.value = pendingImages.value.filter(p => p.id !== tempId)
  }, 500)

  // 发送图片消息
  sendImageMsg(imageUrl)
}


function sendImageMsg(imageUrl) {
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
    content: imageUrl,
    sendTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    id: 'local-img-' + Date.now(),
    msgType: 'image'
  }
  if (window.$ws && window.$ws.readyState === 1) {
    window.$ws.send(JSON.stringify(msg))
    messages.value.push({
      id: msg.id,
      senderId: profileData.value.id,
      user: { ...profileData.value },
      content: msg.content,
      sendTime: msg.sendTime,
      msgType: 'image'
    })
    homeStore.incrementUnreadByMsg(msg, true)
  } else {
    showErrorToast("消息通道未连接")
  }
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

const showRevokeMenu = ref(false)
const revokeMsg = ref(null)
let msgPressTimer = null

function onMsgMouseDown(msg, e) {
  if (!isSelf(msg)) return
  msgPressTimer = setTimeout(() => {
    showRevokePopup(msg)
  }, 500)
}
function onMsgMouseUp(msg, e) {
  clearTimeout(msgPressTimer)
}
function onMsgTouchStart(msg, e) {
  if (!isSelf(msg)) return
  msgPressTimer = setTimeout(() => {
    showRevokePopup(msg)
  }, 500)
}
function onMsgTouchEnd(msg, e) {
  clearTimeout(msgPressTimer)
}
function showRevokePopup(msg) {
  revokeMsg.value = msg
  showRevokeMenu.value = true
  document.addEventListener('click', hideRevokeMenu, { once: true })
}
function hideRevokeMenu() {
  showRevokeMenu.value = false
  revokeMsg.value = null
}
function revokeMessage(msg) {
  const idx = messages.value.findIndex(m => m.id === msg.id)
  if (idx !== -1) messages.value.splice(idx, 1)
  hideRevokeMenu()
}

function onCameraChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showErrorToast('请选择图片文件')
    return
  }
  cameraPreviewUrl.value = URL.createObjectURL(file)
  cameraPreviewTime.value = new Date().toISOString().replace('T', ' ').substring(0, 16)
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
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: url('/images/chat-bg-green.png') repeat;
  opacity: 0.5;
  z-index: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 42px 16px 12px;
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
  overflow-y: auto;
  transition: max-height 0.2s;
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
  box-shadow: 0 2px 12px rgba(39, 193, 110, 0.08);
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

.msg-text img {
  max-width: 180px;
  max-height: 180px;
  border-radius: 10px;
  display: block;
  margin: 4px 0;
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

.chat-empty {
  text-align: center;
  color: #b2b2b2;
  font-size: 15px;
  margin: 18px 0 0 0;
}

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

.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  z-index: 2;
}

.chat-plus {
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

.chat-input {
  flex: 1;
  height: 38px;
  border: none;
  margin-right: 8px;
  border-radius: 18px;
  background: #f6f6f6;
  padding: 0 14px;
  font-size: 16px;
  color: #222;
}

.chat-send-btn {
  background: #27c16e;
  color: #fff;
  border: none;
  border-radius: 18px;
  height: 38px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(39, 193, 110, 0.08);
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
  box-shadow: 0 -2px 12px rgba(39, 193, 110, 0.08);
  transition: max-height 0.2s;
}

.tool-bar-push-enter-active,
.tool-bar-push-leave-active {
  transition: max-height 0.2s ease-out, opacity 0.2s ease-out;
}

.tool-bar-push-enter-from,
.tool-bar-push-leave-to {
  max-height: 0;
  opacity: 0;
}

.tool-bar-push-enter-to,
.tool-bar-push-leave-from {
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

.icon-img,
.icon-camera,
.icon-phone,
.icon-video,
.icon-user,
.icon-group,
.icon-file {
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

.revoke-popup {
  position: absolute;
  left: 50%;
  top: -44px;
  transform: translateX(-50%);
  z-index: 1000;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(39, 193, 110, 0.18);
  padding: 0;
  min-width: 70px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  /* 动画由transition控制 */
}

.revoke-btn {
  color: #e74c3c;
  font-size: 15px;
  padding: 8px 18px;
  cursor: pointer;
  user-select: none;
  text-align: center;
}

.revoke-btn:active {
  background: #f5f5f5;
}

/* 撤回弹窗从右到左动画 */
.revoke-slide-enter-active,
.revoke-slide-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}

.revoke-slide-enter-from {
  opacity: 0;
  transform: translateX(60%) scale(0.95);
}

.revoke-slide-enter-to {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.revoke-slide-leave-from {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.revoke-slide-leave-to {
  opacity: 0;
  transform: translateX(60%) scale(0.95);
}

.sending-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #27c16e;
  font-weight: bold;
  border-radius: 10px;
}
</style>
