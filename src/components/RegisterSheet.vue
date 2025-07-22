<template>
  <div class="register-sheet-mask" @click.self="close">
    <div class="register-sheet" ref="sheetRef">
      <div class="register-header">
        <div class="back-row">
          <span class="back" @click="close">&lt; 返回</span>
        </div>
        <div class="title">欢迎注册</div>
        <div class="subtitle">极速注册，畅享聊天</div>
      </div>
      <form class="register-form" @submit.prevent="submit">
        <div class="form-group">
          <label>邀请码</label>
          <input v-model="inviteCode" type="text" placeholder="请输入邀请码" />
        </div>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="5-20位，字母开头，支持字母/数字/下划线" />
        </div>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="nickname" type="text" placeholder="不超过50个字符（选填）" />
        </div>
        <div class="form-group">
          <label>密码 <span class="tip">?</span></label>
          <input v-model="password" type="password" placeholder="8-20位字母、数字或符号组合" />
        </div>
        <div class="form-group">
          <label>确认密码 <span class="tip">?</span></label>
          <input v-model="confirmPassword" type="password" placeholder="8-20位字母、数字或符号组合" />
        </div>
        <button class="register-btn" type="submit">注册</button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const inviteCode = ref('')
const username = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')

let startY = 0
let deltaY = 0
let dragging = false
const sheetRef = ref()

function close() { emit('close') }
function submit() {
  // 可补充注册逻辑
  close()
}
function onTouchStart(e) {
  if (e.touches.length === 1) {
    startY = e.touches[0].clientY
    dragging = false
    deltaY = 0
    // 只有在内容滚动到顶部时才允许拖拽
    if (sheetRef.value.scrollTop === 0) {
      dragging = true
    }
  }
}
function onTouchMove(e) {
  if (!dragging) return
  deltaY = e.touches[0].clientY - startY
  if (deltaY > 0) {
    sheetRef.value.style.transform = `translateY(${deltaY}px)`
    e.stopPropagation()
    e.preventDefault()
  }
}
function onTouchEnd() {
  dragging = false
  if (deltaY > 80) {
    close()
  } else {
    sheetRef.value.style.transform = ''
  }
}
onMounted(() => {
  const el = sheetRef.value
  el.addEventListener('touchstart', onTouchStart)
  el.addEventListener('touchmove', onTouchMove)
  el.addEventListener('touchend', onTouchEnd)
})
onBeforeUnmount(() => {
  const el = sheetRef.value
  if (!el) return
  el.removeEventListener('touchstart', onTouchStart)
  el.removeEventListener('touchmove', onTouchMove)
  el.removeEventListener('touchend', onTouchEnd)
})
</script>
<style scoped>
.register-sheet-mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.register-sheet {
  width: 100%;
  max-width: 480px;
  background: #f7f7f7;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.08);
  padding: 32px 24px 24px 24px;
  margin-top: 48px;
  animation: slide-up 0.35s cubic-bezier(.4,0,.2,1);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.register-header {
  margin-bottom: 24px;
}
.back-row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.back {
  color: #27c16e;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  background: transparent;
  z-index: 2;
}
.title {
  font-size: 28px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
  text-align: center;
  margin-left: 0;
}
.subtitle {
  font-size: 16px;
  color: #888;
  margin-bottom: 16px;
  text-align: center;
  margin-left: 0;
}
.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-group label {
  font-size: 16px;
  color: #222;
  margin-bottom: 4px;
  display: block;
}
.form-group input {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
  padding: 0 12px;
  margin-top: 4px;
  box-sizing: border-box;
}
.tip {
  color: #bbb;
  font-size: 14px;
  margin-left: 4px;
}
.register-btn {
  width: 100%;
  height: 48px;
  background: #27c16e;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  margin-top: 18px;
}
</style>
