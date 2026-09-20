<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMyGigs } from '../../composables/useGigs'
import Toast from '../../components/ui/Toast.vue'
import api from '../../api/axios'

const router = useRouter()
const { data: rawGigs, isLoading, refetch } = useMyGigs()

type GigStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'DRAFT' | 'RESTRICTED'

const activeTab = ref<'all' | 'pending' | 'approved' | 'rejected' | 'draft'>('all')

const gigs = computed(() => {
  if (!rawGigs.value) return []
  return rawGigs.value.map((g: any) => {
    let mappedStatus: GigStatus = 'DRAFT'
    if (g.status === 'ACTIVE' || g.status === 'FEATURED') {
      mappedStatus = 'ACTIVE'
    } else if (g.status === 'PENDING_APPROVAL') {
      mappedStatus = 'PENDING'
    } else if (g.status === 'REJECTED') {
      mappedStatus = 'REJECTED'
    } else if (g.status === 'PAUSED' || g.status === 'REMOVED') {
      mappedStatus = 'RESTRICTED'
    } else {
      mappedStatus = 'DRAFT'
    }

    let parsedDesc = g.description
    try {
      const parsed = JSON.parse(g.description)
      if (parsed && typeof parsed === 'object' && parsed.text) {
        parsedDesc = parsed.text
      }
    } catch (_) {}

    return {
      id: g.id,
      title: g.title,
      description: parsedDesc,
      price: typeof g.price === 'string' ? parseFloat(g.price) : g.price,
      status: mappedStatus,
      mediaUrls: g.mediaUrls || '',
      isPromoted: g.featuredStatus === 'FEATURED',
      rejectionNote: g.rejectionReason || undefined
    }
  })
})

const showRejectionNote = ref<number | null>(null)
const showToast = ref(false)
const toastData = ref({ type: 'success' as 'success' | 'info' | 'error', title: '', subtitle: '' })

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'draft', label: 'Draf' },
]

function showToastMsg(type: 'success' | 'info' | 'error', title: string, subtitle: string) {
  toastData.value = { type, title, subtitle }
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

const filteredGigs = computed(() => {
  if (activeTab.value === 'all') return gigs.value
  const map: Record<string, GigStatus[]> = {
    pending: ['PENDING'],
    approved: ['ACTIVE', 'RESTRICTED'],
    rejected: ['REJECTED'],
    draft: ['DRAFT'],
  }
  return gigs.value.filter((g: any) => map[activeTab.value]?.includes(g.status))
})

function formatPrice(n: number) {
  return 'Rp' + n.toLocaleString('id-ID')
}

function statusLabel(s: GigStatus) {
  const m: Record<GigStatus, string> = {
    ACTIVE: 'AKTIF',
    PENDING: 'MENUNGGU PERSETUJUAN',
    REJECTED: 'DITOLAK',
    DRAFT: 'DRAF',
    RESTRICTED: 'DIBATASI',
  }
  return m[s]
}

function statusClass(s: GigStatus) {
  const m: Record<GigStatus, string> = {
    ACTIVE: 'badge-active',
    PENDING: 'badge-pending',
    REJECTED: 'badge-rejected',
    DRAFT: 'badge-draft',
    RESTRICTED: 'badge-restricted',
  }
  return m[s]
}

function toggleNote(id: number) {
  showRejectionNote.value = showRejectionNote.value === id ? null : id
}

async function deleteGig(id: number) {
  if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return
  try {
    await api.delete(`/gigs/${id}`)
    showToastMsg('success', 'Layanan Dihapus', 'Layanan berhasil dihapus dari katalog')
    refetch()
  } catch (err) {
    console.error('Failed to delete gig', err)
    showToastMsg('error', 'Gagal Menghapus', 'Tidak dapat menghapus layanan dari server')
  }
}
</script>

<template>
  <div class="catalog-page">
    <div v-if="showToast" class="fixed top-8 right-8 z-50">
      <Toast :type="toastData.type" :title="toastData.title" :subtitle="toastData.subtitle" />
    </div>

    <!-- Header -->
    <h1 class="page-title">Manajemen Layanan</h1>

    <!-- Tabs + CTA -->
    <div class="tabs-row">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key as any"
        >
          {{ tab.label }}
        </button>
      </div>
      <router-link to="/vendor/catalog/add" class="btn-create">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Buat Layanan Baru
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm font-semibold">Memuat katalog layanan Anda...</p>
    </div>

    <!-- Cards Grid -->
    <div v-else class="cards-grid">
      <div
        v-for="gig in filteredGigs"
        :key="gig.id"
        class="gig-card"
        :class="{ 'is-draft': gig.status === 'DRAFT' }"
      >
        <!-- Thumbnail -->
        <div class="gig-thumb">
          <img v-if="gig.mediaUrls" :src="gig.mediaUrls" alt="Thumbnail" class="w-full h-full object-cover" />
          <div v-else class="thumb-placeholder">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <span v-if="gig.status !== 'DRAFT'" class="status-badge" :class="statusClass(gig.status)">
            {{ statusLabel(gig.status) }}
          </span>
        </div>

        <!-- Info -->
        <div class="gig-info">
          <h3 class="gig-title">{{ gig.title }}</h3>
          <p class="gig-desc">{{ gig.description }}</p>
          <div class="gig-footer">
            <span class="gig-price">{{ formatPrice(gig.price) }}</span>
            <button
              v-if="gig.status !== 'DRAFT' && gig.status !== 'REJECTED'"
              class="edit-btn"
              @click="router.push(`/vendor/catalog/edit/${gig.id}`)"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
          </div>

          <!-- Promotion badge -->
          <div v-if="gig.status === 'RESTRICTED' && !gig.isPromoted" class="promo-disabled">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            PROMOSI DINONAKTIFKAN
          </div>

          <button v-if="gig.isPromoted && gig.status === 'ACTIVE'" class="boost-btn" @click="router.push(`/vendor/catalog/promote/${gig.id}`)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            BOOST LAYANAN
          </button>

          <!-- Pending info -->
          <div v-if="gig.status === 'PENDING'" class="pending-info">
            <span class="pending-dot"></span>
            Menunggu review
          </div>

          <!-- Rejected note -->
          <div v-if="gig.status === 'REJECTED'" class="rejected-actions">
            <button class="note-btn" @click="toggleNote(gig.id)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
              LIHAT CATATAN
            </button>
          </div>
          <Transition name="note-fade">
            <div v-if="showRejectionNote === gig.id && gig.rejectionNote" class="rejection-note">
              "{{ gig.rejectionNote }}"
            </div>
          </Transition>

          <!-- Draft actions -->
          <div v-if="gig.status === 'DRAFT'" class="draft-actions">
            <button class="btn-continue" @click="router.push(`/vendor/catalog/edit/${gig.id}`)">
              Lanjutkan edit
            </button>
            <button class="btn-delete" @click="deleteGig(gig.id)" title="Hapus">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Card -->
      <div class="gig-card add-card" @click="router.push('/vendor/catalog/add')">
        <div class="add-card-inner">
          <div class="add-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>
          </div>
          <h3 class="add-title">Tambah Gig Lainnya</h3>
          <p class="add-desc">Punya keahlian baru? Buat gig tambahan untuk menjangkau lebih banyak klien.</p>
          <span class="add-link">Mulai Membuat</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-page {
  padding: 8px 4px 48px;
  font-family: 'Inter', system-ui, sans-serif;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 32px;
}

/* Tabs Row */
.tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #1e293b;
}

