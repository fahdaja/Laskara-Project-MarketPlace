import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useSystemConfigs() {
  return useQuery<any[]>({
    queryKey: ['systemConfigs'],
    queryFn: async () => {
      const response = await api.get('/system-config')
      return response.data
    }
  })
}

export function useSystemAuditLogs(options: any = {}) {
  return useQuery<any[]>({
    queryKey: ['systemConfigAuditLogs'],
    queryFn: async () => {
      const response = await api.get('/system-config/audit-logs')
      return response.data
    },
    ...options
  })
}

export function useUpdateConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, value, confirmPassword }: { key: string; value: string; confirmPassword: string }) => {
      const response = await api.put(`/system-config/${key}`, { value, confirmPassword })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemConfigs'] })
      queryClient.invalidateQueries({ queryKey: ['systemConfigAuditLogs'] })
    }
  })
}

export function useSystemConfig() {
  const configsQuery = useSystemConfigs()
  const auditLogsQuery = useSystemAuditLogs()
  const updateConfigMutation = useUpdateConfig()

  return {
    configsQuery,
    auditLogsQuery,
    updateConfigMutation
  }
}
