import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import api from '../api/axios'

export function useAdmin() {
  const queryClient = useQueryClient()

  const pendingMerchantsQuery = useQuery({
    queryKey: ['admin', 'merchants', 'pending'],
    queryFn: async () => {
      const response = await api.get('/admin/validator/merchants/pending')
      return response.data
    }
  })

  const merchantsQuery = (params: any) => {
    return useQuery({
      queryKey: ['admin', 'merchants', params],
      queryFn: async () => {
        const response = await api.get('/admin/validator/merchants', { params: unref(params) })
        return response.data
      }
    })
  }

  const getMerchantByIdQuery = (id: number | string) => {
    return useQuery({
      queryKey: ['admin', 'merchant', String(id)],
      queryFn: async () => {
        const response = await api.get(`/admin/validator/merchants/${id}`)
        return response.data
      },
      enabled: !!id
    })
  }

  const verifyMerchantMutation = useMutation({
    mutationFn: async ({ id, isApproved, rejectionReason }: { id: number, isApproved: boolean, rejectionReason?: string }) => {
      const response = await api.patch(`/admin/validator/merchants/${id}/verify`, { isApproved, rejectionReason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
    }
  })

  const suspendMerchantMutation = useMutation({
    mutationFn: async ({ id, isSuspended, reason, days }: { id: number, isSuspended: boolean, reason?: string, days?: number }) => {
      const response = await api.patch(`/admin/validator/merchants/${id}/suspend`, { isSuspended, reason, days })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants', 'pending'] })
    }
  })

  const suspendUserMutation = useMutation({
    mutationFn: async ({ id, isSuspended, reason, days }: { id: number, isSuspended: boolean, reason?: string, days?: number }) => {
      const response = await api.patch(`/admin/validator/users/${id}/suspend`, { isSuspended, reason, days })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const pendingGigsQuery = useQuery({
    queryKey: ['admin', 'gigs', 'pending'],
    queryFn: async () => {
      const response = await api.get('/admin/validator/gigs/pending')
      return response.data
    }
  })

  const verifyGigMutation = useMutation({
    mutationFn: async ({ id, isApproved, rejectionReason }: { id: number, isApproved: boolean, rejectionReason?: string }) => {
      const response = await api.patch(`/admin/validator/gigs/${id}/verify`, { isApproved, rejectionReason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs', 'pending'] })
    }
  })

  const pendingDisputesQuery = useQuery({
    queryKey: ['admin', 'disputes', 'pending'],
    queryFn: async () => {
      const response = await api.get('/admin/validator/disputes/pending')
      return response.data
    }
  })

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: number, decision: 'APPROVE_REFUND' | 'REJECT_COMPLAINT' }) => {
      const response = await api.patch(`/admin/validator/${id}/resolve`, { decision })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes', 'pending'] })
    }
  })

  const submitVerdictMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: number, decision: 'APPROVE_REFUND' | 'REJECT_COMPLAINT' }) => {
      const response = await api.patch(`/admin/validator/disputes/${id}/submit-verdict`, { decision })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes', 'pending'] })
    }
  })

  const confirmVerdictMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/validator/disputes/${id}/confirm-verdict`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes', 'pending'] })
    }
  })

  const executiveDecisionMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: number, decision: 'FORCE_REFUND' | 'FORCE_RELEASE' }) => {
      const response = await api.patch(`/admin/validator/disputes/${id}/executive-decision`, { decision })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes', 'pending'] })
    }
  })

  return {
    pendingMerchantsQuery,
    merchantsQuery,
    getMerchantByIdQuery,
    verifyMerchantMutation,
    suspendMerchantMutation,
    suspendUserMutation,
    pendingGigsQuery,
    verifyGigMutation,
    pendingDisputesQuery,
    resolveDisputeMutation,
    submitVerdictMutation,
    confirmVerdictMutation,
    executiveDecisionMutation
  }
}

