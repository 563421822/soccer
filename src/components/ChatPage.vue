<template>
  <div class="chat-page">
    <div class="fixed-header">
      <span class="header-left" @click="goBack" aria-label="返回">&lt;&nbsp;返回</span>
      <div class="header-center">
        <div class="header-title">{{ chatTitle }}</div>
        <div class="header-status">{{ chatType === 'group' ? '群聊' : '当前在线' }}</div>
      </div>
      <span class="header-right">
        <img v-if="chatType === 'private'" :src="chatAvatar" class="chat-avatar" alt="用户头像" @click="goToUserProfile" />
      </span>
    </div>
    <!-- 消息内容区 -->
    <div class="chat-content" ref="chatContentRef"
      :style="{ height: showToolBar ? 'calc(100vh - 259px)' : 'calc(100vh - 164px)' }">
      <div v-if="loading" class="chat-loading">加载中...</div>
      <template v-else>
        <div class="chat-tip">您已添加了 {{ chatTitle }}，现在可以开始聊天了</div>
        <div class="chat-divider">- 以下是以往消息 -</div>
        <div v-for="msg in messages" :key="msg.id"
          :class="['chat-msg', isSelf(msg) ? 'chat-msg-right' : 'chat-msg-left']">
          <div :class="['msg-bubble', isSelf(msg) ? 'msg-bubble-self' : 'msg-bubble-other']">
            <template v-if="msg.msgType === 'image'">
              <img :src="msg.content" alt="图片消息" class="msg-img" @load="scrollToBottom"/>
            </template>
            <template v-else>
              <span class="msg-text">{{ msg.content }}</span>
            </template>
            <div class="msg-time">{{ msg.sendTime }}</div>
          </div>
        </div>
        <div v-if="!messages.length" class="chat-empty">暂无聊天记录</div>
      </template>
    </div>
    <!-- 输入区（建议拆分为 ChatInputBar 组件） -->
    <div class="chat-bottom-area" :class="{ expanded: showToolBar }">
      <transition name="tool-bar-push">
        <div v-if="showToolBar" class="chat-tool-bar">
          <div class="tool-item" @click="onSelectImage"><span class="icon-album"></span>相册</div>
          <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onImageChange" />
          <div class="tool-item" @click="onTakePhoto"><span class="icon-camera"></span>拍摄</div>
          <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" style="display:none"
            @change="onImageChange" />
        </div>
      </transition>
      <div class="chat-input-bar">
        <button class="chat-plus" @click="toggleToolBar" aria-label="更多功能">
          <span
            :style="{ transform: showToolBar ? 'rotate(45deg)' : 'none', fontSize: showToolBar ? '28px' : 'inherit' }">＋</span>
        </button>
        <input v-model="inputText" class="chat-input" placeholder="输入消息..." @keyup.enter="sendMsg" aria-label="输入消息" />
        <button class="chat-send-btn" @click="sendMsg" aria-label="发送消息">发送</button>
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
    return item?.avatar || '/images/user.svg'
  }
  return '/images/avatar.svg'
})

function isSelf(msg) {
  return profileData.value && msg.senderId === profileData.value.id
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
    chatContentRef.value && (chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight)
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
    ...(chatType.value === 'group' ? { groupChat: { name: chatTitle.value, groupId: chatId.value } } : {}),
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
    ...(chatType.value === 'group' ? { groupChat: { name: chatTitle.value, groupId: chatId.value } } : {}),
    content: localUrl,
    msgType: 'image',
    senderId: profileData.value.id,
    sendTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    id: tempId
  }
  messages.value.push(msg)
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
  if (window.$ws && window.$ws.readyState === 1) {
    window.$ws.send(JSON.stringify(msg))
    homeStore.incrementUnreadByMsg(msg, true)
  } else {
    showErrorToast("消息通道未连接")
  }
}

function goToUserProfile() {
  let targetUser = null
  if (chatType.value === 'private') {
    const item = contacts.value.find(
      m => String(m.id) === String(chatId.value)
    )
    targetUser = item
  }
  const avatar = targetUser?.avatar
  const username = targetUser?.username || chatTitle.value
  const userId = targetUser?.usrSn || ''
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
  min-height: 100vh;
  background: #f3fcf6;
  overflow: hidden;
  width: 100vw;
}

