<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useIncomingOrders } from '../../composables/useOrders'

const router = useRouter()
const { data: orders, isLoading } = useIncomingOrders()

const statusFilter = ref<string>('ALL')
const showFilterDropdown = ref(false)

const filteredOrders = computed(() => {
  if (!orders.value) return []
  const activeOrders = orders.value.filter((o: any) => o.status !== 'UNPAID' && o.status !== 'CANCELLED')
  if (statusFilter.value === 'ALL') return activeOrders
  return activeOrders.filter((o: any) => o.status === statusFilter.value)
})

const statusOptions = [
  { key: 'ALL', label: 'Semua Status' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'IN_REVISION', label: 'In Revision' },
  { key: 'DISPUTE_IN_PROGRESS', label: 'Dispute in Progress' },
  { key: 'COMPLETED', label: 'Completed' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'DISPUTE_IN_PROGRESS': return { label: 'Dispute', cls: 'text-[#E05236] bg-[#FDEDE9] border-[#FADCD5]' }
    case 'IN_REVISION': return { label: 'Revisi', cls: 'text-[#C81E1E] bg-[#FDF2F2] border-[#FBD5D5]' }
    case 'IN_PROGRESS': return { label: 'Aktif', cls: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]' }
    case 'DELIVERED': return { label: 'Terkirim', cls: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]' }
    case 'COMPLETED': return { label: 'Selesai', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    default: return { label: status, cls: 'text-gray-500 bg-gray-50 border-gray-100' }
  }
}

function selectFilter(key: string) {
  statusFilter.value = key
  showFilterDropdown.value = false
}

function goToDetail(orderId: number) {
  router.push(`/vendor/orders/${orderId}`)
}
</script>

<template>
  <div class="py-6 px-4 max-w-5xl">
    <!-- Header -->
    <h1 class="text-[28px] font-bold text-gray-900 mb-8">Operasional Order</h1>

    <!-- Filter -->
    <div class="flex justify-end mb-6 relative">
      <button
        @click="showFilterDropdown = !showFilterDropdown"
        class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors shadow-sm"
      >
        {{ statusOptions.find(o => o.key === statusFilter)?.label }}
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div
          v-if="showFilterDropdown"
          class="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 min-w-[180px]"
        >
          <button
            v-for="opt in statusOptions"
            :key="opt.key"
            @click="selectFilter(opt.key)"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
            :class="statusFilter === opt.key ? 'font-bold text-indigo-900' : 'text-gray-600'"
          >
            {{ opt.label }}
            <svg v-if="statusFilter === opt.key" class="w-4 h-4 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center bg-white rounded-2xl border border-gray-100">
      <p class="text-gray-500 text-sm">Memuat data pesanan masuk...</p>
    </div>

    <!-- Order Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer group"
        @click="goToDetail(order.id)"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-gray-900 group-hover:text-indigo-950 transition-colors">{{ order.gig?.title || 'Custom Order' }}</h3>
            <p class="text-xs text-gray-500 font-medium mt-1">Pembeli: {{ order.client?.fullName || 'Unknown' }}</p>
            <p class="text-xs text-gray-400 font-semibold mt-1">#ORD-{{ order.id }}</p>
          </div>
          <span
            class="px-3 py-1 text-xs font-bold rounded-full border"
            :class="getStatusBadge(order.status).cls"
          >
            {{ getStatusBadge(order.status).label }}
          </span>
        </div>

        <button
          class="px-5 py-2 bg-indigo-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-850 transition-colors shadow-sm"
          @click.stop="goToDetail(order.id)"
        >
          Proses
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="text-center py-20">
        <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        <p class="text-gray-400 font-medium">Tidak ada pesanan dengan status ini</p>
      </div>
    </div>
  </div>

  <!-- Click-away overlay -->
  <div v-if="showFilterDropdown" class="fixed inset-0 z-10" @click="showFilterDropdown = false"></div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
