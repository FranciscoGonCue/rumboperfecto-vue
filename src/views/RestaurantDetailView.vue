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

            <!-- Fecha y hora -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Fecha
                </p>
                <input
                  v-model="reservationDate"
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
                  Hora
                </p>
                <select
                  v-model="reservationTime"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                >
                  <option value="">Selecciona hora</option>
                  <option v-for="t in availableTimes" :key="t" :value="t">{{ t }}</option>
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
            <button
              class="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="store.isDark
                ? 'bg-red-600 text-white shadow-[0_8px_24px_rgba(220,38,38,0.3)] hover:bg-red-500 hover:shadow-[0_12px_32px_rgba(220,38,38,0.4)]'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_14px_30px_rgba(220,38,38,0.3)] hover:from-red-600 hover:to-rose-700'"
              :disabled="!canBook"
              @click="handleBook"
            >
              <span v-if="!booked">Reservar mesa</span>
              <span v-else>✓ Reserva confirmada</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, MapPin, Star, Utensils } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { restaurantsMock, type RestaurantMock } from '@/mocks/restaurants'

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

const availableTimes = [
  '13:00', '13:30', '14:00', '14:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
]

const estimatedTotal = computed(() =>
  (diners.value * (restaurant.value?.avgPricePerPerson ?? 0)).toLocaleString()
)

const canBook = computed(() =>
  !booked.value && reservationDate.value !== '' && reservationTime.value !== ''
)

function handleBook() {
  if (!canBook.value) {
    bookingError.value = 'Selecciona fecha y hora para reservar.'
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
