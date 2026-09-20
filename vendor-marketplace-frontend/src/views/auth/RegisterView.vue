<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useRegistrationStore } from '../../store/registration.store'

const router = useRouter()
const { signUpMutation } = useAuth()
const registrationStore = useRegistrationStore()

const step = ref(1)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  role: '' as '' | 'CLIENT' | 'MERCHANT',
  shopName: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  bankName: '',
  accountNumber: '',
  accountHolderName: '',
})

const showPw = ref(false)
const showConfirmPw = ref(false)
const pwError = ref('')
const regError = ref('')

const isProcessing = computed(() => signUpMutation.isPending.value)

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s === 0) return ''
  if (s === 1) return 'Lemah'
  if (s === 2) return 'Cukup'
  if (s === 3) return 'Kuat'
  return 'Sangat Kuat'
})

function goStep1() {
  pwError.value = ''
  if (!form.email || !form.password || !form.confirmPassword) return
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    pwError.value = 'Format email tidak valid.'
    return
  }

  if (form.password !== form.confirmPassword) {
    pwError.value = 'Kata sandi tidak cocok.'
    return
  }
  step.value = 2
}

function goStep2() {
  if (!form.username.trim()) return
  step.value = 3
}

function selectRole(r: 'CLIENT' | 'MERCHANT') {
  form.role = r
}


function handleFinish() {
  if (!form.role) return
  regError.value = ''
  
  if (form.role === 'MERCHANT') {
    registrationStore.setCredentials({
      email: form.email,
      password: form.password,
      username: form.username,
      role: form.role
    })
    router.push('/daftar/merchant')
  } else {
    signUpMutation.mutate({
      email: form.email,
      password: form.password,
      username: form.username,
      role: form.role,
    }, {
      onError: (err: any) => {
        regError.value = err.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
      }
    })
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-panel auth-panel--form">
      <div v-if="step === 1" class="auth-form-box" key="step1">
        <router-link to="/masuk/user" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </router-link>

        <h1 class="auth-heading">Get Started Now</h1>

        <form class="auth-form" @submit.prevent="goStep1" novalidate>
          <div class="field">
            <input
              id="reg-email"
              v-model="form.email"
              type="email"
              placeholder="Masukkan alamat email"
              required
              autocomplete="email"
              class="field__input"
            />
          </div>

          <div class="field">
            <div class="field__pw-wrap">
              <input
                id="reg-password"
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                placeholder="Buat kata sandi"
                required
                autocomplete="new-password"
                class="field__input"
              />
              <button type="button" class="field__eye" @click="showPw = !showPw" aria-label="Toggle password">
                <svg v-if="!showPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div v-if="form.password" class="strength-bar">
              <div
                class="strength-bar__fill"
                :class="`strength-bar__fill--${passwordStrength}`"
                :style="{ width: (passwordStrength / 4 * 100) + '%' }"
              ></div>
            </div>
            <span v-if="form.password && strengthLabel" class="strength-label" :class="`strength-label--${passwordStrength}`">{{ strengthLabel }}</span>
          </div>

          <div class="field">
            <div class="field__pw-wrap">
              <input
                id="reg-confirm"
                v-model="form.confirmPassword"
                :type="showConfirmPw ? 'text' : 'password'"
                placeholder="Konfirmasi kata sandi"
                required
                autocomplete="new-password"
                class="field__input"
              />
              <button type="button" class="field__eye" @click="showConfirmPw = !showConfirmPw" aria-label="Toggle confirm password">
                <svg v-if="!showConfirmPw" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div class="field__forgot-row">
            <a href="#" class="field__forgot">Lupa Password</a>
          </div>

          <p v-if="pwError" class="auth-error">{{ pwError }}</p>

          <button type="submit" id="reg-step1-submit" class="auth-btn">Lanjut</button>

          <p class="auth-switch">
            Sudah punya akun?
            <router-link to="/masuk/user" class="auth-switch__link">Masuk sekarang</router-link>
          </p>
        </form>
      </div>

      <div v-else-if="step === 2" class="auth-form-box" key="step2">
        <button class="back-link" type="button" @click="step = 1" aria-label="Kembali">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <h1 class="auth-heading">Mulai buat<br/>profilmu</h1>

        <form class="auth-form" @submit.prevent="goStep2" novalidate>
          <div class="field">
            <label class="field__label" for="reg-username">Pilih username</label>
            <input
              id="reg-username"
              v-model="form.username"
              type="text"
              placeholder=""
              required
              autocomplete="username"
              class="field__input"
            />
          </div>

          <button type="submit" id="reg-step2-submit" class="auth-btn" style="margin-top: 1rem;">Buat akun saya</button>

          <p class="auth-switch">
            Sudah punya akun?
            <router-link to="/masuk/user" class="auth-switch__link">Masuk</router-link>
          </p>
        </form>
      </div>

      <div v-else-if="step === 3" class="auth-form-box auth-form-box--wide" key="step3">
        <div class="brand-logo">
          <img src="/images/logo.png" alt="LayananPro Logo" width="32" height="32" />
          <span>LayananPro</span>
        </div>

        <h1 class="auth-heading" style="font-size:1.375rem; margin-bottom:.5rem;">
          Satu langkah lagi! Apa tujuan Anda menggunakan
        </h1>

        <div class="role-grid">
          <button
            id="role-client"
            type="button"
            class="role-card"
            :class="{ 'role-card--active': form.role === 'CLIENT' }"
            @click="selectRole('CLIENT')"
          >
            <div class="role-card__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <span class="role-card__name">Client</span>
            <span class="role-card__desc">Saya ingin mencari jasa</span>
          </button>

          <button
            id="role-merchant"
            type="button"
            class="role-card"
            :class="{ 'role-card--active': form.role === 'MERCHANT' }"
            @click="selectRole('MERCHANT')"
          >
            <div class="role-card__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <span class="role-card__name">Merchant</span>
            <span class="role-card__desc">Saya ingin menawarkan jasa</span>
          </button>
        </div>

        <p v-if="regError" class="auth-error" style="margin-top: 1rem;">{{ regError }}</p>

        <button
          id="reg-finish"
          type="button"
          class="auth-btn auth-btn--arrow"
          :disabled="!form.role || isProcessing"
          @click="handleFinish"
          style="margin-top: 1.5rem;"
        >
          <svg v-if="isProcessing" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 019.95 9"/></svg>
          <span>{{ isProcessing ? 'Memproses...' : 'Selesaikan Pendaftaran' }}</span>
          <svg v-if="!isProcessing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <div class="auth-panel auth-panel--photo">
      <img
        src="/images/auth-team.jpg"
        alt="Tim profesional"
        class="auth-photo"
        loading="eager"
      />
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.auth-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: #fff;
}

.auth-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-panel--form {
  padding: 3rem 2rem;
}

.auth-panel--photo {
  position: relative;
  overflow: hidden;
  background: #E8EDF5;
  max-width: 52%;
}

.auth-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.auth-form-box {
  width: 100%;
  max-width: 360px;
  animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both;
}

.auth-form-box--wide { max-width: 420px; }

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid #E5E7EB;
  background: #fff;
  color: #374151;
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: border-color .2s, box-shadow .2s;
}
.back-link:hover {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
}

