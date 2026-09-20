<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMyGigs } from '../../composables/useGigs'

const router = useRouter()

const activeTab = ref('Semua')
const tabs = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak', 'Draf']

const { data: myGigs, isLoading } = useMyGigs()

const mappedGigs = computed(() => {
  const list = myGigs.value || []
  return list.map((g: any) => {
    let statusLabel = 'MENUNGGU PERSETUJUAN'
    let statusClass = 'bg-blue-50 text-blue-500'
    let tabCategory = 'Menunggu'
    let isReviewing = false
    let hasBoost = false
    let hasNote = false
    let isDraft = false

    if (g.status === 'PENDING_APPROVAL') {
      statusLabel = 'MENUNGGU PERSETUJUAN'
      statusClass = 'bg-blue-50 text-blue-500'
      tabCategory = 'Menunggu'
      isReviewing = true
    } else if (g.status === 'APPROVED' || g.status === 'ACTIVE' || g.status === 'FEATURED') {
      statusLabel = 'AKTIF'
      statusClass = 'bg-[#E6F0FF] text-[#4B6BFB]'
      tabCategory = 'Disetujui'
      hasBoost = g.status === 'FEATURED'
    } else if (g.status === 'REJECTED') {
      statusLabel = 'DITOLAK'
      statusClass = 'bg-red-50 text-red-500'
      tabCategory = 'Ditolak'
      hasNote = !!g.rejectionReason
    } else if (g.status === 'DRAFT') {
      statusLabel = 'DRAFT'
      statusClass = 'bg-gray-800 text-white'
      tabCategory = 'Draf'
      isDraft = true
    } else if (g.status === 'SUSPENDED') {
      statusLabel = 'DITANGGUHKAN'
      statusClass = 'bg-red-100 text-red-700'
      tabCategory = 'Ditolak'
    }

    let parsedDesc = g.description
    try {
      const parsed = JSON.parse(g.description)
      parsedDesc = parsed.text || parsed.description || g.description
    } catch (_) {}

    return {
      id: g.id,
      title: g.title,
      description: parsedDesc,
      price: 'Rp ' + Number(g.price).toLocaleString('id-ID'),
      status: statusLabel,
      statusClass,
      promoDisabled: g.status === 'DRAFT' || g.status === 'REJECTED',
      hasBoost,
      isReviewing,
      hasNote,
      note: g.rejectionReason,
      isDraft,
      image: g.coverImage || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=500',
      category: tabCategory
    }
  })
})

const filteredGigs = computed(() => {
  if (activeTab.value === 'Semua') {
    return mappedGigs.value.filter((g: any) => !g.isDraft)
  }
  return mappedGigs.value.filter((g: any) => g.category === activeTab.value)
})

function navigateToDetail(id: number) {
  router.push({ name: 'VendorAssociateCatalogDetail', params: { id } })
}
</script>

<template>
  <div class="py-6 px-4 space-y-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Manajemen Layanan</h1>
    </div>

    <div class="flex justify-between items-center border-b border-gray-100 pb-px">
      <div class="flex gap-8">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          @click="activeTab = tab"
          class="pb-4 text-sm font-bold transition-all relative"
          :class="activeTab === tab ? 'text-[#1E3A8A]' : 'text-gray-400 hover:text-gray-600'"
        >
          {{ tab }}
          <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-1 bg-[#1E3A8A] rounded-t-full"></div>
        </button>
      </div>
      
      <router-link 
        to="/vendor/catalog/add"
        class="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1E3A8A]/95 transition-all shadow-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        Buat Layanan Baru
      </router-link>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 text-gray-500">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-[#1E3A8A] rounded-full animate-spin"></div>
      <p class="mt-4 text-sm font-medium">Memuat daftar layanan...</p>
    </div>

    <div v-else-if="!filteredGigs.length" class="flex flex-col items-center justify-center py-12 text-gray-400">
      <p class="text-sm">Tidak ada layanan di kategori ini.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
      <div 
        v-for="gig in filteredGigs" 
        :key="gig.id"
        @click="navigateToDetail(gig.id)"
        class="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
      >
        <div class="relative h-56 bg-gray-200">
          <img :src="gig.image" class="w-full h-full object-cover grayscale brightness-50" />
          <div class="absolute top-4 left-4">
            <span :class="['px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest', gig.statusClass]">
              {{ gig.status }}
            </span>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <h3 class="text-lg font-bold text-gray-900">{{ gig.title }}</h3>
              <p class="text-[10px] text-gray-400 leading-relaxed line-clamp-2">
                {{ gig.description }}
              </p>
            </div>
            <button @click.stop class="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>

          <div class="text-xl font-bold text-[#1E3A8A]">
            {{ gig.price }}
          </div>

          <div class="pt-4 border-t border-gray-50">
            <!-- Draft Actions -->
            <div v-if="gig.isDraft" class="flex items-center gap-3">
              <button @click.stop class="flex-1 bg-[#2F4DC4] text-white py-3 rounded-2xl text-xs font-bold hover:bg-[#1E3A8A] transition-all shadow-md">
                Lanjutkan edit
              </button>
              <button @click.stop class="w-12 h-12 flex items-center justify-center border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <!-- Restricted/Disabled Promo -->
            <div v-else-if="gig.promoDisabled" class="flex justify-between items-center">
              <div class="flex items-center gap-2 text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span class="text-[8px] font-bold uppercase tracking-widest">Promosi Dinonaktifkan</span>
              </div>
              <button @click.stop disabled class="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-not-allowed">
                Boost Gig
              </button>
            </div>

            <!-- Active / Boost -->
            <div v-else-if="gig.hasBoost" class="flex justify-end">
              <button @click.stop class="bg-[#1E3A8A] text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#1E3A8A]/90 transition-all">
                Boost Gig
              </button>
            </div>

            <!-- Reviewing -->
            <div v-else-if="gig.isReviewing" class="bg-gray-50 p-3 rounded-xl flex items-center gap-2">
              <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span class="text-[10px] font-bold text-gray-400">Menunggu review</span>
            </div>

            <!-- Rejected with Note -->
            <div v-else-if="gig.hasNote" class="space-y-3">
              <button @click.stop class="text-[10px] font-bold text-red-500 flex items-center gap-2 hover:opacity-80">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                LIHAT CATATAN
              </button>
              <p class="text-[10px] text-red-500 italic font-medium leading-relaxed">
                {{ gig.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
