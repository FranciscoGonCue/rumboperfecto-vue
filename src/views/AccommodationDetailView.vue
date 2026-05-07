<template>
  <div class="p-5 lg:p-10 min-h-full">
    <div class="max-w-5xl mx-auto">
      <!-- Back button -->
      <div class="mb-6">
        <button
          class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
          :class="store.isDark
            ? 'bg-rp-surface-2 border border-rp-border text-rp-muted hover:text-rp-accent hover:border-rp-accent/30'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          @click="store.closeAccommodationDetail()"
        >
          <ArrowLeft :size="16" />
          <span>Volver</span>
        </button>
      </div>

      <div
        v-if="selectedAccommodation"
        class="rounded-3xl overflow-hidden transition-colors"
        :class="store.isDark
          ? 'bg-rp-surface border border-rp-border shadow-[0_24px_48px_rgba(0,0,0,0.5)]'
          : 'bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'"
      >
        <!-- Hero image -->
        <div class="relative">
          <img
            :src="selectedAccommodation.image"
            :alt="selectedAccommodation.title"
            class="w-full h-64 lg:h-80 object-cover"
          />
          <div v-if="store.isDark" class="absolute inset-0 bg-gradient-to-t from-rp-surface/80 via-transparent to-transparent" />
        </div>

        <div class="p-6 lg:p-9 space-y-6">
          <!-- Header: title + price -->
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-2xl lg:text-3xl font-black uppercase tracking-tight"
                  :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                  style="font-family: 'Syne', sans-serif;">
                {{ selectedAccommodation.title }}
              </h2>
              <p class="font-medium mt-2 text-sm"
                 :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ selectedAccommodation.location }}, {{ selectedAccommodation.city }}, {{ selectedAccommodation.country }}
              </p>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase tracking-widest font-bold"
                 :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Precio por noche</p>
              <p class="text-3xl font-black text-rp-accent">
                {{ selectedAccommodation.currency }} {{ selectedAccommodation.pricePerNight }}
              </p>
              <p class="text-sm mt-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                ⭐ {{ selectedAccommodation.rating }} ({{ selectedAccommodation.reviewsCount }} reseñas)
              </p>
              <button
                class="mt-3 inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-black uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
                :class="store.isDark
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)]'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_14px_28px_rgba(16,185,129,0.45)]'"
              >
                Comprar
              </button>
            </div>
          </div>

          <!-- Description -->
          <p class="leading-relaxed text-sm"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
            {{ selectedAccommodation.description }}
          </p>

          <!-- Amenities -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Comodidades</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="amenity in selectedAccommodation.amenities"
                :key="amenity"
                class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="store.isDark
                  ? 'bg-orange-950/40 text-rp-accent border border-orange-900/40'
                  : 'bg-orange-50 text-rumbo-orange'"
              >
                {{ amenity }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Etiquetas</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedAccommodation.tags"
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

          <!-- Availability + calendar -->
          <div class="rounded-2xl p-5 space-y-4 transition-colors"
               :class="store.isDark
                 ? 'bg-rp-surface-2 border border-rp-border'
                 : 'bg-gray-50 border border-gray-100'">
            <h3 class="text-xs font-black uppercase tracking-widest"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Disponibilidad y precio</h3>

            <p class="text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
              Disponible del {{ formatDate(selectedAccommodation.availableFrom) }} al {{ formatDate(selectedAccommodation.availableTo) }}
            </p>

            <div class="rounded-2xl p-3 overflow-hidden rp-calendar-shell"
                 :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'">
              <FullCalendar :key="calendarKey" :options="calendarOptions" />
            </div>

            <!-- Check-in / Check-out -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="rounded-xl p-3 transition-colors"
                   :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'">
                <p class="text-xs font-bold uppercase tracking-wider mb-1"
                   :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-in</p>
                <p class="font-bold" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
                  {{ checkInDate ? formatDate(checkInDate) : 'Selecciona una fecha' }}
                </p>
              </div>
              <div class="rounded-xl p-3 transition-colors"
                   :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'">
                <p class="text-xs font-bold uppercase tracking-wider mb-1"
                   :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-out</p>
                <p class="font-bold" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
                  {{ checkOutDate ? formatDate(checkOutDate) : 'Selecciona una fecha' }}
                </p>
              </div>
            </div>

            <!-- Hint + clear -->
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ selectionHint }}
              </p>
              <button
                class="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface border border-rp-border text-rp-muted hover:border-rp-accent/30 hover:text-rp-accent'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-rumbo-orange'"
                @click="resetSelection"
              >
                Limpiar
              </button>
            </div>

            <!-- Legend -->
            <div class="flex flex-wrap items-center gap-3 text-xs font-semibold"
                 :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-orange-400" /> Seleccionado</span>
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500" /> No disponible</span>
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500" /> Disponible</span>
            </div>

            <!-- Error -->
            <div v-if="bookingError" class="text-sm text-red-400 font-semibold">
              {{ bookingError }}
            </div>

            <!-- Price total -->
            <div
              v-else-if="canCalculatePrice"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors"
              :class="store.isDark
                ? 'bg-orange-950/20 border border-orange-900/30'
                : 'bg-white border border-orange-100'"
            >
              <p class="text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                {{ nightsCount }} noche<span v-if="nightsCount !== 1">s</span> x {{ selectedAccommodation.currency }} {{ selectedAccommodation.pricePerNight }}
              </p>
              <p class="text-2xl font-black text-rp-accent">
                Total: {{ selectedAccommodation.currency }} {{ totalPrice }}
              </p>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 mt-2">
              <!-- Reservar -->
              <button
                class="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                :class="store.isDark
                  ? 'bg-emerald-600 text-white shadow-[0_8px_24px_rgba(5,150,105,0.3)] hover:bg-emerald-500'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_14px_30px_rgba(5,150,105,0.3)]'"
                :disabled="!canCalculatePrice || bookingLoading || booked"
                @click="handleBook"
              >
                <span v-if="bookingLoading">Reservando…</span>
                <span v-else-if="booked">✓ ¡Reservado!</span>
                <span v-else>Reservar</span>
              </button>
              <!-- Añadir a plan -->
              <button
                class="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                :class="store.isDark
                  ? 'bg-rp-accent text-white shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:bg-orange-500 hover:shadow-[0_12px_32px_rgba(249,115,22,0.4)]'
                  : 'bg-gradient-to-r from-rumbo-orange to-orange-600 text-white shadow-[0_14px_30px_rgba(249,115,22,0.35)] hover:from-orange-600 hover:to-orange-700'"
                :disabled="!canCalculatePrice"
                @click="openAddToPlanModal"
              >
                Añadir a plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div
        v-else
        class="rounded-3xl p-10 text-center transition-colors"
        :class="store.isDark
          ? 'bg-rp-surface border border-rp-border shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
          : 'bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'"
      >
        <h2 class="text-2xl font-black mb-3" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
          Alojamiento no encontrado
        </h2>
        <p class="mb-6 text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
          No se pudo cargar el detalle del alojamiento seleccionado.
        </p>
        <button
          class="px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors"
          :class="store.isDark
            ? 'bg-rp-accent text-white hover:bg-orange-500'
            : 'bg-rumbo-orange text-white hover:bg-orange-600'"
          @click="store.closeAccommodationDetail()"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  </div>

  <!-- Plan selector modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showPlanSelectorModal"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="showPlanSelectorModal = false"
      >
        <div class="rounded-[28px] p-6 max-w-lg w-full shadow-2xl transition-colors"
             :class="store.isDark
               ? 'bg-rp-surface border border-rp-border shadow-[0_24px_64px_rgba(0,0,0,0.7)]'
               : 'bg-white border border-orange-100'">
          <h3 class="text-xl font-black uppercase tracking-tight mb-2"
              :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
              style="font-family: 'Syne', sans-serif;">Selecciona un plan</h3>
          <p class="text-sm mb-5" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
            Elige el viaje donde quieres añadir este alojamiento.
          </p>

          <div v-if="store.trips.length === 0"
               class="rounded-xl p-4 text-sm transition-colors"
               :class="store.isDark
                 ? 'bg-rp-surface-2 border border-rp-border text-rp-muted'
                 : 'border border-gray-200 bg-gray-50 text-gray-600'">
            No tienes planes creados todavía. Crea uno primero desde la vista Plan.
          </div>

          <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
            <button
              v-for="trip in store.trips"
              :key="trip.id"
              class="w-full text-left p-4 rounded-xl border-2 transition-all"
              :class="selectedPlanId === trip.id
                ? store.isDark
                  ? 'border-rp-accent bg-orange-950/20'
                  : 'border-rumbo-orange bg-orange-50'
                : store.isDark
                  ? 'border-rp-border hover:border-rp-accent/40 bg-rp-surface-2'
                  : 'border-gray-200 hover:border-orange-200'"
              @click="selectedPlanId = trip.id"
            >
              <p class="font-bold uppercase text-sm tracking-wide"
                 :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ trip.title }}</p>
              <p class="text-xs mt-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}
              </p>
            </button>
          </div>

          <p v-if="planModalError" class="text-sm text-red-400 font-semibold mt-4">{{ planModalError }}</p>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 rounded-lg border font-bold text-sm transition-colors"
              :class="store.isDark
                ? 'border-rp-border text-rp-muted hover:bg-rp-surface-2'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              @click="showPlanSelectorModal = false"
            >
              Cancelar
            </button>
            <button
              class="px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider disabled:opacity-60 transition-colors"
              :class="store.isDark
                ? 'bg-rp-accent text-white hover:bg-orange-500'
                : 'bg-gradient-to-r from-rumbo-orange to-orange-600 text-white'"
              :disabled="store.trips.length === 0"
              @click="confirmAddToPlan"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { accommodationsMock } from '@/mocks/accommodations'
