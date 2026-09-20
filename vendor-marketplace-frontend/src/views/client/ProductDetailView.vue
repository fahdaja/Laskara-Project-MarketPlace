<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from '../../components/ui/Toast.vue'
import { useGigDetail, useReviews } from '../../composables/useGigs'
import api from '../../api/axios'

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string

type PlanKey = 'basic' | 'standard' | 'premium'
const selectedPlan = ref<PlanKey>('standard')

const { data: gig, isLoading } = useGigDetail(productId)
const { data: reviews } = useReviews(productId)

const showToast = ref(false)
const toastData = ref({ type: 'success' as 'success' | 'info' | 'error', title: '', subtitle: '' })


const plans = ref<Record<PlanKey, { name: string; price: string; features: string[] }>>({
  basic: { name: 'Paket Basic', price: 'Rp0', features: [] },
  standard: { name: 'Paket Standard', price: 'Rp0', features: [] },
  premium: { name: 'Paket Premium', price: 'Rp0', features: [] },
})

const extraImages = ref<string[]>([])
const activeImageIndex = ref(0)

const allImages = computed(() => {
  const images = []
  if (gig.value?.mediaUrls) {
    images.push(gig.value.mediaUrls)
  }
  if (extraImages.value && extraImages.value.length > 0) {
    images.push(...extraImages.value)
  }
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80')
  }
  return images
})

function formatRupiah(val: number | string) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return 'Rp 0'
  return 'Rp ' + num.toLocaleString('id-ID')
}

function parseFeatures(features: any): string[] {
  if (Array.isArray(features)) return features
  if (typeof features === 'string') {
    return features.split(',').map(f => f.trim()).filter(Boolean)
  }
  return []
}

const descriptionText = computed(() => {
  if (!gig.value) return ''
  try {
    const parsed = JSON.parse(gig.value.description)
    return parsed.text || parsed.description || gig.value.description
  } catch (e) {
    return gig.value.description
  }
})

watch(gig, (newVal) => {
  if (!newVal) return
  let descJson: any = null
  try {
    descJson = JSON.parse(newVal.description)
  } catch (e) {
  }

  const basePrice = typeof newVal.price === 'string' ? parseFloat(newVal.price) : newVal.price

  if (descJson && descJson.tiers) {
    plans.value = {
      basic: {
        name: descJson.tiers.basic?.name || 'Paket Basic',
        price: formatRupiah(descJson.tiers.basic?.price),
        features: parseFeatures(descJson.tiers.basic?.features)
      },
      standard: {
        name: descJson.tiers.standard?.name || 'Paket Standard',
        price: formatRupiah(descJson.tiers.standard?.price || basePrice),
        features: parseFeatures(descJson.tiers.standard?.features)
      },
      premium: {
        name: descJson.tiers.premium?.name || 'Paket Premium',
        price: formatRupiah(descJson.tiers.premium?.price),
        features: parseFeatures(descJson.tiers.premium?.features)
      }
    }
    extraImages.value = descJson.extraMedia || []
  } else {
    plans.value = {
      basic: {
        name: 'Paket Basic',
        price: formatRupiah(basePrice * 0.6),
        features: ['Pengiriman Cepat', 'Revisi 1x', 'Desain Standard']
      },
      standard: {
        name: 'Paket Standard',
        price: formatRupiah(basePrice),
        features: ['Pengiriman Cepat', 'Revisi 3x', 'Desain Professional', 'File Sumber (PSD/Figma)']
      },
      premium: {
        name: 'Paket Premium',
        price: formatRupiah(basePrice * 1.8),
        features: ['Pengiriman Super Cepat', 'Revisi Unlimited', 'Desain Premium Kualitas Tinggi', 'File Sumber', 'Hak Komersial']
      }
    }
    extraImages.value = []
  }
}, { immediate: true })

function navigateToOrder() {
  router.push({
    name: 'OrderConfirmation',
    params: { id: productId },
    query: { plan: selectedPlan.value }
  })
}

async function contactSeller() {
  try {
    await api.post('/chat/create-channel', { gigId: Number(productId) })
    router.push('/chat')
  } catch (err: any) {
    console.error('Failed to create chat channel', err)
    alert(err.response?.data?.message || 'Gagal menghubungi penjual.')
  }
}

