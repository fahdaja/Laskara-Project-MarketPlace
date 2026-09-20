<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCategories } from '../../composables/useCategories'
import { useMerchantLeaderboard } from '../../composables/useMerchants'

const router = useRouter()
const heroSearch = ref('')

const { data: categoriesData } = useCategories()
const { data: merchantsData } = useMerchantLeaderboard()

function handleSearch() {
  if (heroSearch.value.trim()) {
    router.push({
      path: '/jelajahi',
      query: { q: heroSearch.value.trim() }
    })
  } else {
    router.push('/jelajahi')
  }
}

const trustFeatures = [
  {
    icon: 'shield',
    title: 'Transaksi Aman',
    desc: 'Sistem pembayaran escrow kami menjamin keamanan dana Anda hingga pekerjaan selesai sesuai standar.',
  },
  {
    icon: 'check',
    title: 'Kualitas Terjamin',
    desc: 'Setiap vendor melalui proses verifikasi ketat untuk memastikan portofolio dan kualitas yang nyata.',
  },
  {
    icon: 'headset',
    title: 'Dukungan 24/7',
    desc: 'Tim bantuan kami siap mendampingi Anda dari proses pemilihan vendor hingga penyelesaian proyek.',
  },
]

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__content animate-on-scroll slide-up">
          <h1 class="hero__title">
            Temukan
            <span class="hero__title--accent">Keahlian Terbaik</span>
            Untuk Bisnis Anda.
          </h1>
          <p class="hero__subtitle">
            LayananPro menghubungkan Anda dengan puluhan vendor profesional terverifikasi untuk setiap kebutuhan proyek Anda.
          </p>
          <div class="hero__search">
            <svg class="hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input v-model="heroSearch" type="search" placeholder="Cari desain, web..." class="hero__search-input" aria-label="Cari layanan" @keyup.enter="handleSearch" />
            <button class="hero__search-btn" @click="handleSearch" aria-label="Cari sekarang">Cari Sekarang</button>
          </div>
        </div>
        <div class="hero__visual animate-on-scroll slide-left" style="transition-delay: 200ms">
          <img src="/images/hero-creative-studio.png" alt="Creative studio team collaborating" class="hero__image" loading="eager" />
          <div class="hero__card">
            <div class="hero__card-info">
              <span class="hero__card-name">Creative Studio</span>
              <span class="hero__card-promo">Diskon hingga 30% untuk bulan ini</span>
            </div>
            <button class="hero__card-btn">Lihat Penawaran</button>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="categories">
      <div class="categories__inner">
        <h2 class="section-title animate-on-scroll slide-up">Jelajahi Berdasarkan Kategori</h2>
        <p class="section-subtitle animate-on-scroll slide-up" style="transition-delay: 100ms">Temukan spesialisasi yang tepat sesuai kebutuhan proyek Anda.</p>
        <div class="categories__grid">
          <router-link v-for="(cat, idx) in categoriesData" :key="cat.id" :to="`/jelajahi?categoryId=${cat.id}`" class="category-card animate-on-scroll slide-up" :style="{ transitionDelay: `${(Number(idx) % 4) * 50 + 150}ms` }" :aria-label="cat.name">
            <div class="category-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-9.5-10-9.5z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="10.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>
            </div>
            <span class="category-card__name">{{ cat.name }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner">
      <div class="cta-banner__inner animate-on-scroll slide-up">
        <div class="cta-banner__content">
          <h2 class="cta-banner__title">Bantu Bisnis Anda Berkembang Dengan Profesional Terbaik</h2>
          <p class="cta-banner__desc">Platform kurasi vendor ekosistem kampus Telkom University.</p>
        </div>
        <button class="cta-banner__btn">Mulai Sekarang</button>
      </div>
    </section>

    <!-- VENDORS -->
    <section class="vendors">
      <div class="vendors__inner">
        <div class="vendors__header animate-on-scroll slide-up">
          <h2 class="section-title">Vendor Terpilih Minggu ini</h2>
          <router-link to="/jelajahi" class="vendors__see-all">Lihat Semua
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </router-link>
        </div>
        <div class="vendors__grid">
          <router-link v-for="(v, idx) in merchantsData" :key="v.id" :to="`/vendor/${v.id}`" class="vendor-card animate-on-scroll slide-up" :style="{ transitionDelay: `${Number(idx) * 100 + 150}ms` }">
            <div class="vendor-card__img-wrapper">
              <img :src="v.user?.avatarUrl || '/images/default-avatar.png'" :alt="v.storeName" class="vendor-card__img" loading="lazy" />
            </div>
            <div class="vendor-card__body">
              <h3 class="vendor-card__name">{{ v.storeName }}</h3>
              <div class="vendor-card__meta">
                <span class="vendor-card__rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {{ (v.avgRating || 0).toFixed(1) }}
                </span>
                <span class="vendor-card__reviews">({{ v.totalReviews || 0 }} reviews)</span>
              </div>
              <div class="vendor-card__price">
                <span class="vendor-card__price-label" v-if="v.gigs?.[0]">Starting from</span>
                <span class="vendor-card__price-value" v-if="v.gigs?.[0]">Rp {{ v.gigs[0].price.toLocaleString() }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- TRUST -->
    <section class="trust">
      <div class="trust__inner">
        <div class="trust__grid">
          <div v-for="(f, idx) in trustFeatures" :key="f.title" class="trust-card animate-on-scroll slide-up" :style="{ transitionDelay: `${Number(idx) * 150 + 100}ms` }">
            <div class="trust-card__icon">
              <svg v-if="f.icon === 'shield'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <svg v-if="f.icon === 'check'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <svg v-if="f.icon === 'headset'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>
            </div>
            <h3 class="trust-card__title">{{ f.title }}</h3>
            <p class="trust-card__desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ========================================
   ANIMATIONS
   ======================================== */
.animate-on-scroll {
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.slide-up {
  transform: translateY(40px);
}

.animate-on-scroll.slide-left {
  transform: translateX(40px);
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translate(0, 0);
}

/* ========================================
   SHARED
   ======================================== */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.section-subtitle {
  font-size: 0.9375rem;
  color: #6B7280;
  margin-top: 0.375rem;
}

/* ========================================
   HERO
   ======================================== */
.hero {
  background: #fff;
  padding: 3rem 0 0;
  overflow: hidden;
}

.hero__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero__title {
  font-size: 3rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.hero__title--accent {
  color: #3B5BDB;
  display: block;
}

.hero__subtitle {
  font-size: 0.9375rem;
  color: #6B7280;
  line-height: 1.7;
  margin-top: 1rem;
  max-width: 420px;
}

.hero__search {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  max-width: 420px;
  transition: border-color 0.2s;
}

.hero__search:focus-within {
  border-color: #3B5BDB;
  box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.08);
}

.hero__search-icon {
  color: #9CA3AF;
  flex-shrink: 0;
}

.hero__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: #374151;
  padding: 0.5rem;
}

.hero__search-input::placeholder {
  color: #9CA3AF;
}

.hero__search-btn {
  padding: 0.5rem 1.25rem;
  background: #3B5BDB;
  color: #fff;
  font-weight: 600;
  font-size: 0.8125rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.hero__search-btn:hover {
  background: #2F4DC4;
}

.hero__visual {
  position: relative;
}

.hero__image {
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

.hero__card {
  position: absolute;
  bottom: 1.25rem;
  left: 1.25rem;
  right: 1.25rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero__card-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.hero__card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.hero__card-promo {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.hero__card-btn {
  padding: 0.4rem 1rem;
  background: #fff;
  color: #111827;
  font-weight: 600;
  font-size: 0.75rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, transform 0.15s;
}

.hero__card-btn:hover {
  background: #F3F4F6;
  transform: translateY(-1px);
}

/* ========================================
   CATEGORIES
   ======================================== */
.categories {
  padding: 4rem 0;
}

.categories__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.categories__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 0.5rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.category-card:hover {
  background: #F3F4F6;
}

.category-card:hover .category-card__icon {
  color: #3B5BDB;
  border-color: #3B5BDB;
}

.category-card__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  color: #374151;
  transition: all 0.2s;
}

.category-card__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

/* ========================================
   CTA BANNER
   ======================================== */
.cta-banner {
  padding: 0 1.5rem;
}

.cta-banner__inner {
  max-width: 1280px;
  margin: 0 auto;
  background: #3B5BDB;
  border-radius: 20px;
  padding: 3rem 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cta-banner__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  max-width: 420px;
  line-height: 1.3;
}

.cta-banner__desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
}

.cta-banner__btn {
  padding: 0.625rem 1.75rem;
  background: #fff;
  color: #3B5BDB;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.cta-banner__btn:hover {
  background: #F3F4F6;
  transform: translateY(-1px);
}

/* ========================================
   VENDORS
   ======================================== */
.vendors {
  padding: 4rem 0;
}

.vendors__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.vendors__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vendors__see-all {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3B5BDB;
  text-decoration: none;
  transition: gap 0.2s;
  cursor: pointer;
}

.vendors__see-all:hover {
  gap: 0.5rem;
}

.vendors__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.vendor-card {
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #E5E7EB;
  text-decoration: none;
  transition: all 0.25s;
  cursor: pointer;
}

.vendor-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.vendor-card__img-wrapper {
  overflow: hidden;
  height: 200px;
}

.vendor-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.vendor-card:hover .vendor-card__img {
  transform: scale(1.05);
}

.vendor-card__body {
  padding: 1rem 1.25rem 1.25rem;
}

.vendor-card__name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.vendor-card__meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.vendor-card__rating {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.vendor-card__reviews {
  font-size: 0.8125rem;
  color: #9CA3AF;
}

.vendor-card__price {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 0.625rem;
}

.vendor-card__price-label {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.vendor-card__price-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

/* ========================================
   TRUST
   ======================================== */
.trust {
  padding: 3rem 0 5rem;
  border-top: 1px solid #F3F4F6;
}

.trust__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.trust__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.trust-card {
  text-align: center;
  padding: 2rem 1.5rem;
}

.trust-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #EDE9FE;
  color: #3B5BDB;
  margin-bottom: 1rem;
}

.trust-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.trust-card__desc {
  font-size: 0.8125rem;
  color: #6B7280;
  line-height: 1.7;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 1024px) {
  .hero__title {
    font-size: 2.25rem;
  }

  .hero__image {
    height: 340px;
  }

  .categories__grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .cta-banner__inner {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem 2rem;
  }
}

@media (max-width: 768px) {
  .hero__inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero__title {
    font-size: 2rem;
  }

  .hero__search {
    max-width: 100%;
  }

  .hero__image {
    height: 280px;
  }

  .categories__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .vendors__grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .trust__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 2rem 0 0;
  }

  .hero__title {
    font-size: 1.75rem;
  }

  .categories__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero__card {
    flex-direction: column;
    align-items: flex-start;
  }

  .cta-banner__inner {
    padding: 2rem 1.25rem;
  }

  .cta-banner__title {
    font-size: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vendor-card,
  .vendor-card__img,
  .hero__search-btn,
  .cta-banner__btn,
  .hero__card-btn,
  .category-card,
  .category-card__icon {
    transition: none;
  }
}
</style>
