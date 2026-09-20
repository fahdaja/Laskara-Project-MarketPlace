import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useOrderDetail(orderId: string | number) {
  return useQuery({
    queryKey: ['order', String(orderId)],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`)
      return res.data
    },
    enabled: computed(() => !!orderId)
  })
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders')
      return res.data
    }
  })
}

export function useIncomingOrders() {
  return useQuery({
    queryKey: ['orders', 'incoming'],
    queryFn: async () => {
      const res = await api.get('/orders/incoming')
      return res.data
    }
  })
}

export function useAcceptOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: number | string) => {
      const res = await api.patch(`/orders/${orderId}/accept`)
      return res.data
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'incoming'] })
      queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
    }
  })
}

export function useCompleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: number | string) => {
      const res = await api.patch(`/orders/${orderId}/complete`)
      return res.data
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] })
    }
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, rating, comment }: { orderId: number; rating: number; comment: string }) => {
      const res = await api.post('/reviews', { orderId, rating, comment })
      return res.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order', String(vars.orderId)] })
    }
  })
}

export function useOrderRevisions(orderId: string | number) {
  return useQuery({
    queryKey: ['revisions', String(orderId)],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}/revisions`)
      return res.data
    },
    enabled: computed(() => !!orderId)
  })
}

export function useOrderById(orderId: string | number) {
  return useQuery({
    queryKey: ['order', String(orderId)],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`)
      return res.data
    },
    enabled: computed(() => !!orderId)
  })
}

export function useRequestRevision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, message, attachments }: { orderId: number | string; message: string; attachments?: string[] }) => {
      const res = await api.post(`/orders/${orderId}/request-revision`, { message, attachments })
      return res.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order', String(vars.orderId)] })
      queryClient.invalidateQueries({ queryKey: ['revisions', String(vars.orderId)] })
    }
  })
}
