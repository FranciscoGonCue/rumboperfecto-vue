<template>
  <div class="p-5 lg:p-10 min-h-full">
    <div class="max-w-5xl mx-auto">
      <!-- Back button -->
      <div class="mb-6">
        <button
          class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
          :class="store.isDark
            ? 'bg-rp-surface-2 border border-rp-border text-rp-muted hover:text-red-400 hover:border-red-900/30'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          @click="handleClose"
        >
          <ArrowLeft :size="16" />
          <span>Volver</span>
        </button>
      </div>

      <div
        v-if="restaurant"
        class="rounded-3xl overflow-hidden transition-colors"
        :class="store.isDark
          ? 'bg-rp-surface border border-rp-border shadow-[0_24px_48px_rgba(0,0,0,0.5)]'
          : 'bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'"
      >
        <!-- Hero image with cuisine badge -->
        <div class="relative">
          <img
            :src="restaurant.image"
            :alt="restaurant.name"
            class="w-full h-64 lg:h-80 object-cover"
          />
          <div v-if="store.isDark" class="absolute inset-0 bg-gradient-to-t from-rp-surface/80 via-transparent to-transparent" />

          <!-- Cuisine type badge -->
          <div class="absolute top-4 left-4 flex items-center space-x-2">
            <span
              class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md"
              :style="store.isDark
                ? 'background: rgba(220,38,38,0.85); color: #fff; border: 1px solid rgba(255,255,255,0.15);'
                : 'background: rgba(255,255,255,0.95); color: #dc2626;'"
            >
              <Utensils :size="11" />
              <span>{{ restaurant.cuisine }}</span>
            </span>
          </div>

          <!-- Price range -->
          <div class="absolute top-4 right-4">
            <span
              class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-black backdrop-blur-md"
              :style="store.isDark
                ? 'background: rgba(17,17,24,0.85); color: #e8e8f0; border: 1px solid rgba(255,255,255,0.1);'
                : 'background: rgba(255,255,255,0.95); color: #111827;'"
            >
              {{ restaurant.priceRange }}
            </span>
          </div>
        </div>

        <div class="p-6 lg:p-9 space-y-6">
          <!-- Header -->
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                class="text-2xl lg:text-3xl font-black uppercase tracking-tight"
                :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                style="font-family: 'Syne', sans-serif;"
              >
                {{ restaurant.name }}
              </h2>
              <div class="flex items-center gap-2 mt-2">
                <MapPin :size="14" class="text-red-500 flex-shrink-0" />
                <p class="font-medium text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  {{ restaurant.address }}, {{ restaurant.city }}
                </p>
              </div>
              <!-- Rating stars -->
              <div class="flex items-center gap-2 mt-2">
                <div class="flex">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :size="14"
                    :class="i <= Math.floor(restaurant.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'"
                  />
                </div>
                <span class="text-sm font-bold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                  {{ restaurant.rating }} ({{ restaurant.reviewsCount }} reseñas)
                </span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase tracking-widest font-bold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                Precio medio por persona
              </p>
              <p class="text-3xl font-black text-red-500">{{ restaurant.currency }} {{ restaurant.avgPricePerPerson }}</p>
              <p class="text-xs mt-1 font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ restaurant.openNow ? '🟢 Abierto ahora' : '🔴 Cerrado' }}
              </p>
            </div>
          </div>

          <ServiceReviewsPanel v-if="restaurant" :servicio-id="String(restaurant.id)" class="mt-2" />

          <!-- Description -->
          <p class="leading-relaxed text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
            {{ restaurant.description }}
          </p>

          <!-- Specialties -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Especialidades de la casa
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="dish in restaurant.specialties"
                :key="dish"
                class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="store.isDark
                  ? 'bg-red-950/40 text-red-400 border border-red-900/40'
                  : 'bg-red-50 text-red-600'"
              >
                🍽 {{ dish }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Ambiente
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in restaurant.tags"
                :key="tag"
                class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="store.isDark
                  ? 'bg-rp-surface-2 text-rp-muted border border-rp-border'
                  : 'bg-gray-100 text-gray-700'"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Horarios -->
          <div
            class="rounded-2xl p-5 space-y-3 transition-colors"
            :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-gray-50 border border-gray-100'"
          >
            <h3 class="text-xs font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Horarios
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(schedule, day) in restaurant.schedule"
                :key="day"
                class="flex justify-between text-xs font-semibold"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'"
              >
                <span class="uppercase font-bold" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ day }}</span>
                <span>{{ schedule }}</span>
              </div>
            </div>
          </div>

          <!-- Reserva -->
          <div
            class="rounded-2xl p-5 space-y-5 transition-colors"
            :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-gray-50 border border-gray-100'"
          >
            <h3 class="text-xs font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Reservar mesa
            </h3>

            <!-- Calendario de selección de fecha -->
            <div
              class="rounded-2xl p-3 overflow-hidden rp-calendar-shell"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
            >
              <FullCalendar :key="calendarKey" :options="calendarOptions" />
            </div>

            <!-- Leyenda días cerrados -->
            <div v-if="hasSchedule" class="flex flex-wrap items-center gap-3 text-xs font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-rp-accent" /> Seleccionado</span>
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:#ef4444" /> Cerrado</span>
            </div>

            <!-- Fecha seleccionada + Hora -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Fecha seleccionada
                </p>
                <p class="font-bold text-sm" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
                  {{ reservationDate ? formatDate(reservationDate) : 'Selecciona una fecha' }}
                </p>
              </div>
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Hora
                </p>
                <select
                  v-model="reservationTime"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                >
                  <option value="">Selecciona hora</option>
                  <option v-for="t in availableTimesForDate" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <!-- Comensales -->
            <div
              class="rounded-xl p-3 transition-colors"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
            >
              <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Número de personas
              </p>
              <div class="flex items-center gap-4">
                <button
                  class="w-8 h-8 rounded-full font-black text-lg flex items-center justify-center transition-all"
                  :class="store.isDark ? 'bg-rp-surface-2 text-rp-text hover:bg-red-950/40 hover:text-red-400' : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'"
                  @click="diners = Math.max(1, diners - 1)"
                >−</button>
                <span class="text-xl font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ diners }}</span>
                <button
                  class="w-8 h-8 rounded-full font-black text-lg flex items-center justify-center transition-all"
                  :class="store.isDark ? 'bg-rp-surface-2 text-rp-text hover:bg-red-950/40 hover:text-red-400' : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'"
                  @click="diners = Math.min(20, diners + 1)"
                >+</button>
                <span class="text-sm font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  {{ diners === 1 ? 'persona' : 'personas' }}
                </span>
              </div>
            </div>

            <!-- Precio estimado -->
            <div
              v-if="reservationDate && reservationTime"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors"
              :class="store.isDark ? 'bg-red-950/20 border border-red-900/30' : 'bg-white border border-red-100'"
            >
              <p class="text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                {{ diners }} persona{{ diners !== 1 ? 's' : '' }} × {{ restaurant.currency }} {{ restaurant.avgPricePerPerson }} estimado
              </p>
              <p class="text-2xl font-black text-red-500">
                Total aprox: {{ restaurant.currency }} {{ estimatedTotal }}
              </p>
            </div>

            <!-- Error -->
            <div v-if="bookingError" class="text-sm text-red-400 font-semibold">{{ bookingError }}</div>

            <!-- CTA -->
            <div class="flex flex-col gap-3">
              <button
                class="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                :class="store.isDark
                  ? 'bg-red-600 text-white shadow-[0_8px_24px_rgba(220,38,38,0.3)] hover:bg-red-500 hover:shadow-[0_12px_32px_rgba(220,38,38,0.4)]'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_14px_30px_rgba(220,38,38,0.3)] hover:from-red-600 hover:to-rose-700'"
                :disabled="!canBook"
                @click="handleBook"
              >
                <span v-if="bookingLoading">Reservando…</span>
                <span v-else-if="!booked">Reservar mesa</span>
                <span v-else>✓ Reserva confirmada</span>
              </button>

              <button
                type="button"
                class="w-full py-5 px-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1.5"
                :class="store.isDark
                  ? 'bg-rp-accent text-white shadow-[0_10px_32px_rgba(249,115,22,0.35)] hover:bg-orange-500 hover:shadow-[0_14px_40px_rgba(249,115,22,0.45)] ring-2 ring-orange-400/30'
                  : 'bg-gradient-to-r from-rp-accent to-orange-600 text-white shadow-[0_16px_36px_rgba(249,115,22,0.35)] hover:from-orange-600 hover:to-orange-700 ring-2 ring-orange-400/40'"
                :disabled="!reservationDate"
                :aria-expanded="planPickerOpen"
                @click="togglePlanPicker"
              >
                <span class="inline-flex items-center gap-3 text-base sm:text-lg">
                  <BookmarkPlus :size="26" class="flex-shrink-0" />
                  <span>Añadir al plan</span>
                </span>
                <span
                  class="text-[11px] sm:text-xs font-semibold normal-case tracking-wide opacity-90 text-center px-2"
                  :class="store.isDark ? 'text-white/90' : 'text-white/95'"
                >
                  Elige en qué viaje guardar esta reserva
                </span>
              </button>

              <!-- Selector de planes (dentro del bloque Reservas) -->
              <div
                v-if="planPickerOpen"
                class="rounded-2xl p-5 space-y-4 border transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface border-rp-border'
                  : 'bg-white border-orange-100 shadow-sm'"
              >
                <div>
                  <p
                    class="text-xs font-black uppercase tracking-widest mb-1"
                    :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'"
                  >
                    Tus planes
                  </p>
                  <p class="text-sm font-bold" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
                    Selecciona el plan donde quieres añadir esta reserva
                  </p>
                </div>

                <div
                  v-if="store.trips.length === 0"
                  class="rounded-xl p-4 text-sm transition-colors"
                  :class="store.isDark
                    ? 'bg-rp-surface-2 border border-rp-border text-rp-muted'
                    : 'border border-gray-200 bg-gray-50 text-gray-600'"
                >
                  No tienes planes creados todavía. Crea uno primero desde Mis viajes / Planificador.
                </div>

                <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <button
                    v-for="trip in store.trips"
                    :key="trip.id"
                    type="button"
                    class="w-full text-left p-4 rounded-xl border-2 transition-all"
                    :class="selectedPlanId === trip.id
                      ? store.isDark
                        ? 'border-rp-accent bg-orange-950/25 ring-1 ring-orange-500/30'
                        : 'border-rp-accent bg-orange-50 ring-1 ring-orange-200'
                      : store.isDark
                        ? 'border-rp-border hover:border-rp-accent/50 bg-rp-surface-2'
                        : 'border-gray-200 hover:border-orange-200 bg-gray-50/80'"
                    @click="selectedPlanId = trip.id"
                  >
                    <p
                      class="font-bold uppercase text-sm tracking-wide"
                      :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                    >
                      {{ trip.title }}
                    </p>
                    <p class="text-xs mt-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                      {{ trip.startDate }} — {{ trip.endDate }}
                    </p>
                  </button>
                </div>

                <p v-if="planModalError" class="text-sm text-red-400 font-semibold">{{ planModalError }}</p>

                <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-3 rounded-xl border font-bold text-sm transition-colors"
                    :class="store.isDark ? 'border-rp-border text-rp-muted hover:bg-rp-surface-2' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                    @click="closePlanPicker"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-60 transition-colors"
                    :class="store.isDark ? 'bg-rp-accent text-white hover:bg-orange-500' : 'bg-gradient-to-r from-rp-accent to-orange-600 text-white'"
                    :disabled="store.trips.length === 0 || !selectedPlanId"
                    @click="confirmAddToPlan"
                  >
                    Añadir a este plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, MapPin, Star, Utensils, BookmarkPlus } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { restaurantsMock, type RestaurantMock } from '@/mocks/restaurants'
