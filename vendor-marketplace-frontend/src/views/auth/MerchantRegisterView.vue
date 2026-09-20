<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useRegistrationStore } from '../../store/registration.store'

const router = useRouter()
const { registerMerchantMutation, uploadFile, submitKybMutation } = useAuth()
const registrationStore = useRegistrationStore()

const currentStep = ref(1)

const form = reactive({
  storeName: '',
  description: '',
  logoFile: null as File | null,
  bannerFile: null as File | null,
  bankName: '',
  bankAccount: '',
  bankHolder: '',
  kybFile: null as File | null,
  portfolioLink: '',
})

const logoPreview = ref('')
const bannerPreview = ref('')
const kybPreview = ref('')
const descCount = computed(() => form.description.length)

const isSubmitting = ref(false)
const errorMessage = ref('')

function validateFileType(type: 'logo' | 'banner' | 'kyb', file: File): boolean {
  if (type === 'kyb') {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(file.type)) {
      errorMessage.value = 'Format dokumen KYB harus berupa PDF, JPG, atau PNG.'
      return false
    }
  } else {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      errorMessage.value = `Format ${type} harus berupa SVG, PNG, atau JPG.`
      return false
    }
  }
  errorMessage.value = ''
  return true
}

function handleFile(type: 'logo' | 'banner' | 'kyb', e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!validateFileType(type, f)) return
  if (type === 'logo') { form.logoFile = f; logoPreview.value = URL.createObjectURL(f) }
  if (type === 'banner') { form.bannerFile = f; bannerPreview.value = URL.createObjectURL(f) }
  if (type === 'kyb') { form.kybFile = f; kybPreview.value = f.name }
}

function dropFile(type: 'logo' | 'banner' | 'kyb', e: DragEvent) {
  e.preventDefault()
  const f = e.dataTransfer?.files?.[0]
  if (!f) return
  if (!validateFileType(type, f)) return
  if (type === 'logo') { form.logoFile = f; logoPreview.value = URL.createObjectURL(f) }
  if (type === 'banner') { form.bannerFile = f; bannerPreview.value = URL.createObjectURL(f) }
  if (type === 'kyb') { form.kybFile = f; kybPreview.value = f.name }
}

