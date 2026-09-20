<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserDetail, useUserChatLogs } from '../../composables/useUsers'

const router = useRouter()
const route = useRoute()
const userId = route.params.id as string

const activeTab = ref('log-chat')

const userQuery = useUserDetail(userId)
const chatLogsQuery = useUserChatLogs(userId)

const user = computed(() => userQuery.data.value)
const chatLogs = computed(() => chatLogsQuery.data.value || [])

function goBack() {
  const parentPath = route.path.split('/user-moderation')[0]
  router.push(`${parentPath}/user-moderation`)
}
</script>


<template>
  <div class="space-y-6 animate-fade-in w-full pb-10 max-w-[900px] mx-auto">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <button @click="goBack" class="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-800 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
      </button>
    </div>

    <!-- User Profile Card -->
    <div class="bg-white rounded-[20px] shadow-sm border border-gray-150 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div v-if="!user" class="text-sm text-gray-400">Memuat data pengguna...</div>
      <template v-else>
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-50 bg-white">
            <img :src="user.avatar || `https://i.pravatar.cc/150?u=${user.id}`" alt="Avatar" class="w-full h-full object-cover" />
          </div>
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h2 class="text-xl font-extrabold text-gray-900">{{ user.fullName || user.name }}</h2>
              <span class="px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-600 bg-white shadow-sm">#{{ user.id }}</span>
            </div>
          </div>
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold shadow-sm">
          <span class="w-2 h-2 rounded-full" :class="user.status === 'ACTIVE' || user.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'"></span>
          <span class="text-gray-700">{{ user.status }}</span>
        </div>
      </template>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 flex gap-8 px-2">
      <button 
        @click="activeTab = 'log-chat'"
        class="pb-4 text-sm font-bold transition-colors relative"
        :class="activeTab === 'log-chat' ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-gray-700'"
      >
        Log Chat
        <div v-if="activeTab === 'log-chat'" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#1E3A8A] rounded-t-full"></div>
      </button>
      <button 
        @click="activeTab = 'riwayat-postingan'"
        class="pb-4 text-sm font-bold transition-colors relative"
        :class="activeTab === 'riwayat-postingan' ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-gray-700'"
      >
        Riwayat Postingan
        <div v-if="activeTab === 'riwayat-postingan'" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#1E3A8A] rounded-t-full"></div>
      </button>
    </div>

    <!-- Tab Content: Log Chat -->
    <div v-if="activeTab === 'log-chat'" class="space-y-4 pt-2">
      <div v-for="log in chatLogs" :key="log.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-default">
        <img :src="log.senderAvatar || user?.avatar || `https://i.pravatar.cc/150?u=${userId}`" alt="Avatar" class="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" />
        <div class="flex-1 pt-2">
          <div class="text-xs font-bold text-gray-400 mb-1">{{ log.senderName }}</div>
          <p class="text-gray-800 font-bold text-[15px]">{{ log.message || log.content }}</p>
        </div>
        <div class="text-sm font-medium text-gray-400 pt-2 shrink-0">
          {{ log.time || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-') }}
        </div>
      </div>
    </div>

    <!-- Tab Content: Riwayat Postingan -->
    <div v-if="activeTab === 'riwayat-postingan'" class="pt-8 flex flex-col items-center justify-center text-gray-400 gap-4">
      <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      <p class="font-medium">Belum ada riwayat postingan yang dilaporkan.</p>
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
