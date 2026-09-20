<script setup lang="ts">
import { computed } from 'vue'
import { useWallet } from '../../composables/useWallet'

const { merchantProfileQuery } = useWallet()
const { data: store, isLoading } = merchantProfileQuery

const primaryBank = computed(() => {
  if (!store.value?.bankAccounts?.length) return null
  return store.value.bankAccounts.find((b: any) => b.isPrimary) || store.value.bankAccounts[0]
})
</script>

<template>
  <div class="max-w-4xl py-6 font-sans">
    <h1 class="text-[28px] font-bold text-gray-900 mb-8">Profil Toko</h1>

    <div v-if="isLoading" class="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
      Memuat profil toko...
    </div>

    <template v-else-if="store">
      <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-10">
        <div class="h-48 w-full bg-gradient-to-r from-yellow-400 via-green-400 to-purple-600 relative overflow-hidden">
          <img
            v-if="store.bannerUrl"
            :src="store.bannerUrl"
            class="w-full h-full object-cover mix-blend-overlay opacity-60"
            alt="Banner"
          />
        </div>

        <div class="px-8 pb-8 relative">
          <div class="absolute -top-16 left-8 w-32 h-32 rounded-full border-[6px] border-white bg-[#FCE8ED] flex items-center justify-center overflow-hidden shadow-sm">
            <img
              v-if="store.logoUrl"
              :src="store.logoUrl"
              alt="Logo"
              class="w-full h-full object-cover"
            />
            <svg v-else class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>

          <div class="h-20"></div>

          <div class="mb-8">
            <h2 class="text-[26px] font-bold text-gray-900 mb-3">{{ store.shopName }}</h2>
            <span v-if="store.serviceCategory" class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
              {{ store.serviceCategory }}
            </span>
          </div>

          <div class="mb-6">
            <h3 class="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Deskripsi Singkat</h3>
            <p class="text-[15px] text-gray-700 leading-relaxed max-w-3xl">
              {{ store.description || 'Belum ada deskripsi.' }}
            </p>
          </div>

          <div class="w-full h-[1px] bg-gray-100 my-6"></div>

          <div v-if="store.status">
            <h3 class="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Status</h3>
            <p class="text-[15px] font-medium text-gray-900">{{ store.status }}</p>
          </div>
        </div>
      </div>

      <div v-if="primaryBank" class="mb-12">
        <h3 class="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase px-1">Metode Pembayaran</h3>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <h4 class="text-[14px] font-bold text-gray-900 mb-1">{{ primaryBank.bankName }}</h4>
            <p class="text-sm text-gray-500">Rek: {{ primaryBank.accountNumber }}</p>
            <p class="text-xs text-gray-400">a.n. {{ primaryBank.accountHolderName }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Ubah
        </button>
      </div>
    </template>
  </div>
</template>