import { reservasApi } from '@/services/api'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Activity, Accommodation } from '@/types'

const props = defineProps<{ accommodation?: Accommodation }>()

const store = useAppStore()

const selectedAccommodation = computed(() =>
  props.accommodation
  ?? accommodationsMock.find(item => item.id === store.selectedAccommodationId)
  ?? null
)

const checkInDate = ref('')
const checkOutDate = ref('')
const selectionError = ref('')
const showPlanSelectorModal = ref(false)
const selectedPlanId = ref('')
const planModalError = ref('')

const nightsCount = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0
  const start = new Date(checkInDate.value)
  const end = new Date(checkOutDate.value)
  const diff = end.getTime() - start.getTime()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const hasBlockedDateInRange = computed(() => {
  if (!selectedAccommodation.value || !checkInDate.value || !checkOutDate.value) return false
  const blocked = new Set(selectedAccommodation.value.unavailableDates)
  const current = new Date(checkInDate.value)
  const end = new Date(checkOutDate.value)
  while (current < end) {
    const dayKey = current.toISOString().split('T')[0]
    if (blocked.has(dayKey)) return true
    current.setDate(current.getDate() + 1)
  }
  return false
})

const bookingError = computed(() => {
  if (selectionError.value) return selectionError.value
  if (!selectedAccommodation.value || !checkInDate.value || !checkOutDate.value) return ''
  if (checkOutDate.value <= checkInDate.value) return 'La fecha de salida debe ser posterior a la de entrada.'
  if (hasBlockedDateInRange.value) return 'Hay fechas no disponibles dentro del rango seleccionado.'
  return ''
})

