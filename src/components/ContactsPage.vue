<template>
  <div class="contacts-page">
    <!-- header 由父组件统一渲染 -->
    <div class="contacts-search-bar">
      <span class="search-icon"></span>
      <input class="search-input" type="text" v-model="searchText" placeholder="搜索" />
    </div>
    <div class="contacts-tabs">
      <span :class="['tab', activeTab === 'friend' ? 'active' : '']" @click="activeTab = 'friend'">好友</span>
      <span :class="['tab', activeTab === 'group' ? 'active' : '']" @click="activeTab = 'group'">群聊</span>
    </div>
    <div class="contacts-list" ref="contactListRef" @touchstart="onTabsTouchStart" @touchmove="onTabsTouchMove"
      @touchend="onTabsTouchEnd" @mousedown="onTabsMouseDown" @mousemove="onTabsMouseMove" @mouseup="onTabsMouseUp">
      <div class="func-entry-list">
        <div class="func-entry" @click="showRequest = true">
          <span class="func-icon icon-friend"></span>
          <span class="func-label">好友请求</span>
          <span class="func-extra">1/5000</span>
        </div>
        <transition name="slide-up">
          <FriendRequest v-if="showRequest" @close="showRequest = false" />
        </transition>
        <div class="func-entry" @click="openChat('private', 1, '爱聊球团队')">
          <span class="func-icon icon-team"></span>
          <span class="func-label">爱聊球团队</span>
        </div>
      </div>
      <div class="contacts-section">
        <div class="section-divider">{{ sectionTitle }}</div>
        <div class="tabs-content" :style="tabsContentStyle">
          <template v-if="filteredList.length">
            <div v-for="item in filteredList" :key="item.key" class="contact-row" @click="handleOpen(item)">
              <img v-if="item.avatar" :src="item.avatar" :class="activeTab === 'group' ? 'group-avatar' : 'contact-avatar'" />
              <div v-else :class="activeTab === 'group' ? 'group-avatar' : 'contact-avatar'">{{ item.name.charAt(0) }}</div>
              <div class="contact-info">
                <div class="contact-name">{{ item.name }}</div>
                <div class="contact-status" v-if="activeTab === 'friend'">当前在线</div>
                <div class="contact-status" v-else-if="activeTab === 'group'">群成员 {{ item.memberCount }}</div>
              </div>
            </div>
          </template>
          <div v-else class="empty-tip">暂无内容</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import { useRouter } from "vue-router"
import FriendRequest from '@/components/FriendRequest.vue'

const showRequest = ref(false)

const tabOrder = ['friend', 'group']
const activeTab = ref('friend')
const searchText = ref('')
const tabsContentOffset = ref(0)
const homeStore = useHomeStore()
const { groups, contacts } = storeToRefs(homeStore)
const contactListRef = ref(null)
let lastScrollTop = 0
const router = useRouter()

const tabsContentStyle = computed(() => ({
  transform: `translateX(${tabsContentOffset.value}px)`,
  transition: tabsContentOffset.value === 0 ? 'none' : 'transform 0.25s cubic-bezier(.4,.8,.4,1)'
}))

const filteredContacts = computed(() =>
  contacts.value
    .filter(item => item.username.includes(searchText.value.trim()))
    .map(item => ({
      key: `contact-${item.id}`,
      name: item.username,
      avatar: item.avatar,
      id: item.id
    }))
)
const filteredGroups = computed(() =>
  groups.value
    .filter(item => item.name.includes(searchText.value.trim()))
    .map(item => ({
      key: `group-${item.id}`,
      name: item.name,
      avatar: item.avatar,
      id: item.id,
      memberCount: item.memberCount
    }))
)

const filteredList = computed(() => {
  if (activeTab.value === 'friend') return filteredContacts.value
  if (activeTab.value === 'group') return filteredGroups.value
  return []
})

const sectionTitle = computed(() => {
  if (activeTab.value === 'friend') return '好友'
  if (activeTab.value === 'group') return '群聊'
  return ''
})

function handleOpen(item) {
  if (activeTab.value === 'friend') {
    openChat('private', item.id, item.name)
  } else if (activeTab.value === 'group') {
    openChat('group', item.id, item.name)
  }
}

function openChat(type, id, name) {
  homeStore.resetUnread?.()
  router.push({
    path: '/chat',
    query: { type, id, name }
  })
}

function saveScroll() {
  if (contactListRef.value) {
    lastScrollTop = contactListRef.value.scrollTop
  }
}

function restoreScroll() {
  if (contactListRef.value) {
    nextTick(() => {
      contactListRef.value.scrollTop = lastScrollTop
      setTimeout(() => {
        if (contactListRef.value) contactListRef.value.scrollTop = lastScrollTop
      }, 0)
      setTimeout(() => {
        if (contactListRef.value) contactListRef.value.scrollTop = lastScrollTop
      }, 100)
    })
  }
}

