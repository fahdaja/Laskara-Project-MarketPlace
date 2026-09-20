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
const declineReason = ref('')

const deliveryFiles = ref<{ name: string; size: string }[]>([])
const rawFiles = ref<File[]>([])
const deliveryMessage = ref('')
const isDragging = ref(false)

const steps = ['Dibayar', 'Pengerjaan', 'Dikirim', 'Selesai']

const currentStep = computed(() => {
  if (!order.value) return 0
  switch (order.value.status) {
    case 'IN_PROGRESS': return 1
    case 'DELIVERED': return 2
    case 'COMPLETED': return 3
    default: return 0
  }
})

function getStepState(idx: number) {
  if (idx < currentStep.value) return 'completed'
  if (idx === currentStep.value) return 'active'
  return 'pending'
}

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
    queryClient.invalidateQueries({ queryKey: ['orders', 'incoming'] })
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
    queryClient.invalidateQueries({ queryKey: ['orders', 'incoming'] })
    router.push('/vendor/orders')
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
    queryClient.invalidateQueries({ queryKey: ['orders', 'incoming'] })
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
</script>

<template>
  <div class="py-6 px-4 max-w-6xl">
    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-gray-500 text-sm">Memuat detail pesanan...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!order" class="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-gray-500 text-sm">Pesanan tidak ditemukan.</p>
    </div>

    <template v-else>
      <!-- Revision Banner -->
      <div
        v-if="order.status === 'IN_REVISION'"
        class="mb-6 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200"
      >
        <div class="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-red-800">Status: DALAM REVISI</h3>
          <p class="text-xs text-red-600/80">Klien meminta beberapa perubahan. Silakan periksa masukan klien di riwayat revisi.</p>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <p class="text-sm font-bold text-brand-light mb-1">#ORD-{{ order.id }}</p>
        <h1 class="text-[28px] font-bold text-gray-900">Detail Pesanan</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Progress Stepper -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Status Pengerjaan</p>
            <div class="flex items-center justify-between relative px-4">
              <!-- Progress Line -->
              <div class="absolute top-5 left-[48px] right-[48px] h-0.5 bg-gray-200">
                <div
                  class="h-full bg-brand-light transition-all duration-500"
                  :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
                ></div>
              </div>

              <div v-for="(step, idx) in steps" :key="step" class="flex flex-col items-center relative z-10">
                <!-- Circle -->
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  :class="{
                    'bg-brand-light text-white shadow-lg shadow-blue-500/20': getStepState(idx) === 'active',
                    'bg-brand-navy text-white': getStepState(idx) === 'completed',
                    'bg-gray-100 text-gray-400': getStepState(idx) === 'pending',
                  }"
                >
                  <svg v-if="getStepState(idx) === 'completed'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <svg v-else-if="idx === 1" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <svg v-else-if="idx === 2" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <svg v-else-if="idx === 3" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span class="text-xs font-medium mt-2" :class="getStepState(idx) === 'pending' ? 'text-gray-400' : 'text-gray-700'">{{ step }}</span>
              </div>
            </div>
          </div>

          <!-- Instruksi Pekerjaan -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h2 class="text-base font-bold text-brand-navy">Instruksi Pekerjaan</h2>
            </div>
            <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p class="text-sm text-gray-700 leading-relaxed">{{ order.instructions }}</p>
            </div>
          </div>

          <!-- Lampiran Pembeli -->
          <div v-if="order.attachments && order.attachments.length">
            <h2 class="text-base font-bold text-brand-light mb-4">Lampiran Pembeli</h2>
            <div class="space-y-3">
              <div
                v-for="(file, idx) in order.attachments"
                :key="idx"
                class="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="file.type === 'pdf' ? 'bg-red-50' : 'bg-blue-50'">
                    <svg v-if="file.type === 'pdf'" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/><path d="M8 12h8v1H8v-1zm0 3h8v1H8v-1zm0 3h5v1H8v-1z"/></svg>
                    <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ file.name }}</p>
                    <p class="text-xs text-gray-400">{{ file.size }}</p>
                  </div>
                </div>
                <a :href="file.url" target="_blank" download class="text-gray-400 hover:text-brand-navy transition-colors p-2" aria-label="Download">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Delivery Section (IN_PROGRESS & isAccepted, or IN_REVISION only) -->
          <div v-if="(order.status === 'IN_PROGRESS' && isAccepted) || order.status === 'IN_REVISION'" class="space-y-6">
            <h2 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pengumpulan Hasil Pekerjaan</h2>

            <!-- Drop Zone -->
            <div
              class="border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer"
              :class="isDragging ? 'border-brand-light bg-blue-50/30' : 'border-gray-200 bg-white hover:border-brand-light/50'"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              @click="($refs.fileInput as HTMLInputElement)?.click()"
            >
              <input ref="fileInput" type="file" multiple class="hidden" accept=".pdf,.jpg,.jpeg,.png,.zip" @change="handleFileSelect" />
              <svg class="w-10 h-10 mx-auto mb-3 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <p class="text-sm font-bold text-brand-navy mb-1">Drop files here or click to browse</p>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest">PDF, JPG, or ZIP (Max 150MB)</p>
            </div>

            <!-- Uploaded Files -->
            <div v-if="deliveryFiles.length" class="space-y-2">
              <div
                v-for="(file, idx) in deliveryFiles"
                :key="idx"
                class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span class="text-sm font-medium text-gray-700">{{ file.name }}</span>
                  <span class="text-xs text-gray-400">{{ file.size }}</span>
                </div>
                <button @click="removeFile(idx)" class="text-gray-400 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- Pesan -->
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pesan Untuk Klien</p>
              <textarea
                v-model="deliveryMessage"
                rows="4"
                placeholder="Jelaskan hasil yang Anda kirim atau perubahan sejak versi terakhir..."
                class="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-brand-light/20 focus:border-brand-light outline-none resize-none transition-colors"
              ></textarea>
            </div>

            <!-- Submit -->
            <button
              @click="submitDelivery"
              :disabled="isSubmitting"
              class="w-full py-4 bg-brand-navy text-white text-sm font-bold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-lg shadow-brand-navy/20"
            >
              {{ isSubmitting ? 'Mengirim Hasil...' : 'Kirim Hasil' }}
            </button>
            <p class="text-[10px] text-gray-400 text-center leading-relaxed">
              Dengan menekan "Kirim Hasil", Anda menyatakan bahwa hasil yang dikirim telah memenuhi semua persyaratan kontrak.
            </p>
          </div>

          <!-- Awaiting Client Action (DELIVERED state) -->
          <div v-if="order.status === 'DELIVERED'" class="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Hasil Pekerjaan Telah Dikirim</h3>
            <p class="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Vendor telah mengirimkan deliverables untuk pesanan ini. Saat ini kami sedang menunggu tanggapan atau persetujuan akhir dari pihak klien.
            </p>
          </div>

          <!-- Completed State Info -->
          <div v-if="order.status === 'COMPLETED'" class="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Pesanan Selesai</h3>
            <p class="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Pesanan ini telah disetujui dan diselesaikan oleh pembeli. Seluruh dana transaksi bersih telah dicairkan ke saldo akun toko Anda.
            </p>
          </div>

          <!-- Refunded State Info -->
          <div v-if="order.status === 'REFUNDED'" class="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Pesanan Dibatalkan / Ditolak</h3>
            <p class="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Pesanan ini telah dibatalkan atau ditolak. Dana yang dibayarkan oleh pembeli telah sepenuhnya dikembalikan ke saldo pembeli.
            </p>
          </div>
        </div>

        <!-- Right Column (Sidebar) -->
        <div class="space-y-6">
          <!-- Buyer Info Card -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Pembeli</p>
            <div class="flex items-center gap-3 mb-6">
              <img :src="order.client?.avatar || 'https://i.pravatar.cc/150?u=' + order.client?.fullName" :alt="order.client?.fullName" class="w-12 h-12 rounded-full object-cover" />
              <h3 class="text-base font-bold text-gray-900">{{ order.client?.fullName || 'Pembeli' }}</h3>
            </div>

            <div class="space-y-4 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">Status Saat Ini</span>
                <span class="text-sm font-bold text-blue-600" :class="{
                  'text-blue-600': order.status === 'IN_PROGRESS' && !isAccepted,
                  'text-amber-500': order.status === 'IN_PROGRESS' && isAccepted,
                  'text-red-500': order.status === 'IN_REVISION',
                  'text-emerald-500': order.status === 'DELIVERED',
                  'text-indigo-900': order.status === 'COMPLETED',
                  'text-gray-500': order.status === 'REFUNDED',
                }">
                  {{
                    order.status === 'IN_PROGRESS' && !isAccepted ? 'Baru' :
                    order.status === 'IN_PROGRESS' && isAccepted ? 'Pengerjaan' :
                    order.status === 'IN_REVISION' ? 'Revisi' :
                    order.status === 'DELIVERED' ? 'Terkirim' :
                    order.status === 'COMPLETED' ? 'Selesai' :
                    order.status === 'REFUNDED' ? 'Ditolak/Refunded' : order.status
                  }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">Tenggat Waktu:</span>
                <span class="text-sm font-bold text-orange-500">{{ formatDate(order.deadline) || '-' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Pembayaran</span>
                <span class="text-lg font-bold text-gray-900">{{ formatPrice(order.chosenPrice) }}</span>
              </div>
            </div>

            <!-- Action Buttons (Incoming order not accepted yet) -->
            <template v-if="order.status === 'IN_PROGRESS' && !isAccepted">
              <div class="space-y-3 mt-5">
                <button
                  @click="acceptOrder"
                  class="w-full py-3.5 bg-[#059669] text-white text-sm font-bold rounded-xl hover:bg-[#047857] transition-colors shadow-lg shadow-green-500/20"
                >
                  TERIMA PESANAN
                </button>
                <button
                  @click="declineOrder"
                  class="w-full py-3.5 bg-white border-2 border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
                >
                  TOLAK
                </button>
              </div>
            </template>
            <template v-else>
              <div class="space-y-3 border-t border-gray-100 pt-5">
                <button
                  @click="router.push('/vendor/messages')"
                  class="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hubungi Pembeli
                </button>
              </div>
            </template>
          </div>

          <!-- Revision / Delivery History -->
          <div v-if="order.revisionHistory && order.revisionHistory.length > 0" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 class="text-base font-bold text-gray-900 mb-5">Riwayat Aktivitas</h3>

            <div class="relative">
              <!-- Timeline Line -->
              <div class="absolute left-[11px] top-3 bottom-3 w-px bg-gray-200"></div>

              <div class="space-y-6">
                <div
                  v-for="(entry, idx) in order.revisionHistory"
                  :key="idx"
                  class="relative pl-8"
                >
                  <!-- Dot -->
                  <div
                    class="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center"
                    :class="idx === 0 ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'"
                  >
                    <div v-if="idx === 0" class="w-2 h-2 rounded-full bg-white"></div>
                    <div v-else class="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>

                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <span
                        class="text-[10px] font-bold uppercase tracking-wider"
                        :class="idx === 0 ? 'text-red-600' : 'text-gray-400'"
                      >{{ entry.label }}</span>
                      <span v-if="entry.time && idx === 0" class="text-[10px] text-gray-400">{{ entry.time }}</span>
                    </div>

                    <p v-if="entry.message" class="text-sm text-gray-700 font-medium italic mb-2">{{ entry.message }}</p>
                    <div v-if="entry.attachments && entry.attachments.length" class="space-y-1 mt-1">
                      <div v-for="att in entry.attachments" :key="att" class="flex items-center gap-2 text-xs text-brand-light font-medium">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                        <a :href="att" target="_blank" class="hover:underline">{{ getFilename(att) }}</a>
                      </div>
                    </div>
                    <div v-else-if="entry.attachment" class="flex items-center gap-2 text-xs text-brand-light font-medium">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                      <span>{{ entry.attachment }}</span>
                    </div>
                    <p v-if="!entry.message && entry.time && idx !== 0" class="text-xs text-gray-500">{{ entry.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decline Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showDeclineModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="showDeclineModal = false"></div>
            <div class="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div class="bg-red-500 px-6 py-4 flex justify-between items-center text-white">
                <h3 class="text-lg font-bold">Tolak Pesanan</h3>
                <button @click="showDeclineModal = false" class="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div class="p-6 space-y-5">
                <p class="text-sm text-gray-600">Apakah Anda yakin ingin menolak pesanan ini? Pembayaran akan dikembalikan sepenuhnya ke saldo pembeli.</p>
                <div>
                  <label class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 block">Alasan Penolakan</label>
                  <textarea
                    v-model="declineReason"
                    rows="4"
                    placeholder="Tulis alasan penolakan Anda..."
                    class="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-300 outline-none resize-none"
                  ></textarea>
                </div>
                <div class="flex justify-end gap-3">
                  <button @click="showDeclineModal = false" class="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-800">Batal</button>
                  <button @click="confirmDecline" class="px-8 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors">
                    Konfirmasi Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
