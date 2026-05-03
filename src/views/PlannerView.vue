<template>
  <!-- FULL-PAGE PLAN DETAIL — overlays everything when a plan is selected -->
  <Transition name="slide-up">
    <PlanDetail
      v-if="selectedPlan"
      :plan="selectedPlan"
      :loading="planDetailLoading"
      class="fixed inset-0 z-[60] overflow-y-auto"
      @close="selectedPlan = null"
      @delete="handleDeletePlan"
    />
  </Transition>

  <div class="p-6 lg:p-12 min-h-full transition-colors"
       :class="store.isDark ? 'bg-rp-bg' : ''">
    <div class="max-w-6xl mx-auto">
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-4xl font-black uppercase tracking-tighter leading-none"
              :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
              style="font-family: 'Syne', sans-serif;">
            Mis Viajes
          </h2>
          <div class="h-1 w-12 bg-rp-accent rounded-full mt-3" />
        </div>

        <div class="flex items-center space-x-3">
          <!-- View toggle -->
          <div class="flex rounded-2xl p-1"
               :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-gray-100 shadow-md'">
            <button
              class="px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 text-sm"
              :class="viewMode === 'cards'
                ? store.isDark
                  ? 'bg-rp-surface-2 text-rp-accent shadow-sm border border-rp-border'
                  : 'bg-white shadow-md text-rumbo-orange'
                : store.isDark
                  ? 'text-rp-muted hover:text-rp-text'
                  : 'text-gray-500 hover:text-gray-700'"
              @click="viewMode = 'cards'"
              title="Vista de tarjetas"
            >
              <span class="hidden sm:inline">Tarjetas</span>
              <span class="sm:hidden">📇</span>
            </button>
            <button
              class="px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 text-sm"
              :class="viewMode === 'calendar'
                ? store.isDark
                  ? 'bg-rp-surface-2 text-rp-accent shadow-sm border border-rp-border'
                  : 'bg-white shadow-md text-rumbo-orange'
                : store.isDark
                  ? 'text-rp-muted hover:text-rp-text'
                  : 'text-gray-500 hover:text-gray-700'"
              @click="viewMode = 'calendar'"
              title="Vista de calendario"
            >
              <span class="hidden sm:inline">Calendario</span>
              <span class="sm:hidden">📅</span>
            </button>
          </div>

          <!-- New trip button -->
          <button
            class="flex items-center space-x-2 px-5 py-3.5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
            :class="store.isDark
              ? 'bg-rp-accent text-white shadow-orange-900/40 hover:bg-orange-500 hover:shadow-orange-900/60'
              : 'bg-gradient-to-r from-rumbo-orange to-orange-600 text-white shadow-orange-200 hover:shadow-orange-300'"
            @click="showAddTripModal = true"
            title="Crear un nuevo viaje"
          >
            <Plus :size="18" />
            <span class="hidden sm:inline text-sm">Nuevo Viaje</span>
          </button>
        </div>
      </div>

      <!-- Network Error Banner -->
      <Transition name="fade-down">
        <div
          v-if="store.networkError"
          class="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl border"
          :class="store.isDark
            ? 'bg-red-950/30 border-red-800/40 text-red-300'
            : 'bg-red-50 border-red-200 text-red-700'"
        >
          <AlertCircle :size="18" class="flex-shrink-0" />
          <p class="text-sm font-bold">{{ store.networkError }}</p>
          <button
            class="ml-auto text-xs font-black uppercase tracking-wider opacity-60 hover:opacity-100"
            @click="store.networkError = null"
          >
            Cerrar
          </button>
        </div>
      </Transition>

      <!-- EMPTY STATE -->
      <div v-if="store.planes.length === 0" class="text-center py-20">
        <div class="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center"
             :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-orange-50'">
          <Plane :size="56" class="text-rp-accent" />
        </div>
        <h3 class="text-2xl font-black mb-3"
            :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
            style="font-family: 'Syne', sans-serif;">¡Comienza tu aventura!</h3>
        <p class="mb-8 text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
          Aún no has creado ningún viaje. Crea tu primer itinerario ahora.
        </p>
        <button
          class="px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
          :class="store.isDark
            ? 'bg-rp-accent text-white shadow-orange-900/40 hover:bg-orange-500'
            : 'bg-gradient-to-r from-rumbo-orange to-orange-600 text-white shadow-orange-200'"
          @click="showAddTripModal = true"
        >
          Crear Mi Primer Viaje
        </button>
      </div>

      <!-- TRIPS CONTENT -->
      <div v-else>
        <!-- LOADING -->
        <div v-if="store.planesLoading" class="flex justify-center py-20">
          <div class="w-10 h-10 rounded-full border-4 border-rp-accent border-t-transparent animate-spin" />
        </div>

        <!-- CARDS MODE -->
        <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="trip in store.planes"
            :key="trip.id_plan"
            class="rounded-2xl overflow-hidden group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
            :class="store.isDark
              ? 'bg-rp-surface border border-rp-border hover:border-rp-accent/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
              : 'bg-white shadow-lg hover:shadow-2xl'"
          >
            <!-- Color bar -->
            <div
              class="h-1 w-full"
              :style="{ background: getTripColor(String(trip.id_plan)) }"
            />

            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-black uppercase tracking-tight transition-colors"
                    :class="store.isDark
                      ? 'text-rp-text group-hover:text-rp-accent'
                      : 'text-gray-800 group-hover:text-rumbo-orange'">
                  {{ trip.nombre_plan || `Plan ${trip.id_plan}` }}
                </h3>
                <span
                  v-if="trip.estado_plan"
                  class="ml-2 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-yellow-100 text-yellow-700': trip.estado_plan === 'Borrador',
                    'bg-green-100 text-green-700': trip.estado_plan === 'Confirmado',
                    'bg-gray-100 text-gray-500': trip.estado_plan === 'Finalizado',
                  }"
                >{{ trip.estado_plan }}</span>
              </div>

              <div class="flex items-center space-x-2 text-sm mb-4"
                   :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                <Calendar :size="16" class="text-rp-accent" />
                <span class="font-semibold">
                  {{ trip.fecha_inicio ? formatDate(trip.fecha_inicio) : '—' }}
                  –
                  {{ trip.fecha_fin ? formatDate(trip.fecha_fin) : '—' }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-5">
                <div class="rounded-xl p-3 text-center"
                     :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-orange-50'">
                  <p class="text-xl font-black text-rp-accent">{{ getPlanDays(trip) }}</p>
                  <p class="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">días</p>
                </div>
                <div class="rounded-xl p-3 text-center"
                     :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-blue-50'">
                  <p class="text-xl font-black text-blue-400">{{ trip.items.length }}</p>
                  <p class="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-blue-600'">ítems</p>
                </div>
              </div>

              <button
                class="w-full py-2.5 rounded-xl font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.05] text-sm"
                :class="store.isDark
                  ? 'bg-rp-accent text-white hover:bg-orange-500 shadow-orange-900/30'
                  : 'bg-gradient-to-r from-rumbo-orange to-orange-600 text-white'"
                @click.stop="openPlanDetail(trip.id_plan)"
              >
                Ver Detalles →
              </button>
            </div>
          </div>
        </div>

        <!-- CALENDAR MODE -->
        <div v-else class="rounded-3xl overflow-hidden shadow-lg"
             :class="store.isDark
               ? 'bg-rp-surface border border-rp-border shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
               : 'bg-white'">
          <FullCalendar :options="calendarOptions" />
        </div>
      </div>
    </div>

    <!-- MODAL: ADD TRIP -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddTripModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          @click.self="showAddTripModal = false"
        >
          <div class="rounded-[36px] p-8 max-w-md w-full shadow-2xl transform transition-all"
               :class="store.isDark
                 ? 'bg-rp-surface border border-rp-border shadow-[0_24px_64px_rgba(0,0,0,0.7)]'
                 : 'bg-white'">
            <div class="flex items-center justify-between mb-8 pb-6"
                 :class="store.isDark ? 'border-b border-rp-border' : 'border-b-2 border-gray-100'">
              <div class="flex items-center space-x-3">
                <div class="p-3 rounded-xl bg-rp-accent">
                  <Plane :size="24" class="text-white" />
                </div>
                <h3 class="text-xl font-black uppercase tracking-tight"
                    :class="store.isDark ? 'text-rp-text' : ''"
                    style="font-family: 'Syne', sans-serif;">Nuevo Viaje</h3>
              </div>
              <button
                class="p-2.5 rounded-full transition-all duration-200 transform hover:scale-110"
                :class="store.isDark
                  ? 'bg-rp-surface-2 hover:bg-rp-surface text-rp-muted border border-rp-border'
                  : 'bg-gray-100 hover:bg-gray-200'"
                @click="showAddTripModal = false"
                title="Cerrar"
              >
                <X :size="18" />
              </button>
            </div>

            <form @submit.prevent="handleAddTrip" class="space-y-5">
              <div>
                <label class="block text-xs font-bold mb-2 uppercase tracking-wider"
                       :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
                  Título del viaje
                </label>
                <input
                  v-model="newTrip.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all duration-200"
                  :class="store.isDark
                    ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/50'
                    : 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-rumbo-orange shadow-sm focus:shadow-md'"
                  placeholder="Ej: Aventura en Tailandia"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider"
                         :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
                    Fecha inicio
                  </label>
                  <input
                    v-model="newTrip.startDate"
                    type="date"
                    required
                    class="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all duration-200"
                    :class="store.isDark
                      ? 'bg-rp-surface-2 border border-rp-border text-rp-text focus:border-rp-accent/50'
                      : 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-rumbo-orange shadow-sm'"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold mb-2 uppercase tracking-wider"
                         :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
                    Fecha fin
                  </label>
                  <input
                    v-model="newTrip.endDate"
                    type="date"
                    required
                    :min="newTrip.startDate"
                    class="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all duration-200"
                    :class="store.isDark
                      ? 'bg-rp-surface-2 border border-rp-border text-rp-text focus:border-rp-accent/50'
                      : 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-rumbo-orange shadow-sm'"
                  />
                </div>
              </div>

              <button
                type="submit"
                :disabled="creatingTrip"
                class="w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                :class="store.isDark
                  ? 'bg-rp-accent text-white shadow-orange-900/40 hover:bg-orange-500'
                  : 'bg-gradient-to-r from-rumbo-orange to-orange-600 text-white shadow-orange-200'"
              >
                {{ creatingTrip ? 'Creando...' : 'Crear Viaje' }}
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { Plus, Plane, Calendar, AlertCircle } from 'lucide-vue-next'
import type { PlanViaje } from '@/types'
import PlanDetail from './PlanDetail.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions } from '@fullcalendar/core'
const store = useAppStore()

// Fetch planes del usuario cada vez que se monta la vista
onMounted(() => {
  store.fetchPlanes()
})

const viewMode = ref<'cards' | 'calendar'>('cards')
const showAddTripModal = ref(false)
const creatingTrip = ref(false)
const selectedPlan = ref<PlanViaje | null>(null)
const planDetailLoading = ref(false)

async function openPlanDetail(id: number) {
  // Mostrar inmediatamente con los datos que ya tenemos y recargar en background
  selectedPlan.value = store.planes.find(p => p.id_plan === id) ?? null
  planDetailLoading.value = true
  try {
    const fresh = await store.loadPlan(id)
    selectedPlan.value = fresh
  } finally {
    planDetailLoading.value = false
  }
}

async function handleDeletePlan(id: number) {
  if (!confirm('¿Eliminar este plan de viaje?')) return
  await store.deletePlan(id)
  selectedPlan.value = null
}


const tripColors = new Map<string, string>()
const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#A29BFE',
  '#FF7675', '#00B894', '#FDCB6E', '#E84393', '#0984E3'
]

