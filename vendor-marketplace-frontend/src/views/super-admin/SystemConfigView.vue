<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSystemConfig } from '../../composables/useSystemConfig'
import { useCategories } from '../../composables/useCategories'
import api from '../../api/axios'

const { configsQuery, auditLogsQuery, updateConfigMutation } = useSystemConfig()
const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useCategories()

const newCategoryName = ref('')
const newCategoryCommission = ref(5)
const showSecurityModal = ref(false)
const adminPassword = ref('')
const pendingAction = ref<(() => Promise<void>) | null>(null)
const showPricingModal = ref(false)
const selectedCategory = ref<any>(null)
const customCommissionRate = ref('')
const errorMessage = ref('')
const maintenanceMessageInput = ref('')

function getConf(key: string, fallback: string = '') {
  if (!configsQuery.data.value) return fallback
  const found = configsQuery.data.value.find((c: any) => c.key === key)
  return found ? found.value : fallback
}

const maintenanceMode = computed(() => {
  return getConf('maintenance_mode') === 'true'
})

const currentFee = computed(() => {
  return getConf('default_commission_rate', '5') + '%'
})

const newFee = ref('')

watch(() => getConf('maintenance_message'), (newVal) => {
  maintenanceMessageInput.value = newVal
}, { immediate: true })

function openSecurityModal(action: () => Promise<void>) {
  pendingAction.value = action
  adminPassword.value = ''
  errorMessage.value = ''
  showSecurityModal.value = true
}

async function confirmAction() {
  if (!pendingAction.value) return
  try {
    errorMessage.value = ''
    await pendingAction.value()
    showSecurityModal.value = false
    pendingAction.value = null
    adminPassword.value = ''
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Aksi gagal. Konfirmasi password salah atau otorisasi ditolak.'
  }
}

function handleToggleMaintenance() {
  const newVal = maintenanceMode.value ? 'false' : 'true'
  openSecurityModal(async () => {
    await updateConfigMutation.mutateAsync({
      key: 'maintenance_mode',
      value: newVal,
      confirmPassword: adminPassword.value
    })
  })
}

function handleSaveMaintenanceMessage() {
  openSecurityModal(async () => {
    await updateConfigMutation.mutateAsync({
      key: 'maintenance_message',
      value: maintenanceMessageInput.value,
      confirmPassword: adminPassword.value
    })
  })
}

function handleSaveDefaultCommission() {
  if (!newFee.value) return
  openSecurityModal(async () => {
    await updateConfigMutation.mutateAsync({
      key: 'default_commission_rate',
      value: newFee.value,
      confirmPassword: adminPassword.value
    })
    newFee.value = ''
  })
}

function openPricingModal(cat: any) {
  selectedCategory.value = cat
  const customVal = getConf(`commission_rate_${cat.id}`)
  customCommissionRate.value = customVal || String(cat.commissionRate)
  showPricingModal.value = true
}

function handleSavePricing() {
  if (!selectedCategory.value) return
  openSecurityModal(async () => {
    await updateConfigMutation.mutateAsync({
      key: `commission_rate_${selectedCategory.value.id}`,
      value: customCommissionRate.value,
      confirmPassword: adminPassword.value
    })
    showPricingModal.value = false
    selectedCategory.value = null
  })
}

function handleAddCategory() {
  if (!newCategoryName.value.trim()) return
  openSecurityModal(async () => {
    await api.post('/categories', {
      name: newCategoryName.value,
      commissionRate: Number(newCategoryCommission.value)
    })
    newCategoryName.value = ''
    newCategoryCommission.value = 5
    await refetchCategories()
  })
}

