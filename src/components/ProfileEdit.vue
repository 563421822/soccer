<template>
  <div class="profile-edit-page">
    <div class="profile-edit-header">
      <span class="back-btn" @click="goBack">←</span>
      <span class="edit-title">个人资料</span>
    </div>
    <div class="profile-edit-content">
      <div class="edit-item">
        <span class="edit-label">头像</span>
        <img :src="profileData?.avatar || '/images/avatar.svg'" class="edit-avatar" alt="头像"/>
      </div>
      <div class="edit-item">
        <span class="edit-label">昵称</span>
        <input class="edit-input" type="text" v-model="nickname"/>
      </div>
      <div class="edit-item">
        <span class="edit-label">账号</span>
        <span class="edit-value">{{ profileData?.usrSn || '' }}</span>
      </div>
      <div class="edit-item">
        <span class="edit-label">邮箱</span>
        <input class="edit-input" type="text" :value="profileData?.email || ''"/>
      </div>
    </div>
    <div class="edit-logout-btn" @click="logout">退出登录</div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useHomeStore} from '@/store/home'

const homeStore = useHomeStore()
const profileData = computed(() => homeStore.profileData)
const nickname = ref(profileData.value?.username || '')
const router = useRouter()

function goBack() {
  // 返回上一页，如果上一页是首页，则切回“我”tab
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace({ path: '/', query: { tab: 'profile' } });
  }
}

function logout() {
  localStorage.clear()
  homeStore.reset()
  router.replace('/login')
}
</script>

<style scoped>
@import '@/assets/css/profile-edit.css';
</style>

