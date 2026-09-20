<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClientFooter from '../../components/client/ClientFooter.vue'
import { useGigDetail, useReviews } from '../../composables/useGigs'

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string

type PlanKey = 'basic' | 'standard' | 'premium'
const selectedPlan = ref<PlanKey>('standard')

const { data: gig, isLoading: isGigLoading } = useGigDetail(productId)
const { data: reviewsData, isLoading: isReviewsLoading } = useReviews(productId)
const isLoading = computed(() => isGigLoading.value || isReviewsLoading.value)

const plans = ref<Record<PlanKey, { name: string; price: string; features: string[] }>>({
  basic: { name: 'Paket Basic', price: 'Rp0', features: [] },
  standard: { name: 'Paket Standard', price: 'Rp0', features: [] },
  premium: { name: 'Paket Premium', price: 'Rp0', features: [] },
})

const reviews = computed(() => {
  const list = reviewsData.value || []
  if (list.length === 0) {
    return [
      { name: 'Andi Pratama', rating: 5, date: '2 minggu yang lalu', text: 'Respon sangat cepat dan revisi dilakukan dengan teliti.' }
    ]
  }
  return list.map((r: any) => ({
    name: r.user?.fullName || 'User',
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    text: r.comment || 'Ulasan tanpa komentar.'
  }))
})

const averageRating = computed(() => {
  const list = reviewsData.value || []
  if (list.length === 0) return '4.9'
  const total = list.reduce((sum: number, r: any) => sum + r.rating, 0)
  return (total / list.length).toFixed(1)
})

const reviewCount = computed(() => {
  const list = reviewsData.value || []
  return list.length === 0 ? 20 : list.length
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
  }
}, { immediate: true })

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

function initObserver() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer?.unobserve(e.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.anim-in').forEach((el) => observer?.observe(el))
}

onMounted(() => {
  initObserver()
})

watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => {
      initObserver()
    })
  }
})

function goBack() {
  router.back()
}
</script>

<template>
  <div class="detail-view">
    <div class="container">
      <button @click="goBack" class="back-btn anim-in">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat detail layanan...</p>
      </div>

      <div v-else-if="gig" class="content-grid">
        <div class="main-col">
          <h1 class="title anim-in">{{ gig.title }}</h1>
          
          <div class="image-container anim-in">
            <img :src="gig.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000'" alt="Product" class="main-image" />
          </div>

          <section class="section anim-in">
            <h2 class="section-title">Tentang Jasa Ini</h2>
            <p class="description">{{ descriptionText }}</p>
          </section>

          <div class="vendor-card anim-in" v-if="gig.merchant">
            <div class="vendor-avatar">
              <img :src="gig.merchant.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.merchant.shopName)}&background=random`" alt="Vendor logo" />
            </div>
            <div class="vendor-info">
              <h3 class="vendor-name">{{ gig.merchant.shopName }}</h3>
              <p class="vendor-title">{{ gig.merchant.badge || 'Professional Seller' }}</p>
              <div class="vendor-rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{{ averageRating }} ({{ reviewCount }} ulasan)</span>
              </div>
            </div>
          </div>

          <section class="section anim-in">
            <h2 class="section-title">Bandingkan Paket</h2>
            <div class="table-wrapper">
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
                    <td class="feature-name">{{ row.feature }}</td>
                    <td>{{ row.basic }}</td>
                    <td>{{ row.standard }}</td>
                    <td>{{ row.premium }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="section anim-in">
            <div class="reviews-header">
              <h2 class="section-title">Ulasan Pelanggan</h2>
              <div class="rating-summary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <strong>{{ averageRating }}</strong>
                <span>dari {{ reviewCount }} ulasan</span>
              </div>
            </div>

            <div v-for="review in reviews" :key="review.name" class="review-item">
              <div class="review-top">
                <div class="review-user-avatar">
                  <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random`" alt="User" />
                </div>
                <div class="review-user-info">
                  <h4>{{ review.name }}</h4>
                  <div class="stars">
                    <svg v-for="i in 5" :key="i" width="12" height="12" viewBox="0 0 24 24" :fill="i <= review.rating ? '#F59E0B' : '#D1D5DB'">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-text">{{ review.text }}</p>
              <button class="helpful-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                </svg>
                Membantu
              </button>
            </div>

            <button class="show-all-btn anim-in">Lihat Semua Ulasan</button>
          </section>
        </div>

        <div class="side-col">
          <div class="pricing-card anim-in">
            <div class="tabs">
              <button 
                v-for="key in ['basic', 'standard', 'premium']" 
                :key="key"
                class="tab-btn"
                :class="{ active: selectedPlan === key }"
                @click="selectedPlan = key as PlanKey"
              >
                {{ key.charAt(0).toUpperCase() + key.slice(1) }}
              </button>
            </div>

            <div class="card-content">
              <div class="card-header">
                <h3 class="plan-name">{{ plans[selectedPlan].name }}</h3>
                <span class="plan-price">{{ plans[selectedPlan].price }}</span>
              </div>

              <ul class="features-list">
                <li v-for="feature in plans[selectedPlan].features" :key="feature">
                  <div class="check-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ClientFooter :show-cta="false" class="page-footer anim-in" />
  </div>
</template>

<style scoped>
.detail-view {
  padding: 2rem;
  background: #fff;
  min-height: 100vh;
  color: #1E3A8A;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #1E3A8A;
}

.image-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 3rem;
}

.main-image {
  width: 100%;
  height: auto;
  display: block;
}

.section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1E3A8A;
}

.description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #475569;
}

.vendor-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 3rem;
}

.vendor-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
}

.vendor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-name {
  font-size: 1.125rem;
  font-weight: 700;
}

.vendor-title {
  font-size: 0.9rem;
  color: #64748b;
}

.vendor-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.table-wrapper {
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
}

.compare-table th {
  text-align: left;
  background: #f8fafc;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.compare-table td {
  padding: 1rem;
  font-size: 0.95rem;
  border-bottom: 1px solid #f1f5f9;
}

.feature-name {
  font-weight: 700;
  color: #1E3A8A;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.rating-summary strong {
  font-size: 1.25rem;
  color: #1E3A8A;
}

.review-item {
  margin-bottom: 2rem;
}

.review-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.review-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.review-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-user-info h4 {
  font-weight: 700;
  font-size: 1rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.review-date {
  margin-left: auto;
  font-size: 0.875rem;
  color: #94a3b8;
}

.review-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 1rem;
}

.helpful-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.show-all-btn {
  width: 100%;
  padding: 1rem;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  background: transparent;
  color: #3b82f6;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.show-all-btn:hover {
  background: #eff6ff;
}

.side-col {
  position: sticky;
  top: 2rem;
}

.pricing-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.tabs {
  display: flex;
  background: #f8fafc;
  padding: 0.5rem;
  gap: 0.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 16px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #fff;
  color: #1E3A8A;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-content {
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1E3A8A;
}

.plan-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1E3A8A;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
}

.check-icon {
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-footer {
  margin-top: 4rem;
  background: #f8fafc;
  padding-bottom: 2rem;
}

.anim-in {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.anim-in.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .side-col {
    position: static;
  }
}
</style>
