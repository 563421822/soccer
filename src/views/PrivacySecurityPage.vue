<template>
  <div class="privacy-security-page">
    <h2>隐私与安全</h2>
    <div class="switch-row">
      <label>允许加我为好友</label>
      <input type="checkbox" v-model="allowAdd" />
    </div>
    <div class="switch-row">
      <label>显示在线状态</label>
      <input type="checkbox" v-model="showOnline" />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const allowAdd = ref(true)
const showOnline = ref(false)
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
.switch-row { display:flex; align-items:center; margin-bottom:16px; }
.switch-row label { flex:1; }
.switch-row input[type="checkbox"] { width:20px; height:20px; }
</style>
