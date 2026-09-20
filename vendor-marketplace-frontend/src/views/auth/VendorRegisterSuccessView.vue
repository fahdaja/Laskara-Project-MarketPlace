<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../../components/ui/Button.vue'

const router = useRouter()

function goBack() {
  router.push('/daftar/vendor/bank')
}

function handleGoHome() {
  router.push('/vendor/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
    <div class="w-full max-w-6xl flex flex-col md:flex-row items-center gap-12 lg:gap-24">
      <div class="w-full md:w-1/2 flex flex-col justify-center">
        <div class="mb-10">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Selesai !</h1>
          <p class="text-gray-600 text-lg">Masuk ke beranda untuk proses verifikasi dokumen</p>
        </div>

        <div class="flex items-center gap-4 mt-6">
          <button 
            type="button" 
            @click="goBack"
            class="w-14 h-14 shrink-0 flex items-center justify-center bg-white border-2 border-brand-navy rounded-xl text-brand-navy hover:bg-gray-50 transition-colors"
          >
            <span class="w-8 h-8 bg-brand-navy text-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>
          
          <Button @click="handleGoHome" variant="primary" class="flex-1 h-14 rounded-xl text-lg relative flex items-center justify-center">
            Beranda
            <span class="absolute right-4 w-8 h-8 bg-white text-brand-navy rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </span>
          </Button>
        </div>
      </div>

      <div class="hidden md:flex w-full md:w-1/2 justify-center items-center">
        <img 
          src="/images/vendors/auth/shop.png" 
          alt="Vendor Store Illustration" 
          class="w-full max-w-lg object-contain" 
        />
      </div>
    </div>
  </div>
</template>
