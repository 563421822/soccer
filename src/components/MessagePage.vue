<template>
  <div class="msg-page">
    <div class="msg-search-bar">
      <span class="msg-search-icon"></span>
      <input class="msg-search-input" placeholder="搜索" v-model="searchText" />
    </div>
    <div class="chat-list" ref="chatListRef"
      @touchstart="onPullStart" @touchmove="onPullMove" @touchend="onPullEnd"
      @mousedown="onPullMouseDown" @mousemove="onPullMouseMove" @mouseup="onPullMouseUp"
      :style="{ touchAction: 'pan-y' }">
      <div class="refresh-indicator" :style="{ height: refreshHeight + 'px' }">
        <div v-if="isRefreshing" class="spinner"></div>
        <span v-else-if="refreshHeight > 0" class="refresh-tip">下拉刷新</span>
      </div>
      <template v-if="mergedList.length > 0">
        <template v-for="item in mergedList" :key="item.key">
          <div :class="[item.type === 'group' ? 'chat-item' : 'private-item', 'swipe-item']" :data-key="item.key"
            @click="onItemClick(item, $event)"
            @touchstart="onTouchStart(item.key, $event)"
            @touchmove="onTouchMove(item.key, $event)"
            @touchend="onTouchEnd(item.key, $event)"
            @mousedown="onMouseDown(item.key, $event)"
            @mousemove="onMouseMove(item.key, $event)"
            @mouseup="onMouseUp(item.key, $event)">
            <div class="swipe-content" :style="swipeStyles[item.key]">
              <div class="avatar-wrapper">
                <input v-if="isEdit" type="checkbox" :checked="selectedIds.includes(item.key)" @change="onSelect(item.key, $event)" class="item-checkbox left" />
                <img v-if="item.avatar" :src="item.avatar" :class="item.type === 'group' ? 'avatar' : 'private-avatar'" />
                <div v-else :class="item.type === 'group' ? 'avatar' : 'private-avatar'">{{item.name.charAt(0)}}</div>
                <span v-if="item.unreadCount > 0 && !isEdit" class="item-badge">{{ item.unreadCount }}</span>
              </div>
              <div class="chat-info">
                <div class="chat-name">{{ item.name }}</div>
                <div class="chat-preview">{{ item.content }}</div>
              </div>
              <div class="chat-time">{{ item.sendTime && item.sendTime.slice(5, 10) }}</div>
            </div>
            <button v-if="swipeStates[item.key]" class="swipe-delete-btn" :class="{ deleting: deletingId === item.key }" :disabled="deletingId === item.key" @mousedown.stop="onDeleteBtnClick(item)">
              <span v-if="deletingId !== item.key">删除</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </template>
      </template>
      <div v-else class="empty-tip">
        <span v-if="searchText">无相关会话</span>
        <span v-else>暂无会话</span>
      </div>
    </div>
    <!-- 全局toast提示 -->
    <div v-if="toastMsg" class="msg-toast">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, reactive } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import { useRouter } from 'vue-router'

