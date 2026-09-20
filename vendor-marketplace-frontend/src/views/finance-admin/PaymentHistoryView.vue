<script setup lang="ts">
import { computed } from 'vue'
import { useTransactions } from '../../composables/useTransactions'

const { allTransactionsQuery } = useTransactions()
const transactions = computed(() => allTransactionsQuery.data.value || [])

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatPrice(val: any) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function getStatusClass(status: string) {
  if (status === 'VERIFIED') return 'bg-teal-50 text-teal-700 border-teal-200'
  if (status === 'REJECTED') return 'bg-red-50 text-red-600 border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function getStatusLabel(status: string) {
  if (status === 'VERIFIED') return 'Diverifikasi'
  if (status === 'REJECTED') return 'Ditolak'
  return 'Menunggu'
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto">
    <div class="flex items-center justify-between border-b border-gray-200 pb-4 h-16">
      <h1 class="text-[22px] font-semibold text-gray-900">Riwayat Pembayaran</h1>
    </div>

    <div v-if="allTransactionsQuery.isLoading.value" class="p-8 text-center bg-white rounded-2xl border border-gray-200 animate-pulse">
      <p class="text-gray-500 text-sm">Memuat data transaksi...</p>
    </div>

    <div v-else-if="transactions.length === 0" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div class="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
        <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h2 class="text-base font-bold text-gray-900 mb-1">Riwayat Pembayaran Kosong</h2>
      <p class="text-sm text-gray-500 max-w-sm">Belum ada data riwayat transaksi pembayaran di sistem.</p>
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1E3A8A]">#ORD-{{ tx.orderId }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ tx.user?.fullName || 'Pengguna' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{{ tx.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ formatPrice(tx.amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(tx.status)" class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border">{{ getStatusLabel(tx.status) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
