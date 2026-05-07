<template>
  <div class="p-5 lg:p-10 min-h-full">
    <div class="max-w-5xl mx-auto">
      <!-- Back button -->
      <div class="mb-6">
        <button
          class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
          :class="store.isDark
            ? 'bg-rp-surface-2 border border-rp-border text-rp-muted hover:text-emerald-400 hover:border-emerald-900/30'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          @click="handleClose"
        >
          <ArrowLeft :size="16" />
          <span>Volver</span>
        </button>
      </div>

      <div
        v-if="activity"
        class="rounded-3xl overflow-hidden transition-colors"
        :class="store.isDark
          ? 'bg-rp-surface border border-rp-border shadow-[0_24px_48px_rgba(0,0,0,0.5)]'
          : 'bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'"
      >
        <!-- Hero image -->
        <div class="relative">
          <img
            :src="activity.image"
            :alt="activity.title"
            class="w-full h-64 lg:h-80 object-cover"
          />
          <div v-if="store.isDark" class="absolute inset-0 bg-gradient-to-t from-rp-surface/80 via-transparent to-transparent" />

          <!-- Category badge -->
          <div class="absolute top-4 left-4">
            <span
              class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md"
              :style="store.isDark
                ? 'background: rgba(5,150,105,0.85); color: #fff; border: 1px solid rgba(255,255,255,0.15);'
                : 'background: rgba(255,255,255,0.95); color: #059669;'"
            >
              <Compass :size="11" />
              <span>{{ activity.category }}</span>
            </span>
          </div>

          <!-- Difficulty badge -->
          <div class="absolute top-4 right-4">
            <span
              class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide backdrop-blur-md"
              :style="difficultyStyle(activity.difficulty)"
            >
              {{ activity.difficulty }}
            </span>
          </div>

          <!-- Duration chip -->
          <div class="absolute bottom-4 left-4">
            <span
              class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md"
              :style="store.isDark
                ? 'background: rgba(17,17,24,0.85); color: #e8e8f0; border: 1px solid rgba(255,255,255,0.1);'
                : 'background: rgba(255,255,255,0.95); color: #111827;'"
            >
              <Clock :size="11" />
              <span>{{ activity.duration }}</span>
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
                {{ activity.title }}
              </h2>
              <div class="flex items-center gap-2 mt-2">
                <MapPin :size="14" class="text-emerald-500 flex-shrink-0" />
                <p class="font-medium text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  {{ activity.location }}, {{ activity.city }}
                </p>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :size="14"
                    :class="i <= Math.floor(activity.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'"
                  />
                </div>
                <span class="text-sm font-bold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                  {{ activity.rating }} ({{ activity.reviewsCount }} reseñas)
                </span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase tracking-widest font-bold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                Precio por persona
              </p>
              <p class="text-3xl font-black text-emerald-500">{{ activity.currency }} {{ activity.pricePerPerson }}</p>
              <p class="text-xs mt-1 font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Máx. {{ activity.maxGroupSize }} personas
              </p>
            </div>
          </div>

          <!-- Description -->
          <p class="leading-relaxed text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
            {{ activity.description }}
          </p>

          <!-- Includes -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              ¿Qué incluye?
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in activity.includes"
                :key="item"
                class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                :class="store.isDark
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                  : 'bg-emerald-50 text-emerald-700'"
              >
                <Check :size="11" />
                <span>{{ item }}</span>
              </span>
            </div>
          </div>

          <!-- Requirements -->
          <div v-if="activity.requirements?.length">
            <h3 class="text-xs font-black uppercase tracking-widest mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Requisitos
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="req in activity.requirements"
                :key="req"
                class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                :class="store.isDark
                  ? 'bg-amber-950/30 text-amber-400 border border-amber-900/30'
                  : 'bg-amber-50 text-amber-700'"
              >
                <AlertTriangle :size="11" />
                <span>{{ req }}</span>
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Etiquetas
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in activity.tags"
                :key="tag"
                class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="store.isDark ? 'bg-rp-surface-2 text-rp-muted border border-rp-border' : 'bg-gray-100 text-gray-700'"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Booking section -->
          <div
            class="rounded-2xl p-5 space-y-5 transition-colors"
            :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-gray-50 border border-gray-100'"
          >
            <h3 class="text-xs font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Reservar actividad
            </h3>

            <!-- Calendario de selección de fecha -->
            <div
              class="rounded-2xl p-3 overflow-hidden rp-calendar-shell"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
            >
              <FullCalendar :key="calendarKey" :options="calendarOptions" />
            </div>

            <!-- Fecha seleccionada + Turno -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Fecha seleccionada
                </p>
                <p class="font-bold text-sm" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
                  {{ bookingDate ? formatDate(bookingDate) : 'Selecciona una fecha' }}
                </p>
              </div>
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Turno
                </p>
                <select
                  v-model="bookingShift"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                >
                  <option value="">Selecciona turno</option>
                  <option v-for="s in shiftsForSelectedDate" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <!-- Participantes -->
            <div
              class="rounded-xl p-3 transition-colors"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
            >
              <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Participantes
              </p>
              <div class="flex items-center gap-4">
                <button
                  class="w-8 h-8 rounded-full font-black text-lg flex items-center justify-center transition-all"
                  :class="store.isDark ? 'bg-rp-surface-2 text-rp-text hover:bg-emerald-950/40 hover:text-emerald-400' : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-600'"
                  @click="participants = Math.max(1, participants - 1)"
                >−</button>
                <span class="text-xl font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ participants }}</span>
                <button
                  class="w-8 h-8 rounded-full font-black text-lg flex items-center justify-center transition-all"
                  :class="store.isDark ? 'bg-rp-surface-2 text-rp-text hover:bg-emerald-950/40 hover:text-emerald-400' : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-600'"
                  @click="participants = Math.min(activity.maxGroupSize, participants + 1)"
                >+</button>
                <span class="text-sm font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  de {{ activity.maxGroupSize }} máx.
                </span>
              </div>
            </div>

            <!-- Total -->
            <div
              v-if="bookingDate && bookingShift"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors"
              :class="store.isDark ? 'bg-emerald-950/20 border border-emerald-900/30' : 'bg-white border border-emerald-100'"
            >
              <p class="text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                {{ participants }} persona{{ participants !== 1 ? 's' : '' }} × {{ activity.currency }} {{ activity.pricePerPerson }}
              </p>
              <p class="text-2xl font-black text-emerald-500">
                Total: {{ activity.currency }} {{ totalActivityPrice }}
              </p>
            </div>

            <div v-if="bookingError" class="text-sm text-red-400 font-semibold">{{ bookingError }}</div>

            <div class="flex gap-3">
              <button
                class="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                :class="store.isDark
                  ? 'bg-emerald-600 text-white shadow-[0_8px_24px_rgba(5,150,105,0.3)] hover:bg-emerald-500 hover:shadow-[0_12px_32px_rgba(5,150,105,0.4)]'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_14px_30px_rgba(5,150,105,0.3)] hover:from-emerald-600 hover:to-green-700'"
                :disabled="!canBook"
                @click="handleBook"
              >
                <span v-if="bookingLoading">Reservando…</span>
                <span v-else-if="!booked">Reservar actividad</span>
                <span v-else>✓ ¡Actividad reservada!</span>
              </button>

              <button
                class="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                :class="store.isDark
                  ? 'bg-rp-accent text-white shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:bg-orange-500 hover:shadow-[0_12px_32px_rgba(249,115,22,0.4)]'
                  : 'bg-gradient-to-r from-rp-accent to-orange-600 text-white shadow-[0_14px_30px_rgba(249,115,22,0.3)] hover:from-orange-600 hover:to-orange-700'"
                :disabled="!bookingDate"
                @click="openAddToPlanModal"
              >
                <BookmarkPlus :size="16" />
                <span>Añadir a plan</span>
              </button>
            </div>
          </div>
        </div>
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
        <div
          class="rounded-[28px] p-6 max-w-lg w-full shadow-2xl transition-colors"
          :class="store.isDark
            ? 'bg-rp-surface border border-rp-border shadow-[0_24px_64px_rgba(0,0,0,0.7)]'
            : 'bg-white border border-orange-100'"
        >
          <h3
            class="text-xl font-black uppercase tracking-tight mb-2"
            :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
            style="font-family: 'Syne', sans-serif;"
          >Selecciona un plan</h3>
          <p class="text-sm mb-5" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
            Elige el viaje donde quieres añadir esta actividad.
          </p>

          <div
            v-if="store.trips.length === 0"
            class="rounded-xl p-4 text-sm transition-colors"
            :class="store.isDark
              ? 'bg-rp-surface-2 border border-rp-border text-rp-muted'
              : 'border border-gray-200 bg-gray-50 text-gray-600'"
          >
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
                  : 'border-rp-accent bg-orange-50'
                : store.isDark
                  ? 'border-rp-border hover:border-rp-accent/40 bg-rp-surface-2'
                  : 'border-gray-200 hover:border-orange-200'"
              @click="selectedPlanId = trip.id"
            >
              <p class="font-bold uppercase text-sm tracking-wide" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ trip.title }}</p>
              <p class="text-xs mt-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ trip.startDate }} — {{ trip.endDate }}
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
            >Cancelar</button>
            <button
              class="px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider disabled:opacity-60 transition-colors"
              :class="store.isDark
                ? 'bg-rp-accent text-white hover:bg-orange-500'
                : 'bg-gradient-to-r from-rp-accent to-orange-600 text-white'"
              :disabled="store.trips.length === 0"
              @click="confirmAddToPlan"
            >Confirmar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, MapPin, Star, Compass, Clock, Check, AlertTriangle, BookmarkPlus } from 'lucide-vue-next'
