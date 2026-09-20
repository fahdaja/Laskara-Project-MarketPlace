<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Input from '../../components/ui/Input.vue'
import Button from '../../components/ui/Button.vue'
import { useRegistrationStore } from '../../store/registration.store'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const registrationStore = useRegistrationStore()
const { registerMerchantMutation } = useAuth()

const bankName = ref(registrationStore.bankName || '')
const accountNumber = ref(registrationStore.accountNumber || '')
const accountHolderName = ref(registrationStore.accountHolderName || '')

const isPending = computed(() => registerMerchantMutation.isPending.value)

function goBack() {
  router.push('/daftar/vendor/upload')
}

function handleSubmit() {
  registrationStore.setBankInfo({
    bankName: bankName.value,
    accountNumber: accountNumber.value,
    accountHolderName: accountHolderName.value
  })

  // THE ONE TRIGGER
  registerMerchantMutation.mutate({
    email: registrationStore.email,
    password: registrationStore.password,
    fullName: registrationStore.username,
    shopName: registrationStore.shopName,
    description: registrationStore.description,
    logoUrl: registrationStore.logoUrl || 'https://placehold.co/200x200?text=Logo',
    bannerUrl: registrationStore.bannerUrl || 'https://placehold.co/1200x400?text=Banner',
    bankName: registrationStore.bankName,
    accountNumber: registrationStore.accountNumber,
    accountHolderName: registrationStore.accountHolderName
  }, {
    onSuccess: () => {
      registrationStore.reset()
      router.push('/daftar/vendor/success')
    }
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
    <div class="w-full max-w-6xl flex flex-col md:flex-row items-center gap-12 lg:gap-24">
      <div class="w-full md:w-1/2 flex flex-col justify-center">
        <div class="mb-10">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Isi-Isi Dulu Yuk !</h1>
          <p class="text-gray-600 text-lg">Sekarang, kamu daftar sebagai <span class="font-bold text-brand-navy">Vendor</span></p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          <Input
            id="bankName"
            label="Nama Bank"
            v-model="bankName"
            placeholder="Masukin Nama Bank Kamu"
            required
            class="[&>input]:border-brand-navy [&>input]:border-2 [&>input]:py-4 [&>input]:text-base [&>input]:rounded-xl [&>label]:text-xl [&>label]:font-normal [&>label]:text-gray-600 [&>label]:mb-1"
          />

          <div>
            <Input
              id="accountNumber"
              label="Nomor Rekening"
              v-model="accountNumber"
              placeholder="Masukin Nomor Rekening Kamu"
              required
              class="[&>input]:border-brand-navy [&>input]:border-2 [&>input]:py-4 [&>input]:text-base [&>input]:rounded-xl [&>label]:text-xl [&>label]:font-normal [&>label]:text-gray-600 [&>label]:mb-1"
            />
            <p class="text-right text-danger text-sm mt-1.5">*dicek kembali ya, bisi salah</p>
            <p v-if="registerMerchantMutation.isError.value" class="text-center text-danger text-sm mt-4">
              {{ (registerMerchantMutation.error.value as any)?.response?.data?.message || 'Terjadi kesalahan saat pendaftaran.' }}
            </p>
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
            
            <Button 
              type="submit" 
              variant="primary" 
              class="flex-1 h-14 rounded-xl text-lg relative flex items-center justify-center"
              :disabled="isPending"
            >
              <svg v-if="isPending" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isPending ? 'Mendaftarkan...' : 'Selesai' }}
              <span v-if="!isPending" class="absolute right-4 w-8 h-8 bg-white text-brand-navy rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </span>
            </Button>
          </div>
        </form>
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