const newTrip = reactive({
  title: '',
  startDate: '',
  endDate: ''
})

function getTripColor(tripId: string): string {
  if (!tripColors.has(tripId)) {
    tripColors.set(tripId, colorPalette[tripColors.size % colorPalette.length])
  }
  return tripColors.get(tripId) || colorPalette[0]
}

const calendarEvents = computed(() => {
  return store.planes
    .filter(p => p.fecha_inicio && p.fecha_fin)
    .map((plan) => {
      const id = String(plan.id_plan)
      return {
        id,
        title: plan.nombre_plan || `Plan ${plan.id_plan}`,
        start: plan.fecha_inicio!,
        end: new Date(new Date(plan.fecha_fin!).getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        backgroundColor: getTripColor(id),
        borderColor: getTripColor(id),
        textColor: '#fff',
        extendedProps: { plan },
        display: 'block'
      }
    })
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  contentHeight: 'auto',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek'
  },
  events: calendarEvents.value,
  eventClick: handleEventClick,
  locale: 'es',
  eventDisplay: 'block',
  firstDay: 1,
  weekends: true,
  allDaySlot: false,
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana'
  },
  eventContent: handleEventContent,
  eventClassNames: handleEventClassNames,
  eventTimeFormat: {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short'
  },
  eventOrderStrict: true
} as CalendarOptions))

