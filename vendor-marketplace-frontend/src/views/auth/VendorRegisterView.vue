<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Input from '../../components/ui/Input.vue'
import Textarea from '../../components/ui/Textarea.vue'
import Button from '../../components/ui/Button.vue'
import { useRegistrationStore } from '../../store/registration.store'

const router = useRouter()
const registrationStore = useRegistrationStore()
const storeName = ref(registrationStore.shopName || '')
const storeDescription = ref(registrationStore.description || '')

function handleSubmit() {
  if (storeName.value && storeDescription.value) {
    registrationStore.setShopInfo({
      shopName: storeName.value,
      description: storeDescription.value
    })
    router.push('/daftar/vendor/upload')
  }
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
            id="storeName"
            v-model="storeName"
            placeholder="Masukin nama toko kamu"
            required
            class="[&>input]:border-brand-navy [&>input]:border-2 [&>input]:py-4 [&>input]:text-base [&>input]:rounded-xl"
          />

          <Textarea
            id="storeDescription"
            v-model="storeDescription"
            placeholder="Deskripsikan tentang toko kamu"
            :rows="6"
            required
            class="[&>textarea]:border-brand-navy [&>textarea]:border-2 [&>textarea]:py-4 [&>textarea]:text-base [&>textarea]:rounded-xl"
          />

          <Button type="submit" variant="primary" fullWidth class="mt-4 py-4 rounded-xl text-lg relative flex items-center justify-center">
            Lanjut
            <span class="absolute right-4 w-8 h-8 bg-white text-brand-navy rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </span>
          </Button>
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
