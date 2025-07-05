<template>
  <div class="notifications-sound-page">
    <h2>通知与声音</h2>
    <div class="switch-row">
      <label>消息通知</label>
      <input type="checkbox" v-model="msgNotify" />
    </div>
    <div class="switch-row">
      <label>声音提醒</label>
      <input type="checkbox" v-model="sound" />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const msgNotify = ref(true)
const sound = ref(true)
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
.switch-row { display:flex; align-items:center; margin-bottom:16px; }
.switch-row label { flex:1; }
.switch-row input[type="checkbox"] { width:20px; height:20px; }
</style>
