<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCategories } from '../../composables/useCategories'
import Toast from '../../components/ui/Toast.vue'
import api from '../../api/axios'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { uploadFile } = useAuth()
const { data: categories, isLoading: isLoadingCategories } = useCategories()

const title = ref('')
const description = ref('')
const categoryId = ref<number | ''>('')
const showToast = ref(false)
const toastData = reactive<{type: 'info' | 'success' | 'error', title: string, subtitle: string}>({
  type: 'info',
  title: '',
  subtitle: ''
})

const isSubmitting = ref(false)

const tiers = ref([
  { id: '01', name: 'Basic', price: '', features: '', isHighlighted: false },
  { id: '02', name: 'Standard', price: '', features: '', isHighlighted: true },
  { id: '03', name: 'Premium', price: '', features: '', isHighlighted: false },
])

const isDragging = ref(false)
const uploadedFiles = ref<{ name: string; size: string }[]>([])
const rawFiles = ref<File[]>([])

const showErrorToast = (title: string, subtitle: string) => {
  toastData.type = 'error'
  toastData.title = title
  toastData.subtitle = subtitle
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}


function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) processFiles(files)
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(input.files)
}

function processFiles(files: FileList) {
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    if (f) {
      uploadedFiles.value.push({
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(1) + ' MB'
      })
      rawFiles.value.push(f)
    }
  }
}

function removeFile(idx: number) {
  uploadedFiles.value.splice(idx, 1)
  rawFiles.value.splice(idx, 1)
}

function handleSaveDraft() {
  handleComplete(true)
}