.auth-heading {
  font-size: 2rem;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.03em;
  margin: 0 0 2rem;
  line-height: 1.2;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: 1.25rem;
  font-weight: 700;
  font-size: 1rem;
  color: #0F172A;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: .875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .3rem;
}

.field__label {
  font-size: .8rem;
  font-weight: 600;
  color: #374151;
}

.field__input {
  width: 100%;
  padding: .75rem 1rem;
  border: 1.5px solid #D1D5DB;
  border-radius: 8px;
  font-family: inherit;
  font-size: .9rem;
  color: #0F172A;
  background: #fff;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
.field__input::placeholder { color: #9CA3AF; }
.field__input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
}

.field__pw-wrap {
  position: relative;
}
.field__pw-wrap .field__input { padding-right: 2.75rem; }

.field__eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color .2s;
}
.field__eye:hover { color: #374151; }

.strength-bar {
  height: 4px;
  background: #E5E7EB;
  border-radius: 99px;
  overflow: hidden;
  margin-top: .3rem;
}

.strength-bar__fill {
  height: 100%;
  border-radius: 99px;
  transition: width .3s ease, background-color .3s;
}
.strength-bar__fill--1 { background: #EF4444; }
.strength-bar__fill--2 { background: #F59E0B; }
.strength-bar__fill--3 { background: #10B981; }
.strength-bar__fill--4 { background: #059669; }

.strength-label {
  font-size: .73rem;
  font-weight: 600;
}
.strength-label--1 { color: #EF4444; }
.strength-label--2 { color: #F59E0B; }
.strength-label--3 { color: #10B981; }
.strength-label--4 { color: #059669; }

.field__forgot-row {
  display: flex;
  justify-content: flex-end;
}
.field__forgot {
  font-size: .8rem;
  font-weight: 600;
  color: #2563EB;
  text-decoration: none;
}
.field__forgot:hover { text-decoration: underline; }

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .875rem;
  background: #2563EB;
  color: #fff;
  font-family: inherit;
  font-size: .9375rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.auth-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(37,99,235,.3);
}
.auth-btn:disabled { opacity: .6; cursor: not-allowed; }

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .875rem;
  margin-top: 1.25rem;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  padding: 1.25rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, background .2s;
  text-align: center;
}
.role-card:hover {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
}
.role-card--active {
  border-color: #2563EB;
  background: #EFF6FF;
  box-shadow: 0 0 0 3px rgba(37,99,235,.15);
}

.role-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563EB;
  transition: background .2s;
}
.role-card--active .role-card__icon {
  background: #2563EB;
  color: #fff;
}

.role-card__name {
  font-size: .9rem;
  font-weight: 700;
  color: #0F172A;
}

.role-card__desc {
  font-size: .73rem;
  color: #6B7280;
  line-height: 1.4;
}

.file-upload-box {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  font-size: 0.75rem;
  color: #9CA3AF;
  transition: all 0.2s;
  background: #F9FAFB;
}
.file-upload-box:hover {
  border-color: #2563EB;
  background: #EFF6FF;
  color: #2563EB;
}
.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-error {
  font-size: .8rem;
  color: #DC2626;
  text-align: center;
  margin: 0;
}

.auth-switch {
  text-align: center;
  font-size: .8rem;
  color: #6B7280;
  margin: .25rem 0 0;
}
.auth-switch__link {
  color: #2563EB;
  font-weight: 600;
  text-decoration: none;
}
.auth-switch__link:hover { text-decoration: underline; }

.spin { animation: spinning .8s linear infinite; }
@keyframes spinning { to { transform: rotate(360deg); } }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .auth-panel--photo { display: none; }
  .auth-panel--form  { min-height: 100vh; padding: 2rem 1.5rem; }
  .auth-form-box     { max-width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .auth-form-box { animation: none; }
  .spin          { animation: none; }
  .auth-btn, .role-card { transition: none; }
}
</style>
