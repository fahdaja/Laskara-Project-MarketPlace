import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useDeliverables(orderId: string | number) {
  return useQuery({
    queryKey: ['deliverables', String(orderId)],
    queryFn: async () => {
      const res = await api.get(`/deliverables?orderId=${orderId}`)
      return res.data
    },
    enabled: computed(() => !!orderId)
  })
}

export function useSubmitDeliverable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, fileUrl, message }: { orderId: number | string; fileUrl: string; message?: string }) => {
      const res = await api.post('/deliverables', { orderId: Number(orderId), fileUrl, message })
      return res.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', String(vars.orderId)] })
      queryClient.invalidateQueries({ queryKey: ['order', String(vars.orderId)] })
    }
  })
}
