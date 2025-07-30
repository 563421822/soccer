<template>
  <div class="container">
     <div class="loading-mask" :class="{ active: loading }">
      <div class="loading-spinner"></div>
    </div>
    <div class="page-header" v-if="currentTab !== 'profile'">
      <template v-if="currentTab === 'message'">
        <div class="header-bar">
          <span class="msg-add" @click="onMsgAddClick"></span>
          <span class="header-title">聊天</span>
          <span class="msg-edit" @click="onMsgEditClick">{{ isMsgEdit ? '完成' : '编辑' }}</span>
        </div>
        <div v-if="isMsgEdit" class="msg-footer-bar">
          <span class="footer-btn" @click="selectAll">全选</span>
          <span class="footer-btn" @click="setAllRead">设为全部已读</span>
          <span class="footer-btn footer-btn-danger" @click="deleteSelected">删除</span>
        </div>
      </template>
      <template v-else-if="currentTab === 'contacts'">
        <div class="header-bar">
          <span></span>
          <span class="header-title">联系人</span>
          <span v-if="profileData.roles[0].name === 'ADMIN'" class="header-add" @click="showCreateGroupDialog = true">+</span>
        </div>
      </template>
    </div>
    <!-- 创建群聊弹窗 -->
    <div v-if="showCreateGroupDialog" class="modal-mask">
      <div class="modal-dialog">
        <div class="modal-title">创建群聊</div>
        <input class="modal-input" v-model="newGroupName" placeholder="请输入群聊名称" />
        <div class="modal-section-title">选择群成员</div>
        <div class="modal-contact-list">
          <label v-for="item in contacts" :key="item.id" class="modal-contact-item">
            <input type="checkbox" :value="item.id" v-model="selectedMemberIds" />
            <span>{{ item.username }}</span>
          </label>
        </div>
        <div class="modal-actions">
          <button @click="onConfirmCreateGroup" :disabled="!canCreateGroup">创建</button>
          <button @click="onCancelCreateGroup">取消</button>
        </div>
      </div>
    </div>
    <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    <div class="content">
      <MessagePage ref="messagePageRef" :active="currentTab === 'message'" v-show="currentTab === 'message'"
        :isEdit="isMsgEdit" :selectedIds="selectedIds" @refreshMessageList="refreshMessageList"
        @update:isEdit="syncMsgEdit" @update:selectedIds="val => selectedIds = val" />
      <ContactsPage ref="contactsPageRef" v-show="currentTab === 'contacts'" />
      <ProfilePage v-show="currentTab === 'profile'" />
    </div>
    <div class="tab-bar">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }"
        @click="switchTab(tab.key)">
        <div class="tab-icon">
          <img :src="tab.icon" alt="icon" />
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
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import MessagePage from '@/components/MessagePage.vue'
import ContactsPage from '@/components/ContactsPage.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import { useErrorToast } from '@/utils/toast.js'

// 创建群聊弹窗相关
const showCreateGroupDialog = ref(false)
const newGroupName = ref('')
const selectedMemberIds = ref([])
const canCreateGroup = computed(() => newGroupName.value.trim() && selectedMemberIds.value.length > 0)

const homeStore = useHomeStore()
const router = useRouter()
const route = useRoute()
const currentTab = ref('message')
const loading = ref(true)
const tabs = [
  { key: 'message', icon: './images/icon-moments.svg', text: '消息' },
  { key: 'contacts', icon: './images/icon-service.svg', text: '通讯录' },
  { key: 'profile', icon: './images/icon-profile.svg', text: '我' }
]
const { profileData, groupMessages: chatList, privateMessages: privateList, contacts } = storeToRefs(homeStore)
const { showToast, toastMsg, showErrorToast } = useErrorToast()
// 新增：ref获取子组件实例
const messagePageRef = ref()
const contactsPageRef = ref()
// 读取tab参数
const tabParam = route.query.tab
// 消息页编辑状态同步
const isMsgEdit = ref(false)
const selectedIds = ref([])

function onMsgEditClick() {
  if (messagePageRef.value && messagePageRef.value.toggleEdit) {
    // 兼容旧逻辑
    messagePageRef.value.toggleEdit()
  } else {
    isMsgEdit.value = !isMsgEdit.value
    if (!isMsgEdit.value) selectedIds.value = []
  }
}
function onMsgAddClick() {
  // 可实现新建群聊等功能
}
function syncMsgEdit(val) {
  isMsgEdit.value = val
  if (!val) selectedIds.value = []
}
function selectAll() {
  if (selectedIds.value.length === chatList.value.length + privateList.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = [
      ...chatList.value.map(item => 'group-' + item.groupId),
      ...privateList.value.map(item => 'private-' + item.user.id)
    ]
  }
}
function setAllRead() {
  chatList.value.forEach(item => homeStore.clearItemUnread('group', item.groupId))
  privateList.value.forEach(item => homeStore.clearItemUnread('private', item.user.id))
}
function deleteSelected() {
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
    console.log(e)
    alert('初始化失败，请重新登录')
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

async function onConfirmCreateGroup() {
  if (!canCreateGroup.value) return
  try {
    await homeStore.createGroup(newGroupName.value.trim(), selectedMemberIds.value)
    showCreateGroupDialog.value = false
    newGroupName.value = ''
    selectedMemberIds.value = []
  } catch (e) {
    showErrorToast('创建群聊失败: ' + (e?.message || '网络错误'))
  }
}
function onCancelCreateGroup() {
  showCreateGroupDialog.value = false
  newGroupName.value = ''
  selectedMemberIds.value = []
}
</script>

<style scoped>
@import '@/assets/css/style.css';
</style>
