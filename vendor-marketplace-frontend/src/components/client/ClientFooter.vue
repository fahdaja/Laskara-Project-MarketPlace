<script setup lang="ts">
defineProps<{
  showCta?: boolean
}>()
</script>

<template>
  <footer class="footer">
    <!-- CTA Section -->
    <section v-if="showCta !== false" class="footer__cta">
      <h2 class="footer__cta-title">Apakah Anda Seorang Profesional?</h2>
      <p class="footer__cta-desc">
        Bergabunglah dengan komunitas LayananPro dan mulailah
        melayani ribuan klien potensial di seluruh Indonesia.
      </p>
      <router-link to="/daftar" class="footer__cta-btn">Daftar Sebagai Vendor</router-link>
    </section>

    <!-- Footer Links -->
    <div class="footer__content">
      <div class="footer__grid">
        <div class="footer__brand">
          <router-link to="/" class="footer__logo" aria-label="Home">
            <img src="/images/logo.png" alt="LayananPro Logo" width="32" height="32" />
            <span>LayananPro</span>
          </router-link>
          <p class="footer__brand-desc">Platform terpercaya untuk menghubungkan klien dengan vendor profesional terbaik di bidangnya.</p>
          <div class="footer__socials">
            <a href="#" aria-label="Facebook" class="footer__social-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
            <a href="#" aria-label="Twitter" class="footer__social-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg></a>
            <a href="#" aria-label="Instagram" class="footer__social-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
            <a href="#" aria-label="LinkedIn" class="footer__social-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
            <a href="#" aria-label="YouTube" class="footer__social-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white"/></svg></a>
          </div>
        </div>
        <div class="footer__col">
          <h3 class="footer__col-title">Kategori</h3>
          <ul class="footer__links">
            <li><a href="#">Creative Studio</a></li>
            <li><a href="#">Event Essentials</a></li>
            <li><a href="#">Digital Marketing</a></li>
            <li><a href="#">Finance</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3 class="footer__col-title">Dukungan</h3>
          <ul class="footer__links">
            <li><a href="#">Pusat Bantuan</a></li>
            <li><a href="#">Keamanan Transaksi</a></li>
            <li><a href="#">Kebijakan Transaksi</a></li>
            <li><a href="#">Syarat &amp; Ketentuan</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3 class="footer__col-title">Contact us</h3>
          <ul class="footer__contact">
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>contact@company.com</span></li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg><span>(414) 687 – 5892</span></li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><span>794 Mcallister St<br/>San Francisco, 94102</span></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; {{ new Date().getFullYear() }} LayananPro. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer__cta { text-align: center; padding: 4rem 1.5rem; background: linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%); }
.footer__cta-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; }
.footer__cta-desc { font-size: 1rem; color: #4B5563; max-width: 480px; margin: 0 auto 1.5rem; line-height: 1.6; }
.footer__cta-btn { display: inline-flex; align-items: center; padding: 0.75rem 2rem; background: #3B5BDB; color: #fff; font-weight: 600; font-size: 0.9375rem; border-radius: 9999px; text-decoration: none; transition: all 0.2s; cursor: pointer; }
.footer__cta-btn:hover { background: #2F4DC4; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(59,91,219,0.3); }
.footer__content { max-width: 1280px; margin: 0 auto; padding: 3.5rem 1.5rem 1.5rem; }
.footer__grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1.2fr; gap: 2.5rem; }
.footer__logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.125rem; color: #111827; text-decoration: none; margin-bottom: 1rem; }
.footer__brand-desc { font-size: 0.875rem; color: #6B7280; line-height: 1.7; margin-bottom: 1.25rem; }
.footer__socials { display: flex; gap: 0.75rem; }
.footer__social-link { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; color: #6B7280; transition: all 0.2s; cursor: pointer; }
.footer__social-link:hover { color: #3B5BDB; background: #EDE9FE; }
.footer__col-title { font-size: 0.9375rem; font-weight: 700; color: #111827; margin-bottom: 1rem; }
.footer__links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.footer__links a { font-size: 0.875rem; color: #6B7280; text-decoration: none; transition: color 0.2s; }
.footer__links a:hover { color: #3B5BDB; }
.footer__contact { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.footer__contact li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: #4B5563; }
.footer__contact li svg { flex-shrink: 0; margin-top: 2px; color: #6B7280; }
.footer__bottom { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #E5E7EB; }
.footer__bottom p { font-size: 0.8125rem; color: #9CA3AF; text-align: center; }
@media (max-width: 1024px) { .footer__grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
@media (max-width: 768px) {
  .footer__cta-title { font-size: 1.375rem; }
  .footer__grid { grid-template-columns: 1fr; gap: 2rem; }
  .footer__brand { order: -1; }
}
@media (max-width: 375px) { .footer__cta { padding: 3rem 1rem; } .footer__content { padding: 2.5rem 1rem 1rem; } }
</style>
