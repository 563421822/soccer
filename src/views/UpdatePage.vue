<template>
  <div class="update-page">
    <h2>版本更新</h2>
    <div class="version">当前版本：v1.0.0</div>
    <button @click="checkUpdate">检查更新</button>
    <div v-if="checked" class="success-msg">已是最新版本</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const checked = ref(false)
function checkUpdate() {
  checked.value = true
  setTimeout(() => checked.value = false, 1500)
}
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
.version { text-align:center; color:#888; margin-bottom:16px; }
button { width:100%; padding:10px; background:#409eff; color:#fff; border:none; border-radius:8px; font-size:16px; }
.success-msg { color:#52c41a; text-align:center; margin-top:8px; }
</style>
