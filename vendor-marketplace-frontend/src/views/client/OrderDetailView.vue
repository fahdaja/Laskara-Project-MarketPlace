<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/axios'
import { useOrderById, useCompleteOrder, useSubmitReview } from '../../composables/useOrders'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string

const { data: rawOrder, isLoading: isQueryLoading } = useOrderById(orderId)
const isProcessing = ref(false)
const isLoading = computed(() => isQueryLoading.value || isProcessing.value)

const order = computed(() => {
  if (!rawOrder.value) return null
  return {
    ...rawOrder.value,
    instructions: rawOrder.value.requirements?.notes || 'Tidak ada instruksi khusus dari pembeli.',
    planName: rawOrder.value.requirements?.plan || 'Standard Plan',
    chosenPrice: rawOrder.value.requirements?.price || rawOrder.value.totalAmount,
    requirementsFile: rawOrder.value.requirements?.files || null
  }
})

const status = computed(() => {
  if (!order.value || !order.value.status) return ''
  const s = order.value.status
  if (s === 'IN_PROGRESS' || s === 'IN_REVISION' || s === 'DISPUTE_IN_PROGRESS') {
    return 'in-progress'
  } else if (s === 'DELIVERED') {
    return 'delivered'
  } else if (s === 'COMPLETED') {
    return 'completed'
  } else {
    return s.toLowerCase()
  }
})

const countdown = ref({ days: '00', hours: '00', minutes: '00' })
const deadline = ref('')

const rating = ref(5)
const reviewText = ref('')
const selectedTip = ref('10%')
const tipOptions = ['5%', '10%', '15%', 'Kustom']

const completeOrderMutation = useCompleteOrder()
const submitReviewMutation = useSubmitReview()

function getFilename(url: string) {
  if (!url) return ''
  try {
    const parts = url.split('/')
    const last = parts[parts.length - 1]
    if (!last) return 'deliverable'
    return decodeURIComponent(last.split('?')[0] || '')
  } catch (e) {
    return 'deliverable'
  }
}

function getFileExtension(url: string) {
  const filename = getFilename(url)
  const dotIdx = filename.lastIndexOf('.')
  return dotIdx !== -1 ? filename.substring(dotIdx + 1).toUpperCase() : 'FILE'
}

function formatPrice(val: any) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

let timerInterval: any = null
function startCountdown(targetDate: Date) {
  if (timerInterval) clearInterval(timerInterval)
  
  function update() {
    const now = new Date().getTime()
    const dist = targetDate.getTime() - now
    if (dist < 0) {
      countdown.value = { days: '00', hours: '00', minutes: '00' }
      clearInterval(timerInterval)
      return
    }
    
    const days = Math.floor(dist / (1000 * 60 * 60 * 24))
    const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))
    
    countdown.value = {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0')
    }
  }
  
  update()
  timerInterval = setInterval(update, 60000)
}

watch(() => order.value?.deadline, (newVal) => {
  if (newVal) {
    deadline.value = formatDate(newVal)
    startCountdown(new Date(newVal))
  }
}, { immediate: true })

watch(() => order.value?.review, (newVal) => {
  if (newVal) {
    rating.value = newVal.rating
    reviewText.value = newVal.comment || ''
  }
}, { immediate: true })

async function completeOrder() {
  try {
    isProcessing.value = true
    await completeOrderMutation.mutateAsync(orderId)
    alert('Pesanan berhasil diselesaikan!')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyelesaikan pesanan.')
  } finally {
    isProcessing.value = false
  }
}

async function downloadInvoice() {
  try {
    const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoice-order-${orderId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Failed to download invoice', err)
    alert('Gagal mengunduh invoice.')
  }
}

async function submitReview() {
  try {
    isProcessing.value = true
    await submitReviewMutation.mutateAsync({
      orderId: Number(orderId),
      rating: rating.value,
      comment: reviewText.value
    })
    alert('Ulasan berhasil dikirim!')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengirim ulasan.')
  } finally {
    isProcessing.value = false
  }
}

function initObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target) } })
  }, { threshold: 0.08 })
  document.querySelectorAll('.ai:not(.vis)').forEach((el) => obs.observe(el))
}

function goBack() { router.push('/pesanan') }
function goRevision() { router.push(`/pesanan/${orderId}/revisi`) }

