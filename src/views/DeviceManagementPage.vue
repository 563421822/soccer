<template>
  <div class="device-management-page">
    <h2>设备管理</h2>
    <div class="switch-row">
      <label>允许新设备登录</label>
      <input type="checkbox" v-model="allowNewDevice" />
    </div>
    <ul>
      <li>iPhone 15 Pro</li>
      <li>Windows 11 PC</li>
    </ul>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const allowNewDevice = ref(true)
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
.switch-row { display:flex; align-items:center; margin-bottom:16px; }
.switch-row label { flex:1; }
.switch-row input[type="checkbox"] { width:20px; height:20px; }
ul { padding:0; }
li { list-style:none; padding:8px 0; border-bottom:1px solid #eee; }
</style>
