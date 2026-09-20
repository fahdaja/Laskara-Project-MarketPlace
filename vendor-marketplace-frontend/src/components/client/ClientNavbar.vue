<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const route = useRoute()
const { isLoggedIn, user, logout } = useAuth()
const isHome = computed(() => route.name === 'Home')
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const searchQuery = ref('')
const showProfileMenu = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    // Future: navigate to search results
  }
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}

function handleLogout() {
  logout()
  showProfileMenu.value = false
}

function closeProfileMenu(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.navbar__profile')) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', closeProfileMenu)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeProfileMenu)
})
</script>

<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled, 'navbar--solid': !isHome, 'navbar--home': isHome }">
    <div class="navbar__inner">
      <!-- Logo -->
      <router-link to="/" class="navbar__logo" aria-label="Home">
        <img src="/images/logo.png" alt="LayananPro Logo" class="navbar__logo-img" width="32" height="32" />
        <span class="navbar__logo-text">LayananPro</span>
      </router-link>

      <!-- Desktop Nav -->
      <nav class="navbar__nav" aria-label="Main navigation">
        <router-link to="/jelajahi" class="navbar__link">Jelajahi</router-link>
        <template v-if="isLoggedIn">
          <router-link to="/pesanan" class="navbar__link">Pesanan Saya</router-link>
        </template>
        <template v-else>
          <router-link to="/daftar" class="navbar__link">Menjadi Vendor</router-link>
        </template>
      </nav>

      <!-- Search Removed as requested -->

      <!-- Actions: Guest -->
      <div v-if="!isLoggedIn" class="navbar__actions">
        <router-link to="/daftar" class="navbar__link navbar__link--register">Daftar</router-link>
        <router-link to="/daftar" class="navbar__btn navbar__btn--primary">Masuk</router-link>
      </div>

      <!-- Actions: Logged In -->
      <div v-else class="navbar__actions">
        <router-link to="/chat" class="navbar__link navbar__link--chat" aria-label="Chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span>Chat</span>
        </router-link>
        <div class="navbar__profile" @click.stop="toggleProfileMenu">
          <img :src="user?.avatar || '/images/default-avatar.png'" :alt="user?.name" class="navbar__avatar" />
          <Transition name="dropdown">
            <div v-if="showProfileMenu" class="navbar__dropdown">
              <div class="navbar__dropdown-header">
                <span class="navbar__dropdown-name">{{ user?.name }}</span>
                <span class="navbar__dropdown-email">{{ user?.email }}</span>
              </div>
              <div class="navbar__dropdown-divider"></div>
              <router-link to="/profil" class="navbar__dropdown-item" @click="showProfileMenu = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profil Saya
              </router-link>
              <router-link to="/pesanan" class="navbar__dropdown-item" @click="showProfileMenu = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Pesanan
              </router-link>
              <div class="navbar__dropdown-divider"></div>
              <button class="navbar__dropdown-item navbar__dropdown-item--danger" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Keluar
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Mobile Hamburger -->
      <button class="navbar__hamburger" :class="{ 'navbar__hamburger--open': isMobileMenuOpen }" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Toggle menu" :aria-expanded="isMobileMenuOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="isMobileMenuOpen" class="navbar__mobile" @click.self="closeMobileMenu">
        <nav class="navbar__mobile-nav">
          <!-- Mobile Search Removed as requested -->
          <router-link to="/jelajahi" class="navbar__mobile-link" @click="closeMobileMenu">Jelajahi</router-link>
          <template v-if="isLoggedIn">
            <router-link to="/pesanan" class="navbar__mobile-link" @click="closeMobileMenu">Pesanan Saya</router-link>
            <router-link to="/chat" class="navbar__mobile-link" @click="closeMobileMenu">Chat</router-link>
            <router-link to="/profil" class="navbar__mobile-link" @click="closeMobileMenu">Profil</router-link>
            <div class="navbar__mobile-actions">
              <button class="navbar__mobile-btn navbar__mobile-btn--outline" @click="handleLogout(); closeMobileMenu()">Keluar</button>
            </div>
          </template>
          <template v-else>
            <router-link to="/daftar" class="navbar__mobile-link" @click="closeMobileMenu">Menjadi Vendor</router-link>
            <div class="navbar__mobile-actions">
              <router-link to="/daftar" class="navbar__mobile-btn navbar__mobile-btn--outline" @click="closeMobileMenu">Daftar</router-link>
              <router-link to="/daftar" class="navbar__mobile-btn navbar__mobile-btn--primary" @click="closeMobileMenu">Masuk</router-link>
            </div>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  border-bottom: 1px solid transparent;
  transition: all 0.4s ease;
}

