<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { adminLoginMutation, logout } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loginError = ref(false)

function handleLogin() {
  loginError.value = false
  
  adminLoginMutation.mutate({
    email: email.value,
    password: password.value,
  }, {
    onSuccess: (res) => {
      const user = res.data?.user
      if (user) {
        const role = user.role.toUpperCase()
        if (!role.includes('ADMIN') && role !== 'SUPER_ADMIN') {
          logout()
          loginError.value = true
        }
      }
    }
  })
}
</script>

<template>
  <div class="login-bg min-h-screen w-full flex font-sans overflow-hidden">
    <div class="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">
      <div class="w-full max-w-[400px] mx-auto lg:mx-0">
        <h1 class="text-4xl font-extrabold text-[#2D333A] mb-12">Login Admin</h1>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <input 
              v-model="email" 
              type="email" 
              required
              placeholder="Masukkan alamat email admin" 
              class="w-full px-5 py-3.5 rounded-[14px] border border-gray-200 text-sm font-medium placeholder-gray-300 focus:outline-none focus:border-[#5FA3FB] focus:ring-1 focus:ring-[#5FA3FB] transition-colors"
            />
          </div>
          <div>
            <div class="relative">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="Masukkan kata sandi" 
                class="w-full px-5 py-3.5 rounded-[14px] border border-gray-200 text-sm font-medium placeholder-gray-300 focus:outline-none focus:border-[#5FA3FB] focus:ring-1 focus:ring-[#5FA3FB] transition-colors pr-12"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-black focus:outline-none"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
            <div class="flex justify-end mt-3">
              <a href="#" class="text-[13px] font-bold text-[#5FA3FB] hover:text-blue-500 transition-colors">Lupa Password</a>
            </div>
          </div>
          <button 
            type="submit" 
            :disabled="adminLoginMutation.isPending.value"
            class="w-full bg-[#5FA3FB] hover:bg-blue-500 text-white font-bold py-4 rounded-[14px] transition-colors mt-2 text-sm tracking-wide flex justify-center items-center gap-2"
          >
            <svg v-if="adminLoginMutation.isPending.value" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="adminLoginMutation.isPending.value">Memproses...</span>
            <span v-else>Masuk</span>
          </button>
          <p v-if="loginError || adminLoginMutation.isError.value" class="text-red-500 text-sm font-medium text-center mt-3">
            {{ loginError ? 'Akses ditolak. Area khusus Admin.' : ((adminLoginMutation.error.value as any)?.response?.data?.message || 'Username atau kata sandi salah.') }}
          </p>
        </form>
      </div>
    </div>
    <div class="hidden lg:flex lg:w-[55%] relative items-center justify-end pl-10 pr-4">
      <img src="/img/login.png" alt="Login Illustration" class="w-full h-full object-contain object-right" />
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  background:
    linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(78,165,252,0.15) 85%, rgba(78,165,252,0.35) 100%),
    linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(78,165,252,0.08) 70%, rgba(78,165,252,0.2) 100%);
}
</style>
