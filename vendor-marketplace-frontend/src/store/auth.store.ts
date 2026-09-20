import { defineStore } from 'pinia'

interface User {
  id: string
  fullName: string
  name: string
  email: string
  role: string
  avatar?: string
  avatarUrl?: string
  merchant?: any
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('access_token') || null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },
  
  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      localStorage.setItem('access_token', token)
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('access_token')
    },
  },
})