/* Home: transparent at top */
.navbar--home {
  background: transparent;
  backdrop-filter: none; -webkit-backdrop-filter: none;
}

/* Home: scrolled → dark navy */
.navbar--home.navbar--scrolled {
  background: #01236F;
  border-bottom-color: rgba(255,255,255,0.08);
  box-shadow: 0 2px 12px rgba(1,35,111,0.3);
}

/* Non-home: always dark navy */
.navbar--solid {
  background: #01236F;
  border-bottom-color: rgba(255,255,255,0.08);
  box-shadow: 0 2px 12px rgba(1,35,111,0.3);
}

/* White text for dark backgrounds */
.navbar--solid .navbar__logo-text,
.navbar--solid .navbar__link,
.navbar--solid .navbar__link--register,
.navbar--solid .navbar__link--chat,
.navbar--home.navbar--scrolled .navbar__logo-text,
.navbar--home.navbar--scrolled .navbar__link,
.navbar--home.navbar--scrolled .navbar__link--register,
.navbar--home.navbar--scrolled .navbar__link--chat { color: #fff; }

.navbar--solid .navbar__link:hover,
.navbar--home.navbar--scrolled .navbar__link:hover { color: rgba(255,255,255,0.7); }

.navbar--solid .navbar__search-input,
.navbar--home.navbar--scrolled .navbar__search-input {
  background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.15); color: #fff;
}
.navbar--solid .navbar__search-input::placeholder,
.navbar--home.navbar--scrolled .navbar__search-input::placeholder { color: rgba(255,255,255,0.5); }
.navbar--solid .navbar__search-icon,
.navbar--home.navbar--scrolled .navbar__search-icon { color: rgba(255,255,255,0.5); }
.navbar--solid .navbar__search-input:focus,
.navbar--home.navbar--scrolled .navbar__search-input:focus {
  border-color: rgba(255,255,255,0.4); box-shadow: 0 0 0 3px rgba(255,255,255,0.08); background: rgba(255,255,255,0.18);
}