const compareTable = computed(() => {
  const basicPrice = plans.value.basic.price
  const standardPrice = plans.value.standard.price
  const premiumPrice = plans.value.premium.price
  return [
    { feature: 'Harga Paket', basic: basicPrice, standard: standardPrice, premium: premiumPrice },
    { feature: 'Revisi', basic: '1x', standard: '3x', premium: 'Unlimited' },
    { feature: 'Pengerjaan', basic: '3 Hari', standard: '7 Hari', premium: '14 Hari' },
  ]
})

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer?.unobserve(e.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.anim-in').forEach((el) => observer?.observe(el))
})

watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => {
      document.querySelectorAll('.anim-in').forEach((el) => observer?.observe(el))
    })
  }
})
</script>

<template>
  <div class="detail">
    <div class="detail__inner">
      <!-- Success/Error Toast -->
      <div v-if="showToast" class="fixed-toast">
        <Toast :type="toastData.type" :title="toastData.title" :subtitle="toastData.subtitle" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat detail layanan...</p>
      </div>

      <!-- Content -->
      <div v-else-if="gig">
        <!-- Breadcrumb -->
        <nav class="breadcrumb anim-in" aria-label="Breadcrumb">
          <router-link to="/" class="breadcrumb__link">Beranda</router-link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <router-link to="/jelajahi" class="breadcrumb__link">Creative Studio</router-link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="breadcrumb__current">{{ gig.title }}</span>
        </nav>

        <div class="detail__grid">
          <!-- Left Column -->
          <div class="detail__left">
            <h1 class="detail__title anim-in">{{ gig.title }}</h1>
            
            <!-- Gallery -->
            <div class="gallery anim-in" style="transition-delay:100ms">
              <div class="detail__image-wrapper">
                <img :src="allImages[activeImageIndex]" :alt="gig.title" class="detail__image" loading="eager" />
              </div>
              <div class="gallery__thumbnails" v-if="allImages.length > 1">
                <button
                  v-for="(img, idx) in allImages"
                  :key="idx"
                  class="gallery__thumb-btn"
                  :class="{ 'gallery__thumb-btn--active': activeImageIndex === idx }"
                  @click="activeImageIndex = idx"
                >
                  <img :src="img" alt="Thumbnail" class="gallery__thumb-img" />
                </button>
              </div>
            </div>

            <!-- Vendor Info -->
            <div class="detail__vendor anim-in" style="transition-delay:150ms" v-if="gig.merchant">
              <img :src="gig.merchant.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.merchant.shopName)}&background=random`" alt="Vendor logo" class="detail__vendor-avatar-img" />
              <div class="detail__vendor-info">
                <h3 class="detail__vendor-name">{{ gig.merchant.shopName }}</h3>
                <span class="detail__vendor-title">{{ gig.merchant.badge || 'Professional Seller' }}</span>
                <div class="detail__vendor-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>{{ (4.5 + (gig.id % 6) * 0.1).toFixed(1) }} ({{ 10 + (gig.id % 5) * 4 }} ulasan)</span>
                </div>
              </div>
            </div>

            <!-- About -->
            <section class="detail__section anim-in" style="transition-delay:200ms">
              <h2 class="detail__section-title">Tentang Jasa Ini</h2>
              <p class="detail__desc">{{ descriptionText }}</p>
            </section>

            <!-- Compare Table -->
            <section class="detail__section anim-in" style="transition-delay:250ms">
              <h2 class="detail__section-title">Bandingkan Paket</h2>
              <div class="compare-table-wrapper">
                <table class="compare-table">
                  <thead>
                    <tr>
                      <th>Fitur</th>
                      <th>Dasar</th>
                      <th>Standar</th>
                      <th>Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in compareTable" :key="row.feature">
                      <td class="compare-table__feature">{{ row.feature }}</td>
                      <td>{{ row.basic }}</td>
                      <td>{{ row.standard }}</td>
                      <td>{{ row.premium }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Reviews -->
            <section class="detail__section anim-in" style="transition-delay:300ms">
              <div class="reviews__header">
                <h2 class="detail__section-title">Ulasan Pelanggan</h2>
                <div class="reviews__summary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <strong>{{ (4.5 + (gig.id % 6) * 0.1).toFixed(1) }}</strong>
                  <span>dari {{ 10 + (gig.id % 5) * 4 }} ulasan</span>
                </div>
              </div>
              <div v-for="r in reviews" :key="r.name" class="review-card">
                <div class="review-card__header">
                  <div class="review-card__avatar"></div>
                  <div class="review-card__info">
                    <h4>{{ r.name }}</h4>
                    <div class="review-card__stars">
                      <svg v-for="s in 5" :key="s" width="12" height="12" viewBox="0 0 24 24" :fill="s <= r.rating ? '#F59E0B' : '#D1D5DB'" :stroke="s <= r.rating ? '#F59E0B' : '#D1D5DB'" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                  </div>
                  <span class="review-card__date">{{ r.date }}</span>
                </div>
                <p class="review-card__text">{{ r.text }}</p>
                <button class="review-card__helpful">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                  Membantu
                </button>
              </div>
              <button class="reviews__show-all">Lihat Semua Ulasan</button>
            </section>
          </div>

          <!-- Right Column - Pricing Card -->
          <div class="detail__right">
            <div class="pricing-card anim-in" style="transition-delay:150ms">
              <!-- Plan Tabs -->
              <div class="pricing-card__tabs">
                <button
                  v-for="key in ['basic', 'standard', 'premium']"
                  :key="key"
                  class="pricing-card__tab"
                  :class="{ 'pricing-card__tab--active': selectedPlan === key }"
                  @click="selectedPlan = key as PlanKey"
                >{{ key.charAt(0).toUpperCase() + key.slice(1) }}</button>
              </div>

              <div class="pricing-card__body">
                <div class="pricing-card__header">
                  <h3 class="pricing-card__name">{{ plans[selectedPlan].name }}</h3>
                  <span class="pricing-card__price">{{ plans[selectedPlan].price }}</span>
                </div>

                <ul class="pricing-card__features">
                  <li v-for="f in plans[selectedPlan].features" :key="f">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {{ f }}
                  </li>
                </ul>

                <button class="pricing-card__cta" @click="navigateToOrder">Pesan Sekarang</button>
                <button class="pricing-card__contact" @click="contactSeller">Hubungi Penjual</button>

                <p class="pricing-card__note">
                  Pesan dengan aman. Pembayaran Anda akan ditahan oleh platform hingga pesanan selesai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anim-in { opacity: 0; transform: translateY(24px); transition: all 1.2s cubic-bezier(0.16,1,0.3,1); }
.anim-in.visible { opacity: 1; transform: translateY(0); }

.detail { padding: 1.5rem 0 4rem; }
.detail__inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.fixed-toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 100; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; color: #6B7280; font-weight: 500; }
.spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #3B5BDB; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.8125rem; }
.breadcrumb__link { color: #6B7280; text-decoration: none; transition: color 0.2s; }
.breadcrumb__link:hover { color: #3B5BDB; }
.breadcrumb__current { color: #3B5BDB; font-weight: 600; }
.breadcrumb svg { color: #D1D5DB; flex-shrink: 0; }

.detail__grid { display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; align-items: start; }

/* Left */
.detail__title { font-size: 2rem; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 1.5rem; }
.detail__image-wrapper { border-radius: 16px; overflow: hidden; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.detail__image { width: 100%; height: 420px; object-fit: cover; display: block; transition: transform 0.3s; }
.detail__image:hover { transform: scale(1.02); }

/* Gallery */
.gallery { margin-bottom: 2rem; }
.gallery__thumbnails { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; }
.gallery__thumb-btn { width: 80px; height: 60px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; background: none; padding: 0; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.gallery__thumb-btn--active { border-color: #3B5BDB; box-shadow: 0 0 0 2px rgba(59,91,219,0.2); }
.gallery__thumb-img { width: 100%; height: 100%; object-fit: cover; }

.detail__vendor { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 0; border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6; margin-bottom: 2rem; }
.detail__vendor-avatar-img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid #E5E7EB; }
.detail__vendor-name { font-size: 1rem; font-weight: 700; color: #111827; }
.detail__vendor-title { font-size: 0.8125rem; color: #6B7280; }
.detail__vendor-rating { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8125rem; color: #374151; margin-top: 0.25rem; }

.detail__section { margin-bottom: 2.5rem; }
.detail__section-title { font-size: 1.25rem; font-weight: 700; color: #111827; font-style: italic; margin-bottom: 1rem; }
.detail__desc { font-size: 0.9375rem; color: #4B5563; line-height: 1.7; white-space: pre-wrap; }

/* Compare Table */
.compare-table-wrapper { overflow-x: auto; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.compare-table th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #6B7280; border-bottom: 2px solid #E5E7EB; font-size: 0.8125rem; }
.compare-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #F3F4F6; color: #374151; }
.compare-table__feature { font-weight: 600; color: #111827; }

/* Reviews */
.reviews__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.reviews__summary { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; color: #6B7280; }
.reviews__summary strong { color: #111827; font-size: 1.125rem; }

.review-card { padding: 1.25rem; border: 1px solid #F3F4F6; border-radius: 12px; margin-bottom: 1rem; }
.review-card__header { display: flex; align-items: flex-start; gap: 0.75rem; }
.review-card__avatar { width: 40px; height: 40px; border-radius: 50%; background: #E5E7EB; flex-shrink: 0; }
.review-card__info h4 { font-size: 0.875rem; font-weight: 600; color: #111827; }
.review-card__stars { display: flex; gap: 0.125rem; margin-top: 0.25rem; }
.review-card__date { margin-left: auto; font-size: 0.75rem; color: #9CA3AF; white-space: nowrap; }
.review-card__text { font-size: 0.875rem; color: #4B5563; line-height: 1.6; margin-top: 0.75rem; }
.review-card__helpful {
  display: flex; align-items: center; gap: 0.375rem; margin-top: 0.75rem;
  font-size: 0.8125rem; color: #6B7280; background: none; border: none; cursor: pointer; transition: color 0.2s;
}
.review-card__helpful:hover { color: #3B5BDB; }

.reviews__show-all {
  width: 100%; padding: 0.75rem; border: 1.5px solid #E5E7EB; border-radius: 12px;
  background: #fff; font-size: 0.875rem; font-weight: 600; color: #3B5BDB;
  cursor: pointer; transition: all 0.2s;
}
.reviews__show-all:hover { border-color: #3B5BDB; background: #F0F4FF; }

/* Pricing Card */
.pricing-card {
  position: sticky; top: 80px; background: #fff; border: 1px solid #E5E7EB;
  border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.pricing-card__tabs { display: flex; border-bottom: 1px solid #E5E7EB; }
.pricing-card__tab {
  flex: 1; padding: 0.75rem; text-align: center; font-size: 0.8125rem; font-weight: 500;
  color: #6B7280; background: #F9FAFB; border: none; cursor: pointer; transition: all 0.2s;
}
.pricing-card__tab--active { color: #111827; font-weight: 700; background: #fff; box-shadow: 0 -2px 0 #3B5BDB inset; }
.pricing-card__body { padding: 1.5rem; }
.pricing-card__header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.25rem; }
.pricing-card__name { font-size: 1rem; font-weight: 700; color: #111827; }
.pricing-card__price { font-size: 1.5rem; font-weight: 800; color: #3B5BDB; }

.pricing-card__features { list-style: none; padding: 0; margin: 0 0 1.5rem; display: flex; flex-direction: column; gap: 0.625rem; }
.pricing-card__features li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151; }

.pricing-card__cta {
  width: 100%; padding: 0.75rem; background: #1E2A5E; color: #fff;
  font-weight: 700; font-size: 0.9375rem; border: none; border-radius: 12px;
  cursor: pointer; transition: all 0.2s; margin-bottom: 0.75rem;
}
.pricing-card__cta:hover { background: #2A3A7A; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(30,42,94,0.25); }
.pricing-card__contact {
  width: 100%; padding: 0.75rem; background: #fff; color: #3B5BDB;
  font-weight: 700; font-size: 0.9375rem; border: 1.5px solid #3B5BDB; border-radius: 12px;
  cursor: pointer; transition: all 0.2s;
}
.pricing-card__contact:hover { background: #F0F4FF; }
.pricing-card__note { font-size: 0.6875rem; color: #9CA3AF; margin-top: 1rem; line-height: 1.5; }

@media (max-width: 1024px) {
  .detail__grid { grid-template-columns: 1fr 320px; gap: 2rem; }
}
@media (max-width: 768px) {
  .detail__grid { grid-template-columns: 1fr; }
  .pricing-card { position: static; }
  .detail__title { font-size: 1.5rem; }
  .detail__image { height: 240px; }
}
@media (prefers-reduced-motion: reduce) {
  .anim-in { transition: none; }
}
</style>

