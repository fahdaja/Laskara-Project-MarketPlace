<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppeals } from '../../composables/useAppeals'
import { useAdmin } from '../../composables/useAdmin'

const activeTab = ref('appeals')
const currentView = ref('list')
const selectedAppeal = ref<any>(null)
const resolutionText = ref('')

const searchQuery = ref('')
const selectedStatus = ref('Semua Status')

const { appealsQuery, resolveAppealMutation } = useAppeals()
const { executiveDecisionMutation } = useAdmin()

const filteredAppeals = computed(() => {
  let list = appealsQuery.data.value || []
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((item: any) => 
      item.requester.fullName.toLowerCase().includes(q) || 
      item.requester.email.toLowerCase().includes(q) || 
      String(item.orderId).includes(q) ||
      item.reason.toLowerCase().includes(q)
    )
  }
  if (selectedStatus.value !== 'Semua Status') {
    list = list.filter((item: any) => item.status === selectedStatus.value)
  }
  return list
})

const pendingCount = computed(() => {
  return (appealsQuery.data.value || []).filter((a: any) => a.status === 'PENDING').length
})

const resolvedCount = computed(() => {
  return (appealsQuery.data.value || []).filter((a: any) => a.status !== 'PENDING').length
})

function openDetail(appeal: any) {
  selectedAppeal.value = appeal
  resolutionText.value = appeal.resolution || ''
  currentView.value = 'detail'
}

function goBack() {
  selectedAppeal.value = null
  resolutionText.value = ''
  currentView.value = 'list'
}

async function handleResolveAppeal(isApproved: boolean) {
  if (!selectedAppeal.value || !resolutionText.value.trim()) return
  await resolveAppealMutation.mutateAsync({
    id: selectedAppeal.value.id,
    resolution: resolutionText.value,
    isApproved
  })
  goBack()
}

const execOrderId = ref<number | null>(null)
const execDecision = ref<'FORCE_REFUND' | 'FORCE_RELEASE'>('FORCE_REFUND')
const execShowConfirm = ref(false)

async function handleExecuteDecision() {
  if (!execOrderId.value) return
  await executiveDecisionMutation.mutateAsync({
    id: execOrderId.value,
    decision: execDecision.value
  })
  execOrderId.value = null
  execShowConfirm.value = false
}
</script>

