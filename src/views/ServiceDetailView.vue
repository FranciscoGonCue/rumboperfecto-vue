<template>
  <div class="svc-root" :class="store.isDark ? 'dark-mode' : 'light-mode'">

    <!-- Back -->
    <div class="svc-topbar">
      <button class="svc-back-btn" @click="store.closeServiceDetail()">
        <ArrowLeft :size="16" /> Volver
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="svc-state">
      <div class="svc-spinner" />
      <p class="svc-state-text">Cargando servicio...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="svc-state">
      <AlertCircle :size="40" class="opacity-30" />
      <p class="svc-state-text">{{ error }}</p>
      <button class="svc-retry-btn" @click="load">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else-if="svc" class="svc-content">

      <!-- Hero -->
      <div class="svc-hero">
        <img v-if="svc.imagen_url" :src="svc.imagen_url" :alt="svc.nombre ?? ''" class="svc-hero-img" />
        <div v-else class="svc-hero-placeholder">
          <component :is="kindIcon" :size="56" class="opacity-20" />
        </div>
        <div class="svc-hero-overlay" />
        <div class="svc-hero-badges">
          <span class="svc-kind-badge" :style="`background:${kindColor}`">
            <component :is="kindIcon" :size="12" />
            {{ svc.tipo?.nombre_tipo ?? 'Servicio' }}
          </span>
          <span v-if="svc.disponible === false" class="svc-unavail-badge">No disponible</span>
        </div>
      </div>

      <!-- Main info -->
      <div class="svc-body">

        <!-- Header -->
        <div class="svc-header-block">
          <h1 class="svc-title">{{ svc.nombre ?? 'Sin nombre' }}</h1>
          <div class="svc-price-row">
            <span class="svc-price" v-if="svc.precio_base != null">
              {{ svc.precio_base.toFixed(2) }} €
            </span>
            <span class="svc-price-label" v-if="svc.precio_base != null">{{ priceLabel }}</span>
          </div>
        </div>

        <!-- Description -->
        <p v-if="svc.descripcion" class="svc-desc">{{ svc.descripcion }}</p>

        <ServiceReviewsPanel v-if="svc" :servicio-id="String(svc.id_servicio)" />

        <!-- ── ALOJAMIENTO details ── -->
        <div v-if="svc.detalle_alojamiento" class="svc-detail-card">
          <h3 class="svc-detail-title"><Hotel :size="15" /> Detalles del alojamiento</h3>
          <div class="svc-detail-grid">
            <div v-if="svc.detalle_alojamiento.estrellas != null" class="svc-detail-item">
              <span class="svc-detail-label">Categoría</span>
              <span class="svc-detail-value">
                <span v-for="i in svc.detalle_alojamiento.estrellas" :key="i" class="text-yellow-400">★</span>
                {{ svc.detalle_alojamiento.estrellas }} estrellas
              </span>
            </div>
            <div v-if="svc.detalle_alojamiento.hora_checkin" class="svc-detail-item">
              <span class="svc-detail-label">Check-in</span>
              <span class="svc-detail-value">{{ svc.detalle_alojamiento.hora_checkin }}</span>
            </div>
            <div v-if="svc.detalle_alojamiento.hora_checkout" class="svc-detail-item">
              <span class="svc-detail-label">Check-out</span>
              <span class="svc-detail-value">{{ svc.detalle_alojamiento.hora_checkout }}</span>
            </div>
            <div v-if="svc.detalle_alojamiento.servicios_extra" class="svc-detail-item svc-detail-item--full">
              <span class="svc-detail-label">Servicios extra</span>
              <span class="svc-detail-value">{{ svc.detalle_alojamiento.servicios_extra }}</span>
            </div>
          </div>
        </div>

        <!-- ── TRANSPORTE details ── -->
        <div v-if="svc.detalle_transporte" class="svc-detail-card">
          <h3 class="svc-detail-title"><Plane :size="15" /> Detalles del transporte</h3>
          <div class="svc-detail-grid">
            <div v-if="svc.detalle_transporte.ciudad_origen" class="svc-detail-item">
              <span class="svc-detail-label">Origen</span>
              <span class="svc-detail-value">{{ svc.detalle_transporte.ciudad_origen }}</span>
            </div>
            <div v-if="svc.detalle_transporte.ciudad_destino" class="svc-detail-item">
              <span class="svc-detail-label">Destino</span>
              <span class="svc-detail-value">{{ svc.detalle_transporte.ciudad_destino }}</span>
            </div>
            <div v-if="svc.detalle_transporte.compania" class="svc-detail-item">
              <span class="svc-detail-label">Compañía</span>
              <span class="svc-detail-value">{{ svc.detalle_transporte.compania }}</span>
            </div>
            <div v-if="svc.detalle_transporte.codigo_vuelo" class="svc-detail-item">
              <span class="svc-detail-label">Código vuelo</span>
              <span class="svc-detail-value font-mono">{{ svc.detalle_transporte.codigo_vuelo }}</span>
            </div>
            <div v-if="svc.detalle_transporte.duracion_minutos != null" class="svc-detail-item">
              <span class="svc-detail-label">Duración</span>
              <span class="svc-detail-value">{{ formatDuration(svc.detalle_transporte.duracion_minutos) }}</span>
            </div>
          </div>
        </div>

        <!-- ── RESTAURACIÓN details ── -->
        <div v-if="svc.detalle_restauracion" class="svc-detail-card">
          <h3 class="svc-detail-title"><Utensils :size="15" /> Detalles del restaurante</h3>
          <div class="svc-detail-grid">
            <div v-if="svc.detalle_restauracion.tipo_cocina" class="svc-detail-item">
              <span class="svc-detail-label">Tipo de cocina</span>
              <span class="svc-detail-value">{{ svc.detalle_restauracion.tipo_cocina }}</span>
            </div>
            <div v-if="svc.detalle_restauracion.precio_medio != null" class="svc-detail-item">
              <span class="svc-detail-label">Precio medio/persona</span>
              <span class="svc-detail-value">{{ svc.detalle_restauracion.precio_medio.toFixed(2) }} €</span>
            </div>
            <div class="svc-detail-item">
              <span class="svc-detail-label">Vegano</span>
              <span class="svc-detail-value">{{ svc.detalle_restauracion.es_vegano ? 'Sí' : 'No' }}</span>
            </div>
            <div class="svc-detail-item">
              <span class="svc-detail-label">Reserva necesaria</span>
              <span class="svc-detail-value">{{ svc.detalle_restauracion.requiere_reserva ? 'Sí' : 'No' }}</span>
            </div>
          </div>
        </div>

        <!-- ── ACTIVIDAD details ── -->
        <div v-if="svc.detalle_actividad" class="svc-detail-card">
          <h3 class="svc-detail-title"><Compass :size="15" /> Detalles de la actividad</h3>
          <div class="svc-detail-grid">
            <div v-if="svc.detalle_actividad.duracion_estimada != null" class="svc-detail-item">
              <span class="svc-detail-label">Duración</span>
              <span class="svc-detail-value">{{ formatDuration(svc.detalle_actividad.duracion_estimada) }}</span>
            </div>
            <div v-if="svc.detalle_actividad.aforo_maximo != null" class="svc-detail-item">
              <span class="svc-detail-label">Aforo máximo</span>
              <span class="svc-detail-value">{{ svc.detalle_actividad.aforo_maximo }} personas</span>
            </div>
            <div v-if="svc.detalle_actividad.horario_apertura" class="svc-detail-item">
              <span class="svc-detail-label">Horario</span>
              <span class="svc-detail-value">{{ svc.detalle_actividad.horario_apertura }}</span>
            </div>
            <div class="svc-detail-item">
              <span class="svc-detail-label">Guía incluido</span>
              <span class="svc-detail-value">{{ svc.detalle_actividad.guia_incluido ? 'Sí' : 'No' }}</span>
            </div>
          </div>
        </div>

        <!-- CTA añadir a plan -->
        <button class="svc-cta" @click="store.setCurrentView('plan')">
          <Plus :size="16" /> Añadir a un plan
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Hotel, Plane, Utensils, Compass, Plus, AlertCircle } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { serviciosApi, type Servicio } from '@/services/api'
import ServiceReviewsPanel from '@/components/ServiceReviewsPanel.vue'

