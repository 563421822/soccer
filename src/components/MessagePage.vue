<template>
  <div class="msg-page">
    <div class="msg-search-bar">
      <span class="msg-search-icon"></span>
      <input class="msg-search-input" placeholder="搜索" v-model="searchText" />
    </div>
    <div
      class="chat-list"
      ref="chatListRef"
      @touchstart="onPullStart"
      @touchmove="onPullMove"
      @touchend="onPullEnd"
      @mousedown="onPullMouseDown"
      @mousemove="onPullMouseMove"
      @mouseup="onPullMouseUp"
      :style="{touchAction: 'pan-y'}"
    >
      <div class="refresh-indicator" :style="{height: refreshHeight + 'px'}">
        <div v-if="isRefreshing" class="spinner"></div>
        <span v-else-if="refreshHeight > 0" class="refresh-tip">下拉刷新</span>
      </div>
      <template v-for="item in filteredGroupList" :key="'group-' + item.id">
        <div
          class="chat-item swipe-item"
          @click="!isEdit && handleOpenChat('group', item.groupId, item.groupChat.name)"
          @touchstart="onTouchStart('group-' + item.groupId, $event)"
          @touchmove="onTouchMove('group-' + item.groupId, $event)"
          @touchend="onTouchEnd('group-' + item.groupId, $event)"
          @mousedown="onMouseDown('group-' + item.groupId, $event)"
          @mousemove="onMouseMove('group-' + item.groupId, $event)"
          @mouseup="onMouseUp('group-' + item.groupId, $event)"
        >
          <div
            class="swipe-content"
            :style="swipeStyles['group-' + item.groupId]"
          >
            <div class="avatar-wrapper">
              <input v-if="isEdit" type="checkbox" :checked="selectedIds.includes('group-' + item.groupId)"
                @change="onSelect('group-' + item.groupId, $event)" class="item-checkbox left" />
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
          <button
            v-if="swipeStates['group-' + item.groupId]"
            class="swipe-delete-btn"
            @click.stop="deleteItem('group', item.groupId)"
          >删除</button>
        </div>
      </template>
      <template v-for="item in filteredPrivateList" :key="'private-' + item.id">
        <div
          class="private-item swipe-item"
          @click="!isEdit && handleOpenChat('private', item.user.id, item.user.username)"
          @touchstart="onTouchStart('private-' + item.user.id, $event)"
          @touchmove="onTouchMove('private-' + item.user.id, $event)"
          @touchend="onTouchEnd('private-' + item.user.id, $event)"
          @mousedown="onMouseDown('private-' + item.user.id, $event)"
          @mousemove="onMouseMove('private-' + item.user.id, $event)"
          @mouseup="onMouseUp('private-' + item.user.id, $event)"
        >
          <div
            class="swipe-content"
            :style="swipeStyles['private-' + item.user.id]"
          >
            <div class="avatar-wrapper">
              <input v-if="isEdit" type="checkbox" :checked="selectedIds.includes('private-' + item.user.id)"
                @change="onSelect('private-' + item.user.id, $event)" class="item-checkbox left" />
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
          <button
            v-if="swipeStates['private-' + item.user.id]"
            class="swipe-delete-btn"
            @click.stop="deleteItem('private', item.user.id)"
          >删除</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  isEdit: Boolean,
  selectedIds: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:selectedIds'])
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import { useRouter } from 'vue-router'

const searchText = ref('')
const homeStore = useHomeStore()
const { groupMessages: chatList, privateMessages: privateList, profileData } = storeToRefs(homeStore)
const chatListRef = ref(null)
let lastScrollTop = 0
const router = useRouter()

import { computed, ref, nextTick, watch, reactive } from 'vue'

const filteredGroupList = computed(() => {
  if (!searchText.value) return chatList.value
  return chatList.value.filter(item => item.groupChat.name.includes(searchText.value) || item.content.includes(searchText.value))
})
const filteredPrivateList = computed(() => {
  if (!searchText.value) return privateList.value
  return privateList.value.filter(item => item.user.username.includes(searchText.value) || item.content.includes(searchText.value))
})

// 选中项变更时通知父组件
function onSelect(id, event) {
  let newIds = props.selectedIds.slice()
  if (event.target.checked) {
    if (!newIds.includes(id)) newIds.push(id)
  } else {
    newIds = newIds.filter(i => i !== id)
  }
  emit('update:selectedIds', newIds)
}

// 修复点击事件被滑动事件覆盖导致无法跳转
function handleOpenChat(type, id, name) {
  // 如果当前有滑动删除按钮显示，则不跳转
  const key = type === 'group' ? `group-${id}` : `private-${id}`;
  if (swipeStates[key]) return;
  openChat(type, id, name);
}

