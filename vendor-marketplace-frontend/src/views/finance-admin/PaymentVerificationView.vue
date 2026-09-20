<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactions } from '../../composables/useTransactions'

const { allTransactionsQuery, verifyTransactionMutation } = useTransactions()
const isLoading = allTransactionsQuery.isLoading
const activeTab = ref('All')
const tabs = ['All', 'Menunggu', 'Disetujui', 'Ditolak']

const mappedRequests = computed(() => {
  const transactions = allTransactionsQuery.data.value || []
  return transactions.map((tx: any) => {
    let humanStatus = 'Menunggu'
    if (tx.status === 'VERIFIED') humanStatus = 'Disetujui'
    if (tx.status === 'REJECTED') humanStatus = 'Ditolak'
    
    return {
      id: tx.id,
      orderId: tx.orderId,
      pemohon: tx.user?.fullName || `User #${tx.userId}`,
      email: tx.user?.email || '-',
      status: humanStatus,
      rawStatus: tx.status,
      total: tx.amount,
      bank: tx.proofUrl ? 'Manual Transfer' : 'Midtrans',
      paymentId: `TX-${tx.id}`,
      proofUrl: tx.proofUrl,
      verificationNote: tx.verificationNote,
      createdAt: tx.createdAt
    }
  })
})

const filteredRequests = computed(() => {
  if (activeTab.value === 'All') return mappedRequests.value
  return mappedRequests.value.filter((r: any) => r.status === activeTab.value)
})

// Modal State
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const selectedRequest = ref<any>(null)
const rejectReason = ref('')
const isActioning = ref(false)

function openAccept(req: any) {
  selectedRequest.value = req
  showAcceptModal.value = true
}

function openReject(req: any) {
  selectedRequest.value = req
  rejectReason.value = ''
  showRejectModal.value = true
}

async function confirmAccept() {
  if (!selectedRequest.value) return
  isActioning.value = true
  try {
    await verifyTransactionMutation.mutateAsync({
      id: selectedRequest.value.id,
      status: 'VERIFIED'
    })
    showAcceptModal.value = false
  } catch (err: any) {
    console.error('Failed to verify transaction', err)
    alert(err.response?.data?.message || 'Gagal menyetujui transaksi.')
  } finally {
    isActioning.value = false
  }
}

async function confirmReject() {
  if (!selectedRequest.value) return
  isActioning.value = true
  try {
    await verifyTransactionMutation.mutateAsync({
      id: selectedRequest.value.id,
      status: 'REJECTED',
      verificationNote: rejectReason.value.trim()
    })
    showRejectModal.value = false
  } catch (err: any) {
    console.error('Failed to reject transaction', err)
    alert(err.response?.data?.message || 'Gagal menolak transaksi.')
  } finally {
    isActioning.value = false
  }
}

