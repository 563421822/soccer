<template>
  <div class="profile-page">
    <div class="profile-header" @click="goEditProfile">
      <div class="profile-section">
        <div class="profile-avatar-wrap">
          <img :src="profileData?.avatar || './images/avatar.svg'" alt="头像" class="profile-avatar" />
        </div>
        <div class="profile-info-wrap">
          <div class="profile-name-row">
            <span class="profile-name">{{ profileData?.username || '' }}</span>
            <span class="profile-qr"></span>
          </div>
          <div class="profile-id-row">
            <span class="profile-id">账号: {{ profileData?.usrSn || '' }}</span>
            <span class="profile-arrow">&gt;</span>
          </div>
        </div>
      </div>
    </div>
    <div class="profile-list">
      <!-- <div class="profile-item" @click="goPage('/favorites')"><img src="/images/icon-moments.svg" class="item-icon" alt="收藏夹">收藏夹</div> -->
      <!-- <div class="profile-item" @click="goPage('/recent-calls')"><img src="/images/icon-moments.svg" class="item-icon" alt="最近通话">最近通话</div> -->
      <div class="profile-item" @click="goPage('/device-management')"><img src="/images/icon-moments.svg" class="item-icon" alt="设备管理">设备管理</div>
      <!-- <div class="profile-item" @click="goPage('/chat-groups')"><img src="/images/icon-moments.svg" class="item-icon" alt="对话分组">对话分组</div> -->
      <div class="profile-item"></div>
      <div class="profile-item" @click="goPage('/notifications-sound')"><img src="/images/icon-moments.svg" class="item-icon" alt="通知与声音">通知与声音</div>
      <!-- <div class="profile-item" @click="goPage('/privacy-security')"><img src="/images/icon-moments.svg" class="item-icon" alt="隐私与安全">隐私与安全</div> -->
      <div class="profile-item" @click="goPage('/data-storage')"><img src="/images/icon-moments.svg" class="item-icon" alt="数据与存储">数据与存储</div>
      <!-- <div class="profile-item" @click="goPage('/appearance-settings')"><img src="/images/icon-moments.svg" class="item-icon" alt="外观设置">外观设置</div> -->
      <!-- <div class="profile-item" @click="goPage('/switch-line')"><img src="/images/icon-moments.svg" class="item-icon" alt="切换线路">切换线路</div> -->
      <div class="profile-item"></div>
      <div class="profile-item" @click="goPage('/feedback')"><img src="/images/icon-moments.svg" class="item-icon" alt="意见反馈">意见反馈</div>
      <div class="profile-item" @click="goPage('/update')"><img src="/images/icon-moments.svg" class="item-icon" alt="版本更新">版本更新</div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/store/home'

const homeStore = useHomeStore()
const profileData = computed(() => homeStore.profileData)
const router = useRouter()

function goEditProfile() {
  router.push('/profile-edit')
}
function goPage(path) {
  router.push(path)
}
</script>
<style scoped>
@import '@/assets/css/profile.css';
</style>
