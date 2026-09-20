<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { loginMutation } = useAuth()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)

function handleLogin() {
  if (!form.email || !form.password) return
  loginMutation.mutate({ email: form.email, password: form.password })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-panel auth-panel--form">
      <div class="auth-form-box">
        <div class="auth-heading">
          <h1>Get Started Now</h1>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin" novalidate>
          <div class="field">
            <input
              id="login-email"
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
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Buat kata sandi"
                required
                autocomplete="current-password"
                class="field__input"
              />
              <button
                type="button"
                class="field__eye"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Sembunyikan' : 'Tampilkan'"
              >
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="field__forgot-row">
              <a href="#" class="field__forgot">Lupa Password</a>
            </div>
          </div>

          <p v-if="loginMutation.isError.value" class="auth-error">
            {{ (loginMutation.error.value as any)?.response?.data?.message || 'Email atau password salah.' }}
          </p>

          <button
            type="submit"
            id="login-submit"
            class="auth-btn"
            :disabled="loginMutation.isPending.value"
          >
            <svg v-if="loginMutation.isPending.value" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 019.95 9"/></svg>
            <span>{{ loginMutation.isPending.value ? 'Memproses...' : 'Lanjut' }}</span>
          </button>

          <p class="auth-switch">
            Belum punya akun?
            <router-link to="/daftar" class="auth-switch__link">Daftar sekarang</router-link>
          </p>
        </form>
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
  animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both;
}

.auth-heading h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.03em;
  margin: 0 0 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0;
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

.field__pw-wrap .field__input {
  padding-right: 2.75rem;
}

.field__eye {
  position: absolute;
  right: 12px;
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

.field__forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-top: .5rem;
}

.field__forgot {
  font-size: .8rem;
  font-weight: 600;
  color: #2563EB;
  text-decoration: none;
  transition: color .2s;
}
.field__forgot:hover { color: #1d4ed8; text-decoration: underline; }

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
  margin-top: .25rem;
}
.auth-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(37,99,235,.3);
}
.auth-btn:disabled { opacity: .75; cursor: not-allowed; }

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
  from { opacity: 0; transform: translateY(20px); }
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
  .auth-btn      { transition: none; }
}
</style>
