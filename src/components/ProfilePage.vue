<template>
  <div class="profile-page">
    <div class="profile-header" @click="goEditProfile">
      <div class="profile-section">
        <div class="profile-avatar-wrap">
          <img :src="profileData?.avatar || './images/avatar.svg'" alt="头像" class="profile-avatar"/>
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
      <!-- <div class="profile-item"><img src="./images/icon-service.svg" class="item-icon" alt="服务">服务</div>
      <div class="profile-item"><img src="./images/icon-favorite.svg" class="item-icon" alt="收藏">收藏</div>
      <div class="profile-item"><img src="./images/icon-moments.svg" class="item-icon" alt="朋友圈">朋友圈</div>
      <div class="profile-item"><img src="./images/icon-wallet.svg" class="item-icon" alt="卡包">卡包</div> -->
      <div class="profile-item"><img src="/images/icon-settings.svg" class="item-icon" alt="设置">设置</div>
    </div>
  </div>
</template>
<script setup>
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import {useHomeStore} from '@/store/home'

const homeStore = useHomeStore()
const profileData = computed(() => homeStore.profileData)
const router = useRouter()

function goEditProfile() {
  router.push('/profile-edit')
}
</script>
<style scoped>
@import '@/assets/css/profile.css';
</style>

