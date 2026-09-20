<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/axios'
import { useQuery } from '@tanstack/vue-query'

const route = useRoute()
const router = useRouter()
const productId = route.params.id

// Query params from OrderConfirmation
const planName = computed(() => {
  const p = route.query.plan as string || 'standard'
  return p.charAt(0).toUpperCase() + p.slice(1)
})
const chosenPrice = computed(() => {
  return parseFloat(route.query.price as string || '0')
})
const notes = computed(() => route.query.notes as string || '')
const files = computed(() => route.query.files as string || '')

const gig = ref<any>(null)
const isLoading = ref(true)
const isProcessing = ref(false)

const configQuery = useQuery({
  queryKey: ['systemConfigs'],
  queryFn: async () => {
    const res = await api.get('/system-config')
    return res.data
  },
  staleTime: 1000 * 60 * 10
})

const serviceFee = computed(() => {
  if (!configQuery.data.value) return 25000
  const configs = configQuery.data.value
  const entry = Array.isArray(configs)
    ? configs.find((c: any) => c.key === 'service_fee')
    : configs['service_fee']
  return entry ? Number(entry.value || entry) : 25000
})

const bankMethods = computed(() => {
  if (!configQuery.data.value) return banks
  const configs = configQuery.data.value
  const entry = Array.isArray(configs)
    ? configs.find((c: any) => c.key === 'payment_va_banks')
    : configs['payment_va_banks']
  
  if (!entry) return banks
  try {
    const val = typeof entry.value === 'string' ? JSON.parse(entry.value) : (entry.value || entry)
    if (Array.isArray(val)) return val
  } catch (_) {}
  return banks
})

const totalPrice = computed(() => chosenPrice.value + serviceFee.value)

// Payment method
type PaymentMethod = 'va' | 'qris' | 'manual'
const selectedPayment = ref<PaymentMethod>('va')

// VA Banks for Midtrans representation
const selectedBank = ref('bca')
const banks = [
  { id: 'bca', name: 'BCA', logo: '🏦' },
  { id: 'mandiri', name: 'Mandiri', logo: '🏦' },
  { id: 'bni', name: 'BNI', logo: '🏦' },
  { id: 'bri', name: 'BRI', logo: '🏦' },
]

// QRIS Wallets
const qrisWallets = ['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja']

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

