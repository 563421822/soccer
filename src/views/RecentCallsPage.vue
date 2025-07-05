<template>
  <div class="recent-calls-page">
    <h2>最近通话</h2>
    <ul>
      <li v-for="call in calls" :key="call.id">{{ call.name }} - {{ call.time }}</li>
    </ul>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const calls = ref([
  {id:1, name:'张三', time:'昨天'},
  {id:2, name:'李四', time:'今天'}
])
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
ul { padding:0; }
li { list-style:none; padding:8px 0; border-bottom:1px solid #eee; }
</style>