function openChat(type, id, name) {
  homeStore.clearItemUnread(type, id)
  router.push({
    path: '/chat',
    query: { type, id, name }
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

const swipeStates = reactive({})
const swipeStyles = reactive({})

let startX = 0
let draggingKey = null
let dragging = false

function onTouchStart(key, e) {
  startX = e.touches[0].clientX
  draggingKey = key
  dragging = true
}
function onTouchMove(key, e) {
  if (!dragging || draggingKey !== key) return
  const deltaX = e.touches[0].clientX - startX
  if (deltaX < 0 && deltaX > -80) {
    swipeStyles[key] = `transform: translateX(${deltaX}px)`
    swipeStates[key] = false
  }
}
function onTouchEnd(key, e) {
  if (!dragging || draggingKey !== key) return
  const deltaX = e.changedTouches[0].clientX - startX
  if (deltaX < -40) {
    swipeStyles[key] = `transform: translateX(-80px)`
    swipeStates[key] = true
  } else {
    swipeStyles[key] = `transform: translateX(0px)`
    swipeStates[key] = false
  }
  dragging = false
  draggingKey = null
}

// 鼠标支持（PC端）
function onMouseDown(key, e) {
  startX = e.clientX
  draggingKey = key
  dragging = true
}
function onMouseMove(key, e) {
  if (!dragging || draggingKey !== key) return
  const deltaX = e.clientX - startX
  if (deltaX < 0 && deltaX > -80) {
    swipeStyles[key] = `transform: translateX(${deltaX}px)`
    swipeStates[key] = false
  }
}
function onMouseUp(key, e) {
  if (!dragging || draggingKey !== key) return
  const deltaX = e.clientX - startX
  if (deltaX < -40) {
    swipeStyles[key] = `transform: translateX(-80px)`
    swipeStates[key] = true
  } else {
    swipeStyles[key] = `transform: translateX(0px)`
    swipeStates[key] = false
  }
  dragging = false
  draggingKey = null
}

function deleteItem(type, id) {
  if (type === 'group') {
    const idx = chatList.value.findIndex(item => item.groupId === id)
    if (idx !== -1) chatList.value.splice(idx, 1)
  } else if (type === 'private') {
    const idx = privateList.value.findIndex(item => item.user.id === id)
    if (idx !== -1) privateList.value.splice(idx, 1)
  }
  swipeStyles[`${type}-${id}`] = `transform: translateX(0px)`
  swipeStates[`${type}-${id}`] = false
}

const refreshHeight = ref(0)
const isRefreshing = ref(false)
let pullStartY = 0
let pulling = false
let pullTriggered = false

function onPullStart(e) {
  if (chatListRef.value && chatListRef.value.scrollTop === 0 && !isRefreshing.value) {
    pulling = true
    pullStartY = e.touches[0].clientY
    pullTriggered = false
  }
}
function onPullMove(e) {
  if (!pulling || isRefreshing.value) return
  const deltaY = e.touches[0].clientY - pullStartY
  if (deltaY > 0) {
    refreshHeight.value = Math.min(deltaY, 80)
    if (refreshHeight.value >= 60) pullTriggered = true
  }
}
function onPullEnd(e) {
  if (!pulling) return
  if (pullTriggered) {
    triggerRefresh()
  } else {
    refreshHeight.value = 0
  }
  pulling = false
  pullTriggered = false
}

function onPullMouseDown(e) {
  if (chatListRef.value && chatListRef.value.scrollTop === 0 && !isRefreshing.value) {
    pulling = true
    pullStartY = e.clientY
    pullTriggered = false
  }
}
function onPullMouseMove(e) {
  if (!pulling || isRefreshing.value) return
  const deltaY = e.clientY - pullStartY
  if (deltaY > 0) {
    refreshHeight.value = Math.min(deltaY, 80)
    if (refreshHeight.value >= 60) pullTriggered = true
  }
}
function onPullMouseUp(e) {
  if (!pulling) return
  if (pullTriggered) {
    triggerRefresh()
  } else {
    refreshHeight.value = 0
  }
  pulling = false
  pullTriggered = false
}

function triggerRefresh() {
  isRefreshing.value = true
  refreshHeight.value = 40
  // 模拟异步刷新
  setTimeout(() => {
    // 可在此处调用实际的刷新逻辑
    isRefreshing.value = false
    refreshHeight.value = 0
  }, 1000)
}

defineExpose({ saveScroll, restoreScroll })
</script>

<style scoped>
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
  /* 防止下拉时内容被遮挡 */
  position: relative;
}
.refresh-indicator {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: height 0.2s;
  background: #f5f5f7;
  color: #267efb;
  font-size: 15px;
}
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #267efb;
  border-top: 3px solid #b2b2b2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 8px 0;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.refresh-tip {
  margin: 8px 0;
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
  font-size: 16px;
  color: #222;
  font-weight: bold;
  margin-bottom: 2px;
}
.chat-preview, .private-preview {
  font-size: 16px;
  color: #b2b2b2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-time, .private-time {
  color: #b2b2b2;
  font-size: 16px;
  margin-left: 8px;
  min-width: 44px;
  text-align: right;
}

.footer-btn {
  color: #267efb;
  font-size: 16px;
  cursor: pointer;
  padding: 0 10px;
}
.footer-btn-danger {
  color: #e74c3c;
}
.swipe-item {
  position: relative;
  background: #fff;
  overflow: visible;
}
.swipe-content {
  width: 100%;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  will-change: transform;
}
.swipe-delete-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 80px;
  background: #e74c3c;
  color: #fff;
  border: none;
  font-size: 16px;
  outline: none;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  /* 只在滑动时显示 */
  /* 用v-if控制显示 */
}
.swipe-delete-btn:active {
  background: #c0392b;
}
</style>
