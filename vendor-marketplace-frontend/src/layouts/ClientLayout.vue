<script setup lang="ts">
import ClientNavbar from '../components/client/ClientNavbar.vue'
import ClientFooter from '../components/client/ClientFooter.vue'
</script>

<template>
  <div class="client-layout">
    <ClientNavbar />
    <main class="client-main">
      <router-view />
    </main>
    <ClientFooter />
  </div>
</template>

<style scoped>
.client-main {
  padding-top: 64px;
  min-height: 100vh;
}
</style>
