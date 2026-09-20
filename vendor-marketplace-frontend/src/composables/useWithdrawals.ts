import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useWithdrawals() {
  const queryClient = useQueryClient()

  const myWithdrawalsQuery = useQuery({
    queryKey: ['withdrawals', 'my'],
    queryFn: async () => {
      const response = await api.get('/withdrawals')
      return response.data
    }
  })

  const pendingWithdrawalsQuery = useQuery({
    queryKey: ['withdrawals', 'pending'],
    queryFn: async () => {
      const response = await api.get('/withdrawals/pending')
      return response.data
    }
  })

  const requestWithdrawalMutation = useMutation({
    mutationFn: async (payload: { bankAccountId: number; amount: number; pin: string }) => {
      const response = await api.post('/withdrawals', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['merchantProfile'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', 'my-history'] })
    }
  })

  const completeWithdrawalMutation = useMutation({
    mutationFn: async ({ id, proofUrl }: { id: number; proofUrl: string }) => {
      const response = await api.patch(`/withdrawals/${id}/complete`, { proofUrl })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'pending'] })
    }
  })

  const rejectWithdrawalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/withdrawals/${id}/reject`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'pending'] })
    }
  })

  return {
    myWithdrawalsQuery,
    pendingWithdrawalsQuery,
    requestWithdrawalMutation,
    completeWithdrawalMutation,
    rejectWithdrawalMutation
  }
}
