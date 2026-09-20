<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppeals } from '../../composables/useAppeals'
import api from '../../api/axios'

const router = useRouter()
const route = useRoute()
const orderId = Number(route.params.id)
const order = ref<any>(null)
const isLoading = ref(true)
const errorMsg = ref('')
const appealReason = ref('')

const { createAppealMutation } = useAppeals()

async function loadOrder() {
  try {
    isLoading.value = true
    const res = await api.get('/orders/incoming')
    const found = res.data.find((o: any) => o.id === orderId)
    if (found) {
      order.value = found
    } else {
      errorMsg.value = 'Pesanan tidak ditemukan.'
    }
  } catch (err) {
    errorMsg.value = 'Gagal memuat data pesanan.'
  } finally {
    isLoading.value = false
  }
}

async function submitAppeal() {
  if (!appealReason.value.trim()) return
  try {
    await createAppealMutation.mutateAsync({
      orderId,
      reason: appealReason.value
    })
    router.push('/vendor/orders')
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal mengajukan banding.'
  }
}

function goBack() {
  router.push(`/vendor/orders/${orderId}`)
}

loadOrder()
</script>

<template>
  <div class="py-8 px-4 max-w-3xl mx-auto font-sans animate-fade-in">
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <button @click="goBack" class="hover:text-gray-900 transition-colors p-1 -ml-1">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>
      <span>Pesanan</span>
      <span class="mx-1">&rsaquo;</span>
      <span class="font-bold text-gray-900">#{{ orderId }}</span>
      <span class="mx-1">&rsaquo;</span>
      <span class="text-gray-900">Ajukan Banding</span>
    </div>

    <div v-if="isLoading" class="p-12 text-center text-gray-500">
      Memuat data pesanan...
    </div>

    <div v-else-if="errorMsg && !order" class="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
      {{ errorMsg }}
    </div>

    <div v-else-if="order" class="space-y-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold text-gray-900">
          Ajukan Banding
        </h1>
        <span class="px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-full uppercase tracking-wider">
          {{ order.status }}
        </span>
      </div>

      <div class="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">GIG / LAYANAN</span>
          <span class="text-sm font-bold text-gray-800">{{ order.gig?.title || 'Pesanan Langsung' }}</span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">KLIEN</span>
          <span class="text-sm font-medium text-gray-800">{{ order.client?.fullName }}</span>
        </div>

        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">TOTAL PESANAN</span>
          <span class="text-base font-bold text-[#1E3A8A]">Rp {{ Number(order.totalAmount).toLocaleString() }}</span>
        </div>
      </div>

      <form @submit.prevent="submitAppeal" class="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Alasan Pengajuan Banding</label>
          <textarea
            v-model="appealReason"
            required
            rows="6"
            placeholder="Jelaskan secara detail argumen dan bukti mengapa keputusan sengketa tidak adil..."
            class="block w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
          ></textarea>
        </div>

        <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {{ errorMsg }}
        </div>

        <div class="flex justify-end gap-4">
          <button
            type="button"
            @click="goBack"
            class="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="createAppealMutation.isPending.value || !appealReason.trim()"
            class="px-8 py-3 bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            {{ createAppealMutation.isPending.value ? 'Mengirim...' : 'Kirim Banding' }}
          </button>
        </div>
      </form>
    </div>
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

