<template>
  <div class="user-profile-page">
    <div class="profile-header">
      <span class="back-btn" @click="goBack">&lt; 返回</span>
      <span class="edit-btn" @click="editProfile">编辑</span>
    </div>
    <div class="profile-avatar">
      <img :src="avatar" alt="头像" />
    </div>
    <div class="profile-qr-row">
      <span class="profile-name">{{ username }}</span>
    </div>
    <div class="profile-status">{{ onlineStatus }}</div>
    <div class="profile-actions">
      <button class="action-btn">
        <span class="icon icon-phone"></span>
        <span class="btn-label">语音通话</span>
      </button>
      <button class="action-btn">
        <span class="icon icon-video"></span>
        <span class="btn-label">视频通话</span>
      </button>
      <button class="action-btn">
        <span class="icon icon-mute"></span>
        <span class="btn-label">免打扰</span>
      </button>
      <button class="action-btn">
        <span class="icon icon-search"></span>
        <span class="btn-label">搜索</span>
      </button>
      <button class="action-btn">
        <span class="icon icon-more"></span>
        <span class="btn-label">更多</span>
      </button>
    </div>
    <div class="profile-info">
    <transition name="slide-up">
      <div
        v-if="showQr"
        class="qr-modal-mask"
        @click.self="showQr = false"
        @touchstart="onQrTouchStart"
        @touchmove="onQrTouchMove"
        @touchend="onQrTouchEnd"
      >
        <div
          class="qr-modal"
          :style="dragDeltaY ? `transform: translateY(${dragDeltaY}px)` : ''"
        >
          <span class="qr-close" @click="showQr = false">×</span>
          <div class="qr-bg">
            <div class="qr-avatar-gradient">
              <span class="qr-avatar-text">{{ username.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="qr-card">
              <qrcode-vue :value="userId || 'wangyl'" :size="220" :level="'M'" :margin="2" :foreground="'#267efb'" />
              <div class="qr-username">{{ userId || 'wangyl' }}</div>
            </div>
          </div>
          <button class="qr-share-btn">分享</button>
        </div>
      </div>
    </transition>
      <div class="info-label">用户名</div>
      <div class="info-value info-value-row" style="justify-content: space-between;">
        <span>{{ userId }}</span>
        <span class="profile-qricon" @click="showQr = true"></span>
      </div>
      <div class="info-divider"></div>
      <div class="info-label">个人简介</div>
      <div class="info-value">{{ bio }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const avatar = route.query.avatar || './images/avatar.svg'
const username = route.query.username || '用户昵称'
const userId = route.query.userId || '未知ID'
const bio = route.query.bio || '暂无简介'
const onlineStatus = route.query.onlineStatus || '4分钟前在线'
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
function goBack() {
  router.back()
}
function editProfile() {
  // 可跳转到编辑页
}
</script>

<style scoped>
.info-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.profile-qr-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}
.profile-qricon {
  width: 28px;
  height: 28px;
  background: url('/images/icon-scan.svg') no-repeat center/22px 22px, #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  display: inline-block;
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
.user-profile-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding: 0 0 40px 0;
}
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 42px 16px 12px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.back-btn, .edit-btn {
  color: #27c16e;
  font-size: 17px;
  cursor: pointer;
}
.profile-avatar {
  display: flex;
  justify-content: center;
  margin: 24px 0 12px 0;
}
.profile-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #eafaf1;
  object-fit: cover;
}
.profile-name {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #222;
  margin-bottom: 6px;
}
.profile-status {
  text-align: center;
  color: #b2b2b2;
  font-size: 15px;
  margin-bottom: 18px;
}
.profile-actions {
  display: flex;
  justify-content: space-around;
  margin-bottom: 18px;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
.action-btn {
  background: #fff;
  border: 1px solid #eafaf1;
  border-radius: 12px;
  padding: 10px 0 6px 0;
  color: #27c16e;
  font-size: 15px;
  cursor: pointer;
  width: 64px;
  height: 66px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(39,193,110,0.04);
  transition: box-shadow 0.2s;
}
.action-btn:active {
  box-shadow: 0 4px 16px rgba(39,193,110,0.10);
}
.icon {
  display: block;
  width: 28px;
  height: 28px;
  background-size: cover;
}
.icon-phone {
  background-image: url('/images/icon-phone.svg');
}
.icon-video {
  background-image: url('/images/icon-video.svg');
}
.icon-mute {
  background-image: url('/images/icon-moments.svg'); /* 可替换为免打扰图标 */
}
.icon-search {
  background-image: url('/images/icon-discover.svg');
}
.icon-more {
  background-image: url('/images/icon-settings.svg');
}
.btn-label {
  font-size: 13px;
  color: #27c16e;
  margin-top: 2px;
}
.profile-info {
  background: #fff;
  margin: 0 16px;
  border-radius: 12px;
  padding: 18px 16px;
  box-shadow: 0 2px 12px rgba(39,193,110,0.08);
}
.info-label {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
}
.info-value {
  color: #222;
  font-size: 16px;
  margin-bottom: 8px;
}

.info-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 0 6px 0;
  border-radius: 1px;
}
</style>