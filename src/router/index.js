// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import HomePage from '@/views/HomePage.vue'
import ProfileEdit from '@/components/ProfileEdit.vue'
import ChatPage from "@/components/ChatPage.vue";

const routes = [
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/', component: HomePage },
    { path: '/profile-edit', component: ProfileEdit },
    {path: '/chat', component: ChatPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
