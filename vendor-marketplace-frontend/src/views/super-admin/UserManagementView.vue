<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminUsers, useCreateAdmin, useSuspendAdmin, useUnsuspendAdmin, useDeleteAdmin } from '../../composables/useAdminAnalytics'
import { useSystemAuditLogs } from '../../composables/useSystemConfig'

const currentView = ref('list')
const selectedAdmin = ref<any>(null)

const { data: rawUsers, isLoading } = useAdminUsers()
const auditLogsQuery = useSystemAuditLogs({
  enabled: computed(() => currentView.value === 'detail' && !!selectedAdmin.value)
})

const showAddModal = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedRole = ref('all')

const newAdmin = ref({
  name: '',
  email: '',
  role: 'Validator',
})
const showDeleteModal = ref(false)

const adminLogs = computed(() => {
  if (!auditLogsQuery.data.value || !selectedAdmin.value) return []
  return auditLogsQuery.data.value.filter((log: any) => log.userId === selectedAdmin.value.id)
})

function openDetail(admin: any) {
  selectedAdmin.value = admin
  currentView.value = 'detail'
}

function goBack() {
  currentView.value = 'list'
  selectedAdmin.value = null
}

const users = computed(() => {
  if (!rawUsers.value) return []
  return rawUsers.value.map((u: any) => ({
    id: u.id,
    name: u.fullName,
    personalEmail: '',
    email: u.email,
    status: u.isSuspended ? 'Suspended' : 'Active',
    role: u.role
  }))
})

