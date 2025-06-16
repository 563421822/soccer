<template>
  <div class="chat-list" ref="chatListRef">
    <div v-for="item in chatList" :key="'group-' + item.id" class="chat-item"
         @click="openChat('group', item.groupId, item.groupChat.name)">
      <div class="avatar-wrapper">
        <div class="avatar">{{ item.groupChat.name.charAt(0) }}</div>
        <span v-if="item.unreadCount > 0" class="item-badge">{{ item.unreadCount }}</span>
      </div>
      <div class="chat-info">
        <div class="chat-name">{{ item.groupChat.name }}</div>
        <div class="chat-preview">{{ item.content }}</div>
      </div>
      <div class="chat-time">{{ item.sendTime }}</div>
    </div>
    <div v-for="item in privateList" :key="'private-' + item.id" class="private-item"
         @click="openChat('private', item.user.id, item.user.username)">
      <div class="avatar-wrapper">
        <div class="private-avatar">{{ item.user.username.charAt(0) }}</div>
        <span v-if="item.unreadCount > 0" class="item-badge">{{ item.unreadCount }}</span>
      </div>
      <div class="private-info">
        <div class="private-name">{{ item.user.username }}</div>
        <div class="private-preview">{{ item.content }}</div>
      </div>
      <div class="private-time">{{ item.sendTime }}</div>
    </div>
  </div>
</template>

<script setup>
import {ref, nextTick, defineProps, defineExpose, watch} from 'vue'
import {storeToRefs} from 'pinia'
import {useHomeStore} from '@/store/home'
import {useRouter} from 'vue-router'

const props = defineProps({
  active: Boolean
})

const homeStore = useHomeStore()
const {groupMessages: chatList, privateMessages: privateList, profileData: profileData} = storeToRefs(homeStore)
const chatListRef = ref(null)
let lastScrollTop = 0

const router = useRouter()

function openChat(type, id, name) {
  homeStore.clearItemUnread(type, id)
  router.push({
    path: '/chat',
    query: {type, id, name}
  })
}

function saveScroll() {
  if (chatListRef.value) {
    lastScrollTop = chatListRef.value.scrollTop
  }
}

function restoreScroll() {
  if (chatListRef.value) {
    nextTick(() => {
      chatListRef.value.scrollTop = lastScrollTop
      setTimeout(() => {
        if (chatListRef.value) chatListRef.value.scrollTop = lastScrollTop
      }, 0)
      setTimeout(() => {
        if (chatListRef.value) chatListRef.value.scrollTop = lastScrollTop
      }, 100)
    })
  }
}

function moveItemToTop(type, id) {
  if (type === 'group') {
    const idx = chatList.value.findIndex(item => item.groupId === id)
    if (idx > 0) {
      const [item] = chatList.value.splice(idx, 1)
      chatList.value.unshift(item)
    }
  } else if (type === 'private') {
    const idx = privateList.value.findIndex(item => (item.senderId === id || item.receiverId === id))
    if (idx > 0) {
      const [item] = privateList.value.splice(idx, 1)
      privateList.value.unshift(item)
    }
  }
}

// 监听homeStore的groupMessages/privateMessages变化，自动将有新消息的会话移到顶部
watch(
  () => [chatList.value.map(i => i.content), privateList.value.map(i => i.content)],
  ([newGroupContents, newPrivateContents], [oldGroupContents, oldPrivateContents]) => {
    // 检查group
    if (oldGroupContents) {
      for (let i = 0; i < newGroupContents.length; i++) {
        if (newGroupContents[i] !== oldGroupContents[i]) {
          moveItemToTop('group', chatList.value[i].groupId)
          break
        }
      }
    }
    // 检查private
    if (oldPrivateContents) {
      for (let i = 0; i < newPrivateContents.length; i++) {
        if (newPrivateContents[i] !== oldPrivateContents[i]) {
          const item = privateList.value[i]
          moveItemToTop('private', item.senderId === profileData.value.id ? item.receiverId : item.senderId)
          break
        }
      }
    }
  },
  { deep: true }
)

defineExpose({saveScroll, restoreScroll})
</script>

<style scoped>
@import '@/assets/css/chat.css';
</style>
