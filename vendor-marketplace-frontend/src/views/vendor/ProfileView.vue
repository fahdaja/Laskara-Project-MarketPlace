<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'
import { useWallet } from '../../composables/useWallet'
import Toast from '../../components/ui/Toast.vue'

const router = useRouter()
const authStore = useAuthStore()
const { merchantProfileQuery, updatePinMutation } = useWallet()

const newPin = ref('')
const pinConfirm = ref('')
const pinError = ref('')
const pinSuccess = ref(false)
const showToast = ref(false)

const user = computed(() => authStore.currentUser)
const merchant = computed(() => merchantProfileQuery.data.value)

const hasPin = computed(() => {
  return !!merchant.value?.withdrawalPin
})

const handleLogout = () => {
  authStore.logout()
  router.push('/masuk')
}

const handleUpdatePin = async () => {
  pinError.value = ''
  pinSuccess.value = false

  if (!newPin.value || newPin.value.length !== 6 || !/^\d+$/.test(newPin.value)) {
    pinError.value = 'PIN harus berupa 6 digit angka.'
    return
  }

  if (newPin.value !== pinConfirm.value) {
    pinError.value = 'Konfirmasi PIN tidak cocok.'
    return
  }

  if (!merchant.value?.id) {
    pinError.value = 'Data merchant tidak ditemukan.'
    return
  }

  try {
    await updatePinMutation.mutateAsync({
      id: merchant.value.id,
      withdrawalPin: newPin.value
    })
    pinSuccess.value = true
    newPin.value = ''
    pinConfirm.value = ''
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } catch (err: any) {
    pinError.value = err.response?.data?.message || 'Gagal memperbarui PIN.'
  }
}
</script>

<template>
  <div class="profile-view p-8 font-sans animate-fade-in max-w-4xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Profil & Pengaturan</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola data profil pengguna dan keamanan toko Anda.</p>
      </div>
      <button @click="handleLogout" class="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <h2 class="text-lg font-bold text-gray-900">Informasi Pengguna</h2>
          
          <div class="flex flex-col sm:flex-row gap-6 items-center border-b border-gray-50 pb-6">
            <div class="w-20 h-20 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ user?.fullName || user?.name }}</h3>
              <p class="text-sm text-gray-400 mt-0.5">{{ user?.email }}</p>
              <span class="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                {{ user?.role }}
              </span>
            </div>
          </div>

          <div v-if="merchant" class="space-y-4">
            <h3 class="font-bold text-gray-900 text-sm">Informasi Toko</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nama Toko</span>
                <span class="text-sm font-bold text-gray-800 mt-1 block">{{ merchant.shopName }}</span>
              </div>
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status Verifikasi</span>
                <span class="text-sm font-bold mt-1 block text-green-600">{{ merchant.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Safety PIN</h2>
            <p class="text-xs text-gray-400 mt-1">Dibutuhkan untuk keamanan penarikan dana.</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full" :class="hasPin ? 'bg-green-500' : 'bg-red-500'"></span>
            <span class="text-xs font-bold" :class="hasPin ? 'text-green-600' : 'text-red-600'">
              {{ hasPin ? 'Safety PIN Aktif' : 'Safety PIN Belum Diatur' }}
            </span>
          </div>

          <form @submit.prevent="handleUpdatePin" class="space-y-4 pt-2 border-t border-gray-50">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">PIN Baru (6 Digit)</label>
              <input
                v-model="newPin"
                type="password"
                maxlength="6"
                placeholder="******"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 font-bold text-center tracking-widest text-lg transition-all"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">Konfirmasi PIN</label>
              <input
                v-model="pinConfirm"
                type="password"
                maxlength="6"
                placeholder="******"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 font-bold text-center tracking-widest text-lg transition-all"
              />
            </div>

            <div v-if="pinError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {{ pinError }}
            </div>

            <button
              type="submit"
              :disabled="updatePinMutation.isPending.value || !newPin || !pinConfirm"
              class="w-full bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm"
            >
              {{ updatePinMutation.isPending.value ? 'Menyimpan...' : (hasPin ? 'Perbarui PIN' : 'Simpan PIN') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showToast" class="fixed top-8 right-8 z-[300] animate-fade-in">
        <Toast
          type="success"
          title="Berhasil!"
          subtitle="Safety PIN berhasil diperbarui."
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
