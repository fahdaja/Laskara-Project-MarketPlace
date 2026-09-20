import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useTransactions() {
  const queryClient = useQueryClient()

  const allTransactionsQuery = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/all')
      return data
    }
  })

  const myTransactionsQuery = useQuery({
    queryKey: ['transactions', 'my-history'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/my-history')
      return data
    }
  })

  const verifyTransactionMutation = useMutation({
    mutationFn: async ({ id, status, verificationNote }: { id: number; status: 'VERIFIED' | 'REJECTED'; verificationNote?: string }) => {
      const { data } = await api.patch(`/transactions/${id}/verify`, { status, verificationNote })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', 'my-history'] })
    }
  })

  return {
    allTransactionsQuery,
    myTransactionsQuery,
    verifyTransactionMutation
  }
}

export function useFinancialSummary(period: 'day' | 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: ['transactions', 'financial-summary', period],
    queryFn: async () => {
      const { data } = await api.get('/transactions/financial-summary', {
        params: { period }
      })
      return data
    }
  })
}
