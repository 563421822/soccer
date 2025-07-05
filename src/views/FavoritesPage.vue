<template>
  <div class="favorites-page">
    <h2>收藏夹</h2>
    <ul>
      <li v-for="item in favorites" :key="item">收藏项 {{ item }}</li>
    </ul>
    <button @click="addFavorite">添加收藏</button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const favorites = ref([1,2,3])
function addFavorite() { favorites.value.push(favorites.value.length+1) }
</script>
<style scoped>
h2 { text-align:center; margin:20px 0; }
ul { padding:0 0 20px 0; }
li { list-style:none; padding:8px 0; border-bottom:1px solid #eee; }
button { width:100%; padding:10px; background:#409eff; color:#fff; border:none; border-radius:8px; font-size:16px; }
</style>
