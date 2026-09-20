<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useFinanceActivityLog } from '../../composables/useFinanceActivityLog'

const router = useRouter()
const { user, logout, uploadFile, updateProfileMutation } = useAuth()
const authUser = user
const activeTab = ref<'log' | 'pengaturan'>('log')

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const res = await uploadFile(file, 'avatars')
    if (res?.url) {
      await updateProfileMutation.mutateAsync({ avatarUrl: res.url })
    }
  } catch (err) {
    console.error('Gagal mengunggah foto profil:', err)
  }
}

const { logs, isLoading: logLoading, isError: logError } = useFinanceActivityLog()

const adminInfo = computed(() => {
  const u = (user.value || {}) as any

  const joinedDate = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const initials = (u.fullName || 'AF')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')

  return {
    name: u.fullName || 'Admin Finance',
    initials,
    id: u.id ? `#FIN-${u.id}` : null,
    isSuspended: u.isSuspended ?? false,
    statusBadge: u.isSuspended ? 'DITANGGUHKAN' : 'AKTIF',
    role: u.role === 'ADMIN_FINANCE' ? 'Finance Administrator' : u.role || 'Finance Administrator',
    department: 'Finance & Accounting',
    email: u.email || '-',
    tanggalBergabung: joinedDate,
  }
})

const handleLogout = () => logout()
const goBack = () => router.back()
</script>

<template>
  <div class="w-full max-w-4xl mx-auto pb-12 font-sans">

    <!-- Top Actions -->
    <div class="flex items-center justify-between mb-6">
      <button @click="goBack" class="flex items-center gap-2 text-gray-800 hover:text-gray-600 group transition-colors">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-sm font-medium">Kembali</span>
      </button>
      <button @click="handleLogout" class="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors border border-red-100 shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>

    <!-- Header Card -->
    <div class="bg-[#F0F4FF] rounded-2xl px-8 py-6 flex items-center justify-between mb-6 border border-blue-50">
      <div class="flex items-center gap-5">
        <div 
          @click="triggerFileInput"
          class="relative group cursor-pointer w-16 h-16 rounded-full overflow-hidden bg-[#2A437E] shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-sm border border-blue-100"
        >
          <img v-if="authUser?.avatarUrl" :src="authUser.avatarUrl" alt="User Profile" class="w-full h-full object-cover" />
          <span v-else>{{ adminInfo.initials }}</span>
          
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
        </div>
        
        <!-- Hidden file input -->
        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
        
        <div>
          <h1 class="text-2xl font-extrabold text-[#0B4086]">{{ adminInfo.name }}</h1>
          <span
            class="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-white"
            :class="adminInfo.isSuspended ? 'bg-red-500' : 'bg-emerald-600'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            Status: {{ adminInfo.statusBadge }}
          </span>
        </div>
      </div>
      <button @click="triggerFileInput" class="bg-[#2A437E] hover:bg-[#1e305a] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-sm">
        Edit Profil
      </button>
    </div>

    <!-- Detail Info Card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Informasi Karyawan</h2>
          <p class="text-sm text-gray-500 mt-0.5">Detail identitas dan peran di dalam sistem.</p>
        </div>
        <span v-if="adminInfo.id" class="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#F0F4FF] text-[#2A437E] border border-[#D1DDF7]">
          {{ adminInfo.id }}
        </span>
      </div>
      <div class="space-y-4 text-sm bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <div class="flex border-b border-gray-100 pb-3">
          <span class="text-gray-500 w-48 shrink-0 font-medium">Peran / Role:</span>
          <span class="text-gray-900 font-bold">{{ adminInfo.role }}</span>
        </div>
        <div class="flex border-b border-gray-100 pb-3">
          <span class="text-gray-500 w-48 shrink-0 font-medium">Departemen:</span>
          <span class="text-gray-900 font-bold">{{ adminInfo.department }}</span>
        </div>
        <div class="flex border-b border-gray-100 pb-3">
          <span class="text-gray-500 w-48 shrink-0 font-medium">Email Pekerjaan:</span>
          <span class="text-blue-600 font-bold">{{ adminInfo.email }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-500 w-48 shrink-0 font-medium">Tanggal Bergabung:</span>
          <span v-if="adminInfo.tanggalBergabung" class="text-gray-900 font-bold">{{ adminInfo.tanggalBergabung }}</span>
          <span v-else class="text-gray-400 italic">Tidak tersedia</span>
        </div>
      </div>
    </div>

    <!-- Log Aktivitas Card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
      <!-- Tab Buttons -->
      <div class="flex items-center gap-2 mb-8 border-b border-gray-100 pb-4">
        <button
          @click="activeTab = 'log'"
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          :class="activeTab === 'log' ? 'bg-[#2A437E] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        >
          Riwayat Aktivitas Sistem
        </button>
        <button
          disabled
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all opacity-50 cursor-not-allowed bg-gray-50 text-gray-500"
        >
          Pengaturan Akun (Segera Hadir)
        </button>
      </div>

      <!-- Log Tab Content -->
      <div v-if="activeTab === 'log'" class="pl-2">

        <!-- STATE 1: Loading Skeleton -->
        <div v-if="logLoading" class="space-y-6">
          <div v-for="i in 4" :key="i" class="flex items-start gap-6 animate-pulse">
            <div class="w-4 h-4 rounded-full bg-gray-200 shrink-0 mt-1"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded w-1/3"></div>
            </div>
            <div class="h-6 bg-gray-100 rounded-full w-24 shrink-0"></div>
          </div>
        </div>

        <!-- STATE 2: Error -->
        <div v-else-if="logError" class="flex flex-col items-center justify-center py-14 text-center">
          <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-gray-700 mb-1">Gagal memuat riwayat aktivitas</p>
          <p class="text-xs text-gray-400">Silakan coba lagi nanti.</p>
        </div>

        <!-- STATE 3: Data Ada — Timeline -->
        <div v-else-if="logs.length > 0" class="relative">
          <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-blue-100"></div>
          <div class="space-y-8">
            <div
              v-for="log in logs"
              :key="log.id"
              class="flex items-start gap-6 relative group"
            >
              <div class="relative z-10 shrink-0 mt-1">
                <div
                  class="w-4 h-4 rounded-full border-[3.5px] transition-colors"
                  :class="log.isCurrent ? 'border-[#2A437E] bg-white' : 'border-blue-200 bg-white group-hover:border-blue-400'"
                ></div>
              </div>
              <div class="flex-1 flex flex-col sm:flex-row sm:items-start justify-between">
                <div>
                  <p
                    class="text-[15px] font-bold mb-1"
                    :class="log.isCurrent ? 'text-[#2A437E]' : 'text-gray-800'"
                  >
                    {{ log.title }}
                  </p>
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ log.subtitle }}</p>
                </div>
                <span class="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full mt-3 sm:mt-0 whitespace-nowrap">
                  {{ log.date }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- STATE 4: Empty State (data kosong dari backend) -->
        <div v-else class="flex flex-col items-center justify-center py-14 text-center">
          <div class="w-14 h-14 rounded-2xl bg-[#F0F4FF] flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-[#2A437E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-sm font-bold text-gray-700 mb-1">Belum ada riwayat aktivitas</p>
          <p class="text-xs text-gray-400 max-w-xs leading-relaxed">
            Aktivitas yang Anda lakukan di sistem akan tercatat dan ditampilkan di sini.
          </p>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
