<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth.store'

const route = useRoute()
const authStore = useAuthStore()

const userRole = computed(() => authStore.user?.role?.toUpperCase() || 'MERCHANT_OWNER')

// Sidebar collapse state
const isCollapsed = ref(false)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// Transaksi sub-menu expand
const isTransaksiOpen = ref(false)
const toggleTransaksi = () => {
  isTransaksiOpen.value = !isTransaksiOpen.value
}

onMounted(() => {
  if (route.path.includes('/vendor/finance')) {
    isTransaksiOpen.value = true
  }
})

watch(() => route.path, (newPath) => {
  if (newPath.includes('/vendor/finance')) {
    isTransaksiOpen.value = true
  }
})

const menuItems = computed(() => {
  const items = [
    {
      name: 'Beranda',
      path: userRole.value === 'MERCHANT_ASSOCIATE' ? '/vendor/associate/dashboard' : '/vendor/dashboard',
      icon: 'home',
    },
    {
      name: 'Toko Saya',
      path: '/vendor/my-store',
      icon: 'store',
    },
    {
      name: 'Associate Toko',
      path: '/vendor/associates',
      icon: 'users',
    },
    {
      name: 'Layanan',
      path: userRole.value === 'MERCHANT_ASSOCIATE' ? '/vendor/associate/catalog' : '/vendor/catalog',
      icon: 'service',
    },
    {
      name: 'Pesan & Penawaran',
      path: userRole.value === 'MERCHANT_ASSOCIATE' ? '/vendor/associate/messages' : '/vendor/messages',
      icon: 'chat',
    },
    {
      name: 'Operasional Order',
      path: userRole.value === 'MERCHANT_ASSOCIATE' ? '/vendor/associate/orders' : '/vendor/orders',
      icon: 'package',
    },
    {
      name: 'Transaksi',
      path: '/vendor/finance',
      icon: 'wallet',
      children: [
        { name: 'Keuangan', path: '/vendor/finance' },
        { name: 'Riwayat transaksi', path: '/vendor/finance/history' },
      ],
    },
  ]

  // Filter finance for associates
  if (userRole.value === 'MERCHANT_ASSOCIATE') {
    return items.filter(item => item.icon !== 'wallet')
  }

  return items
})

const currentPath = computed(() => route.path)

const isActive = (path: string) => currentPath.value === path
const isParentActive = (item: any) => {
  if (isActive(item.path)) return true
  if (item.children) {
    return item.children.some((c: any) => isActive(c.path))
  }
  return false
}
</script>

