import {defineStore} from 'pinia'
import api from '@/api/config'

export const useHomeStore = defineStore('home', {
    state: () => ({
        initialized: false,
        loading: false,
        groupMessages: [],
        privateMessages: [],
        groups: [],
        contacts: [],
        profileData: null,
        unreadCount: 0, // 新增未读消息数
    }),
    actions: {
        async initialize() {
            if (this.initialized) return
            this.loading = true
            try {
                const res = await api.get('/home/initialize')
                this.groupMessages = res.data[0]?.groupMessages || []
                this.privateMessages = res.data[0]?.privateMessages || []
                this.groups = res.data[1]?.groups || []
                this.contacts = res.data[1]?.contacts || []
                this.profileData = res.data[2] || null
                this.initialized = true
            } finally {
                this.loading = false
            }
        },
        incrementUnread() {
            this.unreadCount++
        },
        incrementUnreadByMsg(msg, isActiveChatPage = false) {
            if (msg.type === 'group') {
                let found = this.groupMessages.find(item => item.groupId === msg.to)
                if (found) {
                    found.sendTime = msg.sendTime
                    found.content = msg.content
                    if (!isActiveChatPage) {
                        found.unreadCount = (found.unreadCount || 0) + 1
                    }
                } else {
                    // 新建会话项，简化处理
                    this.groupMessages.unshift({
                        groupId: msg.to,
                        groupChat: {name: msg.groupName || '群聊'},
                        content: msg.content,
                        sendTime: msg.sendTime,
                        unreadCount: isActiveChatPage ? 0 : 1,
                        id: Date.now() + Math.random()
                    })
                }
            } else if (msg.type === 'private') {
                let found = this.privateMessages.find(item => {
                    return item.user && item.user.id === parseInt(msg.receiverId)
                })
                if (found) {
                    if (!isActiveChatPage) {
                        found.unreadCount = (found.unreadCount || 0) + 1
                    }
                    found.sendTime = msg.sendTime
                    found.content = msg.content
                } else {
                    this.privateMessages.unshift({
                        user: {id: parseInt(msg.receiverId), username: msg.username},
                        receiverId: parseInt(msg.receiverId),
                        content: msg.content,
                        sendTime: msg.sendTime,
                        unreadCount: isActiveChatPage ? 0 : 1,
                        id: Date.now() + Math.random()
                    })
                }
            }
            if (!isActiveChatPage) {
                this.unreadCount++
            }
        },
        resetUnread() {
            this.unreadCount = 0
        },
        clearItemUnread(type, id) {
            if (type === 'group') {
                let found = this.groupMessages.find(item => item.groupId === id)
                if (found && found.unreadCount) {
                    this.unreadCount -= found.unreadCount
                    if (this.unreadCount < 0) this.unreadCount = 0
                    found.unreadCount = 0
                }
            } else if (type === 'private') {
                let found = this.privateMessages.find(item => {
                    // 用 user.id 匹配
                    return item.user && item.user.id == id
                })
                if (found && found.unreadCount) {
                    this.unreadCount -= found.unreadCount
                    if (this.unreadCount < 0) this.unreadCount = 0
                    found.unreadCount = 0
                }
            }
        },
        reset() {
            this.initialized = false
            this.groupMessages = []
            this.privateMessages = []
            this.groups = []
            this.contacts = []
            this.unreadCount = 0
            this.profileData = null
        }
    }
})

