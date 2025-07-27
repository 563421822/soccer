<template>
  <div class="feedback-page">
    <span data-v-9f770d04="" class="back-btn" @click="goBack">&lt; 返回</span>
    <h2>意见反馈</h2>
    <div class="switch-row">
      <label for="anon-switch">允许匿名反馈</label>
      <input id="anon-switch" type="checkbox" v-model="anonymous" />
    </div>
    <textarea v-model="content" placeholder="请输入您的宝贵意见..." rows="5"></textarea>
    <button class="submit-btn" @click="submitFeedback">提交反馈</button>
    <div v-if="submitted" class="success-msg">感谢您的反馈！</div>
    <div v-if="showToast" class="toast">{{ toastMsg }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorToast } from "@/utils/toast.js"
const { showToast, toastMsg, showErrorToast } = useErrorToast()
const anonymous = ref(false)
const content = ref('')
const submitted = ref(false)
const router = useRouter()
function submitFeedback() {
  if (!content.value) return showErrorToast('请输入反馈内容')
  // 这里可接入后端API
  submitted.value = true
  setTimeout(() => { submitted.value = false; content.value = '' }, 2000)
}
function goBack() {
  router.back()
}
</script>
<style scoped>
.feedback-page {
  padding: 60px 24px 24px 24px;
  width: 100vw;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
}

.switch-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.switch-row label {
  flex: 1;
}

.switch-row input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 16px;
  resize: none;
}

.submit-btn {
  width: 100%;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 18px;
  margin-bottom: 12px;
}

.success-msg {
  color: #52c41a;
  text-align: center;
  margin-top: 8px;
}

.back-btn {
  position: absolute;
  left: 16px;
  top: 34px;
  color: #27c16e;
  font-size: 16px;
  cursor: pointer;
}

.toast {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    min-width: 120px;
    max-width: 80vw;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    border-radius: 10px;
    padding: 14px 24px;
    text-align: center;
    font-size: 16px;
    z-index: 9999;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    pointer-events: none;
    animation: toast-fade-in 0.2s;
}

</style>
