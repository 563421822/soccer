<template>
  <div class="switch-line-page">
    <h2>切换线路</h2>
    <select v-model="line">
      <option value="A">线路A</option>
      <option value="B">线路B</option>
      <option value="C">线路C</option>
    </select>
    <div class="line-info">当前线路：{{ line }}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const line = ref('A')
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
select { width:100%; padding:8px; font-size:16px; border-radius:8px; border:1px solid #ddd; margin-bottom:16px; }
.line-info { text-align:center; color:#888; }
</style>