const store = useAppStore()
const loading = ref(true)
const error = ref<string | null>(null)
const svc = ref<Servicio | null>(null)

async function load() {
  if (store.selectedServicioId == null) { error.value = 'No se especificó ningún servicio.'; loading.value = false; return }
  loading.value = true; error.value = null
  try {
    svc.value = await serviciosApi.getOne(store.selectedServicioId)
  } catch {
    error.value = 'No se pudo cargar el servicio. Comprueba tu conexión.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const kindColor = computed(() => {
  const t = (svc.value?.tipo?.nombre_tipo ?? '').toLowerCase()
  if (t.includes('alojamiento') || t.includes('hotel')) return '#3b82f6'
  if (t.includes('actividad') || t.includes('aventura')) return '#10b981'
  if (t.includes('restaur') || t.includes('comida') || t.includes('restauraci')) return '#ef4444'
  if (t.includes('transporte') || t.includes('vuelo')) return '#6366f1'
  return '#f97316'
})

const kindIcon = computed(() => {
  const t = (svc.value?.tipo?.nombre_tipo ?? '').toLowerCase()
  if (t.includes('alojamiento') || t.includes('hotel')) return Hotel
  if (t.includes('actividad') || t.includes('aventura')) return Compass
  if (t.includes('restaur') || t.includes('comida') || t.includes('restauraci')) return Utensils
  if (t.includes('transporte') || t.includes('vuelo')) return Plane
  return Compass
})

