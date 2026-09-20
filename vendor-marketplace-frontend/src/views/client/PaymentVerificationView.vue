<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/axios'

const route = useRoute()
const router = useRouter()
const orderId = Number(route.query.orderId)

const order = ref<any>(null)
const isLoading = ref(true)
const isUploading = ref(false)
const selectedFile = ref<File | null>(null)

// Chat widget
const isChatOpen = ref(false)
const chatMessage = ref('')
const chatMessages = ref([
  { id: 1, sender: 'vendor', name: 'Vendor', avatar: '', text: 'Halo! Mohon tunggu sebentar, kami sedang memproses pesanan Anda.', time: '04:45 PM' }
])

// Upload proof
const showUploadModal = ref(false)

function toggleChat() {
  isChatOpen.value = !isChatOpen.value
}

function sendMessage() {
  if (!chatMessage.value.trim()) return
  chatMessages.value.push({
    id: Date.now(),
    sender: 'user',
    name: 'Pembeli',
    avatar: '',
    text: chatMessage.value.trim(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  })
  chatMessage.value = ''
  // Auto scroll to bottom
  setTimeout(() => {
    const chatBody = document.querySelector('.chat-widget__body')
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight
  }, 50)
}

function goToOrders() {
  router.push('/pesanan')
}

function uploadProof() {
  showUploadModal.value = true
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null
  }
}

