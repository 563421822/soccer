<template>
  <div class="register-container">
    <div class="register-header">
      <div class="back-button" @click="goBack">←</div>
      <div class="register-title">注册</div>
    </div>
    <div class="register-form">
      <div class="input-group">
        <input type="text" v-model="userSn" placeholder="账号" />
      </div>
      <div class="input-group">
        <input type="password" v-model="password" placeholder="密码" />
      </div>
      <div class="input-group">
        <input type="password" v-model="confirmPassword" placeholder="确认密码" />
      </div>
      <div class="input-group">
        <input type="text" v-model="inviteCode" placeholder="邀请码" />
      </div>
      <button class="register-button" @click="register" :disabled="isLoading">
        <span v-if="isLoading">注册中...</span>
        <span v-else>注册</span>
      </button>
      <div class="register-links">
        <router-link to="/login" class="login-link">已有账号？立即登录</router-link>
      </div>
      <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/config'
import { useErrorToast } from '@/utils/toast'


const router = useRouter()
const userSn = ref('')
const password = ref('')
const confirmPassword = ref('')
const inviteCode = ref('')
const isLoading = ref(false)

const { showToast, toastMsg, showErrorToast } = useErrorToast()

function goBack() {
  router.replace('/login')
}

async function register() {
  if (isLoading.value) return
  isLoading.value = true
  if (![userSn.value, password.value, confirmPassword.value, inviteCode.value].every(Boolean)) {
    showErrorToast('请填写所有必填项')
    return
  }
  if (!/^[a-zA-Z0-9]+$/.test(userSn.value)) {
    showErrorToast('账号只能包含字母和数字')
    return
  }
  if (userSn.value.length < 5) {
    showErrorToast('账号至少5位')
    return
  }
  if (password.value.length < 8) {
    showErrorToast('密码至少8位')
    return
  }
  if (password.value !== confirmPassword.value) {
    showErrorToast('两次输入的密码不一致')
    return
  }
  try {
    // 这里可以添加邀请码校验逻辑，如果需要
    const response = await api.post('/register', {
      usrSn: userSn.value,
      password: password.value,
      inviteCodeUsed: inviteCode.value
    })
    showErrorToast('注册成功')
    localStorage.setItem('token', response.data.token)
    setTimeout(() => {
      router.replace('/')
    }, 2000)
  } catch (err) {
    showErrorToast(`注册失败（${err.response?.status || '未知错误'}），${err.response.data}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/assets/css/register.css';
@import '@/assets/css/common.css';
</style>
