<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRefunds } from '../../composables/useRefunds'

const activeTab = ref('Semua Permintaan')
const tabs = ['Semua Permintaan', 'Tertunda', 'Diproses', 'Selesai']

const { refundsQuery, processRefundMutation } = useRefunds()

const allRequests = computed(() => refundsQuery.data.value || [])

const filteredRequests = computed(() => {
  if (activeTab.value === 'Semua Permintaan') return allRequests.value
  if (activeTab.value === 'Tertunda') return allRequests.value.filter((r: any) => r.status === 'PENDING' || r.status === 'Menunggu')
  if (activeTab.value === 'Diproses') return allRequests.value.filter((r: any) => r.status === 'PROCESSING' || r.status === 'Diproses')
  return allRequests.value.filter((r: any) => r.status === 'COMPLETED' || r.status === 'Selesai')
})

const currentView = ref<'list' | 'detail' | 'success'>('list')
const selectedRequest = ref<any>(null)
const selectedMethod = ref<'manual' | 'gateway'>('manual')

function viewDetail(req: any) {
  selectedRequest.value = req
  currentView.value = 'detail'
}

function goBack() {
  currentView.value = 'list'
  selectedRequest.value = null
  selectedMethod.value = 'manual'
}

async function processTransfer() {
  if (!selectedRequest.value) return
  await processRefundMutation.mutateAsync({
    disputeId: selectedRequest.value.id,
    method: selectedMethod.value
  })
  currentView.value = 'success'
}

function finishProcess() {
  goBack()
}

function getStatusClass(status: string) {
  switch (status) {
    case 'Selesai': return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    case 'Disetujui': return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    case 'Menunggu': return 'text-amber-700 bg-amber-50 border border-amber-200'
    case 'Ditolak': return 'text-red-700 bg-red-50 border border-red-200'
    default: return 'text-gray-700 bg-gray-50'
  }
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'Selesai': return 'bg-emerald-500'
    case 'Disetujui': return 'bg-emerald-500'
    case 'Menunggu': return 'bg-amber-500'
    case 'Ditolak': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}
</script>

