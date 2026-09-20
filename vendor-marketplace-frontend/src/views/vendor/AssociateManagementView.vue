<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssociates } from '../../composables/useAssociates'
import { useAuthStore } from '../../store/auth.store'

const { associatesQuery, addAssociateMutation } = useAssociates()
const authStore = useAuthStore()
const isInviteModalOpen = ref(false)

const isOwner = computed(() => authStore.currentUser?.role === 'MERCHANT_OWNER')

const associates = computed(() => {
  return associatesQuery.data.value?.map((a: any) => ({
    id: a.id,
    name: a.user?.fullName || 'User',
    email: a.user?.email || '-',
    status: 'Active',
    role: a.permission,
    joinedDate: a.user?.createdAt ? new Date(a.user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
  })) || []
})

const inviteEmail = ref('')
const inviteRole = ref('MANAGE_ORDERS')

function openModal() {
  isInviteModalOpen.value = true
}

function closeModal() {
  isInviteModalOpen.value = false
  inviteEmail.value = ''
  inviteRole.value = 'MANAGE_ORDERS'
}

async function sendInvite() {
  try {
    await addAssociateMutation.mutateAsync({
      email: inviteEmail.value,
      permission: inviteRole.value
    })
    closeModal()
  } catch (err: any) {
    console.error('Failed to add associate', err)
    alert(err.response?.data?.message || 'Gagal menambahkan associate.')
  }
}
</script>

<template>
  <div class="py-6 px-4 max-w-6xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-[28px] font-bold text-gray-900">Associate Toko</h1>
    </div>

    <!-- Summary Card -->
    <div class="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm w-64 mb-8">
      <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4B6BFB] mb-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h2 class="text-[32px] font-bold text-gray-900 leading-tight">{{ associates.length }}</h2>
      <p class="text-xs font-medium text-gray-400 mt-1">Total Associate aktif</p>
    </div>

    <!-- Actions Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="relative w-full sm:w-80">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input
          type="text"
          placeholder="Cari member"
          class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
          Semua Status
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <button v-if="isOwner" @click="openModal" class="px-5 py-2 bg-brand-light text-white text-sm font-bold rounded-xl hover:bg-brand-light/90 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Undang Associate
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <h3 class="text-sm font-bold text-gray-900">Team members</h3>
        <span class="px-2 py-0.5 bg-blue-50 text-[#4B6BFB] text-xs font-bold rounded-full">4 users</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500">
          <thead class="bg-gray-50/50 text-xs text-gray-500 uppercase">
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold">Name</th>
              <th scope="col" class="px-6 py-4 font-semibold flex items-center gap-1 cursor-pointer hover:text-gray-700">
                Status
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </th>
              <th scope="col" class="px-6 py-4 font-semibold">
                <div class="flex items-center gap-1">
                  Role
                  <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 font-semibold">Email</th>
              <th scope="col" class="px-6 py-4 font-semibold">Bergabung</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in associates" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900">{{ user.name }}</div>
                <div class="text-xs text-gray-400">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50">
                  <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span class="text-[11px] font-bold text-green-700">{{ user.status }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-[#4B6BFB]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ user.email }}</td>
              <td class="px-6 py-4 text-gray-500">{{ user.joinedDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>
        <div class="hidden sm:flex items-center gap-1 text-sm">
          <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 font-bold text-gray-900">1</button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-500">2</button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-500">3</button>
          <span class="text-gray-400 px-1">...</span>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-500">8</button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-500">9</button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-500">10</button>
        </div>
        <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>

    <!-- Invite Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isInviteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-bold text-gray-900">Undang Associate</h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <p class="text-sm text-gray-500 leading-relaxed mb-6">
              Tambahkan pengguna admin baru ke sistem. Email undangan akan dikirim ke alamat email mereka.
            </p>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-900 mb-2">Email</label>
                <input
                  v-model="inviteEmail"
                  type="email"
                  placeholder="admin@example.com"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-900 mb-2">Peran</label>
                <div class="relative">
                  <select
                    v-model="inviteRole"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
                  >
                    <option value="VIEW_ONLY">Lihat Saja (Read-Only)</option>
                    <option value="MANAGE_GIGS">Kelola Jasa (Gigs)</option>
                    <option value="MANAGE_ORDERS">Kelola Pesanan (Orders)</option>
                    <option value="FULL_ACCESS">Akses Penuh (Full Access)</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 flex justify-end">
              <button
                @click="sendInvite"
                class="px-6 py-2.5 bg-brand-light text-white text-sm font-bold rounded-xl hover:bg-brand-light/90 transition-colors shadow-lg shadow-brand-light/20"
              >
                Kirim Undangan
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
