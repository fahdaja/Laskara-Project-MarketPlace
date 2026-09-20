<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const { user } = useAuth()
const sidebarCollapsed = ref(false)
const paymentSubmenuOpen = ref(false)

const menuItems = [
  {
    name: 'Beranda',
    path: '/finance-admin/dashboard',
    icon: 'home',
  },
  {
    name: 'Pembayaran',
    icon: 'payment',
    hasSubmenu: true,
    children: [
      { name: 'Verifikasi Pembayaran', path: '/finance-admin/payment-verification' },
      { name: 'Riwayat Pembayaran', path: '/finance-admin/payment-history' },
    ],
  },
  {
    name: 'Pencairan Dana',
    path: '/finance-admin/disbursement',
    icon: 'disbursement',
  },
  {
    name: 'Pengembalian Dana',
    path: '/finance-admin/refund',
    icon: 'refund',
  },
  {
    name: 'Laporan & Dividen',
    path: '/finance-admin/reports',
    icon: 'report',
  },
  {
    name: 'Rekap Merchant',
    path: '/finance-admin/merchant-recap',
    icon: 'merchant',
  },
]

const currentPath = computed(() => route.path)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function togglePaymentSubmenu() {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
    paymentSubmenuOpen.value = true
  } else {
    paymentSubmenuOpen.value = !paymentSubmenuOpen.value
  }
}

function isPaymentActive() {
  const paymentPaths = ['/finance-admin/payment-verification', '/finance-admin/payment-history']
  return paymentPaths.includes(currentPath.value)
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F7F7] flex p-6 gap-6 font-sans text-gray-800">
    <aside
      :class="[
        'sticky top-6 self-start transition-all duration-300 z-40 flex flex-col',
        sidebarCollapsed ? 'w-[72px]' : 'w-64',
      ]"
    >
      <div class="bg-[#1E3A8A] text-white rounded-[32px] flex flex-col shadow-lg py-6 overflow-hidden">
        <nav class="space-y-1 px-3 w-full">
          <template v-for="item in menuItems" :key="item.name">
            <template v-if="item.hasSubmenu">
              <button
                @click="togglePaymentSubmenu"
                :class="[
                  'flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group w-full text-left',
                  isPaymentActive() || paymentSubmenuOpen
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                  sidebarCollapsed ? 'justify-center' : 'justify-start'
                ]"
                :title="sidebarCollapsed ? item.name : ''"
              >
                <div class="w-6 h-6 shrink-0 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div
                  class="flex-1 text-body-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300"
                  :class="sidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'"
                >
                  {{ item.name }}
                </div>
                <svg
                  v-if="!sidebarCollapsed"
                  class="w-4 h-4 transition-transform duration-200 shrink-0"
                  :class="paymentSubmenuOpen ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition name="submenu">
                <div v-if="paymentSubmenuOpen && !sidebarCollapsed" class="ml-5 pl-4 border-l border-white/20 space-y-1 mt-1">
                  <router-link
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    :class="[
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-body-sm',
                      currentPath === child.path
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/50 hover:bg-white/5 hover:text-white',
                    ]"
                  >
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ child.name }}
                  </router-link>
                </div>
              </Transition>
            </template>

            <template v-else>
              <router-link
                :to="item.path!"
                :class="[
                  'flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group w-full',
                  currentPath.startsWith(item.path!)
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                  sidebarCollapsed ? 'justify-center' : 'justify-start'
                ]"
                :title="sidebarCollapsed ? item.name : ''"
              >
                <div class="w-6 h-6 shrink-0 flex items-center justify-center">
                  <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <svg v-else-if="item.icon === 'disbursement'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <svg v-else-if="item.icon === 'refund'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <svg v-else-if="item.icon === 'report'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg v-else-if="item.icon === 'merchant'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h18l-2 13H5L3 3zm0 0l-1-1m4 15a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM5 6h14" />
                  </svg>
                </div>
                <div
                  class="w-full text-body-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 flex-1"
                  :class="sidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'"
                >
                  {{ item.name }}
                </div>
              </router-link>
            </template>
          </template>
        </nav>
      </div>
      <div class="mt-8 flex flex-col gap-6 w-full items-center">
        <router-link
          to="/finance-admin/profile"
          class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md bg-white border border-gray-100 hover:shadow-lg transition-shadow"
          :class="!sidebarCollapsed && 'px-4 w-full justify-start gap-4 rounded-xl'"
        >
          <img :src="user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'FA'}&background=1E3A8A&color=fff`" alt="User Profile" class="w-full h-full object-cover" v-if="sidebarCollapsed" />
          <img :src="user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'FA'}&background=1E3A8A&color=fff`" alt="User Profile" class="w-8 h-8 rounded-full object-cover" v-if="!sidebarCollapsed" />
          <span v-if="!sidebarCollapsed" class="font-semibold text-sm text-gray-800">{{ user?.fullName || 'Admin Finance' }}</span>
        </router-link>
        <button class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors" @click="toggleSidebar">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>
    <div class="flex-1 w-full max-w-[1240px] mx-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.submenu-enter-active { transition: all 0.25s ease-out; }
.submenu-leave-active { transition: all 0.2s ease-in; }
.submenu-enter-from, .submenu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-4px);
}
.submenu-enter-to, .submenu-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}
</style>
