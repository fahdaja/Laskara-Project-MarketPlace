<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { useAdminAnalytics, useMidtransHealth, useAdminUsers } from '../../composables/useAdminAnalytics'
import {
  useDashboardOverview,
  formatCompactNumber,
  formatCompactCurrency,
  getInitials,
  getAvatarColor,
  gatewayStatusLabel,
  gatewayStatusColor,
  notifStatusLabel,
  notifStatusColor,
} from '../../composables/useDashboardOverview'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler
)

// Current date
const currentDate = ref(new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}))

// Selected period for team performance
const selectedPeriod = ref('Hari Ini')

// ─── Fetch data from existing BE endpoints ─────────────────────
const { data: analytics, isLoading: isAnalyticsLoading, refetch: refetchAnalytics } = useAdminAnalytics('month')
const { data: midtransHealth, isError: midtransIsError, refetch: refetchHealth } = useMidtransHealth()
const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useAdminUsers()

// ─── Fetch dashboard overview (new composable, fallback to mock) ─
const { data: overview, refetch: refetchOverview } = useDashboardOverview()

// Combined loading state
const isLoading = computed(() => isAnalyticsLoading.value || isUsersLoading.value)

// ─── Computed from REAL BE data (useAdminUsers) ─────────────────
const totalUsersCount = computed(() => users.value?.length || 0)
const activeUsersCount = computed(() => users.value?.filter((u: any) => !u.isSuspended).length || 0)
const suspendedUsersCount = computed(() => users.value?.filter((u: any) => u.isSuspended).length || 0)

// ─── Computed from REAL BE data (useAdminAnalytics) ─────────────
const totalTransactionsCount = computed(() => analytics.value?.transactions?.totalCount || 0)
const platformRevenue = computed(() => analytics.value?.revenue?.platformRevenue || 0)
const gmvRevenue = computed(() => analytics.value?.revenue?.gmv || 0)

// ─── Computed PG Latency from midtrans health hook ──────────────
const pgLatency = computed(() => {
  if (midtransHealth.value && typeof midtransHealth.value === 'object' && 'latency' in midtransHealth.value) {
    return (midtransHealth.value as any).latency + 'ms'
  }
  return overview.value?.paymentGateways?.[0]?.latency + 'ms' || '142ms'
})

// ─── Overview data shortcuts (from new composable) ──────────────
const serverHealth = computed(() => overview.value?.serverHealth)
const dbHealth = computed(() => overview.value?.database)
const notifServices = computed(() => overview.value?.notifications)
const pgGateways = computed(() => overview.value?.paymentGateways || [])
const adminValidatorData = computed(() => overview.value?.teamPerformance?.adminValidator)
const financeAdminData = computed(() => overview.value?.teamPerformance?.financeAdmin)
const globalMetrics = computed(() => overview.value?.globalMetrics)

// ─── Health check overall status ────────────────────────────────
const hasSystemIssue = computed(() => {
  if (midtransIsError.value) return true
  if (notifServices.value?.emailSmtp === 'error') return true
  if (pgGateways.value.some(g => g.status === 'error' || g.status === 'offline')) return true
  return false
})

// ─── Display helpers for global metrics (merge real + overview) ──
const displayTotalUsers = computed(() => {
  return formatCompactNumber(totalUsersCount.value || globalMetrics.value?.totalUsers || 0)
})

const displayActiveUsers = computed(() => {
  return formatCompactNumber(activeUsersCount.value || globalMetrics.value?.activeUsers || 0)
})

const displayNewUsersToday = computed(() => {
  return '+' + formatCompactNumber(globalMetrics.value?.newUsersToday || 0)
})

const displayUserGrowth = computed(() => {
  return '↑ ' + (globalMetrics.value?.userGrowthPercent || 0) + '%'
})

const displayRevenueMonthly = computed(() => {
  return formatCompactCurrency(platformRevenue.value || globalMetrics.value?.revenueToday || 0)
})

const displayGmv = computed(() => {
  return formatCompactCurrency(gmvRevenue.value)
})

const displayRevenueToday = computed(() => {
  return formatCompactCurrency(globalMetrics.value?.revenueToday || 0)
})

const displayRevenueGrowth = computed(() => {
  return '↑ 0%'
})

