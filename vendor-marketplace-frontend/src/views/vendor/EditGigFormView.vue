<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMyGigs } from '../../composables/useGigs'
import api from '../../api/axios'
import FileUpload from '../../components/ui/FileUpload.vue'
import Button from '../../components/ui/Button.vue'
import Input from '../../components/ui/Input.vue'
import Toast from '../../components/ui/Toast.vue'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { uploadFile } = useAuth()
const gigId = route.params.id as string

const { data: myGigs, isLoading } = useMyGigs()

const gig = computed(() => {
  if (!myGigs.value) return null
  return myGigs.value.find((g: any) => String(g.id) === String(gigId))
})

const title = ref('')
const description = ref('')
const mediaFile = ref<File | null>(null)
const showToast = ref(false)
const toastData = reactive<{type: 'info' | 'success' | 'error', title: string, subtitle: string}>({
  type: 'success',
  title: '',
  subtitle: ''
})

const tiers = reactive({
  basic: { price: '', features: '' },
  standard: { price: '', features: '' },
  premium: { price: '', features: '' }
})

watch(gig, (newGig) => {
  if (newGig) {
    title.value = newGig.title
    try {
      const parsed = JSON.parse(newGig.description)
      description.value = parsed.text || ''
      if (parsed.tiers) {
        tiers.basic.price = parsed.tiers.basic?.price || ''
        tiers.basic.features = parsed.tiers.basic?.features || ''
        tiers.standard.price = parsed.tiers.standard?.price || ''
        tiers.standard.features = parsed.tiers.standard?.features || ''
        tiers.premium.price = parsed.tiers.premium?.price || ''
        tiers.premium.features = parsed.tiers.premium?.features || ''
      }
    } catch (e) {
      description.value = newGig.description
      tiers.basic.price = String(newGig.price)
    }
  }
}, { immediate: true })

async function handlePublish(isDraft = false) {
  try {
    for (const [key, tier] of Object.entries(tiers)) {
      const priceNum = parseFloat(String(tier.price).replace(/[^0-9]/g, ''))
      if (isNaN(priceNum) || priceNum <= 0) {
        toastData.type = 'error'
        toastData.title = 'Harga Tidak Valid'
        toastData.subtitle = `Harga pada paket ${key} harus lebih dari 0.`
        showToast.value = true
        setTimeout(() => { showToast.value = false }, 3000)
        return
      }
    }

    let mainImageUrl = gig.value?.mediaUrls
    if (mediaFile.value) {
      const uploadRes = await uploadFile(mediaFile.value, 'gig-media')
      mainImageUrl = uploadRes.url || uploadRes.data?.url
    }

    const payload = {
      title: title.value,
      description: JSON.stringify({
        text: description.value,
        tiers: {
          basic: { price: tiers.basic.price, features: tiers.basic.features },
          standard: { price: tiers.standard.price, features: tiers.standard.features },
          premium: { price: tiers.premium.price, features: tiers.premium.features }
        }
      }),
      price: parseFloat(String(tiers.basic.price).replace(/[^0-9]/g, '')) || 0,
      mediaUrls: mainImageUrl,
      status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL'
    }

    await api.patch(`/gigs/${gigId}`, payload)

    toastData.type = 'success'
    toastData.title = isDraft ? "Draf Tersimpan!" : "Layanan Diperbarui!"
    toastData.subtitle = isDraft ? 'DRAFT' : 'ACTIVE'
    showToast.value = true
    
    setTimeout(() => {
      router.push('/vendor/catalog')
    }, 2000)
  } catch (err: any) {
    console.error('Failed to update gig', err)
    toastData.type = 'error'
    toastData.title = "Gagal memperbarui"
    toastData.subtitle = err.response?.data?.message || err.message
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  }
}

function handleBoost() {
  router.push(`/vendor/catalog/promote/${gigId}`)
}
function formatRupiah(value: string | number) {
  if (!value) return ''
  const numberStr = String(value).replace(/[^0-9]/g, '')
  if (!numberStr) return ''
  const numberVal = parseInt(numberStr, 10)
  if (numberVal === 0) return ''
  return numberVal.toLocaleString('id-ID')
}

function handlePriceInput(tier: any, e: Event) {
  const input = e.target as HTMLInputElement
  const rawValue = input.value.replace(/[^0-9]/g, '')
  
  if (!rawValue || parseInt(rawValue, 10) === 0) {
    tier.price = ''
    input.value = ''
    return
  }
  
  const numValue = parseInt(rawValue, 10)
  tier.price = String(numValue)
  input.value = numValue.toLocaleString('id-ID')
}
</script>

