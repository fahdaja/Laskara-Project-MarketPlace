<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import api from '../../api/axios'
import { useAuth } from '../../composables/useAuth'
import { useOrderDetail, useAcceptOrder } from '../../composables/useOrders'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const { uploadFile } = useAuth()
const queryClient = useQueryClient()

const { data: rawOrder, isLoading } = useOrderDetail(orderId)
const acceptMutation = useAcceptOrder()

const isSubmitting = ref(false)
const isAccepted = ref(false)

const order = computed(() => {
  if (!rawOrder.value) return null
  const found = rawOrder.value
  return {
    ...found,
    instructions: found.requirements?.notes || 'Tidak ada instruksi khusus dari pembeli.',
    planName: found.requirements?.plan || 'Standard Plan',
    chosenPrice: found.requirements?.price || found.totalAmount,
    attachments: found.requirements?.files
      ? found.requirements.files.split(',').map((url: string) => ({
          name: getFilename(url),
          url: url,
          size: 'Uploaded',
          type: getFileExtension(url).toLowerCase()
        }))
      : [],
    revisionHistory: found.revisions?.length > 0
      ? found.revisions
      : [{ type: 'started', label: 'PESANAN DIMULAI', time: formatDate(found.createdAt || new Date().toISOString()) }]
  }
})

watch(order, (newVal) => {
  if (newVal) {
     isAccepted.value = newVal.status !== 'UNPAID' && (newVal.status !== 'IN_PROGRESS' || !!newVal.acceptedAt)
  }
}, { immediate: true })

const showDeclineModal = ref(false)

const deliveryFiles = ref<{ name: string; size: string }[]>([])
const rawFiles = ref<File[]>([])
const deliveryMessage = ref('')
const isDragging = ref(false)

const steps = ref([
  { name: 'Dibayar', active: true, completed: true },
  { name: 'Pengerjaan', active: true, completed: false },
  { name: 'Dikirim', active: false, completed: false },
  { name: 'Selesai', active: false, completed: false }
])

const currentStep = computed(() => {
  if (!order.value) return 0
  switch (order.value.status) {
    case 'IN_PROGRESS': return 1
    case 'DELIVERED': return 2
    case 'COMPLETED': return 3
    default: return 0
  }
})

watch(currentStep, (val) => {
  steps.value.forEach((step, idx) => {
    step.completed = idx < val
    step.active = idx <= val
  })
}, { immediate: true })

function getFilename(url: string) {
  if (!url) return ''
  try {
    const parts = url.split('/')
    const lastPart = parts[parts.length - 1]
    const segment = lastPart ? lastPart.split('?')[0] : null
    return segment ? decodeURIComponent(segment) : 'attachment'
  } catch (e) {
    return 'attachment'
  }
}

function getFileExtension(url: string) {
  const filename = getFilename(url)
  const dotIdx = filename.lastIndexOf('.')
  return dotIdx !== -1 ? filename.substring(dotIdx + 1).toUpperCase() : 'FILE'
}

function formatPrice(val: any) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function acceptOrder() {
  try {
    isSubmitting.value = true
    await acceptMutation.mutateAsync(Number(orderId))
    isAccepted.value = true
    alert('Pesanan berhasil diterima!')
    queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menerima pesanan.')
  } finally {
    isSubmitting.value = false
  }
}

function declineOrder() {
  showDeclineModal.value = true
}

async function confirmDecline() {
  try {
    isSubmitting.value = true
    showDeclineModal.value = false
    await api.patch(`/orders/${orderId}/decline`)
    alert('Pesanan berhasil ditolak.')
    queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
    router.push('/vendor/associate/orders')
  } catch (err: any) {
    console.error('Failed to decline order', err)
    alert(err.response?.data?.message || 'Gagal menolak pesanan.')
  } finally {
    isSubmitting.value = false
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) processFiles(files)
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(input.files)
}

function processFiles(filesList: FileList) {
  for (let i = 0; i < filesList.length; i++) {
    const f = filesList[i]
    if (f) {
      rawFiles.value.push(f)
      deliveryFiles.value.push({
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(1) + ' MB',
      })
    }
  }
}

function removeFile(idx: number) {
  deliveryFiles.value.splice(idx, 1)
  rawFiles.value.splice(idx, 1)
}