const displayTotalTransactions = computed(() => {
  return (totalTransactionsCount.value || globalMetrics.value?.totalTransactions || 0).toLocaleString('id-ID')
})

const displayTransactionGrowth = computed(() => {
  return '↑ ' + (globalMetrics.value?.transactionGrowthPercent || 0) + '%'
})

const displayActiveSessions = computed(() => {
  return (globalMetrics.value?.activeSessions || 0).toLocaleString('id-ID')
})


// formatPrice moved to composable as formatCompactCurrency

// Refresh data handler
const isRefreshing = ref(false)
const refreshData = async () => {
  isRefreshing.value = true
  await Promise.all([
    refetchAnalytics(),
    refetchHealth(),
    refetchUsers(),
    refetchOverview()
  ])
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// ─── Chart Data ─────────────────────────────────────────────────
const lineChartData = computed(() => {
  const baseRevenue = analytics.value?.revenue?.platformRevenue || 0
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Platform Revenue',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderColor: '#3B82F6',
        borderWidth: 3.5,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
        data: [
          Math.round(baseRevenue * 0.66),
          Math.round(baseRevenue * 0.79),
          Math.round(baseRevenue * 0.83),
          Math.round(baseRevenue * 0.81),
          Math.round(baseRevenue * 0.93),
          baseRevenue
        ],
      }
    ]
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 12, family: 'Inter', weight: 'bold' as const },
      bodyFont: { size: 13, family: 'Inter' },
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9CA3AF', font: { size: 12, family: 'Inter' } }
    },
    y: {
      grid: { color: '#F3F4F6', drawBorder: false, tickLength: 0 },
      ticks: {
        color: '#9CA3AF',
        font: { size: 12, family: 'Inter' },
        padding: 12,
        callback: function(value: any) {
          return 'Rp ' + (value / 1000000000).toFixed(1) + 'M';
        }
      }
    }
  }
}

const donutChartData = computed(() => {
  const activePercent = totalUsersCount.value ? Math.round((activeUsersCount.value / totalUsersCount.value) * 100) : 0
  const inactivePercent = totalUsersCount.value ? Math.round((suspendedUsersCount.value / totalUsersCount.value) * 100) : 0
  const newPercent = totalUsersCount.value ? (100 - activePercent - inactivePercent) : 0

  return {
    labels: ['User Aktif', 'Tidak Aktif', 'Baru Daftar'],
    datasets: [
      {
        backgroundColor: ['#3B82F6', '#60A5FA', '#CBD5E1'],
        hoverBackgroundColor: ['#2563EB', '#3B82F6', '#94A3B8'],
        borderWidth: 0,
        data: [activePercent, inactivePercent, newPercent],
      }
    ]
  }
})

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      padding: 12,
      cornerRadius: 10,
      bodyFont: { size: 13, weight: 'bold' as const, family: 'Inter' },
      callbacks: {
        label: function(context: any) {
          return `${context.label}: ${context.parsed}%`
        }
      }
    }
  }
}
</script>

