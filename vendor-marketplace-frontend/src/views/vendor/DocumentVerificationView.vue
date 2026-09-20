<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { profileQuery, submitKybMutation, uploadFile, logout } = useAuth()

const merchant = computed(() => profileQuery.data.value?.merchant)
const status = computed(() => merchant.value?.status || 'INCOMPLETE')

const store = computed(() => ({
  name: merchant.value?.shopName || 'Nama Toko Belum Diatur',
  category: 'Creative Services',
  description: merchant.value?.description || 'Belum ada deskripsi.',
  bankName: 'Bank Central Asia (BCA)',
  bankAccount: '**** 8892',
  banner: merchant.value?.bannerUrl || '/images/products/product-1.jpg',
}))

const parsedKyb = computed(() => {
  if (!merchant.value?.kybDocuments) return null
  try {
    return JSON.parse(merchant.value.kybDocuments)
  } catch (e) {
    return null
  }
})

const kybFile = ref<File | null>(null)
const kybPreview = ref('')
const portfolioUrl = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const allowedKybTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

function validateKybFile(f: File): boolean {
  if (!allowedKybTypes.includes(f.type)) {
    errorMessage.value = 'Format dokumen KYB harus berupa PDF, JPG, atau PNG.'
    kybFile.value = null
    kybPreview.value = ''
    return false
  }
  errorMessage.value = ''
  return true
}

function handleKybFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!validateKybFile(f)) {
    (e.target as HTMLInputElement).value = ''
    return
  }
  kybFile.value = f
  kybPreview.value = f.name
}

function dropKybFile(e: DragEvent) {
  e.preventDefault()
  const f = e.dataTransfer?.files?.[0]
  if (!f) return
  if (!validateKybFile(f)) return
  kybFile.value = f
  kybPreview.value = f.name
}

async function handleKybSubmit() {
  if (!kybFile.value) {
    errorMessage.value = 'Silakan pilih dokumen KTM / SK Organisasi terlebih dahulu.'
    return
  }
  if (!validateKybFile(kybFile.value)) {
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const uploadRes = await uploadFile(kybFile.value, 'merchant-kyb')
    const fileUrl = uploadRes.url

    await submitKybMutation.mutateAsync({
      kybDocumentUrl: fileUrl,
      portfolioUrl: portfolioUrl.value || ''
    })
  } catch (err: any) {
    console.error('Error submitting KYB:', err)
    errorMessage.value = err?.response?.data?.message || 'Gagal mengirimkan dokumen verifikasi KYB.'
  } finally {
    isSubmitting.value = false
  }
}

function docStatusLabel(s: string) {
  if (s === 'ACTIVE') return 'Terverifikasi'
  if (s === 'PENDING_VERIFICATION') return 'Menunggu'
  if (s === 'REJECTED') return 'Ditolak'
  return 'Belum Diunggah'
}

function docStatusClass(s: string) {
  if (s === 'ACTIVE') return 'doc-badge--green'
  if (s === 'PENDING_VERIFICATION') return 'doc-badge--orange'
  return 'doc-badge--gray'
}
</script>

