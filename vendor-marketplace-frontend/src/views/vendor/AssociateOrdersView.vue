<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomingOrders } from '../../composables/useOrders'

const { data: incomingOrders } = useIncomingOrders()

const orders = computed(() => {
  return incomingOrders.value
    ?.filter((o: any) => o.status !== 'UNPAID' && o.status !== 'CANCELLED')
    .map((o: any) => ({
      id: o.id,
      client: o.client?.fullName || 'Pembeli',
      orderNo: `#ORD-${o.id}`,
      status: o.status === 'PAID_PENDING_CONFIRMATION' ? 'Baru' : o.status,
      statusColor: o.status === 'PAID_PENDING_CONFIRMATION' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
    })) || []
})

const filterOpen = ref(false)
const selectedFilter = ref('Semua Status')
</script>

<template>
  <div class="p-8 space-y-8 bg-[#FAF9F9] min-h-screen">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Operasional Order</h1>
      
      <!-- Filter Dropdown -->
      <div class="relative">
        <button 
          @click="filterOpen = !filterOpen"
          class="bg-white px-6 py-2.5 rounded-full border border-gray-200 text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all"
        >
          {{ selectedFilter }}
          <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': filterOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        
        <div v-if="filterOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-50 z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <button @click="selectedFilter = 'Semua Status'; filterOpen = false" class="w-full text-left px-6 py-3 text-sm hover:bg-gray-50 transition-colors">Semua Status</button>
          <button @click="selectedFilter = 'Baru'; filterOpen = false" class="w-full text-left px-6 py-3 text-sm hover:bg-gray-50 transition-colors">Baru</button>
          <button @click="selectedFilter = 'Proses'; filterOpen = false" class="w-full text-left px-6 py-3 text-sm hover:bg-gray-50 transition-colors">Proses</button>
          <button @click="selectedFilter = 'Selesai'; filterOpen = false" class="w-full text-left px-6 py-3 text-sm hover:bg-gray-50 transition-colors">Selesai</button>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex justify-between items-start hover:shadow-md transition-all duration-300 group"
      >
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">{{ order.client }}</h3>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">{{ order.orderNo }}</p>
          </div>
          
          <router-link 
            :to="`/vendor/associate/orders/${order.id}`"
            class="bg-[#1E3A8A] text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-[#0A1D56] transition-all shadow-lg shadow-[#1E3A8A]/20"
          >
            Proses
          </router-link>
        </div>

        <span 
          :class="['px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider', order.statusColor]"
        >
          {{ order.status }}
        </span>
      </div>
    </div>
  </div>
</template>