.navbar--solid .navbar__hamburger span,
.navbar--home.navbar--scrolled .navbar__hamburger span { background: #fff; }

.navbar--solid .navbar__avatar,
.navbar--home.navbar--scrolled .navbar__avatar { border-color: rgba(255,255,255,0.3); }

.navbar__inner {
  max-width: 1280px; margin: 0 auto; padding: 0 1.5rem;
  height: 64px; display: flex; align-items: center; gap: 1.5rem;
}
.navbar__logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; flex-shrink: 0; }
.navbar__logo-text { font-weight: 700; font-size: 1.25rem; color: #111827; letter-spacing: -0.02em; transition: color 0.4s ease; }
.navbar__nav { display: flex; align-items: center; gap: 1.5rem; margin-right: auto; }
.navbar__link { font-size: 0.9375rem; font-weight: 500; color: #374151; text-decoration: none; transition: color 0.3s; white-space: nowrap; cursor: pointer; }
.navbar__link:hover { color: #3B5BDB; }
.navbar__link--register { color: #374151; transition: color 0.3s; }
.navbar__link--chat { display: inline-flex; align-items: center; gap: 0.375rem; font-weight: 600; color: #374151; transition: color 0.3s; }
.navbar__link--chat:hover { color: #3B5BDB; }
.navbar__search { flex: 1; max-width: 320px; position: relative; }
.navbar__search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; transition: color 0.4s; }
.navbar__search-input {
  width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #E5E7EB; border-radius: 9999px;
  font-size: 0.875rem; color: #374151; background: #F9FAFB;
  transition: all 0.3s; outline: none;
}
.navbar__search-input::placeholder { color: #9CA3AF; transition: color 0.4s; }
.navbar__search-input:focus { border-color: #3B5BDB; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); background: #fff; }
.navbar__actions { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; margin-left: auto; }
.navbar__btn--primary {
  display: inline-flex; align-items: center; padding: 0.5rem 1.25rem;
  background: #3B5BDB; color: #fff; font-size: 0.875rem; font-weight: 600;
  border-radius: 9999px; text-decoration: none; transition: background 0.2s, transform 0.15s; cursor: pointer;
}
.navbar__btn--primary:hover { background: #2F4DC4; transform: translateY(-1px); }

/* Profile Dropdown */
.navbar__profile { position: relative; cursor: pointer; }
.navbar__avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid #E5E7EB; transition: border-color 0.2s; }
.navbar__profile:hover .navbar__avatar { border-color: #3B5BDB; }
.navbar__dropdown {
  position: absolute; top: calc(100% + 8px); right: 0; width: 220px;
  background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 0.5rem 0; z-index: 110;
}
.navbar__dropdown-header { padding: 0.75rem 1rem; }
.navbar__dropdown-name { display: block; font-size: 0.875rem; font-weight: 600; color: #111827; }
.navbar__dropdown-email { display: block; font-size: 0.75rem; color: #9CA3AF; margin-top: 0.125rem; }
.navbar__dropdown-divider { height: 1px; background: #F3F4F6; margin: 0.25rem 0; }
.navbar__dropdown-item {
  display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.5rem 1rem;
  font-size: 0.8125rem; font-weight: 500; color: #374151; text-decoration: none;
  background: none; border: none; cursor: pointer; transition: background 0.15s;
}
.navbar__dropdown-item:hover { background: #F9FAFB; }
.navbar__dropdown-item--danger { color: #EF4444; }
.navbar__dropdown-item--danger:hover { background: #FEF2F2; }

/* Dropdown transition */
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

/* Hamburger */
.navbar__hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; z-index: 110; }
.navbar__hamburger span { display: block; width: 22px; height: 2px; background: #374151; border-radius: 2px; transition: all 0.3s ease; }
.navbar__hamburger--open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
.navbar__hamburger--open span:nth-child(2) { opacity: 0; }
.navbar__hamburger--open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

/* Mobile Menu */
.navbar__mobile { position: absolute; top: 64px; left: 0; right: 0; background: #fff; border-bottom: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.navbar__mobile-nav { padding: 1rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
.navbar__mobile-search { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; border: 1px solid #E5E7EB; border-radius: 12px; background: #F9FAFB; margin-bottom: 0.75rem; color: #9CA3AF; }
.navbar__mobile-search input { flex: 1; border: none; outline: none; font-size: 0.9375rem; color: #374151; background: transparent; }
.navbar__mobile-link { display: block; padding: 0.75rem 0; font-size: 1rem; font-weight: 500; color: #374151; text-decoration: none; border-bottom: 1px solid #F3F4F6; transition: color 0.2s; }
.navbar__mobile-link:hover { color: #3B5BDB; }
.navbar__mobile-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.navbar__mobile-btn { flex: 1; text-align: center; padding: 0.625rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; }
.navbar__mobile-btn--outline { border: 1.5px solid #D1D5DB; color: #374151; background: #fff; }
.navbar__mobile-btn--outline:hover { border-color: #3B5BDB; color: #3B5BDB; }
.navbar__mobile-btn--primary { background: #3B5BDB; color: #fff; border: 1.5px solid #3B5BDB; }
.navbar__mobile-btn--primary:hover { background: #2F4DC4; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 1024px) { .navbar__search { max-width: 220px; } }
@media (max-width: 768px) {
  .navbar__nav, .navbar__search, .navbar__actions { display: none; }
  .navbar__hamburger { display: flex; margin-left: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .navbar, .navbar__btn--primary, .navbar__hamburger span { transition: none; }
  .slide-down-enter-active, .slide-down-leave-active { transition: none; }
}
</style>
