<template>
  <div class="container">
    <!-- 顶部统一 header -->
    <div class="page-header" v-if="currentTab !== 'profile'">
      <div class="header-title">
        {{
          currentTab === 'message' ? '消息' :
              currentTab === 'contacts' ? '通讯录' :
                  currentTab === 'discover' ? '发现' : ''
        }}
      </div>
    </div>
    <!-- 加载蒙版 -->
    <div class="loading-mask" :class="{ active: loading }">
      <div class="loading-spinner"></div>
    </div>
    <div class="content">
      <MessagePage
          ref="messagePageRef"
          :active="currentTab === 'message'"
          v-show="currentTab === 'message'"
          @refreshMessageList="refreshMessageList"
      />
      <ContactsPage ref="contactsPageRef" v-show="currentTab === 'contacts'"/>
      <DiscoverPage v-show="currentTab === 'discover'"/>
      <ProfilePage v-show="currentTab === 'profile'"/>
    </div>
    <div class="tab-bar">
      <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
      >
        <div class="tab-icon" style="position:relative;">
          <img :src="tab.icon" alt="icon"/>
          <!-- 未读消息红点，仅在消息tab显示且未读数大于0 -->
          <span v-if="tab.key === 'message' && homeStore.unreadCount > 0" class="badge">{{
              homeStore.unreadCount
            }}</span>
        </div>
        <div class="tab-text">{{ tab.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick, watch} from 'vue'
import {useRouter, useRoute}from 'vue-router'
import {useHomeStore}from '@/store/home'
import MessagePage from '@/components/MessagePage.vue'
import ContactsPage from '@/components/ContactsPage.vue'
import DiscoverPage from '@/components/DiscoverPage.vue'
import ProfilePage from '@/components/ProfilePage.vue'

const router = useRouter()
const route = useRoute()
const currentTab = ref('message')
const loading = ref(true)
const tabs = [
  {key: 'message', icon: '/images/icon-moments.svg', text: '消息'},
  {key: 'contacts', icon: '/images/icon-service.svg', text: '通讯录'},
  // {key: 'discover', icon: '/images/icon-discover.svg', text: '发现'},
  {key: 'profile', icon: '/images/icon-profile.svg', text: '我'}
]

const homeStore = useHomeStore()

// 新增：ref获取子组件实例
const messagePageRef = ref()
const contactsPageRef = ref()

function switchTab(tab) {
  // 切换前保存当前tab的滚动条
  if (currentTab.value === 'message' && messagePageRef.value) {
    messagePageRef.value.saveScroll()
  } else if (currentTab.value === 'contacts' && contactsPageRef.value) {
    contactsPageRef.value.saveScroll()
  }
  currentTab.value = tab
  // 切换后只恢复目标tab的滚动条（不影响其它tab）
  nextTick(() => {
    if (tab === 'message' && messagePageRef.value) {
      messagePageRef.value.restoreScroll()
    } else if (tab === 'contacts' && contactsPageRef.value) {
      contactsPageRef.value.restoreScroll()
    }
    // 其它tab不做滚动恢复
  })
}

onMounted(async () => {
  // token 校验
  const token = localStorage.getItem('token')
  if (!token) {
    await router.replace('/login')
    return
  }
  // 读取tab参数
  const tabParam = route.query.tab
  if (tabParam && tabs.some(t => t.key === tabParam)) {
    currentTab.value = tabParam
  }
  try {
    await homeStore.initialize()
    loading.value = false
    // 首次进入时恢复消息页滚动条
    nextTick(() => {
      if (messagePageRef.value) messagePageRef.value.restoreScroll()
    })
  } catch (e) {
    localStorage.clear()
    homeStore.reset()
    await router.replace('/login')
  }
})

watch(currentTab, (val) => {
  sessionStorage.setItem('lastTab', val)
  // 切换tab时同步路由参数
  router.replace({ path: '/', query: { tab: val } })
})

function refreshMessageList() {
  homeStore.initialize()
}
</script>

<style scoped>

@import '@/assets/css/style.css';
</style>