<template>
  <div class="pv-page">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <!-- Back -->
      <button class="pv-back" style="margin-bottom: 0;" @click="router.back()" aria-label="Kembali">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      <!-- Logout -->
      <button class="pv-back" style="margin-bottom: 0; width: auto; padding: 0 1rem; border-color: #EF4444; color: #EF4444; font-size: 0.85rem; font-weight: 600;" @click="logout()" aria-label="Keluar">
        Keluar
      </button>
    </div>

    <h1 class="pv-title">Profil & Verifikasi</h1>
    <p class="pv-subtitle">Kelola identitas toko Anda dan pantau proses verifikasi akun.</p>

    <!-- Status Banner -->
    <div class="pv-banner" :class="`pv-banner--${status}`">
      <div class="pv-banner__icon">
        <svg v-if="status === 'PENDING_VERIFICATION'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <svg v-else-if="status === 'REJECTED'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div class="pv-banner__text">
        <strong v-if="status === 'PENDING_VERIFICATION'">Sedang Ditinjau</strong>
        <strong v-else-if="status === 'REJECTED'">Pengajuan toko Anda belum dapat disetujui.</strong>
        <strong v-else-if="status === 'INCOMPLETE' && parsedKyb">Dokumen Sedang Diproses</strong>
        <strong v-else-if="status === 'INCOMPLETE'">Profil Belum Lengkap</strong>
        <strong v-else>Toko Anda berhasil diverifikasi! 🎉</strong>
        
        <p v-if="status === 'PENDING_VERIFICATION'">Tim verifikator kami sedang memeriksa dokumen Anda. Proses ini biasanya memakan waktu 1-2 hari kerja.</p>
        <p v-else-if="status === 'REJECTED'">{{ merchant?.rejectionReason || 'Silakan perbaiki data dan kirim ulang untuk proses verifikasi.' }}</p>
        <p v-else-if="status === 'INCOMPLETE' && parsedKyb">Dokumen KYB Anda sudah dikirim dan sedang dalam antrean untuk ditinjau.</p>
        <p v-else-if="status === 'INCOMPLETE'">Lengkapi data toko dan unggah dokumen KYB untuk memulai verifikasi.</p>
        <p v-else>Sekarang Anda sudah dapat mulai menawarkan layanan dan menerima pesanan.</p>
      </div>
      <span class="pv-banner__badge" :class="`pv-banner__badge--${status}`">
        {{ status }}
      </span>
    </div>

    <!-- Identitas Toko -->
    <section class="pv-section">
      <div class="pv-section__head">
        <div class="pv-section__icon pv-section__icon--blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        <div>
          <h2>Identitas Toko</h2>
          <p>Informasi publik yang akan dilihat oleh pelanggan Anda.</p>
        </div>
      </div>

      <div class="pv-store-banner">
        <img :src="store.banner" alt="Store banner" class="pv-store-banner__img" />
        <div class="pv-store-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <span v-if="status === 'REJECTED'" class="pv-store-badge pv-store-badge--red">DITOLAK</span>
      </div>

      <h3 class="pv-store-name">{{ store.name }}</h3>
      <span class="pv-store-cat">{{ store.category }}</span>

      <div class="pv-detail-block">
        <label>DESKRIPSI SINGKAT</label>
        <p>{{ store.description }}</p>
      </div>

      <div class="pv-detail-block">
        <label>METODE PEMBAYARAN</label>
        <p>{{ store.bankName }}<br/><span class="pv-muted">Rek: {{ store.bankAccount }}</span></p>
        <button class="pv-link-btn">Ubah Informasi</button>
      </div>
    </section>

    <!-- Dokumen Verifikasi -->
    <h2 class="pv-section-title">Dokumen Verifikasi</h2>
    <div class="pv-docs">
      <div class="pv-doc">
        <div class="pv-doc__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="pv-doc__info">
          <span class="pv-doc__name" style="margin-bottom: 0.375rem;">KTM / SK Organisasi</span>
          <div v-if="(status === 'INCOMPLETE' || status === 'REJECTED') && !parsedKyb">
            <div class="pv-upload-box" @click="($refs.kybFileInput as HTMLInputElement).click()" @dragover.prevent @drop="dropKybFile($event)">
              <template v-if="kybPreview">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="pv-upload-box__text" style="color:#10B981">{{ kybPreview }}</span>
              </template>
              <template v-else>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="pv-upload-box__text">Klik / Taruh berkas KTM/SK di sini</span>
              </template>
            </div>
            <input ref="kybFileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" hidden @change="handleKybFile($event)" />
          </div>
          <span v-else class="pv-doc__file">{{ parsedKyb?.kybDocumentUrl || 'Sedang diverifikasi' }}</span>
        </div>
        <span class="doc-badge" :class="docStatusClass(status)">{{ docStatusLabel(status) }}</span>
      </div>

      <div class="pv-doc">
        <div class="pv-doc__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </div>
        <div class="pv-doc__info">
          <span class="pv-doc__name">Portofolio</span>
          <input v-if="(status === 'INCOMPLETE' || status === 'REJECTED') && !parsedKyb" v-model="portfolioUrl" class="field__input text-xs" placeholder="URL Portofolio (misal: https://behance.net/username)" style="margin-top:.375rem" />
          <span v-else class="pv-doc__file">{{ parsedKyb?.portfolioUrl || 'Sedang diverifikasi' }}</span>
        </div>
        <span class="doc-badge" :class="docStatusClass(status)">{{ docStatusLabel(status) }}</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="pv-error-inline">
      {{ errorMessage }}
    </div>

    <!-- Catatan Validator -->
    <template v-if="merchant?.rejectionReason && status === 'REJECTED'">
      <h2 class="pv-section-title">Catatan Validator</h2>
      <div class="pv-validator-note">
        <p>"{{ merchant.rejectionReason }}"</p>
        <div class="pv-validator-note__author">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Verification Team</span>
        </div>
      </div>
    </template>

    <!-- Bottom Action -->
    <div class="pv-bottom">
      <button v-if="status === 'ACTIVE'" class="pv-btn pv-btn--green" @click="router.push('/vendor/dashboard')">
        Mulai kelola Toko
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <button 
        v-else-if="(status === 'INCOMPLETE' || status === 'REJECTED') && !parsedKyb" 
        class="pv-btn pv-btn--blue" 
        :disabled="isSubmitting"
        @click="handleKybSubmit"
      >
        {{ isSubmitting ? 'Memproses...' : 'Kirim Verifikasi' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.pv-page { max-width:640px; margin:0 auto; padding:1.5rem 1.5rem 6rem; font-family:'Plus Jakarta Sans',system-ui,sans-serif; }

/* Back */
.pv-back { width:32px; height:32px; border-radius:50%; border:1.5px solid #E5E7EB; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#374151; transition:border-color .2s; margin-bottom:1rem; }
.pv-back:hover { border-color:#2563EB; }

.pv-title { font-size:1.5rem; font-weight:800; color:#0F172A; margin:0; }
.pv-subtitle { font-size:.8rem; color:#6B7280; margin:.25rem 0 1.25rem; }

/* Demo toggle */
.pv-demo { display:flex; gap:.5rem; align-items:center; margin-bottom:1.25rem; font-size:.7rem; color:#9CA3AF; }
.pv-demo button { padding:.25rem .625rem; border-radius:6px; border:1px solid #E5E7EB; background:#fff; font-size:.7rem; cursor:pointer; transition:all .2s; }
.pv-demo button.active { background:#2563EB; color:#fff; border-color:#2563EB; }

/* Banner */
.pv-banner { display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem; border-radius:12px; margin-bottom:1.5rem; animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
.pv-banner--PENDING_VERIFICATION { background:#EFF6FF; border:1px solid #BFDBFE; }
.pv-banner--REJECTED { background:#FEF2F2; border:1px solid #FECACA; }
.pv-banner--ACTIVE { background:#ECFDF5; border:1px solid #A7F3D0; }
.pv-banner__icon { flex-shrink:0; margin-top:2px; }
.pv-banner--PENDING_VERIFICATION .pv-banner__icon { color:#2563EB; }
.pv-banner--REJECTED .pv-banner__icon { color:#DC2626; }
.pv-banner--ACTIVE .pv-banner__icon { color:#059669; }
.pv-banner__text { flex:1; }
.pv-banner__text strong { font-size:.875rem; color:#0F172A; display:block; margin-bottom:.25rem; }
.pv-banner__text p { font-size:.75rem; color:#475569; margin:0; line-height:1.5; }
.pv-banner__badge { font-size:.6rem; font-weight:700; padding:.25rem .5rem; border-radius:6px; white-space:nowrap; flex-shrink:0; letter-spacing:.03em; }
.pv-banner__badge--PENDING_VERIFICATION { background:#DBEAFE; color:#1D4ED8; }
.pv-banner__badge--REJECTED { background:#FEE2E2; color:#DC2626; }
.pv-banner__badge--ACTIVE { background:#D1FAE5; color:#059669; }

/* Section */
.pv-section { background:#fff; border:1px solid #E5E7EB; border-radius:14px; padding:1.5rem; margin-bottom:1rem; }
.pv-section__head { display:flex; gap:.625rem; align-items:flex-start; margin-bottom:1.25rem; }
.pv-section__head h2 { font-size:.95rem; font-weight:700; color:#0F172A; margin:0; }
.pv-section__head p { font-size:.75rem; color:#6B7280; margin:.125rem 0 0; }
.pv-section__icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pv-section__icon--blue { background:#EFF6FF; color:#2563EB; }

/* Store banner */
.pv-store-banner { position:relative; border-radius:10px; overflow:hidden; margin-bottom:.75rem; height:140px; background:#E5E7EB; }
.pv-store-banner__img { width:100%; height:100%; object-fit:cover; }
.pv-store-logo { position:absolute; bottom:-20px; left:16px; width:48px; height:48px; border-radius:10px; background:#0F172A; display:flex; align-items:center; justify-content:center; border:3px solid #fff; }
.pv-store-badge { position:absolute; top:8px; right:8px; font-size:.6rem; font-weight:700; padding:.2rem .5rem; border-radius:6px; }
.pv-store-badge--red { background:#FEE2E2; color:#DC2626; }

.pv-store-name { font-size:1.1rem; font-weight:700; color:#0F172A; margin:1.5rem 0 .125rem; }
.pv-store-cat { font-size:.75rem; color:#6B7280; }

.pv-detail-block { margin-top:1rem; }
.pv-detail-block label { font-size:.65rem; font-weight:700; color:#9CA3AF; letter-spacing:.04em; text-transform:uppercase; display:block; margin-bottom:.25rem; }
.pv-detail-block p { font-size:.8rem; color:#374151; line-height:1.6; margin:0; }
.pv-muted { color:#9CA3AF; }
.pv-link-btn { background:none; border:none; color:#2563EB; font-size:.75rem; font-weight:600; cursor:pointer; padding:0; margin-top:.375rem; }
.pv-link-btn:hover { text-decoration:underline; }

/* Security */
.pv-security { display:flex; gap:.625rem; align-items:flex-start; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:1rem 1.25rem; margin-bottom:1.5rem; }
.pv-security strong { font-size:.8rem; color:#0F172A; display:block; margin-bottom:.125rem; }
.pv-security p { font-size:.7rem; color:#6B7280; margin:0; line-height:1.5; }

/* Section title */
.pv-section-title { font-size:1rem; font-weight:700; color:#0F172A; margin:0 0 .75rem; }

/* Documents */
.pv-docs { display:flex; flex-direction:column; gap:.5rem; margin-bottom:1.5rem; }
.pv-doc { display:flex; align-items:center; gap:.625rem; background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:.75rem 1rem; transition:border-color .2s; }
.pv-doc:hover { border-color:#D1D5DB; }
.pv-doc__icon { flex-shrink:0; }
.pv-doc__info { flex:1; min-width:0; }
.pv-doc__name { font-size:.8rem; font-weight:600; color:#0F172A; display:block; }
.pv-doc__file { font-size:.7rem; color:#9CA3AF; }
.doc-badge { font-size:.6rem; font-weight:700; padding:.2rem .5rem; border-radius:6px; white-space:nowrap; }
.doc-badge--orange { background:#FEF3C7; color:#D97706; }
.doc-badge--green { background:#D1FAE5; color:#059669; }
.pv-doc__action { width:28px; height:28px; border-radius:6px; border:1px solid #E5E7EB; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#9CA3AF; transition:all .2s; flex-shrink:0; }
.pv-doc__action:hover { border-color:#2563EB; color:#2563EB; }

/* Validator note */
.pv-validator-note { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem; }
.pv-validator-note p { font-size:.8rem; color:#374151; line-height:1.6; margin:0 0 .75rem; font-style:italic; }
.pv-validator-note__author { display:flex; align-items:center; gap:.375rem; font-size:.7rem; font-weight:600; color:#7C3AED; }

/* Help */
.pv-help { background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:1rem 1.25rem; margin-bottom:1.5rem; max-width:260px; }
.pv-help strong { font-size:.8rem; color:#0F172A; }
.pv-help p { font-size:.7rem; color:#6B7280; margin:.25rem 0 .75rem; line-height:1.5; }
.pv-help__btn { width:100%; padding:.5rem; background:#fff; border:1px solid #E5E7EB; border-radius:8px; font-family:inherit; font-size:.75rem; font-weight:600; color:#374151; cursor:pointer; transition:border-color .2s; }
.pv-help__btn:hover { border-color:#2563EB; color:#2563EB; }

/* Bottom */
.pv-bottom { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #E5E7EB; padding:1rem 1.5rem; display:flex; justify-content:flex-end; z-index:10; }
.pv-btn { display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.75rem 2rem; font-family:inherit; font-size:.875rem; font-weight:700; border:none; border-radius:10px; cursor:pointer; transition:all .2s; }
.pv-btn--blue { background:#DBEAFE; color:#2563EB; }
.pv-btn--blue:hover { background:#BFDBFE; }
.pv-btn--green { background:#059669; color:#fff; }
.pv-btn--green:hover { background:#047857; transform:translateY(-1px); box-shadow:0 4px 12px rgba(5,150,105,.3); }

.pv-upload-box { border:1.5px dashed #D1D5DB; border-radius:8px; padding:.75rem 1rem; display:flex; align-items:center; gap:.5rem; cursor:pointer; transition:all .2s; background:#F9FAFB; margin-top:.375rem; }
.pv-upload-box:hover { border-color:#2563EB; background:#F8FAFF; }
.pv-upload-box__text { font-size:.75rem; font-weight:600; color:#475569; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:280px; }
.field__input { width:100%; padding:.5rem .75rem; border:1.5px solid #D1D5DB; border-radius:8px; font-family:inherit; font-size:.75rem; color:#0F172A; background:#fff; outline:none; transition:all .2s; box-sizing:border-box; }
.field__input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.pv-error-inline { color:#DC2626; background:#FEF2F2; border:1px solid #FCA5A5; border-radius:10px; padding:.75rem 1rem; font-size:.8rem; font-weight:600; margin-bottom:1rem; animation:fadeUp .3s ease both; }

@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@media (max-width:640px) { .pv-page { padding:1rem 1rem 5rem; } }
@media (prefers-reduced-motion:reduce) { .pv-banner { animation:none; } }
</style>