async function submitDelivery() {
  if (rawFiles.value.length === 0) {
    alert('Silakan pilih setidaknya satu file untuk dikirim.')
    return
  }
  if (!deliveryMessage.value.trim()) {
    alert('Pesan untuk klien tidak boleh kosong.')
    return
  }
  isSubmitting.value = true
  try {
    for (const file of rawFiles.value) {
      const uploadRes = await uploadFile(file, 'deliverables')
      const fileUrl = uploadRes.url || uploadRes.data?.url
      if (!fileUrl) throw new Error('Gagal mengunggah file')
      await api.post('/deliverables', {
        orderId: Number(orderId),
        fileUrl: fileUrl,
        message: deliveryMessage.value
      })
    }
    queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
    alert('Hasil pekerjaan berhasil dikirim!')
    rawFiles.value = []
    deliveryFiles.value = []
    deliveryMessage.value = ''
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengirim hasil pekerjaan.')
  } finally {
    isSubmitting.value = false
  }
}

const status = computed(() => {
  if (!order.value) return ''
  const s = order.value.status
  if (s === 'UNPAID') return 'BARU'
  if (s === 'IN_PROGRESS') {
    return isAccepted.value ? 'PROSES' : 'BARU'
  }
  if (s === 'IN_REVISION') return 'REVISI'
  if (s === 'DELIVERED') return 'PROSES'
  if (s === 'COMPLETED') return 'SELESAI'
  if (s === 'REFUNDED' || s === 'CANCELLED') return 'BATAL'
  if (s === 'DISPUTE_IN_PROGRESS') return 'DISPUTE'
  return s
})

function goBack() {
  router.push('/vendor/associate/orders')
}
</script>

