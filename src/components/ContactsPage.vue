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
      <span :class="['tab', activeTab === 'channel' ? 'active' : '']" @click="activeTab = 'channel'">频道</span>
    </div>
    <div class="contacts-list" ref="contactListRef">
      <div class="func-entry-list">
        <div class="func-entry">
          <span class="func-icon icon-friend"></span>
          <span class="func-label">好友请求</span>
          <span class="func-extra">1/5000</span>
        </div>
        <div class="func-entry">
          <span class="func-icon icon-fav"></span>
          <span class="func-label">收藏夹</span>
        </div>
      </div>
      <div class="contacts-section">
        <div class="section-divider">Z</div>
        <div v-for="item in filteredContacts" :key="'contact-' + item.id" class="contact-row" @click="openChat('private', item.id, item.username)">
        <img v-if="item.avatar" :src="item.avatar" class="contact-avatar" />
        <div v-else class="contact-avatar">{{ item.username.charAt(0) }}</div>
        <div class="contact-info">
          <div class="contact-name">{{ item.username }}</div>
          <div class="contact-status">6分钟前在线</div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const activeTab = ref('friend')
import { ref, computed, defineExpose, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import { useRouter } from "vue-router";

const searchText = ref('')
const homeStore = useHomeStore()
const { groups, contacts } = storeToRefs(homeStore)

const filteredGroups = computed(() => {
  return groups.value.filter(item => item.name.includes(searchText.value.trim()))
})
const filteredContacts = computed(() => {
  return contacts.value.filter(item => item.username.includes(searchText.value.trim()))
})

const contactListRef = ref(null)
let lastScrollTop = 0
const router = useRouter()

function openChat(type, id, name) {
  homeStore.resetUnread()
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
}
.tab {
  flex: none;
  margin-right: 18px;
  color: #888;
  padding: 0 2px 6px 2px;
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
  background: url('/images/user.svg') no-repeat center/18px 18px, #eaeaea;
}
.icon-fav {
  background: url('/images/icon-favorite.svg') no-repeat center/18px 18px, #eaeaea;
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
  color: #b2b2b2;
}
.empty-tip {
  text-align: center;
  color: #b2b2b2;
  font-size: 16px;
  margin: 18px 0 0 0;
}
</style>