import {
  reservasApi,
  shiftsLibresParaFecha,
  turnosEquivalentes,
  diaSinTurnosLibres,
} from '@/services/api'
import type { Activity } from '@/types'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ServiceReviewsPanel from '@/components/ServiceReviewsPanel.vue'

const store = useAppStore()
const emit = defineEmits(['close'])

const props = defineProps<{ restaurant?: RestaurantMock }>()

const restaurant = computed(() => props.restaurant ?? restaurantsMock[0])

const today = new Date().toISOString().split('T')[0]
const reservationDate = ref('')
const reservationTime = ref('')
const diners = ref(2)
const bookingError = ref('')
const booked = ref(false)

/** Horas por defecto si el servicio no define turnos_disponibles */
const DEFAULT_RESTAURANT_TIMES = [
  '13:00', '13:30', '14:00', '14:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
]

const baseTimeSlots = computed(() => {
  const r = restaurant.value
  const custom = (r?.availableShifts ?? []).filter(Boolean)
  return custom.length ? custom : DEFAULT_RESTAURANT_TIMES
})

const occupiedRestByDate = computed(() => restaurant.value?.occupiedShiftsByDate ?? {})

const availableTimesForDate = computed(() =>
  shiftsLibresParaFecha(baseTimeSlots.value, reservationDate.value, occupiedRestByDate.value),
)

