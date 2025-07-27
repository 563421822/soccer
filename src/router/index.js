// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import HomePage from '@/views/HomePage.vue'
import ProfileEdit from '@/components/ProfileEdit.vue'
import ChatPage from "@/components/ChatPage.vue";
import FavoritesPage from '@/views/FavoritesPage.vue'
import RecentCallsPage from '@/views/RecentCallsPage.vue'
import DeviceManagementPage from '@/views/DeviceManagementPage.vue'
import ChatGroupsPage from '@/views/ChatGroupsPage.vue'
import NotificationsSoundPage from '@/views/NotificationsSoundPage.vue'
import PrivacySecurityPage from '@/views/PrivacySecurityPage.vue'
import DataStoragePage from '@/views/DataStoragePage.vue'
import AppearanceSettingsPage from '@/views/AppearanceSettingsPage.vue'
import SwitchLinePage from '@/views/SwitchLinePage.vue'
import FeedbackPage from '@/views/FeedbackPage.vue'
import UpdatePage from '@/views/UpdatePage.vue'

const routes = [
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/', component: HomePage },
    { path: '/profile-edit', component: ProfileEdit },
    { path: '/chat', component: ChatPage },
    { path: '/favorites', component: FavoritesPage },
    { path: '/recent-calls', component: RecentCallsPage },
    { path: '/device-management', component: DeviceManagementPage },
    { path: '/chat-groups', component: ChatGroupsPage },
    { path: '/notifications-sound', component: NotificationsSoundPage },
    { path: '/privacy-security', component: PrivacySecurityPage },
    { path: '/data-storage', component: DataStoragePage },
    { path: '/appearance-settings', component: AppearanceSettingsPage },
    { path: '/switch-line', component: SwitchLinePage },
    { path: '/feedback', component: FeedbackPage },
    { path: '/update', component: UpdatePage },
    { path: '/user-profile', component: () => import('@/views/UserProfilePage.vue') },
    { path: '/user-edit', component: () => import('@/views/UserProfileEditPage.vue') },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