<template>
  <div class="p-12 space-y-10 bg-white min-h-screen pb-20 font-sans">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 text-gray-500">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-medium">Memuat detail pesanan...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!order" class="flex flex-col items-center justify-center py-12 text-gray-400">
      <p class="text-sm">Pesanan tidak ditemukan.</p>
    </div>

    <template v-else>
      <div v-if="status === 'BATAL'" class="bg-[#FEF2F2] border border-red-100 rounded-2xl p-10 flex items-start gap-8 animate-in fade-in slide-in-from-top-4 duration-500 mb-10">
        <div class="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center shrink-0">
          <svg class="w-8 h-8 text-[#991B1B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-[#991B1B]">Kasus Ditutup (Dibatalkan)</h3>
            <p class="text-sm font-bold text-[#991B1B]/60">Selesai - {{ formatDate(order.dispute?.resolvedAt || order.createdAt) }}</p>
          </div>
          <p class="text-base font-medium text-[#991B1B]/80 leading-relaxed max-w-2xl">
            Sengketa dibatalkan. Klien mengajukan pengembalian dana dan dana telah dikembalikan sepenuhnya ke saldo klien.
          </p>
        </div>
      </div>

      <div v-if="status === 'SELESAI'" class="bg-[#F0FDF4] border border-green-100 rounded-2xl p-10 flex items-start gap-8 animate-in fade-in slide-in-from-top-4 duration-500 mb-10">
        <div class="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center shrink-0">
          <svg class="w-8 h-8 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-[#166534]">Pesanan Selesai</h3>
            <p class="text-sm font-bold text-[#166534]/60">Selesai - {{ formatDate(order.deliveredAt || order.createdAt) }}</p>
          </div>
          <p class="text-base font-medium text-[#166534]/80 leading-relaxed max-w-2xl">
            Pesanan ini telah sukses diselesaikan. Dana bersih telah dicairkan ke saldo toko Anda.
          </p>
        </div>
      </div>

      <div v-if="status === 'DISPUTE'" class="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-8 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500 mb-10">
        <div class="w-14 h-14 bg-[#FFEDD5] rounded-2xl flex items-center justify-center shrink-0">
          <svg class="w-8 h-8 text-[#C2410C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-[#C2410C]">Client mengajukan komplain dan meminta refund</h3>
          <p class="text-sm font-medium text-[#9A3412] opacity-80">Dana sebesar {{ formatPrice(order.chosenPrice) }} telah dibekukan sementara</p>
        </div>
      </div>

      <div v-if="status === 'REVISI'" class="bg-[#FEE2E2] border border-red-100 rounded-2xl p-6 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500 mb-10">
        <div class="w-14 h-14 bg-[#B91C1C] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <h3 class="text-xl font-black text-[#991B1B]">Status: DALAM REVISI</h3>
          <p class="text-sm font-bold text-[#B91C1C]">Tindakan diperlukan segera</p>
        </div>
      </div>

      <div class="space-y-4">
        <button @click="goBack" class="text-gray-900 hover:opacity-70 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="text-xs font-bold text-gray-400 flex items-center gap-2 mb-2">
              <span>Pesanan</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>
              <span>#{{ order.id }}</span>
            </div>
            <h1 class="text-[40px] font-black text-[#1E3A8A] leading-tight">Detail Pesanan</h1>
          </div>
          <div v-if="status === 'DISPUTE'" class="px-6 py-2 bg-[#FEE2E2] text-[#991B1B] rounded-full text-sm font-black tracking-widest">SENGKETA</div>
          <div v-if="status === 'SELESAI'" class="px-6 py-2 bg-[#DCFCE7] text-[#166534] rounded-full text-sm font-black tracking-widest border border-green-100">SELESAI</div>
          <div v-if="status === 'BATAL'" class="px-6 py-2 bg-[#FEF2F2] text-[#991B1B] rounded-full text-sm font-black tracking-widest border border-red-100 uppercase">Dibatalkan</div>
        </div>
      </div>

    <div v-if="status !== 'DISPUTE' && status !== 'SELESAI' && status !== 'BATAL'" class="grid grid-cols-12 gap-12 items-start animate-in fade-in duration-700">
      <div class="col-span-8 space-y-12">
        <div class="bg-[#F8F9FE]/50 p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Pengerjaan</h3>
          <div class="relative flex justify-between px-4">
            <div class="absolute top-5 left-10 right-10 h-0.5 bg-gray-200"></div>
            <div class="absolute top-5 left-10 w-1/3 h-0.5 bg-[#4B6BFB]"></div>
            <div v-for="(step, i) in steps" :key="i" class="relative z-10 flex flex-col items-center gap-4">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500"
                :class="step.active ? 'bg-[#4B6BFB] text-white shadow-lg shadow-[#4B6BFB]/30' : 'bg-gray-200 text-gray-400'">
                <svg v-if="step.completed" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                <svg v-else-if="i === 1" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <svg v-else-if="i === 2" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span class="text-xs font-bold" :class="step.active ? 'text-[#4B6BFB]' : 'text-gray-400'">{{ step.name }}</span>
            </div>
          </div>
        </div>

        <div class="bg-[#F8F9FE]/50 p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 flex items-center justify-center text-[#4B6BFB] bg-[#E6F0FF] rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 class="text-2xl font-bold text-[#1E3A8A]">Instruksi Pekerjaan</h2>
          </div>
          <div class="bg-white p-10 rounded-3xl border border-gray-100">
            <p class="text-sm font-medium text-gray-500 leading-loose">{{ order.instructions }}</p>
          </div>
        </div>

        <div v-if="order.attachments && order.attachments.length" class="space-y-6">
          <h2 class="text-2xl font-bold text-[#1E3A8A]">Lampiran Pembeli</h2>
          <div v-for="(file, idx) in order.attachments" :key="idx" class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#4B6BFB]/20 transition-all">
            <div class="flex items-center gap-6">
              <div class="w-14 h-16 bg-red-50 rounded-xl flex items-center justify-center text-red-500 relative">
                <svg class="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
                <span class="absolute text-[8px] font-black mt-2">{{ file.type.toUpperCase() }}</span>
              </div>
              <div class="space-y-1">
                <h4 class="font-bold text-gray-900">{{ file.name }}</h4>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ file.size }}</p>
              </div>
            </div>
            <a :href="file.url" target="_blank" download class="text-gray-400 hover:text-[#4B6BFB] transition-colors p-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
          </div>
        </div>

        <div v-if="(order.status === 'IN_PROGRESS' && isAccepted) || order.status === 'IN_REVISION'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="space-y-4">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PENGUMPULAN HASIL PEKERJAAN</h3>
            <div
              class="border-2 border-dashed border-gray-100 rounded-[32px] p-16 flex flex-col items-center gap-4 hover:border-[#4B6BFB]/30 transition-all cursor-pointer bg-[#F8F9FE]/30 group"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              @click="($refs.fileInput as HTMLInputElement)?.click()"
            >
              <input ref="fileInput" type="file" multiple class="hidden" accept=".pdf,.jpg,.jpeg,.png,.zip" @change="handleFileSelect" />
              <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#4B6BFB] group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold text-[#1E3A8A]">Drop files here or <span class="text-[#4B6BFB] underline">click to browse</span></p>
                <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">PDF, JPG, or ZIP (Max 150MB)</p>
              </div>
            </div>
          </div>

          <!-- Uploaded Files List -->
          <div v-if="deliveryFiles.length" class="space-y-2">
            <div v-for="(file, idx) in deliveryFiles" :key="idx" class="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-[#4B6BFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="text-sm font-medium text-gray-700">{{ file.name }}</span>
                <span class="text-xs text-gray-400">{{ file.size }}</span>
              </div>
              <button @click="removeFile(idx)" class="text-gray-400 hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PESAN UNTUK KLIEN</label>
            <textarea v-model="deliveryMessage" placeholder="Jelaskan hasil yang Anda kirim atau perubahan sejak versi terakhir..." class="w-full px-8 py-6 bg-white border border-gray-100 rounded-[32px] text-sm font-medium focus:ring-4 focus:ring-[#4B6BFB]/5 outline-none transition-all h-40 resize-none placeholder-gray-300"></textarea>
          </div>

          <div class="space-y-6 text-center">
            <button @click="submitDelivery" :disabled="isSubmitting" class="w-full py-5 bg-[#5BB0FF] text-white rounded-2xl text-lg font-black shadow-xl shadow-[#5BB0FF]/20 hover:bg-[#4DA3FF] transition-all">
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Hasil' }}
            </button>
            <p class="text-[10px] text-gray-400 font-medium px-24 leading-relaxed text-center">Dengan menekan "Kirim Hasil", Anda menyatakan bahwa hasil yang dikirim telah memenuhi semua persyaratan kontrak.</p>
          </div>
        </div>

        <!-- Awaiting Client Action (DELIVERED state) -->
        <div v-if="order.status === 'DELIVERED'" class="bg-white rounded-[40px] border border-gray-100 p-10 text-center shadow-sm">
          <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Hasil Pekerjaan Telah Dikirim</h3>
          <p class="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            Anda telah mengirimkan deliverables untuk pesanan ini. Saat ini kami sedang menunggu tanggapan atau persetujuan akhir dari pihak klien.
          </p>
        </div>
      </div>

      <div class="col-span-4 space-y-8">
        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
          <div class="space-y-6">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informasi Pembeli</h3>
            <div class="flex items-center gap-4">
              <img :src="order.client?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.client?.fullName || 'User')}&background=random`" class="w-14 h-14 rounded-2xl object-cover" />
              <h4 class="text-lg font-bold text-[#1E3A8A]">{{ order.client?.fullName || 'Pembeli' }}</h4>
            </div>
          </div>
          
          <div class="space-y-6 border-t border-gray-50 pt-8">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">STATUS SAAT INI</span>
              <span v-if="status === 'BARU'" class="px-4 py-1.5 bg-[#E6F0FF] text-[#4B6BFB] text-[10px] font-bold rounded-lg tracking-widest">PENDING_CONFIRMATION</span>
              <span v-else-if="status === 'PROSES'" class="px-4 py-1.5 bg-orange-50 text-orange-500 text-[10px] font-bold rounded-lg tracking-widest">IN_PROGRESS</span>
              <span v-else-if="status === 'REVISI'" class="px-4 py-1.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg tracking-widest">REVISION</span>
              <span v-else class="px-4 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-bold rounded-lg tracking-widest">{{ status }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TENGGAT WAKTU:</span>
              <span class="text-sm font-bold text-red-500">{{ formatDate(order.deadline) || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL PEMBAYARAN</span>
              <span class="text-xl font-black text-[#1E3A8A]">{{ formatPrice(order.chosenPrice) }}</span>
            </div>
          </div>

          <div class="space-y-3 pt-4">
            <button class="w-full py-4 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Lihat Profil Pembeli</button>
            <button class="w-full py-4 bg-[#E6F0FF] text-[#4B6BFB] rounded-xl text-xs font-bold hover:bg-[#D9E8FF] transition-colors">Hubungi Pembeli</button>
          </div>
        </div>

        <div v-if="status === 'BARU'" class="space-y-4">
          <button @click="acceptOrder" :disabled="isSubmitting" class="w-full py-5 bg-[#65A30D] text-white rounded-2xl text-base font-black shadow-xl shadow-green-500/20 hover:bg-[#4D7C0F] transition-all">
            {{ isSubmitting ? 'MEMPROSES...' : 'TERIMA PESANAN' }}
          </button>
          <button @click="declineOrder" :disabled="isSubmitting" class="w-full py-5 bg-[#C2410C] text-white rounded-2xl text-base font-black shadow-xl shadow-red-500/20 hover:bg-[#9A3412] transition-all">TOLAK</button>
        </div>

        <div v-if="status === 'REVISI'" class="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <h2 class="text-xl font-bold text-[#1E3A8A]">Riwayat Revisi</h2>
          <div class="space-y-8">
            <div v-for="(rev, rIdx) in order.revisions" :key="rIdx" class="bg-white border border-gray-50 rounded-3xl p-8 shadow-sm space-y-4">
              <div class="flex justify-between items-center">
                <span class="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-tighter rounded-full">REVISI DIMINTA</span>
                <span class="text-[10px] font-bold text-gray-300">{{ formatDate(rev.createdAt) }}</span>
              </div>
              <p class="text-sm font-black text-gray-700 italic leading-relaxed">"{{ rev.feedback || rev.message }}"</p>
            </div>

            <div class="space-y-6 pl-2 text-gray-400">
              <div class="flex gap-4 items-start relative">
                <div class="absolute left-[7px] top-6 bottom-0 w-0.5 bg-gray-50"></div>
                <div class="w-4 h-4 rounded-full bg-gray-200 mt-1 shrink-0 z-10 border-4 border-white"></div>
                <div class="space-y-0.5 pb-2">
                  <h5 class="text-[10px] font-black uppercase tracking-widest">PENGIRIMAN AWAL</h5>
                  <p class="text-[10px] font-bold">Dikirim pada {{ formatDate(order.updatedAt) }}</p>
                </div>
              </div>
              <div class="flex gap-4 items-start">
                <div class="w-4 h-4 rounded-full bg-gray-200 mt-1 shrink-0 z-10 border-4 border-white"></div>
                <div class="space-y-0.5">
                  <h5 class="text-[10px] font-black uppercase tracking-widest">PESANAN DIMULAI</h5>
                  <p class="text-[10px] font-bold">Ditugaskan pada {{ formatDate(order.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="status === 'DISPUTE'" class="space-y-12 animate-in fade-in duration-700">
      <div class="grid grid-cols-2 gap-10">
        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DANA ORDER</h3>
          <div class="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-4">
            <p class="text-sm font-medium text-gray-500">Total nilai order</p>
            <div class="flex items-center justify-between">
              <h2 class="text-4xl font-black text-[#1E3A8A]">{{ formatPrice(order.chosenPrice) }}</h2>
              <span class="px-4 py-1.5 bg-orange-50 text-orange-500 text-[10px] font-bold rounded-lg tracking-widest uppercase">{{ order.status }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DETAIL ORDER</h3>
          <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-gray-50 pb-4">
              <span class="text-sm font-medium text-gray-500">Komplain Diajukan</span>
              <span class="text-sm font-black text-[#1E3A8A]">{{ formatDate(order.dispute?.createdAt || order.updatedAt) }}</span>
            </div>
            <div class="space-y-3">
              <span class="text-sm font-medium text-gray-500">Alasan client</span>
              <p class="text-base font-black text-gray-800 italic">"{{ order.dispute?.reason || 'Tidak ada alasan khusus.' }}"</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 flex items-center justify-center text-[#1E3A8A] bg-blue-50 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
          <h2 class="text-2xl font-bold text-[#1E3A8A] uppercase tracking-tighter">PERCAKAPAN TERAKHIR DI ORDER INI</h2>
        </div>
        
        <div class="space-y-12 bg-gray-50/30 p-12 rounded-[32px] border border-gray-50">
          <div class="flex flex-col gap-8 max-w-2xl mx-auto">
            <div class="self-start max-w-[80%] bg-[#E6F0FF] p-6 rounded-[32px] rounded-bl-none text-sm font-medium text-[#1E3A8A]">
              Halo, tim CS kami akan segera meninjau dispute ini.
              <div class="text-[10px] opacity-40 mt-2">{{ formatDate(order.updatedAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10 max-w-lg">
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CARA MENGHUBUNGI CS</h3>
        <div class="space-y-8">
          <div class="flex justify-between items-center border-b border-gray-50 pb-4">
            <span class="text-sm font-medium text-gray-500">Akun Instagram CS</span>
            <span class="text-sm font-black text-[#4B6BFB]">@csc</span>
          </div>
          <button class="w-full py-5 bg-gradient-to-r from-[#F59E0B] via-[#E11D48] to-[#9333EA] text-white rounded-2xl text-base font-black shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            DM CS di Instagram
          </button>
        </div>
      </div>
    </div>

    <!-- SELESAI / RESOLVED VIEW -->
    <div v-if="status === 'SELESAI'" class="space-y-12 animate-in fade-in duration-700">
      <div class="grid grid-cols-2 gap-10">
        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DANA ORDER</h3>
          <div class="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 space-y-4">
            <p class="text-sm font-medium text-gray-500">Total nilai order</p>
            <div class="flex items-center justify-between">
              <h2 class="text-4xl font-black text-[#1E3A8A]">{{ formatPrice(order.chosenPrice) }}</h2>
              <span class="px-4 py-1.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-lg tracking-widest uppercase border border-green-100">SELESAI</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DETAIL ORDER</h3>
          <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-gray-50 pb-4">
              <span class="text-sm font-medium text-gray-500">Keputusan</span>
              <span class="text-sm font-black text-[#1E3A8A]">{{ formatDate(order.dispute?.resolvedAt || order.updatedAt) }}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-sm font-medium text-gray-500">Status Order</span>
              <span class="px-4 py-1.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-lg tracking-widest uppercase border border-green-100">SELESAI</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BATAL / REFUNDED VIEW -->
    <div v-if="status === 'BATAL'" class="space-y-12 animate-in fade-in duration-700">
      <div class="grid grid-cols-2 gap-10">
        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DANA ORDER</h3>
          <div class="bg-red-50/50 p-8 rounded-[32px] border border-red-100 space-y-4">
            <p class="text-sm font-medium text-gray-500">Total nilai order</p>
            <div class="flex items-center justify-between">
              <h2 class="text-4xl font-black text-[#991B1B]">{{ formatPrice(order.chosenPrice) }}</h2>
              <span class="px-4 py-1.5 bg-white text-[#991B1B] text-[10px] font-bold rounded-lg tracking-widest uppercase border border-red-100">Refund</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DETAIL ORDER</h3>
          <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-gray-50 pb-4">
              <span class="text-sm font-medium text-gray-500">Keputusan</span>
              <span class="text-sm font-black text-[#1E3A8A]">{{ formatDate(order.dispute?.resolvedAt || order.updatedAt) }}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-sm font-medium text-gray-500">Status Order</span>
              <span class="px-4 py-1.5 bg-[#FEF2F2] text-[#991B1B] text-[10px] font-bold rounded-lg tracking-widest uppercase border border-red-100">Dibatalkan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

    <!-- Decline Confirmation Modal -->
    <div v-if="showDeclineModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white p-8 rounded-3xl max-w-md w-full mx-4 space-y-6 shadow-2xl border border-gray-100">
        <h3 class="text-xl font-bold text-gray-900">Tolak Pesanan?</h3>
        <p class="text-sm text-gray-500">Apakah Anda yakin ingin menolak pesanan ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div class="flex gap-4">
          <button @click="showDeclineModal = false" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Batal</button>
          <button @click="confirmDecline" :disabled="isSubmitting" class="flex-1 py-3 bg-[#C2410C] text-white rounded-xl text-sm font-bold hover:bg-[#9A3412] transition-colors shadow-lg shadow-red-500/20">
            {{ isSubmitting ? 'Menolak...' : 'Ya, Tolak' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
