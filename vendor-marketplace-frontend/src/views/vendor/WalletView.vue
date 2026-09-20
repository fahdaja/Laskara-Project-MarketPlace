<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWallet } from '../../composables/useWallet'
import { useWithdrawals } from '../../composables/useWithdrawals'
import { useTransactions } from '../../composables/useTransactions'
import Toast from '../../components/ui/Toast.vue'

const route = useRoute()
const { merchantProfileQuery } = useWallet()
const { myWithdrawalsQuery, requestWithdrawalMutation } = useWithdrawals()
const { myTransactionsQuery } = useTransactions()

// Dynamic View Detection
const isHistoryPage = computed(() => route.path === '/vendor/finance/history')

// Withdraw Form State
const nominal = ref<number | null>(null)
const selectedBankAccountId = ref<number | null>(null)
const isPinModalOpen = ref(false)
const pinDigits = ref<string[]>([])
const showSuccessToast = ref(false)
const errorMsg = ref('')

const balance = computed(() => {
  return Number(merchantProfileQuery.data.value?.walletBalance || 0)
})

const pendingBalance = computed(() => {
  return Number(merchantProfileQuery.data.value?.pendingBalance || 0)
})

const hasPin = computed(() => {
  return !!merchantProfileQuery.data.value?.withdrawalPin
})

const bankAccounts = computed(() => {
  return merchantProfileQuery.data.value?.bankAccounts || []
})

// Pagination State
const currentPage = ref(1)
const itemsPerPage = 8

watch(() => bankAccounts.value, (newVal) => {
  if (newVal && newVal.length > 0) {
    const primary = newVal.find((b: any) => b.isPrimary)
    selectedBankAccountId.value = primary ? primary.id : newVal[0].id
  }
}, { immediate: true })

// Formatting Utilities
function formatCurrency(amount: any) {
  if (amount === undefined || amount === null) return 'Rp 0'
  return `Rp ${Number(amount).toLocaleString('id-ID')}`
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function getStatusLabel(status: string) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'VERIFIED':
      return 'Selesai'
    case 'REJECTED':
      return 'Ditolak'
    case 'PENDING':
      return 'Menunggu'
    case 'APPROVED':
    case 'DISETUJUI':
      return 'Disetujui'
    default:
      return status || 'Menunggu'
  }
}

function getStatusBadgeClass(status: string) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'VERIFIED':
    case 'APPROVED':
    case 'DISETUJUI':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    case 'REJECTED':
      return 'bg-rose-50 text-rose-600 border border-rose-100'
    case 'PENDING':
    default:
      return 'bg-amber-50 text-amber-600 border border-amber-100'
  }
}