watch(reservationDate, () => {
  const opts = availableTimesForDate.value
  if (reservationTime.value && !opts.some((t) => turnosEquivalentes(t, reservationTime.value)))
    reservationTime.value = ''
})
const DAY_NAME_MAP: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3, miercoles: 3,
  jueves: 4, viernes: 5, sábado: 6, sabado: 6,
}

const closedDayNumbers = computed(() => {
  const sched = restaurant.value?.schedule ?? {}
  if (!Object.keys(sched).length) return new Set<number>()
  const openDays = new Set(
    Object.keys(sched).map(k => DAY_NAME_MAP[k.toLowerCase()]).filter(n => n !== undefined)
  )
  return new Set([0, 1, 2, 3, 4, 5, 6].filter(d => !openDays.has(d)))
})

const hasSchedule = computed(() => Object.keys(restaurant.value?.schedule ?? {}).length > 0)

function isDateClosed(dateStr: string) {
  if (!hasSchedule.value) return false
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  return closedDayNumbers.value.has(dow)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isDateBlockedByAvailability(dateStr: string): boolean {
  const rest = restaurant.value
  if (!rest) return true
  const from = rest.availableFrom
  const to = rest.availableTo
  if (from && dateStr < from) return true
  if (to && dateStr > to) return true
  if (rest.unavailableDates?.includes(dateStr)) return true
  const custom = (rest.availableShifts ?? []).filter(Boolean)
  const base = custom.length ? custom : DEFAULT_RESTAURANT_TIMES
  const occ = rest.occupiedShiftsByDate ?? {}
  if (base.length > 0 && diaSinTurnosLibres(base, dateStr, occ)) return true
  return false
}

function handleDateClick(info: { dateStr: string }) {
  if (info.dateStr < today || isDateClosed(info.dateStr) || isDateBlockedByAvailability(info.dateStr)) return
  reservationDate.value = info.dateStr
}

function dayCellClassNames(arg: { date: Date }) {
  const dateKey = getDateKey(arg.date)
  if (dateKey < today || isDateClosed(dateKey) || isDateBlockedByAvailability(dateKey)) return ['rp-day-unavailable']
  const classes = ['rp-day-available']
  if (reservationDate.value === dateKey) classes.push('rp-day-selected-start', 'rp-day-selected-end')
  return classes
}

const calendarKey = computed(() => {
  const blocked = restaurant.value?.unavailableDates?.join(',') ?? ''
  const occ = JSON.stringify(restaurant.value?.occupiedShiftsByDate ?? {})
  return `rest-${restaurant.value?.id ?? 'none'}-${reservationDate.value}-${blocked}-${occ}`
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'es',
  height: 'auto',
  fixedWeekCount: false,
  selectable: false,
  headerToolbar: { left: 'prev,next', center: 'title', right: '' },
  events: [],
  dateClick: handleDateClick,
  dayCellClassNames,
}))

