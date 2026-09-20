import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useAppeals() {
  const queryClient = useQueryClient()

  const appealsQuery = useQuery({
    queryKey: ['appeals'],
    queryFn: async () => {
      const response = await api.get('/appeals')
      return response.data
    }
  })

  const createAppealMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number; reason: string }) => {
      const response = await api.post('/appeals', { orderId, reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] })
    }
  })

  const resolveAppealMutation = useMutation({
    mutationFn: async ({ id, resolution, isApproved }: { id: number; resolution: string; isApproved: boolean }) => {
      const response = await api.patch(`/appeals/${id}/resolve`, { resolution, isApproved })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] })
    }
  })

  return {
    appealsQuery,
    createAppealMutation,
    resolveAppealMutation
  }
}