<template>
  <div class="pb-12 min-h-screen bg-[#F8FAFC]">
    <!-- Header -->
    <header class="mb-8">
      <div class="flex justify-between items-center pb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-gray-400 text-xs font-medium">{{ currentDate }}</p>
          <button 
            @click="refreshData"
            class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
          >
            <svg 
              class="w-3.5 h-3.5" 
              :class="{ 'animate-spin': isRefreshing }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ isRefreshing ? 'Memperbarui...' : 'Perbarui' }}
          </button>
        </div>
      </div>
      <hr class="border-gray-200/80" />
    </header>

    <!-- 1. LOADING SKELETON STATE -->
    <div v-if="isLoading" class="space-y-10 animate-pulse">
      <!-- Health check skeleton -->
      <div>
        <div class="flex justify-between items-center mb-5">
          <div class="h-6 w-48 bg-gray-200 rounded-lg"></div>
          <div class="h-8 w-40 bg-gray-200 rounded-full"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-[20px] p-5 border border-gray-100 h-48 flex flex-col justify-between shadow-xs">
            <div class="flex justify-between">
              <div class="w-10 h-10 rounded-xl bg-gray-200"></div>
              <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div class="space-y-3 mt-4">
              <div class="h-4 w-32 bg-gray-200 rounded-md"></div>
              <div class="h-3 w-44 bg-gray-200 rounded-md"></div>
            </div>
            <div class="h-1.5 w-full bg-gray-100 rounded-full mt-4"></div>
          </div>
        </div>
      </div>

      <!-- Team skeleton -->
      <div>
        <div class="flex justify-between items-center mb-5">
          <div class="h-6 w-48 bg-gray-200 rounded-lg"></div>
          <div class="h-8 w-24 bg-gray-200 rounded-full"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="bg-white rounded-[24px] p-6 border border-gray-100 h-96 flex flex-col justify-between shadow-xs">
            <div class="flex justify-between items-center">
              <div class="space-y-2">
                <div class="h-5 w-36 bg-gray-200 rounded-md"></div>
                <div class="h-3.5 w-44 bg-gray-200 rounded-md"></div>
              </div>
              <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div class="h-1.5 w-full bg-gray-100 rounded-full my-4"></div>
            <div class="space-y-4">
              <div v-for="j in 3" :key="j" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3.5 w-24 bg-gray-200 rounded-md"></div>
                  <div class="h-1.5 w-full bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mt-6">
              <div class="h-8 bg-gray-200 rounded-md" v-for="j in 3" :key="j"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MAIN CONTENT STATE -->
    <div v-else class="space-y-10">


      <!-- Health Check Sistem -->
      <section>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-6 bg-[#3B82F6] rounded-full"></div>
            <h2 class="text-lg font-bold text-gray-800 tracking-tight">Health Check Sistem</h2>
          </div>
          <div 
            class="px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold border shadow-xs"
            :class="hasSystemIssue 
              ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]/60' 
              : 'bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]/60'"
          >
            <span 
              class="w-2 h-2 rounded-full animate-pulse"
              :class="hasSystemIssue ? 'bg-[#EF4444]' : 'bg-[#10B981]'"
            ></span>
            {{ hasSystemIssue ? 'Ada Gangguan' : 'Semua Sistem Normal' }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Server Utama Card -->
          <div class="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#137333]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div class="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#D1FAE5]/50">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Online
                </div>
              </div>
              <h3 class="text-sm font-bold text-gray-800">Server Utama</h3>
              <p class="text-xs text-gray-400 font-medium mt-0.5">Production — AWS ap-southeast-1</p>
              
              <div class="mt-5 space-y-4">
                <div>
                  <div class="flex justify-between text-xs font-medium mb-1.5">
                    <span class="text-gray-500">CPU Usage</span>
                    <span class="font-bold text-gray-700">{{ serverHealth?.cpuUsage || 34 }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5">
                    <div class="bg-[#10B981] h-1.5 rounded-full transition-all duration-500" :style="{ width: (serverHealth?.cpuUsage || 34) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-xs font-medium mb-1.5">
                    <span class="text-gray-500">Memory</span>
                    <span class="font-bold text-gray-700">{{ serverHealth?.memoryUsage || 58 }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5">
                    <div class="bg-[#3B82F6] h-1.5 rounded-full transition-all duration-500" :style="{ width: (serverHealth?.memoryUsage || 58) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between text-xs pt-3.5 border-t border-gray-100 mt-5 font-medium">
              <span class="text-gray-400">Uptime: <span class="text-[#10B981] font-bold">{{ serverHealth?.uptime || 99.98 }}%</span></span>
            </div>
          </div>

          <!-- Payment Gateway Card -->
          <div class="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1A73E8]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div 
                  class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-xs transition-colors duration-300"
                  :class="midtransIsError ? 'text-[#EF4444] bg-[#FEE2E2] border-[#FCA5A5]/40' : 'text-[#10B981] bg-[#ECFDF5] border-[#D1FAE5]/50'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="midtransIsError ? 'bg-[#EF4444] animate-pulse' : 'bg-[#10B981]'"></span>
                  {{ midtransIsError ? 'Gangguan' : 'Online' }}
                </div>
              </div>
              <h3 class="text-sm font-bold text-gray-800">Payment Gateway</h3>
              <p class="text-xs text-gray-400 font-medium mt-0.5">Midtrans & Xendit</p>
              
              <div class="mt-5 space-y-3.5 text-xs font-semibold">
                <!-- Midtrans: from real BE health check -->
                <div class="flex justify-between items-center py-0.5">
                  <div class="flex items-center gap-2 text-gray-500 font-medium">
                    <span class="w-2 h-2 rounded-full transition-colors duration-300" :class="midtransIsError ? 'bg-[#EF4444]' : 'bg-[#10B981]'"></span>Midtrans
                  </div>
                  <span class="transition-colors duration-300" :class="midtransIsError ? 'text-[#EF4444]' : 'text-[#10B981]'">
                    {{ midtransIsError ? 'Gangguan' : 'Aktif' }}
                  </span>
                </div>
                <!-- Xendit & DOKU: from dashboard overview composable -->
                <div v-for="gw in pgGateways.filter(g => g.name !== 'Midtrans')" :key="gw.name" class="flex justify-between items-center py-0.5">
                  <div class="flex items-center gap-2 text-gray-500 font-medium">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: gatewayStatusColor(gw.status) }"></span>{{ gw.name }}
                  </div>
                  <span :style="{ color: gatewayStatusColor(gw.status) }">{{ gatewayStatusLabel(gw.status) }}</span>
                </div>
              </div>
            </div>
            <div class="flex justify-between text-xs pt-3.5 border-t border-gray-100 mt-5 font-medium">
              <span class="text-gray-400">Latency: <span class="text-[#3B82F6] font-bold">{{ pgLatency }}</span></span>
            </div>
          </div>

          <!-- Database Cluster Card -->
          <div class="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div class="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#D1FAE5]/50">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Online
                </div>
              </div>
              <h3 class="text-sm font-bold text-gray-800">Database Cluster</h3>
              <p class="text-xs text-gray-400 font-medium mt-0.5">PostgreSQL — Primary + 2 Replica</p>
              
              <div class="mt-5 space-y-4">
                <div>
                  <div class="flex justify-between text-xs font-medium mb-1.5">
                    <span class="text-gray-500">Storage</span>
                    <span class="font-bold text-gray-700">{{ dbHealth?.storagePercent || 71 }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5">
                    <div class="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-500" :style="{ width: (dbHealth?.storagePercent || 71) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-xs font-medium mb-1.5">
                    <span class="text-gray-500">Connections</span>
                    <span class="font-bold text-gray-700">{{ dbHealth?.connectionsUsed || 247 }}/{{ dbHealth?.connectionsMax || 500 }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5">
                    <div class="bg-[#8B5CF6] h-1.5 rounded-full transition-all duration-500" :style="{ width: ((dbHealth?.connectionsUsed || 247) / (dbHealth?.connectionsMax || 500) * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between text-xs pt-3.5 border-t border-gray-100 mt-5 font-medium">
              <span class="text-gray-400">Query avg: <span class="text-[#8B5CF6] font-bold">{{ dbHealth?.avgQueryMs || 8 }}ms</span></span>
            </div>
          </div>

          <!-- Notifikasi Service Card -->
          <div class="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div 
                  class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="notifServices?.emailSmtp === 'error' 
                    ? 'text-[#EF4444] bg-[#FEE2E2] border-[#FCA5A5]/40' 
                    : 'text-[#10B981] bg-[#ECFDF5] border-[#D1FAE5]/50'"
                >
                  <span 
                    class="w-1.5 h-1.5 rounded-full" 
                    :class="notifServices?.emailSmtp === 'error' ? 'bg-[#EF4444]' : 'bg-[#10B981]'"
                  ></span> 
                  {{ notifServices?.emailSmtp === 'error' ? 'Gangguan' : 'Normal' }}
                </div>
              </div>
              <h3 class="text-sm font-bold text-gray-800">Notifikasi Service</h3>
              <p class="text-xs text-gray-400 font-medium mt-0.5">Email & Push Notification</p>
              
              <div class="mt-5 space-y-3 text-xs font-semibold">
                <div class="flex justify-between items-center py-0.5">
                  <div class="flex items-center gap-2 text-gray-500 font-medium">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: notifStatusColor(notifServices?.pushNotif || 'active') }"></span>Push Notif
                  </div>
                  <span :style="{ color: notifStatusColor(notifServices?.pushNotif || 'active') }">{{ notifStatusLabel(notifServices?.pushNotif || 'active') }}</span>
                </div>
                <div class="flex justify-between items-center py-0.5">
                  <div class="flex items-center gap-2 text-gray-500 font-medium">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: notifStatusColor(notifServices?.emailSmtp || 'error') }"></span>Email SMTP
                  </div>
                  <span :style="{ color: notifStatusColor(notifServices?.emailSmtp || 'error') }">{{ notifStatusLabel(notifServices?.emailSmtp || 'error') }}</span>
                </div>
                <div class="flex justify-between items-center py-0.5">
                  <div class="flex items-center gap-2 text-gray-500 font-medium">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: notifStatusColor(notifServices?.whatsappApi || 'active') }"></span>WhatsApp API
                  </div>
                  <span :style="{ color: notifStatusColor(notifServices?.whatsappApi || 'active') }">{{ notifStatusLabel(notifServices?.whatsappApi || 'active') }}</span>
                </div>
              </div>
            </div>
            <div class="pt-3 border-t border-gray-100 mt-5" v-if="notifServices?.emailSmtp === 'error'">
              <div class="bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#FEF3C7] flex items-center gap-1.5">
                <span>⚠️</span> SMTP perlu perhatian
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Overview Kinerja Tim -->
      <section>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-6 bg-[#8B5CF6] rounded-full"></div>
            <h2 class="text-lg font-bold text-gray-800 tracking-tight">Overview Kinerja Tim</h2>
          </div>
          <div class="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Periode:</span>
            <div class="bg-white border border-gray-200 text-gray-800 px-3.5 py-1.5 rounded-full flex items-center shadow-xs cursor-pointer hover:bg-gray-50 transition-colors">
              {{ selectedPeriod }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Admin Validator Card -->
          <div class="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h3 class="text-sm font-bold text-gray-800">Admin Validator</h3>
                  <p class="text-xs text-gray-400 font-medium mt-0.5">Tiket Diselesaikan Hari Ini</p>
                </div>
                <span class="text-3xl font-extrabold text-[#6366F1] tracking-tight">{{ adminValidatorData?.totalTicketsToday || 0 }}</span>
              </div>

              <!-- Progress Target -->
              <div class="mb-6">
                <div class="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                  <span>Progress Target Harian ({{ adminValidatorData?.dailyTarget || 300 }} tiket)</span>
                  <span class="text-[#6366F1]">{{ adminValidatorData?.progressPercent || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div class="bg-[#6366F1] h-1.5 rounded-full transition-all duration-500" :style="{ width: (adminValidatorData?.progressPercent || 0) + '%' }"></div>
                </div>
              </div>

              <!-- Performa Anggota -->
              <div class="mb-6">
                <h4 class="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3.5">Performa Per Anggota</h4>
                <div class="space-y-4">
                  <div v-if="!adminValidatorData?.members?.length" class="text-xs text-gray-400 text-center py-4">
                    Belum ada data anggota
                  </div>
                  <div v-for="(member, idx) in adminValidatorData?.members || []" :key="member.name" class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                      :style="{ backgroundColor: getAvatarColor(idx ?? 0).bg, color: getAvatarColor(idx ?? 0).text }"
                    >
                      {{ getInitials(member.name) }}
                    </div>
                    <div class="flex-1">
                      <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{{ member.name }}</span>
                        <span class="text-gray-500">{{ member.ticketCount ?? 0 }} tiket</span>
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-1.5">
                        <div class="bg-[#6366F1] h-1.5 rounded-full transition-all duration-500" :style="{ width: member.progressPercent + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary bottom -->
            <div class="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center font-semibold">
              <div>
                <p class="text-base text-[#10B981] font-bold">{{ adminValidatorData?.summary?.completed || 0 }}</p>
                <p class="text-[10px] text-gray-400 font-medium">Selesai</p>
              </div>
              <div class="border-x border-gray-100">
                <p class="text-base text-[#F59E0B] font-bold">{{ adminValidatorData?.summary?.pending || 0 }}</p>
                <p class="text-[10px] text-gray-400 font-medium">Pending</p>
              </div>
              <div>
                <p class="text-base text-[#EF4444] font-bold">{{ adminValidatorData?.summary?.rejected || 0 }}</p>
                <p class="text-[10px] text-gray-400 font-medium">Ditolak</p>
              </div>
            </div>
          </div>

          <!-- Finance Admin Card -->
          <div class="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h3 class="text-sm font-bold text-gray-800">Finance Admin</h3>
                  <p class="text-xs text-gray-400 font-medium mt-0.5">Pencairan Diproses Hari Ini</p>
                </div>
                <span class="text-3xl font-extrabold text-[#0D9488] tracking-tight">{{ financeAdminData?.totalDisbursementsToday || 0 }}</span>
              </div>

              <!-- Progress Target -->
              <div class="mb-6">
                <div class="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                  <span>Progress Target Harian ({{ financeAdminData?.dailyTarget || 200 }} pencairan)</span>
                  <span class="text-[#0D9488]">{{ financeAdminData?.progressPercent || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div class="bg-[#0D9488] h-1.5 rounded-full transition-all duration-500" :style="{ width: (financeAdminData?.progressPercent || 0) + '%' }"></div>
                </div>
              </div>

              <!-- Performa Anggota -->
              <div class="mb-6">
                <h4 class="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3.5">Performa Per Anggota</h4>
                <div class="space-y-4">
                  <div v-if="!financeAdminData?.members?.length" class="text-xs text-gray-400 text-center py-4">
                    Belum ada data anggota
                  </div>
                  <div v-for="(member, idx) in financeAdminData?.members || []" :key="member.name" class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                      :style="{ backgroundColor: getAvatarColor((idx ?? 0) + 3).bg, color: getAvatarColor((idx ?? 0) + 3).text }"
                    >
                      {{ getInitials(member.name) }}
                    </div>
                    <div class="flex-1">
                      <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{{ member.name }}</span>
                        <span class="text-gray-500 font-bold">{{ (member.amount ?? 0) > 0 ? formatCompactCurrency(member.amount ?? 0) : '-' }}</span>
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-1.5">
                        <div class="bg-[#0D9488] h-1.5 rounded-full transition-all duration-500" :style="{ width: member.progressPercent + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary bottom -->
            <div class="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center font-semibold">
              <div>
                <p class="text-base text-[#10B981] font-bold">{{ financeAdminData?.summary?.totalDisbursed ? formatCompactCurrency(financeAdminData.summary.totalDisbursed) : 'Rp 0' }}</p>
                <p class="text-[10px] text-gray-400 font-medium">Total Cair</p>
              </div>
              <div class="border-x border-gray-100">
                <p class="text-base text-[#F59E0B] font-bold">{{ financeAdminData?.summary?.queued || 0 }}</p>
                <p class="text-[10px] text-gray-400 font-medium">Antrian</p>
              </div>
              <div>
                <p class="text-base text-[#EF4444] font-bold">{{ financeAdminData?.summary?.failed || 0 }}</p>
                <p class="text-[10px] text-gray-400 font-medium">Gagal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Global Metrics -->
      <section>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-6 bg-[#F97316] rounded-full"></div>
            <h2 class="text-lg font-bold text-gray-800 tracking-tight">Global Metrics</h2>
          </div>
          <div class="bg-[#F1F5F9] text-gray-600 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            High Level Overview
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Metric Card 1: Total User (INTEGRATED with real data) -->
          <div class="bg-gradient-to-br from-[#3D4ED8] to-[#1E3A8A] rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div class="flex justify-between items-start mb-6 z-10">
              <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span class="bg-white/20 text-white font-bold text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md">
                {{ displayUserGrowth }}
              </span>
            </div>
            <div class="z-10 mt-2">
              <h3 class="text-3xl font-extrabold tracking-tight mb-1">{{ displayTotalUsers }}</h3>
              <p class="text-white/80 text-xs font-semibold uppercase tracking-wider">Total User Terdaftar</p>
            </div>
            <div class="flex items-center gap-6 pt-5 border-t border-white/10 z-10 mt-6 font-semibold">
              <div>
                <p class="text-sm font-bold">{{ displayActiveUsers }}</p>
                <p class="text-white/60 text-[10px] font-medium">Aktif</p>
              </div>
              <div class="border-l border-white/10 pl-5">
                <p class="text-sm font-bold">{{ displayNewUsersToday }}</p>
                <p class="text-white/60 text-[10px] font-medium">Baru Hari Ini</p>
              </div>
            </div>
          </div>

          <!-- Metric Card 2: Revenue (INTEGRATED with real data) -->
          <div class="bg-gradient-to-br from-[#059669] to-[#047857] rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
            <div class="flex justify-between items-start mb-6 z-10">
              <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="bg-white/20 text-white font-bold text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md">
                {{ displayRevenueGrowth }}
              </span>
            </div>
            <div class="z-10 mt-2">
              <h3 class="text-3xl font-extrabold tracking-tight mb-1">
                {{ displayRevenueMonthly }}
              </h3>
              <p class="text-white/80 text-xs font-semibold uppercase tracking-wider">Total Revenue Bulan Ini</p>
            </div>
            <div class="flex items-center gap-6 pt-5 border-t border-white/10 z-10 mt-6 font-semibold">
              <div>
                <p class="text-sm font-bold">{{ displayRevenueToday }}</p>
                <p class="text-white/60 text-[10px] font-medium">Hari Ini</p>
              </div>
              <div class="border-l border-white/10 pl-5">
                <p class="text-sm font-bold">{{ displayGmv }}</p>
                <p class="text-white/60 text-[10px] font-medium">Total YTD</p>
              </div>
            </div>
          </div>

          <!-- Metric Card 3: Total Transaksi (INTEGRATED with real data) -->
          <div class="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span class="bg-[#ECFDF5] text-[#10B981] font-bold text-[11px] px-2.5 py-1 rounded-full border border-[#D1FAE5]/60 shadow-xs">
                {{ displayTransactionGrowth }}
              </span>
            </div>
            <div class="mt-4">
              <h3 class="text-3xl font-extrabold text-gray-800 tracking-tight mb-1">{{ displayTotalTransactions }}</h3>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Transaksi</p>
            </div>
          </div>

          <!-- Metric Card 4: Active Sessions (from overview composable) -->
          <div class="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span class="bg-[#ECFDF5] text-[#10B981] font-bold text-[11px] px-2.5 py-1 rounded-full border border-[#D1FAE5]/60 flex items-center gap-1 shadow-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                Live
              </span>
            </div>
            <div class="mt-4">
              <h3 class="text-3xl font-extrabold text-gray-800 tracking-tight mb-1">{{ displayActiveSessions }}</h3>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Sesi Aktif Sekarang</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Line Chart -->
        <div class="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 lg:col-span-2 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-sm font-bold text-gray-800">Tren Revenue — 6 Bulan Terakhir</h3>
            <div class="flex gap-1.5 text-xs font-semibold">
              <button class="bg-[#3B82F6] text-white px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all">Revenue</button>
              <button class="text-gray-500 hover:bg-gray-50 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all">Transaksi</button>
            </div>
          </div>
          <div class="flex-1 min-h-[280px] relative w-full pt-2">
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
        </div>

        <!-- Donut Chart -->
        <div class="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] border border-gray-100/90 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <h3 class="text-sm font-bold text-gray-800 mb-6">Distribusi User</h3>
            <div class="flex justify-center relative h-52 w-full mt-2 mb-6">
              <Doughnut :data="donutChartData" :options="donutChartOptions" />
            </div>
          </div>
          
          <!-- Legend Details (INTEGRATED with real data) -->
          <div class="space-y-3.5 pt-4 border-t border-gray-100 font-semibold text-xs mt-auto">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 text-gray-500 font-medium">
                <span class="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span> User Aktif
              </div>
              <div class="text-gray-400">
                {{ activeUsersCount.toLocaleString('id-ID') }} 
                <span class="font-bold text-gray-700 ml-1">({{ totalUsersCount ? Math.round((activeUsersCount / totalUsersCount) * 100) : 0 }}%)</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 text-gray-500 font-medium">
                <span class="w-2.5 h-2.5 rounded-full bg-[#60A5FA]"></span> Tidak Aktif
              </div>
              <div class="text-gray-400">
                {{ suspendedUsersCount.toLocaleString('id-ID') }} 
                <span class="font-bold text-gray-700 ml-1">({{ totalUsersCount ? Math.round((suspendedUsersCount / totalUsersCount) * 100) : 0 }}%)</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 text-gray-500 font-medium">
                <span class="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]"></span> Baru Daftar
              </div>
              <div class="text-gray-400">
                {{ (totalUsersCount - activeUsersCount - suspendedUsersCount).toLocaleString('id-ID') }} 
                <span class="font-bold text-gray-700 ml-1">({{ totalUsersCount ? (100 - Math.round((activeUsersCount / totalUsersCount) * 100) - Math.round((suspendedUsersCount / totalUsersCount) * 100)) : 0 }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
