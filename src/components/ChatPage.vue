<template>
  <div class="chat-page">
    <div class="chat-header">
      <span class="chat-back" @click="goBack">←</span>
      <span class="chat-title">{{ chatTitle }}</span>
    </div>
    <div class="chat-content" ref="chatContentRef">
      <div v-if="loading" class="chat-loading">加载中...</div>
      <div v-else>
        <div v-for="msg in messages" :key="msg.id"
          :class="['chat-msg', isSelf(msg) ? 'chat-msg-right' : 'chat-msg-left']">
          <div class="msg-avatar">
            <img
              :src="isSelf(msg) ? (profileData?.avatar || './images/avatar.svg') : (msg.user?.avatar || './images/user.svg')"
              alt="头像" />
          </div>
          <div :class="['msg-body', isSelf(msg) ? 'msg-body-self' : '']">
            <div class="msg-username">{{ isSelf(msg) ? profileData.username : msg.user.username }}</div>
            <div class="msg-text">{{ msg.content }}</div>
            <div class="msg-time">{{ msg.sendTime }}</div>
          </div>
        </div>
        <div v-if="!messages.length" class="chat-empty">暂无聊天记录</div>
      </div>
    </div>
    <div class="chat-input-bar">
      <input v-model="inputText" class="chat-input" placeholder="输入消息..." @keyup.enter="sendMsg" />
      <button class="chat-send-btn" @click="sendMsg">发送</button>
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
const { profileData } = storeToRefs(homeStore)

const route = useRoute()
const router = useRouter()
const chatContentRef = ref(null)
const messages = ref([])
const loading = ref(true)
const pageSize = 20
const inputText = ref('')

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
</script>

<style scoped>
@import '@/assets/css/chat-page.css';
@import '@/assets/css/common.css';
</style>
