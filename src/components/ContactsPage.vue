<template>
  <div class="contacts-page">
    <div class="search-box">
      <div class="search-input">
        <input type="text" v-model="searchText" placeholder="搜索" />
      </div>
      <button class="create-group-btn" @click="showCreateGroupDialog = true">+ 群聊</button>
    </div>
    <div class="contact-list" ref="contactListRef">
      <template v-if="filteredGroups.length">
        <div class="list-section-title">群组</div>
        <div v-for="item in filteredGroups" :key="'group-' + item.id" class="contact-item group-item"
          @click="openChat('group', item.id, item.name)">
          <div class="avatar">{{ item.name.charAt(0) }}</div>
          <div class="contact-name">{{ item.name }}</div>
        </div>
      </template>
      <template v-if="filteredContacts.length">
        <div class="list-section-title">联系人</div>
        <div v-for="item in filteredContacts" :key="'contact-' + item.id" class="contact-item"
          @click="openChat('private', item.id, item.username)">
          <div class="avatar">{{ item.username.charAt(0) }}</div>
          <div class="contact-name">{{ item.username }}</div>
        </div>
      </template>
      <div v-if="!filteredGroups.length && !filteredContacts.length" class="empty-tip">无匹配结果</div>
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
  </div>
</template>
<script setup>
import { ref, computed, defineExpose, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/store/home'
import { useRouter } from "vue-router";

const searchText = ref('')
const homeStore = useHomeStore()
const { groups, contacts } = storeToRefs(homeStore)
import { useErrorToast } from '@/utils/toast.js'
const { showToast, toastMsg, showErrorToast } = useErrorToast()


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
  homeStore.resetUnread() // 进入聊天时清零未读数
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

defineExpose({ saveScroll, restoreScroll })
</script>
<style scoped>
@import '@/assets/css/contacts.css';
@import '@/assets/css/common.css';
</style>
