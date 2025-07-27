<template>
    <div class="user-info-page">
      <div class="header">
        <span class="back-btn" @click="goBack">&lt;&nbsp;返回</span>
        <span class="title">更多</span>
        <span class="done-btn" @click="onDone">完成</span>
      </div>
  
      <div class="form">
        <input v-model="note" class="note-input" placeholder="请输入备注" />
  
        <div class="info-box">
          <div class="info-item">
            <span class="label">昵称</span>
            <span class="value">{{ nickname }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ username }}</span>
          </div>
          <div class="info-item">
            <span class="label">来源</span>
            <span class="value gray">邀请码注册</span>
          </div>
        </div>
        <button v-if="profileData.roles[0].name == 'USER'" class="delete-btn" @click="onDelete">删除好友</button>
      </div>
    </div>
  </template>
  
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHomeStore } from '@/store/home'
import { storeToRefs } from 'pinia'

const homeStore = useHomeStore()
const { profileData} = storeToRefs(homeStore)
const router = useRouter()
const route = useRoute()

const note = ref('')
const nickname = ref(route.query.username)
const username = ref(route.query.userId)

function goBack() {
  router.back()
}

function onDone() {
  // 保存备注逻辑
  goBack()
}

function onDelete() {
  if (confirm('确定要删除该好友吗？')) {
    alert('好友已删除')
    // 执行删除逻辑
  }
}
  </script>
  
  <style scoped>
  .user-info-page {
    background: #f5f5f5;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 42px 16px 12px;
    font-size: 17px;
    font-weight: 500;
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .back-btn,
  .done-btn {
    color: #27c16e;
    font-size: 16px;
    cursor: pointer;
  }
  
  .title {
    font-weight: bold;
    font-size: 17px;
    text-align: center;
    flex: 1;
  }
  
  .form {
    padding: 0 16px;
    margin-top: 16px;
  }
  
  .note-input {
    width: 100%;
    height: 44px;
    padding: 0 12px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 16px;
    background: #fff;
  }
  
  .info-box {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #eee;
    font-size: 16px;
  }
  
  .info-item:last-child {
    border-bottom: none;
  }
  
  .label {
    color: #333;
  }
  
  .value {
    color: #111;
  }
  
  .value.gray {
    color: #888;
  }
  
  .delete-btn {
    width: 100%;
    background: #fff;
    color: #ff3b30;
    font-size: 17px;
    padding: 14px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
  </style>
  