.chat-back {
  color: #27c16e;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 8px;
  z-index: 2;
}

.chat-header-info {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
  height: 100%;
}

.chat-title,
.chat-status {
  pointer-events: auto;
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
  margin-top: 2px;
  font-weight: 400;
}

.chat-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-left: auto;
  object-fit: cover;
  border: 2px solid #eafaf1;
  z-index: 2;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 42px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 102px;
}

.header-left {
  flex: 1;
  color: #27c16e;
  font-size: 16px;
  text-align: left;
  padding-left: 15px;
  cursor: pointer;
  font-weight: 400;
}

.header-center {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  line-height: 1.2;
}

.header-status {
  font-size: 15px;
  color: #27c16e;
  margin-top: 2px;
  font-weight: 400;
}

.header-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 15px;
  min-width: 38px;
  height: 38px;
}

.chat-content {
  position: absolute;
  top: 102px;
  left: 0;
  right: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 0;
  overflow-y: auto;
  flex-direction: column;
  align-items: stretch;
  display: flex;
}

.chat-msg {
  display: flex;
  width: 100%;
  box-sizing: border-box;
}

.chat-msg-left,
.chat-msg-right {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
}

.chat-msg-left {
  align-items: flex-end;
}

.chat-msg-left .msg-avatar,
.chat-msg-right .msg-avatar {
  margin-right: 10px;
}

.chat-msg-right {
  flex-direction: row-reverse;
  align-items: flex-end;
}

.msg-avatar {
  border-radius: 50%;
  width: 30px;
  height: 30px;
  object-fit: cover;
  border: 2px solid #d1e7e4;
}

.msg-bubble {
  max-width: calc(100vw - 48px);
  min-width: 44px;
  padding: 0 18px;
  box-shadow: 0 4px 12px rgba(39, 193, 110, 0.15);
  /* 增加阴影 */
  position: relative;
  font-size: 17px;
  margin: 4px 4px;
  word-break: break-word;
  flex-shrink: 1;
  box-sizing: border-box;
  overflow-wrap: break-word;
  border-radius: 20px;
  /* 增大圆角 */
  line-height: 1.6;
  background-color: #fff;
  color: #333;
  display: inline-block;
}

.msg-bubble-other {
  background: #ffffff;
  border-radius: 20px;
  /* 更大的圆角 */
  border: 1px solid #eaeaea;
}

.msg-bubble-self {
  background: #d6f5e6;
  border-radius: 20px;
  /* 更大的圆角 */
  border: 1px solid #b2f2d6;
}

.msg-bubble-other:after {
  content: '';
  position: absolute;
  left: -12px;
  /* 调整气泡尾巴位置 */
  top: 16px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 12px solid #ffffff;
  /* 提升气泡尾巴的可视效果 */
}

.msg-bubble-self:after {
  content: '';
  position: absolute;
  right: -12px;
  /* 调整气泡尾巴位置 */
  top: 16px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid #d6f5e6;
  /* 提升气泡尾巴的可视效果 */
}

.msg-img {
  max-width: 150px;
  max-height: 180px;
  border-radius: 14px;
  display: block;
  margin: 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.msg-text {
  color: #222;
  display: block;
  line-height: 1.7;
  word-wrap: break-word;
}

.msg-time {
  font-size: 12px;
  color: #b2b2b2;
  text-align: right;
}

.chat-tip {
  color: #b2b2b2;
  font-size: 15px;
  margin-top: 18px;
  padding: 5px;
  text-align: center;
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
  font-size: 16px;
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

.icon-camera {
  display: block;
  width: 32px;
  height: 32px;
  background: url('/images/icon-camera.svg') no-repeat center/18px 18px;
  border-radius: 10px;
  margin-bottom: 6px;
}

.icon-album {
  display: block;
  width: 32px;
  height: 32px;
  background: url('/images/icon-album.svg') no-repeat center/18px 18px;
  border-radius: 10px;
  margin-bottom: 6px;
}

.toast {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    min-width: 120px;
    max-width: 80vw;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    border-radius: 10px;
    padding: 14px 24px;
    text-align: center;
    font-size: 16px;
    z-index: 9999;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    pointer-events: none;
    animation: toast-fade-in 0.2s;
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
</style>
