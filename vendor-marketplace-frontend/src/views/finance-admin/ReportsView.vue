<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMonthlyReports } from '../../composables/useMonthlyReports'

const {
  reportsQuery,
  generateReportMutation,
  updateCostMutation,
  processDividendMutation,
  lockReportMutation,
  uploadProofMutation
} = useMonthlyReports()

const selectedPeriod = ref('')
const activeReport = ref<any>(null)
const costServer = ref<number>(0)
const costDomain = ref<number>(0)
const costApi = ref<number>(0)
const cscPercentage = ref(60)
const cciPercentage = ref(40)
const proofUrl = ref('')
const overrideStep = ref<number | null>(null)
const errorMessage = ref('')

const totalOperationalCost = computed(() => {
  return (costServer.value || 0) + (costDomain.value || 0) + (costApi.value || 0)
})

const currentStep = computed(() => {
  if (!activeReport.value) return 1
  const status = activeReport.value.status
  if (status === 'DRAFT') {
    if (activeReport.value.operationalCost === 0 && costServer.value === 0 && costDomain.value === 0 && costApi.value === 0) {
      return 2
    }
    return 3
  }
  if (status === 'PROCESSED') return 4
  if (status === 'LOCKED') return 5
  return 1
})

const step = computed(() => {
  if (overrideStep.value !== null) return overrideStep.value
  return currentStep.value
})

watch(activeReport, (newReport) => {
  if (newReport) {
    proofUrl.value = newReport.proofOfTransfer || ''
  }
}, { immediate: true })

function selectReport(report: any) {
  activeReport.value = report
  costServer.value = report.operationalCost
  costDomain.value = 0
  costApi.value = 0
  overrideStep.value = null
  errorMessage.value = ''
}

function resetWizard() {
  activeReport.value = null
  selectedPeriod.value = ''
  costServer.value = 0
  costDomain.value = 0
  costApi.value = 0
  cscPercentage.value = 60
  cciPercentage.value = 40
  proofUrl.value = ''
  overrideStep.value = null
  errorMessage.value = ''
}

function updateCscPercentage(val: number) {
  cscPercentage.value = val
  cciPercentage.value = 100 - val
}

function updateCciPercentage(val: number) {
  cciPercentage.value = val
  cscPercentage.value = 100 - val
}

async function handleGenerate() {
  if (!selectedPeriod.value) {
    errorMessage.value = 'Silakan pilih periode laporan.'
    return
  }
  try {
    errorMessage.value = ''
    const data = await generateReportMutation.mutateAsync({ period: selectedPeriod.value })
    activeReport.value = data
    overrideStep.value = null
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal membuat laporan bulanan.'
  }
}

async function handleSaveCosts() {
  try {
    errorMessage.value = ''
    const data = await updateCostMutation.mutateAsync({
      id: activeReport.value.id,
      operationalCost: totalOperationalCost.value
    })
    activeReport.value = data
    overrideStep.value = 3
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal menyimpan biaya operasional.'
  }
}

async function handleProcessDividend() {
  try {
    errorMessage.value = ''
    const data = await processDividendMutation.mutateAsync({
      id: activeReport.value.id,
      cscPercentage: cscPercentage.value,
      cciPercentage: cciPercentage.value
    })
    activeReport.value = data
    overrideStep.value = null
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal memproses dividen.'
  }
}

async function handleLockReport() {
  try {
    errorMessage.value = ''
    const data = await lockReportMutation.mutateAsync(activeReport.value.id)
    activeReport.value = data
    overrideStep.value = null
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal mengunci laporan.'
  }
}

async function handleUploadProof() {
  if (!proofUrl.value) {
    errorMessage.value = 'Silakan isi URL bukti transfer.'
    return
  }
  try {
    errorMessage.value = ''
    const data = await uploadProofMutation.mutateAsync({
      id: activeReport.value.id,
      proofUrl: proofUrl.value
    })
    activeReport.value = data
    errorMessage.value = 'Bukti transfer berhasil diunggah.'
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Gagal mengunggah bukti transfer.'
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val)
}
</script>

