<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user: authUser, logout, uploadFile, updateProfileMutation } = useAuth()

const fileInput = ref<HTMLInputElement | null>(null)

const user = computed(() => ({
  name: authUser.value?.fullName || 'Admin User',
  email: authUser.value?.email || 'N/A',
  role: authUser.value?.role || 'ADMIN_VALIDATOR',
  department: 'Moderation & Verification',
}))

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

function handleLogout() {
  logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="space-y-8 animate-fade-in w-full pb-10">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Profil Pengguna</h1>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-start">
      <!-- Avatar with Hover Edit Overlay -->
      <div 
        @click="triggerFileInput"
        class="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-gray-50 bg-gray-100 flex items-center justify-center shadow-sm"
      >
        <img v-if="authUser?.avatarUrl" :src="authUser.avatarUrl" alt="User Profile" class="w-full h-full object-cover" />
        <img v-else-if="authUser" :src="`https://ui-avatars.com/api/?name=${user.name}&background=1E3A8A&color=fff`" alt="User Profile" class="w-full h-full object-cover" />
        <svg v-else class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
      </div>
      
      <!-- Hidden file input -->
      <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
      
      <div class="flex-1 w-full space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="text-sm font-semibold text-gray-500">Nama Lengkap</label>
            <p class="text-gray-900 font-bold text-lg">{{ user.name }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-gray-500">Alamat Email</label>
            <p class="text-gray-900 font-medium">{{ user.email }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-gray-500">Peran Sistem</label>
            <div>
              <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                {{ user.role }}
              </div>
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold text-gray-500">Departemen</label>
            <p class="text-gray-900 font-medium">{{ user.department }}</p>
          </div>
        </div>
        
        <div class="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div class="flex gap-4">
            <button @click="triggerFileInput" class="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm shadow-sm">
              Edit Profil
            </button>
            <button class="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors text-sm shadow-sm">
              Ubah Password
            </button>
          </div>
          <button @click="handleLogout" class="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2.5 px-6 rounded-xl transition-colors text-sm shadow-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
