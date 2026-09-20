import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useRefunds() {
  const queryClient = useQueryClient()

  const refundsQuery = useQuery({
    queryKey: ['disputes', 'resolved'],
    queryFn: async () => {
      const res = await api.get('/disputes?status=RESOLVED')
      return res.data
    }
  })

  const processRefundMutation = useMutation({
    mutationFn: async ({ disputeId, method }: { disputeId: number; method: string }) => {
      const res = await api.patch(`/disputes/${disputeId}/process-refund`, { method })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes', 'resolved'] })
    }
  })

  return { refundsQuery, processRefundMutation }
}