// Load Midtrans snap.js dynamically
function loadSnapScript(clientKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).snap) {
      resolve((window as any).snap)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    script.onload = () => resolve((window as any).snap)
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

async function fetchGigDetails() {
  try {
    isLoading.value = true
    const res = await api.get(`/gigs/details/${productId}`)
    gig.value = res.data
  } catch (err) {
    console.error('Failed to load gig details', err)
  } finally {
    isLoading.value = false
  }
}

async function processPayment() {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    const existingOrderId = route.query.orderId ? Number(route.query.orderId) : null
    let orderId = existingOrderId

    if (!orderId) {
      // 1. Create order in Backend
      const orderRes = await api.post('/orders', { gigId: Number(productId) })
      orderId = orderRes.data.id

      // 2. Create chat channel
      try {
        await api.post('/chat/create-channel', { gigId: Number(productId) })
      } catch (chatErr) {
        console.warn('Failed to auto-create Stream Chat channel', chatErr)
      }
    }

    // 3. Send requirements metadata to order
    try {
      await api.patch(`/orders/${orderId}/requirements`, {
        plan: planName.value,
        price: chosenPrice.value,
        notes: notes.value || 'Tidak ada catatan.',
        files: files.value || ''
      })
    } catch (reqErr) {
      console.warn('Failed to save order requirements', reqErr)
    }

    // 4. Handle based on payment method
    if (selectedPayment.value === 'manual') {
      // Direct redirect to manual verification
      router.push(`/jelajahi/${productId}/verifikasi?orderId=${orderId}&method=manual`)
    } else {
      // Midtrans Snap flow
      const initPaymentRes = await api.post(`/orders/${orderId}/initiate-payment`)
      const { snapToken, clientKey } = initPaymentRes.data

      const snap = await loadSnapScript(clientKey)
      snap.pay(snapToken, {
        onSuccess: (_result: any) => {
          router.push(`/jelajahi/${productId}/verifikasi?orderId=${orderId}&status=success`)
        },
        onPending: (_result: any) => {
          router.push(`/jelajahi/${productId}/verifikasi?orderId=${orderId}&status=pending`)
        },
        onError: (_result: any) => {
          alert('Pembayaran Midtrans gagal atau dibatalkan.')
          isProcessing.value = false
        },
        onClose: () => {
          console.log('Customer closed payment popup')
          isProcessing.value = false
        }
      })
    }
  } catch (err: any) {
    console.error('Checkout failed', err)
    alert(err.response?.data?.message || 'Terjadi kesalahan saat memproses checkout.')
    isProcessing.value = false
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
<div class="co">
  <div class="co__inner">
    <!-- Page Title & Stepper -->
    <div class="co__header ai">
      <h1 class="co__title">Checkout</h1>
      <nav class="stepper" aria-label="Order steps">
        <router-link :to="{ name: 'OrderConfirmation', params: { id: productId } }" class="stepper__step stepper__step--done">Detail Pesanan</router-link>
        <span class="stepper__divider">/</span>
        <span class="stepper__step stepper__step--active">Pembayaran</span>
        <span class="stepper__divider">/</span>
        <span class="stepper__step">Verifikasi</span>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat konfigurasi checkout...</p>
    </div>

    <div v-else class="co__grid">
      <!-- Left Column: Payment Methods -->
      <div class="co__left">
        <section class="co__section ai" style="transition-delay:100ms">
          <h2 class="co__section-title">Metode Pembayaran</h2>

          <!-- Payment Type Tabs -->
          <div class="payment-tabs">
            <button
              class="payment-tab"
              :class="{ 'payment-tab--active': selectedPayment === 'va' }"
              @click="selectedPayment = 'va'"
            >
              <div class="payment-tab__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              Midtrans VA
            </button>
            <button
              class="payment-tab"
              :class="{ 'payment-tab--active': selectedPayment === 'qris' }"
              @click="selectedPayment = 'qris'"
            >
              <div class="payment-tab__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              Midtrans QRIS
            </button>
            <button
              class="payment-tab"
              :class="{ 'payment-tab--active': selectedPayment === 'manual' }"
              @click="selectedPayment = 'manual'"
            >
              <div class="payment-tab__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              Manual Transfer
            </button>
          </div>

          <!-- Virtual Account Options -->
          <div v-if="selectedPayment === 'va'" class="payment-options ai" style="transition-delay:200ms">
            <p class="payment-options__label">Pilih Bank Virtual Account (Simulasi)</p>
            <div class="bank-grid">
              <button
                v-for="bank in bankMethods"
                :key="bank.id"
                class="bank-option"
                :class="{ 'bank-option--active': selectedBank === bank.id }"
                @click="selectedBank = bank.id"
              >
                <span class="bank-option__logo">{{ bank.logo }}</span>
                <span class="bank-option__name">{{ bank.name }}</span>
              </button>
            </div>
            <div class="va-info">
              <div class="va-info__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <p>Pembayaran akan diproses aman menggunakan gateway pembayaran sandbox Midtrans Snap. Dapatkan nomor virtual account resmi saat pop-up pembayaran muncul.</p>
            </div>
          </div>

          <!-- QRIS Options -->
          <div v-if="selectedPayment === 'qris'" class="payment-options ai" style="transition-delay:200ms">
            <p class="payment-options__label">E-Wallet yang didukung (Simulasi)</p>
            <div class="wallet-list">
              <div v-for="w in qrisWallets" :key="w" class="wallet-item">
                <div class="wallet-item__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span>{{ w }}</span>
              </div>
            </div>
            <div class="va-info">
              <div class="va-info__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <p>QR Code QRIS akan ditampilkan oleh Midtrans Snap. Anda dapat memindainya melalui e-wallet favorit Anda untuk melakukan pembayaran simulasi.</p>
            </div>
          </div>

          <!-- Manual Transfer Options -->
          <div v-if="selectedPayment === 'manual'" class="payment-options ai" style="transition-delay:200ms">
            <p class="payment-options__label">Informasi Rekening Platform</p>
            <div class="va-info" style="margin-bottom: 1rem; border-color: #3B5BDB; background: #EEF2FF;">
              <div class="va-info__icon">
                <span style="font-size: 1.25rem;">🏦</span>
              </div>
              <div>
                <strong style="color: #1E2A5E; font-size: 0.9rem; display: block; margin-bottom: 0.25rem;">Bank Mandiri (Manual Transfer)</strong>
                <p style="color: #374151; font-weight: 700; font-size: 1rem; margin: 0.25rem 0;">No Rekening: 157-00-1234567-9</p>
                <p style="color: #555; margin: 0;">Atas Nama: PT Vendor Marketplace Indonesia</p>
              </div>
            </div>
            <div class="va-info">
              <div class="va-info__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <p>Silakan lakukan transfer manual ke rekening bank di atas, kemudian unggah bukti transfer fisik di halaman berikutnya untuk diverifikasi oleh Finance Admin.</p>
            </div>
          </div>

          <!-- Disclaimer standard price -->
          <div class="disclaimer-alert ai" style="transition-delay: 250ms; margin-top: 1.5rem;">
            <div class="disclaimer-alert__icon">⚠️</div>
            <p class="disclaimer-alert__text">
              <strong>Catatan Sistem:</strong> Dikarenakan sistem pencatatan backend saat ini, nominal tagihan transaksi resmi di database akan selalu dicatat menggunakan <em>harga standard</em> gig. Penyelesaian sisa pembayaran untuk paket Basic/Premium dilakukan melalui koordinasi langsung dengan vendor di luar sistem utama.
            </p>
          </div>
        </section>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="co__right">
        <div class="summary-card ai" style="transition-delay:150ms">
          <div class="summary-card__header">Ringkasan Pesanan</div>
          <div class="summary-card__body">
            <h4 class="summary-card__product">{{ gig?.title }}</h4>
            <span class="summary-card__badge">{{ planName }} Plan</span>
            
            <div class="summary-card__delivery" style="margin-top: 0.5rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Vendor: {{ gig?.merchant?.shopName || 'Freelancer' }}
            </div>
            <div class="summary-card__divider"></div>
            <div class="summary-card__row">
              <span>Subtotal Paket ({{ planName }})</span>
              <span>{{ formatPrice(chosenPrice) }}</span>
            </div>
            <div class="summary-card__row">
              <span>Biaya Layanan</span>
              <span>{{ formatPrice(serviceFee) }}</span>
            </div>
            <div class="summary-card__divider"></div>
            <div class="summary-card__row summary-card__row--total">
              <span>Total Harga</span>
              <strong>{{ formatPrice(totalPrice) }}</strong>
            </div>
            <button
              class="summary-card__btn"
              :class="{ 'summary-card__btn--loading': isProcessing }"
              :disabled="isProcessing"
              @click="processPayment"
            >
              <template v-if="isProcessing">
                <span class="spinner"></span>
                Memproses...
              </template>
              <template v-else>
                Bayar & Selesaikan Pesanan
              </template>
            </button>
          </div>
        </div>

        <!-- Security Badge -->
        <div class="security-badge ai" style="transition-delay:250ms">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <strong>Pembayaran Aman</strong>
            <p>Uang Anda ditahan oleh sistem (Escrow) dan baru dicairkan ke vendor setelah pesanan selesai.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.ai{opacity:0;transform:translateY(20px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1)}.ai.vis{opacity:1;transform:translateY(0)}

.co { padding: 1.5rem 0 4rem; min-height: 100vh; background: #FAFBFC; }
.co__inner { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; color: #6B7280; font-weight: 500; }
.spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #3B5BDB; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Header */
.co__header { margin-bottom: 2rem; }
.co__title {
  font-size: 1.75rem; font-weight: 800; color: #1E2A5E;
  margin: 0 0 0.5rem; letter-spacing: -0.01em;
}

/* Stepper */
.stepper { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
.stepper__step { color: #9CA3AF; font-weight: 500; text-decoration: none; transition: color 0.2s; cursor: default; }
.stepper__step--active { color: #1E2A5E; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.stepper__step--done { color: #6B7280; cursor: pointer; text-decoration: none; }
.stepper__step--done:hover { color: #3B5BDB; }
.stepper__divider { color: #D1D5DB; }

/* Grid */
.co__grid { display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; align-items: start; }

/* Section */
.co__section { margin-bottom: 2rem; }
.co__section-title {
  font-size: 1.0625rem; font-weight: 700; color: #1E2A5E;
  margin: 0 0 1.25rem; font-style: italic;
}

/* Payment Tabs */
.payment-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.payment-tab {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.875rem 1.25rem; border: 2px solid #E5E7EB;
  border-radius: 12px; background: #fff; cursor: pointer;
  font-size: 0.875rem; font-weight: 600; color: #374151;
  transition: all 0.25s ease; flex: 1;
}
.payment-tab:hover { border-color: #3B5BDB; }
.payment-tab--active {
  border-color: #3B5BDB; background: #EEF2FF; color: #1E2A5E;
  box-shadow: 0 0 0 3px rgba(59,91,219,0.08);
}
.payment-tab__icon {
  width: 36px; height: 36px; background: #EEF2FF; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #3B5BDB; flex-shrink: 0;
}
.payment-tab--active .payment-tab__icon { background: #3B5BDB; color: #fff; }
.payment-tab--active .payment-tab__icon svg { stroke: #fff; }

/* Payment Options */
.payment-options__label {
  font-size: 0.8125rem; font-weight: 600; color: #374151;
  margin: 0 0 0.75rem; text-transform: uppercase; letter-spacing: 0.03em;
}

/* Bank Grid */
.bank-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
.bank-option {
  display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
  padding: 1rem 0.75rem; border: 1.5px solid #E5E7EB; border-radius: 12px;
  background: #fff; cursor: pointer; transition: all 0.2s;
}
.bank-option:hover { border-color: #3B5BDB; }
.bank-option--active { border-color: #3B5BDB; background: #EEF2FF; box-shadow: 0 0 0 3px rgba(59,91,219,0.08); }
.bank-option__logo { font-size: 1.5rem; }
.bank-option__name { font-size: 0.8125rem; font-weight: 600; color: #374151; }

/* Wallet List */
.wallet-list { display: flex; flex-wrap: wrap; gap: 0.625rem; margin-bottom: 1.25rem; }
.wallet-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; background: #F0F4FF; border-radius: 9999px;
  font-size: 0.8125rem; font-weight: 600; color: #1E2A5E;
}
.wallet-item__icon { display: flex; }

/* VA Info */
.va-info {
  display: flex; gap: 0.625rem; padding: 1rem;
  background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;
}
.va-info__icon { flex-shrink: 0; margin-top: 2px; }
.va-info p { font-size: 0.8125rem; color: #64748B; line-height: 1.6; margin: 0; }

/* Disclaimer Alert */
.disclaimer-alert {
  display: flex; gap: 0.75rem; padding: 1rem 1.25rem;
  background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px;
}
.disclaimer-alert__icon { font-size: 1.25rem; flex-shrink: 0; }
.disclaimer-alert__text { font-size: 0.8125rem; color: #78350F; line-height: 1.5; margin: 0; }

/* Summary Card */
.summary-card {
  border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB;
  background: #fff; position: sticky; top: 80px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.summary-card__header {
  background: #3B5BDB; color: #fff; padding: 1.125rem 1.5rem;
  font-weight: 700; font-size: 1rem;
}
.summary-card__body { padding: 1.5rem; }
.summary-card__product {
  font-size: 0.9375rem; font-weight: 700; color: #111827;
  margin: 0 0 0.25rem; line-height: 1.4;
}
.summary-card__badge {
  display: inline-block; padding: 0.125rem 0.5rem; background: #EEF2FF;
  color: #3B5BDB; font-size: 0.7rem; font-weight: 700; border-radius: 4px;
  text-transform: uppercase;
}
.summary-card__delivery {
  display: flex; align-items: center; gap: 0.375rem;
  font-size: 0.8125rem; color: #6B7280; margin-bottom: 1rem;
}
.summary-card__divider { height: 1px; background: #F3F4F6; margin: 0.75rem 0; }
.summary-card__row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.875rem; color: #374151; padding: 0.25rem 0;
}
.summary-card__row--total { padding-top: 0.75rem; }
.summary-card__row--total span { font-weight: 600; }
.summary-card__row--total strong { color: #3B5BDB; font-size: 1.25rem; }

/* Pay Button */
.summary-card__btn {
  width: 100%; padding: 0.875rem; background: #3B5BDB; color: #fff;
  border: none; border-radius: 12px; font-weight: 700; font-size: 0.9375rem;
  cursor: pointer; margin-top: 1.25rem; transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.summary-card__btn:hover { background: #2F4DC4; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(59,91,219,0.25); }
.summary-card__btn:active { transform: translateY(0); }
.summary-card__btn:disabled { opacity: 0.8; cursor: not-allowed; transform: none; }

/* Security Badge */
.security-badge {
  display: flex; gap: 0.75rem; padding: 1rem 1.25rem;
  background: #F0F4FF; border-radius: 12px; margin-top: 1rem;
  border: 1px solid #E2E8F0;
}
.security-badge svg { flex-shrink: 0; margin-top: 2px; }
.security-badge strong { display: block; font-size: 0.8125rem; color: #1E2A5E; margin-bottom: 0.25rem; }
.security-badge p { font-size: 0.75rem; color: #64748B; line-height: 1.5; margin: 0; }

@media (max-width: 900px) {
  .co__grid { grid-template-columns: 1fr; }
  .summary-card { position: static; }
}
@media (max-width: 640px) {
  .co__title { font-size: 1.375rem; }
  .payment-tabs { flex-direction: column; }
  .bank-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (prefers-reduced-motion: reduce) { .ai { transition: none; } .spinner { animation: none; } }
</style>


