<template>
  <div class="login-container">
    <div class="login-header">
      <div class="login-header-left">
        <div class="welcome">您好！<br>欢迎使用 爱聊球</div>
        <div class="version">版本 4.85.0</div>
        <div class="login-title">账号登录</div>
      </div>
      <div class="login-header-right">
      <img src="https://lqiuapp.com/static/liaoGeQiu/APP_icon.png" alt="LeTalk Logo" class="login-logo" />
      </div>
    </div>
    <div class="login-form">
      <input v-model="username" type="text" placeholder="请输入用户名" class="login-input" autofocus />
      <input v-model="password" type="password" placeholder="请输入密码" class="login-input" />
      <button class="login-btn" @click="handleLogin" :disabled="isLoading">
        <span v-if="isLoading">登录中...</span>
        <span v-else>登录</span>
      </button>
      <button class="register-btn" @click="openRegisterSheet">注册</button>
      <div class="forgot-row">
        <a href="#" class="forgot-link">忘记密码</a>
      </div>
      <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    </div>
    <div class="login-footer">
      <span class="footer-left">Language/语言</span>
      <span class="footer-right">安全通信</span>
    </div>
    <Transition name="slide-up">
      <RegisterSheet v-if="showRegisterSheet" @close="showRegisterSheet = false" />
    </Transition>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import api from '@/api/config'
import { useErrorToast } from '@/utils/toast'
import RegisterSheet from '@/components/RegisterSheet.vue'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const router = useRouter()
const showRegisterSheet = ref(false)

const { showToast, toastMsg, showErrorToast } = useErrorToast()

const handleLogin = async () => {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    showErrorToast('请输入账号和密码')
    return
  }
  isLoading.value = true

  try {
    const response = await api.post('/login', {
      usrSn: username.value,
      password: password.value
    })
    if (response.status === 200) {
      const data = response.data
      localStorage.setItem('token', data.token)
      await router.replace('/')
    } else {
      showErrorToast('账号或密码错误')
    }
  } catch (err) {
    const url = err.config?.baseURL + err.config?.url
    showErrorToast(`登录失败（${err.response?.status || '未知错误'}），${err.response.data}`)
  } finally {
    isLoading.value = false
  }
}
function openRegisterSheet() {
  showRegisterSheet.value = true
}
watch(showRegisterSheet, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>
<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #eafaf1 0%, #f8fcf9 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}
.login-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 40px;
  padding: 0 32px;
}
.login-header-left {
  flex: 1;
}
.welcome {
  font-size: 20px;
  color: #222;
  margin-bottom: 8px;
  font-weight: 500;
}
.version {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 16px;
}
.login-title {
  font-size: 18px;
  color: #27c16e;
  font-weight: 600;
  margin-bottom: 0;
}
.login-header-right {
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(39,193,110,0.08);
}
.login-form {
  width: 90%;
  max-width: 340px;
  margin: 32px auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.login-input {
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #f6f6f6;
  margin-bottom: 16px;
  padding: 0 16px;
  font-size: 16px;
  color: #222;
  outline: none;
}
.login-input::placeholder {
  color: #bbb;
}
.login-btn {
  height: 48px;
  background: #27c16e;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(39,193,110,0.08);
}
.login-btn:disabled {
  background: #a5e2c2;
  color: #fff;
}
.register-btn {
  height: 48px;
  background: #f6f6f6;
  color: #222;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}
.forgot-row {
  text-align: center;
  margin-bottom: 8px;
}
.forgot-link {
  color: #27c16e;
  font-size: 16px;
  text-decoration: none;
}
.toast {
  margin-top: 12px;
  color: #e74c3c;
  text-align: center;
  font-size: 15px;
}
.login-footer {
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px 16px 32px;
  color: #ccc;
  font-size: 15px;
}
.footer-left, .footer-right {
  opacity: 0.7;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.35s cubic-bezier(.4,0,.2,1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to, .slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