<template>
  <div class="vendor-layout">
    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ collapsed: isCollapsed }"
    >
      <div class="sidebar-inner">
        <!-- Toggle Button -->
        <button class="toggle-btn" @click="toggleSidebar" :title="isCollapsed ? 'Perluas' : 'Perkecil'">
          <svg class="toggle-icon" :class="{ rotated: isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <template v-for="item in menuItems" :key="item.path">
            <!-- Item WITH children (Transaksi) -->
            <div v-if="item.children" class="nav-group">
              <button
                class="nav-item"
                :class="{ active: isParentActive(item) }"
                @click="toggleTransaksi"
                :title="item.name"
              >
                <span class="nav-icon">
                  <!-- Wallet / Transaksi icon -->
                  <svg v-if="item.icon === 'wallet'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                <span class="nav-label">{{ item.name }}</span>
                <svg class="chevron" :class="{ open: isTransaksiOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Sub-items -->
              <Transition name="submenu">
                <div v-if="isTransaksiOpen && !isCollapsed" class="sub-items">
                  <router-link
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    class="sub-item"
                    :class="{ active: isActive(child.path) }"
                  >
                    <span class="sub-line"></span>
                    <span class="sub-label">{{ child.name }}</span>
                  </router-link>
                </div>
              </Transition>
            </div>

            <!-- Regular item -->
            <router-link
              v-else
              :to="item.path"
              class="nav-item"
              :class="{ active: isActive(item.path) }"
              :title="item.name"
            >
              <span class="nav-icon">
                <!-- Home -->
                <svg v-if="item.icon === 'home'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <!-- Store -->
                <svg v-else-if="item.icon === 'store'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h18l-2 8H5L3 3zm0 0l-1 9h20l-1-9M5 21h14a1 1 0 001-1v-5H4v5a1 1 0 001 1z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 21v-4h6v4" />
                </svg>
                <!-- Users / Associate Toko -->
                <svg v-else-if="item.icon === 'users'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <!-- Service / Layanan -->
                <svg v-else-if="item.icon === 'service'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <!-- Chat / Pesan -->
                <svg v-else-if="item.icon === 'chat'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <!-- Package / Operasional -->
                <svg v-else-if="item.icon === 'package'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </span>
              <span class="nav-label">{{ item.name }}</span>
            </router-link>
          </template>
        </nav>
      </div>

      <!-- Profile Section -->
      <div class="sidebar-bottom">
        <router-link to="/vendor/profile" class="profile-card" :title="isCollapsed ? 'Profil' : ''">
          <div class="avatar-wrapper">
            <img v-if="authStore.user?.avatar || authStore.user?.avatarUrl" :src="authStore.user?.avatar || authStore.user?.avatarUrl" alt="Profil" />
            <div v-else class="avatar-fallback">
              {{ (authStore.user?.fullName || authStore.user?.name || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="profile-info" v-if="!isCollapsed">
            <span class="profile-name">{{ authStore.user?.fullName || authStore.user?.name || 'User' }}</span>
            <span class="profile-role">{{ authStore.user?.role || 'Vendor' }}</span>
          </div>
        </router-link>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'collapsed-sidebar': isCollapsed }">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   VENDOR SIDEBAR LAYOUT
   Design: Sky-blue rounded sidebar, collapsible
   ============================================ */

.vendor-layout {
  min-height: 100vh;
  background: #FAF9F9;
  display: flex;
  padding: 20px;
  gap: 24px;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: #1e293b;
}

/* --- Sidebar --- */
.sidebar {
  position: sticky;
  top: 20px;
  align-self: flex-start;
  width: 260px;
  min-width: 260px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
}

.sidebar.collapsed {
  width: 72px;
  min-width: 72px;
}

.sidebar-inner {
  background: linear-gradient(180deg, #5BB0FF 0%, #4DA3FF 40%, #3B93F0 100%);
  border-radius: 24px;
  padding: 16px 10px 24px;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  box-shadow:
    0 4px 24px rgba(77, 163, 255, 0.25),
    0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* --- Toggle Button --- */
.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  margin: 0 auto 16px;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* --- Navigation --- */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

/* --- Nav Icon --- */
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 22px;
  height: 22px;
}

/* --- Nav Label --- */
.nav-label {
  opacity: 1;
  transition: opacity 0.2s ease 0.1s;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-label {
  opacity: 0;
  width: 0;
  transition: opacity 0.15s ease;
}

/* --- Chevron (Transaksi expand) --- */
.chevron {
  width: 16px;
  height: 16px;
  margin-left: auto;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.chevron.open {
  transform: rotate(180deg);
}

.sidebar.collapsed .chevron {
  opacity: 0;
  width: 0;
  margin: 0;
}

/* --- Sub-items (Riwayat transaksi) --- */
.sub-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 20px;
  margin-top: 2px;
}

.sub-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 450;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.sub-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.08);
}

.sub-item.active {
  color: white;
  font-weight: 600;
}

.sub-line {
  width: 16px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  flex-shrink: 0;
}

.sub-item.active .sub-line {
  background: white;
}

/* --- Sub-menu transition --- */
.submenu-enter-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.submenu-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-4px);
}
.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 100px;
  transform: translateY(0);
}

/* --- Nav Group --- */
.nav-group {
  display: flex;
  flex-direction: column;
}

/* --- Profile Section --- */
.sidebar-bottom {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 10px;
  border-radius: 16px;
  width: 100%;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.profile-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.sidebar.collapsed .profile-card {
  padding: 8px;
  justify-content: center;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  border: none;
  background: transparent;
  box-shadow: none;
}

.sidebar.collapsed .profile-card:hover {
  background: rgba(0,0,0,0.05);
  transform: none;
}

.avatar-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
}

.sidebar.collapsed .avatar-wrapper {
  width: 32px;
  height: 32px;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background-color: #1E3A8A;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.profile-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}

.profile-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-overflow: ellipsis;
  overflow: hidden;
}

.profile-role {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

/* --- Main Content --- */
.main-content {
  flex: 1;
  max-width: 1400px;
  background: #FAF9F9;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

/* --- Collapsed sidebar adjustments --- */
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px 0;
  gap: 0;
}

.sidebar.collapsed .sub-items {
  display: none;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .vendor-layout {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }

  .sidebar {
    position: relative;
    top: 0;
    width: 100% !important;
    min-width: 100% !important;
  }

  .sidebar-inner {
    flex-direction: row;
    min-height: auto;
    padding: 10px 12px;
    border-radius: 16px;
    overflow-x: auto;
    gap: 4px;
  }

  .sidebar-nav {
    flex-direction: row;
    gap: 2px;
  }

  .toggle-btn {
    display: none;
  }

  .nav-label {
    display: none;
  }

  .chevron {
    display: none;
  }

  .sidebar-bottom {
    display: none;
  }

  .sub-items {
    display: none;
  }

  .nav-item {
    padding: 8px;
    justify-content: center;
  }
}

/* --- Reduced motion --- */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .toggle-icon,
  .nav-item,
  .nav-label,
  .chevron,
  .submenu-enter-active,
  .submenu-leave-active {
    transition: none !important;
  }
}
</style>