const estimatedTotal = computed(() =>
  (diners.value * (restaurant.value?.avgPricePerPerson ?? 0)).toLocaleString()
)

const bookingLoading = ref(false)

const canBook = computed(() =>
  !booked.value && !bookingLoading.value && reservationDate.value !== '' && reservationTime.value !== ''
)

async function handleBook() {
  if (!canBook.value) {
    bookingError.value = 'Selecciona fecha y hora para reservar.'
    return
  }
  bookingError.value = ''
  bookingLoading.value = true
  try {
    await reservasApi.crear({
      servicio:     restaurant.value.id,
      fecha_inicio: reservationDate.value,
      turno:        reservationTime.value,
      personas:     diners.value,
      precio_total: diners.value * (restaurant.value?.avgPricePerPerson ?? 0),
    })
    booked.value = true
    const rest = restaurant.value
    const d = reservationDate.value
    const t = reservationTime.value
    if (!rest.occupiedShiftsByDate) rest.occupiedShiftsByDate = {}
    const occ = rest.occupiedShiftsByDate
    if (!occ[d]) occ[d] = []
    if (!occ[d].some((o) => turnosEquivalentes(o, t))) occ[d].push(t)
    const custom = (rest.availableShifts ?? []).filter(Boolean)
    const baseSlots = custom.length ? custom : DEFAULT_RESTAURANT_TIMES
    const rem = shiftsLibresParaFecha(baseSlots, d, occ)
    if (rem.length === 0 && !rest.unavailableDates.includes(d)) rest.unavailableDates.push(d)
  } catch {
    bookingError.value = 'Error al crear la reserva. Inténtalo de nuevo.'
  } finally {
    bookingLoading.value = false
  }
}

function handleClose() {
  emit('close')
  store.setCurrentView('plan')
}

const planPickerOpen = ref(false)
const selectedPlanId = ref('')
const planModalError = ref('')

function togglePlanPicker() {
  if (!reservationDate.value) return
  planModalError.value = ''
  if (!planPickerOpen.value) {
    selectedPlanId.value = store.trips[0]?.id ?? ''
  }
  planPickerOpen.value = !planPickerOpen.value
}

