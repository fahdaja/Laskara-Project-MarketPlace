import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useAssociates() {
  const queryClient = useQueryClient()

  const associatesQuery = useQuery({
    queryKey: ['merchant-associates'],
    queryFn: async () => {
      const res = await api.get('/merchant-associates')
      return res.data
    }
  })

  const addAssociateMutation = useMutation({
    mutationFn: async (data: { email: string; permission: string }) => {
      const res = await api.post('/merchant-associates', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-associates'] })
    }
  })

  return {
    associatesQuery,
    addAssociateMutation
  }
}
