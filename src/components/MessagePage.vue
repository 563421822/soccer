<template>
  <div class="msg-page">
    <div class="msg-header">
      <span class="msg-edit" @click="toggleEdit">{{ isEdit ? '完成' : '编辑' }}</span>
      <span class="msg-title">聊天</span>
      <span class="msg-add">+</span>
    </div>
    <div class="msg-search-bar">
      <span class="msg-search-icon"></span>
      <input class="msg-search-input" placeholder="搜索" v-model="searchText" />
    </div>
    <div class="chat-list" ref="chatListRef">
      <template v-for="item in filteredGroupList" :key="'group-' + item.id">
        <div class="chat-item" @click="!isEdit && openChat('group', item.groupId, item.groupChat.name)">
          <div class="avatar-wrapper">
            <input v-if="isEdit" type="checkbox" v-model="selectedIds" :value="'group-' + item.groupId" class="item-checkbox left" />
            <img v-if="item.groupChat.avatar" :src="item.groupChat.avatar" class="avatar" />
            <div v-else class="avatar">{{ item.groupChat.name.charAt(0) }}</div>
            <span v-if="item.unreadCount > 0 && !isEdit" class="item-badge">{{ item.unreadCount }}</span>
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ item.groupChat.name }}</div>
            <div class="chat-preview">{{ item.content }}</div>
          </div>
          <div class="chat-time">{{ item.sendTime && item.sendTime.slice(5, 10) }}</div>
        </div>
      </template>
      <template v-for="item in filteredPrivateList" :key="'private-' + item.id">
        <div class="private-item" @click="!isEdit && openChat('private', item.user.id, item.user.username)">
          <div class="avatar-wrapper">
            <input v-if="isEdit" type="checkbox" v-model="selectedIds" :value="'private-' + item.user.id" class="item-checkbox left" />
            <img v-if="item.user.avatar" :src="item.user.avatar" class="private-avatar" />
            <div v-else class="private-avatar">{{ item.user.username.charAt(0) }}</div>
            <span v-if="item.unreadCount > 0 && !isEdit" class="item-badge">{{ item.unreadCount }}</span>
          </div>
          <div class="private-info">
            <div class="private-name">{{ item.user.username }}</div>
            <div class="private-preview">{{ item.content }}</div>
          </div>
          <div class="private-time">{{ item.sendTime && item.sendTime.slice(5, 10) }}</div>
        </div>
      </template>
    </div>
    <div v-if="isEdit" class="msg-footer-bar">
      <span class="footer-btn" @click="selectAll">全选</span>
      <span class="footer-btn" @click="setAllRead">设为全部已读</span>
      <span class="footer-btn footer-btn-danger" @click="deleteSelected">删除</span>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import { useRouter } from 'vue-router'

// 必须声明页面依赖的响应式变量
const searchText = ref('')
const isEdit = ref(false)
const selectedIds = ref([])

const homeStore = useHomeStore()
const { groupMessages: chatList, privateMessages: privateList, profileData } = storeToRefs(homeStore)
const chatListRef = ref(null)
let lastScrollTop = 0
const router = useRouter()

import { computed, ref, nextTick, watch } from 'vue'

const filteredGroupList = computed(() => {
  if (!searchText.value) return chatList.value
  return chatList.value.filter(item => item.groupChat.name.includes(searchText.value) || item.content.includes(searchText.value))
})
const filteredPrivateList = computed(() => {
  if (!searchText.value) return privateList.value
  return privateList.value.filter(item => item.user.username.includes(searchText.value) || item.content.includes(searchText.value))
})

function toggleEdit() {
  isEdit.value = !isEdit.value
  if (!isEdit.value) selectedIds.value = []
}
function selectAll() {
  if (selectedIds.value.length === filteredGroupList.value.length + filteredPrivateList.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = [
      ...filteredGroupList.value.map(item => 'group-' + item.groupId),
      ...filteredPrivateList.value.map(item => 'private-' + item.user.id)
    ]
  }
}
function setAllRead() {
  filteredGroupList.value.forEach(item => homeStore.clearItemUnread('group', item.groupId))
  filteredPrivateList.value.forEach(item => homeStore.clearItemUnread('private', item.user.id))
}
function deleteSelected() {
  // 这里只做前端删除，实际可调用API
  selectedIds.value.forEach(id => {
    if (id.startsWith('group-')) {
      const idx = chatList.value.findIndex(item => 'group-' + item.groupId === id)
      if (idx !== -1) chatList.value.splice(idx, 1)
    } else if (id.startsWith('private-')) {
      const idx = privateList.value.findIndex(item => 'private-' + item.user.id === id)
      if (idx !== -1) privateList.value.splice(idx, 1)
    }
  })
  selectedIds.value = []
}
// ...existing code...

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
.msg-page {
  flex: 1 1 0%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}
.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  border-bottom: 1px solid #eee;
  font-size: 18px;
  font-weight: bold;
  background: #fff;
}
.msg-edit {
  color: #267efb;
  font-size: 17px;
  font-weight: normal;
  cursor: pointer;
}
.msg-title {
  flex: 1;
  text-align: center;
  font-size: 19px;
  font-weight: bold;
  color: #222;
}
.msg-add {
  color: #267efb;
  font-size: 28px;
  font-weight: normal;
  cursor: pointer;
  width: 32px;
  text-align: right;
}
.msg-search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f7;
  padding: 10px 12px 8px 12px;
}
.msg-search-icon {
  width: 22px;
  height: 22px;
  background: url('/images/icon-discover.svg') no-repeat center/18px 18px;
  margin-right: 6px;
  opacity: 0.5;
}
.msg-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #222;
  outline: none;
  padding: 4px 0;
}
.chat-list {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}
.chat-item, .private-item {
  display: flex;
  align-items: center;
  padding: 12px 16px 10px 16px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  background: #fff;
  position: relative;
}
.avatar-wrapper {
  position: relative;
  margin-right: 12px;
  display: flex;
  align-items: center;
}
.avatar, .private-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #267efb;
  object-fit: cover;
}
.avatar img, .private-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.item-badge {
  position: absolute;
  right: -4px;
  top: -4px;
  background: #267efb;
  color: #fff;
  font-size: 13px;
  border-radius: 10px;
  padding: 0 6px;
  min-width: 18px;
  text-align: center;
  line-height: 18px;
  height: 18px;
  font-weight: bold;
}
.item-checkbox {
  width: 22px;
  height: 22px;
  margin-left: 0;
  margin-right: 8px;
}
.item-checkbox.left {
  margin-right: 12px;
  margin-left: 0;
}
.chat-info, .private-info {
  flex: 1;
  min-width: 0;
}
.chat-name, .private-name {
  font-size: 17px;
  color: #222;
  font-weight: bold;
  margin-bottom: 2px;
}
.chat-preview, .private-preview {
  font-size: 15px;
  color: #b2b2b2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-time, .private-time {
  color: #b2b2b2;
  font-size: 14px;
  margin-left: 8px;
  min-width: 44px;
  text-align: right;
}
.msg-footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f7f7f7;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 75px;
  z-index: 9999;
}
.footer-btn {
  color: #267efb;
  font-size: 17px;
  cursor: pointer;
  padding: 0 10px;
}
.footer-btn-danger {
  color: #e74c3c;
}
</style>