const priceLabel = computed(() => {
  const t = (svc.value?.tipo?.nombre_tipo ?? '').toLowerCase()
  if (t.includes('alojamiento') || t.includes('hotel')) return '/ noche'
  if (t.includes('actividad')) return '/ persona'
  if (t.includes('transporte') || t.includes('vuelo')) return '/ billete'
  return '/ persona'
})

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}
</script>

<style scoped>
.dark-mode {
  --bg: #0a0a0f; --surface: #111118; --surface-2: #18181f;
  --border: rgba(255,255,255,0.07); --text: #e8e8f0; --muted: #5a5a70; --accent: #f97316;
}
.light-mode {
  --bg: #f4f4f9; --surface: #ffffff; --surface-2: #f0f0f6;
  --border: rgba(15,23,42,0.08); --text: #0f172a; --muted: #94a3b8; --accent: #f97316;
}

.svc-root {
  min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: 'DM Sans', sans-serif;
}

.svc-topbar {
  position: sticky; top: 0; z-index: 10;
  padding: 12px 20px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
}
.svc-back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 12px;
  background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.25);
  color: var(--accent); font-size: 13px; font-weight: 900;
  text-transform: uppercase; letter-spacing: .06em;
  cursor: pointer; transition: all .2s;
}
.svc-back-btn:hover { background: rgba(249,115,22,.15); }

.svc-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 60vh; gap: 16px; color: var(--muted);
}
.svc-spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 3px solid var(--border); border-top-color: var(--accent);
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.svc-state-text { font-size: 14px; font-weight: 600; }
.svc-retry-btn {
  padding: 10px 24px; border-radius: 12px;
  background: var(--accent); color: #fff; font-weight: 900; font-size: 13px;
  text-transform: uppercase; cursor: pointer; transition: opacity .15s;
}
.svc-retry-btn:hover { opacity: .85; }

.svc-content { max-width: 760px; margin: 0 auto; padding-bottom: 40px; }

.svc-hero {
  position: relative; height: 280px; overflow: hidden;
  background: var(--surface-2);
}
.svc-hero-img { width: 100%; height: 100%; object-fit: cover; }
.svc-hero-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
}
.svc-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 55%);
}
.svc-hero-badges {
  position: absolute; bottom: 16px; left: 20px;
  display: flex; gap: 8px; align-items: center;
}
.svc-kind-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 99px;
  font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em;
  color: #fff;
}
.svc-unavail-badge {
  padding: 5px 12px; border-radius: 99px;
  background: rgba(239,68,68,.8); color: #fff;
  font-size: 10px; font-weight: 900; text-transform: uppercase;
}

.svc-body { padding: 24px 20px; display: flex; flex-direction: column; gap: 20px; }

.svc-header-block { display: flex; flex-direction: column; gap: 8px; }
.svc-title {
  font-size: 28px; font-weight: 900; text-transform: uppercase; line-height: 1.1;
  font-family: 'Syne', sans-serif; color: var(--text);
}
.svc-price-row { display: flex; align-items: baseline; gap: 6px; }
.svc-price { font-size: 26px; font-weight: 900; color: var(--accent); font-family: 'Syne', sans-serif; }
.svc-price-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; }

.svc-desc {
  font-size: 14px; line-height: 1.7; color: var(--muted);
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px 18px;
}

.svc-detail-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 18px; overflow: hidden;
}
.svc-detail-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em;
  color: var(--accent); margin-bottom: 14px;
}
.svc-detail-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.svc-detail-item {
  display: flex; flex-direction: column; gap: 3px;
  background: var(--surface-2); border-radius: 12px; padding: 10px 12px;
}
.svc-detail-item--full { grid-column: 1 / -1; }
.svc-detail-label {
  font-size: 9px; font-weight: 900; text-transform: uppercase;
  letter-spacing: .1em; color: var(--muted);
}
.svc-detail-value { font-size: 13px; font-weight: 700; color: var(--text); }

.svc-cta {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 16px; border-radius: 18px;
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: #fff; font-size: 14px; font-weight: 900;
  text-transform: uppercase; letter-spacing: .08em;
  box-shadow: 0 6px 24px rgba(249,115,22,.4);
  cursor: pointer; transition: all .2s; border: none;
}
.svc-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(249,115,22,.55); }
</style>
