import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '@/stores/app'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const appStore = useAppStore(pinia)
appStore.loadThemeFromStorage()

app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue]', err, info)
}

try {
  app.mount('#app')
} catch (e) {
  console.error('[mount]', e)
  const root = document.getElementById('app')
  if (root) {
    root.innerHTML = `<p style="padding:1.5rem;font-family:system-ui,sans-serif;color:#b91c1c">No se pudo iniciar la app. Revisa la consola (F12).</p>`
  }
}
