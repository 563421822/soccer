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
      <div v-if="showQr" class="qr-modal-mask" @click.self="showQr = false" @touchstart="onQrTouchStart"
        @touchmove="onQrTouchMove" @touchend="onQrTouchEnd">
        <div class="qr-modal" :style="dragDeltaY ? `transform: translateY(${dragDeltaY}px)` : ''">
          <span class="qr-close" @click="showQr = false">×</span>
          <div class="qr-bg">
            <div class="qr-avatar-gradient">
              <span class="qr-avatar-text">{{ (profileData?.username || 'W').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="qr-card">
              <qrcode-vue :value="profileData?.usrSn || 'user'" :size="220" :level="'M'" :margin="2"
                :foreground="'#267efb'" />
              <div class="qr-username">{{ profileData?.usrSn || 'user' }}</div>
            </div>
          </div>
          <button class="qr-share-btn" @click="showQr = false">完成</button>
        </div>
      </div>
    </transition>
    <div class="profile-card-group">
      <div class="profile-card">
        <div class="profile-card-item" @click="goPage('/feedback')">
          <span class="icon icon-fav"></span>
          <span>意见反馈</span>
        </div>
        <div class="profile-card-item" @click="goPage('/update')">
          <span class="icon icon-call"></span>
          <span>版本更新</span>
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
const dragStartY = ref(0)
const dragDeltaY = ref(0)
const dragging = ref(false)

function onQrTouchStart(e) {
  dragging.value = true
  dragStartY.value = e.touches[0].clientY
  dragDeltaY.value = 0
}

function onQrTouchMove(e) {
  if (!dragging.value) return
  dragDeltaY.value = e.touches[0].clientY - dragStartY.value
  if (dragDeltaY.value < 0) dragDeltaY.value = 0
}

function onQrTouchEnd() {
  if (!dragging.value) return
  if (dragDeltaY.value > 50) {
    showQr.value = false
  }
  dragDeltaY.value = 0
  dragging.value = false
}

function goEditProfile() {
  router.push('/profile-edit')
}
function goPage(path) {
  router.push(path)
}
</script>
<style scoped>
/* 统一背景和圆角，与其它页面一致 */
.profile-page {
  background: #f7f7fa;
  min-height: 100vh;
  padding-bottom: 56px;
  /* tab-bar高度 */
  font-family: 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* 头像区更紧凑 */
.profile-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 60px 0 12px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #f2f2f2;
}

.profile-qricon {
  position: absolute;
  left: 16px;
  top: 34px;
  width: 26px;
  height: 26px;
  background: url('/images/icon-scan.svg') no-repeat center/18px 18px, #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  z-index: 2;
}

.profile-edit {
  position: absolute;
  right: 16px;
  top: 34px;
  color: #27c24c;
  font-size: 16px;
  cursor: pointer;
  z-index: 2;
}

.profile-avatar-area {
  margin-bottom: 8px;
}

.profile-avatar-gradient {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7a6ff 0%, #a6d0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(166, 208, 255, 0.12);
}

.profile-avatar-text {
  font-size: 38px;
  color: #fff;
  font-weight: 600;
  user-select: none;
}

.profile-nick {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
  text-align: center;
}

.profile-id {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
  text-align: center;
}

/* 卡片区统一圆角和阴影 */
.profile-card-group {
  margin: 0 0 12px 0;
}

.profile-card {
  background: #fff;
  border-radius: 12px;
  margin: 0 10px 12px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 0;
  overflow: hidden;
}

.profile-card-item {
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 44px;
  font-size: 15px;
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
  width: 24px;
  height: 24px;
  border-radius: 8px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-fav {
  background: #267efb url('/images/icon-favorite.svg') no-repeat center/14px 14px;
}

.icon-call {
  background: #e2e5e4 url('/images/icon-settings.svg') no-repeat center/14px 14px;
}

.icon-device {
  background: #ffb300 url('/images/icon-service.svg') no-repeat center/14px 14px;
}

.icon-group {
  background: #4fc3f7 url('/images/icon-group.svg') no-repeat center/14px 14px;
}

.icon-bell {
  background: #ff5252 url('/images/icon-notification.svg') no-repeat center/14px 14px;
}

.icon-lock {
  background: #757575 url('/images/icon-lock.svg') no-repeat center/14px 14px;
}

.icon-db {
  background: #27c16e url('/images/icon-database.svg') no-repeat center/14px 14px;
}

.icon-appearance {
  background: #2196f3 url('/images/icon-appearance.svg') no-repeat center/14px 14px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #ff3b30;
  border-radius: 50%;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}

/* 二维码弹窗与其它弹窗风格统一 */
.qr-modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.12);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.qr-modal {
  width: 100vw;
  max-width: 380px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding-bottom: 18px;
  animation: qr-slide-up 0.28s cubic-bezier(.4, 0, .2, 1);
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.qr-close {
  position: absolute;
  right: 14px;
  top: 14px;
  font-size: 22px;
  color: #888;
  cursor: pointer;
  z-index: 2;
}

.qr-bg {
  background: url('/images/chat-bg-green.png') repeat;
  border-radius: 16px 16px 0 0;
  padding: 22px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-avatar-gradient {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7a6ff 0%, #a6d0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto -35px auto;
  box-shadow: 0 2px 8px rgba(166, 208, 255, 0.12);
  z-index: 2;
}

.qr-avatar-text {
  font-size: 32px;
  color: #fff;
  font-weight: 600;
  user-select: none;
}

.qr-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 44px 16px 16px 16px;
  margin-top: -35px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-username {
  font-size: 14px;
  color: #222;
  font-weight: bold;
  margin-top: 12px;
  text-align: center;
}

.qr-share-btn {
  width: 80vw;
  max-width: 260px;
  margin: 18px auto 0 auto;
  background: #267efb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 0;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(38, 126, 251, 0.08);
  display: block;
}

@keyframes qr-slide-up {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(0);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.28s cubic-bezier(.4, 0, .2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
