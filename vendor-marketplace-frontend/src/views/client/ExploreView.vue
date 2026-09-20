<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCategories } from '../../composables/useCategories'
import { useGigsList } from '../../composables/useGigs'

const route = useRoute()
const selectedCategoryId = ref<number | null>(route.query.categoryId ? Number(route.query.categoryId) : null)
const sortBy = ref('popular')
const showSortDropdown = ref(false)
const priceMin = ref('0')
const priceMax = ref('5000000')
const selectedRatings = ref<number[]>([])
const searchQuery = ref(route.query.q ? String(route.query.q) : '')

const { data: categoriesData } = useCategories()
const { data: gigList, isLoading } = useGigsList()

watch(() => route.query.categoryId, (newVal) => {
  if (newVal) selectedCategoryId.value = Number(newVal)
})

watch(() => route.query.q, (newVal) => {
  searchQuery.value = newVal ? String(newVal) : ''
})

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function selectCategory(id: number | null) {
  if (selectedCategoryId.value === id) {
    selectedCategoryId.value = null
  } else {
    selectedCategoryId.value = id
  }
}

function parseNumericPrice(val: string | number) {
  if (typeof val === 'number') return val
  const cleaned = String(val).replace(/[^0-9]/g, '')
  return parseFloat(cleaned) || 0
}

function toggleRating(star: number) {
  const idx = selectedRatings.value.indexOf(star)
  if (idx > -1) selectedRatings.value.splice(idx, 1)
  else selectedRatings.value.push(star)
}

function selectSort(value: string) {
  sortBy.value = value
  showSortDropdown.value = false
}

const closeSortDropdown = () => {
  showSortDropdown.value = false
}