.tab-btn.active {
  color: #1e293b;
  font-weight: 600;
  border-bottom-color: #3b82f6;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.15s ease;
  white-space: nowrap;
}

.btn-create:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* Gig Card */
.gig-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.gig-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
}

/* Thumbnail */
.gig-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #1a1a2e;
  overflow: hidden;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.badge-active {
  background: #059669;
  color: white;
}

.badge-pending {
  background: #3b82f6;
  color: white;
}

.badge-rejected {
  background: #ef4444;
  color: white;
}

.badge-draft {
  background: #6b7280;
  color: white;
}

.badge-restricted {
  background: #374151;
  color: white;
}

/* Gig Info */
.gig-info {
  padding: 16px 20px 20px;
}

.gig-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.gig-desc {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gig-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gig-price {
  font-size: 1rem;
  font-weight: 800;
  color: #1e3a8a;
}

.edit-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Promotion */
.promo-disabled {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.boost-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 16px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease;
}

.boost-btn:hover {
  background: #047857;
}

/* Pending */
.pending-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 14px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.pending-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Rejected */
.rejected-actions {
  margin-top: 10px;
}

.note-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.note-btn:hover {
  color: #dc2626;
}

.rejection-note {
  margin-top: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  border-left: 3px solid #ef4444;
  border-radius: 0 8px 8px 0;
  font-size: 0.78rem;
  color: #b91c1c;
  font-style: italic;
  font-weight: 600;
  line-height: 1.5;
}

.note-fade-enter-active { transition: all 0.25s ease; }
.note-fade-leave-active { transition: all 0.2s ease; }
.note-fade-enter-from, .note-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* Draft Actions */
.draft-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.btn-continue {
  flex: 1;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-continue:hover {
  background: #2563eb;
}

.btn-delete {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid #fecaca;
  background: white;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-delete:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

/* Add Card */
.add-card {
  border: 2px dashed #d1d5db;
  background: #fafafa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  transition: all 0.25s ease;
}

.add-card:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.add-card-inner {
  text-align: center;
  padding: 32px;
}

.add-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.add-card:hover .add-icon {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.add-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

.add-desc {
  font-size: 0.78rem;
  color: #9ca3af;
  line-height: 1.5;
  max-width: 220px;
  margin: 0 auto 12px;
}

.add-link {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ef4444;
  transition: color 0.2s;
}

.add-card:hover .add-link {
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .tabs-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gig-card, .btn-create, .boost-btn, .pending-dot, .tab-btn {
    transition: none !important;
    animation: none !important;
  }
}
</style>
