<template>
  <div class="data-storage-page">
    <h2>数据与存储</h2>
    <div class="storage-info">已用空间：120MB / 1GB</div>
    <button @click="clearData">清理缓存</button>
    <div v-if="cleared" class="success-msg">缓存已清理</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const cleared = ref(false)
function clearData() {
  cleared.value = true
  setTimeout(() => cleared.value = false, 1500)
}
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
.storage-info { margin:16px 0; text-align:center; color:#888; }
button { width:100%; padding:10px; background:#409eff; color:#fff; border:none; border-radius:8px; font-size:16px; }
.success-msg { color:#52c41a; text-align:center; margin-top:8px; }
</style>