function formatPrice(val: any) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function getStatusClass(status: string) {
  switch (status) {
    case 'Disetujui': return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    case 'Menunggu': return 'text-amber-700 bg-amber-50 border border-amber-200'
    case 'Ditolak': return 'text-red-700 bg-red-50 border border-red-200'
    default: return 'text-gray-700 bg-gray-50'
  }
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'Disetujui': return 'bg-emerald-500'
    case 'Menunggu': return 'bg-amber-500'
    case 'Ditolak': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans">
    
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-800">Daftar Permintaan Verifikasi Pembayaran Manual</h1>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 flex gap-8">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="pb-4 text-sm font-semibold transition-colors relative"
        :class="activeTab === tab ? 'text-indigo-900' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab }}
        <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-900 rounded-t-full"></div>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center bg-white rounded-xl border border-gray-100">
      <p class="text-gray-500 text-sm">Memuat data transaksi...</p>
    </div>

    <!-- Table Container -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      <!-- Badge User Count -->
      <div class="p-5 border-b border-gray-100 flex items-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
          {{ filteredRequests.length }} Transaksi
        </span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500">
              <th class="px-6 py-4">Nama Pemohon</th>
              <th class="px-6 py-4">Status <span class="text-gray-400">↓</span></th>
              <th class="px-6 py-4">Nominal Tagihan</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Tipe Bayar</th>
              <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="req in filteredRequests" :key="req.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-5">
                <span class="text-sm font-bold text-gray-900">{{ req.pemohon }}</span>
              </td>
              <td class="px-6 py-5">
                <span :class="getStatusClass(req.status)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(req.status)"></span>
                  {{ req.status }}
                </span>
              </td>
              <td class="px-6 py-5">
                <span class="text-sm font-bold text-gray-700">{{ formatPrice(req.total) }}</span>
              </td>
              <td class="px-6 py-5">
                <span class="text-sm font-medium text-gray-600">{{ req.email }}</span>
              </td>
              <td class="px-6 py-5">
                <span class="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">{{ req.bank }}</span>
              </td>
              <td class="px-6 py-5">
                <div class="flex items-center justify-center gap-3">
                  <button 
                    @click="openAccept(req)"
                    :disabled="req.rawStatus !== 'PENDING'"
                    class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors"
                  >
                    Terima
                  </button>
                  <button 
                    @click="openReject(req)"
                    :disabled="req.rawStatus !== 'PENDING'"
                    class="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors"
                  >
                    Tolak
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRequests.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-sm text-gray-500">
                Tidak ada transaksi ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Backdrop -->
      <div v-if="showAcceptModal || showRejectModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        
        <!-- Accept Modal -->
        <div v-if="showAcceptModal && selectedRequest" class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
          <!-- Header -->
          <div class="bg-[#2A437E] px-6 py-4 flex items-center justify-between text-white">
            <h3 class="font-bold text-lg">Konfirmasi Pembayaran</h3>
            <button @click="showAcceptModal = false" class="text-white/80 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- Warning -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 text-sm text-gray-600">
              <svg class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p>Pastikan nominal transfer di mutasi rekening bank sesuai dengan bukti yang diunggah customer.</p>
            </div>

            <!-- Data Box -->
            <div class="border border-gray-200 rounded-xl p-5 space-y-3">
              <p class="font-bold text-gray-900 mb-2">Data Pembayaran:</p>
              <ul class="space-y-3 text-sm text-gray-800 font-medium">
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-gray-800 rounded-full"></span> Pemohon: {{ selectedRequest.pemohon }}</li>
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-gray-800 rounded-full"></span> ID Transaksi: {{ selectedRequest.paymentId }}</li>
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-gray-800 rounded-full"></span> Total: {{ formatPrice(selectedRequest.total) }}</li>
                <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-gray-800 rounded-full"></span> Tipe: {{ selectedRequest.bank }}</li>
              </ul>
            </div>

            <!-- Bukti Attachment -->
            <div class="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden">
                  <img v-if="selectedRequest.proofUrl" :src="selectedRequest.proofUrl" class="w-full h-full object-cover" alt="Proof" />
                  <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p class="font-bold text-sm text-gray-900">Bukti Pembayaran</p>
                  <p class="text-xs text-gray-400 mt-0.5" v-if="selectedRequest.proofUrl">Klik tombol di samping untuk melihat ukuran penuh</p>
                  <p class="text-xs text-gray-400 mt-0.5" v-else>Tidak ada berkas bukti diunggah</p>
                </div>
              </div>
              <a v-if="selectedRequest.proofUrl" :href="selectedRequest.proofUrl" target="_blank" class="text-gray-400 hover:text-indigo-600 transition-colors" title="Buka di tab baru">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>

            <div class="flex justify-end gap-3 mt-2">
              <button @click="showAcceptModal = false" class="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button @click="confirmAccept" :disabled="isActioning" class="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">
                <span v-if="isActioning">Memproses...</span>
                <span v-else>Setujui</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Reject Modal -->
        <div v-if="showRejectModal && selectedRequest" class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up flex flex-col">
          <!-- Header -->
          <div class="bg-red-500 px-6 py-4 flex items-center justify-between text-white">
            <h3 class="font-bold text-lg">Tolak Pembayaran</h3>
            <button @click="showRejectModal = false" class="text-white/80 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-6 space-y-6 flex-1 flex flex-col">
            <p class="text-gray-600 text-sm font-medium">Berikan alasan penolakan yang jelas agar customer dapat memahami alasannya.</p>
            
            <div class="space-y-2 flex-1 flex flex-col">
              <label class="font-bold text-gray-900 text-sm">Alasan Penolakan</label>
              <textarea 
                v-model="rejectReason"
                rows="5"
                class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none flex-1 placeholder-gray-400"
                placeholder="Tulis alasan penolakan di sini..."
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button @click="showRejectModal = false" class="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button 
                @click="confirmReject" 
                :disabled="!rejectReason.trim() || isActioning"
                class="px-8 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                <span v-if="isActioning">Memproses...</span>
                <span v-else>Tolak</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
