import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useMonthlyReports() {
  const queryClient = useQueryClient()

  const reportsQuery = useQuery({
    queryKey: ['monthlyReports'],
    queryFn: async () => {
      const response = await api.get('/monthly-reports')
      return response.data
    }
  })

  const reportDetailQuery = (id: number) => {
    return useQuery({
      queryKey: ['monthlyReport', id],
      queryFn: async () => {
        const response = await api.get(`/monthly-reports/${id}`)
        return response.data
      },
      enabled: !!id
    })
  }

  const generateReportMutation = useMutation({
    mutationFn: async (payload: { period: string }) => {
      const response = await api.post('/monthly-reports/generate', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyReports'] })
    }
  })

  const updateCostMutation = useMutation({
    mutationFn: async ({ id, operationalCost }: { id: number; operationalCost: number }) => {
      const response = await api.patch(`/monthly-reports/${id}/operational-cost`, { operationalCost })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyReports'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyReport', variables.id] })
    }
  })

  const processDividendMutation = useMutation({
    mutationFn: async ({ id, cscPercentage, cciPercentage }: { id: number; cscPercentage: number; cciPercentage: number }) => {
      const response = await api.post(`/monthly-reports/${id}/process-dividend`, { cscPercentage, cciPercentage })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyReports'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyReport', variables.id] })
    }
  })

  const lockReportMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/monthly-reports/${id}/lock`)
      return response.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyReports'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyReport', id] })
    }
  })

  const uploadProofMutation = useMutation({
    mutationFn: async ({ id, proofUrl }: { id: number; proofUrl: string }) => {
      const response = await api.post(`/monthly-reports/${id}/upload-proof`, { proofUrl })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyReports'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyReport', variables.id] })
    }
  })

  return {
    reportsQuery,
    reportDetailQuery,
    generateReportMutation,
    updateCostMutation,
    processDividendMutation,
    lockReportMutation,
    uploadProofMutation
  }
}