const props = defineProps({
  isEdit: Boolean,
  selectedIds: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:selectedIds'])

const searchText = ref('')
const homeStore = useHomeStore()
const { groupMessages: chatList, privateMessages: privateList, profileData } = storeToRefs(homeStore)
const chatListRef = ref(null)
let lastScrollTop = 0
const router = useRouter()
const deletingId = ref(null)

// 新增toast
const toastMsg = ref('')
function showToast(msg, duration = 1500) {
  toastMsg.value = msg
  setTimeout(() => {
    toastMsg.value = ''
  }, duration)
}

const filteredGroupList = computed(() => {
  if (!searchText.value) return chatList.value
  return chatList.value.filter(item =>
    item.groupChat.name.includes(searchText.value) || item.content.includes(searchText.value)
  )
})
const filteredPrivateList = computed(() => {
  if (!searchText.value) return privateList.value
  return privateList.value.filter(item =>
    item.user.username.includes(searchText.value) || item.content.includes(searchText.value)
  )
})

// 合并 group 和 private 列表，统一结构
const mergedList = computed(() => [
  ...filteredGroupList.value.map(item => ({
    key: `group-${item.groupId}`,
    type: 'group',
    id: item.groupId,
    name: item.groupChat.name,
    avatar: item.groupChat?.avatar || '/images/group.svg',
    unreadCount: item.unreadCount,
    content: item.content,
    sendTime: item.sendTime
  })),
  ...filteredPrivateList.value.map(item => ({
    key: `private-${item.user.id}`,
    type: 'private',
    id: item.user.id,
    name: item.user.username,
    avatar: item.user.avatar,
    unreadCount: item.unreadCount,
    content: item.content,
    sendTime: item.sendTime
  }))
])

function onSelect(id, event) {
  let newIds = props.selectedIds.slice()
  if (event.target.checked) {
    if (!newIds.includes(id)) newIds.push(id)
  } else {
    newIds = newIds.filter(i => i !== id)
  }
  emit('update:selectedIds', newIds)
}

function handleOpenChat(type, id, name) {
  const key = `${type}-${id}`
  // 优化：删除按钮显示时，阻止跳转
  if (swipeStates[key]) return
  openChat(type, id, name)
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

watch(
  () => [chatList.value.map(i => i.content), privateList.value.map(i => i.content)],
  ([newGroupContents, newPrivateContents], [oldGroupContents, oldPrivateContents]) => {
    if (oldGroupContents) {
      for (let i = 0; i < newGroupContents.length; i++) {
        if (newGroupContents[i] !== oldGroupContents[i]) {
          moveItemToTop('group', chatList.value[i].groupId)
          break
        }
      }
    }
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
  // 只移动内容，不推动整块
  if (deltaX < 0 && deltaX > -80) {
    swipeStyles[key] = `transform: translateX(${deltaX}px)`
    swipeStates[key] = false
  }
}

function onTouchEnd(key, e) {
  if (!dragging || draggingKey !== key) return
  const deltaX = e.changedTouches[0].clientX - startX
  Object.keys(swipeStates).forEach(k => {
    if (k !== key) {
      swipeStates[k] = false
      swipeStyles[k] = `transform: translateX(0px)`
    }
  })
  // 误触防护：左滑距离不够自动回弹
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
  Object.keys(swipeStates).forEach(k => {
    if (k !== key) {
      swipeStates[k] = false
      swipeStyles[k] = `transform: translateX(0px)`
    }
  })
  // 误触防护：左滑距离不够自动回弹
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

async function deleteItem(type, id) {
  const key = `${type}-${id}`
  if (deletingId.value) return
  deletingId.value = key
  try {
    await fakeDeleteApiCall(type, id)
    // 先显示动画，延迟后再删除
    setTimeout(() => {
      // 删除数据
      if (type === 'group') {
        const idx = chatList.value.findIndex(item => item.groupId === id)
        if (idx !== -1) chatList.value.splice(idx, 1)
      } else if (type === 'private') {
        const idx = privateList.value.findIndex(item => item.user.id === id)
        if (idx !== -1) privateList.value.splice(idx, 1)
      }
      // 回弹
      swipeStyles[key] = `transform: translateX(0px)`
      swipeStates[key] = false
      showToast('删除成功')
      deletingId.value = null
    }, 500) // 500ms动画时间
  } catch (err) {
    console.error('删除失败:', err)
    showToast('删除失败')
    deletingId.value = null
  }
}

function fakeDeleteApiCall(type, id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000)
  })
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
  setTimeout(() => {
    isRefreshing.value = false
    refreshHeight.value = 0
  }, 1000)
}

function onItemClick(item, event) {
  if (props.isEdit) return
  const key = item.key
  // 检查是否点击在红色删除区域（按钮本身或其子元素）
  let el = event.target
  while (el && el !== event.currentTarget) {
    if (el.classList && el.classList.contains('swipe-delete-btn')) {
      // 删除按钮区域点击，立即执行删除，不跳转页面
      if (deletingId.value !== key) {
        deleteItem(item.type, item.id)
      }
      return
    }
    el = el.parentElement
  }
  // 如果删除按钮显示，或当前transform不是初始状态，则不跳转并回弹
  if (swipeStates[key] || swipeStyles[key] !== `transform: translateX(0px)`) {
    swipeStyles[key] = `transform: translateX(0px)`
    swipeStates[key] = false
    return
  }
  handleOpenChat(item.type, item.id, item.name)
}

// 删除按钮点击逻辑（防止冒泡导致父级跳转）
function onDeleteBtnClick(item) {
  if (deletingId.value !== item.key) {
    deleteItem(item.type, item.id)
  }
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

.refresh-tip {
  margin: 8px 0;
}

.chat-item,
.private-item {
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

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  /* 方形，略带圆角 */
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #267efb;
  object-fit: cover;
}

.private-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  /* 保持圆形 */
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #267efb;
  object-fit: cover;
}

.avatar img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  /* 方形，略带圆角 */
  object-fit: cover;
}

.private-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  /* 保持圆形 */
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

.chat-info{
  flex: 1;
  min-width: 0;
}

.chat-name,
.private-name {
  font-size: 16px;
  color: #222;
  font-weight: bold;
  margin-bottom: 2px;
}

.chat-preview,
.private-preview {
  font-size: 16px;
  color: #b2b2b2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
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
  transition: transform 0.25s cubic-bezier(.4,0,.2,1); /* 更流畅动画 */
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
  font-size: 17px;
  outline: none;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  pointer-events: auto;
  font-weight: bold;
  user-select: none;
  padding: 0 0;
}
.swipe-delete-btn.deleting {
  cursor: not-allowed;
  background: #e74c3c;
}
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 4px solid #fff;
  border-top: 4px solid #b2b2b2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin: 0 auto;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}

.empty-tip {
  text-align: center;
  color: #b2b2b2;
  font-size: 16px;
  padding: 40px 0;
  user-select: none;
}

/* toast样式 */
.msg-toast {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 2000;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>