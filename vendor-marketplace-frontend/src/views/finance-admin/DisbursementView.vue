<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWithdrawals } from '../../composables/useWithdrawals'

const { pendingWithdrawalsQuery, completeWithdrawalMutation, rejectWithdrawalMutation } = useWithdrawals()

const currentView = ref<'list' | 'detail'>('list')
const selectedRequest = ref<any>(null)
const proofUrl = ref('')
const errorMsg = ref('')

const requests = computed(() => pendingWithdrawalsQuery.data.value || [])

function viewDetail(req: any) {
  selectedRequest.value = req
  proofUrl.value = ''
  errorMsg.value = ''
  currentView.value = 'detail'
}

function goBack() {
  currentView.value = 'list'
  selectedRequest.value = null
  errorMsg.value = ''
}

async function handleComplete() {
  if (!selectedRequest.value || !proofUrl.value.trim()) return
  try {
    await completeWithdrawalMutation.mutateAsync({
      id: selectedRequest.value.id,
      proofUrl: proofUrl.value
    })
    goBack()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal memproses penarikan.'
  }
}

async function handleReject() {
  if (!selectedRequest.value) return
  try {
    await rejectWithdrawalMutation.mutateAsync(selectedRequest.value.id)
    goBack()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal menolak penarikan.'
  }
}

function formatCurrency(amount: any) {
  if (!amount) return 'Rp 0'
  return `Rp ${Number(amount).toLocaleString('id-ID')}`
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans animate-fade-in">
    <template v-if="currentView === 'list'">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Permintaan Pencairan Dana</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar pengajuan penarikan dana dari merchant yang perlu diproses.</p>
      </div>

      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex items-center justify-between">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-[#1E3A8A] bg-blue-50 border border-blue-100">
            {{ requests.length }} Pengajuan Menunggu
          </span>
        </div>

        <div v-if="pendingWithdrawalsQuery.isLoading.value" class="p-12 text-center text-gray-500">
          Memuat data pengajuan...
        </div>

        <div v-else-if="requests.length === 0" class="p-16 text-center text-gray-400">
          Tidak ada pengajuan pencairan dana yang menunggu persetujuan.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th class="px-6 py-4">Nama Toko</th>
                <th class="px-6 py-4">Rekening Tujuan</th>
                <th class="px-6 py-4">Nominal</th>
                <th class="px-6 py-4">Tanggal Diajukan</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-5">
                  <span class="text-sm font-bold text-gray-900">{{ req.merchant?.shopName }}</span>
                </td>
                <td class="px-6 py-5">
                  <div class="text-sm font-medium text-gray-800">{{ req.bankAccount?.bankName }}</div>
                  <div class="text-xs text-gray-500">{{ req.bankAccount?.accountNumber }} a/n {{ req.bankAccount?.accountHolderName }}</div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm font-extrabold text-[#1E3A8A]">{{ formatCurrency(req.amount) }}</span>
                </td>
                <td class="px-6 py-5 text-xs text-gray-500">
                  {{ formatDate(req.createdAt) }}
                </td>
                <td class="px-6 py-5 text-center">
                  <button 
                    @click="viewDetail(req)"
                    class="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Proses
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-else-if="currentView === 'detail' && selectedRequest">
      <div class="space-y-6 max-w-4xl mx-auto">
        <button @click="goBack" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors mb-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Daftar
        </button>

        <div class="flex flex-col lg:flex-row gap-6">
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pemilik Toko</span>
              <h2 class="text-2xl font-extrabold text-gray-900 mt-1">{{ selectedRequest.merchant?.shopName }}</h2>
              <p class="text-xs text-gray-400 mt-1">ID Merchant: #{{ selectedRequest.merchant?.id }}</p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-blue-600 to-[#1E3A8A] rounded-3xl p-8 shadow-lg text-white flex-1 relative overflow-hidden">
            <span class="text-xs text-blue-200 uppercase tracking-widest font-bold block">Nominal Pencairan</span>
            <h3 class="text-3xl font-extrabold mt-2">{{ formatCurrency(selectedRequest.amount) }}</h3>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-8 py-5 border-b border-gray-50 flex items-center gap-2">
            <svg class="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            <h3 class="font-bold text-gray-900">Rekening Tujuan Transfer</h3>
          </div>
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">BANK NAME</p>
                <p class="font-extrabold text-gray-800 mt-1">{{ selectedRequest.bankAccount?.bankName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">ACCOUNT NUMBER</p>
                <p class="font-extrabold text-gray-800 mt-1">{{ selectedRequest.bankAccount?.accountNumber }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">NAMA PENERIMA</p>
                <p class="font-extrabold text-gray-800 mt-1">{{ selectedRequest.bankAccount?.accountHolderName }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <h3 class="font-bold text-gray-900 text-lg">Proses Penarikan</h3>
            <p class="text-sm text-gray-500 mt-1">Masukkan URL bukti transfer untuk menyetujui, atau tolak penarikan jika bermasalah.</p>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">URL Bukti Transfer</label>
              <input 
                v-model="proofUrl"
                type="text"
                placeholder="Masukkan link/url bukti pembayaran..."
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all"
              />
            </div>

            <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
              {{ errorMsg }}
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button 
                @click="handleReject"
                :disabled="rejectWithdrawalMutation.isPending.value || completeWithdrawalMutation.isPending.value"
                class="px-6 py-3.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-all"
              >
                Tolak Penarikan
              </button>
              <button 
                @click="handleComplete"
                :disabled="completeWithdrawalMutation.isPending.value || rejectWithdrawalMutation.isPending.value || !proofUrl.trim()"
                class="px-8 py-3.5 bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                Setujui & Selesaikan
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
