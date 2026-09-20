<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuth } from '../../composables/useAuth'
import Toast from '../../components/ui/Toast.vue'

const route = useRoute()
const router = useRouter()
const productId = route.params.id
const selectedPlan = ref((route.query.plan as string) || 'standard')

const { uploadFile } = useAuth()

const gig = ref<any>(null)
const isLoading = ref(true)
const isUploading = ref(false)

const showToast = ref(false)
const toastData = ref({ type: 'success' as 'success' | 'info' | 'error', title: '', subtitle: '' })

function showToastMsg(type: 'success' | 'info' | 'error', title: string, subtitle: string) {
  toastData.value = { type, title, subtitle }
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const product = ref({
  id: productId,
  title: '',
  description: '',
  features: [] as string[],
  price: 0,
  planName: '',
  vendor: '',
  deliveryDays: 3,
})

// File upload
const uploadedFiles = ref<{ name: string; size: string; type: string }[]>([])
const rawFiles = ref<File[]>([])
const isDragging = ref(false)
const additionalNotes = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) processFiles(files)
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(input.files)
}

function processFiles(files: FileList) {
  Array.from(files).forEach(file => {
    rawFiles.value.push(file)
    const sizeKB = file.size / 1024
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`
    uploadedFiles.value.push({
      name: file.name,
      size: sizeStr,
      type: file.type.split('/').pop()?.toUpperCase() || 'FILE',
    })
  })
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1)
  rawFiles.value.splice(index, 1)
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function goBack() {
  router.back()
}

async function fetchGigDetails() {
  try {
    isLoading.value = true
    const res = await api.get(`/gigs/details/${productId}`)
    gig.value = res.data
    
    // Parse description JSON
    let descJson: any = null
    try {
      descJson = JSON.parse(res.data.description)
    } catch (e) {
      // Legacy text format
    }

    const basePrice = typeof res.data.price === 'string' ? parseFloat(res.data.price) : res.data.price
    const planKey = selectedPlan.value.toLowerCase()

    let planName = 'Paket Standard'
    let planPrice = basePrice
    let planFeatures: string[] = []
    let deliveryDays = 5

    if (descJson && descJson.tiers) {
      const tier = descJson.tiers[planKey] || descJson.tiers.standard || {}
      planName = tier.name || `Paket ${selectedPlan.value.charAt(0).toUpperCase() + selectedPlan.value.slice(1)}`
      planPrice = typeof tier.price === 'string' ? parseFloat(tier.price) : (tier.price || basePrice)
      
      if (Array.isArray(tier.features)) {
        planFeatures = tier.features
      } else if (typeof tier.features === 'string') {
        planFeatures = tier.features.split(',').map((f: string) => f.trim()).filter(Boolean)
      }
    } else {
      // Fallback
      if (planKey === 'basic') {
        planName = 'Paket Basic'
        planPrice = basePrice * 0.6
        planFeatures = ['Pengiriman Cepat', 'Revisi 1x', 'Desain Standard']
        deliveryDays = 3
      } else if (planKey === 'premium') {
        planName = 'Paket Premium'
        planPrice = basePrice * 1.8
        planFeatures = ['Pengiriman Super Cepat', 'Revisi Unlimited', 'Desain Premium Kualitas Tinggi', 'File master']
        deliveryDays = 7
      } else {
        planName = 'Paket Standard'
        planPrice = basePrice
        planFeatures = ['Pengiriman Cepat', 'Revisi 3x', 'Desain Professional', 'File master']
        deliveryDays = 5
      }
    }

    product.value = {
      id: productId,
      title: res.data.title,
      description: descJson?.text || descJson?.description || res.data.description,
      features: planFeatures,
      price: planPrice,
      planName: planName,
      vendor: res.data.merchant?.shopName || 'Freelancer',
      deliveryDays: deliveryDays,
    }
  } catch (err) {
    console.error(err)
    showToastMsg('error', 'Gagal Memuat Layanan', 'Layanan tidak ditemukan.')
  } finally {
    isLoading.value = false
  }
}

async function goToCheckout() {
  if (isUploading.value) return
  isUploading.value = true
  
  try {
    const fileUrls: string[] = []
    if (rawFiles.value.length > 0) {
      showToastMsg('info', 'Mengunggah Berkas...', 'Sedang mengunggah berkas kebutuhan Anda')
      for (const file of rawFiles.value) {
        const uploadRes = await uploadFile(file, 'merchant-assets')
        const fileUrl = uploadRes.url || uploadRes.data?.url
        if (fileUrl) {
          fileUrls.push(fileUrl)
        }
      }
    }
    
    router.push({
      name: 'Checkout',
      params: { id: productId as string },
      query: {
        plan: selectedPlan.value,
        price: product.value.price,
        notes: additionalNotes.value || undefined,
        files: fileUrls.length > 0 ? fileUrls.join(',') : undefined,
      },
    })
  } catch (err) {
    console.error('File upload failed', err)
    showToastMsg('error', 'Gagal Mengunggah Berkas', 'Terjadi masalah ketika mengunggah berkas kebutuhan.')
  } finally {
    isUploading.value = false
  }
}

onMounted(async () => {
  await fetchGigDetails()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); observer.unobserve(e.target) } })
  }, { threshold: 0.08 })
  document.querySelectorAll('.ai:not(.vis)').forEach((el) => observer.observe(el))
})
</script>

<template>
<div class="oc">
  <div class="oc__inner">
    <!-- Success/Error Toast -->
    <div v-if="showToast" class="fixed-toast">
      <Toast :type="toastData.type" :title="toastData.title" :subtitle="toastData.subtitle" />
    </div>

    <!-- Back Button -->
    <button class="oc__back ai" @click="goBack" aria-label="Kembali">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>

    <!-- Page Title & Breadcrumb Stepper -->
    <div class="oc__header ai" style="transition-delay:50ms">
      <h1 class="oc__title">Konfirmasi Pesanan</h1>
      <nav class="stepper" aria-label="Order steps">
        <span class="stepper__step stepper__step--active">Detail Pesanan</span>
        <span class="stepper__divider">/</span>
        <span class="stepper__step">Pembayaran</span>
        <span class="stepper__divider">/</span>
        <span class="stepper__step">Verifikasi</span>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat konfigurasi pesanan...</p>
    </div>

    <div v-else>
      <!-- Detail Layanan -->
      <section class="oc__section ai" style="transition-delay:120ms">
        <h2 class="oc__section-title">Detail Layanan</h2>
        <div class="service-card">
          <div class="service-card__content">
            <span class="service-card__plan-badge">{{ product.planName }}</span>
            <h3 class="service-card__name">{{ product.title }}</h3>
            <p class="service-card__desc">{{ product.description }}</p>
            <ul class="service-card__features">
              <li v-for="f in product.features" :key="f">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {{ f }}
              </li>
            </ul>
          </div>
          <div class="service-card__price-section">
            <span class="service-card__price-label">Harga Paket</span>
            <span class="service-card__price">{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </section>

      <!-- Kebutuhan Proyek -->
      <section class="oc__section ai" style="transition-delay:200ms">
        <h2 class="oc__section-title">Kebutuhan Proyek (Requirements)</h2>
        <div
          class="upload-zone"
          :class="{ 'upload-zone--active': isDragging }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="openFilePicker"
        >
          <input ref="fileInputRef" type="file" multiple class="upload-zone__input" @change="handleFileSelect" accept=".jpeg,.jpg,.png,.gif,.mp4,.pdf,.psd,.ai,.doc,.docx,.ppt,.pptx" />
          <div class="upload-zone__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p class="upload-zone__text">Drag & drop files or <span class="upload-zone__browse">Browse</span></p>
          <span class="upload-zone__formats">Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT</span>
        </div>

        <!-- Uploaded Files -->
        <div v-if="uploadedFiles.length > 0" class="uploaded-files">
          <div v-for="(file, idx) in uploadedFiles" :key="idx" class="uploaded-file">
            <div class="uploaded-file__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="uploaded-file__info">
              <span class="uploaded-file__name">{{ file.name }}</span>
              <span class="uploaded-file__meta">{{ file.type }} • {{ file.size }}</span>
            </div>
            <button class="uploaded-file__remove" @click.stop="removeFile(idx)" aria-label="Remove file">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Instruksi Tambahan -->
      <section class="oc__section ai" style="transition-delay:280ms">
        <h2 class="oc__section-title">Instruksi Tambahan</h2>
        <textarea
          v-model="additionalNotes"
          class="oc__textarea"
          placeholder="Tuliskan detail spesifik, preferensi warna, atau pesan khusus untuk freelancer..."
          rows="5"
        ></textarea>
      </section>

      <!-- Action -->
      <div class="oc__actions ai" style="transition-delay:360ms">
        <button class="oc__btn-continue" :disabled="isUploading" @click="goToCheckout">
          <template v-if="isUploading">Memproses...</template>
          <template v-else>Lanjutkan</template>
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.ai{opacity:0;transform:translateY(20px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}.ai.vis{opacity:1;transform:translateY(0)}

.oc { padding: 1.5rem 0 4rem; min-height: 100vh; background: #FAFBFC; }
.oc__inner { max-width: 860px; margin: 0 auto; padding: 0 1.5rem; }

.fixed-toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 100; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; color: #6B7280; font-weight: 500; }
.spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #3B5BDB; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Back */
.oc__back {
  background: none; border: none; cursor: pointer; color: #374151;
  margin-bottom: 1.25rem; padding: 0; display: flex; transition: color 0.2s;
}
.oc__back:hover { color: #3B5BDB; }

/* Header */
.oc__header { margin-bottom: 2rem; }
.oc__title {
  font-size: 1.75rem; font-weight: 800; color: #1E2A5E;
  margin: 0 0 0.5rem; letter-spacing: -0.01em;
}

/* Stepper */
.stepper { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
.stepper__step { color: #9CA3AF; font-weight: 500; transition: color 0.2s; }
.stepper__step--active { color: #3B5BDB; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.stepper__divider { color: #D1D5DB; }

/* Section */
.oc__section { margin-bottom: 2rem; }
.oc__section-title {
  font-size: 1.0625rem; font-weight: 700; color: #1E2A5E;
  margin: 0 0 1rem; font-style: italic;
}

/* Service Card */
.service-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 16px;
  padding: 2rem; position: relative;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.service-card__plan-badge {
  display: inline-block; padding: 0.25rem 0.75rem; background: #EEF2FF;
  color: #3B5BDB; font-size: 0.75rem; font-weight: 700; border-radius: 9999px;
  margin-bottom: 0.75rem; text-transform: uppercase;
}
.service-card__name {
  font-size: 1.375rem; font-weight: 800; color: #1E2A5E;
  margin: 0 0 0.75rem;
}
.service-card__desc {
  font-size: 0.9375rem; color: #6B7280; line-height: 1.7;
  margin: 0 0 1.25rem; max-width: 520px;
}
.service-card__features {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 0.625rem;
}
.service-card__features li {
  display: flex; align-items: center; gap: 0.625rem;
  font-size: 0.9375rem; color: #374151; font-weight: 500;
}
.service-card__price-section {
  display: flex; flex-direction: column; align-items: flex-end;
  margin-top: 1.5rem; padding-top: 1.25rem;
  border-top: 1px solid #F3F4F6;
}
.service-card__price-label {
  font-size: 0.8125rem; color: #6B7280; font-weight: 500;
}
.service-card__price {
  font-size: 1.5rem; font-weight: 800; color: #1E2A5E;
  margin-top: 0.25rem;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #D1D5DB; border-radius: 16px;
  padding: 2.5rem 2rem; text-align: center;
  cursor: pointer; transition: all 0.3s ease;
  background: #FAFBFC; position: relative;
}
.upload-zone:hover { border-color: #3B5BDB; background: #F0F4FF; }
.upload-zone--active { border-color: #3B5BDB; background: #EEF2FF; box-shadow: 0 0 0 4px rgba(59,91,219,0.08); }
.upload-zone__input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-zone__icon {
  width: 72px; height: 72px; margin: 0 auto 1rem;
  background: #EEF2FF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.upload-zone__text { font-size: 0.9375rem; color: #374151; font-weight: 500; margin: 0 0 0.375rem; }
.upload-zone__browse { color: #3B5BDB; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.upload-zone__formats { font-size: 0.75rem; color: #9CA3AF; }

/* Uploaded Files */
.uploaded-files { display: flex; flex-direction: column; gap: 0.625rem; margin-top: 1rem; }
.uploaded-file {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1rem; background: #fff;
  border: 1px solid #E5E7EB; border-radius: 12px;
  transition: all 0.2s;
}
.uploaded-file:hover { border-color: #3B5BDB; }
.uploaded-file__icon {
  width: 36px; height: 36px; background: #EEF2FF; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.uploaded-file__info { flex: 1; min-width: 0; }
.uploaded-file__name {
  display: block; font-size: 0.875rem; font-weight: 600; color: #111827;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.uploaded-file__meta { font-size: 0.75rem; color: #9CA3AF; }
.uploaded-file__remove {
  background: none; border: none; cursor: pointer; color: #9CA3AF;
  padding: 4px; transition: color 0.2s; flex-shrink: 0;
}
.uploaded-file__remove:hover { color: #EF4444; }

/* Textarea */
.oc__textarea {
  width: 100%; padding: 1rem 1.25rem;
  border: 1px solid #E5E7EB; border-radius: 12px;
  font-size: 0.9375rem; color: #374151; resize: vertical;
  outline: none; font-family: inherit; transition: border-color 0.2s;
  background: #fff; box-sizing: border-box; line-height: 1.6;
}
.oc__textarea:focus { border-color: #3B5BDB; box-shadow: 0 0 0 3px rgba(59,91,219,0.08); }
.oc__textarea::placeholder { color: #9CA3AF; }

/* Actions */
.oc__actions { display: flex; justify-content: flex-end; padding-top: 0.5rem; }
.oc__btn-continue {
  padding: 0.875rem 2.5rem; background: #1E2A5E; color: #fff;
  font-weight: 700; font-size: 1rem; border: none; border-radius: 12px;
  cursor: pointer; transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(30,42,94,0.15);
}
.oc__btn-continue:hover:not(:disabled) {
  background: #2A3A7A; transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30,42,94,0.25);
}
.oc__btn-continue:active:not(:disabled) { transform: translateY(0); }
.oc__btn-continue:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 640px) {
  .oc__title { font-size: 1.375rem; }
  .service-card { padding: 1.25rem; }
  .service-card__name { font-size: 1.125rem; }
  .service-card__price { font-size: 1.25rem; }
  .upload-zone { padding: 1.5rem 1rem; }
  .oc__btn-continue { width: 100%; text-align: center; }
}
@media (prefers-reduced-motion: reduce) { .ai { transition: none; } }
</style>