<template>
  <div class="pb-12 w-full max-w-5xl mx-auto font-sans">
    
    <div v-if="currentView === 'list'" class="flex items-center justify-between border-b border-gray-200 pb-4 h-16 mb-6">
      <h1 class="text-[22px] font-semibold text-gray-900 border-none">Manajemen Sengketa & Banding</h1>
      <div class="flex gap-2">
        <button 
          @click="activeTab = 'appeals'"
          :class="activeTab === 'appeals' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          Daftar Banding
        </button>
        <button 
          @click="activeTab = 'executive'"
          :class="activeTab === 'executive' ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          Executive Override
        </button>
      </div>
    </div>

    <div v-if="currentView === 'list' && activeTab === 'appeals'" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div class="text-[32px] font-bold text-gray-900 leading-none">{{ pendingCount }}</div>
            <div class="text-sm font-medium text-gray-400 mt-2">Banding Menunggu</div>
          </div>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4" /></svg>
          </div>
          <div>
            <div class="text-[32px] font-bold text-gray-900 leading-none">{{ resolvedCount }}</div>
            <div class="text-sm font-medium text-gray-400 mt-2">Banding Diputuskan</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input v-model="searchQuery" type="text" placeholder="Cari nama pengaju, email, atau order ID..." class="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div class="flex gap-4">
          <div class="relative">
            <select v-model="selectedStatus" class="appearance-none bg-white border border-gray-300 text-gray-700 py-3 pl-5 pr-10 rounded-full text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>Semua Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="filteredAppeals.length === 0" class="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Tidak ada pengajuan banding yang ditemukan
        </div>
        <div v-for="(item, index) in filteredAppeals" :key="index" class="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-gray-900">{{ item.requester.fullName }}</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="item.status === 'PENDING' ? 'border-yellow-200 text-yellow-500 bg-yellow-50' : item.status === 'APPROVED' ? 'border-green-200 text-green-500 bg-green-50' : 'border-red-200 text-red-500 bg-red-50'">{{ item.status }}</span>
            </div>
            <p class="text-sm text-gray-500">Order ID: #{{ item.orderId }} | Email: {{ item.requester.email }}</p>
            <button @click="openDetail(item)" class="w-fit bg-[#1E3A8A] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Review Banding
            </button>
          </div>
          <div class="text-xs text-gray-400 self-start md:self-center">
            Diajukan pada: {{ new Date(item.createdAt).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'list' && activeTab === 'executive'" class="space-y-6">
      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-lg mx-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Keputusan Eksekutif (Override)</h2>
        <p class="text-sm text-gray-500 mb-6 leading-relaxed">
          Gunakan panel ini untuk memaksa status pesanan yang sedang berada dalam proses sengketa (`DISPUTE_IN_PROGRESS`). Ini akan membatalkan atau melepaskan dana secara sepihak dan langsung.
        </p>

        <form @submit.prevent="execShowConfirm = true" class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest block">ORDER ID</label>
            <input 
              v-model.number="execOrderId" 
              type="number" 
              required 
              placeholder="Masukkan ID Pesanan..." 
              class="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest block">KEPUTUSAN</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors" :class="execDecision === 'FORCE_REFUND' ? 'border-[#1E3A8A] bg-blue-50/50' : 'border-gray-200'">
                <input type="radio" v-model="execDecision" value="FORCE_REFUND" class="text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                <span class="text-sm font-semibold text-gray-800">Force Refund</span>
              </label>
              <label class="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors" :class="execDecision === 'FORCE_RELEASE' ? 'border-[#1E3A8A] bg-blue-50/50' : 'border-gray-200'">
                <input type="radio" v-model="execDecision" value="FORCE_RELEASE" class="text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                <span class="text-sm font-semibold text-gray-800">Force Release</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="!execOrderId || executiveDecisionMutation.isPending.value"
            class="w-full bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wide text-sm transition-colors shadow-sm"
          >
            {{ executiveDecisionMutation.isPending.value ? 'Mengeksekusi...' : 'Kirim Keputusan Eksekutif' }}
          </button>
        </form>
      </div>

      <div v-if="execShowConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div class="absolute inset-0" @click="execShowConfirm = false"></div>
        <div class="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div class="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 class="text-xl font-extrabold text-gray-900 mb-2">Konfirmasi Tindakan</h3>
          <p class="text-sm text-gray-500 mb-8">
            Apakah Anda yakin ingin memaksakan keputusan <strong>{{ execDecision === 'FORCE_REFUND' ? 'Refund' : 'Release' }}</strong> untuk Pesanan #{{ execOrderId }}? Tindakan ini bersifat final.
          </p>
          <div class="flex gap-3 w-full">
            <button @click="execShowConfirm = false" class="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              Batal
            </button>
            <button @click="handleExecuteDecision" class="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
              Ya, Eksekusi
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'detail' && selectedAppeal" class="space-y-6 pt-4">
      <button @click="goBack" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Kembali
      </button>

      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
            {{ selectedAppeal.requester.fullName.charAt(0) }}
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 mb-1">{{ selectedAppeal.requester.fullName }}</h1>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" :class="selectedAppeal.status === 'PENDING' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' : selectedAppeal.status === 'APPROVED' ? 'border-green-200 text-green-600 bg-green-50' : 'border-red-200 text-red-600 bg-red-50'">
              {{ selectedAppeal.status }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-6">Detail Informasi Banding</h2>
        <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-4 gap-x-6 text-sm">
          <div class="text-gray-500">Order ID:</div>
          <div class="font-medium text-gray-900">#{{ selectedAppeal.orderId }}</div>

          <div class="text-gray-500">Pengaju Banding:</div>
          <div class="font-medium text-gray-900">{{ selectedAppeal.requester.fullName }} ({{ selectedAppeal.requester.email }})</div>

          <div class="text-gray-500">Nilai Transaksi:</div>
          <div class="font-medium text-gray-900">Rp {{ Number(selectedAppeal.order?.totalAmount).toLocaleString() }}</div>

          <div class="text-gray-500">Tanggal Pengajuan:</div>
          <div class="font-medium text-gray-900">{{ new Date(selectedAppeal.createdAt).toLocaleString() }}</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 class="text-base font-bold text-gray-900 mb-4">Pesan Alasan Banding</h3>
        <p class="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed min-h-[100px]">
          {{ selectedAppeal.reason }}
        </p>
      </div>

      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm" v-if="selectedAppeal.status === 'PENDING'">
        <h3 class="text-base font-bold text-gray-900 mb-4">Formulir Resolusi Banding</h3>
        <div class="space-y-4">
          <textarea 
            v-model="resolutionText" 
            required 
            rows="4" 
            placeholder="Masukkan keterangan resolusi banding..." 
            class="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>

          <div class="flex justify-end gap-3 pt-2">
            <button 
              @click="handleResolveAppeal(false)" 
              :disabled="resolveAppealMutation.isPending.value || !resolutionText.trim()"
              class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wide text-xs transition-colors shadow-sm"
            >
              Tolak Banding
            </button>
            <button 
              @click="handleResolveAppeal(true)" 
              :disabled="resolveAppealMutation.isPending.value || !resolutionText.trim()"
              class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wide text-xs transition-colors shadow-sm"
            >
              Setujui Banding
            </button>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm" v-else>
        <h3 class="text-base font-bold text-gray-900 mb-4">Hasil Resolusi</h3>
        <div class="space-y-4 text-sm">
          <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-4 gap-x-6">
            <div class="text-gray-500">Keterangan:</div>
            <div class="font-medium text-gray-900">{{ selectedAppeal.resolution }}</div>

            <div class="text-gray-500">Tanggal Resolusi:</div>
            <div class="font-medium text-gray-900" v-if="selectedAppeal.resolvedAt">{{ new Date(selectedAppeal.resolvedAt).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
