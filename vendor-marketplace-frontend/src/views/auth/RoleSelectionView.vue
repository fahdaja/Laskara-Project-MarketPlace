<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goUserLogin() {
  router.push({ name: 'UserLogin' })
}

function goVendorLogin() {
  router.push({ name: 'VendorRegister' })
}
</script>

<template>
  <div class="role-selection">
    <div class="role-selection__inner">
      <!-- Left -->
      <div class="role-selection__left">
        <router-link to="/" class="role-selection__back" aria-label="Kembali ke beranda">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span>Kembali</span>
        </router-link>

        <div class="role-selection__content">
          <h1 class="role-selection__title">Get Started Now</h1>

          <div class="role-selection__buttons">
            <button class="role-btn role-btn--user" @click="goUserLogin">
              Sign In as <strong>User</strong>
            </button>
            <button class="role-btn role-btn--vendor" @click="goVendorLogin">
              Sign In as <strong>Vendor</strong>
            </button>
          </div>

          <p class="role-selection__footer-text">
            Sudah punya akun?
            <router-link to="/masuk/user" class="role-selection__link">Masuk sekarang</router-link>
          </p>
        </div>
      </div>

      <!-- Right -->
      <div class="role-selection__right">
        <img
          src="/images/marketplace-illustration.png"
          alt="Marketplace illustration"
          class="role-selection__illustration"
          loading="eager"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-selection {
  min-height: 100vh;
  background: linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 50%, #F5F3FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.role-selection__inner {
  max-width: 1100px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.role-selection__back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  text-decoration: none;
  margin-bottom: 2.5rem;
  transition: color 0.2s;
  cursor: pointer;
}

.role-selection__back:hover {
  color: #3B5BDB;
}

.role-selection__content {
  animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.role-selection__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
}

.role-selection__buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 340px;
}

.role-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
}

.role-btn strong {
  margin-left: 0.25rem;
  font-weight: 700;
}

.role-btn--user {
  background: #1E2A5E;
  color: #fff;
  border-color: #1E2A5E;
}

.role-btn--user:hover {
  background: #2A3A7A;
  border-color: #2A3A7A;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 42, 94, 0.25);
}

.role-btn--vendor {
  background: #fff;
  color: #1E2A5E;
  border-color: #1E2A5E;
}

.role-btn--vendor:hover {
  background: #F0F4FF;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 42, 94, 0.1);
}

.role-selection__footer-text {
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.role-selection__link {
  color: #3B5BDB;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.role-selection__link:hover {
  color: #2F4DC4;
  text-decoration: underline;
}

.role-selection__right {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeSlideLeft 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

.role-selection__illustration {
  width: 100%;
  max-width: 480px;
  height: auto;
  object-fit: contain;
}

/* Animations */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlideLeft {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .role-selection__inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .role-selection__right {
    order: -1;
  }

  .role-selection__illustration {
    max-width: 300px;
  }

  .role-selection__title {
    font-size: 2rem;
  }

  .role-selection__buttons {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .role-selection {
    padding: 1.5rem 1rem;
  }

  .role-selection__title {
    font-size: 1.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .role-selection__content,
  .role-selection__right {
    animation: none;
  }

  .role-btn {
    transition: none;
  }
}
</style>