<template>
  <div class="p-8 max-w-4xl relative">
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
    </div>
    
    <template v-else-if="gig">
    <div v-if="showToast" class="fixed top-8 right-8 z-50">
      <Toast :type="toastData.type" :title="toastData.title" :subtitle="toastData.subtitle" />
    </div>

    <div class="mb-8">
      <h1 class="text-[28px] font-bold text-gray-900 mb-2">Edit My Gigs</h1>
    </div>

    <form @submit.prevent="handlePublish(false)" class="flex flex-col gap-6 max-w-3xl">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Judul</label>
        <Input 
          v-model="title" 
          placeholder="Insert Text Here" 
          class="h-11 rounded-lg border-gray-300 focus:border-brand-navy focus:ring-brand-navy"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea 
          v-model="description"
          placeholder="Insert Text Here"
          class="w-full px-4 py-3 rounded-lg border border-brand-navy/30 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none transition-colors resize-none h-32 text-gray-700 text-sm"
        ></textarea>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700 font-bold mb-2">Penentuan Harga & Paket</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Basic Tier -->
          <div class="p-6 rounded-2xl border-2 border-gray-100 bg-white space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <h3 class="font-bold text-gray-900">Basic</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga</label>
                <div class="relative mt-1">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input :value="formatRupiah(tiers.basic.price)" @input="handlePriceInput(tiers.basic, $event)" type="text" class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-navy outline-none transition-all font-bold text-brand-navy" />
                </div>
              </div>
              <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fitur (Pisahkan dengan koma)</label>
                <textarea v-model="tiers.basic.features" class="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-navy outline-none transition-all text-xs h-24 resize-none" placeholder="Contoh: Revisi 2x, Format JPG, 3 Hari Pengerjaan"></textarea>
              </div>
            </div>
          </div>

          <!-- Standard Tier -->
          <div class="p-6 rounded-2xl border-2 border-brand-navy/10 bg-blue-50/30 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.143-6.857L1 12l6.857-2.143L9 3z"/></svg>
              </div>
              <h3 class="font-bold text-gray-900">Standard</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga</label>
                <div class="relative mt-1">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input :value="formatRupiah(tiers.standard.price)" @input="handlePriceInput(tiers.standard, $event)" type="text" class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-navy outline-none transition-all font-bold text-brand-navy" />
                </div>
              </div>
              <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fitur (Pisahkan dengan koma)</label>
                <textarea v-model="tiers.standard.features" class="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-navy outline-none transition-all text-xs h-24 resize-none" placeholder="Contoh: Revisi 5x, Source File, 2 Hari Pengerjaan"></textarea>
              </div>
            </div>
          </div>

          <!-- Premium Tier -->
          <div class="p-6 rounded-2xl border-2 border-amber-100 bg-amber-50/30 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 class="font-bold text-gray-900">Premium</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga</label>
                <div class="relative mt-1">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input :value="formatRupiah(tiers.premium.price)" @input="handlePriceInput(tiers.premium, $event)" type="text" class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-navy outline-none transition-all font-bold text-brand-navy" />
                </div>
              </div>
              <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fitur (Pisahkan dengan koma)</label>
                <textarea v-model="tiers.premium.features" class="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-navy outline-none transition-all text-xs h-24 resize-none" placeholder="Contoh: Revisi Sepuasnya, Prioritas, 1 Hari Pengerjaan"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FileUpload 
        v-model:file="mediaFile"
        accept="image/jpeg, image/png, video/mp4"
        dragText="Choose Document or drag and drop it here"
        formatText="JPEG, PNG, and MP4"
      >
        <template #label>
          Media - Upload <span class="font-bold">Media Sampul</span> disini
        </template>
      </FileUpload>

      <div class="flex gap-4 mt-4">
        <button type="button" @click="handleBoost" class="flex-1 h-14 rounded-xl text-xl font-medium relative flex items-center justify-center bg-[#F1B44C] text-white hover:bg-[#E5A840] transition-colors">
          Boost / Promote
          <span class="absolute right-4 w-8 h-8 bg-white text-[#F1B44C] rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>

        <button type="button" @click="handlePublish(true)" class="flex-1 h-14 rounded-xl text-xl font-medium relative flex items-center justify-center border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          Simpan Draf
        </button>

        <Button type="submit" variant="primary" class="flex-1 h-14 rounded-xl text-xl font-medium relative flex items-center justify-center">
          Publish
          <span class="absolute right-4 w-8 h-8 bg-white text-brand-navy rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </span>
        </Button>
      </div>
    </form>
    </template>
    <div v-else class="flex flex-col items-center justify-center min-h-[400px]">
       <p class="text-gray-500 text-lg">Layanan tidak ditemukan atau Anda tidak memiliki akses.</p>
       <button @click="router.push('/vendor/catalog')" class="mt-4 text-brand-navy font-bold hover:underline">Kembali ke Katalog</button>
    </div>
  </div>
</template>
