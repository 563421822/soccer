<template>
  <div class="profile-page">
    <div class="profile-header">
      <span class="profile-qricon" @click="showQr = true"></span>
      <span class="profile-edit" @click="goEditProfile">编辑</span>
      <div class="profile-avatar-area">
        <div class="profile-avatar-gradient">
          <span class="profile-avatar-text">{{ (profileData?.username || 'W').charAt(0).toUpperCase() }}</span>
        </div>
      </div>
      <div class="profile-nick">{{ profileData?.username || '昵称' }}</div>
      <div class="profile-id">{{ profileData?.usrSn || '账号' }}</div>
    </div>
    <transition name="slide-up">
      <div v-if="showQr" class="qr-modal-mask" @click.self="showQr = false">
        <div class="qr-modal">
          <span class="qr-close" @click="showQr = false">×</span>
          <div class="qr-bg">
            <div class="qr-avatar-gradient">
              <span class="qr-avatar-text">{{ (profileData?.username || 'W').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="qr-card">
              <qrcode-vue :value="profileData?.usrSn || 'wangyl'" :size="220" :level="'M'" :margin="2" :foreground="'#267efb'" />
              <div class="qr-username">{{ profileData?.usrSn || 'wangyl' }}</div>
            </div>
          </div>
          <button class="qr-share-btn">分享</button>
        </div>
      </div>
    </transition>
    <div class="profile-card-group">
      <div class="profile-card">
        <div class="profile-card-item" @click="goPage('/favorites')">
          <span class="icon icon-fav"></span>
          <span>收藏夹</span>
        </div>
        <div class="profile-card-item" @click="goPage('/recent-calls')">
          <span class="icon icon-call"></span>
          <span>最近通话</span>
        </div>
        <div class="profile-card-item" @click="goPage('/device-management')">
          <span class="icon icon-device"></span>
          <span>设备管理</span>
        </div>
        <div class="profile-card-item" @click="goPage('/chat-groups')">
          <span class="icon icon-group"></span>
          <span>对话分组</span>
        </div>
      </div>
      <div class="profile-card">
        <div class="profile-card-item" @click="goPage('/notifications-sound')">
          <span class="icon icon-bell"></span>
          <span>通知与声音</span>
        </div>
        <div class="profile-card-item" @click="goPage('/privacy-security')">
          <span class="icon icon-lock"></span>
          <span>隐私与安全</span>
          <span class="dot"></span>
        </div>
        <div class="profile-card-item" @click="goPage('/data-storage')">
          <span class="icon icon-db"></span>
          <span>数据与存储</span>
        </div>
        <div class="profile-card-item" @click="goPage('/appearance-settings')">
          <span class="icon icon-appearance"></span>
          <span>外观设置</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/store/home'

const homeStore = useHomeStore()
const profileData = computed(() => homeStore.profileData)
const router = useRouter()
const showQr = ref(false)

function goEditProfile() {
  router.push('/profile-edit')
}
function goPage(path) {
  router.push(path)
}
</script>
<style scoped>
.profile-qricon {
  position: absolute;
  left: 18px;
  top: 18px;
  width: 28px;
  height: 28px;
  background: url('/images/icon-scan.svg') no-repeat center/22px 22px, #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  z-index: 2;
}
.qr-modal-mask {
  position: fixed;
  left: 0; right: 0; bottom: 0; top: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.qr-modal {
  width: 100vw;
  max-width: 420px;
  background: transparent;
  border-radius: 18px 18px 0 0;
  padding-bottom: 24px;
  animation: qr-slide-up 0.28s cubic-bezier(.4,0,.2,1);
  position: relative;
}
.qr-close {
  position: absolute;
  right: 18px;
  top: 18px;
  font-size: 28px;
  color: #888;
  cursor: pointer;
  z-index: 2;
}
.qr-bg {
  background: url('/images/chat-bg-green.png') repeat;
  border-radius: 18px 18px 0 0;
  padding: 32px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qr-avatar-gradient {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7a6ff 0%, #a6d0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto -54px auto;
  box-shadow: 0 2px 12px rgba(166,208,255,0.18);
  z-index: 2;
}
.qr-avatar-text {
  font-size: 54px;
  color: #fff;
  font-weight: 600;
  user-select: none;
}
.qr-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 72px 24px 24px 24px;
  margin-top: -54px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qr-username {
  font-size: 22px;
  color: #222;
  font-weight: bold;
  margin-top: 18px;
  text-align: center;
}
.qr-share-btn {
  width: 90vw;
  max-width: 340px;
  margin: 24px auto 0 auto;
  background: #267efb;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 500;
  padding: 14px 0;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(38,126,251,0.08);
  display: block;
}
@keyframes qr-slide-up {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.28s cubic-bezier(.4,0,.2,1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to, .slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
/* 参考微信个人页UI */
.profile-page {
  background: #f7f7fa;
  overflow-y: auto;
}
.profile-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7f7fa;
  padding: 32px 0 18px 0;
}
.profile-edit {
  position: absolute;
  right: 18px;
  top: 18px;
  color: #267efb;
  font-size: 17px;
  cursor: pointer;
  z-index: 2;
}
.profile-avatar-area {
  margin-bottom: 12px;
}
.profile-avatar-gradient {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7a6ff 0%, #a6d0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(166,208,255,0.18);
}
.profile-avatar-text {
  font-size: 54px;
  color: #fff;
  font-weight: 600;
  user-select: none;
}
.profile-nick {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
  text-align: center;
}
.profile-id {
  font-size: 18px;
  color: #888;
  margin-bottom: 18px;
  text-align: center;
}
.profile-card-group {
  margin: 0 0 12px 0;
}
.profile-card {
  background: #fff;
  border-radius: 16px;
  margin: 0 12px 18px 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  padding: 0 0 0 0;
  overflow: hidden;
}
.profile-card-item {
  display: flex;
  align-items: center;
  padding: 0 18px;
  height: 54px;
  font-size: 18px;
  color: #222;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  background: #fff;
  position: relative;
  transition: background 0.2s;
}
.profile-card-item:last-child {
  border-bottom: none;
}
.profile-card-item:hover {
  background: #f5f5f7;
}
.icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-fav {
  background: #267efb url('/images/icon-favorite.svg') no-repeat center/18px 18px;
}
.icon-call {
  background: #27c16e url('/images/icon-phone.svg') no-repeat center/18px 18px;
}
.icon-device {
  background: #ffb300 url('/images/icon-service.svg') no-repeat center/18px 18px;
}
.icon-group {
  background: #4fc3f7 url('/images/icon-group.svg') no-repeat center/18px 18px;
}
.icon-bell {
  background: #ff5252 url('/images/icon-notification.svg') no-repeat center/18px 18px;
}
.icon-lock {
  background: #757575 url('/images/icon-lock.svg') no-repeat center/18px 18px;
}
.icon-db {
  background: #27c16e url('/images/icon-database.svg') no-repeat center/18px 18px;
}
.icon-appearance {
  background: #2196f3 url('/images/icon-appearance.svg') no-repeat center/18px 18px;
}
.dot {
  width: 10px;
  height: 10px;
  background: #ff3b30;
  border-radius: 50%;
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
