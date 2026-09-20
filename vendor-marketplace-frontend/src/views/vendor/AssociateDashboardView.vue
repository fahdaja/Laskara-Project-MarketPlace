<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useIncomingOrders } from '../../composables/useOrders'
import { useNotifications } from '../../composables/useNotifications'

const { profileQuery } = useAuth()
const { data: incomingOrders } = useIncomingOrders()
const { data: notifications } = useNotifications()

const merchant = computed(() => profileQuery.data.value?.merchant)

const stats = computed(() => [
  {
    label: 'Rata-rata Penilaian',
    value: merchant.value?.avgRating?.toFixed(1) || '0.0',
    total: '/5.0',
    info: `Berdasarkan ${merchant.value?.totalReviews || 0} ulasan`,
    icon: 'star',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-400'
  },
  {
    label: 'Ketetapan Waktu Pelayanan',
    value: '100%',
    info: 'N/A',
    icon: 'clock',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-400'
  },
  {
    label: 'Pesanan Aktif',
    value: incomingOrders.value?.filter((o: any) => o.status !== 'UNPAID' && o.status !== 'CANCELLED').length || 0,
    icon: 'briefcase',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-400'
  }
])

const tasks = computed(() => {
  return incomingOrders.value
    ?.filter((o: any) => o.status !== 'UNPAID' && o.status !== 'CANCELLED')
    .map((o: any) => ({
      id: `#ORD-${o.id}`,
      customer: o.client?.fullName || 'Pembeli',
      status: o.status
    })) || []
})

const unreadCount = computed(() => notifications.value?.filter((n: any) => !n.isRead).length || 0)
</script>

<template>
  <div class="py-6 px-4 space-y-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4"
      >
        <div class="flex justify-between items-start">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor]">
            <svg v-if="stat.icon === 'star'" class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg v-if="stat.icon === 'clock'" class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <svg v-if="stat.icon === 'briefcase'" class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <span v-if="stat.info" class="text-[10px] font-bold" :class="stat.info.includes('+') ? 'text-green-500' : 'text-gray-400'">
            {{ stat.info }}
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-bold text-gray-900">{{ stat.value }}</span>
            <span v-if="stat.total" class="text-sm font-bold text-gray-400">{{ stat.total }}</span>
          </div>
          <p class="text-xs font-bold text-gray-400 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Tasks Table Card -->
    <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 flex justify-between items-center">
        <h2 class="text-lg font-bold text-[#1E3A8A]">Daftar Tugas</h2>
        <router-link to="/vendor/orders" class="text-sm font-bold text-[#4B6BFB] hover:underline flex items-center gap-1">
          Lihat Daftar
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </router-link>
      </div>
      
      <div class="px-8 pb-8">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th class="py-4">Order ID</th>
              <th class="py-4">Customer</th>
              <th class="py-4">Status</th>
              <th class="py-4 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="task in tasks" :key="task.id" class="group">
              <td class="py-6 text-sm font-bold text-[#4B6BFB]">{{ task.id }}</td>
              <td class="py-6 text-sm font-bold text-gray-900">{{ task.customer }}</td>
              <td class="py-6">
                <span class="px-4 py-1.5 bg-[#E6F0FF] text-[#4B6BFB] text-[10px] font-bold rounded-full">
                  {{ task.status }}
                </span>
              </td>
              <td class="py-6 text-right">
                <button class="bg-[#2F4DC4] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-[#1E3A8A] transition-all shadow-sm">
                  Update
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom Section: Unread Messages -->
    <div class="max-w-[400px]">
      <div class="bg-[#F8F9FE] rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-base font-bold text-[#1E3A8A]">Pesan Belum Dibaca</h2>
          <span v-if="unreadCount > 0" class="px-3 py-1 bg-[#2F4DC4] text-white text-[10px] font-bold rounded-full uppercase tracking-tighter">
            {{ unreadCount }} Baru
          </span>
        </div>

        <div v-if="notifications?.length === 0" class="text-center text-gray-400 text-sm py-4">
          Tidak ada notifikasi.
        </div>
        <div v-for="msg in notifications?.slice(0, 3)" :key="msg.id" class="bg-white rounded-2xl p-5 border border-gray-50 shadow-sm relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <h4 class="text-sm font-bold text-gray-900">Sistem</h4>
          </div>
          <p class="text-xs text-gray-500 line-clamp-1 leading-relaxed">
            {{ msg.message }}
          </p>
        </div>

        <router-link 
          to="/vendor/messages"
          class="w-full bg-[#2F4DC4] text-white py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1E3A8A] transition-all shadow-lg"
        >
          Lihat semua pesan
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </router-link>
      </div>
    </div>
  </div>
</template>