<template>
  <div class="space-y-6 w-full max-w-6xl mx-auto font-sans pb-20">
    
    <!-- LIST VIEW -->
    <template v-if="currentView === 'list'">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-[22px] font-semibold text-gray-800">Daftar Permintaan Pengembalian Dana (Refund)</h1>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 flex gap-8">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          @click="activeTab = tab"
          class="pb-4 text-sm font-bold transition-colors relative"
          :class="activeTab === tab ? 'text-[#2A437E]' : 'text-gray-500 hover:text-gray-700'"
        >
          {{ tab }}
          <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#2A437E] rounded-t-full"></div>
        </button>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
        
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white border-b border-gray-100 text-xs font-bold text-gray-600">
                <th class="px-6 py-4">Nama Pembeli</th>
                <th class="px-6 py-4">Status <span class="text-gray-400">↓</span></th>
                <th class="px-6 py-4">Jumlah Diminta</th>
                <th class="px-6 py-4">Tanggal Permintaan</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="req in filteredRequests" :key="req.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-5">
                  <span class="text-sm font-bold text-gray-900">{{ req.client?.fullName || req.nama || '-' }}</span>
                </td>
                <td class="px-6 py-5">
                  <span :class="getStatusClass(req.status)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(req.status)"></span>
                    {{ req.status }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm font-medium text-gray-700">{{ req.amount ? 'Rp ' + Number(req.amount).toLocaleString('id-ID') : req.jumlah || '-' }}</span>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm text-gray-600">{{ req.createdAt ? new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : req.tanggal || '-' }}</span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center justify-center">
                    <button 
                      @click="viewDetail(req)"
                      class="px-5 py-2 bg-[#2A437E] hover:bg-[#1e305a] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Lihat
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <span>←</span> Previous
          </button>
          
          <div class="flex items-center gap-1">
            <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-900">1</button>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">2</button>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">3</button>
            <span class="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">8</button>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">9</button>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">10</button>
          </div>

          <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            Next <span>→</span>
          </button>
        </div>

      </div>
    </template>

    <!-- DETAIL VIEW -->
    <template v-else-if="currentView === 'detail' && selectedRequest">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs font-semibold mb-6">
        <button @click="goBack" class="text-gray-400 hover:text-gray-700">Pengembalian Dana</button>
        <span class="text-gray-400">/</span>
        <span class="text-[#2A437E]">Proses</span>
      </div>

      <h1 class="text-[28px] font-black text-[#111827] mb-8">Pengembalian dana</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Top Card: Summary & Details -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 flex items-start justify-between border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-500 mb-1">Jumlah Pengembalian</p>
                <h2 class="text-3xl font-bold text-[#2A437E]">{{ selectedRequest.amount ? 'Rp ' + Number(selectedRequest.amount).toLocaleString('id-ID') : selectedRequest.jumlah }}</h2>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-500 mb-1">Customer</p>
                <p class="font-bold text-gray-900">{{ selectedRequest.client?.fullName || selectedRequest.nama || '-' }}</p>
              </div>
            </div>
            
            <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <!-- Info Transaksi -->
              <div class="space-y-4">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">INFORMASI TRANSAKSI</h3>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">ID Refund</span>
                  <span class="font-medium text-[#2A437E]">---</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Pesanan Asli</span>
                  <span class="font-bold text-gray-900">{{ selectedRequest.order?.id ? '#ORD-' + selectedRequest.order.id : selectedRequest.pesananAsli || '-' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Metode Pembayaran</span>
                  <span class="font-bold text-gray-900">{{ selectedRequest.order?.paymentMethod || selectedRequest.metode || '-' }}</span>
                </div>
              </div>

              <!-- Detail Bank Penerima -->
              <div class="space-y-4">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">DETAIL BANK PENERIMA</h3>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Nama Bank</span>
                  <span class="font-bold text-gray-900">{{ selectedRequest.merchant?.bankName || selectedRequest.bank || '-' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Nomor Rekening</span>
                  <span class="font-bold text-gray-900">{{ selectedRequest.merchant?.bankAccountNumber || selectedRequest.norek || '-' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Atas Nama</span>
                  <span class="font-bold text-gray-900">{{ selectedRequest.merchant?.bankAccountName || selectedRequest.atasNama || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Middle Card: Catatan -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-gray-900 mb-4">Pengembalian dana</h3>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">CATATAN VENDOR / ADMIN</p>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 italic">
              "{{ selectedRequest.catatan }}"
            </div>
          </div>

          <!-- Bottom Card: Metode Pembayaran -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-gray-900 mb-4">Pilih Metode Pembayaran</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Manual -->
              <label 
                class="border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-start"
                :class="selectedMethod === 'manual' ? 'border-[#1C64F2] bg-[#E1EFFE]/30' : 'border-gray-200 hover:border-blue-300'"
              >
                <div>
                  <h4 class="font-bold text-sm" :class="selectedMethod === 'manual' ? 'text-[#1C64F2]' : 'text-gray-900'">Transfer Bank Manual</h4>
                  <p class="text-xs text-gray-400 mt-1 leading-relaxed">Admin akan memproses melalui sistem perbankan perusahaan</p>
                </div>
                <div class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5" :class="selectedMethod === 'manual' ? 'border-[#1C64F2]' : 'border-gray-300'">
                  <div v-if="selectedMethod === 'manual'" class="w-2.5 h-2.5 bg-[#1C64F2] rounded-full"></div>
                </div>
                <input type="radio" v-model="selectedMethod" value="manual" class="hidden">
              </label>
              
              <!-- Gateway -->
              <label 
                class="border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-start"
                :class="selectedMethod === 'gateway' ? 'border-[#1C64F2] bg-[#E1EFFE]/30' : 'border-gray-200 hover:border-blue-300'"
              >
                <div>
                  <h4 class="font-bold text-sm text-gray-900">melalui Payment Gateway</h4>
                  <p class="text-xs text-gray-400 mt-1 leading-relaxed">Pengembalian dana otomatis melalui Midtrans/Xendit</p>
                </div>
                <div class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5" :class="selectedMethod === 'gateway' ? 'border-[#1C64F2]' : 'border-gray-300'">
                  <div v-if="selectedMethod === 'gateway'" class="w-2.5 h-2.5 bg-[#1C64F2] rounded-full"></div>
                </div>
                <input type="radio" v-model="selectedMethod" value="gateway" class="hidden">
              </label>
            </div>
          </div>

        </div>

        <!-- Sticky Total Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-10 bg-[#1e305a] rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            
            <p class="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">TOTAL NILAI PENGEMBALIAN</p>
            <h3 class="text-4xl font-bold mb-3">{{ selectedRequest.jumlah }}</h3>
            <p class="text-xs text-white/50 leading-relaxed mb-6">Tidak ada biaya tambahan yang dikenakan kepada pengguna.</p>
            
            <div class="border-t border-white/10 pt-6">
              <button 
                @click="processTransfer"
                class="w-full py-3.5 bg-[#1C64F2] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-md text-[15px]"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- SUCCESS VIEW -->
    <template v-else-if="currentView === 'success' && selectedRequest">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs font-semibold mb-6">
        <button @click="goBack" class="text-gray-400 hover:text-gray-700">Pengembalian Dana</button>
        <span class="text-gray-400">/</span>
        <button @click="currentView = 'detail'" class="text-gray-400 hover:text-gray-700">Proses</button>
        <span class="text-gray-400">/</span>
        <span class="text-[#2A437E]">Konfirmasi</span>
      </div>

      <h1 class="text-[28px] font-black text-[#111827] mb-8">Konfirmasi Proses Pengembalian Dana</h1>

      <div class="space-y-6 max-w-4xl">
        <!-- Success Alert -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
          <svg class="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 class="font-bold text-emerald-800 text-base mb-1">Pengembalian Dana Berhasil</h3>
            <p class="text-emerald-700 text-sm">Saldo escrow telah diperbarui. Status pesanan berubah menjadi REFUND.</p>
          </div>
        </div>

        <!-- Ringkasan Pembayaran -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100">
            <h3 class="font-bold text-gray-900 text-lg">Ringkasan Pembayaran</h3>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">JUMLAH PENGEMBALIAN</p>
              <p class="text-2xl font-bold text-[#1C64F2]">{{ selectedRequest.jumlah }},00</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">METODE PEMBAYARAN</p>
              <p class="text-lg font-bold text-gray-900">{{ selectedRequest.bankShort }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">DIPROSES OLEH</p>
              <p class="text-lg font-bold text-gray-900">Admin (Finance)</p>
            </div>
          </div>
        </div>

        <!-- Action -->
        <div class="flex justify-end pt-4">
          <button 
            @click="finishProcess"
            class="px-10 py-3 bg-[#2A437E] hover:bg-[#1e305a] text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            SELESAI
          </button>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
</style>
