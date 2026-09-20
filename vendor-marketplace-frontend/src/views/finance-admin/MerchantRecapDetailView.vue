<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMerchantDetail, useMerchantFinancial, useMerchantWithdrawals } from '../../composables/useMerchants'

const router = useRouter()
const route = useRoute()
const merchantId = route.params.id as string

const merchantQuery = useMerchantDetail(merchantId)
const financialQuery = useMerchantFinancial(merchantId)
const withdrawalsQuery = useMerchantWithdrawals(merchantId)

const merchant = computed(() => merchantQuery.data.value)
const financial = computed(() => financialQuery.data.value)
const transactions = computed(() => withdrawalsQuery.data.value || [])

const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(transactions.value.length / 10) || 1)

const paginationPages = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1, 2, 3]
  pages.push('...')
  pages.push(total - 2, total - 1, total)
  return pages
})

const summaryCards = computed(() => [
  {
    label: 'Pendapatan Aplikasi',
    value: financial.value ? formatPrice(financial.value.appRevenue) : '-',
    description: 'Pendapatan yang diperoleh aplikasi dari fee/komisi dari merchant',
    color: '#2A437E',
    iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
  },
  {
    label: 'Pendapatan Merchant',
    value: financial.value ? formatPrice(financial.value.merchantRevenue) : '-',
    description: null,
    saldoOnHold: financial.value ? formatPrice(financial.value.onHoldBalance) : null,
    color: '#16A34A',
    iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    label: 'Total Transaksi',
    value: financial.value ? formatPrice(financial.value.totalTransactions) : '-',
    description: 'Gabungan total transaksi dari aplikasi dan merchant',
    color: '#0EA5E9',
    iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    label: 'Dana Sudah Dicairkan',
    value: financial.value ? formatPrice(financial.value.disbursed) : '-',
    description: 'Total dana yang telah dicarikan ke rekening Merchant',
    color: '#EA580C',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
])

function formatPrice(val: any) {
  if (!val && val !== 0) return '-'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function goBack() {
  router.push('/finance-admin/merchant-recap')
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans">
    <!-- Back Button -->
    <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Merchant Header Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="!merchant" class="text-sm text-gray-400">Memuat data merchant...</div>
      <div v-else class="flex items-center gap-4">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 bg-[#2A437E]"
        >
          {{ merchant.shopName?.slice(0, 2).toUpperCase() || 'M' }}
        </div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-black text-gray-900">{{ merchant?.shopName }}</h1>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            {{ merchant?.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(card, idx) in summaryCards"
        :key="idx"
        class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
      >
        <!-- Icon -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :style="{ backgroundColor: card.color + '12' }"
        >
          <svg class="w-5 h-5" :style="{ color: card.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="card.iconPath" />
          </svg>
        </div>

        <!-- Label -->
        <p class="text-sm font-semibold text-gray-700">{{ card.label }}</p>

        <!-- Value -->
        <p class="text-2xl font-bold" :style="{ color: card.color }">{{ card.value }}</p>

        <!-- Saldo On-Hold (for Pendapatan Merchant) -->
        <template v-if="card.saldoOnHold">
          <div>
            <p class="text-xs font-bold text-blue-600 uppercase tracking-wider">SALDO ON-HOLD</p>
            <p class="text-sm font-bold text-gray-900">{{ card.saldoOnHold }}</p>
          </div>
        </template>

        <!-- Description -->
        <p v-if="card.description" class="text-xs text-gray-500 leading-relaxed">{{ card.description }}</p>
      </div>
    </div>

    <!-- Transaction Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-100 text-xs font-semibold text-gray-500">
              <th class="px-6 py-4">Nama Vendor</th>
              <th class="px-6 py-4">
                Status
                <svg class="w-3 h-3 inline-block ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>
              <th class="px-6 py-4">Jumlah Penarikan</th>
              <th class="px-6 py-4">Tanggal Permintaan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(tx, i) in transactions" :key="i" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-5">
                <span class="text-sm font-bold text-gray-900">{{ tx.merchant?.shopName || tx.merchantName || '-' }}</span>
              </td>
              <td class="px-6 py-5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {{ tx.status }}
                </span>
              </td>
              <td class="px-6 py-5">
                <span class="text-sm font-medium text-gray-700">{{ formatPrice(tx.amount) }}</span>
              </td>
              <td class="px-6 py-5">
                <span class="text-sm text-gray-500">{{ formatDate(tx.createdAt) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>

        <div class="flex items-center gap-1">
          <template v-for="(page, idx) in paginationPages" :key="idx">
            <span v-if="page === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
            <button
              v-else
              @click="currentPage = Number(page)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              :class="currentPage === page ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50'"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
