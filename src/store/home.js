import { defineStore } from 'pinia'
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
                console.info("1. 收到群聊消息")
                console.info(this.groupMessages)
                console.info(msg)
                let found = this.groupMessages.find(item => {
                    return item.groupId === parseInt(msg.groupChat.groupId)
                })
                if (found) {
                    console.info("2. 找到群聊消息，更新内容")
                    found.sendTime = msg.sendTime
                    found.content = msg.content
                    if (!isActiveChatPage) {
                        found.unreadCount = (found.unreadCount || 0) + 1
                    }
                } else {
                    console.info("2. 未找到群聊消息，创建新消息")
                    console.info(msg)
                    this.groupMessages.unshift({
                        groupId: parseInt(msg.groupId),
                        groupChat: { name: msg.groupChat.name, groupId: parseInt(msg.groupId)},
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
                    console.info("找到私聊消息，更新内容")
                    if (!isActiveChatPage) {
                        found.unreadCount = (found.unreadCount || 0) + 1
                    }
                    found.sendTime = msg.sendTime
                    found.content = msg.content
                } else {
                    console.info("未找到私聊消息，创建新消息")
                    this.privateMessages.unshift({
                        user: { id: parseInt(msg.receiverId), username: msg.user.username, avarar: msg.user.avatar },
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
        },
        // 新增：创建群聊（带后端API）
        async createGroup(name, memberIds) {
            try {
                const myId = this.profileData?.id
                const res = await api.post('/group/create', {
                    name,
                    memberIds: myId ? [myId, ...memberIds] : memberIds
                })
                if (res.data && res.data.id) {
                    this.groups.unshift(res.data)
                } else {
                    const newGroup = {
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        name,
                        memberIds: myId ? [myId, ...memberIds] : memberIds
                    }
                    this.groups.unshift(newGroup)
                }
            } catch (e) {
                throw e
            }
        }
    }
})

