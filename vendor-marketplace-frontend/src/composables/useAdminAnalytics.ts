import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useAdminAnalytics(period: 'day' | 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: ['adminAnalytics', period],
    queryFn: async () => {
      const res = await api.get(`/system-config/analytics`, {
        params: { period }
      })
      return res.data
    }
  })
}

export function useMidtransHealth() {
  return useQuery({
    queryKey: ['midtransHealth'],
    queryFn: async () => {
      const res = await api.get('/system-config/midtrans/health')
      return res.data
    },
    retry: false
  })
}

export function useAdminUsers(status?: 'active' | 'suspended') {
  return useQuery({
    queryKey: ['adminUsers', status],
    queryFn: async () => {
      const res = await api.get('/system-config/users', {
        params: status ? { status } : {}
      })
      return res.data
    }
  })
}

export function useCreateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; passwordHash: string; fullName: string; role: string }) => {
      const res = await api.post('/system-config/create-admin', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })
}

export function useSuspendAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.post('/system-config/suspend-admin', { userId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })
}

export function useUnsuspendAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.post('/system-config/unsuspend-admin', { userId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.post('/system-config/delete-admin', { userId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })
}
