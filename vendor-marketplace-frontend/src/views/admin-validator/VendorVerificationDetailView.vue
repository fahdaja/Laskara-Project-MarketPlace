<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdmin } from '../../composables/useAdmin'

const router = useRouter()
const route = useRoute()
const { getMerchantByIdQuery, verifyMerchantMutation } = useAdmin()

const merchantId = Number(route.params.id)

const { data: merchant, isLoading, isError } = getMerchantByIdQuery(merchantId)

const parsedKyb = computed(() => {
  if (!merchant.value?.kybDocuments) return null
  try {
    return JSON.parse(merchant.value.kybDocuments)
  } catch (e) {
    return null
  }
})

const showRejectModal = ref(false)
const rejectStep = ref(1) // Step 1: select invalid data, Step 2: input rejection reason notes
const unmatchingData = ref<string[]>([]) // ['identity', 'portfolio']
const rejectionNotes = ref('')

const rejectReason = computed(() => {
  const categories: string[] = []
  if (unmatchingData.value.includes('identity')) {
    categories.push('- Dokumen Identitas tidak sesuai')
  }
  if (unmatchingData.value.includes('portfolio')) {
    categories.push('- Portofolio tidak sesuai')
  }
  
  const header = categories.length > 0 
    ? 'Data yang tidak sesuai:\n' + categories.join('\n') + '\n\nCatatan perbaikan:\n' 
    : 'Catatan perbaikan:\n'
    
  return header + rejectionNotes.value.trim()
})

function goBack() {
  router.push('/admin-validator/vendor-verification')
}

function openRejectModal() {
  showRejectModal.value = true
  rejectStep.value = 1
  unmatchingData.value = []
  rejectionNotes.value = ''
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectStep.value = 1
  unmatchingData.value = []
  rejectionNotes.value = ''
}

async function submitReject() {
  if (!rejectionNotes.value.trim()) return
  
  await verifyMerchantMutation.mutateAsync({
    id: merchantId,
    isApproved: false,
    rejectionReason: rejectReason.value
  })
  
  closeRejectModal()
  goBack()
}