<template>
  <div class="space-y-8 w-full max-w-6xl mx-auto font-sans pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Laporan & Dividen Bulanan</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola pembukuan periodik, operational cost, bagi hasil, dan arsip laporan keuangan platform.</p>
      </div>
      <button v-if="activeReport" @click="resetWizard" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        Buat Laporan Baru
      </button>
    </div>

    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm font-semibold text-red-700 flex items-center gap-3">
      <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              {{ activeReport ? `Status Laporan: ${activeReport.period}` : 'Pilih Periode Pembukuan' }}
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">Siklus 5 Langkah Penutupan Laporan Keuangan</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span v-for="s in 5" :key="s" class="flex items-center">
            <span :class="[
              step >= s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-400 border-gray-200',
              step === s ? 'ring-4 ring-blue-50' : ''
            ]" class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black transition-all">
              {{ s }}
            </span>
            <span v-if="s < 5" :class="step > s ? 'bg-blue-600' : 'bg-gray-150'" class="w-6 h-0.5 mx-1"></span>
          </span>
        </div>
      </div>

      <div v-if="step === 1" class="space-y-6 max-w-xl mx-auto py-6 text-center">
        <div class="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-950">Inisiasi Laporan Baru</h3>
          <p class="text-sm text-gray-500 mt-1">Pilih bulan dan tahun laporan keuangan yang ingin Anda proses.</p>
        </div>
        <div class="flex items-center justify-center gap-3">
          <input type="month" v-model="selectedPeriod" class="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
          <button @click="handleGenerate" :disabled="generateReportMutation.isPending.value" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
            {{ generateReportMutation.isPending.value ? 'Memproses...' : 'Generate Draft' }}
          </button>
        </div>
      </div>

      <div v-else-if="step === 2" class="space-y-6 max-w-2xl mx-auto py-4">
        <div>
          <h3 class="text-lg font-bold text-gray-950">Rekonsiliasi Biaya Operasional</h3>
          <p class="text-sm text-gray-500 mt-0.5">Masukkan pengeluaran operasional platform untuk memotong pendapatan kotor.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-2">INFRASTRUKTUR SERVER</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span>
              <input type="number" v-model="costServer" class="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-2">DOMAIN & HOSTING</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span>
              <input type="number" v-model="costDomain" class="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase mb-2">API & LAYANAN PIHAK KETIGA</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span>
              <input type="number" v-model="costApi" class="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
          <span class="text-sm font-bold text-gray-600">Total Biaya Operasional</span>
          <span class="text-xl font-black text-red-600">{{ formatCurrency(totalOperationalCost) }}</span>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
          <button @click="resetWizard" class="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">Batal</button>
          <div class="flex gap-2">
            <button @click="overrideStep = 3" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">Lewati / Lanjut</button>
            <button @click="handleSaveCosts" :disabled="updateCostMutation.isPending.value" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
              {{ updateCostMutation.isPending.value ? 'Menyimpan...' : 'Simpan & Lanjut' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="step === 3" class="space-y-6 max-w-2xl mx-auto py-4">
        <div>
          <h3 class="text-lg font-bold text-gray-950">Distribusi Bagi Hasil (Dividen)</h3>
          <p class="text-sm text-gray-500 mt-0.5">Tentukan persentase bagi hasil pembagian dividen bulanan.</p>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 grid grid-cols-2 gap-4">
          <div>
            <span class="block text-[11px] font-bold text-gray-400 uppercase">PENDAPATAN KOTOR</span>
            <span class="text-lg font-bold text-gray-800">{{ formatCurrency(activeReport.grossRevenue) }}</span>
          </div>
          <div>
            <span class="block text-[11px] font-bold text-gray-400 uppercase">BIAYA OPERASIONAL</span>
            <span class="text-lg font-bold text-red-600">- {{ formatCurrency(activeReport.operationalCost) }}</span>
          </div>
          <div class="col-span-2 border-t border-blue-100 pt-3 flex justify-between items-center">
            <span class="text-sm font-bold text-gray-600">Laba Bersih Terhitung</span>
            <span class="text-xl font-black text-blue-600">{{ formatCurrency(activeReport.grossRevenue - activeReport.operationalCost) }}</span>
          </div>
        </div>

        <div class="space-y-5">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-gray-700">Community Support Center (CSC)</span>
              <span class="text-sm font-black text-blue-600">{{ cscPercentage }}%</span>
            </div>
            <input type="range" min="0" max="100" :value="cscPercentage" @input="updateCscPercentage(Number(($event.target as HTMLInputElement).value))" class="w-full accent-blue-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
            <span class="block text-xs text-gray-400 mt-1">Hasil Dividen CSC: {{ formatCurrency((activeReport.grossRevenue - activeReport.operationalCost) * cscPercentage / 100) }}</span>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-gray-700">Central Computer Improvement (CCI)</span>
              <span class="text-sm font-black text-blue-600">{{ cciPercentage }}%</span>
            </div>
            <input type="range" min="0" max="100" :value="cciPercentage" @input="updateCciPercentage(Number(($event.target as HTMLInputElement).value))" class="w-full accent-blue-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
            <span class="block text-xs text-gray-400 mt-1">Hasil Dividen CCI: {{ formatCurrency((activeReport.grossRevenue - activeReport.operationalCost) * cciPercentage / 100) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
          <button @click="overrideStep = 2" class="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">Kembali</button>
          <button @click="handleProcessDividend" :disabled="processDividendMutation.isPending.value" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            {{ processDividendMutation.isPending.value ? 'Memproses...' : 'Proses & Kunci Sementara' }}
          </button>
        </div>
      </div>

      <div v-else-if="step === 4" class="space-y-6 max-w-2xl mx-auto py-4">
        <div>
          <h3 class="text-lg font-bold text-gray-950">Kunci Laporan Keuangan</h3>
          <p class="text-sm text-gray-500 mt-0.5">Harap periksa kembali rangkuman neraca pembukuan sebelum mengunci permanen laporan ini.</p>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <span class="font-bold text-gray-800 text-sm">Rincian Finansial Periode {{ activeReport.period }}</span>
            <span class="text-xs font-bold px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-full">DRAFT PROCESSED</span>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">Gross Merchandise Value (GMV)</span>
              <span class="text-sm font-bold text-gray-800">{{ formatCurrency(activeReport.totalGmv) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">Pendapatan Kotor (Gross Revenue)</span>
              <span class="text-sm font-bold text-gray-800">{{ formatCurrency(activeReport.grossRevenue) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">Biaya Operasional</span>
              <span class="text-sm font-bold text-red-600">- {{ formatCurrency(activeReport.operationalCost) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm font-bold text-gray-900">Laba Bersih</span>
              <span class="text-sm font-black text-blue-600">{{ formatCurrency(activeReport.netProfit) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">Bagi Hasil CSC</span>
              <span class="text-sm font-bold text-gray-800">{{ formatCurrency(activeReport.cscShare) }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500">Bagi Hasil CCI</span>
              <span class="text-sm font-bold text-gray-800">{{ formatCurrency(activeReport.cciShare) }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
          <svg class="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <h4 class="text-sm font-bold text-orange-800">Perhatian Sebelum Mengunci</h4>
            <p class="text-xs text-orange-700 mt-0.5">Tindakan ini akan mengunci data bulanan secara permanen, menghasilkan berkas PDF, serta mengirimkan surel pemberitahuan ke pimpinan CSC dan CCI.</p>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
          <button @click="overrideStep = 3" class="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">Kembali</button>
          <button @click="handleLockReport" :disabled="lockReportMutation.isPending.value" class="bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            {{ lockReportMutation.isPending.value ? 'Mengunci...' : 'Kunci & Kirim Laporan' }}
          </button>
        </div>
      </div>

      <div v-else-if="step === 5" class="space-y-6 max-w-2xl mx-auto py-4">
        <div>
          <h3 class="text-lg font-bold text-gray-950">Unggah Bukti Transfer Dividen</h3>
          <p class="text-sm text-gray-500 mt-0.5">Laporan telah dikunci (LOCKED). Masukkan tautan bukti transfer untuk menyelesaikan siklus pembukuan.</p>
        </div>

        <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between text-emerald-800">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p class="text-sm font-bold">Laporan Terkunci Secara Resmi</p>
              <p class="text-xs text-emerald-600 mt-0.5">Data aman dari perubahan lebih lanjut.</p>
            </div>
          </div>
          <span class="text-xs font-mono font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">LOCKED</span>
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-bold text-gray-600 uppercase">Tautan Bukti Transfer (Transfer Proof URL)</label>
          <div class="flex gap-2">
            <input type="url" v-model="proofUrl" placeholder="https://supabase.co/storage/v1/object/public/..." class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            <button @click="handleUploadProof" :disabled="uploadProofMutation.isPending.value" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm shrink-0">
              {{ uploadProofMutation.isPending.value ? 'Mengunggah...' : 'Simpan Bukti' }}
            </button>
          </div>
        </div>

        <div v-if="activeReport.proofOfTransfer" class="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">Tautan Bukti Tersimpan</p>
              <p class="text-xs text-gray-400 truncate max-w-[320px] mt-0.5">{{ activeReport.proofOfTransfer }}</p>
            </div>
          </div>
          <a :href="activeReport.proofOfTransfer" target="_blank" class="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            Lihat Bukti
          </a>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
          <button @click="resetWizard" class="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">Kembali ke Menu Utama</button>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Arsip Laporan Keuangan</h2>
          <p class="text-xs text-gray-400 mt-0.5">Daftar riwayat laporan bulanan yang telah diproses sebelumnya</p>
        </div>
      </div>

      <div v-if="reportsQuery.isLoading.value" class="py-12 text-center text-gray-400 text-sm">
        Memuat arsip laporan...
      </div>

      <div v-else-if="!reportsQuery.data.value || reportsQuery.data.value.length === 0" class="py-12 text-center text-gray-400 text-sm">
        Belum ada laporan keuangan bulanan yang diterbitkan.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500">
          <thead class="text-xs text-gray-400 uppercase bg-gray-50 rounded-xl">
            <tr>
              <th class="px-6 py-4 font-bold rounded-l-xl">Periode</th>
              <th class="px-6 py-4 font-bold">Status</th>
              <th class="px-6 py-4 font-bold text-right">Gross Revenue</th>
              <th class="px-6 py-4 font-bold text-right">Operational Cost</th>
              <th class="px-6 py-4 font-bold text-right">Net Profit</th>
              <th class="px-6 py-4 font-bold">Bukti Transfer</th>
              <th class="px-6 py-4 font-bold text-right rounded-r-xl">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="rep in reportsQuery.data.value" :key="rep.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 font-bold text-gray-900">{{ rep.period }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  rep.status === 'LOCKED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : '',
                  rep.status === 'PROCESSED' ? 'bg-orange-50 text-orange-600 border-orange-100' : '',
                  rep.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : ''
                ]" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border">
                  {{ rep.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatCurrency(rep.grossRevenue) }}</td>
              <td class="px-6 py-4 text-right text-red-600 font-semibold">{{ formatCurrency(rep.operationalCost) }}</td>
              <td class="px-6 py-4 text-right font-bold text-blue-600">{{ formatCurrency(rep.netProfit) }}</td>
              <td class="px-6 py-4">
                <a v-if="rep.proofOfTransfer" :href="rep.proofOfTransfer" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Ada
                </a>
                <span v-else class="text-gray-400 text-xs">Belum ada</span>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="selectReport(rep)" class="text-blue-600 hover:text-blue-800 font-bold text-xs">
                  Buka / Kelola
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
