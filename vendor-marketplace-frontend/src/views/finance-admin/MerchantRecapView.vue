<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchants } from '../../composables/useMerchants'

const router = useRouter()
const { data: rawMerchants } = useMerchants()
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 9

const merchants = computed(() => {
  if (!rawMerchants.value) return []
  return rawMerchants.value.map((m: any) => ({
    id: m.id,
    name: m.shopName,
    status: m.status === 'VERIFIED' ? 'Aktif' : 'Menunggu',
    joinDate: new Date(m.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    color: '#2A437E',
    initial: m.shopName?.charAt(0).toUpperCase() || 'M'
  }))
})

const filteredMerchants = computed(() => {
  let result = merchants.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((m: any) => m.name.toLowerCase().includes(q))
  }
  if (statusFilter.value !== 'all') {
    result = result.filter((m: any) => m.status === statusFilter.value)
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredMerchants.value.length / itemsPerPage) || 1)

const paginatedMerchants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredMerchants.value.slice(start, start + itemsPerPage)
})

const paginationPages = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1, 2, 3]
  if (total > 7) pages.push('...')
  if (total > 3) pages.push(total - 2, total - 1, total)
  return pages
})

function goToDetail(merchantId: number) {
  router.push(`/finance-admin/merchant-recap/${merchantId}`)
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans">
    <!-- Header -->
    <div class="mb-2">
      <h1 class="text-2xl font-semibold text-gray-800">Rekap Merchant</h1>
    </div>

    <!-- Content Container -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

      <!-- Search & Filter Row -->
      <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama Merchant"
            class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A437E]/20 focus:border-[#2A437E] transition-all"
          />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <select
            v-model="statusFilter"
            class="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2A437E]/20 focus:border-[#2A437E] cursor-pointer transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Merchant Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="merchant in paginatedMerchants"
          :key="merchant.id"
          class="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-gray-300 transition-all duration-200"
        >
          <!-- Merchant Info -->
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              :style="{ backgroundColor: merchant.color }"
            >
              {{ merchant.initial }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-gray-900 truncate">{{ merchant.name }}</h3>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                  {{ merchant.status }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Bergabungkan sejak {{ merchant.joinDate }}</p>
            </div>
          </div>

          <!-- Action Button -->
          <button
            @click="goToDetail(merchant.id)"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
          >
            Lihat Rekap
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedMerchants.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="text-gray-500 font-medium">Tidak ada merchant ditemukan</p>
        <p class="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredMerchants.length > 0" class="flex items-center justify-between pt-4 border-t border-gray-100">
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