onMounted(() => {
  initObserver()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
<div class="od">
<div class="od__inner">
  <!-- Back -->
  <button class="od__back ai" @click="goBack" aria-label="Kembali">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  </button>

  <div v-if="isLoading" class="p-8 text-center bg-white rounded-xl border border-gray-150">
    <p class="text-gray-500 text-sm">Memuat detail pesanan...</p>
  </div>

  <div v-else-if="!order" class="p-8 text-center bg-white rounded-xl border border-gray-150">
    <p class="text-gray-500 text-sm">Pesanan tidak ditemukan.</p>
  </div>

  <template v-else>
    <!-- ============ IN PROGRESS ============ -->
    <template v-if="status === 'in-progress'">
      <!-- Revision Banner if status is IN_REVISION -->
      <div v-if="order?.status === 'IN_REVISION'" class="delivery-banner ai" style="background: linear-gradient(135deg, #DC2626, #EF4444); margin-bottom: 2rem; border-radius: 16px; padding: 1.5rem 2rem; color: #fff;">
        <div class="delivery-banner__left">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <h2>Permintaan Revisi Terkirim</h2>
            <p>Umpan balik revisi Anda telah dikirimkan ke vendor. Menunggu vendor mengirimkan hasil pekerjaan baru.</p>
          </div>
        </div>
      </div>

      <h1 class="od__title ai" style="transition-delay:80ms">{{ order?.gig?.title || 'Pembuatan Brand Identity & Logo' }}</h1>
      <div class="od__grid">
        <div>
          <div class="status-card ai" style="transition-delay:160ms">
            <div class="status-card__icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h2 class="status-card__heading">SEDANG DALAM PROSES</h2>
            <p class="status-card__desc">Saat ini vendor kami sedang dalam tahap pengerjaan pesanan Anda. Kami memastikan setiap detail sesuai dengan arahan awal yang Anda berikan.</p>
          </div>

          <!-- Files Card (Deliverables) -->
          <div v-if="order?.deliverables?.length" class="files-card ai" style="margin-top: 1.5rem; transition-delay:200ms">
            <h3>File Hasil Kerja (Sebelumnya)</h3>
            <div v-for="f in order?.deliverables" :key="f.id" class="file-row">
              <div class="file-row__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="file-row__info">
                <strong>{{ getFilename(f.fileUrl) }}</strong>
                <span>Format: {{ getFileExtension(f.fileUrl) }} &nbsp; Pesan: {{ f.message || '-' }}</span>
              </div>
              <a :href="f.fileUrl" target="_blank" download class="file-row__dl" aria-label="Download">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>
            </div>
          </div>

          <!-- Revision History Card -->
          <div v-if="order?.revisionHistory?.length" class="files-card ai" style="margin-top: 1.5rem; transition-delay:220ms">
            <h3>Riwayat Revisi</h3>
            <div v-for="(rev, idx) in order.revisionHistory" :key="idx" class="revision-log-row" style="border-left: 3px solid #DC2626; padding-left: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #DC2626;">{{ rev.label }}</span>
                <span style="font-size: 0.75rem; color: #9CA3AF;">{{ rev.time }}</span>
              </div>
              <p style="font-size: 0.875rem; color: #374151; margin: 0 0 0.5rem 0;">{{ rev.message }}</p>
              <div v-if="rev.attachments && rev.attachments.length" style="display: flex; flex-direction: column; gap: 0.25rem;">
                <span style="font-size: 0.75rem; font-weight: 600; color: #4B5563;">File Referensi:</span>
                <div v-for="att in rev.attachments" :key="att" class="file-row" style="padding: 0.5rem; margin-bottom: 0.5rem;">
                  <div class="file-row__icon" style="width: 28px; height: 28px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="file-row__info">
                    <strong style="font-size: 0.75rem;">{{ getFilename(att) }}</strong>
                  </div>
                  <a :href="att" target="_blank" download class="file-row__dl" style="padding: 2px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="side-cards">
          <div class="timer-card ai" style="transition-delay:240ms">
            <div class="timer-card__label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              SISA WAKTU PENGERJAAN
            </div>
            <div class="timer-card__boxes">
              <div class="tbox"><span>{{ countdown.days }}</span><small>HARI</small></div>
              <div class="tbox"><span>{{ countdown.hours }}</span><small>JAM</small></div>
              <div class="tbox"><span>{{ countdown.minutes }}</span><small>MENIT</small></div>
            </div>
            <p class="timer-card__deadline">Deadline: {{ deadline }}</p>
          </div>
          <div class="cancel-card ai" style="transition-delay:320ms">
            <div class="cancel-card__header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <strong>Kebijakan Pembatalan</strong>
            </div>
            <p>Pembatalan langsung tidak tersedia selama pesanan dalam tahap pengerjaan aktif untuk menghargai waktu vendor.</p>
            <button class="cancel-card__btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Hubungi Customer Service
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ DELIVERED ============ -->
    <template v-if="status === 'delivered'">
      <div class="delivery-banner ai" style="transition-delay:80ms">
        <div class="delivery-banner__left">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <h2>Pesanan Dikirim!</h2>
            <p>Vendor telah mengirimkan hasil kerja. Cek hasil kerjamu di bawah ini.</p>
          </div>
        </div>
        <span class="delivery-banner__badge">Menunggu Review</span>
      </div>
      <div class="od__grid">
        <div>
          <div class="files-card ai" style="transition-delay:160ms">
            <h3>File Hasil Kerja</h3>
            <div v-for="f in order?.deliverables" :key="f.id" class="file-row">
              <div class="file-row__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="file-row__info">
                <strong>{{ getFilename(f.fileUrl) }}</strong>
                <span>Format: {{ getFileExtension(f.fileUrl) }} &nbsp; Pesan: {{ f.message || '-' }}</span>
              </div>
              <a :href="f.fileUrl" target="_blank" download class="file-row__dl" aria-label="Download">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>
            </div>
            <div v-if="!order?.deliverables?.length" class="text-gray-400 text-sm">
              Belum ada berkas terkirim.
            </div>
          </div>

          <!-- Revision History Card -->
          <div v-if="order?.revisionHistory?.length" class="files-card ai" style="margin-top: 1.5rem; transition-delay:200ms">
            <h3>Riwayat Revisi</h3>
            <div v-for="(rev, idx) in order.revisionHistory" :key="idx" class="revision-log-row" style="border-left: 3px solid #DC2626; padding-left: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #DC2626;">{{ rev.label }}</span>
                <span style="font-size: 0.75rem; color: #9CA3AF;">{{ rev.time }}</span>
              </div>
              <p style="font-size: 0.875rem; color: #374151; margin: 0 0 0.5rem 0;">{{ rev.message }}</p>
              <div v-if="rev.attachments && rev.attachments.length" style="display: flex; flex-direction: column; gap: 0.25rem;">
                <span style="font-size: 0.75rem; font-weight: 600; color: #4B5563;">File Referensi:</span>
                <div v-for="att in rev.attachments" :key="att" class="file-row" style="padding: 0.5rem; margin-bottom: 0.5rem;">
                  <div class="file-row__icon" style="width: 28px; height: 28px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="file-row__info">
                    <strong style="font-size: 0.75rem;">{{ getFilename(att) }}</strong>
                  </div>
                  <a :href="att" target="_blank" download class="file-row__dl" style="padding: 2px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="shipment-card ai" style="transition-delay:240ms">
          <h3>Detail Pengiriman</h3>
          <div class="shipment-row"><span>ID Pesanan</span><strong>#ORD-{{ order?.id }}</strong></div>
          <div class="shipment-row"><span>Waktu Kirim</span><strong>{{ formatDate(order?.deliveredAt) }}</strong></div>
        </div>
      </div>
      <div class="delivery-actions ai" style="transition-delay:320ms">
        <button class="btn-revision" @click="goRevision">Minta Revisi</button>
        <button class="btn-accept" @click="completeOrder">Terima Pesanan</button>
      </div>
    </template>

    <!-- ============ COMPLETED ============ -->
    <template v-if="status === 'completed'">
      <div class="complete-banner ai" style="transition-delay:80ms">
        <div class="complete-banner__left">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <small>STATUS: SELESAI</small>
            <h2>Dana telah dicairkan ke vendor</h2>
            <p>Pesanan Anda #ORD-{{ order?.id }} telah diselesaikan. Transaksi telah diamankan dan vendor sudah diberitahu.</p>
          </div>
        </div>
        <div class="complete-banner__total">
          <small>TOTAL</small>
          <strong>{{ formatPrice(order?.totalAmount) }}</strong>
        </div>
      </div>
      <div class="od__grid">
        <div class="review-section">
          <!-- Show review form or submitted review -->
          <div class="review-card ai" style="transition-delay:160ms">
            <template v-if="!order?.review">
              <h3>Beri tahu kami pengalaman Anda</h3>
              <label class="review-label">Tingkat Kepuasan</label>
              <div class="stars">
                <svg v-for="s in 5" :key="s" width="28" height="28" viewBox="0 0 24 24" :fill="s <= rating ? '#3B5BDB' : 'none'" :stroke="s <= rating ? '#3B5BDB' : '#D1D5DB'" stroke-width="2" @click="rating = s" style="cursor:pointer"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <label class="review-label">Bagikan pengalaman Anda</label>
              <textarea v-model="reviewText" placeholder="Jelaskan kualitas layanan, komunikasi, dan hasil pengerjaan..." rows="4"></textarea>
              <div class="review-actions">
                <button class="btn-submit-review" @click="submitReview">Kirim Ulasan</button>
                <button class="btn-skip" @click="goBack">Kembali</button>
              </div>
            </template>
            <template v-else>
              <h3>Ulasan Anda</h3>
              <div class="stars" style="margin-bottom: 0.5rem;">
                <svg v-for="s in 5" :key="s" width="22" height="22" viewBox="0 0 24 24" :fill="s <= rating ? '#3B5BDB' : 'none'" :stroke="s <= rating ? '#3B5BDB' : '#D1D5DB'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <p class="text-sm text-gray-700 italic">"{{ reviewText || 'Tidak ada komentar ulasan.' }}"</p>
            </template>
          </div>

          <!-- Files Card (Deliverables) in Completed View -->
          <div v-if="order?.deliverables?.length" class="files-card ai" style="transition-delay:200ms">
            <h3>File Hasil Kerja</h3>
            <div v-for="f in order?.deliverables" :key="f.id" class="file-row">
              <div class="file-row__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="file-row__info">
                <strong>{{ getFilename(f.fileUrl) }}</strong>
                <span>Format: {{ getFileExtension(f.fileUrl) }} &nbsp; Pesan: {{ f.message || '-' }}</span>
              </div>
              <a :href="f.fileUrl" target="_blank" download class="file-row__dl" aria-label="Download">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>
            </div>
          </div>

          <div class="tip-card ai" style="transition-delay:240ms">
            <h3>🎉 Beri Tip</h3>
            <p>Berikan apresiasi atas layanan yang luar biasa dengan menambahkan tip untuk tim vendor.</p>
            <div class="tip-options">
              <button v-for="t in tipOptions" :key="t" class="tip-btn" :class="{ 'tip-btn--active': selectedTip === t }" @click="selectedTip = t">{{ t }}</button>
            </div>
          </div>
        </div>
        <div class="summary-section">
          <div class="summary-card ai" style="transition-delay:160ms">
            <div class="summary-card__header">Ringkasan Pesanan</div>
            <div class="summary-card__body">
              <h4>{{ order?.gig?.title }}</h4>
              <div class="summary-row muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Vendor: {{ order?.merchant?.shopName }}
              </div>
              <div class="summary-row"><span>Subtotal Jasa</span><span>{{ formatPrice(Number(order?.totalAmount) - Number(order?.adminFee || 0)) }}</span></div>
              <div class="summary-row"><span>Biaya Layanan</span><span>{{ formatPrice(order?.adminFee) }}</span></div>
              <div class="summary-row total"><span>Total Harga</span><strong>{{ formatPrice(order?.totalAmount) }}</strong></div>
              <button class="btn-pay" disabled style="background-color: #6B7280; cursor: not-allowed;">Pesanan Selesai</button>
            </div>
          </div>
          <div class="invoice-card ai" style="transition-delay:240ms; cursor: pointer" @click="downloadInvoice">
            <div class="invoice-card__inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div><strong>Unduh Invoice</strong><small>PDF Resmi</small></div>
            </div>
            <button aria-label="Download invoice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>
      </div>
    </template>
  </template>
</div>
</div>
</template>

<style scoped>
.ai{opacity:0;transform:translateY(20px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}.ai.vis{opacity:1;transform:translateY(0)}
.od{padding:1.5rem 0 4rem}.od__inner{max-width:1120px;margin:0 auto;padding:0 1.5rem}
.od__back{background:none;border:none;cursor:pointer;color:#374151;margin-bottom:1rem;padding:0;display:flex;transition:color .2s}.od__back:hover{color:#3B5BDB}
.od__title{font-size:1.75rem;font-weight:800;color:#111827;margin-bottom:2rem}
.od__grid{display:grid;grid-template-columns:1fr 340px;gap:2rem;align-items:start}
.od__debug{display:flex;gap:.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
.od__debug button{padding:.375rem .75rem;border:1px solid #E5E7EB;border-radius:6px;background:#fff;font-size:.75rem;cursor:pointer;transition:all .2s}
.od__debug button.active{background:#3B5BDB;color:#fff;border-color:#3B5BDB}

/* IN PROGRESS */
.status-card{background:linear-gradient(135deg,#F0F4FF,#F8FAFC);border:1px solid #E2E8F0;border-radius:16px;padding:2.5rem;text-align:center}
.status-card__icon{margin-bottom:1rem;opacity:.4}
.status-card__heading{font-size:1.125rem;font-weight:800;color:#1E2A5E;margin-bottom:.75rem;letter-spacing:.05em}
.status-card__desc{font-size:.875rem;color:#64748B;line-height:1.6;max-width:360px;margin:0 auto}
.timer-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:1.5rem;margin-bottom:1rem}
.timer-card__label{display:flex;align-items:center;gap:.5rem;font-size:.75rem;font-weight:700;color:#111827;letter-spacing:.04em;margin-bottom:1rem}
.timer-card__boxes{display:flex;gap:.75rem;margin-bottom:.75rem}
.tbox{flex:1;text-align:center;border:1px solid #E5E7EB;border-radius:8px;padding:.75rem .5rem}
.tbox span{display:block;font-size:1.5rem;font-weight:800;color:#111827}
.tbox small{font-size:.625rem;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em}
.timer-card__deadline{font-size:.75rem;color:#9CA3AF}
.cancel-card{background:#FEF2F2;border:1px solid #FECACA;border-radius:16px;padding:1.25rem}
.cancel-card__header{display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;color:#DC2626;font-size:.875rem}
.cancel-card p{font-size:.8125rem;color:#6B7280;line-height:1.5;margin:0 0 .75rem}
.cancel-card__btn{display:flex;align-items:center;gap:.375rem;background:none;border:none;color:#DC2626;font-size:.8125rem;font-weight:600;cursor:pointer;padding:0;transition:opacity .2s}
.cancel-card__btn:hover{opacity:.7}

/* DELIVERED */
.delivery-banner{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#3B5BDB,#5B7FFF);border-radius:16px;padding:1.5rem 2rem;margin-bottom:2rem;color:#fff}
.delivery-banner__left{display:flex;align-items:center;gap:1rem}
.delivery-banner__left h2{font-size:1.25rem;font-weight:700;margin:0}
.delivery-banner__left p{font-size:.8125rem;opacity:.85;margin:.25rem 0 0}
.delivery-banner__badge{background:#FFF7ED;color:#EA580C;font-size:.75rem;font-weight:600;padding:.25rem .75rem;border-radius:9999px}
.files-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:1.5rem}
.files-card h3{font-size:1rem;font-weight:700;color:#111827;margin:0 0 1rem}
.file-row{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:.75rem}
.file-row__icon{width:36px;height:36px;background:#EEF2FF;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.file-row__info{flex:1}.file-row__info strong{display:block;font-size:.875rem;color:#111827}.file-row__info span{font-size:.75rem;color:#9CA3AF}
.file-row__dl{background:none;border:none;cursor:pointer;padding:4px;transition:opacity .2s}.file-row__dl:hover{opacity:.6}
.shipment-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:1.5rem}
.shipment-card h3{font-size:1rem;font-weight:700;color:#111827;margin:0 0 1rem}
.shipment-row{display:flex;justify-content:space-between;padding:.5rem 0;font-size:.875rem}
.shipment-row span{color:#6B7280}.shipment-row strong{color:#111827}
.delivery-actions{display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem}
.btn-revision{padding:.75rem 2rem;border:2px solid #DC2626;color:#DC2626;background:#fff;border-radius:12px;font-weight:600;font-size:.9375rem;cursor:pointer;transition:all .2s}
.btn-revision:hover{background:#FEF2F2}
.btn-accept{padding:.75rem 2rem;background:#3B5BDB;color:#fff;border:none;border-radius:12px;font-weight:600;font-size:.9375rem;cursor:pointer;transition:all .2s}
.btn-accept:hover{background:#2F4DC4;transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,91,219,.25)}

/* COMPLETED */
.complete-banner{display:flex;align-items:center;justify-content:space-between;background:#1E2A5E;border-radius:16px;padding:2rem;margin-bottom:2rem;color:#fff}
.complete-banner__left{display:flex;align-items:flex-start;gap:1rem}
.complete-banner__left small{font-size:.6875rem;font-weight:600;letter-spacing:.05em;opacity:.7;display:block;margin-bottom:.25rem}
.complete-banner__left h2{font-size:1.25rem;font-weight:700;margin:0 0 .25rem}
.complete-banner__left p{font-size:.8125rem;opacity:.7;margin:0}
.complete-banner__total{background:rgba(255,255,255,.1);border-radius:12px;padding:1rem 1.5rem;text-align:center}
.complete-banner__total small{font-size:.625rem;font-weight:600;opacity:.6;display:block;margin-bottom:.25rem}
.complete-banner__total strong{font-size:1.5rem;font-weight:800}

.review-section{display:flex;flex-direction:column;gap:1.5rem}
.review-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:1.5rem}
.review-card h3{font-size:1.125rem;font-weight:700;color:#111827;margin:0 0 1rem}
.review-label{font-size:.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:.5rem}
.stars{display:flex;gap:.25rem;margin-bottom:1rem}
.review-card textarea{width:100%;border:1px solid #E5E7EB;border-radius:12px;padding:.75rem 1rem;font-size:.875rem;color:#374151;resize:vertical;outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
.review-card textarea:focus{border-color:#3B5BDB}
.review-card textarea::placeholder{color:#9CA3AF}
.review-actions{display:flex;align-items:center;gap:1rem;margin-top:1rem}
.btn-submit-review{padding:.625rem 1.5rem;background:#3B5BDB;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:.875rem;cursor:pointer;transition:all .2s}
.btn-submit-review:hover{background:#2F4DC4}
.btn-skip{background:none;border:none;color:#6B7280;font-size:.875rem;cursor:pointer}
.tip-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:1.5rem}
.tip-card h3{font-size:1rem;font-weight:700;color:#111827;margin:0 0 .5rem}
.tip-card p{font-size:.8125rem;color:#6B7280;line-height:1.5;margin:0 0 1rem}
.tip-options{display:flex;gap:.75rem}
.tip-btn{padding:.5rem 1.25rem;border:1.5px solid #E5E7EB;border-radius:9999px;background:#fff;font-size:.875rem;font-weight:500;color:#374151;cursor:pointer;transition:all .2s}
.tip-btn--active{border-color:#3B5BDB;background:#3B5BDB;color:#fff}
.tip-btn:hover:not(.tip-btn--active){border-color:#3B5BDB;color:#3B5BDB}

.summary-section{display:flex;flex-direction:column;gap:1rem}
.summary-card{border-radius:16px;overflow:hidden;border:1px solid #E5E7EB}
.summary-card__header{background:#3B5BDB;color:#fff;padding:1rem 1.5rem;font-weight:700;font-size:1rem}
.summary-card__body{padding:1.5rem}
.summary-card__body h4{font-size:.9375rem;font-weight:700;color:#111827;margin:0 0 .5rem}
.summary-row{display:flex;justify-content:space-between;font-size:.875rem;color:#374151;padding:.375rem 0}
.summary-row.muted{color:#6B7280;font-size:.8125rem;gap:.375rem;align-items:center;justify-content:flex-start}
.summary-row.total{border-top:1px solid #E5E7EB;margin-top:.5rem;padding-top:.75rem}
.summary-row.total strong{color:#3B5BDB;font-size:1.25rem}
.btn-pay{width:100%;padding:.75rem;background:#3B5BDB;color:#fff;border:none;border-radius:12px;font-weight:700;font-size:.9375rem;cursor:pointer;margin-top:1rem;transition:all .2s}
.btn-pay:hover{background:#2F4DC4}
.invoice-card{background:#1E2A5E;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;color:#fff}
.invoice-card__inner{display:flex;align-items:center;gap:.75rem}
.invoice-card__inner strong{display:block;font-size:.875rem}
.invoice-card__inner small{font-size:.75rem;opacity:.6}
.invoice-card button{background:none;border:none;cursor:pointer;padding:4px}

@media(max-width:900px){.od__grid{grid-template-columns:1fr}.side-cards{order:2}}
@media(max-width:640px){.delivery-banner{flex-direction:column;gap:1rem;align-items:flex-start}.complete-banner{flex-direction:column;gap:1rem;align-items:flex-start}.delivery-actions{flex-direction:column}.btn-revision,.btn-accept{width:100%;text-align:center}}
@media(prefers-reduced-motion:reduce){.ai{transition:none}}
</style>