import type { Activity } from '@/types'
import { useAppStore } from '@/stores/app'
import { activitiesMock, type ActivityMock } from '@/mocks/activities'
import { reservasApi, shiftsLibresParaFecha, turnosEquivalentes, diaSinTurnosLibres } from '@/services/api'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const store = useAppStore()
const emit = defineEmits(['close'])

const props = defineProps<{ activity?: ActivityMock }>()

const activity = computed(() => props.activity ?? activitiesMock[0])

const today = new Date().toISOString().split('T')[0]
const bookingDate = ref('')
const bookingShift = ref('')
const participants = ref(2)
const bookingError = ref('')
const booked = ref(false)

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isDateUnavailable(dateStr: string): boolean {
  const act = activity.value
  if (!act) return true
  if (dateStr < today) return true
  const from = act.availableFrom
  const to = act.availableTo
  if (from && dateStr < from) return true
  if (to && dateStr > to) return true
  if (act.unavailableDates?.includes(dateStr)) return true
  const base = act.availableShifts ?? []
  const occ = act.occupiedShiftsByDate ?? {}
  if (base.length > 0 && diaSinTurnosLibres(base, dateStr, occ)) return true
  return false
}

const occupiedByDate = computed(() => activity.value?.occupiedShiftsByDate ?? {})
const baseActivityShifts = computed(() => activity.value?.availableShifts ?? [])