// Unified Ledger Data
const mergedActivities = computed(() => {
  const list: any[] = []

  // Income Payments
  if (myTransactionsQuery.data.value) {
    myTransactionsQuery.data.value.forEach((tx: any) => {
      list.push({
        id: `tx-${tx.id}`,
        createdAt: tx.createdAt,
        description: `Order #${tx.orderId} Payment`,
        amount: Number(tx.amount),
        type: 'INCOME',
        status: tx.status,
        code: `TX-${tx.id}`
      })
    })
  }

  // Withdrawals
  if (myWithdrawalsQuery.data.value) {
    myWithdrawalsQuery.data.value.forEach((w: any) => {
      list.push({
        id: `wd-${w.id}`,
        createdAt: w.createdAt,
        description: `Penarikan Dana`,
        amount: Number(w.amount),
        type: 'OUTCOME',
        status: w.status,
        code: `TX-${w.id}`
      })
    })
  }

  // Sort by date descending
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Pagination
const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return mergedActivities.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(mergedActivities.value.length / itemsPerPage) || 1
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Withdraw Actions
const validateAndOpenPin = () => {
  errorMsg.value = ''
  if (!nominal.value || nominal.value <= 0) {
    errorMsg.value = 'Nominal harus lebih besar dari 0.'
    return
  }
  if (nominal.value < 50000) {
    errorMsg.value = 'Jumlah penarikan minimal adalah Rp 50.000.'
    return
  }
  if (nominal.value > balance.value) {
    errorMsg.value = 'Saldo wallet tidak mencukupi.'
    return
  }
  if (!selectedBankAccountId.value) {
    errorMsg.value = 'Pilih rekening bank tujuan.'
    return
  }
  isPinModalOpen.value = true
}

const handleNumberClick = (num: number) => {
  if (pinDigits.value.length < 6) {
    pinDigits.value.push(num.toString())
    if (pinDigits.value.length === 6) {
      setTimeout(handleConfirm, 350)
    }
  }
}

const handleDelete = () => {
  pinDigits.value.pop()
}

const handleConfirm = async () => {
  if (pinDigits.value.length === 6 && nominal.value && selectedBankAccountId.value) {
    const pin = pinDigits.value.join('')
    try {
      await requestWithdrawalMutation.mutateAsync({
        bankAccountId: selectedBankAccountId.value,
        amount: nominal.value,
        pin
      })
      isPinModalOpen.value = false
      pinDigits.value = []
      nominal.value = null
      showSuccessToast.value = true
      setTimeout(() => {
        showSuccessToast.value = false
      }, 3000)
    } catch (err: any) {
      errorMsg.value = err.response?.data?.message || 'Gagal memproses penarikan.'
      isPinModalOpen.value = false
      pinDigits.value = []
    }
  }
}

const closePinModal = () => {
  isPinModalOpen.value = false
  pinDigits.value = []
}
</script>

<template>
  <div class="py-8 px-4 max-w-6xl mx-auto font-sans animate-fade-in">
    <!-- View 1: Keuangan Page -->
    <div v-if="!isHistoryPage">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Keuangan</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola pendapatan toko, pantau saldo escrow, dan tarik dana ke rekening bank Anda.</p>
      </div>

      <div v-if="merchantProfileQuery.isLoading.value" class="p-12 text-center text-gray-500">
        Memuat data keuangan...
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Cards & Activity (2/3 width) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Balance Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-blue-100 rounded-3xl p-6 relative overflow-hidden shadow-sm h-[170px] flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]">
              <div class="relative z-10">
                <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Saldo Tersedia</span>
                <div class="text-3xl font-extrabold text-[#1E3A8A] mt-2">
                  {{ formatCurrency(balance) }}
                </div>
              </div>
              <div class="text-[#3B82F6] text-xs font-medium">
                Dana yang siap Anda tarik
              </div>
            </div>

            <div class="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-sm h-[170px] flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]">
              <div class="relative z-10">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Tertahan</span>
                <div class="text-3xl font-extrabold text-gray-800 mt-2">
                  {{ formatCurrency(pendingBalance) }}
                </div>
              </div>
              <div class="text-gray-400 text-xs font-medium">
                Dana dalam progres garansi/escrow
              </div>
            </div>
          </div>

          <!-- Latest Activities (Mock design styled with DB integration) -->
          <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-lg font-extrabold text-gray-900">Riwayat Transaksi</h2>
                <p class="text-xs text-gray-400 mt-0.5">Catatan aktivitas keuangan terbaru Anda</p>
              </div>
              <router-link to="/vendor/finance/history" class="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                Lihat Semua
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
              </router-link>
            </div>

            <div v-if="mergedActivities.length === 0" class="p-12 text-center text-gray-400">
              Belum ada riwayat transaksi keuangan.
            </div>

            <div v-else class="divide-y divide-gray-50">
              <div
                v-for="item in mergedActivities.slice(0, 4)"
                :key="item.id"
                class="py-4 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-gray-50/20 transition-all rounded-xl px-2 -mx-2"
              >
                <div class="flex items-center gap-4">
                  <!-- Icon Circle -->
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    :class="item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'"
                  >
                    <!-- Income Arrow -->
                    <svg v-if="item.type === 'INCOME'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <!-- Outcome Arrow -->
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>

                  <div class="space-y-0.5">
                    <div class="text-sm font-bold text-gray-900">
                      {{ item.type === 'INCOME' ? 'Pendapatan Proyek' : 'Penarikan Dana' }}
                    </div>
                    <div class="text-xs text-gray-400 font-medium">
                      {{ formatDate(item.createdAt).split(' ')[0] }} &bull; {{ item.code }}
                    </div>
                  </div>
                </div>

                <div class="text-right space-y-1">
                  <div
                    class="text-sm font-extrabold"
                    :class="item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'"
                  >
                    {{ item.type === 'INCOME' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
                  </div>
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold" :class="getStatusBadgeClass(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Withdraw Form (1/3 width) -->
        <div class="space-y-6">
          <div class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div class="flex items-center gap-2.5 pb-2 border-b border-gray-50">
              <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h3 class="text-md font-extrabold text-gray-900">Tarik Dana</h3>
                <p class="text-[10px] text-gray-400 font-medium">Minimal penarikan adalah Rp 50.000</p>
              </div>
            </div>

            <!-- PIN setup check / Bank accounts check -->
            <div v-if="!hasPin" class="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 text-center space-y-3">
              <p class="text-xs text-yellow-800 font-medium leading-relaxed">Safety PIN penarikan belum diatur di profil toko Anda.</p>
              <router-link to="/vendor/profile" class="inline-block bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm">
                Atur PIN Sekarang
              </router-link>
            </div>

            <div v-else-if="bankAccounts.length === 0" class="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center space-y-3">
              <p class="text-xs text-rose-800 font-medium leading-relaxed">Belum mendaftarkan rekening bank di profil toko Anda.</p>
              <router-link to="/vendor/profile" class="inline-block bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm">
                Daftarkan Rekening
              </router-link>
            </div>

            <div v-else class="space-y-4">
              <!-- Nominal Input -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Nominal Penarikan</label>
                <div class="relative">
                  <span class="absolute left-4 top-3 text-gray-400 font-extrabold text-sm">Rp</span>
                  <input
                    v-model.number="nominal"
                    type="number"
                    placeholder="0"
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 font-extrabold text-md transition-all placeholder-gray-300"
                  />
                </div>
              </div>

              <!-- Bank Selector -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Rekening Tujuan</label>
                <div class="relative">
                  <select
                    v-model="selectedBankAccountId"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 font-bold text-xs appearance-none"
                  >
                    <option v-for="bank in bankAccounts" :key="bank.id" :value="bank.id">
                      {{ bank.bankName }} - {{ bank.accountNumber }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <!-- Process Alert Info -->
              <div class="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-[10px] text-blue-800 leading-relaxed font-semibold">
                  Penarikan akan diproses maksimal dalam 1x24 jam hari kerja ke rekening terdaftar Anda.
                </p>
              </div>

              <div v-if="errorMsg" class="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-medium">
                {{ errorMsg }}
              </div>

              <button
                @click="validateAndOpenPin"
                class="w-full bg-[#3B82F6]/60 hover:bg-[#3B82F6] text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm font-extrabold text-sm active:scale-98"
              >
                <span>Konfirmasi Penarikan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View 2: Riwayat Transaksi Page -->
    <div v-else>
      <div class="mb-8">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <router-link to="/vendor/finance" class="hover:text-gray-900 transition-colors font-semibold">Keuangan</router-link>
          <span class="text-gray-300">&rsaquo;</span>
          <span class="text-gray-900 font-bold">Riwayat Transaksi</span>
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Riwayat Transaksi</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar lengkap seluruh arus keuangan masuk dari hasil proyek dan penarikan saldo keluar.</p>
      </div>

      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 class="text-md font-extrabold text-gray-900">Aktivitas Keuangan Terbaru</h2>
        </div>

        <div v-if="mergedActivities.length === 0" class="p-12 text-center text-gray-400">
          Belum ada aktivitas transaksi keuangan di sistem database.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 border-b border-gray-50">
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deskripsi</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Jumlah</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Jenis</th>
                <th class="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in paginatedActivities"
                :key="item.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors"
              >
                <td class="px-6 py-5 text-xs font-semibold text-gray-500">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="px-6 py-5 text-xs font-bold text-gray-900">
                  {{ item.description }}
                </td>
                <td
                  class="px-6 py-5 text-xs font-extrabold text-center"
                  :class="item.type === 'INCOME' ? 'text-gray-900' : 'text-rose-500'"
                >
                  {{ item.type === 'INCOME' ? '' : '-' }} {{ formatCurrency(item.amount) }}
                </td>
                <td class="px-6 py-5 text-center text-xs font-bold">
                  <span
                    class="flex items-center justify-center gap-1.5"
                    :class="item.type === 'INCOME' ? 'text-[#10B981]' : 'text-rose-500'"
                  >
                    <span>{{ item.type === 'INCOME' ? '⬇️' : '⬆' }}</span>
                    <span>{{ item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }}</span>
                  </span>
                </td>
                <td class="px-6 py-5 text-center">
                  <span class="inline-block px-3 py-1 rounded-full text-[10px] font-bold" :class="getStatusBadgeClass(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="p-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
          <span class="text-xs text-gray-400 font-medium">Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer bg-white"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer bg-white"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Safety PIN modal portal -->
    <Teleport to="body">
      <div v-if="isPinModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
        <div class="bg-[#1E3A8A] rounded-[40px] w-full max-w-[400px] p-10 shadow-2xl relative animate-scale-in text-center">
          <div class="mb-8">
            <h3 class="text-xl font-extrabold text-white">Masukkan Safety PIN</h3>
            <p class="text-white/60 text-xs mt-1">Masukkan 6 digit kode PIN keamanan Anda</p>
          </div>

          <div class="flex justify-center gap-4 mb-10">
            <div
              v-for="i in 6"
              :key="i"
              class="w-4 h-4 rounded-full transition-all duration-200"
              :class="pinDigits.length >= i ? 'bg-white scale-110 shadow-sm' : 'bg-white/20'"
            ></div>
          </div>

          <div class="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            <button
              v-for="n in 9"
              :key="n"
              @click="handleNumberClick(n)"
              class="w-14 h-14 rounded-full bg-white/10 text-white text-xl font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all mx-auto cursor-pointer"
            >
              {{ n }}
            </button>
            
            <button
              @click="closePinModal"
              class="w-14 h-14 rounded-full bg-red-600/20 text-red-200 flex items-center justify-center hover:bg-red-600/30 active:scale-95 transition-all mx-auto cursor-pointer"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <button
              @click="handleNumberClick(0)"
              class="w-14 h-14 rounded-full bg-white/10 text-white text-xl font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all mx-auto cursor-pointer"
            >
              0
            </button>

            <button
              @click="handleDelete"
              class="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all mx-auto cursor-pointer"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2H10.828a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success Toast Notification -->
    <Teleport to="body">
      <div
        v-if="showSuccessToast"
        class="fixed top-8 right-8 z-[300] animate-fade-in"
      >
        <Toast
          type="success"
          title="Berhasil!"
          subtitle="Permintaan penarikan telah dikirim."
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>