const sortLabel: Record<string, string> = {
  popular: 'Populer',
  newest: 'Terbaru',
  cheapest: 'Termurah',
  rating: 'Rating Tertinggi',
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  window.addEventListener('click', closeSortDropdown)
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

onUnmounted(() => {
  window.removeEventListener('click', closeSortDropdown)
})

watch(isLoading, (loading) => {
  if (!loading) {
    nextTick(() => {
      document.querySelectorAll('.anim-in').forEach((el) => observer?.observe(el))
    })
  }
})

const products = computed(() => {
  if (!gigList.value) return []
  
  let list = gigList.value.map((g: any) => {
    let title = g.title
    let price = parseFloat(g.price)
    let image = g.mediaUrls
    
    try {
      if (g.description && (g.description.startsWith('{') || g.description.startsWith('['))) {
        const parsed = JSON.parse(g.description)
        if (parsed.tiers?.standard?.price) {
          price = parseFloat(String(parsed.tiers.standard.price).replace(/[^0-9]/g, '')) || price
        }
      }
    } catch (e) {
    }

    return {
      id: g.id,
      title: title,
      vendor: g.merchant?.shopName || 'Vendor',
      avatar: g.merchant?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.merchant?.shopName || 'Vendor')}&background=random`,
      rating: 5.0,
      price: price,
      image: image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      categoryId: g.categoryId,
      categoryName: g.category?.name || 'Lainnya',
      createdAt: g.createdAt
    }
  })

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p: any) =>
      p.title.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q)
    )
  }

  if (selectedCategoryId.value !== null) {
    list = list.filter((p: any) => p.categoryId === selectedCategoryId.value)
  }

  const minVal = parseNumericPrice(priceMin.value)
  const maxVal = priceMax.value === '' ? Infinity : parseNumericPrice(priceMax.value)
  list = list.filter((p: any) => p.price >= minVal && p.price <= maxVal)

  if (selectedRatings.value.length > 0) {
    const minRating = Math.min(...selectedRatings.value)
    list = list.filter((p: any) => p.rating >= minRating)
  }

  if (sortBy.value === 'popular') {
    list.sort((a: any, b: any) => b.rating - a.rating)
  } else if (sortBy.value === 'newest') {
    list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (sortBy.value === 'cheapest') {
    list.sort((a: any, b: any) => a.price - b.price)
  } else if (sortBy.value === 'rating') {
    list.sort((a: any, b: any) => b.rating - a.rating)
  }

  return list
})

watch(products, () => {
  nextTick(() => {
    document.querySelectorAll('.anim-in').forEach((el) => observer?.observe(el))
  })
})
</script>

<template>
  <div class="explore">
    <div class="explore__inner">
      <!-- Header -->
      <div class="explore__header anim-in">
        <h1 class="explore__title">Jelajahi</h1>
        <div class="explore__sort">
          <span class="explore__sort-label">Urutkan</span>
          <div class="sort-dropdown" @click.stop>
            <button class="sort-dropdown__btn" @click="showSortDropdown = !showSortDropdown">
              {{ sortLabel[sortBy] }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <Transition name="dropdown">
              <div v-if="showSortDropdown" class="sort-dropdown__menu">
                <button v-for="(label, key) in sortLabel" :key="key" class="sort-dropdown__item" :class="{ 'sort-dropdown__item--active': sortBy === key }" @click="selectSort(key as string)">{{ label }}</button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="explore__body">
        <!-- Sidebar Filters -->
        <aside class="filters anim-in">
          <div class="filters__header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
            <span>Filter</span>
          </div>

          <div class="filter-group">
            <h3 class="filter-group__title">Cari Jasa</h3>
            <div class="filter-search-box">
              <input type="text" v-model="searchQuery" placeholder="Cari kata kunci..." class="filter-search-input" />
            </div>
          </div>

          <div class="filter-group">
            <h3 class="filter-group__title">Kategori Jasa</h3>
            <label class="filter-check">
              <input type="checkbox" :checked="selectedCategoryId === null" @change="selectCategory(null)" />
              <span class="filter-check__mark"></span>
              <span class="filter-check__label">Semua Kategori</span>
            </label>
            <label v-for="cat in categoriesData" :key="cat.id" class="filter-check">
              <input type="checkbox" :checked="selectedCategoryId === cat.id" @change="selectCategory(cat.id)" />
              <span class="filter-check__mark"></span>
              <span class="filter-check__label">{{ cat.name }}</span>
            </label>
          </div>

          <div class="filter-group">
            <h3 class="filter-group__title">Range Harga</h3>
            <input type="range" min="0" max="5000000" step="50000" v-model="priceMax" class="filter-range" />
            <div class="filter-price-inputs">
              <div class="filter-price-box">
                <span class="filter-price-label">MIN</span>
                <div class="filter-price-field"><span>Rp</span><input type="text" v-model="priceMin" /></div>
              </div>
              <div class="filter-price-box">
                <span class="filter-price-label">MAX</span>
                <div class="filter-price-field"><span>Rp</span><input type="text" v-model="priceMax" /></div>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <h3 class="filter-group__title">Rating Minimum</h3>
            <label v-for="star in [5, 4, 3, 2]" :key="star" class="filter-check">
              <input type="checkbox" :checked="selectedRatings.includes(star)" @change="toggleRating(star)" />
              <span class="filter-check__mark"></span>
              <span class="filter-check__stars">
                <svg v-for="s in 5" :key="s" width="14" height="14" viewBox="0 0 24 24" :fill="s <= star ? '#F59E0B' : '#D1D5DB'" :stroke="s <= star ? '#F59E0B' : '#D1D5DB'" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>{{ star }}+ Bintang</span>
              </span>
            </label>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="products">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-500 w-full">
            <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-semibold">Memuat daftar jasa...</p>
          </div>

          <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 w-full text-center">
            <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p class="text-base font-bold text-gray-700 mb-1">Tidak ada jasa ditemukan</p>
            <p class="text-xs text-gray-400">Coba ubah filter atau rentang harga pencarian Anda</p>
          </div>

          <div v-else class="products__grid">
            <router-link
              v-for="(p, idx) in products"
              :key="p.id"
              :to="`/jelajahi/${p.id}`"
              class="product-card anim-in"
              :style="{ transitionDelay: `${(Number(idx) % 3) * 80 + 100}ms` }"
            >
              <div class="product-card__img-wrapper">
                <img :src="p.image" :alt="p.title" class="product-card__img" loading="lazy" />
                <span class="product-card__badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {{ p.rating }}
                </span>
              </div>
              <div class="product-card__body">
                <div class="product-card__vendor">
                  <div class="product-card__avatar" :style="`background-image: url(${p.avatar}); background-size: cover; background-position: center;`"></div>
                  <div>
                    <h3 class="product-card__title">{{ p.title }}</h3>
                    <span class="product-card__vendor-name">{{ p.vendor }}</span>
                  </div>
                </div>
                <div class="product-card__footer">
                  <span class="product-card__price-label">MULAI DARI</span>
                  <span class="product-card__price">{{ formatPrice(p.price) }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anim-in { opacity: 0; transform: translateY(24px); transition: all 1.2s cubic-bezier(0.16,1,0.3,1); }
.anim-in.visible { opacity: 1; transform: translateY(0); }

.explore { padding: 2rem 0 4rem; }
.explore__inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.explore__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.explore__title { font-size: 2rem; font-weight: 800; color: #111827; font-style: italic; }
.explore__sort { display: flex; align-items: center; gap: 0.75rem; }
.explore__sort-label { font-size: 0.875rem; color: #6B7280; }

.sort-dropdown { position: relative; }
.sort-dropdown__btn {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
  border: 1px solid #E5E7EB; border-radius: 9999px; background: #fff;
  font-size: 0.875rem; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s;
}
.sort-dropdown__btn:hover { border-color: #3B5BDB; }
.sort-dropdown__menu {
  position: absolute; top: calc(100% + 6px); right: 0; width: 180px;
  background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 0.25rem 0; z-index: 10;
}
.sort-dropdown__item {
  display: block; width: 100%; padding: 0.5rem 1rem; text-align: left;
  font-size: 0.8125rem; color: #374151; background: none; border: none; cursor: pointer; transition: background 0.15s;
}
.sort-dropdown__item:hover { background: #F9FAFB; }
.sort-dropdown__item--active { color: #3B5BDB; font-weight: 600; }

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

.explore__body { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; }

/* Filters */
.filters { position: sticky; top: 80px; align-self: start; }
.filters__header { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; font-weight: 700; color: #3B5BDB; margin-bottom: 1.5rem; }
.filter-group { margin-bottom: 2rem; }
.filter-group__title { font-size: 0.8125rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; }
.filter-check { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0; cursor: pointer; }
.filter-check input { display: none; }
.filter-check__mark {
  width: 18px; height: 18px; border: 1.5px solid #D1D5DB; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;
}
.filter-check input:checked + .filter-check__mark { background: #3B5BDB; border-color: #3B5BDB; }
.filter-check input:checked + .filter-check__mark::after { content: ''; display: block; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -1px; }
.filter-check__label { font-size: 0.875rem; color: #374151; }
.filter-check__stars { display: flex; align-items: center; gap: 0.125rem; font-size: 0.8125rem; color: #374151; }
.filter-check__stars span { margin-left: 0.375rem; }

.filter-range { width: 100%; margin-bottom: 0.75rem; accent-color: #3B5BDB; }
.filter-price-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.filter-price-box { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-price-label { font-size: 0.6875rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; }
.filter-price-field {
  display: flex; align-items: center; gap: 0.25rem; padding: 0.375rem 0.5rem;
  border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.8125rem; color: #374151;
}
.filter-price-field span { color: #9CA3AF; font-size: 0.75rem; }
.filter-price-field input { border: none; outline: none; width: 100%; font-size: 0.8125rem; color: #374151; background: transparent; }

/* Products */
.products__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

.product-card {
  border-radius: 16px; overflow: hidden; background: #fff; border: 1px solid #E5E7EB;
  text-decoration: none; transition: all 0.3s ease; cursor: pointer;
}
.product-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.08); transform: translateY(-4px); }
.product-card__img-wrapper { position: relative; overflow: hidden; height: 200px; }
.product-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.product-card:hover .product-card__img { transform: scale(1.05); }
.product-card__badge {
  position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 0.25rem;
  padding: 0.25rem 0.625rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  border-radius: 9999px; font-size: 0.75rem; font-weight: 600; color: #fff;
}
.product-card__body { padding: 1rem 1.25rem 1.25rem; }
.product-card__vendor { display: flex; align-items: flex-start; gap: 0.625rem; }
.product-card__avatar { width: 32px; height: 32px; border-radius: 50%; background: #E5E7EB; flex-shrink: 0; }
.product-card__title { font-size: 0.9375rem; font-weight: 600; color: #111827; line-height: 1.3; }
.product-card__vendor-name { font-size: 0.75rem; color: #6B7280; margin-top: 0.125rem; display: block; }
.product-card__footer { margin-top: 0.75rem; display: flex; flex-direction: column; }
.product-card__price-label { font-size: 0.625rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; }
.product-card__price { font-size: 1.125rem; font-weight: 700; color: #111827; margin-top: 0.125rem; }

@media (max-width: 1024px) {
  .products__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .explore__body { grid-template-columns: 1fr; }
  .filters { position: static; }
  .products__grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
}
@media (max-width: 480px) {
  .products__grid { grid-template-columns: 1fr; }
  .explore__title { font-size: 1.5rem; }
}
@media (prefers-reduced-motion: reduce) {
  .anim-in, .product-card, .product-card__img { transition: none; }
}

.filter-search-box {
  display: flex;
  align-items: center;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
  background: #fff;
  transition: border-color 0.2s;
}
.filter-search-box:focus-within {
  border-color: #3B5BDB;
}
.filter-search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.8125rem;
  color: #374151;
  background: transparent;
}
</style>
