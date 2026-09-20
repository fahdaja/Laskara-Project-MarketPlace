<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdmin } from '../../composables/useAdmin'

const router = useRouter()
const route = useRoute()
const { pendingDisputesQuery, submitVerdictMutation, confirmVerdictMutation } = useAdmin()

const disputeId = Number(route.params.id)
const disputeData = ref<any>(null)

watch(
  () => pendingDisputesQuery.data.value,
  (list) => {
    if (list && !disputeData.value) {
      const found = list.find((d: any) => d.id === disputeId)
      if (found) {
        disputeData.value = { ...found }
      }
    }
  },
  { immediate: true }
)

const displayId = `#DS-${disputeId.toString().padStart(5, '0')}`

const showConfirmModal = ref(false)
const confirmAction = ref<'approve' | 'reject' | null>(null)

function goBack() {
  router.push('/admin-validator/disputes')
}

function handleAction(action: 'approve' | 'reject') {
  confirmAction.value = action
  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
  confirmAction.value = null
}

async function submitDecision() {
  if (!confirmAction.value) return

  const decision = confirmAction.value === 'approve' ? 'APPROVE_REFUND' : 'REJECT_COMPLAINT'
  
  await submitVerdictMutation.mutateAsync({
    id: disputeId,
    decision
  })
  
  if (disputeData.value) {
    disputeData.value.status = 'UNDER_REVIEW'
    disputeData.value.pendingVerdict = decision
  }
  
  closeConfirmModal()
}

async function handleConfirmVerdict() {
  await confirmVerdictMutation.mutateAsync(disputeId)
  goBack()
}
</script>

<template>
  <div v-if="disputeData" class="space-y-6 animate-fade-in w-full pb-20 max-w-[800px] mx-auto">
    
    <div class="flex items-center gap-4">
      <button @click="goBack" class="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-800 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <h1 class="text-xl font-bold">Detail Sengketa</h1>
    </div>

    <div class="flex items-center gap-4">
      <h2 class="text-3xl font-extrabold text-[#0B152A]">{{ displayId }}</h2>
      <div v-if="disputeData.status === 'UNDER_REVIEW'" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-100 bg-orange-50 text-xs font-bold text-orange-600">
        <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        Under Review (Perlu Konfirmasi)
      </div>
      <div v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-100 bg-yellow-50 text-xs font-bold text-yellow-600">
        <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
        Menunggu Keputusan
      </div>
    </div>

    <div class="bg-white rounded-[20px] p-8 border border-gray-100 shadow-sm">
      <h3 class="font-extrabold text-[#1E3A8A] text-lg mb-8">Informasi Pesanan</h3>
      
      <div class="space-y-6">
        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">GIG / LAYANAN</span>
          <span class="text-sm font-bold text-gray-800">{{ disputeData.order?.gig?.title || 'Pesanan Langsung' }}</span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">KLIEN</span>
          <span class="text-sm font-medium text-gray-800">{{ disputeData.order?.client?.fullName }} ({{ disputeData.order?.client?.email }})</span>
        </div>
        
        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">TOTAL PESANAN</span>
          <span class="text-base font-bold text-[#1E3A8A]">Rp {{ Number(disputeData.order?.totalAmount).toLocaleString() }}</span>
        </div>
        
        <div class="pt-2">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">ALASAN SENGKETA</span>
          <p class="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {{ disputeData.reason }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="disputeData.evidenceUrls" class="bg-[#F8F9FA] rounded-[20px] p-8 border border-gray-100">
      <h3 class="font-extrabold text-[#0B152A] text-lg mb-6">Bukti Pendukung</h3>
      
      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center text-white shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 text-sm">File Bukti</h4>
              <p class="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px]">{{ disputeData.evidenceUrls }}</p>
            </div>
          </div>
          <a :href="disputeData.evidenceUrls" target="_blank" class="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    </div>

    <div v-if="disputeData.status === 'UNDER_REVIEW'" class="space-y-4 pt-6">
      <div class="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm font-medium text-center">
        Verdict telah disiapkan: {{ disputeData.pendingVerdict === 'APPROVE_REFUND' ? 'Setujui Pengembalian Dana' : 'Tolak Keluhan' }}. Silakan konfirmasi untuk mengeksekusi.
      </div>
      <div class="flex justify-end gap-3">
        <button 
          @click="disputeData.status = 'OPEN'"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold py-3.5 px-8 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm"
        >
          Ubah Verdict
        </button>
        <button 
          @click="handleConfirmVerdict" 
          :disabled="confirmVerdictMutation.isPending.value"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-8 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm min-w-[200px]"
          style="background-color: #1E3A8A;"
        >
          {{ confirmVerdictMutation.isPending.value ? 'Mengonfirmasi...' : 'Konfirmasi & Eksekusi' }}
        </button>
      </div>
    </div>
    <div v-else class="flex flex-col items-end gap-3 pt-6">
      <button 
        @click="handleAction('approve')" 
        :disabled="submitVerdictMutation.isPending.value"
        class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-8 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm w-auto min-w-[280px]"
        style="background-color: #16A34A;"
      >
        {{ submitVerdictMutation.isPending.value ? 'Memproses...' : 'Setujui Pengembalian Dana (Refund)' }}
      </button>
      <button 
        @click="handleAction('reject')" 
        :disabled="submitVerdictMutation.isPending.value"
        class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-8 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm w-auto min-w-[280px]"
        style="background-color: #DC2626;"
      >
        {{ submitVerdictMutation.isPending.value ? 'Memproses...' : 'Tolak Keluhan (Lepaskan Dana)' }}
      </button>
    </div>

    <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
      <div class="absolute inset-0" @click="closeConfirmModal"></div>
      <div class="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in p-8 text-center">
        <div class="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#1E3A8A] mb-6">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Konfirmasi Putusan</h3>
        <p class="text-sm text-gray-500 mb-8">
          Apakah Anda yakin ingin <strong>{{ confirmAction === 'approve' ? 'menyetujui pengembalian dana (Refund)' : 'menolak keluhan (Lanjutkan Pembayaran)' }}</strong> untuk sengketa ini? Keputusan ini perlu dikonfirmasi lagi pada tahap berikutnya.
        </p>
        
        <div class="flex gap-3 w-full">
          <button @click="closeConfirmModal" class="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
            Batal
          </button>
          <button @click="submitDecision" :disabled="submitVerdictMutation.isPending.value" class="flex-1 py-3 px-4 bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
            {{ submitVerdictMutation.isPending.value ? 'Memproses...' : 'Ya, Lanjutkan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-20 text-center text-gray-500 animate-fade-in">
    Memuat data sengketa...
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
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>