async function submitApprove() {
  await verifyMerchantMutation.mutateAsync({
    id: merchantId,
    isApproved: true
  })
  goBack()
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="p-20 text-center text-gray-500 animate-pulse">
    <div class="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#1E3A8A] animate-spin mx-auto mb-4"></div>
    <p class="text-sm font-medium">Memuat data toko...</p>
  </div>

  <!-- Error state -->
  <div v-else-if="isError" class="p-20 text-center">
    <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
      <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
    </div>
    <p class="text-sm font-bold text-gray-700 mb-1">Toko tidak ditemukan</p>
    <p class="text-xs text-gray-400 mb-4">Data vendor tidak dapat dimuat.</p>
    <button @click="goBack" class="text-sm font-bold text-[#1E3A8A] hover:underline">← Kembali ke daftar</button>
  </div>

  <!-- Main content -->
  <div v-else-if="merchant" class="space-y-6 animate-fade-in w-full pb-20 max-w-[900px] mx-auto">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <button @click="goBack" class="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-800 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <h1 class="text-xl font-bold">Detail Verifikasi Vendor</h1>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          <img v-if="merchant.logoUrl" :src="merchant.logoUrl" alt="Logo" class="w-full h-full object-cover" />
          <span v-else class="text-xl font-bold text-gray-400">{{ merchant.shopName[0] }}</span>
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-[#0B152A]">{{ merchant.shopName }}</h2>
          <p class="text-sm text-gray-500">{{ merchant.user?.email }}</p>
        </div>
      </div>
      <!-- Dynamic status badge -->
      <div
        class="px-4 py-1.5 rounded-full text-xs font-bold border"
        :class="{
          'bg-orange-50 text-orange-600 border-orange-100': merchant.status === 'PENDING_VERIFICATION',
          'bg-green-50 text-green-600 border-green-100': merchant.status === 'ACTIVE',
          'bg-red-50 text-red-600 border-red-100': merchant.status === 'REJECTED',
          'bg-gray-50 text-gray-600 border-gray-200': !['PENDING_VERIFICATION','ACTIVE','REJECTED'].includes(merchant.status),
        }"
      >
        {{ merchant.status === 'PENDING_VERIFICATION' ? 'Menunggu Verifikasi' : merchant.status === 'ACTIVE' ? 'Disetujui' : merchant.status === 'REJECTED' ? 'Ditolak' : merchant.status }}
      </div>
    </div>

    <!-- Dokumen Verifikasi -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <h3 class="font-extrabold text-gray-900 text-[15px]">Dokumen Verifikasi</h3>
      </div>
      <div class="p-6 space-y-4">
        <!-- KTM / SK -->
        <div class="border border-gray-100 rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1E3A8A]">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
            </div>
            <div>
              <h4 class="font-extrabold text-gray-900 text-sm">KTM / SK Organisasi</h4>
              <p class="text-xs text-gray-500 mt-0.5 truncate max-w-[300px]">{{ parsedKyb?.kybDocumentUrl || 'Tidak ada file' }}</p>
            </div>
          </div>
          <a v-if="parsedKyb?.kybDocumentUrl" :href="parsedKyb.kybDocumentUrl" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
            Buka File
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>

        <!-- Portofolio -->
        <div class="border border-gray-100 rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1E3A8A]">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
            <div>
              <h4 class="font-extrabold text-gray-900 text-sm">Website Portofolio</h4>
              <p class="text-xs text-gray-500 mt-0.5 truncate max-w-[300px]">{{ parsedKyb?.portfolioUrl || 'Tidak ada link' }}</p>
            </div>
          </div>
          <a v-if="parsedKyb?.portfolioUrl" :href="parsedKyb.portfolioUrl" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
            Buka Link
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Informasi Bisnis -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <h3 class="font-extrabold text-gray-900 text-[15px]">Informasi Bisnis</h3>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Pemilik</p>
          <p class="font-extrabold text-gray-900 text-sm">{{ merchant.user?.fullName }}</p>
        </div>
        <div>
          <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Terdaftar Pada</p>
          <p class="font-extrabold text-gray-900 text-sm">{{ new Date(merchant.createdAt).toLocaleDateString() }}</p>
        </div>
        <div class="col-span-full">
          <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deskripsi Toko</p>
          <p class="font-medium text-gray-700 text-sm leading-relaxed">{{ merchant.description || 'Tidak ada deskripsi' }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Actions — only shown for PENDING_VERIFICATION -->
    <div v-if="merchant.status === 'PENDING_VERIFICATION'" class="flex flex-col items-end gap-3 mt-8 pt-4">
      <button 
        @click="submitApprove" 
        :disabled="verifyMerchantMutation.isPending.value"
        class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-10 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm w-auto min-w-[200px]"
      >
        {{ verifyMerchantMutation.isPending.value ? 'Memproses...' : 'Setujui Vendor' }}
      </button>
      <button 
        @click="openRejectModal" 
        :disabled="verifyMerchantMutation.isPending.value"
        class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-10 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm w-auto min-w-[200px]"
      >
        Tolak Pengajuan
      </button>
    </div>

    <!-- Info banner for non-pending merchants -->
    <div v-else class="mt-8 pt-4 flex justify-end">
      <div class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-500 font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Vendor ini sudah diproses — tidak ada aksi yang tersedia
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
      <div class="absolute inset-0" @click="closeRejectModal"></div>
      <div class="relative w-full max-w-[450px] bg-white rounded-[20px] shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-[#DF4A4A] px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button v-if="rejectStep === 2" @click="rejectStep = 1" class="text-white hover:text-red-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 class="text-white font-bold text-lg">Tolak Pengajuan</h3>
          </div>
          <button @click="closeRejectModal" class="text-white hover:text-red-200 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Step 1: Select Invalid Data -->
        <div v-if="rejectStep === 1" class="p-8">
          <p class="text-sm font-bold text-gray-900 mb-5">Tandai data yang tidak sesuai</p>
          
          <div class="space-y-4 mb-8">
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" value="identity" v-model="unmatchingData" class="w-5 h-5 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]" />
              <span class="text-sm font-medium text-gray-700">Dokumen identitas</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" value="portfolio" v-model="unmatchingData" class="w-5 h-5 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]" />
              <span class="text-sm font-medium text-gray-700">Portofolio</span>
            </label>
          </div>
          
          <div class="flex justify-end">
            <button 
              @click="rejectStep = 2" 
              :disabled="unmatchingData.length === 0"
              class="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm shadow-sm"
            >
              Lanjut
            </button>
          </div>
        </div>

        <!-- Step 2: Input Notes -->
        <div v-else class="p-8">
          <p class="text-xs text-gray-500 leading-relaxed mb-6">Berikan alasan yang jelas agar merchant dapat melakukan perbaikan data.</p>
          
          <div class="space-y-2 mb-6">
            <label class="block text-xs font-bold text-gray-900 uppercase tracking-wider">Catatan</label>
            <textarea 
              v-model="rejectionNotes"
              rows="4"
              placeholder="Tulis instruksi perbaikan untuk customer di sini..."
              class="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DF4A4A] focus:border-transparent resize-none bg-white placeholder-gray-400 text-gray-700"
            ></textarea>
          </div>
          
          <div class="flex justify-end">
            <button 
              @click="submitReject" 
              :disabled="verifyMerchantMutation.isPending.value || !rejectionNotes.trim()"
              class="bg-[#DF4A4A] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm shadow-sm"
            >
              {{ verifyMerchantMutation.isPending.value ? 'Memproses...' : 'Tolak' }}
            </button>
          </div>
        </div>
      </div>
    </div>
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