function handleEventClick(_info: any) {
  // Abrir detalle del plan al hacer click en el calendario (futuro)
}

function handleEventContent(info: any) {
  const event = info.event
  const startTime = event.start
    ? new Date(event.start).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    : ''
  const title = event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title
  return {
    html: `<div class="fc-event-text"><div class="fc-event-time">${startTime}</div><div class="fc-event-title">${title}</div></div>`
  }
}

function handleEventClassNames(_info: any) {
  return ['fc-event-professional']
}

async function handleAddTrip() {
  creatingTrip.value = true
  try {
    await store.createPlan({
      nombre_plan: newTrip.title,
      fecha_inicio: newTrip.startDate,
      fecha_fin: newTrip.endDate,
    })
    showAddTripModal.value = false
    newTrip.title = ''
    newTrip.startDate = ''
    newTrip.endDate = ''
  } catch {
    store.networkError = 'No se pudo crear el viaje. Inténtalo de nuevo.'
  } finally {
    creatingTrip.value = false
  }
}


function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getPlanDays(plan: { fecha_inicio: string | null; fecha_fin: string | null }): number {
  if (!plan.fecha_inicio || !plan.fecha_fin) return 0
  const start = new Date(plan.fecha_inicio)
  const end = new Date(plan.fecha_fin)
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1); }
.slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(40px) scale(0.98); }
.slide-up-leave-to { opacity: 0; transform: translateY(20px) scale(0.99); }

