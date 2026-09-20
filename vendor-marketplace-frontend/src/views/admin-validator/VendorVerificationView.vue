<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAdmin } from '../../composables/useAdmin'

const router = useRouter()
const { merchantsQuery } = useAdmin()

const tabs = ['All', 'Disetujui', 'Menunggu', 'Ditolak']
const activeTab = ref('Menunggu')

const page = ref(1)
const limit = ref(10)

const tabToStatus: Record<string, string> = {
  'All': 'ALL',
  'Disetujui': 'ACTIVE',
  'Menunggu': 'PENDING_VERIFICATION',
  'Ditolak': 'REJECTED'
}

watch(activeTab, () => {
  page.value = 1
})

const queryParams = computed(() => ({
  status: tabToStatus[activeTab.value],
  page: page.value,
  limit: limit.value
}))

const { data: merchantsData, isLoading } = merchantsQuery(queryParams)

const vendors = computed(() => {
  const list = merchantsData.value?.data || []
  return list.map((v: any) => {
    let friendlyStatus = 'Menunggu'
    if (v.status === 'ACTIVE') friendlyStatus = 'Disetujui'
    if (v.status === 'REJECTED') friendlyStatus = 'Ditolak'
    
    return {
      id: v.id,
      name: v.shopName,
      status: friendlyStatus,
      type: 'Creative Services',
      email: v.user?.email || 'N/A'
    }
  })
})

const totalVendors = computed(() => merchantsData.value?.meta?.total || 0)
const lastPage = computed(() => merchantsData.value?.meta?.lastPage || 1)

function goToDetail(id: number) {
  router.push(`/admin-validator/vendor-verification/${id}`)
}
</script>

<template>
  <div class="space-y-6 animate-fade-in w-full pb-10">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Antrian Verifikasi Vendor</h1>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 flex gap-8 px-2 mt-4">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="pb-4 text-sm font-bold transition-colors relative"
        :class="activeTab === tab ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab }}
        <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-[#1E3A8A] rounded-t-full"></div>
      </button>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div class="p-6 border-b border-gray-100 flex items-center gap-3">
        <h2 class="text-lg font-bold text-gray-800">Daftar Vendor</h2>
        <span class="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">{{ totalVendors }} vendors</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="text-xs text-gray-400 bg-white uppercase border-b border-gray-100">
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Nama Vendor</th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider flex items-center gap-1">
                Status
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider">
                <div class="flex items-center gap-1">
                  Tipe
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Email</th>
              <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400 italic">Memuat data vendor...</td>
            </tr>
            <tr v-else-if="vendors.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400 italic">Tidak ada antrean verifikasi vendor</td>
            </tr>
            <tr v-else v-for="vendor in vendors" :key="vendor.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-5">
                <div class="font-bold text-gray-900">{{ vendor.name }}</div>
              </td>
              <td class="px-6 py-5">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white text-xs font-bold text-gray-700">
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-green-500': vendor.status === 'Disetujui',
                    'bg-orange-500': vendor.status === 'Menunggu',
                    'bg-red-500': vendor.status === 'Ditolak'
                  }"></span>
                  {{ vendor.status }}
                </div>
              </td>
              <td class="px-6 py-5 font-bold text-gray-700">{{ vendor.type }}</td>
              <td class="px-6 py-5 font-bold text-gray-600">{{ vendor.email }}</td>
              <td class="px-6 py-5">
                <button @click="goToDetail(vendor.id)" class="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-2 px-5 rounded-lg transition-colors text-xs shadow-sm">
                  Lihat
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
        <button 
          @click="page > 1 && page--"
          :disabled="page === 1"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>
        <div class="hidden sm:flex items-center gap-1">
          <button 
            v-for="p in lastPage" 
            :key="p"
            @click="page = p"
            class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors"
            :class="page === p ? 'bg-[#1E3A8A] text-white' : 'text-gray-500 hover:bg-gray-50'"
          >
            {{ p }}
          </button>
        </div>
        <button 
          @click="page < lastPage && page++"
          :disabled="page === lastPage"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
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