function nextStep() {
  errorMessage.value = ''
  if (!form.storeName || !form.description || !form.bankName || !form.bankAccount || !form.bankHolder) {
    errorMessage.value = 'Mohon lengkapi semua bidang pada formulir.'
    return
  }
  if (form.description.length < 50) {
    errorMessage.value = 'Deskripsi singkat minimal 50 karakter.'
    return
  }
  if (form.logoFile) {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml']
    if (!allowedImageTypes.includes(form.logoFile.type)) {
      errorMessage.value = 'Format logo harus berupa SVG, PNG, atau JPG.'
      return
    }
  }
  if (form.bannerFile) {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml']
    if (!allowedImageTypes.includes(form.bannerFile.type)) {
      errorMessage.value = 'Format banner harus berupa SVG, PNG, atau JPG.'
      return
    }
  }
  currentStep.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.storeName || !form.description) return
  if (!form.kybFile) {
    errorMessage.value = 'Mohon unggah dokumen KTM / SK Organisasi.'
    return
  }
  const allowedKybTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  if (!allowedKybTypes.includes(form.kybFile.type)) {
    errorMessage.value = 'Format dokumen KYB harus berupa PDF, JPG, atau PNG.'
    return
  }
  
  isSubmitting.value = true

  try {
    let logoUrl = ''
    if (form.logoFile) {
      const res = await uploadFile(form.logoFile, 'merchant-assets')
      logoUrl = res.url
    }

    let bannerUrl = ''
    if (form.bannerFile) {
      const res = await uploadFile(form.bannerFile, 'merchant-assets')
      bannerUrl = res.url
    }

    registerMerchantMutation.mutate({
      email: registrationStore.email,
      password: registrationStore.password,
      fullName: registrationStore.username,
      shopName: form.storeName,
      description: form.description,
      logoUrl: logoUrl || 'https://placehold.co/200x200?text=Logo',
      bannerUrl: bannerUrl || 'https://placehold.co/1200x400?text=Banner',
      bankName: form.bankName,
      accountNumber: form.bankAccount,
      accountHolderName: form.bankHolder
    }, {
      onSuccess: async () => {
        try {
          if (form.kybFile) {
            const kybRes = await uploadFile(form.kybFile, 'merchant-kyb')
            const kybUrl = kybRes.url
            await submitKybMutation.mutateAsync({
              kybDocumentUrl: kybUrl,
              portfolioUrl: form.portfolioLink || ''
            })
          }
          registrationStore.reset()
          router.push('/vendor/documents')
        } catch (err: any) {
          console.error('Error submitting KYB document:', err)
          // Even if KYB submission fails, the merchant was successfully registered and logged in,
          // so redirecting to the dashboard is appropriate. They can retry there.
          registrationStore.reset()
          router.push('/vendor/documents')
        } finally {
          isSubmitting.value = false
        }
      },
      onError: (err: any) => {
        errorMessage.value = err?.response?.data?.message || 'Terjadi kesalahan saat mendaftar.'
        isSubmitting.value = false
      }
    })
  } catch (err: any) {
    console.error('Error uploading image assets:', err)
    errorMessage.value = err?.response?.data?.message || 'Gagal mengunggah logo atau banner.'
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mr-page">
    <div class="mr-header">
      <button class="mr-back" @click="currentStep === 1 ? router.push('/daftar') : (currentStep = 1)" aria-label="Kembali">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="mr-title">Pendaftaran Merchant</h1>
    </div>

    <div class="stepper">
      <div class="stepper__item stepper__item--done">
        <div class="stepper__circle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
        <span>REGISTRASI AKUN</span>
      </div>
      <div class="stepper__line" :class="{ 'stepper__line--active': currentStep >= 1 }"></div>
      <div class="stepper__item" :class="{ 'stepper__item--active': currentStep === 1 }">
        <div class="stepper__circle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        <span>PROFIL MERCHANT</span>
      </div>
      <div class="stepper__line" :class="{ 'stepper__line--active': currentStep >= 2 }"></div>
      <div class="stepper__item" :class="{ 'stepper__item--active': currentStep === 2 }">
        <div class="stepper__circle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <span>VERIFIKASI KYB</span>
      </div>
    </div>

    <div v-if="currentStep === 1" class="mr-content" key="step1">
      <section class="mr-section">
        <div class="mr-section__head">
          <div class="mr-section__icon mr-section__icon--blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
          <div><h2>Identitas Toko</h2><p>Informasi dasar yang akan dilihat oleh pelanggan Anda.</p></div>
        </div>

        <label class="mr-label">Nama Toko</label>
        <input v-model="form.storeName" class="mr-input" placeholder="Contoh: Digital Canvas Studio" required />
        <span class="mr-hint">Gunakan nama yang profesional dan mudah diingat.</span>

        <label class="mr-label" style="margin-top:1.25rem">Logo Toko</label>
        <div class="mr-upload mr-upload--logo" @click="($refs.logoInput as HTMLInputElement).click()" @dragover.prevent @drop="dropFile('logo', $event)">
          <img v-if="logoPreview" :src="logoPreview" alt="Logo" class="mr-upload__preview-img" />
          <template v-else>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span class="mr-upload__text">Klik atau Taruh file</span>
            <span class="mr-upload__hint">SVG, PNG, JPG (Maks. 2MB)</span>
          </template>
        </div>
        <input ref="logoInput" type="file" accept="image/*" hidden @change="handleFile('logo', $event)" />

        <label class="mr-label" style="margin-top:1.25rem">Banner Toko</label>
        <div class="mr-upload mr-upload--banner" @click="($refs.bannerInput as HTMLInputElement).click()" @dragover.prevent @drop="dropFile('banner', $event)">
          <img v-if="bannerPreview" :src="bannerPreview" alt="Banner" class="mr-upload__preview-banner" />
          <template v-else>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span class="mr-upload__text">Klik atau Taruh file</span>
            <span class="mr-upload__hint">Rasio 21:9 disarankan untuk tampilan terbaik (Maks. 5MB)</span>
          </template>
        </div>
        <input ref="bannerInput" type="file" accept="image/*" hidden @change="handleFile('banner', $event)" />

        <label class="mr-label" style="margin-top:1.25rem">Deskripsi Singkat</label>
        <textarea v-model="form.description" class="mr-textarea" rows="4" placeholder="Ceritakan spesialisasi dan keunggulan jasa Anda..." maxlength="500"></textarea>
        <div class="mr-textarea-footer">
          <span class="mr-hint">Minimal 50 karakter agar terlihat profesional.</span>
          <span class="mr-hint">{{ descCount }}/500</span>
        </div>
      </section>

      <section class="mr-section">
        <div class="mr-section__head">
          <div class="mr-section__icon mr-section__icon--green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
          <div><h2>Informasi Rekening Bank</h2><p>Digunakan untuk penarikan saldo (payout) pendapatan Anda.</p></div>
        </div>
        <div class="mr-row">
          <div class="mr-col">
            <label class="mr-label">Pilih Bank</label>
            <input v-model="form.bankName" class="mr-input" placeholder="Contoh: Bank Central Asia (BCA)" required />
          </div>
          <div class="mr-col">
            <label class="mr-label">Nomor Rekening</label>
            <input v-model="form.bankAccount" class="mr-input" placeholder="Contoh: 882012XXX" required />
          </div>
        </div>
        <label class="mr-label">Nama Pemilik Rekening</label>
        <input v-model="form.bankHolder" class="mr-input" placeholder="Sesuai yang tertera di buku tabungan" required />
        <span class="mr-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> Nama harus sesuai dengan identitas legal untuk kelancaran verifikasi.</span>
      </section>

      <p v-if="errorMessage" class="mr-error" style="margin-bottom: 1rem;">
        {{ errorMessage }}
      </p>

      <button class="mr-btn" @click="nextStep">Lanjut ke Verifikasi KYB <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
    </div>

    <div v-else class="mr-content" key="step2">
      <section class="mr-section">
        <div class="mr-section__head">
          <div class="mr-section__icon mr-section__icon--purple"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div><h2>Verifikasi Identitas & Dokumen</h2><p>Data KYB (Know Your Business) untuk keamanan transaksi.</p></div>
        </div>

        <label class="mr-label">Unggah KTM / SK Organisasi</label>
        <div class="mr-upload mr-upload--logo" @click="($refs.kybInput as HTMLInputElement).click()" @dragover.prevent @drop="dropFile('kyb', $event)">
          <template v-if="kybPreview">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="mr-upload__text" style="color:#10B981">{{ kybPreview }}</span>
          </template>
          <template v-else>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="mr-upload__text">Klik atau Taruh file</span>
            <span class="mr-upload__hint">Format PDF atau JPG (Maks. 5MB)</span>
          </template>
        </div>
        <input ref="kybInput" type="file" accept=".pdf,.jpg,.jpeg,.png" hidden @change="handleFile('kyb', $event)" />

        <div class="mr-info-box">
          <div class="mr-info-box__head"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> <strong>Persyaratan Dokumen:</strong></div>
          <ul>
            <li>Dokumen harus masih berlaku.</li>
            <li>Foto harus jelas, tidak buram, dan tidak terpotong.</li>
            <li>Nama di dokumen harus sama dengan pemilik rekening.</li>
          </ul>
        </div>

        <label class="mr-label" style="margin-top:1.5rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Tautan Portofolio (Opsional)</label>
        <input v-model="form.portfolioLink" class="mr-input" placeholder="https://behance.net/username" />
      </section>

      <button class="mr-btn" :disabled="isSubmitting" @click="handleSubmit">
        <svg v-if="isSubmitting" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 019.95 9"/></svg>
        {{ isSubmitting ? 'Memproses...' : 'Submit for Review' }}
        <svg v-if="!isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      
      <p v-if="errorMessage" class="mr-error">
        {{ errorMessage }}
      </p>

      <p class="mr-terms">Dengan mengklik "Submit for Review", Anda menyetujui <a href="#">Syarat & Ketentuan Vendor</a> serta kebijakan privasi VendorFlow.</p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.mr-page { min-height:100vh; background:#F8FAFC; font-family:'Plus Jakarta Sans',system-ui,sans-serif; padding:2rem 1.5rem 4rem; max-width:720px; margin:0 auto; }

.mr-header { display:flex; align-items:center; gap:.75rem; margin-bottom:2rem; }
.mr-back { width:36px; height:36px; border-radius:50%; border:1.5px solid #E5E7EB; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#374151; transition:border-color .2s; }
.mr-back:hover { border-color:#2563EB; }
.mr-title { font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.02em; }

.stepper { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:2.5rem; }
.stepper__item { display:flex; flex-direction:column; align-items:center; gap:.375rem; min-width:100px; }
.stepper__item span { font-size:.65rem; font-weight:700; color:#9CA3AF; letter-spacing:.04em; text-transform:uppercase; }
.stepper__circle { width:36px; height:36px; border-radius:50%; border:2px solid #E5E7EB; background:#fff; display:flex; align-items:center; justify-content:center; color:#9CA3AF; transition:all .3s; }
.stepper__item--done .stepper__circle { background:#2563EB; border-color:#2563EB; }
.stepper__item--done span { color:#2563EB; }
.stepper__item--active .stepper__circle { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.stepper__item--active span { color:#2563EB; }
.stepper__line { width:60px; height:2px; background:#E5E7EB; margin:0 .25rem; margin-bottom:1.25rem; transition:background .3s; }
.stepper__line--active { background:#2563EB; }

.mr-section { background:#fff; border:1px solid #E5E7EB; border-radius:16px; padding:1.75rem; margin-bottom:1.25rem; animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
.mr-section__head { display:flex; align-items:flex-start; gap:.75rem; margin-bottom:1.5rem; }
.mr-section__head h2 { font-size:1.05rem; font-weight:700; color:#0F172A; margin:0; }
.mr-section__head p { font-size:.8rem; color:#6B7280; margin:.125rem 0 0; }
.mr-section__icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.mr-section__icon--blue { background:#EFF6FF; color:#2563EB; }
.mr-section__icon--green { background:#ECFDF5; color:#059669; }
.mr-section__icon--purple { background:#F3E8FF; color:#7C3AED; }

.mr-label { display:flex; align-items:center; gap:.375rem; font-size:.8rem; font-weight:600; color:#374151; margin-bottom:.375rem; }
.mr-input { width:100%; padding:.75rem 1rem; border:1.5px solid #D1D5DB; border-radius:10px; font-family:inherit; font-size:.875rem; color:#0F172A; background:#fff; outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
.mr-input::placeholder { color:#9CA3AF; }
.mr-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.mr-textarea { width:100%; padding:.75rem 1rem; border:1.5px solid #D1D5DB; border-radius:10px; font-family:inherit; font-size:.875rem; color:#0F172A; background:#fff; outline:none; resize:vertical; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
.mr-textarea:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.mr-textarea-footer { display:flex; justify-content:space-between; margin-top:.25rem; }
.mr-hint { font-size:.73rem; color:#9CA3AF; display:flex; align-items:center; gap:.25rem; margin-top:.25rem; }
.mr-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:.75rem; }
.mr-col { display:flex; flex-direction:column; }

.mr-upload { border:2px dashed #D1D5DB; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.375rem; cursor:pointer; transition:border-color .2s,background .2s; text-align:center; }
.mr-upload:hover { border-color:#2563EB; background:#F8FAFF; }
.mr-upload--logo { min-height:120px; }
.mr-upload--banner { min-height:100px; }
.mr-upload__text { font-size:.8rem; font-weight:600; color:#374151; }
.mr-upload__hint { font-size:.7rem; color:#9CA3AF; }
.mr-upload__preview-img { width:80px; height:80px; object-fit:cover; border-radius:8px; }
.mr-upload__preview-banner { width:100%; max-height:120px; object-fit:cover; border-radius:8px; }

.mr-info-box { background:#F0F9FF; border:1px solid #BAE6FD; border-radius:10px; padding:1rem; margin-top:1rem; }
.mr-info-box__head { display:flex; align-items:center; gap:.375rem; font-size:.8rem; color:#0369A1; margin-bottom:.5rem; }
.mr-info-box ul { margin:0; padding-left:1.25rem; }
.mr-info-box li { font-size:.75rem; color:#475569; line-height:1.7; }

.mr-btn { display:flex; align-items:center; justify-content:center; gap:.5rem; width:100%; max-width:400px; margin:1.5rem auto 0; padding:1rem; background:#2563EB; color:#fff; font-family:inherit; font-size:.9375rem; font-weight:700; border:none; border-radius:10px; cursor:pointer; transition:background .2s,transform .2s,box-shadow .2s; }
.mr-btn:hover:not(:disabled) { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 4px 16px rgba(37,99,235,.3); }
.mr-btn:disabled { opacity:.6; cursor:not-allowed; }

.mr-terms { text-align:center; font-size:.73rem; color:#6B7280; margin-top:.75rem; line-height:1.5; }
.mr-terms a { color:#2563EB; text-decoration:none; }
.mr-terms a:hover { text-decoration:underline; }

.mr-error { font-size:.8rem; color:#DC2626; text-align:center; margin-top:1rem; animation:fadeUp .3s ease both; }

.spin { animation:spinning .8s linear infinite; }
@keyframes spinning { to { transform:rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

@media (max-width:640px) {
  .mr-row { grid-template-columns:1fr; }
  .stepper__item { min-width:70px; }
  .stepper__item span { font-size:.55rem; }
  .stepper__line { width:30px; }
}
@media (prefers-reduced-motion:reduce) { .mr-section { animation:none; } .spin { animation:none; } }
</style>
