<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo">爱聊球</div>
    </div>
    <div class="login-form">
      <div class="input-group">
        <input v-model="username" type="text" placeholder="账号" autofocus/>
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="密码"/>
      </div>
      <button class="login-button" @click="handleLogin" :disabled="isLoading">
        <span v-if="isLoading">登录中...</span>
        <span v-else>登录</span>
      </button>
      <div class="login-links">
        <RouterLink to="/register" class="register-link">注册账号</RouterLink>
        <a href="#" class="forgot-link">找回密码</a>
      </div>
      <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import {ref, nextTick} from 'vue'
import {useRouter} from 'vue-router'
import api from '@/api/config'
import { useErrorToast } from '@/utils/toast'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const router = useRouter()

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
    showErrorToast(`登录失败（${err.response?.status || '未知错误'}），请稍后重试: ${err.message} ${url}`)
  } finally {
    isLoading.value = false
  }
}
</script>
<style scoped>
@import '@/assets/css/login.css';
@import '@/assets/css/common.css';
</style>
