<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import api from '../../api/axios'
import { useQueryClient } from '@tanstack/vue-query'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const { uploadFile } = useAuth()
const queryClient = useQueryClient()

const revisionText = ref('')
const isDragging = ref(false)
const isUploading = ref(false)
const rawFiles = ref<File[]>([])
const uploadedFiles = ref<{ name: string; size: string }[]>([])

function goBack() { router.push(`/pesanan/${orderId}`) }

function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging.value = true }
function handleDragLeave() { isDragging.value = false }
function handleDrop(e: DragEvent) {
  e.preventDefault(); isDragging.value = false
  if (e.dataTransfer?.files) {
    Array.from(e.dataTransfer.files).forEach(f => {
      rawFiles.value.push(f)
      uploadedFiles.value.push({ name: f.name, size: (f.size / 1024 / 1024).toFixed(1) + ' MB' })
    })
  }
}
function triggerUpload() {
  const input = document.createElement('input')
  input.type = 'file'; input.multiple = true
  input.accept = '.jpeg,.jpg,.png,.gif,.mp4,.pdf,.psd,.ai,.doc,.docx,.ppt,.pptx'
  input.onchange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (files) Array.from(files).forEach(f => {
      rawFiles.value.push(f)
      uploadedFiles.value.push({ name: f.name, size: (f.size / 1024 / 1024).toFixed(1) + ' MB' })
    })
  }
  input.click()
}
function removeFile(idx: number) {
  uploadedFiles.value.splice(idx, 1)
  rawFiles.value.splice(idx, 1)
}

async function submitRevision() {
  if (!revisionText.value.trim()) {
    alert('Umpan balik revisi tidak boleh kosong.')
    return
  }
  
  isUploading.value = true
  try {
    const fileUrls: string[] = []
    for (const file of rawFiles.value) {
      const uploadRes = await uploadFile(file, 'merchant-assets')
      const fileUrl = uploadRes.url || uploadRes.data?.url
      if (fileUrl) fileUrls.push(fileUrl)
    }
    await api.post(`/orders/${orderId}/request-revision`, {
      message: revisionText.value,
      attachments: fileUrls
    })
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    queryClient.invalidateQueries({ queryKey: ['revisions', orderId] })
    alert('Permintaan revisi berhasil dikirim!')
    router.push(`/pesanan/${orderId}`)
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengirim permintaan revisi. Silakan coba lagi.')
  } finally {
    isUploading.value = false
  }
}

onMounted(() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target) } })
  }, { threshold: 0.08 })
  document.querySelectorAll('.ai').forEach((el) => obs.observe(el))
})
</script>

<template>
<div class="rev">
<div class="rev__inner">
  <button class="rev__back ai" @click="goBack" aria-label="Kembali">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  </button>

  <h1 class="rev__title ai" style="transition-delay:80ms">Permintaan Revisi</h1>
  <p class="rev__desc ai" style="transition-delay:120ms">Berikan umpan balik yang spesifik untuk membantu penyempurnaan proyek Anda. Kejelasan dalam catatan Anda akan mempercepat proses revisi dengan hasil yang berkualitas tinggi.</p>

  <textarea v-model="revisionText" class="rev__textarea ai" style="transition-delay:160ms" placeholder="Jelaskan secara rinci apa saja yang perlu diubah." rows="8"></textarea>

  <h2 class="rev__section-title ai" style="transition-delay:200ms">Kebutuhan Proyek (Requirements)</h2>

  <div
    class="rev__dropzone ai"
    style="transition-delay:240ms"
    :class="{ 'rev__dropzone--active': isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerUpload"
  >
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.6 4.4 0 01-.9-8.8 6 6 0 0111.8 0A4.6 4.4 0 0117 18"/><polyline points="15 13 12 10 9 13"/><line x1="12" y1="10" x2="12" y2="21"/></svg>
    <p>Drag &amp; drop files or <span class="rev__browse">Browse</span></p>
    <small>Supported formates: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT</small>
  </div>

  <!-- Uploaded files -->
  <div v-if="uploadedFiles.length" class="rev__files ai" style="transition-delay:280ms">
    <div v-for="(f, i) in uploadedFiles" :key="i" class="rev__file">
      <span>{{ f.name }} ({{ f.size }})</span>
      <button @click="removeFile(i)" aria-label="Remove">&times;</button>
    </div>
  </div>

  <div class="rev__submit ai" style="transition-delay:320ms">
    <button class="btn-send-revision" :disabled="isUploading" @click="submitRevision">
      {{ isUploading ? 'Mengirim...' : 'Kirim Permintaan Revisi' }}
    </button>
  </div>
</div>
</div>
</template>

<style scoped>
.ai{opacity:0;transform:translateY(20px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}.ai.vis{opacity:1;transform:translateY(0)}
.rev{padding:1.5rem 0 4rem}.rev__inner{max-width:760px;margin:0 auto;padding:0 1.5rem}
.rev__back{background:none;border:none;cursor:pointer;color:#374151;margin-bottom:1rem;padding:0;display:flex;transition:color .2s}.rev__back:hover{color:#3B5BDB}
.rev__title{font-size:1.75rem;font-weight:800;color:#111827;font-style:italic;margin-bottom:.75rem}
.rev__desc{font-size:.9375rem;color:#4B5563;line-height:1.7;margin-bottom:2rem}
.rev__textarea{width:100%;border:1px solid #E5E7EB;border-radius:16px;padding:1.25rem;font-size:.9375rem;color:#374151;resize:vertical;outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
.rev__textarea:focus{border-color:#3B5BDB;box-shadow:0 0 0 3px rgba(59,91,219,.08)}
.rev__textarea::placeholder{color:#9CA3AF}
.rev__section-title{font-size:1.125rem;font-weight:800;color:#111827;margin:2rem 0 1rem}
.rev__dropzone{border:2px dashed #D1D5DB;border-radius:16px;padding:3rem 2rem;text-align:center;cursor:pointer;transition:all .3s}
.rev__dropzone:hover,.rev__dropzone--active{border-color:#3B5BDB;background:#F8FAFF}
.rev__dropzone p{font-size:.9375rem;color:#374151;margin:.75rem 0 .25rem}
.rev__dropzone small{font-size:.75rem;color:#9CA3AF}
.rev__browse{color:#3B5BDB;font-weight:600;text-decoration:underline}
.rev__files{margin-top:1rem;display:flex;flex-direction:column;gap:.5rem}
.rev__file{display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem;border:1px solid #E5E7EB;border-radius:8px;font-size:.8125rem;color:#374151}
.rev__file button{background:none;border:none;font-size:1.25rem;color:#9CA3AF;cursor:pointer}
.rev__submit{display:flex;justify-content:flex-end;margin-top:2rem}
.btn-send-revision{padding:.75rem 2rem;background:#3B5BDB;color:#fff;border:none;border-radius:12px;font-weight:700;font-size:.9375rem;cursor:pointer;transition:all .2s}
.btn-send-revision:hover{background:#2F4DC4;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,91,219,.25)}
@media(prefers-reduced-motion:reduce){.ai{transition:none}}
</style>
