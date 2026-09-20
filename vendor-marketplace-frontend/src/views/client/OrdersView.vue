<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyOrders } from '../../composables/useOrders'

const router = useRouter()
const searchQuery = ref('')
const activeFilter = ref('semua')
const filters = ['Semua', 'Menunggu', 'Selesai']

const { data: rawOrders, isLoading } = useMyOrders()
const orders = computed(() => rawOrders.value || [])

function isWaitingStatus(status: string) {
  return ['UNPAID', 'PAID_PENDING_CONFIRMATION', 'IN_PROGRESS', 'DELIVERED', 'IN_REVISION', 'DISPUTE_IN_PROGRESS'].includes(status)
}

function isFinishedStatus(status: string) {
  return ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(status)
}

function getStatusClass(status: string) {
  if (isFinishedStatus(status)) {
    return 'order-card__status--selesai'
  }
  return 'order-card__status--menunggu'
}

function getHumanStatus(status: string) {
  switch (status) {
    case 'UNPAID': return 'Belum Bayar'
    case 'PAID_PENDING_CONFIRMATION': return 'Menunggu Konfirmasi'
    case 'IN_PROGRESS': return 'Sedang Dikerjakan'
    case 'DELIVERED': return 'Telah Dikirim'
    case 'IN_REVISION': return 'Revisi'
    case 'DISPUTE_IN_PROGRESS': return 'Sengketa'
    case 'COMPLETED': return 'Selesai'
    case 'REFUNDED': return 'Refunded'
    case 'CANCELLED': return 'Batal'
    default: return status
  }
}

const filteredOrders = computed(() => {
  let result = orders.value
  if (activeFilter.value !== 'semua') {
    if (activeFilter.value === 'menunggu') {
      result = result.filter((o: any) => isWaitingStatus(o.status))
    } else if (activeFilter.value === 'selesai') {
      result = result.filter((o: any) => isFinishedStatus(o.status))
    }
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((o: any) =>
      String(o.id).toLowerCase().includes(q) ||
      (o.gig?.title && o.gig.title.toLowerCase().includes(q)) ||
      (o.merchant?.shopName && o.merchant.shopName.toLowerCase().includes(q))
    )
  }
  return result
})

function formatPrice(val: number) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function goToChat() {
  router.push('/chat')
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
  document.querySelectorAll('.anim-in').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="orders-page">
    <div class="orders-page__inner">

      <!-- Header -->
      <h1 class="orders-page__title anim-in">Pesanan Saya</h1>

      <!-- Toolbar -->
      <div class="orders-toolbar anim-in" style="transition-delay:80ms">
        <div class="orders-toolbar__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Cari ID pesanan, vendor, atau layanan..." />
        </div>
        <div class="orders-toolbar__filters">
          <button
            v-for="f in filters"
            :key="f"
            class="filter-tab"
            :class="{ 'filter-tab--active': activeFilter === f.toLowerCase() }"
            @click="activeFilter = f.toLowerCase()"
          >{{ f }}</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 text-center bg-white rounded-xl border border-gray-150">
        <p class="text-gray-500 text-sm">Memuat data pesanan...</p>
      </div>

      <div v-else class="orders-body">
        <!-- Order List -->
        <div class="orders-list">
          <div
            v-for="(order, idx) in filteredOrders"
            :key="order.id"
            class="order-card anim-in visible"
            :style="{ transitionDelay: `${(Number(idx) + 2) * 80}ms` }"
          >
            <div class="order-card__top">
              <div class="order-card__id-row">
                <span class="order-card__id">#ORD-{{ order.id }}</span>
                <span
                  class="order-card__status"
                  :class="getStatusClass(order.status)"
                >{{ getHumanStatus(order.status) }}</span>
              </div>
              <h3 class="order-card__title">{{ order.gig?.title || 'Custom Order' }}</h3>
              <p style="font-size: 0.8125rem; color: #6B7280; margin: 0.25rem 0 0;">Vendor: <strong>{{ order.merchant?.shopName || 'Unknown Vendor' }}</strong></p>
            </div>

            <div class="order-card__bottom">
              <div class="order-card__escrow">
                <span class="order-card__escrow-label">TOTAL PEMBAYARAN</span>
                <div class="order-card__escrow-amount">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>{{ formatPrice(order.totalAmount) }}</span>
                </div>
              </div>
              <div class="order-card__actions">
                <button class="btn-chat-vendor" @click="goToChat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Chat Vendor
                </button>
                
                <!-- If unpaid, show bayar / verify -->
                <router-link 
                  v-if="order.status === 'UNPAID'" 
                  :to="`/jelajahi/${order.gigId}/verifikasi?orderId=${order.id}&method=manual`" 
                  class="btn-detail"
                >
                  Bayar Sekarang
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </router-link>

                <!-- If paid pending confirmation, show cek status -->
                <router-link 
                  v-else-if="order.status === 'PAID_PENDING_CONFIRMATION'" 
                  :to="`/jelajahi/${order.gigId}/verifikasi?orderId=${order.id}&method=manual`" 
                  class="btn-detail"
                  style="background: #EA580C;"
                >
                  Cek Status
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </router-link>
                
                <!-- General detail page link -->
                <router-link 
                  v-else 
                  :to="`/pesanan/${order.id}`" 
                  class="btn-detail"
                >
                  Lihat Detail
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredOrders.length === 0" class="orders-empty anim-in visible">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>Tidak ada pesanan ditemukan</p>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="orders-sidebar anim-in visible" style="transition-delay:240ms">
          <div class="sidebar-cta">
            <div class="sidebar-cta__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <h4 class="sidebar-cta__title">Mulai Proyek Baru?</h4>
            <p class="sidebar-cta__desc">Temukan vendor profesional untuk kebutuhan Anda.</p>
            <router-link to="/jelajahi" class="sidebar-cta__btn">Cari Layanan Baru</router-link>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Animations ===== */
.anim-in {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1);
}
.anim-in.visible { opacity: 1; transform: translateY(0); }

