<template>
  <div class="appearance-settings-page">
    <h2>外观设置</h2>
    <div class="switch-row">
      <label>深色模式</label>
      <input type="checkbox" v-model="darkMode" />
    </div>
    <div class="switch-row">
      <label>大字体</label>
      <input type="checkbox" v-model="largeFont" />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const darkMode = ref(false)
const largeFont = ref(false)
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
.switch-row { display:flex; align-items:center; margin-bottom:16px; }
.switch-row label { flex:1; }
.switch-row input[type="checkbox"] { width:20px; height:20px; }
</style>
