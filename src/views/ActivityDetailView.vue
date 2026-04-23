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

            <!-- Fecha y turno -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Fecha
                </p>
                <input
                  v-model="bookingDate"
                  type="date"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                  :min="today"
                />
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
                  <option v-for="s in activity.availableShifts" :key="s" :value="s">{{ s }}</option>
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

            <button
              class="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="store.isDark
                ? 'bg-emerald-600 text-white shadow-[0_8px_24px_rgba(5,150,105,0.3)] hover:bg-emerald-500 hover:shadow-[0_12px_32px_rgba(5,150,105,0.4)]'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_14px_30px_rgba(5,150,105,0.3)] hover:from-emerald-600 hover:to-green-700'"
              :disabled="!canBook"
              @click="handleBook"
            >
              <span v-if="!booked">Reservar actividad</span>
              <span v-else>✓ ¡Actividad reservada!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, MapPin, Star, Compass, Clock, Check, AlertTriangle } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { activitiesMock, type ActivityMock } from '@/mocks/activities'

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

const canBook = computed(() =>
  !booked.value && bookingDate.value !== '' && bookingShift.value !== ''
)

function handleBook() {
  if (!canBook.value) {
    bookingError.value = 'Selecciona fecha y turno para continuar.'
    return
  }
  bookingError.value = ''
  booked.value = true
}

function handleClose() {
  emit('close')
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
.from-rp-surface\/80 { --tw-gradient-from: rgba(17,17,24,0.8); }
.to-transparent { --tw-gradient-to: transparent; }
</style>