/* ===== Page ===== */
.orders-page { padding: 2rem 0 4rem; }
.orders-page__inner { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }
.orders-page__title {
  font-size: 2rem; font-weight: 800; color: #111827;
  font-style: italic; margin-bottom: 1.5rem;
}

/* ===== Toolbar ===== */
.orders-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
}
.orders-toolbar__search {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1rem; border: 1px solid #E5E7EB; border-radius: 12px;
  background: #fff; min-width: 300px; flex: 1; max-width: 420px;
}
.orders-toolbar__search input {
  border: none; outline: none; background: transparent; flex: 1;
  font-size: 0.875rem; color: #374151;
}
.orders-toolbar__search input::placeholder { color: #9CA3AF; }
.orders-toolbar__filters { display: flex; gap: 0; }
.filter-tab {
  padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 500;
  color: #6B7280; background: #fff; border: 1px solid #E5E7EB;
  cursor: pointer; transition: all 0.2s;
}
.filter-tab:first-child { border-radius: 8px 0 0 8px; }
.filter-tab:last-child { border-radius: 0 8px 8px 0; }
.filter-tab:not(:first-child) { border-left: none; }
.filter-tab--active {
  color: #111827; font-weight: 700; background: #F9FAFB;
  border-color: #111827;
}
.filter-tab:hover:not(.filter-tab--active) { background: #F9FAFB; }

/* ===== Body Grid ===== */
.orders-body {
  display: grid; grid-template-columns: 1fr 260px; gap: 2rem; align-items: start;
}

/* ===== Order Cards ===== */
.orders-list { display: flex; flex-direction: column; gap: 1rem; }
.order-card {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 16px;
  padding: 1.5rem; transition: box-shadow 0.3s, transform 0.3s; cursor: default;
}
.order-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.order-card__top { margin-bottom: 1.25rem; }
.order-card__id-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
.order-card__id { font-size: 0.875rem; font-weight: 700; color: #111827; font-family: monospace; }
.order-card__status {
  display: inline-block; padding: 0.125rem 0.75rem; border-radius: 9999px;
  font-size: 0.75rem; font-weight: 600;
}
.order-card__status--menunggu { background: #FFF7ED; color: #EA580C; }
.order-card__status--selesai { background: #F0FDF4; color: #16A34A; }
.order-card__title { font-size: 1rem; font-weight: 700; color: #111827; }

.order-card__bottom { display: flex; align-items: flex-end; justify-content: space-between; }
.order-card__escrow-label {
  font-size: 0.6875rem; font-weight: 600; color: #9CA3AF;
  text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 0.25rem;
}
.order-card__escrow-amount {
  display: flex; align-items: center; gap: 0.375rem;
  font-size: 0.9375rem; font-weight: 700; color: #111827;
}
.order-card__actions { display: flex; align-items: center; gap: 0.75rem; }
.btn-chat-vendor {
  display: inline-flex; align-items: center; gap: 0.375rem;
  background: none; border: none; font-size: 0.8125rem; font-weight: 500;
  color: #6B7280; cursor: pointer; transition: color 0.2s; padding: 0;
}
.btn-chat-vendor:hover { color: #3B5BDB; }
.btn-detail {
  display: inline-flex; align-items: center; gap: 0.25rem;
  padding: 0.5rem 1rem; background: #3B5BDB; color: #fff;
  font-size: 0.8125rem; font-weight: 600; border-radius: 8px;
  text-decoration: none; transition: all 0.2s; cursor: pointer;
}
.btn-detail:hover { background: #2F4DC4; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,91,219,0.25); }

/* ===== Empty State ===== */
.orders-empty {
  text-align: center; padding: 3rem 1rem;
  color: #9CA3AF; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}
.orders-empty p { font-size: 0.9375rem; }

/* ===== Sidebar CTA ===== */
.sidebar-cta {
  background: #fff; border: 1px solid #E5E7EB; border-radius: 16px;
  padding: 2rem 1.5rem; text-align: center; position: sticky; top: 80px;
}
.sidebar-cta__icon { margin-bottom: 1rem; }
.sidebar-cta__title { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 0.375rem; }
.sidebar-cta__desc { font-size: 0.8125rem; color: #6B7280; line-height: 1.5; margin-bottom: 1.25rem; }
.sidebar-cta__btn {
  display: inline-block; padding: 0.5rem 1.25rem; border: 1.5px solid #E5E7EB;
  border-radius: 8px; font-size: 0.8125rem; font-weight: 600; color: #111827;
  text-decoration: none; transition: all 0.2s; cursor: pointer;
}
.sidebar-cta__btn:hover { border-color: #3B5BDB; color: #3B5BDB; }

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .orders-body { grid-template-columns: 1fr; }
  .orders-sidebar { order: -1; }
}
@media (max-width: 640px) {
  .orders-toolbar { flex-direction: column; }
  .orders-toolbar__search { min-width: 0; max-width: 100%; }
  .orders-page__title { font-size: 1.5rem; }
  .order-card__bottom { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .order-card__actions { width: 100%; justify-content: flex-end; }
}
@media (prefers-reduced-motion: reduce) {
  .anim-in { transition: none; }
  .order-card { transition: none; }
}
</style>