const filteredUsers = computed(() => {
  return users.value.filter((user: any) => {
    const matchSearch =
      searchQuery.value === '' ||
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = selectedStatus.value === 'all' || user.status === selectedStatus.value
    const matchRole = selectedRole.value === 'all' || user.role === selectedRole.value
    return matchSearch && matchStatus && matchRole
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
watch([searchQuery, selectedStatus, selectedRole], () => { currentPage.value = 1 })

const totalAdminAktif = computed(() => {
  return users.value.filter((u: any) => 
    u.status === 'Active' && 
    (u.role === 'ADMIN_VALIDATOR' || u.role === 'ADMIN_FINANCE' || u.role === 'SUPER_ADMIN')
  ).length
})

const activeValidator = computed(() => {
  return users.value.filter((u: any) => u.role === 'ADMIN_VALIDATOR' && u.status === 'Active').length
})

const adminFinance = computed(() => {
  return users.value.filter((u: any) => u.role === 'ADMIN_FINANCE' && u.status === 'Active').length
})

function openAddModal() {
  newAdmin.value = { name: '', email: '', role: 'Validator' }
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

const createAdminMutation = useCreateAdmin()
const suspendMutation = useSuspendAdmin()
const unsuspendMutation = useUnsuspendAdmin()
const deleteAdminMutation = useDeleteAdmin()

async function submitNewAdmin() {
  if (!newAdmin.value.name || !newAdmin.value.email || !newAdmin.value.role) {
    alert('Mohon isi semua field.')
    return
  }
  
  let backendRole = 'ADMIN_VALIDATOR'
  if (newAdmin.value.role === 'Finance') {
    backendRole = 'ADMIN_FINANCE'
  } else if (newAdmin.value.role === 'Admin Validator' || newAdmin.value.role === 'Validator') {
    backendRole = 'ADMIN_VALIDATOR'
  }
  
  try {
    await createAdminMutation.mutateAsync({
      email: newAdmin.value.email,
      fullName: newAdmin.value.name,
      role: backendRole,
      passwordHash: 'default123'
    })
    alert('Admin berhasil ditambahkan!')
    closeAddModal()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menambahkan admin.')
  }
}

async function toggleSuspendAdmin() {
  if (!selectedAdmin.value) return
  try {
    if (selectedAdmin.value.status === 'Suspended') {
      await unsuspendMutation.mutateAsync(Number(selectedAdmin.value.id))
      selectedAdmin.value.status = 'Active'
      alert('Admin berhasil diaktifkan kembali.')
    } else {
      await suspendMutation.mutateAsync(Number(selectedAdmin.value.id))
      selectedAdmin.value.status = 'Suspended'
      alert('Admin berhasil dinonaktifkan.')
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengubah status admin.')
  }
}

async function confirmDeleteAdmin() {
  if (!selectedAdmin.value) return
  try {
    await deleteAdminMutation.mutateAsync(Number(selectedAdmin.value.id))
    alert('Akses admin berhasil dihapus.')
    showDeleteModal.value = false
    goBack()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus admin.')
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'ADMIN_VALIDATOR':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'ADMIN_FINANCE':
      return 'bg-red-50 text-red-600 border-red-200'
    case 'SUPER_ADMIN':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
</script>

<template>
  <div class="space-y-6 pb-12 w-full max-w-6xl mx-auto">
    <!-- LIST VIEW -->
    <template v-if="currentView === 'list'">
      <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4 h-16">
      <h1 class="text-[22px] font-semibold text-gray-900 border-none">Manajemen Peran</h1>
      <!-- Top header notification bell -->
      <button class="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span class="absolute top-2 right-2.5 w-2 h-2 rounded-full border border-white bg-red-500"></span>
      </button>
    </div>

    <!-- Stat Cards -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
        <div class="w-10 h-10 bg-gray-200 rounded-xl mb-3"></div>
        <div class="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total Admin Aktif -->
      <div class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ totalAdminAktif }}</p>
          <p class="text-sm text-gray-500 mt-1">Total Admin Aktif</p>
        </div>
      </div>

      <!-- Active Validator -->
      <div class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ activeValidator }}</p>
          <p class="text-sm text-gray-500 mt-1">Active Validator</p>
        </div>
      </div>

      <!-- Admin Finance -->
      <div class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ adminFinance }}</p>
          <p class="text-sm text-gray-500 mt-1">Admin Finance</p>
        </div>
      </div>
    </div>

    <!-- Filters and Action bar -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
      <!-- Search -->
      <div class="relative w-full sm:max-w-md flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="cari member"
          class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <!-- Status Dropdown -->
        <div class="relative">
          <button class="flex items-center justify-between w-full sm:w-auto gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-gray-50 focus:outline-none shadow-sm transition-all">
            Semua Status
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Role Dropdown -->
        <div class="relative">
          <button class="flex items-center justify-between w-full sm:w-auto gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-gray-50 focus:outline-none shadow-sm transition-all">
            Semua Role
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Add Admin Button -->
        <button
          @click="openAddModal"
          class="flex items-center justify-center gap-2 bg-brand-navy text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-blue-800 shadow-sm transition-all whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Tambah Admin
        </button>
      </div>
    </div>

    <!-- Main Card Content -->
    <div class="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      <!-- Card Header -->
      <div class="px-6 py-5 border-b border-gray-200 flex items-center gap-3 bg-white">
        <h2 class="text-lg font-bold text-gray-900 leading-none">Team members</h2>
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
          {{ filteredUsers.length }} users
        </span>
      </div>

      <!-- Table Section -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-white">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 tracking-wider">
                <div class="flex items-center gap-1">
                  Status
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 tracking-wider">
                <div class="flex items-center gap-1">
                  Role
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 tracking-wider">
                Email
              </th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-medium text-gray-500 tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-6 bg-gray-200 rounded-md w-16"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-6 bg-gray-200 rounded-full w-24"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4 whitespace-nowrap text-center"><div class="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div></td>
              </tr>
            </template>
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                Tidak ada data member yang ditemukan
              </td>
            </tr>
            <template v-else v-for="(user, index) in paginatedUsers" :key="index">
              <tr class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-900">{{ user.name }}</span>
                    <span class="text-sm text-gray-400">{{ user.personalEmail }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 gap-1.5 bg-white text-gray-700"
                  >
                    <!-- Dot -->
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'"
                    ></span>
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                    :class="getRoleColor(user.role)"
                  >
                    {{ user.role.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600">{{ user.email }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button @click="openDetail(user)" class="text-gray-400 hover:text-gray-600 transition-colors mx-auto flex items-center justify-center">
                    <span class="sr-only">View</span>
                    <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="bg-white px-6 py-4 flex items-center border-t border-gray-200 justify-between">
        <button 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Previous
        </button>

        <!-- Page Numbers -->
        <div class="hidden md:flex items-center gap-1.5">
          <template v-for="(page, i) in visiblePages" :key="i">
            <span 
              v-if="page === '...'" 
              class="w-10 h-10 flex items-center justify-center text-sm font-medium text-gray-600"
            >
              ...
            </span>
            <button 
              v-else
              @click="goToPage(page)"
              class="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors"
              :class="currentPage === page ? 'bg-[#1E3A8A] text-white shadow-sm font-bold' : 'text-gray-600 hover:bg-gray-50'"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <button 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none"
        >
          Next
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
    </template>

    <!-- DETAIL VIEW -->
    <template v-if="currentView === 'detail'">
      <!-- Back button -->
      <button @click="goBack" class="flex items-center gap-2 text-gray-800 hover:text-black mb-6 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <!-- Title & Header Profile -->
      <div class="mb-8">
        <h2 class="text-[17px] font-bold text-[#1E3A8A] mb-4 pb-2 inline-block border-b-2 border-gray-200">
          Detail Admin: {{ selectedAdmin?.name }}
        </h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-full border-[6px] border-orange-50 overflow-hidden">
              <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAdmin?.name || 'Admin')}&background=random`" alt="Profile" class="w-full h-full object-cover" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-[#1E3A8A]">{{ selectedAdmin?.name }}</h3>
              <p class="text-[15px] text-[#1E3A8A]/80">{{ selectedAdmin?.role }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="toggleSuspendAdmin" class="px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm text-white" :class="selectedAdmin?.status === 'Suspended' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'">
              {{ selectedAdmin?.status === 'Suspended' ? 'Aktifkan Kembali' : 'Suspend' }}
            </button>
            <button @click="showDeleteModal = true" class="bg-[#EF4444] hover:bg-red-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors self-start sm:self-center shadow-sm">
              Hapus Akses
            </button>
          </div>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="border-t border-gray-100 mb-8"></div>

      <!-- Audit Log -->
      <div>
        <h3 class="text-lg font-bold text-[#1E3A8A] mb-4">Audit log</h3>
        <div v-if="auditLogsQuery.isLoading.value" class="py-8 text-center text-sm text-gray-400">
          Memuat log audit...
        </div>
        <div v-else-if="adminLogs.length === 0" class="py-8 text-center text-sm text-gray-400">
          Belum ada log aktivitas tercatat untuk admin ini.
        </div>
        <div v-else class="space-y-4">
          <div v-for="log in adminLogs" :key="log.id" class="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4 shadow-sm">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-bold shrink-0">
              {{ (log.user?.fullName || 'A').charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 bg-gray-100 border border-gray-400 rounded-full text-xs font-medium text-gray-700">
                  {{ log.action }}
                </span>
                <span class="text-xs text-gray-400">{{ new Date(log.createdAt).toLocaleString('id-ID') }}</span>
              </div>
              <h4 class="text-base font-bold text-gray-900 mt-1">
                Mengubah {{ log.key }} dari "{{ log.oldValue || '-' }}" menjadi "{{ log.newValue }}"
              </h4>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Admin Modal Overlay -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showAddModal"
          class="fixed inset-0 z-[100] flex items-center justify-center"
          @click.self="closeAddModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeAddModal"></div>

          <!-- Modal Content -->
          <Transition name="modal-scale">
            <div
              v-if="showAddModal"
              class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 z-10"
            >
              <!-- Close button -->
              <button
                @click="closeAddModal"
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Modal Header -->
              <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-900">Tambah Admin Baru</h3>
                <p class="text-sm text-gray-400 mt-1 leading-relaxed">
                  Tambahkan pengguna admin baru ke sistem. Email undangan akan dikirim ke alamat email mereka.
                </p>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-100 mb-6"></div>

              <!-- Form -->
              <form @submit.prevent="submitNewAdmin" class="space-y-5">
                <!-- Nama Lengkap -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Nama lengkap</label>
                  <input
                    v-model="newAdmin.name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <input
                    v-model="newAdmin.email"
                    type="email"
                    placeholder="admin@example.com"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <!-- Peran -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Peran</label>
                  <div class="relative">
                    <select
                      v-model="newAdmin.role"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                    >
                      <option value="Validator">Validator</option>
                      <option value="Finance">Finance</option>
                      <option value="Admin Validator">Admin Validator</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-2">
                  <button
                    type="submit"
                    class="bg-brand-navy text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-blue-800 shadow-md hover:shadow-lg transition-all"
                  >
                    Kirim Undangan
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
    
    <!-- Delete Admin Modal Overlay -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-[100] flex items-center justify-center"
          @click.self="showDeleteModal = false"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showDeleteModal = false"></div>

          <!-- Modal Content -->
          <Transition name="modal-scale">
            <div
              v-if="showDeleteModal"
              class="relative bg-white rounded-3xl shadow-2xl w-full max-w-[400px] mx-4 p-8 z-10"
            >
              <!-- Modal Text -->
              <h3 class="text-[20px] font-bold text-gray-900 mb-3">Hapus Akses Admin?</h3>
              <p class="text-[15px] text-gray-500 mb-10 leading-relaxed">
                Anda akan menghapus akses admin dari pengguna ini.
              </p>

              <!-- Action Button -->
              <div class="flex justify-center">
                <button
                  @click="confirmDeleteAdmin"
                  class="bg-[#EF4444] hover:bg-red-600 text-white px-10 py-3.5 rounded-xl text-base font-bold transition-colors w-[80%] shadow-sm"
                >
                  Hapus Akses
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Modal transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.2s ease-in;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(10px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(5px);
}
</style>