const shiftsForSelectedDate = computed(() =>
  shiftsLibresParaFecha(baseActivityShifts.value, bookingDate.value, occupiedByDate.value),
)

watch(bookingDate, () => {
  const opts = shiftsForSelectedDate.value
  if (bookingShift.value && !opts.some((s) => turnosEquivalentes(s, bookingShift.value)))
    bookingShift.value = ''
})

function handleDateClick(info: { dateStr: string }) {
  if (isDateUnavailable(info.dateStr)) return
  bookingDate.value = info.dateStr
}

function dayCellClassNames(arg: { date: Date }) {
  const dateKey = getDateKey(arg.date)
  if (isDateUnavailable(dateKey)) return ['rp-day-unavailable']
  const classes = ['rp-day-available']
  if (bookingDate.value === dateKey) classes.push('rp-day-selected-start', 'rp-day-selected-end')
  return classes
}

const calendarKey = computed(() => {
  const blocked = activity.value?.unavailableDates?.join(',') ?? ''
  const occ = JSON.stringify(activity.value?.occupiedShiftsByDate ?? {})
  return `act-${activity.value?.id ?? 'none'}-${bookingDate.value}-${blocked}-${occ}`
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

function difficultyStyle(difficulty: string) {
  const map: Record<string, string> = {
    'Fácil': 'background: rgba(16,185,129,0.85); color: #fff;',
    'Moderado': 'background: rgba(245,158,11,0.85); color: #fff;',
    'Difícil': 'background: rgba(239,68,68,0.85); color: #fff;',
    'Extremo': 'background: rgba(139,0,0,0.9); color: #fff;'
  }
  return map[difficulty] ?? 'background: rgba(107,114,128,0.85); color: #fff;'
}

const totalActivityPrice = computed(() =>
  (participants.value * (activity.value?.pricePerPerson ?? 0)).toLocaleString()
)

const bookingLoading = ref(false)

const canBook = computed(() =>
  !booked.value && !bookingLoading.value && bookingDate.value !== '' && bookingShift.value !== ''
)

async function handleBook() {
  if (!canBook.value) {
    bookingError.value = 'Selecciona fecha y turno para continuar.'
    return
  }
  bookingError.value = ''
  bookingLoading.value = true
  try {
    await reservasApi.crear({
      servicio:      activity.value.id,
      fecha_inicio:  bookingDate.value,
      turno:         bookingShift.value,
      personas:      participants.value,
      precio_total:  participants.value * (activity.value?.pricePerPerson ?? 0),
    })
    booked.value = true
    const act = activity.value
    const d = bookingDate.value
    const t = bookingShift.value
    if (!act.occupiedShiftsByDate) act.occupiedShiftsByDate = {}
    const occ = act.occupiedShiftsByDate
    if (!occ[d]) occ[d] = []
    if (!occ[d].some((o) => turnosEquivalentes(o, t))) occ[d].push(t)
    const rem = shiftsLibresParaFecha(act.availableShifts ?? [], d, occ)
    if (rem.length === 0 && !act.unavailableDates.includes(d)) act.unavailableDates.push(d)
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

const showPlanSelectorModal = ref(false)
const selectedPlanId = ref('')
const planModalError = ref('')

function openAddToPlanModal() {
  if (!bookingDate.value) return
  planModalError.value = ''
  selectedPlanId.value = store.trips[0]?.id ?? ''
  showPlanSelectorModal.value = true
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
  const actDate = new Date(bookingDate.value)
  const dayIndex = Math.floor((actDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalDays = Math.ceil((new Date(trip.endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  if (dayIndex < 1 || dayIndex > totalDays) {
    planModalError.value = 'La fecha seleccionada no cae dentro de ese plan.'
    return
  }
  const planActivity: Activity = {
    id: Date.now().toString(),
    time: bookingShift.value || '09:00',
    title: activity.value?.title ?? 'Actividad',
    location: activity.value?.location ?? '',
  }
  store.addActivity(trip.id, dayIndex, planActivity)
  showPlanSelectorModal.value = false
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

.modal-enter-active,
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; transform: scale(0.98); }

/* ── FullCalendar ── */
:deep(.rp-calendar-shell .fc) {
  --rp-orange: #f97316;
  --rp-orange-soft: rgba(249,115,22,0.15);
  --rp-orange-divider: rgba(249,115,22,0.3);
  font-family: 'DM Sans', sans-serif;
}
:deep(.rp-calendar-shell .fc-header-toolbar) { margin-bottom: 0.75rem; padding: 0.25rem 0.25rem 0.5rem; }
:deep(.rp-calendar-shell .fc-toolbar-title) { font-size: 1rem; font-weight: 800; text-transform: capitalize; color: var(--rp-text, #374151); }
:deep(.rp-calendar-shell .fc-button) {
  background: var(--rp-surface-2, #fff) !important;
  border: 1px solid var(--rp-border, #e5e7eb) !important;
  color: var(--rp-muted, #6b7280) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  padding: 0.2rem 0.5rem !important;
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
  width: 38px; height: 38px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; font-size: 0.9rem; font-weight: 600;
  color: var(--rp-text, #4b5563); cursor: pointer; transition: background 0.15s;
}
:deep(.rp-calendar-shell .fc-day-other .fc-daygrid-day-number) { color: var(--rp-muted, #d1d5db); opacity: 0.4; }
:deep(.rp-calendar-shell .rp-day-available .fc-daygrid-day-number) { color: var(--rp-text, #374151); }
:deep(.rp-calendar-shell .rp-day-available .fc-daygrid-day-number:hover) { background: var(--rp-orange-soft); color: var(--rp-orange); }
:deep(.rp-calendar-shell .rp-day-unavailable .fc-daygrid-day-number) {
  color: var(--rp-muted, #d1d5db); text-decoration: line-through; cursor: not-allowed; opacity: 0.35;
}
:deep(.rp-calendar-shell .rp-day-selected-start .fc-daygrid-day-number),
:deep(.rp-calendar-shell .rp-day-selected-end .fc-daygrid-day-number) {
  background: var(--rp-orange) !important; color: #fff !important; font-weight: 700; border-radius: 50%;
}
</style>
