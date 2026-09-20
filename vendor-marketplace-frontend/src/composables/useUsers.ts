import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { StreamChat } from 'stream-chat'
import { useAuth } from './useAuth'
import api from '../api/axios'

export function useUserDetail(userId: string | number) {
  return useQuery({
    queryKey: ['user', String(userId)],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`)
      return res.data
    },
    enabled: computed(() => !!userId)
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users')
      return res.data
    }
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions')
      return res.data
    }
  })
}

export function useUserChatLogs(userId: string | number) {
  const { user: currentUser } = useAuth()
  return useQuery({
    queryKey: ['chat-logs', String(userId)],
    queryFn: async () => {
      if (!currentUser.value) return []
      const tokenRes = await api.get('/chat/token')
      const token = tokenRes.data.token
      const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY || '')
      await chatClient.connectUser(
        {
          id: String(currentUser.value.id),
          name: currentUser.value.fullName,
        },
        token
      )
      const filter = { members: { $in: [String(userId)] } }
      const channels = await chatClient.queryChannels(filter, { last_message_at: -1 })
      const allMessages: any[] = []
      for (const channel of channels) {
        const messages = channel.state.messages || []
        for (const msg of messages) {
          allMessages.push({
            id: msg.id,
            message: msg.text || '',
            time: new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            createdAt: msg.created_at,
            senderName: msg.user?.name || msg.user?.id || 'User',
            senderAvatar: msg.user?.image || `https://i.pravatar.cc/150?u=${msg.user?.id}`
          })
        }
      }
      await chatClient.disconnectUser()
      return allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    enabled: computed(() => !!userId && !!currentUser.value)
  })
}
