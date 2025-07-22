<template>
  <div class="container">
    <div class="page-header" v-if="currentTab !== 'profile'">
      <template v-if="currentTab === 'message'">
        <div class="header-bar">
          <span class="msg-edit" @click="onMsgEditClick">{{ isMsgEdit ? '完成' : '编辑' }}</span>
          <span class="header-title">聊天</span>
          <span class="msg-add" @click="onMsgAddClick">+</span>
        </div>
        <!-- footer bar 仅在消息页编辑时显示 -->
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
          <span class="header-add" @click="showCreateGroupDialog = true">+</span>
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
    <div class="loading-mask" :class="{ active: loading }">
      <div class="loading-spinner"></div>
    </div>
    <div class="content">
      <MessagePage
        ref="messagePageRef"
        :active="currentTab === 'message'"
        v-show="currentTab === 'message'"
        :isEdit="isMsgEdit"
        :selectedIds="selectedIds"
        @refreshMessageList="refreshMessageList"
        @update:isEdit="syncMsgEdit"
        @update:selectedIds="val => selectedIds = val"
      />
      <ContactsPage ref="contactsPageRef" v-show="currentTab === 'contacts'" />
      <DiscoverPage v-show="currentTab === 'discover'" />
      <ProfilePage v-show="currentTab === 'profile'" />
    </div>
    <div class="tab-bar">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }"
        @click="switchTab(tab.key)">
        <div class="tab-icon" style="position:relative;">
          <img :src="tab.icon" alt="icon" />
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
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import MessagePage from '@/components/MessagePage.vue'
import ContactsPage from '@/components/ContactsPage.vue'
import DiscoverPage from '@/components/DiscoverPage.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import { useErrorToast } from '@/utils/toast.js'

const router = useRouter()
const route = useRoute()
const currentTab = ref('message')
const loading = ref(true)
const tabs = [
  { key: 'message', icon: './images/icon-moments.svg', text: '消息' },
  { key: 'contacts', icon: './images/icon-service.svg', text: '通讯录' },
  // {key: 'discover', icon: './images/icon-discover.svg', text: '发现'},
  { key: 'profile', icon: './images/icon-profile.svg', text: '我' }
]

const homeStore = useHomeStore()
const { groupMessages: chatList, privateMessages: privateList, contacts } = storeToRefs(homeStore)
const { showToast, toastMsg, showErrorToast } = useErrorToast()

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

// 创建群聊弹窗相关
const showCreateGroupDialog = ref(false)
const newGroupName = ref('')
const selectedMemberIds = ref([])
const canCreateGroup = computed(() => newGroupName.value.trim() && selectedMemberIds.value.length > 0)

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

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 16px;
  /* 左右内边距 */
  height: 48px;
}

.msg-edit {
  color: #27c24c;
  font-size: 17px;
  font-weight: normal;
  cursor: pointer;
  text-align: left;
  margin-right: 8px;
  /* 与header-title间距 */
}

.header-title {
  font-size: 19px;
  font-weight: bold;
  color: rgb(34, 34, 34);
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
  width: 120px;
  /* 可根据实际内容调整 */
  pointer-events: none;
  /* 避免遮挡点击 */
}

.msg-add,
.header-add {
  color: #27c24c;
  font-size: 28px;
  font-weight: normal;
  cursor: pointer;
  width: 32px;
  text-align: right;
  margin-left: 8px;
  display: flex;
  justify-content: flex-end;
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

/* 群聊弹窗样式 */
.modal-mask {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-dialog {
  background: #fff;
  border-radius: 8px;
  padding: 24px 20px 16px 20px;
  min-width: 320px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.modal-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}
.modal-input {
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
.modal-section-title {
  font-size: 16px;
  margin-bottom: 8px;
}
.modal-contact-list {
  max-height: 160px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  background: #fafbfc;
}
.modal-contact-item {
  display: flex;
  margin-bottom: 6px;
  font-size: 16px;
  cursor: pointer;
  gap: 6px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-actions button {
  padding: 5px 16px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
.modal-actions button[disabled] {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}
.modal-actions button:not([disabled]) {
  background: #409eff;
  color: #fff;
}
.toast {
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
}
</style>
