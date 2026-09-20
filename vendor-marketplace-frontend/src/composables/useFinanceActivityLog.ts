import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import api from '../api/axios'
import { useAuthStore } from '../store/auth.store'

export interface ActivityLogItem {
  id: number
  action: string
  key: string
  newValue: string
  createdAt: string
}

// Friendly label mapping for action codes from backend
const ACTION_LABELS: Record<string, { title: string; module: string }> = {
  VERIFY_PAYMENT:       { title: 'Memverifikasi pembayaran manual', module: 'Modul Verifikasi Pembayaran' },
  PROCESS_WITHDRAWAL:   { title: 'Memproses pencairan dana (Withdrawal)', module: 'Modul Pencairan Dana' },
  APPROVE_REFUND:       { title: 'Menyetujui pengembalian dana (Refund)', module: 'Modul Refund' },
  REJECT_REFUND:        { title: 'Menolak pengembalian dana (Refund)', module: 'Modul Refund' },
  CLOSE_PERIOD:         { title: 'Menutup periode pembukuan', module: 'Modul Laporan & Dividen' },
  UPDATE_CONFIG:        { title: 'Memperbarui konfigurasi sistem', module: 'Modul Sistem' },
  // Fallback: gunakan nilai `action` dari backend apa adanya
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
  } else if (diffDays === 1) {
    return `Kemarin, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function useFinanceActivityLog() {
  const authStore = useAuthStore()

  const { data, isLoading, isError } = useQuery<ActivityLogItem[]>({
    queryKey: ['finance-activity-log'],
    queryFn: async () => {
      const res = await api.get('/finance/profile/activity-log')
      return res.data
    },
    enabled: computed(() => !!authStore.token),
    staleTime: 60_000,   // 1 menit — tidak perlu refetch terlalu sering
    retry: 1,
  })

  const logs = computed(() =>
    (data.value ?? []).map((item, idx) => {
      const label = ACTION_LABELS[item.action] ?? {
        title: item.action,
        module: item.key,
      }
      return {
        id: item.id,
        title: `${label.title}${item.newValue ? ` ${item.newValue}` : ''}`,
        subtitle: label.module,
        date: formatDate(item.createdAt),
        isCurrent: idx === 0,
      }
    })
  )

  return { logs, isLoading, isError }
}