function closePlanPicker() {
  planPickerOpen.value = false
  planModalError.value = ''
}

function confirmAddToPlan() {
  planModalError.value = ''
  if (!selectedPlanId.value) {
    planModalError.value = 'Selecciona un plan.'
    return
  }
  const trip = store.trips.find(t => t.id === selectedPlanId.value)
  if (!trip) {
    planModalError.value = 'No se encontró el plan seleccionado.'
    return
  }
  const start = new Date(trip.startDate)
  const resDate = new Date(reservationDate.value)
  const dayIndex = Math.floor((resDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalDays = Math.ceil((new Date(trip.endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  if (dayIndex < 1 || dayIndex > totalDays) {
    planModalError.value = 'La fecha de reserva no cae dentro de ese plan.'
    return
  }
  const planActivity: Activity = {
    id: Date.now().toString(),
    time: reservationTime.value || '20:00',
    title: `Cena: ${restaurant.value?.name ?? 'Restaurante'}`,
    location: restaurant.value?.address ?? restaurant.value?.city ?? '',
  }
  store.addActivity(trip.id, dayIndex, planActivity)
  planPickerOpen.value = false
  store.setCurrentView('plan')
}
</script>

<style scoped>
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.border-rp-border { border-color: var(--rp-border); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.bg-rp-accent { background-color: var(--rp-accent); }
.from-rp-accent { --tw-gradient-from: var(--rp-accent); }
.from-rp-surface\/80 { --tw-gradient-from: rgba(17,17,24,0.8); }
.to-transparent { --tw-gradient-to: transparent; }
.border-rp-accent { border-color: var(--rp-accent); }
.border-rp-accent\/40 { border-color: rgba(249,115,22,0.4); }
.hover\:border-rp-accent\/40:hover { border-color: rgba(249,115,22,0.4); }
:deep(.rp-calendar-shell .fc) {
  --rp-orange: #f97316; --rp-orange-soft: rgba(249,115,22,0.15); --rp-orange-divider: rgba(249,115,22,0.3);
  font-family: 'DM Sans', sans-serif;
}
:deep(.rp-calendar-shell .fc-header-toolbar) { margin-bottom: 0.75rem; padding: 0.25rem 0.25rem 0.5rem; }
:deep(.rp-calendar-shell .fc-toolbar-title) { font-size: 1rem; font-weight: 800; text-transform: capitalize; color: var(--rp-text, #374151); }
:deep(.rp-calendar-shell .fc-button) {
  background: var(--rp-surface-2, #fff) !important; border: 1px solid var(--rp-border, #e5e7eb) !important;
  color: var(--rp-muted, #6b7280) !important; border-radius: 10px !important; box-shadow: none !important; padding: 0.2rem 0.5rem !important;
}
:deep(.rp-calendar-shell .fc-col-header-cell) { border: 0; background: transparent; padding-bottom: 0.35rem; }
:deep(.rp-calendar-shell .fc-col-header-cell-cushion) { font-size: 0.75rem; color: var(--rp-muted, #9ca3af); font-weight: 700; text-transform: capitalize; }
:deep(.rp-calendar-shell .fc-daygrid-day),
:deep(.rp-calendar-shell .fc-scrollgrid),
:deep(.rp-calendar-shell .fc-scrollgrid td),
:deep(.rp-calendar-shell .fc-scrollgrid th) { border: 0 !important; }
:deep(.rp-calendar-shell .fc-day-today) { background: transparent !important; }
:deep(.rp-calendar-shell .fc-daygrid-day-frame) { min-height: 42px; display: flex; align-items: center; justify-content: center; }
:deep(.rp-calendar-shell .fc-daygrid-day-number) {
  width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; font-size: 0.9rem; font-weight: 600; color: var(--rp-text, #4b5563); cursor: pointer; transition: background 0.15s;
}
:deep(.rp-calendar-shell .fc-day-other .fc-daygrid-day-number) { color: var(--rp-muted, #d1d5db); opacity: 0.4; }
:deep(.rp-calendar-shell .rp-day-available .fc-daygrid-day-number) { color: var(--rp-text, #374151); }
:deep(.rp-calendar-shell .rp-day-available .fc-daygrid-day-number:hover) { background: var(--rp-orange-soft); color: var(--rp-orange); }
:deep(.rp-calendar-shell .rp-day-unavailable .fc-daygrid-day-number) { color: var(--rp-muted, #d1d5db); text-decoration: line-through; cursor: not-allowed; opacity: 0.35; }
:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-number),
:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-number) {
  background: var(--rp-orange) !important; color: #fff !important; font-weight: 700; border-radius: 50%;
}
</style>