async function handleComplete(isDraft = false) {
  if (!title.value.trim()) {
    showErrorToast('Judul Wajib Diisi', 'Silakan masukkan nama layanan')
    return
  }
  if (!description.value.trim()) {
    showErrorToast('Deskripsi Wajib Diisi', 'Silakan tulis deskripsi layanan')
    return
  }
  if (!categoryId.value) {
    showErrorToast('Kategori Wajib Diisi', 'Silakan pilih kategori layanan')
    return
  }
  if (!isDraft && rawFiles.value.length === 0) {
    showErrorToast('Media Portofolio Wajib', 'Harap unggah minimal satu berkas portofolio utama')
    return
  }

  for (const tier of tiers.value) {
    const priceNum = parseFloat(tier.price || '0')
    if (isNaN(priceNum) || priceNum <= 0) {
      showErrorToast('Harga Tidak Valid', `Harga pada paket ${tier.name} harus lebih dari 0.`)
      return
    }
  }

  isSubmitting.value = true
  toastData.type = 'info'
  toastData.title = isDraft ? 'Menyimpan Draf...' : 'Mengunggah Berkas...'
  toastData.subtitle = isDraft ? 'Sedang menyimpan sebagai draf' : 'Sedang mengunggah portofolio ke cloud storage'
  showToast.value = true

  try {
    // 1. Upload main media file (skip for draft if no files)
    let mainImageUrl = ''
    const firstFile = rawFiles.value[0]
    if (firstFile) {
      const mainUploadRes = await uploadFile(firstFile, 'gig-media')
      mainImageUrl = mainUploadRes.url || mainUploadRes.data?.url || ''
    }

    // 2. Upload secondary media files
    const extraMediaUrls: string[] = []
    for (let i = 1; i < rawFiles.value.length; i++) {
      const file = rawFiles.value[i]
      if (file) {
        const extraRes = await uploadFile(file, 'gig-media')
        const extraUrl = extraRes.url || extraRes.data?.url
        if (extraUrl) {
          extraMediaUrls.push(extraUrl)
        }
      }
    }

    // 3. Construct serialized description
    const serializedDescription = JSON.stringify({
      text: description.value,
      tiers: {
        basic: {
          price: String(tiers.value.find(t => t.name === 'Basic')?.price || '0'),
          features: String(tiers.value.find(t => t.name === 'Basic')?.features || '')
        },
        standard: {
          price: String(tiers.value.find(t => t.name === 'Standard')?.price || '0'),
          features: String(tiers.value.find(t => t.name === 'Standard')?.features || '')
        },
        premium: {
          price: String(tiers.value.find(t => t.name === 'Premium')?.price || '0'),
          features: String(tiers.value.find(t => t.name === 'Premium')?.features || '')
        }
      },
      extraMedia: extraMediaUrls
    })

    // 4. Submit to POST /gigs
    const standardPriceNum = parseFloat(tiers.value.find(t => t.name === 'Standard')?.price || '0')
    const payload = {
      categoryId: Number(categoryId.value),
      title: title.value,
      description: serializedDescription,
      price: standardPriceNum,
      mediaUrls: mainImageUrl || undefined,
      status: isDraft === true ? 'DRAFT' : 'PENDING_APPROVAL'
    }

    await api.post('/gigs', payload)

    toastData.type = 'success'
    toastData.title = isDraft ? 'Draf Tersimpan' : 'Berhasil Terbit'
    toastData.subtitle = isDraft ? 'Layanan Anda berhasil disimpan sebagai draf' : 'Layanan Anda sedang dikirim untuk moderasi'
    showToast.value = true

    setTimeout(() => {
      router.push('/vendor/catalog')
    }, 2000)
  } catch (err: any) {
    console.error('Failed to create gig', err)
    showErrorToast('Gagal Menerbitkan Layanan', err.response?.data?.message || err.message || 'Terjadi kesalahan internal')
  } finally {
    isSubmitting.value = false
  }
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
  <div class="add-gig-page">
    <Transition name="toast-slide">
      <div v-if="showToast" class="toast-wrapper">
        <Toast :type="toastData.type" :title="toastData.title" :subtitle="toastData.subtitle" />
      </div>
    </Transition>

    <!-- Back Button -->
    <button class="back-btn" @click="router.back()">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
    </button>

    <!-- Form Card -->
    <div class="form-card">
      <h1 class="form-title">Buat Layanan Baru</h1>

      <!-- Nama Layanan -->
      <div class="field-group">
        <label class="field-label">NAMA LAYANAN</label>
        <input
          v-model="title"
          type="text"
          placeholder="contoh: Desain Logo"
          class="field-input"
        />
      </div>

      <!-- Deskripsi -->
      <div class="field-group">
        <label class="field-label">DESKRIPSI</label>
        <textarea
          v-model="description"
          placeholder="Jelaskan nilai utama layanan dan dampak operasionalnya..."
          class="field-textarea"
        ></textarea>
      </div>

      <!-- Kategori -->
      <div class="field-group">
        <label class="field-label">KATEGORI</label>
        <div class="select-wrapper">
          <select v-model="categoryId" class="field-select" :disabled="isLoadingCategories">
            <option value="" disabled>{{ isLoadingCategories ? 'Memuat kategori...' : 'Pilih kategori' }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <svg class="select-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>

      <!-- Harga & Ketentuan -->
      <div class="field-group">
        <h2 class="section-title">Harga & Ketentuan</h2>
        <div class="tiers-grid">
          <div
            v-for="tier in tiers"
            :key="tier.id"
            class="tier-card"
            :class="{ highlighted: tier.isHighlighted }"
          >
            <span class="tier-badge">{{ tier.id }}</span>
            <h3 class="tier-name">{{ tier.name }}</h3>
            <div class="price-input-wrap">
              <span class="price-prefix">Rp</span>
              <input
                type="text"
                :value="formatRupiah(tier.price)"
                @input="handlePriceInput(tier, $event)"
                class="price-input"
              />
            </div>
            <textarea
              v-model="tier.features"
              placeholder="Fitur yang termasuk dalam paket ini"
              class="tier-features"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Portfolio Assets -->
      <div class="field-group">
        <label class="field-label">PORTFOLIO ASSETS</label>
        <div
          class="upload-zone"
          :class="{ dragging: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="($refs.fileInput as HTMLInputElement)?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/png,image/jpeg,video/mp4"
            class="hidden-input"
            @change="handleFileSelect"
          />
          <div class="upload-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          </div>
          <p class="upload-text">Drag and drop assets or <span class="upload-link">browse</span></p>
          <p class="upload-hint">High-resolution PNG, JPG (Min 1080p recommended)</p>
        </div>

        <!-- Uploaded files list -->
        <div v-if="uploadedFiles.length" class="uploaded-list">
          <div v-for="(file, idx) in uploadedFiles" :key="idx" class="uploaded-item">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.size }}</span>
            <button class="file-remove" @click.stop="removeFile(idx)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="form-actions">
        <button class="btn-draft" :disabled="isSubmitting" @click="handleSaveDraft">Simpan Draf</button>
        <button class="btn-submit" :disabled="isSubmitting" @click="handleComplete(false)">
          {{ isSubmitting ? 'Menerbitkan...' : 'Selesai' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-gig-page {
  padding: 24px 8px 80px;
  max-width: 880px;
  margin: 0 auto;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Toast */
.toast-wrapper {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100;
}
.toast-slide-enter-active { transition: all 0.3s ease; }
.toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateY(-12px); }
.toast-slide-leave-to { opacity: 0; transform: translateX(20px); }

/* Back */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #374151;
  cursor: pointer;
  margin-bottom: 16px;
  transition: background 0.2s;
}
.back-btn:hover { background: #f3f4f6; }

/* Form Card */
.form-card {
  background: white;
  border-radius: 32px;
  border: 1px solid #f0f0f0;
  padding: 48px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.04);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 36px;
}

/* Field Groups */
.field-group {
  margin-bottom: 28px;
}

.field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1e3a8a;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
}

