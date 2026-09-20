<script setup lang="ts">
import { computed } from 'vue'
import { useTransactions, useFinancialSummary } from '../../composables/useTransactions'
import { useWithdrawals } from '../../composables/useWithdrawals'
import { useRefunds } from '../../composables/useRefunds'

const { allTransactionsQuery } = useTransactions()
const { pendingWithdrawalsQuery } = useWithdrawals()
const { refundsQuery } = useRefunds()
const { data: financialSummary } = useFinancialSummary('month')

const pendingPaymentsCount = computed(() => {
  const txs = allTransactionsQuery.data.value || []
  return txs.filter((t: any) => t.status === 'PENDING').length
})

const pendingWithdrawalsCount = computed(() => {
  return (pendingWithdrawalsQuery.data.value || []).length
})

const approvedRefundsCount = computed(() => {
  return (refundsQuery.data.value || []).length
})

const totalEscrow = computed(() => {
  return financialSummary.value?.escrow?.balance || 0
})

const todayEscrowText = computed(() => {
  const activeCount = financialSummary.value?.escrow?.activeOrderCount || 0
  return `${activeCount} Pesanan Aktif`
})

const growthText = computed(() => {
  const growth = financialSummary.value?.revenue?.growth?.revenuePercent || 0
  return `${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)} %`
})

const platformRevenue = computed(() => {
  return financialSummary.value?.revenue?.current?.platformRevenue || 0
})

const completedOrderCount = computed(() => {
  return financialSummary.value?.revenue?.current?.completedCount || 0
})

const recentActivities = computed(() => {
  const txs = (allTransactionsQuery.data.value || []).slice(0, 5).map((t: any) => ({
    date: new Date(t.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    desc: `Order #${t.orderId} Payment`,
    amount: formatPrice(t.amount),
    type: 'Pemasukan',
    typeColor: 'text-teal-600',
    typeIcon: '↓',
    status: t.status === 'VERIFIED' ? 'Selesai' : (t.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'),
    statusColor: t.status === 'VERIFIED' ? 'bg-teal-50 text-teal-700 border-teal-200' : (t.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200')
  }))
  return txs
})

function formatPrice(val: any) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4 h-16">
      <h1 class="text-[22px] font-semibold text-gray-900">Dashboard Overview</h1>
      <button class="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span class="absolute top-2 right-2.5 w-2 h-2 rounded-full border border-white bg-red-500"></span>
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Pembayaran Masuk Tertunda -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ pendingPaymentsCount }} item</p>
          <p class="text-sm text-gray-500 mt-1">Pembayaran Masuk Tertunda</p>
        </div>
      </div>

      <!-- Penarikan Dana Tertunda -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div class="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ pendingWithdrawalsCount }} permintaan</p>
          <p class="text-sm text-gray-500 mt-1">Penarikan Dana Tertunda</p>
        </div>
      </div>

      <!-- Antrian Refund -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ approvedRefundsCount }} disetujui</p>
          <p class="text-sm text-gray-500 mt-1">Antrian Refund (Pengembalian Dana)</p>
        </div>
      </div>

      <!-- Platform Revenue -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ formatPrice(platformRevenue) }}</p>
          <p class="text-sm text-gray-500 mt-1">Pendapatan Platform (Komisi)</p>
        </div>
      </div>

      <!-- Sent Orders Count -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div class="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ completedOrderCount }} order</p>
          <p class="text-sm text-gray-500 mt-1">Order Terkirim & Selesai</p>
        </div>
      </div>

      <!-- Saldo Escrow -->
      <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 shadow-sm text-white flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ growthText }}</span>
        </div>
        <div class="mt-4">
          <p class="text-2xl font-bold">{{ formatPrice(totalEscrow) }}</p>
          <p class="text-white/80 text-sm mt-0.5">Saldo Escrow</p>
        </div>
        <div class="mt-3 pt-3 border-t border-white/20">
          <p class="text-lg font-bold">{{ todayEscrowText }}</p>
          <p class="text-white/70 text-xs">Total Berjalan</p>
        </div>
      </div>
    </div>

    <!-- Aktivitas Keuangan Terbaru -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 flex items-center justify-between border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-900">Aktivitas Keuangan Terbaru</h2>
        <button class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Deskripsi</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Jenis</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(tx, i) in recentActivities" :key="i" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ tx.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ tx.desc }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="tx.type === 'Pemasukan' ? 'text-gray-900' : 'text-red-500'">{{ tx.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="flex items-center gap-1" :class="tx.typeColor">
                  <span class="text-xs">{{ tx.typeIcon }}</span>
                  {{ tx.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="tx.statusColor" class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border">{{ tx.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex justify-end items-center gap-2">
        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
