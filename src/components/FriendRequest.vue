<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- 顶部栏 -->
      <div class="navbar">
        <button class="back-button" @click="close">←</button>
        <h1>好友请求</h1>
      </div>
      <!-- 请求内容 -->
      <div class="friend-request-item" v-for="item in contacts" @click="goToUserProfile(item)">
        <img :src="item?.avatar || '/images/user.svg'" class="avatar" />
        <div class="info">
          <div class="name">{{ item.username }}</div>
          <div class="source">好友来源：{{ request.source }}</div>
        </div>
        <div class="status">{{ request.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useHomeStore } from '@/store/home'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const homeStore = useHomeStore()
const { contacts } = storeToRefs(homeStore)
const router = useRouter()
const emit = defineEmits(['close'])

const request = ref({
  source: '邀请码注册',
  status: '已添加',
})

function close() {
  emit('close')
}

function goToUserProfile(targetUser) {
  const avatar = targetUser?.avatar || './images/avatar.svg'
  const username = targetUser?.username || chatTitle.value
  const userId = targetUser?.usrSn || ''
  const bio = targetUser?.bio || ''
  const onlineStatus = '当前在线'
  router.push({
    path: '/user-profile',
    query: { avatar, username, userId, bio, onlineStatus }
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 80%;
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.navbar {
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.back-button {
  background: none;
  border: none;
  font-size: 20px;
  margin-right: 10px;
  cursor: pointer;
}

.friend-request-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.info {
  flex: 1;
}

.name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.source {
  font-size: 12px;
  color: #888;
}

.status {
  color: #999;
  font-size: 14px;
}
</style>
