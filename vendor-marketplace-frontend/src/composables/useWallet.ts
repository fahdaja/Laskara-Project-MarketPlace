import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useWallet() {
  const queryClient = useQueryClient()

  const merchantProfileQuery = useQuery({
    queryKey: ['merchantProfile'],
    queryFn: async () => {
      const response = await api.get('/merchants/profile')
      return response.data
    }
  })

  const updatePinMutation = useMutation({
    mutationFn: async ({ id, withdrawalPin }: { id: number; withdrawalPin: string }) => {
      const response = await api.patch(`/merchants/${id}/edit/profile`, { withdrawalPin })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantProfile'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  return {
    merchantProfileQuery,
    updatePinMutation
  }
}
