<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const { user } = useAuth()
const sidebarCollapsed = ref(false)

const menuItems = [
  {
    name: 'Beranda',
    path: '/super-admin/dashboard',
    icon: 'home',
  },
  {
    name: 'Manajemen Admin',
    path: '/super-admin/user-management',
    icon: 'users',
  },
  {
    name: 'Moderasi User',
    path: '/super-admin/user-moderation',
    icon: 'shield',
  },
  {
    name: 'Konfigurasi Sistem',
    path: '/super-admin/system-config',
    icon: 'config',
  },
  {
    name: 'Intervensi & Banding',
    path: '/super-admin/disputes',
    icon: 'alert',
  },
]

const currentPath = computed(() => route.path)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
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
        <nav class="space-y-2 px-3 w-full">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 group w-full',
              currentPath.startsWith(item.path)
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
              <svg v-else-if="item.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else-if="item.icon === 'shield'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <svg v-else-if="item.icon === 'config'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-else-if="item.icon === 'alert'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div
              class="w-full text-body-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 flex-1"
              :class="sidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'"
            >
              {{ item.name }}
            </div>
          </router-link>
        </nav>
      </div>
      <div class="mt-8 flex flex-col gap-6 w-full items-center">
        <router-link
          to="/super-admin/profile"
          class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md bg-white border border-gray-100 hover:shadow-lg transition-shadow"
          :class="!sidebarCollapsed && 'px-4 w-full justify-start gap-4 rounded-xl'"
        >
          <img :src="user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'SA'}&background=1E3A8A&color=fff`" alt="User Profile" class="w-full h-full object-cover" v-if="sidebarCollapsed" />
          <img :src="user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'SA'}&background=1E3A8A&color=fff`" alt="User Profile" class="w-8 h-8 rounded-full object-cover" v-if="!sidebarCollapsed" />
          <span v-if="!sidebarCollapsed" class="font-semibold text-sm">{{ user?.fullName || 'Super Admin' }}</span>
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
</style>