.field-input {
  width: 100%;
  padding: 14px 20px;
  background: #f8f8fa;
  border: 2px solid transparent;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}
.field-input::placeholder { color: #9ca3af; }
.field-input:focus {
  background: white;
  border-color: #4B6BFB;
}

.field-textarea {
  width: 100%;
  padding: 14px 20px;
  background: #f8f8fa;
  border: 2px solid transparent;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
  min-height: 120px;
  resize: none;
  font-family: inherit;
}
.field-textarea::placeholder { color: #9ca3af; }
.field-textarea:focus {
  background: white;
  border-color: #4B6BFB;
}

/* Select */
.select-wrapper {
  position: relative;
  max-width: 280px;
}

.field-select {
  width: 100%;
  padding: 14px 44px 14px 20px;
  background: #f8f8fa;
  border: 2px solid transparent;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.field-select:focus {
  background: white;
  border-color: #4B6BFB;
}

.select-chevron {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

/* Section Title */
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 20px;
}

/* Tiers Grid */
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.tier-card {
  padding: 28px 20px;
  border-radius: 24px;
  border: 2px solid #e6f0ff;
  background: white;
  transition: all 0.25s ease;
}

.tier-card.highlighted {
  border-color: #4B6BFB;
  background: #f8f9ff;
  box-shadow: 0 4px 24px rgba(75, 107, 251, 0.12);
  transform: scale(1.03);
}

.tier-badge {
  display: inline-block;
  padding: 3px 10px;
  background: #e6f0ff;
  color: #4B6BFB;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.tier-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.price-input-wrap {
  position: relative;
  margin-bottom: 14px;
}

.price-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #9ca3af;
}

.price-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.price-input:focus { border-color: #4B6BFB; }

.tier-features {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.78rem;
  color: #6b7280;
  min-height: 80px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.tier-features:focus { border-color: #4B6BFB; }

/* Upload Zone */
.upload-zone {
  border: 2px dashed #d1ddf5;
  border-radius: 20px;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  cursor: pointer;
  transition: all 0.25s ease;
  gap: 8px;
}
.upload-zone:hover, .upload-zone.dragging {
  border-color: #4B6BFB;
  background: #f0f4ff;
}

.hidden-input { display: none; }

.upload-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
.upload-link {
  color: #4B6BFB;
  font-weight: 700;
  text-decoration: underline;
}

.upload-hint {
  font-size: 0.65rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

/* Uploaded Files */
.uploaded-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.file-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
}

.file-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}
.file-remove:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Footer Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-draft {
  padding: 14px 32px;
  border: 2px solid #4B6BFB;
  color: #4B6BFB;
  background: white;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.btn-draft:hover {
  background: #4B6BFB;
  color: white;
}

.btn-submit {
  padding: 14px 48px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}
.btn-submit:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .form-card { padding: 24px; border-radius: 20px; }
  .tiers-grid { grid-template-columns: 1fr; }
  .tier-card.highlighted { transform: none; }
  .form-actions { flex-direction: column; gap: 12px; }
  .btn-draft, .btn-submit { width: 100%; text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  .tier-card, .btn-submit, .upload-zone, .back-btn {
    transition: none !important;
  }
}
</style>
