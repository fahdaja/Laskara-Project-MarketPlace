<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '../../composables/useUsers'
import { useAdmin } from '../../composables/useAdmin'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { data: rawUsers, isLoading } = useUsers()
const { suspendUserMutation } = useAdmin()
const { user: currentAuthUser } = useAuth()

const isSuperAdmin = computed(() => {
  const role = currentAuthUser.value?.role?.toUpperCase()
  return role === 'SUPER_ADMIN' || role === 'SUPERADMIN'
})

const searchQuery = ref('')
const statusFilter = ref('all')
const actionLoading = ref(false)
const errorMessage = ref('')

const users = computed(() => {
  if (!rawUsers.value) return []
  return rawUsers.value.map((u: any) => ({
    id: u.id,
    name: u.fullName,
    email: u.email,
    status: u.isSuspended ? 'Suspend' : 'Active',
    avatar: u.avatarUrl || `https://i.pravatar.cc/150?img=${u.id % 70}`
  }))
})

const filteredUsers = computed(() => {
  return users.value.filter((user: any) => {
    const matchSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = statusFilter.value === 'all' || user.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

// ── Pagination ──────────────────────────────────────────
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredUsers.value.slice(start, start + itemsPerPage)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

function goToPage(page: number | string) {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset to page 1 when filters change
watch([searchQuery, statusFilter], () => { currentPage.value = 1 })

// ── Detail / Suspend ────────────────────────────────────
const showDetailModal = ref(false)
const showSuspendConfirmModal = ref(false)
const selectedUser = ref<any>(null)
const selectedDuration = ref('3')
const suspendNote = ref('')

function openDetail(user: any) {
  selectedUser.value = { ...user }
  showDetailModal.value = true
}

function closeDetail() {
  showDetailModal.value = false
  selectedUser.value = null
}

function goToActivity() {
  if (selectedUser.value) {
    const parentPath = router.currentRoute.value.path.split('/user-moderation')[0]
    router.push(`${parentPath}/user-moderation/${selectedUser.value.id}/activity`)
  }
}

function openSuspendConfirm() {
  showSuspendConfirmModal.value = true
}

function closeSuspendConfirm() {
  showSuspendConfirmModal.value = false
  suspendNote.value = ''
}

async function submitSuspend() {
  if (!selectedUser.value) return
  actionLoading.value = true
  try {
    await suspendUserMutation.mutateAsync({
      id: selectedUser.value.id,
      isSuspended: true,
      reason: suspendNote.value,
      days: selectedDuration.value === 'permanent' ? 0 : Number(selectedDuration.value)
    })
  } finally {
    actionLoading.value = false
  }
  closeSuspendConfirm()
  closeDetail()
}

async function submitUnsuspend() {
  if (!selectedUser.value) return
  if (!isSuperAdmin.value) {
    errorMessage.value = 'Hanya Super Admin yang dapat mencabut suspend akun.'
    setTimeout(() => { errorMessage.value = '' }, 4000)
    return
  }
  actionLoading.value = true
  try {
    await suspendUserMutation.mutateAsync({
      id: selectedUser.value.id,
      isSuspended: false,
      reason: 'Pencabutan suspend oleh admin'
    })
    selectedUser.value = { ...selectedUser.value, status: 'Active' }
    closeDetail()
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Gagal mencabut suspend.'
    setTimeout(() => { errorMessage.value = '' }, 4000)
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in w-full pb-10">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Manajemen & Moderasi User</h1>
    </div>

    <!-- Search and Filter -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div class="relative w-full sm:w-[400px]">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="cari member" 
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
        />
      </div>
      <div class="w-full sm:w-auto relative">
        <select v-model="statusFilter" class="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] appearance-none pr-10">
          <option value="all">Semua Status</option>
          <option value="Active">Active</option>
          <option value="Suspend">Suspend</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center gap-3">
        <h2 class="text-lg font-bold text-gray-800">Total User</h2>
        <span class="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">{{ filteredUsers.length }} users</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="text-xs text-gray-400 bg-gray-50/50 uppercase border-b border-gray-100">
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Name</th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider flex items-center gap-1">
                Status
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Email address</th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-md w-16"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4 text-right"><div class="h-8 w-8 bg-gray-200 rounded-lg ml-auto"></div></td>
              </tr>
            </template>
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500 font-medium">Data user tidak ditemukan</td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">{{ user.name }}</div>
                <div class="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">ID: #{{ user.id }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-700">
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ user.status }}
                </div>
              </td>
              <td class="px-6 py-4 text-gray-500 font-medium">{{ user.email }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="openDetail(user)" class="text-gray-400 hover:text-[#1E3A8A] transition-colors p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>
        <div class="hidden sm:flex items-center gap-1">
          <template v-for="(page, idx) in visiblePages" :key="idx">
            <span v-if="page === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
            <button 
              v-else
              @click="goToPage(page)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
              :class="page === currentPage ? 'bg-[#1E3A8A] text-white font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 font-medium'"
            >
              {{ page }}
            </button>
          </template>
        </div>
        <span class="sm:hidden text-sm text-gray-500 font-medium">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>

    <!-- Detail Drawer Overlay -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div class="absolute inset-0" @click="closeDetail"></div>
      
      <div class="bg-white w-full max-w-[400px] h-full shadow-2xl relative z-10 flex flex-col items-center p-8 space-y-6 animate-slide-in-right overflow-y-auto">
        
        <div class="w-full flex flex-col items-center p-6 border border-gray-100 rounded-[20px] bg-white shadow-sm mt-4">
          <img :src="selectedUser?.avatar" alt="Avatar" class="w-20 h-20 rounded-full object-cover mb-4 border-2 border-gray-50" />
          <h3 class="text-lg font-extrabold text-gray-900">{{ selectedUser?.name }}</h3>
          <p class="text-sm text-gray-500 mb-3">{{ selectedUser?.email }}</p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs font-bold">
            <span class="w-2 h-2 rounded-full" :class="selectedUser?.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'"></span>
            {{ selectedUser?.status }}
          </div>
        </div>

        <button @click="goToActivity" class="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
          Lihat Aktivitas
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>

        <!-- Durasi Suspend -->
        <div v-if="selectedUser?.status === 'Active'" class="w-full grid grid-cols-2 gap-3 mt-4">
          <button 
            @click="selectedDuration = '3'"
            class="flex flex-col items-center justify-center p-4 border rounded-xl transition-all"
            :class="selectedDuration === '3' ? 'border-[#1E3A8A] bg-blue-50/50 ring-1 ring-[#1E3A8A]' : 'border-gray-200 hover:border-gray-300 bg-white'"
          >
            <span class="font-extrabold text-gray-900 text-sm">3 Hari</span>
            <span class="text-xs text-gray-500 mt-1">Sementara</span>
          </button>
          <button 
            @click="selectedDuration = '7'"
            class="flex flex-col items-center justify-center p-4 border rounded-xl transition-all"
            :class="selectedDuration === '7' ? 'border-[#1E3A8A] bg-blue-50/50 ring-1 ring-[#1E3A8A]' : 'border-gray-200 hover:border-gray-300 bg-white'"
          >
            <span class="font-extrabold text-gray-900 text-sm">7 Hari</span>
            <span class="text-xs text-gray-500 mt-1">Menengah</span>
          </button>
          <button 
            @click="selectedDuration = 'permanent'"
            class="flex flex-col items-center justify-center p-4 border rounded-xl transition-all col-span-2"
            :class="selectedDuration === 'permanent' ? 'border-[#1E3A8A] bg-blue-50/50 ring-1 ring-[#1E3A8A]' : 'border-gray-200 hover:border-gray-300 bg-white'"
          >
            <span class="font-extrabold text-gray-900 text-sm">Permanen</span>
            <span class="text-xs text-gray-500 mt-1">Blokir Selamanya</span>
          </button>
        </div>

        <button 
          v-if="selectedUser?.status === 'Active'" 
          @click="openSuspendConfirm" 
          class="w-full bg-[#E53E3E] hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm uppercase tracking-wide shadow-sm mt-auto"
        >
          Suspend Akun
        </button>
        <!-- Error Message -->
        <div v-if="errorMessage" class="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium text-center">
          {{ errorMessage }}
        </div>

        <button 
          v-else 
          @click="submitUnsuspend" 
          :disabled="actionLoading || !isSuperAdmin"
          class="w-full font-bold py-3.5 px-4 rounded-xl transition-colors text-sm uppercase tracking-wide shadow-sm mt-auto disabled:cursor-not-allowed"
          :class="isSuperAdmin ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-60' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
          :title="!isSuperAdmin ? 'Hanya Super Admin yang dapat mencabut suspend' : ''"
        >
          <span v-if="actionLoading">Memproses...</span>
          <span v-else-if="!isSuperAdmin">Hanya Super Admin</span>
          <span v-else>Cabut Suspend</span>
        </button>
      </div>
    </div>

    <!-- Second Modal: Suspend Confirm (Centered Modal) -->
    <div v-if="showSuspendConfirmModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
      <div class="absolute inset-0" @click="closeSuspendConfirm"></div>
      <div class="relative w-full max-w-[450px] bg-white rounded-[20px] shadow-2xl overflow-hidden animate-scale-in">
        <div class="bg-[#DF4A4A] px-6 py-5 flex items-center justify-between">
          <h3 class="text-white font-bold text-lg">SUSPEND AKUN</h3>
          <button @click="closeSuspendConfirm" class="text-white hover:text-red-200 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-8">
          <label class="block text-base font-bold text-gray-900 mb-3">Catatan</label>
          <textarea 
            v-model="suspendNote"
            rows="5"
            placeholder="Jelaskan detail pelanggaran untuk catatan audit..."
            class="w-full p-4 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-[#DF4A4A] focus:border-transparent resize-none bg-white"
          ></textarea>
          
          <div class="flex justify-end mt-8">
            <button 
              @click="submitSuspend" 
              :disabled="actionLoading"
              class="bg-[#DF4A4A] hover:bg-red-700 text-white font-bold py-3 px-10 rounded-[12px] transition-colors text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading">Memproses...</span>
              <span v-else>Suspend</span>
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

.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
