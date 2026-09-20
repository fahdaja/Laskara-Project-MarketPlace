import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from '../api/axios'

export function useMerchants() {
  return useQuery({
    queryKey: ['merchants', 'all'],
    queryFn: async () => {
      const res = await api.get('/merchants')
      return res.data
    }
  })
}

export function useMerchantDetail(merchantId: string | number) {
  return useQuery({
    queryKey: ['merchant', String(merchantId)],
    queryFn: async () => {
      const res = await api.get(`/merchants/${merchantId}`)
      return res.data
    },
    enabled: computed(() => !!merchantId)
  })
}

export function useMerchantFinancial(merchantId: string | number) {
  return useQuery({
    queryKey: ['merchant', String(merchantId), 'financial'],
    queryFn: async () => {
      const res = await api.get(`/merchants/${merchantId}/financial-summary`)
      return res.data
    },
    enabled: computed(() => !!merchantId)
  })
}

export function useMerchantWithdrawals(merchantId: string | number) {
  return useQuery({
    queryKey: ['merchant', String(merchantId), 'withdrawals'],
    queryFn: async () => {
      const res = await api.get(`/withdrawals?merchantId=${merchantId}`)
      return res.data
    },
    enabled: computed(() => !!merchantId)
  })
}

export function useMerchantLeaderboard() {
  return useQuery({
    queryKey: ['merchants', 'leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/merchants/leaderboard')
      return data
    }
  })
}