async function submitProof() {
  if (!selectedFile.value) {
    alert('Silakan pilih berkas bukti transfer terlebih dahulu.')
    return
  }
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    await api.post(`/orders/${orderId}/upload-payment-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    alert('Bukti transfer berhasil dikirim. Menunggu verifikasi admin finance.')
    showUploadModal.value = false
    selectedFile.value = null
    await fetchOrder()
  } catch (err: any) {
    console.error('Failed to upload proof', err)
    alert(err.response?.data?.message || 'Gagal mengunggah bukti transfer. Silakan coba lagi.')
  } finally {
    isUploading.value = false
  }
}

async function fetchOrder() {
  try {
    const res = await api.get(`/orders/${orderId}`)
    order.value = res.data
  } catch (err) {
    console.error('Failed to fetch order details', err)
  } finally {
    isLoading.value = false
  }
}

let pollInterval: any = null

onMounted(async () => {
  await fetchOrder()
  pollInterval = setInterval(fetchOrder, 4000)

  if (order.value) {
    const reqPlan = order.value.requirements?.plan || 'Standard Plan'
    const reqNotes = order.value.requirements?.notes || 'Tidak ada instruksi khusus.'
    chatMessages.value.push({
      id: Date.now() - 1000,
      sender: 'user',
      name: 'Pembeli',
      avatar: '',
      text: `Halo, saya telah membuat pesanan baru.\n\nDetail Rencana: ${reqPlan}\nCatatan Pembeli: ${reqNotes}`,
      time: new Date(order.value.createdAt || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vis'); observer.unobserve(e.target) } })
  }, { threshold: 0.08 })
  document.querySelectorAll('.ai:not(.vis)').forEach((el) => observer.observe(el))
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

function formatPrice(val: number) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}
</script>

<template>
<div class="pv">
  <div class="pv__inner">
    <!-- Page Title & Stepper -->
    <div class="pv__header ai">
      <h1 class="pv__title">Checkout</h1>
      <nav class="stepper" aria-label="Order steps">
        <span class="stepper__step stepper__step--done">Detail Pesanan</span>
        <span class="stepper__divider">/</span>
        <span class="stepper__step stepper__step--done">Detail Pesanan</span>
        <span class="stepper__divider">/</span>
        <span class="stepper__step stepper__step--active">Verifikasi</span>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="pv__content">
      <div class="verification-card ai vis">
        <div class="vstep__spinner" style="margin: 0 auto; width: 32px; height: 32px;"></div>
        <p style="margin-top: 1rem;">Memuat data pesanan...</p>
      </div>
    </div>

    <!-- Verification Content -->
    <div v-else-if="order" class="pv__content">
      <div class="verification-card ai vis">
        <!-- Animated Icon based on Status -->
        <div class="verification-card__icon-wrapper">
          <div class="verification-card__pulse"></div>
          <div class="verification-card__icon">
            <svg v-if="order.status === 'IN_PROGRESS' || order.status === 'COMPLETED'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2B8A3E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        <h2 class="verification-card__title">
          <span v-if="order.status === 'UNPAID'">Selesaikan Pembayaran Anda</span>
          <span v-else-if="order.status === 'PAID_PENDING_CONFIRMATION'">Menunggu Verifikasi Manual</span>
          <span v-else>Pembayaran Berhasil Dikonfirmasi!</span>
        </h2>
        
        <!-- Show Bank Instructions for UNPAID manual -->
        <div v-if="order.status === 'UNPAID'" class="bank-details" style="margin-bottom: 2rem; background: #EEF2FF; border-radius: 12px; padding: 1.25rem; text-align: left; border: 1px solid #DBE4FF;">
          <h4 style="margin: 0 0 0.5rem; font-weight: 700; color: #1E2A5E; font-size: 0.9375rem;">Informasi Rekening Transfer:</h4>
          <p style="margin: 0.25rem 0; font-size: 0.875rem; color: #374151;">Bank Mandiri: <strong>123-456-7890</strong></p>
          <p style="margin: 0.25rem 0; font-size: 0.875rem; color: #374151;">Atas Nama: <strong>PT Vendor Marketplace</strong></p>
          <p style="margin: 0.5rem 0 0; font-size: 0.9375rem; color: #1E2A5E;">Total Tagihan: <strong style="font-size: 1.1rem; color: #3B5BDB;">{{ formatPrice(order.totalAmount) }}</strong></p>
        </div>

        <p class="verification-card__desc">
          <span v-if="order.status === 'UNPAID'">Silakan lakukan transfer ke rekening di atas dan unggah bukti transfer agar pesanan Anda dapat segera dikerjakan oleh vendor.</span>
          <span v-else-if="order.status === 'PAID_PENDING_CONFIRMATION'">Bukti pembayaran telah diunggah dan sedang diperiksa oleh tim Finance kami. Mohon tunggu beberapa saat.</span>
          <span v-else>Pembayaran Anda telah sukses diverifikasi. Vendor akan segera memulai pengerjaan proyek Anda. Silakan buka halaman detail pesanan.</span>
        </p>

        <!-- Status indicators -->
        <div class="verification-card__steps">
          <!-- Step 1: Dibuat -->
          <div class="vstep vstep--done">
            <div class="vstep__dot">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="vstep__info">
              <span class="vstep__label">Pesanan dibuat</span>
              <span class="vstep__time">ID: #ORD-{{ order.id }}</span>
            </div>
          </div>
          <!-- Step 2: Menunggu / Terkirim -->
          <div class="vstep" :class="{ 'vstep--done': order.status !== 'UNPAID', 'vstep--active': order.status === 'UNPAID' || order.status === 'PAID_PENDING_CONFIRMATION' }">
            <div class="vstep__dot">
              <div v-if="order.status === 'UNPAID' || order.status === 'PAID_PENDING_CONFIRMATION'" class="vstep__spinner"></div>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="vstep__info">
              <span class="vstep__label">
                <span v-if="order.status === 'UNPAID'">Menunggu unggah bukti transfer</span>
                <span v-else-if="order.status === 'PAID_PENDING_CONFIRMATION'">Menunggu verifikasi pembayaran</span>
                <span v-else>Pembayaran terverifikasi</span>
              </span>
              <span class="vstep__time" v-if="order.status === 'PAID_PENDING_CONFIRMATION'">Bukti telah terkirim</span>
              <span class="vstep__time" v-else-if="order.status === 'UNPAID'">Silakan unggah bukti transfer</span>
            </div>
          </div>
          <!-- Step 3: Dikonfirmasi -->
          <div class="vstep" :class="{ 'vstep--done': order.status !== 'UNPAID' && order.status !== 'PAID_PENDING_CONFIRMATION', 'vstep--active': order.status === 'IN_PROGRESS' || order.status === 'COMPLETED' }">
            <div class="vstep__dot">
              <svg v-if="order.status === 'IN_PROGRESS' || order.status === 'COMPLETED' || order.status === 'DELIVERED'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="vstep__info">
              <span class="vstep__label">Pesanan aktif &amp; dikonfirmasi</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="verification-card__actions">
          <button v-if="order.status === 'UNPAID'" class="verification-card__btn-upload" @click="uploadProof">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Unggah Bukti Transfer
          </button>
          
          <router-link v-if="order.status !== 'UNPAID' && order.status !== 'PAID_PENDING_CONFIRMATION'" :to="`/pesanan/${order.id}`" class="verification-card__btn-upload" style="text-align: center; text-decoration: none;">
            Lihat Detail Pesanan
          </router-link>

          <button class="verification-card__btn-orders" @click="goToOrders">
            Lihat Pesanan Saya
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Upload Proof Modal -->
  <Transition name="modal-fade">
    <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="modal">
        <div class="modal__header">
          <h3>Unggah Bukti Transfer</h3>
          <button class="modal__close" @click="showUploadModal = false" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <div class="modal__upload-zone">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p v-if="selectedFile">File terpilih: <strong>{{ selectedFile.name }}</strong></p>
            <p v-else>Pilih atau drag file gambar bukti transfer</p>
            <span>Format: JPG, PNG, PDF (maks 5MB)</span>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" @change="handleFileChange" />
          </div>
        </div>
        <div class="modal__footer">
          <button class="modal__btn-cancel" @click="showUploadModal = false">Batal</button>
          <button class="modal__btn-submit" @click="submitProof" :disabled="isUploading">
            <span v-if="isUploading">Mengirim...</span>
            <span v-else>Kirim Bukti</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Floating Chat Button -->
  <button class="chat-fab" :class="{ 'chat-fab--open': isChatOpen }" @click="toggleChat">
    <svg v-if="!isChatOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    <span v-if="!isChatOpen" class="chat-fab__label">Chat</span>
  </button>

  <!-- Chat Widget -->
  <Transition name="chat-slide">
    <div v-if="isChatOpen" class="chat-widget">
      <div class="chat-widget__header">
        <h3>Chat</h3>
        <button class="chat-widget__close" @click="isChatOpen = false" aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="chat-widget__body">
        <div
          v-for="msg in chatMessages"
          :key="msg.id"
          class="chat-msg"
          :class="{ 'chat-msg--user': msg.sender === 'user', 'chat-msg--vendor': msg.sender === 'vendor' }"
        >
          <!-- Vendor avatar -->
          <div v-if="msg.sender === 'vendor'" class="chat-msg__avatar-wrapper">
            <div class="chat-msg__avatar"></div>
            <span class="chat-msg__name">{{ msg.name }}</span>
          </div>
          <div class="chat-msg__bubble" :class="{ 'chat-msg__bubble--user': msg.sender === 'user' }">
            {{ msg.text }}
          </div>
          <span class="chat-msg__time">{{ msg.time }}</span>
        </div>
      </div>
      <div class="chat-widget__footer">
        <input
          v-model="chatMessage"
          type="text"
          placeholder="Type your message here ..."
          class="chat-widget__input"
          @keydown.enter="sendMessage"
        />
        <button class="chat-widget__send" @click="sendMessage" aria-label="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
      </div>
    </div>
  </Transition>
</div>
</template>

<style scoped>
.ai{opacity:0;transform:translateY(20px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}.ai.vis{opacity:1;transform:translateY(0)}

.pv { padding: 1.5rem 0 4rem; min-height: 100vh; background: #FAFBFC; }
.pv__inner { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }

/* Header */
.pv__header { margin-bottom: 2rem; }
.pv__title {
  font-size: 1.75rem; font-weight: 800; color: #1E2A5E;
  margin: 0 0 0.5rem; letter-spacing: -0.01em;
}

/* Stepper */
.stepper { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
.stepper__step { color: #9CA3AF; font-weight: 500; }
.stepper__step--active { color: #3B5BDB; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.stepper__step--done { color: #6B7280; }
.stepper__divider { color: #D1D5DB; }

/* Content */
.pv__content {
  display: flex; justify-content: center; align-items: center;
  min-height: 60vh; padding: 2rem 0;
}

/* Verification Card */
.verification-card {
  text-align: center; max-width: 560px; width: 100%;
  padding: 3rem 2.5rem;
  background: #fff; border-radius: 24px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.verification-card__icon-wrapper {
  position: relative; width: 96px; height: 96px;
  margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center;
}
.verification-card__pulse {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(59,91,219,0.08);
  animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite;
}
.verification-card__icon {
  position: relative; width: 80px; height: 80px;
  background: #EEF2FF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(0.9); opacity: 0; }
}

.verification-card__title {
  font-size: 1.5rem; font-weight: 800; color: #1E2A5E;
  margin: 0 0 0.75rem; line-height: 1.3;
}
.verification-card__desc {
  font-size: 0.9375rem; color: #64748B; line-height: 1.7;
  margin: 0 0 2rem; max-width: 420px; margin-left: auto; margin-right: auto;
}

/* Verification Steps */
.verification-card__steps {
  display: flex; flex-direction: column; gap: 0; text-align: left;
  max-width: 360px; margin: 0 auto 2rem;
}
.vstep {
  display: flex; align-items: flex-start; gap: 1rem;
  position: relative; padding-bottom: 1.5rem;
}
.vstep:last-child { padding-bottom: 0; }
.vstep:not(:last-child)::before {
  content: ''; position: absolute; left: 13px; top: 28px;
  width: 2px; bottom: 0; background: #E5E7EB;
}
.vstep--done:not(:last-child)::before { background: #3B5BDB; }
.vstep--active:not(:last-child)::before {
  background: linear-gradient(to bottom, #3B5BDB 0%, #E5E7EB 100%);
}

.vstep__dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: #E5E7EB; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.vstep--done .vstep__dot { background: #3B5BDB; }
.vstep--active .vstep__dot {
  background: #EEF2FF; border: 2px solid #3B5BDB;
}

.vstep__spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(59,91,219,0.2);
  border-top-color: #3B5BDB; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.vstep__info { padding-top: 3px; }
.vstep__label { display: block; font-size: 0.875rem; font-weight: 600; color: #111827; }
.vstep--active .vstep__label { color: #3B5BDB; }
.vstep__time { font-size: 0.75rem; color: #9CA3AF; }

/* Actions */
.verification-card__actions {
  display: flex; flex-direction: column; gap: 0.75rem;
  max-width: 320px; margin: 0 auto;
}
.verification-card__btn-upload {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.875rem 1.5rem; background: #1E2A5E; color: #fff;
  border: none; border-radius: 12px; font-weight: 700; font-size: 0.9375rem;
  cursor: pointer; transition: all 0.25s ease;
}
.verification-card__btn-upload:hover {
  background: #2A3A7A; transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(30,42,94,0.25);
}
.verification-card__btn-orders {
  padding: 0.75rem 1.5rem; background: #fff; color: #3B5BDB;
  border: 1.5px solid #3B5BDB; border-radius: 12px;
  font-weight: 600; font-size: 0.9375rem;
  cursor: pointer; transition: all 0.2s;
}
.verification-card__btn-orders:hover { background: #F0F4FF; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; backdrop-filter: blur(4px);
}
.modal {
  background: #fff; border-radius: 20px; width: 100%; max-width: 480px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.15); overflow: hidden;
}
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #F3F4F6;
}
.modal__header h3 { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; }
.modal__close { background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 4px; transition: color 0.2s; }
.modal__close:hover { color: #374151; }
.modal__body { padding: 1.5rem; }
.modal__upload-zone {
  border: 2px dashed #D1D5DB; border-radius: 16px;
  padding: 2rem; text-align: center; position: relative;
  cursor: pointer; transition: all 0.2s;
}
.modal__upload-zone:hover { border-color: #3B5BDB; background: #F0F4FF; }
.modal__upload-zone p { font-size: 0.9375rem; color: #374151; margin: 0.75rem 0 0.25rem; }
.modal__upload-zone span { font-size: 0.75rem; color: #9CA3AF; }
.modal__upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.modal__footer {
  display: flex; gap: 0.75rem; padding: 1rem 1.5rem;
  border-top: 1px solid #F3F4F6;
}
.modal__btn-cancel {
  flex: 1; padding: 0.75rem; border: 1.5px solid #E5E7EB; border-radius: 10px;
  background: #fff; color: #374151; font-weight: 600; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s;
}
.modal__btn-cancel:hover { border-color: #374151; }
.modal__btn-submit {
  flex: 1; padding: 0.75rem; border: none; border-radius: 10px;
  background: #3B5BDB; color: #fff; font-weight: 600; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s;
}
.modal__btn-submit:hover { background: #2F4DC4; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal, .modal-fade-leave-to .modal { transform: scale(0.95); }

/* Floating Chat Button */
.chat-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 150;
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.875rem 1.25rem; background: #1E2A5E; color: #fff;
  border: none; border-radius: 9999px; cursor: pointer;
  box-shadow: 0 4px 20px rgba(30,42,94,0.3);
  transition: all 0.3s ease;
}
.chat-fab:hover { background: #2A3A7A; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(30,42,94,0.4); }
.chat-fab--open { border-radius: 50%; padding: 0.875rem; background: #DC2626; }
.chat-fab--open:hover { background: #B91C1C; }
.chat-fab__label { font-size: 0.875rem; font-weight: 600; }

/* Chat Widget */
.chat-widget {
  position: fixed; bottom: 80px; right: 24px; z-index: 150;
  width: 380px; max-height: 520px;
  background: #fff; border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
  overflow: hidden; border: 1px solid #E5E7EB;
}
.chat-widget__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid #F3F4F6;
}
.chat-widget__header h3 { font-size: 1rem; font-weight: 700; color: #1E2A5E; margin: 0; }
.chat-widget__close { background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 4px; }
.chat-widget__close:hover { color: #374151; }

.chat-widget__body {
  flex: 1; overflow-y: auto; padding: 1rem 1.25rem;
  display: flex; flex-direction: column; gap: 1rem;
  max-height: 350px;
}

/* Chat Messages */
.chat-msg { display: flex; flex-direction: column; }
.chat-msg--user { align-items: flex-end; }
.chat-msg--vendor { align-items: flex-start; }

.chat-msg__avatar-wrapper {
  display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.375rem;
}
.chat-msg__avatar {
  width: 28px; height: 28px; border-radius: 50%; background: #E5E7EB;
  flex-shrink: 0;
}
.chat-msg__name { font-size: 0.8125rem; font-weight: 600; color: #1E2A5E; }

.chat-msg__bubble {
  padding: 0.75rem 1rem; border-radius: 16px;
  font-size: 0.8125rem; line-height: 1.5; max-width: 85%;
  white-space: pre-line;
}
.chat-msg--vendor .chat-msg__bubble {
  background: #F3F4F6; color: #374151;
  border-bottom-left-radius: 4px;
}
.chat-msg__bubble--user {
  background: linear-gradient(135deg, #3B5BDB, #5B7FFF); color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-msg__time {
  font-size: 0.6875rem; color: #9CA3AF; margin-top: 0.25rem;
}

/* Chat Footer */
.chat-widget__footer {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1rem; border-top: 1px solid #F3F4F6;
}
.chat-widget__input {
  flex: 1; padding: 0.625rem 1rem;
  border: 1px solid #E5E7EB; border-radius: 9999px;
  font-size: 0.8125rem; color: #374151;
  outline: none; transition: border-color 0.2s;
}
.chat-widget__input::placeholder { color: #9CA3AF; }
.chat-widget__input:focus { border-color: #3B5BDB; }
.chat-widget__send {
  width: 36px; height: 36px; background: #3B5BDB; color: #fff;
  border: none; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.chat-widget__send:hover { background: #2F4DC4; transform: scale(1.05); }
.chat-widget__send svg { stroke: #fff; }

/* Chat slide animation */
.chat-slide-enter-active { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
.chat-slide-leave-active { transition: all 0.2s ease-in; }
.chat-slide-enter-from { opacity: 0; transform: translateY(16px) scale(0.95); }
.chat-slide-leave-to { opacity: 0; transform: translateY(8px) scale(0.98); }

@media (max-width: 640px) {
  .pv__title { font-size: 1.375rem; }
  .verification-card { padding: 2rem 1.25rem; }
  .verification-card__title { font-size: 1.25rem; }
  .chat-widget { width: calc(100vw - 32px); right: 16px; bottom: 72px; }
  .chat-fab { right: 16px; bottom: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .ai { transition: none; }
  .verification-card__pulse { animation: none; }
  .vstep__spinner { animation: none; }
}
</style>