let tabsStartX = 0
let tabsDragging = false

function getTabIndex(tab) {
  return tabOrder.indexOf(tab)
}
function setTabByIndex(idx) {
  if (idx < 0) idx = 0
  if (idx > tabOrder.length - 1) idx = tabOrder.length - 1
  activeTab.value = tabOrder[idx]
}

function onTabsTouchStart(e) {
  tabsStartX = e.touches[0].clientX
  tabsDragging = true
}
function onTabsTouchMove(e) {
  if (!tabsDragging) return
  const deltaX = e.touches[0].clientX - tabsStartX
  tabsContentOffset.value = deltaX
}
function onTabsTouchEnd(e) {
  if (!tabsDragging) return
  const deltaX = e.changedTouches[0].clientX - tabsStartX
  handleTabSwipe(deltaX)
  tabsContentOffset.value = 0
  tabsDragging = false
}
function onTabsMouseDown(e) {
  tabsStartX = e.clientX
  tabsDragging = true
}
function onTabsMouseMove(e) {
  if (!tabsDragging) return
  const deltaX = e.clientX - tabsStartX
  tabsContentOffset.value = deltaX
}
function onTabsMouseUp(e) {
  if (!tabsDragging) return
  const deltaX = e.clientX - tabsStartX
  handleTabSwipe(deltaX)
  tabsContentOffset.value = 0
  tabsDragging = false
}
function handleTabSwipe(deltaX) {
  const curIdx = getTabIndex(activeTab.value)
  if (deltaX < -50 && curIdx < tabOrder.length - 1) {
    setTabByIndex(curIdx + 1)
  } else if (deltaX > 50 && curIdx > 0) {
    setTabByIndex(curIdx - 1)
  }
}

defineExpose({ saveScroll, restoreScroll })

</script>

<style scoped>
.contacts-page {
  background: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.contacts-header {
  position: relative;
  height: 48px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  font-weight: bold;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.header-add {
  color: #267efb;
  font-size: 16px;
  font-weight: normal;
  cursor: pointer;
  width: 32px;
  text-align: right;
  position: absolute;
  right: 16px;
  top: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.contacts-search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f7;
  padding: 10px 12px 8px 12px;
}

.search-icon {
  width: 22px;
  height: 22px;
  background: url('/images/icon-discover.svg') no-repeat center/18px 18px;
  margin-right: 6px;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #222;
  outline: none;
  padding: 4px 0;
}

.contacts-tabs {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f2f2f2;
  background: #fff;
  font-size: 16px;
  height: 38px;
  margin-left: 16px;
  user-select: none;
  touch-action: pan-x;
}

.tab {
  flex: none;
  margin-right: 18px;
  color: #888;
  padding: 6px 2px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 16px;
}

.tab.active {
  color: #267efb;
  font-weight: bold;
  border-bottom: 2px solid #267efb;
}

.contacts-list {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.func-entry-list {
  background: #fff;
  border-bottom: 1px solid #f2f2f2;
}

.func-entry {
  display: flex;
  align-items: center;
  padding: 12px 16px 10px 16px;
  border-bottom: 1px solid #f2f2f2;
  font-size: 16px;
  cursor: pointer;
  position: relative;
}

.func-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eaeaea;
  margin-right: 12px;
  display: inline-block;
}

.icon-friend {
  background: url('/images/icon-discover.svg') no-repeat center/18px 18px, #eaeaea;
}

.icon-team {
  background: url('https://th.bing.com/th/id/OIP.dwEgyh_FlgXObvZP-iurSQHaHa?rs=1&pid=ImgDetMain') no-repeat center/18px 18px, #eaeaea;
}

.func-label {
  flex: 1;
  color: #222;
  font-size: 16px;
}

.func-extra {
  color: #b2b2b2;
  font-size: 16px;
  margin-left: 8px;
}

.contacts-section {
  margin-top: 8px;
}

.section-divider {
  background: #f5f5f7;
  color: #888;
  font-size: 16px;
  padding: 4px 16px;
  border-top: 1px solid #f2f2f2;
  border-bottom: 1px solid #f2f2f2;
}

.contact-row {
  display: flex;
  align-items: center;
  padding: 12px 16px 10px 16px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  background: #fff;
  font-size: 16px;
}

.contact-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #267efb;
  object-fit: cover;
  margin-right: 12px;
}

.group-avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #267efb;
  object-fit: cover;
  margin-right: 12px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-size: 16px;
  color: #222;
  font-weight: bold;
  margin-bottom: 2px;
}

.contact-status {
  font-size: 16px;
  color: #27c16e;
}

.empty-tip {
  text-align: center;
  color: #b2b2b2;
  font-size: 16px;
  margin: 18px 0 0 0;
}

.tabs-content {
  will-change: transform;
  transition: transform 0.25s cubic-bezier(.4, .8, .4, 1);
}


/* 滑动 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