const canCalculatePrice = computed(() =>
  Boolean(selectedAccommodation.value && checkInDate.value && checkOutDate.value && !bookingError.value && nightsCount.value > 0)
)

const totalPrice = computed(() => {
  if (!selectedAccommodation.value || !canCalculatePrice.value) return 0
  return selectedAccommodation.value.pricePerNight * nightsCount.value
})

const calendarKey = computed(() => {
  const selectedId = selectedAccommodation.value?.id ?? 'none'
  const blocked = selectedAccommodation.value?.unavailableDates.join(',') ?? ''
  return `${selectedId}-${checkInDate.value}-${checkOutDate.value}-${blocked}`
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isDateUnavailable(dateStr: string) {
  if (!selectedAccommodation.value) return true
  if (dateStr < selectedAccommodation.value.availableFrom || dateStr > selectedAccommodation.value.availableTo) return true
  return selectedAccommodation.value.unavailableDates.includes(dateStr)
}

function handleDateClick(info: { dateStr: string }) {
  const clicked = info.dateStr
  selectionError.value = ''
  if (isDateUnavailable(clicked)) {
    selectionError.value = 'Ese dia no esta disponible. Elige otra fecha.'
    return
  }
  if (!checkInDate.value || (checkInDate.value && checkOutDate.value)) {
    checkInDate.value = clicked
    checkOutDate.value = ''
    return
  }
  if (clicked <= checkInDate.value) {
    checkInDate.value = clicked
    checkOutDate.value = ''
    return
  }
  const blocked = selectedAccommodation.value?.unavailableDates ?? []
  let current = new Date(checkInDate.value)
  const end = new Date(clicked)
  while (current < end) {
    const dayKey = current.toISOString().split('T')[0]
    if (blocked.includes(dayKey)) {
      selectionError.value = 'El rango incluye noches no disponibles. Selecciona otro check-out.'
      checkOutDate.value = ''
      return
    }
    current.setDate(current.getDate() + 1)
  }
  checkOutDate.value = clicked
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayCellClassNames(arg: { date: Date }) {
  const dateKey = getDateKey(arg.date)
  const classes: string[] = []
  if (!selectedAccommodation.value) return classes
  if (isDateUnavailable(dateKey)) {
    classes.push('rp-day-unavailable')
    return classes
  }
  classes.push('rp-day-available')
  if (checkInDate.value && dateKey === checkInDate.value) classes.push('rp-day-selected-start')
  if (checkOutDate.value && dateKey === checkOutDate.value) classes.push('rp-day-selected-end')
  if (checkInDate.value && checkOutDate.value && dateKey > checkInDate.value && dateKey < checkOutDate.value) {
    classes.push('rp-day-selected-middle')
  }
  return classes
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'es',
  height: 'auto',
  fixedWeekCount: false,
  selectable: false,
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: ''
  },
  events: [],
  dateClick: handleDateClick,
  dayCellClassNames
}))