/* CSS vars */
.bg-rp-bg { background-color: var(--rp-bg); }
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.bg-rp-accent { background-color: var(--rp-accent); }
.border-rp-border { border-color: var(--rp-border); }
.border-rp-accent\/30 { border-color: rgba(249,115,22,0.3); }
.border-rp-accent\/40 { border-color: rgba(249,115,22,0.4); }
.border-rp-accent\/50 { border-color: rgba(249,115,22,0.5); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.text-rp-bg { color: var(--rp-bg); }
.hover\:border-rp-accent\/30:hover { border-color: rgba(249,115,22,0.3); }
.hover\:border-rp-accent\/40:hover { border-color: rgba(249,115,22,0.4); }
.hover\:text-rp-accent:hover { color: var(--rp-accent); }
.hover\:text-rp-text:hover { color: var(--rp-text); }
.hover\:bg-rp-surface:hover { background-color: var(--rp-surface); }
.focus\:border-rp-accent\/50:focus { border-color: rgba(249,115,22,0.5); }
.placeholder\:text-rp-muted::placeholder { color: var(--rp-muted); }
.shadow-orange-900\/30 { --tw-shadow-color: rgba(124,45,18,0.3); }
.shadow-orange-900\/40 { --tw-shadow-color: rgba(124,45,18,0.4); }
.shadow-orange-900\/60 { --tw-shadow-color: rgba(124,45,18,0.6); }

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.35s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.trip-card-enter-active {
  transition: all 0.3s ease;
}
.trip-card-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.trips-grid {
  display: grid;
  grid-auto-flow: row;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* FullCalendar dark theme */
:deep(.fc) {
  font-family: 'DM Sans', sans-serif;
  color: var(--rp-text, #1f2937);
  background: var(--rp-surface, #ffffff);
}

:deep(.fc-header-toolbar) {
  background: var(--rp-surface, #fff5f0);
  padding: 2rem 1.75rem;
  border-bottom: 2px solid var(--rp-accent, #ff6b35);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 0;
}

:deep(.fc-toolbar-title) {
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--rp-text, #1f2937);
  font-family: 'Syne', sans-serif;
  margin: 0;
}

:deep(.fc-button-primary) {
  background: var(--rp-accent, #ff6b35) !important;
  border: none !important;
  border-radius: 10px !important;
  color: white !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  font-size: 0.8rem !important;
  padding: 0.7rem 1.2rem !important;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
}

:deep(.fc-button-primary:hover) {
  background: #ea6010 !important;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4) !important;
  transform: translateY(-2px) !important;
}

:deep(.fc-button-primary.fc-button-active) {
  background: #ea6010 !important;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4) !important;
}

:deep(.fc-col-header-cell) {
  background: var(--rp-surface-2, #f9fafb) !important;
  border-color: var(--rp-border, #e5e7eb) !important;
  padding: 1rem 0.5rem !important;
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: capitalize;
  color: var(--rp-text, #374151);
}

:deep(.fc-col-header-cell.fc-day-today) {
  color: var(--rp-accent, #ff6b35) !important;
  font-weight: 900 !important;
}

:deep(.fc-daycell) {
  border-color: var(--rp-border, #e5e7eb) !important;
  background: var(--rp-surface, #ffffff) !important;
  min-height: 160px;
}

:deep(.fc-daycell:hover) {
  background: var(--rp-surface-2, #fafafa) !important;
}

:deep(.fc-daycell.fc-day-today) {
  background-color: rgba(249, 115, 22, 0.06) !important;
  border-color: rgba(249, 115, 22, 0.3) !important;
}

:deep(.fc-daycell-number) {
  padding: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--rp-text, #1f2937);
}

:deep(.fc-daycell-frame) {
  padding: 0.75rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.fc-event) {
  border: none !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0.4rem 0;
  padding: 0.6rem;
  font-weight: 700;
}

:deep(.fc-event::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: rgba(255, 255, 255, 0.4);
}

:deep(.fc-event:hover) {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25) !important;
  transform: translateY(-3px) scale(1.02) !important;
  z-index: 10;
}

:deep(.fc-event-main) {
  padding: 0.5rem 0.6rem;
}

:deep(.fc-event-title) {
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 1.3;
  color: #ffffff;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

:deep(.fc-event-time) {
  font-weight: 700;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
}

:deep(.fc-day-sat),
:deep(.fc-day-sun) {
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.02) 0%, rgba(249, 115, 22, 0.01) 100%);
}

:deep(.fc-day-sat .fc-daycell-number),
:deep(.fc-day-sun .fc-daycell-number) {
  color: var(--rp-accent, #f97316);
  font-weight: 900;
}

:deep(.fc-day-other) {
  opacity: 0.4;
}

:deep(.fc-day-other .fc-daycell-number) {
  color: var(--rp-muted, #d1d5db);
}

:deep(.fc-daygrid-day-events) {
  margin-top: 0.4rem;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 160px;
}

:deep(.fc-event-text) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  gap: 0.1rem;
}

:deep(.fc-event-professional) {
  border: none !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden !important;
}

:deep(.fc-event-professional:hover) {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25) !important;
  transform: translateY(-3px) scale(1.02) !important;
}

:deep(.fc-event),
:deep(.fc-button-primary),
:deep(.fc-col-header-cell) {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.fc-daycell) {
  transition: all 0.2s ease;
}

/* Responsive */
@media (max-width: 1200px) {
  :deep(.fc-header-toolbar) { padding: 1.5rem; gap: 1.2rem; }
  :deep(.fc-toolbar-title) { font-size: 1.75rem; }
  :deep(.fc-button-primary) { padding: 0.6rem 1rem !important; font-size: 0.75rem !important; }
  :deep(.fc-col-header-cell) { padding: 0.9rem 0.4rem !important; font-size: 0.85rem; }
  :deep(.fc-daycell) { min-height: 140px; }
}

@media (max-width: 1024px) {
  :deep(.fc-toolbar-title) { font-size: 1.5rem; }
  :deep(.fc-header-toolbar) { padding: 1.25rem; gap: 0.9rem; }
  :deep(.fc-daycell) { min-height: 120px; }
  :deep(.fc-event-title) { font-size: 0.8rem; }
}

@media (max-width: 768px) {
  :deep(.fc-toolbar-title) { font-size: 1.2rem; }
  :deep(.fc-header-toolbar) { padding: 1rem; gap: 0.7rem; flex-direction: column; }
  :deep(.fc-col-header-cell) { font-size: 0.75rem !important; padding: 0.6rem 0.2rem !important; }
  :deep(.fc-daycell) { min-height: 100px; }
  :deep(.fc-event-title) { font-size: 0.7rem; }
  :deep(.fc-button-primary) { padding: 0.5rem 0.8rem !important; font-size: 0.7rem !important; }
}

@media (max-width: 480px) {
  :deep(.fc-toolbar-title) { font-size: 1rem; }
  :deep(.fc-header-toolbar) { padding: 0.75rem; gap: 0.5rem; }
  :deep(.fc-col-header-cell) { font-size: 0.65rem !important; padding: 0.4rem 0.1rem !important; }
  :deep(.fc-daycell) { min-height: 85px; }
  :deep(.fc-event-title) { font-size: 0.6rem; }
  :deep(.fc-button-primary) { padding: 0.4rem 0.6rem !important; font-size: 0.6rem !important; }
}
</style>
