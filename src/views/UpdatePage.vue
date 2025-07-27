<template>
  <div class="update-page">
    <span data-v-4fa6af25="" data-v-9f770d04="" class="back-btn" @click="goBack">&lt; 返回</span>
    <h2>版本更新</h2>
    <div class="version">当前版本：v4.85.0</div>
    <button @click="checkUpdate">检查更新</button>
    <div v-if="checked" class="success-msg">已是最新版本</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const checked = ref(false)
const router = useRouter()
function checkUpdate() {
  checked.value = true
  setTimeout(() => checked.value = false, 1500)
}
function goBack() {
  router.back()
}
</script>
<style scoped>
h2 {
  text-align: center;
  margin: 20px 0;
}

.version {
  text-align: center;
  color: #888;
  margin-bottom: 16px;
}

button {
  width: 100%;
  padding: 10px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
}

.success-msg {
  color: #52c41a;
  text-align: center;
  margin-top: 8px;
}

.update-page {
  padding: 60px 24px 24px 24px;
  width: 100vw;
}

.back-btn {
  position: absolute;
  left: 16px;
  top: 34px;
  color: #27c16e;
  font-size: 16px;
  cursor: pointer;
}
</style>
