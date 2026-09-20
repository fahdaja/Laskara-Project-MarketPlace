import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/index.css'

import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)
app.use(createPinia())
app.use(VueQueryPlugin)
app.use(router)
app.mount('#app')