function handleDeleteCategory(id: number) {
  openSecurityModal(async () => {
    await api.delete(`/categories/${id}`)
    await refetchCategories()
  })
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans">
    <div class="flex items-center justify-between border-b border-gray-200 pb-4 h-16">
      <div>
        <h1 class="text-[22px] font-semibold text-gray-900">Konfigurasi Sistem</h1>
        <p class="text-xs text-gray-400 mt-1">Super Admin Panel untuk manajemen parameter platform.</p>
      </div>
    </div>

    <section class="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Fee & Komisi Platform</h2>
            <p class="text-xs text-gray-400 mt-0.5">Potongan otomatis dari setiap transaksi</p>
          </div>
        </div>
        <span class="text-blue-600 text-xs font-semibold">Berlaku Otomatis</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Komisi Platform Saat Ini</label>
          <input type="text" disabled :value="currentFee" class="w-full bg-[#0B152A] text-white font-semibold rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Ubah Fee Komisi Utama</label>
          <div class="relative flex gap-3">
            <div class="relative flex-1">
              <input type="number" v-model="newFee" placeholder="Contoh: 5" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 pr-10 transition-colors" />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
            </div>
            <button @click="handleSaveDefaultCommission" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap">
              Simpan
            </button>
          </div>
          <p class="text-[11px] text-gray-400 mt-1.5 italic">Berlaku untuk seluruh transaksi yang belum dibuat</p>
        </div>
      </div>
    </section>

    <section class="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Emergency Maintenance Mode</h2>
            <p class="text-xs text-gray-400 mt-0.5">Nonaktifkan akses user saat server down atau terjadi bug kritis</p>
          </div>
        </div>
        <span :class="maintenanceMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'" class="px-3 py-1 rounded-full text-xs font-semibold border">
          {{ maintenanceMode ? 'System Down' : 'Sistem Normal' }}
        </span>
      </div>

      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <div class="flex-1 w-full space-y-4">
          <div :class="maintenanceMode ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-green-50 border-l-4 border-l-green-500'" class="rounded-xl p-4">
            <div class="flex items-start gap-2">
              <span :class="maintenanceMode ? 'bg-red-500' : 'bg-green-500'" class="w-2 h-2 rounded-full mt-1.5 shrink-0"></span>
              <div>
                <h4 :class="maintenanceMode ? 'text-red-800' : 'text-green-800'" class="text-sm font-semibold">{{ maintenanceMode ? 'Platform Nonaktif' : 'Platform Aktif' }}</h4>
                <p :class="maintenanceMode ? 'text-red-600' : 'text-green-600'" class="text-xs mt-0.5">{{ maintenanceMode ? 'User tidak dapat login atau bertransaksi saat ini.' : 'Semua user dapat login dan menggunakan layanan platform secara normal.' }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Pesan untuk User (opsional)</label>
            <div class="flex gap-3 items-end">
              <textarea v-model="maintenanceMessageInput" rows="2" class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="Contoh: Kami sedang melakukan pemeliharaan sistem. Mohon tunggu 30 menit."></textarea>
              <button @click="handleSaveMaintenanceMessage" class="bg-gray-800 hover:bg-gray-900 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shadow-sm shrink-0">
                Simpan Pesan
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center shrink-0 lg:pl-6 lg:border-l border-gray-100 pt-4 lg:pt-0">
          <button @click="handleToggleMaintenance" :class="maintenanceMode ? 'bg-red-600' : 'bg-gray-200'" class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none">
            <span :class="maintenanceMode ? 'translate-x-7' : 'translate-x-1'" class="inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300" />
          </button>
          <span class="text-xs font-bold text-gray-600 mt-2">{{ maintenanceMode ? 'ON' : 'OFF' }}</span>
        </div>
      </div>
    </section>

    <section class="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Manajemen Kategori Jasa</h2>
            <p class="text-xs text-gray-400 mt-0.5">Tambah, edit, atau hapus kategori layanan platform</p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-3">+ Tambah Kategori Baru</label>
        <div class="bg-gray-50 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 border border-gray-100">
          <input type="text" v-model="newCategoryName" placeholder="Nama Kategori Baru (misal: Jasa AI Prompter)" class="flex-1 w-full bg-white border border-gray-150 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <div class="flex items-center gap-2 shrink-0">
            <div class="relative">
              <input type="number" v-model="newCategoryCommission" class="w-24 bg-white rounded-xl px-3 py-2.5 text-sm font-medium border border-gray-150 focus:outline-none" placeholder="Komisi" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
            </div>
            <button @click="handleAddCategory" class="bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap">
              Tambah
            </button>
          </div>
        </div>
      </div>

      <div v-if="loadingCategories" class="py-8 text-center text-sm text-gray-400">
        Memuat kategori...
      </div>

      <div v-else class="space-y-3">
        <div v-for="cat in categories" :key="cat.id" class="bg-gray-50 rounded-xl px-5 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
          <div>
            <h3 class="text-sm font-bold text-gray-900">{{ cat.name }}</h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Default: {{ cat.commissionRate }}%
              <span v-if="getConf(`commission_rate_${cat.id}`)" class="ml-2 text-blue-600 font-bold">
                (Kustom: {{ getConf(`commission_rate_${cat.id}`) }}%)
              </span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button @click="openPricingModal(cat)" class="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
              Ubah Komisi
            </button>
            <button @click="handleDeleteCategory(cat.id)" class="text-red-400 hover:text-red-600 transition-colors p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
      <div class="flex items-start justify-between mb-6 border-b border-gray-50 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Audit Trail Perubahan Sistem</h2>
            <p class="text-xs text-gray-400 mt-0.5">Rekam jejak setiap perubahan konfigurasi sistem</p>
          </div>
        </div>
      </div>

      <div v-if="auditLogsQuery.isLoading.value" class="py-8 text-center text-sm text-gray-400">
        Memuat riwayat audit...
      </div>

      <div v-else-if="!auditLogsQuery.data.value || auditLogsQuery.data.value.length === 0" class="py-8 text-center text-sm text-gray-400">
        Belum ada riwayat perubahan sistem yang tercatat.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500">
          <thead class="text-xs text-gray-400 uppercase bg-gray-50 rounded-xl">
            <tr>
              <th class="px-6 py-4 font-bold rounded-l-xl">Waktu</th>
              <th class="px-6 py-4 font-bold">Admin</th>
              <th class="px-6 py-4 font-bold">Parameter</th>
              <th class="px-6 py-4 font-bold">Nilai Lama</th>
              <th class="px-6 py-4 font-bold rounded-r-xl">Nilai Baru</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in auditLogsQuery.data.value" :key="log.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 text-xs">{{ formatDate(log.createdAt) }}</td>
              <td class="px-6 py-4">
                <span class="font-bold text-gray-800 block text-xs">{{ log.user?.fullName }}</span>
                <span class="text-[10px] text-gray-400">{{ log.user?.email }}</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-blue-600">{{ log.key }}</td>
              <td class="px-6 py-4 text-xs font-mono text-gray-400">{{ log.oldValue || '-' }}</td>
              <td class="px-6 py-4 text-xs font-mono text-gray-900 font-bold">{{ log.newValue }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="showSecurityModal" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showSecurityModal = false"></div>
        <div class="relative bg-white rounded-3xl w-full max-w-sm mx-4 p-8 z-10 shadow-2xl">
          <h3 class="text-lg font-bold text-gray-900 mb-1">Konfirmasi Keamanan</h3>
          <p class="text-sm text-gray-400 mb-6">Masukkan kata sandi administrator Anda untuk menyetujui perubahan ini.</p>
          
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-700 rounded-xl">
            {{ errorMessage }}
          </div>

          <div class="mb-6">
            <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Kata Sandi</label>
            <input type="password" v-model="adminPassword" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="••••••••" />
          </div>

          <div class="flex flex-col gap-2">
            <button @click="confirmAction" class="w-full bg-[#0B152A] hover:bg-black text-white py-3 rounded-xl font-bold transition-colors text-sm shadow-md">
              Konfirmasi & Terapkan
            </button>
            <button @click="showSecurityModal = false" class="w-full text-gray-500 hover:text-gray-800 py-2 font-semibold text-sm transition-colors">
              Batal
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showPricingModal" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showPricingModal = false"></div>
        <div class="relative bg-white rounded-3xl w-full max-w-md mx-4 p-6 z-10 shadow-2xl">
          <button @click="showPricingModal = false" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <h3 class="text-lg font-bold text-gray-900 mb-5">Sesuaikan Komisi Kategori</h3>

          <div v-if="selectedCategory" class="bg-gray-50 rounded-xl p-4 mb-5 flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-900">{{ selectedCategory.name }}</span>
            <span class="text-xs text-gray-400">Default: {{ selectedCategory.commissionRate }}%</span>
          </div>

          <div class="mb-6">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Nilai Komisi Kustom</label>
            <div class="relative">
              <input type="number" v-model="customCommissionRate" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 pr-10" placeholder="Contoh: 5" />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
            </div>
            <p class="text-[10px] text-gray-400 mt-2">Ini akan mengesampingkan fee komisi platform utama khusus untuk kategori ini.</p>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-50 pt-4">
            <button @click="showPricingModal = false" class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Batal</button>
            <button @click="handleSavePricing" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-scale-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-scale-leave-active { transition: all 0.2s ease-in; }
.modal-scale-enter-from { opacity: 0; transform: scale(0.92) translateY(10px); }
.modal-scale-leave-to { opacity: 0; transform: scale(0.95) translateY(5px); }
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