const selectionHint = computed(() => {
  if (bookingError.value) return bookingError.value
  if (!checkInDate.value) return 'Selecciona tu fecha de entrada.'
  if (!checkOutDate.value) return 'Ahora selecciona tu fecha de salida.'
  return 'Fechas seleccionadas correctamente.'
})

function resetSelection() {
  checkInDate.value = ''
  checkOutDate.value = ''
  selectionError.value = ''
}

const booked = ref(false)
const bookingLoading = ref(false)

async function handleBook() {
  if (!canCalculatePrice.value || !selectedAccommodation.value) return
  bookingLoading.value = true
  try {
    await reservasApi.crear({
      servicio:     selectedAccommodation.value.id,
      fecha_inicio: checkInDate.value,
      fecha_fin:    checkOutDate.value,
      personas:     1,
      precio_total: nightsCount.value * (selectedAccommodation.value?.pricePerNight ?? 0),
    })
    booked.value = true
    // Bloquear fechas localmente para que el calendario se actualice
    const acc = selectedAccommodation.value
    const cursor = new Date(checkInDate.value)
    const end    = new Date(checkOutDate.value)
    while (cursor <= end) {
      const iso = cursor.toISOString().split('T')[0]
      if (!acc.unavailableDates.includes(iso)) acc.unavailableDates.push(iso)
      cursor.setDate(cursor.getDate() + 1)
    }
  } catch {
    selectionError.value = 'Error al crear la reserva. Inténtalo de nuevo.'
  } finally {
    bookingLoading.value = false
  }
}

function openAddToPlanModal() {
  if (!canCalculatePrice.value) return
  planModalError.value = ''
  selectedPlanId.value = store.trips[0]?.id ?? ''
  showPlanSelectorModal.value = true
}

