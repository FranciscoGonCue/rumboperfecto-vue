<template>
  <div class="p-6 lg:p-12 min-h-full">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <button
          class="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
          @click="store.closeAccommodationDetail()"
        >
          <ArrowLeft :size="18" />
          <span>Volver</span>
        </button>
      </div>

      <div
        v-if="selectedAccommodation"
        class="bg-white rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100"
      >
        <img
          :src="selectedAccommodation.image"
          :alt="selectedAccommodation.title"
          class="w-full h-72 lg:h-96 object-cover"
        />

        <div class="p-6 lg:p-10 space-y-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-3xl lg:text-4xl font-black text-gray-800 uppercase tracking-tight">
                {{ selectedAccommodation.title }}
              </h2>
              <p class="text-gray-500 font-medium mt-2">
                {{ selectedAccommodation.location }}, {{ selectedAccommodation.city }}, {{ selectedAccommodation.country }}
              </p>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase tracking-widest text-gray-400 font-bold">Precio por noche</p>
              <p class="text-3xl font-black text-rumbo-orange">
                {{ selectedAccommodation.currency }} {{ selectedAccommodation.pricePerNight }}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                ⭐ {{ selectedAccommodation.rating }} ({{ selectedAccommodation.reviewsCount }} reseñas)
              </p>
            </div>
          </div>

          <p class="text-gray-700 leading-relaxed">
            {{ selectedAccommodation.description }}
          </p>

          <div>
            <h3 class="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Comodidades</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="amenity in selectedAccommodation.amenities"
                :key="amenity"
                class="px-3 py-1.5 rounded-full bg-orange-50 text-rumbo-orange text-xs font-bold uppercase tracking-wide"
              >
                {{ amenity }}
              </span>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Etiquetas</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedAccommodation.tags"
                :key="tag"
                class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wide"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
            <h3 class="text-sm font-black uppercase tracking-widest text-gray-500">Disponibilidad y precio</h3>

            <p class="text-sm text-gray-600">
              Disponible del {{ formatDate(selectedAccommodation.availableFrom) }} al {{ formatDate(selectedAccommodation.availableTo) }}
            </p>

            <div class="bg-white rounded-2xl p-3 border border-gray-100 overflow-hidden rp-calendar-shell">
              <FullCalendar :key="calendarKey" :options="calendarOptions" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-3 border border-gray-100">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Check-in</p>
                <p class="font-bold text-gray-800">{{ checkInDate ? formatDate(checkInDate) : 'Selecciona una fecha' }}</p>
              </div>
              <div class="bg-white rounded-xl p-3 border border-gray-100">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Check-out</p>
                <p class="font-bold text-gray-800">{{ checkOutDate ? formatDate(checkOutDate) : 'Selecciona una fecha' }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-gray-500 font-medium">
                {{ selectionHint }}
              </p>
              <button
                class="px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:border-orange-300 hover:text-rumbo-orange transition-colors"
                @click="resetSelection"
              >
                Limpiar
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-orange-400" /> Seleccionado</span>
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-400" /> No disponible</span>
              <span class="inline-flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-400" /> Disponible</span>
            </div>

            <div v-if="bookingError" class="text-sm text-red-600 font-semibold">
              {{ bookingError }}
            </div>

            <div
              v-else-if="canCalculatePrice"
              class="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-4 border border-orange-100"
            >
              <p class="text-sm text-gray-600">
                {{ nightsCount }} noche<span v-if="nightsCount !== 1">s</span> x {{ selectedAccommodation.currency }} {{ selectedAccommodation.pricePerNight }}
              </p>
              <p class="text-2xl font-black text-rumbo-orange">
                Total: {{ selectedAccommodation.currency }} {{ totalPrice }}
              </p>
            </div>

            <button
              class="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-rumbo-orange to-orange-600 text-white font-black uppercase tracking-widest shadow-[0_14px_30px_rgba(249,115,22,0.35)] hover:from-orange-600 hover:to-orange-700 hover:shadow-[0_18px_34px_rgba(249,115,22,0.45)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="!canCalculatePrice"
              @click="openAddToPlanModal"
            >
              Añadir a plan
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-white rounded-3xl p-10 text-center shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100"
      >
        <h2 class="text-2xl font-black text-gray-800 mb-3">Alojamiento no encontrado</h2>
        <p class="text-gray-500 mb-6">No se pudo cargar el detalle del alojamiento seleccionado.</p>
        <button
          class="px-6 py-3 rounded-xl bg-rumbo-orange text-white font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors"
          @click="store.closeAccommodationDetail()"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showPlanSelectorModal"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showPlanSelectorModal = false"
      >
        <div class="bg-white rounded-[28px] p-6 max-w-lg w-full shadow-2xl border border-orange-100">
          <h3 class="text-xl font-black uppercase tracking-tight text-gray-800 mb-2">Selecciona un plan</h3>
          <p class="text-sm text-gray-500 mb-5">Elige el viaje donde quieres añadir este alojamiento.</p>

          <div v-if="store.trips.length === 0" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            No tienes planes creados todavía. Crea uno primero desde la vista Plan.
          </div>

          <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
            <button
              v-for="trip in store.trips"
              :key="trip.id"
              class="w-full text-left p-4 rounded-xl border-2 transition-all"
              :class="selectedPlanId === trip.id ? 'border-rumbo-orange bg-orange-50' : 'border-gray-200 hover:border-orange-200'"
              @click="selectedPlanId = trip.id"
            >
              <p class="font-bold text-gray-800 uppercase text-sm tracking-wide">{{ trip.title }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</p>
            </button>
          </div>

          <p v-if="planModalError" class="text-sm text-red-600 font-semibold mt-4">{{ planModalError }}</p>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50"
              @click="showPlanSelectorModal = false"
            >
              Cancelar
            </button>
            <button
              class="px-5 py-2 rounded-lg bg-gradient-to-r from-rumbo-orange to-orange-600 text-white font-bold text-sm uppercase tracking-wider disabled:opacity-60"
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
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Activity } from '@/types'

const store = useAppStore()

const selectedAccommodation = computed(() =>
  accommodationsMock.find(item => item.id === store.selectedAccommodationId) ?? null
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

function addOneDay(dateStr: string) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
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

  if (checkInDate.value && dateKey === checkInDate.value) {
    classes.push('rp-day-selected-start')
  }

  if (checkOutDate.value && dateKey === checkOutDate.value) {
    classes.push('rp-day-selected-end')
  }

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
:deep(.modal-enter-active),
:deep(.modal-leave-active) {
  transition: all 0.2s ease;
}

:deep(.modal-enter-from),
:deep(.modal-leave-to) {
  opacity: 0;
  transform: scale(0.98);
}

:deep(.rp-calendar-shell .fc) {
  --rp-orange: #f97316;
  --rp-orange-soft: #ffedd5;
}

:deep(.rp-calendar-shell .fc-header-toolbar) {
  margin-bottom: 0.75rem;
  padding: 0.25rem 0.25rem 0.5rem;
}

:deep(.rp-calendar-shell .fc-toolbar-title) {
  font-size: 1rem;
  font-weight: 800;
  text-transform: capitalize;
  color: #374151;
}

:deep(.rp-calendar-shell .fc-button) {
  background: #fff !important;
  border: 1px solid #e5e7eb !important;
  color: #6b7280 !important;
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
  color: #9ca3af;
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
  color: #4b5563;
}

:deep(.rp-calendar-shell .fc-day-other .fc-daygrid-day-number) {
  color: #d1d5db;
}

:deep(.rp-calendar-shell .rp-day-available .fc-daygrid-day-number) {
  color: #374151;
}

:deep(.rp-calendar-shell .rp-day-unavailable .fc-daygrid-day-number) {
  color: #d1d5db;
  text-decoration: line-through;
  cursor: not-allowed;
}

:deep(.rp-calendar-shell .rp-day-selected-middle .fc-daygrid-day-number) {
  background: transparent;
  color: #9a3412;
}

:deep(.rp-calendar-shell .rp-day-selected-middle .fc-daygrid-day-frame) {
  background: var(--rp-orange-soft);
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-number),
:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-number) {
  background: var(--rp-orange);
  color: #fff;
  font-weight: 700;
}

:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-frame),
:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-frame) {
  background: var(--rp-orange-soft);
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
