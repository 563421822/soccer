<template>
  <div class="profile-edit-page">
    <div class="edit-bar">
      <span class="edit-cancel" @click="goBack">取消</span>
      <span class="edit-done" @click="saveEdit">完成</span>
    </div>
    <div class="edit-avatar-area">
      <div class="edit-avatar-gradient">
        <span class="edit-avatar-text">{{ (profileData?.username || 'W').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="edit-avatar-btn">设置头像</div>
    </div>
    <div class="edit-form-card">
      <div class="edit-form-row">
        <span class="edit-form-label">用户名</span>
        <input class="edit-form-input" type="text" v-model="username" readonly />
      </div>
      <div class="edit-form-row">
        <span class="edit-form-label">昵称</span>
        <input class="edit-form-input" type="text" v-model="nickname" />
      </div>
    </div>
    <textarea class="edit-bio" v-model="bio" placeholder="个人简介" rows="2"></textarea>
    <div class="edit-logout-btn" @click="logout">退出当前账号</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/store/home'

const homeStore = useHomeStore()
const profileData = computed(() => homeStore.profileData)
const username = ref(profileData.value?.usrSn || '')
const nickname = ref(profileData.value?.username || '')
const bio = ref(profileData.value?.bio || '')
const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace({ path: '/', query: { tab: 'profile' } });
  }
}

function saveEdit() {
  // 保存逻辑，实际业务可根据需要调整
  // homeStore.updateProfile({ username: nickname.value, usrSn: username.value, bio: bio.value })
  goBack()
}

function logout() {
  localStorage.clear()
  homeStore.reset()
  router.replace('/login')
}
</script>

<style scoped>
/* 微信风格个人资料编辑页 */
.profile-edit-page {
  background: #f6f6fa;
  min-height: 100vh;
  padding-bottom: 24px;
}
.edit-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 42px 18px 18px;
  height: 48px;
  background: #f6f6fa;
  font-size: 16px;
  font-weight: 500;
  position: relative;
}
.edit-cancel,.edit-done {
  color: #27c16e;
  font-size: 16px;
  cursor: pointer;
}
.edit-avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 18px 0 18px 0;
}
.edit-avatar-gradient {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7a6ff 0%, #a6d0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 2px 12px rgba(166,208,255,0.18);
}
.edit-avatar-text {
  font-size: 54px;
  color: #fff;
  font-weight: 600;
  user-select: none;
}
.edit-avatar-btn {
  color: #267efb;
  font-size: 16px;
  margin-bottom: 2px;
  cursor: pointer;
}
.edit-form-card {
  background: #fff;
  border-radius: 12px;
  margin: 0 16px 18px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  padding: 0;
  overflow: hidden;
}
.edit-form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f2f2f2;
  height: 52px;
  padding: 0 16px;
  font-size: 17px;
  background: #fff;
}
.edit-form-row:last-child {
  border-bottom: none;
}
.edit-form-label {
  color: #222;
  width: 80px;
  flex-shrink: 0;
}
.edit-form-input {
  border: none;
  background: transparent;
  font-size: 17px;
  color: #222;
  flex: 1;
  outline: none;
  text-align: right;
}
.edit-bio {
  width: calc(100% - 32px);
  margin: 16px 16px 0 16px;
  border: none;
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
  color: #222;
  padding: 12px 14px;
  min-height: 48px;
  resize: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}
.edit-logout-btn {
  margin: 32px 16px 0 16px;
  background: #fff;
  color: #ff3b30;
  border-radius: 12px;
  font-size: 18px;
  text-align: center;
  padding: 14px 0;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}
</style>