function confirmAddToPlan() {
  planModalError.value = ''
  if (!selectedAccommodation.value || !checkInDate.value || !checkOutDate.value) {
    planModalError.value = 'Selecciona un rango valido antes de continuar.'
    return
  }
  if (!selectedPlanId.value) {
    planModalError.value = 'Selecciona un plan.'
    return
  }
  const trip = store.trips.find(t => t.id === selectedPlanId.value)
  if (!trip) {
    planModalError.value = 'No se encontro el plan seleccionado.'
    return
  }
  const start = new Date(trip.startDate)
  const checkIn = new Date(checkInDate.value)
  const msDiff = checkIn.getTime() - start.getTime()
  const dayIndex = Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1
  const totalDays = Math.ceil((new Date(trip.endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  if (dayIndex < 1 || dayIndex > totalDays) {
    planModalError.value = 'La fecha de entrada no cae dentro de ese plan.'
    return
  }

  const activity: Activity = {
    id: Date.now().toString(),
    time: '14:00',
    title: `Check-in: ${selectedAccommodation.value.title}`,
    location: `${selectedAccommodation.value.location}, ${selectedAccommodation.value.city}`
  }

  store.addActivity(trip.id, dayIndex, activity)
  showPlanSelectorModal.value = false
  store.setCurrentView('plan')
}

watch(
  selectedAccommodation,
  (value) => {
    if (!value) return
    checkInDate.value = ''
    checkOutDate.value = ''
    selectionError.value = ''
  },
  { immediate: true }
)
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Dark mode vars */
.bg-rp-bg { background-color: var(--rp-bg); }
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.border-rp-border { border-color: var(--rp-border); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.bg-rp-accent { background-color: var(--rp-accent); }
.border-rp-accent\/30 { border-color: rgba(249,115,22,0.3); }
.border-rp-accent\/40 { border-color: rgba(249,115,22,0.4); }
.hover\:border-rp-accent\/40:hover { border-color: rgba(249,115,22,0.4); }
.hover\:border-rp-accent\/30:hover { border-color: rgba(249,115,22,0.3); }
.hover\:text-rp-accent:hover { color: var(--rp-accent); }
.hover\:bg-rp-surface-2:hover { background-color: var(--rp-surface-2); }
.from-rp-surface\/80 { --tw-gradient-from: rgba(17,17,24,0.8); }
.to-transparent { --tw-gradient-to: transparent; }

/* Calendar dark mode shell */
:deep(.rp-calendar-shell .fc) {
  --rp-orange: #f97316;
  --rp-orange-soft: rgba(249,115,22,0.15);
  --rp-orange-divider: rgba(249,115,22,0.3);
  --rp-range-inset: 6px;
  font-family: 'DM Sans', sans-serif;
}

:deep(.rp-calendar-shell .fc-header-toolbar) {
  margin-bottom: 0.75rem;
  padding: 0.25rem 0.25rem 0.5rem;
}

:deep(.rp-calendar-shell .fc-toolbar-title) {
  font-size: 1rem;
  font-weight: 800;
  text-transform: capitalize;
  color: var(--rp-text, #374151);
}

:deep(.rp-calendar-shell .fc-button) {
  background: var(--rp-surface-2, #fff) !important;
  border: 1px solid var(--rp-border, #e5e7eb) !important;
  color: var(--rp-muted, #6b7280) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  padding: 0.2rem 0.5rem !important;
}

:deep(.rp-calendar-shell .fc-col-header-cell) {
  border: 0;
  background: transparent;
  padding-bottom: 0.35rem;
}

:deep(.rp-calendar-shell .fc-col-header-cell-cushion) {
  font-size: 0.75rem;
  color: var(--rp-muted, #9ca3af);
  font-weight: 700;
  text-transform: capitalize;
}

:deep(.rp-calendar-shell .fc-daygrid-day),
:deep(.rp-calendar-shell .fc-scrollgrid),
:deep(.rp-calendar-shell .fc-scrollgrid td),
:deep(.rp-calendar-shell .fc-scrollgrid th) {
  border: 0 !important;
}

:deep(.rp-calendar-shell .fc-day-today) {
  background: transparent !important;
}

:deep(.rp-calendar-shell .fc-daygrid-day-frame) {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.rp-calendar-shell .fc-daygrid-day-number) {
  width: 42px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--rp-text, #4b5563);
}

:deep(.rp-calendar-shell .fc-day-other .fc-daygrid-day-number) {
  color: var(--rp-muted, #d1d5db);
  opacity: 0.4;
}

:deep(.rp-calendar-shell .rp-day-available .fc-daygrid-day-number) {
  color: var(--rp-text, #374151);
}

:deep(.rp-calendar-shell .rp-day-unavailable .fc-daygrid-day-number) {
  color: var(--rp-muted, #d1d5db);
  text-decoration: line-through;
  cursor: not-allowed;
  opacity: 0.4;
}

:deep(.rp-calendar-shell .rp-day-selected-middle .fc-daygrid-day-number) {
  background: transparent;
  color: var(--rp-accent);
  font-weight: 700;
}

:deep(.rp-calendar-shell .rp-day-selected-middle .fc-daygrid-day-frame) {
  background: var(--rp-orange-soft);
  clip-path: inset(var(--rp-range-inset) 0 var(--rp-range-inset) 0);
  box-shadow:
    -1px 0 0 var(--rp-orange-soft),
    1px 0 0 var(--rp-orange-soft),
    inset 1px 0 0 var(--rp-orange-divider),
    inset -1px 0 0 var(--rp-orange-divider);
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-number),
:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-number) {
  background: var(--rp-orange);
  color: #fff;
  font-weight: 700;
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-frame),
:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-frame) {
  clip-path: inset(var(--rp-range-inset) 0 var(--rp-range-inset) 0);
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-frame) {
  background: linear-gradient(to right, transparent 0 42%, var(--rp-orange-soft) 42% 100%);
  box-shadow: 1px 0 0 var(--rp-orange-soft), inset -1px 0 0 var(--rp-orange-divider);
}

:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-frame) {
  background: linear-gradient(to right, var(--rp-orange-soft) 0 58%, transparent 58% 100%);
  box-shadow: -1px 0 0 var(--rp-orange-soft), inset 1px 0 0 var(--rp-orange-divider);
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-number) {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-number) {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-frame) {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-frame) {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

:deep(.rp-calendar-shell .rp-day-selected-start.rp-day-selected-end .fc-daygrid-day-number) {
  border-radius: 10px;
}

:deep(.rp-calendar-shell .rp-day-selected-start.rp-day-selected-end .fc-daygrid-day-frame) {
  border-radius: 10px;
}
</style>
