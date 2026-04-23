<template>
  <div class="p-5 lg:p-10 min-h-full">
    <div class="max-w-5xl mx-auto">
      <!-- Back button -->
      <div class="mb-6">
        <button
          class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
          :class="store.isDark
            ? 'bg-rp-surface-2 border border-rp-border text-rp-muted hover:text-blue-400 hover:border-blue-900/30'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          @click="handleClose"
        >
          <ArrowLeft :size="16" />
          <span>Volver</span>
        </button>
      </div>

      <div
        v-if="transport"
        class="rounded-3xl overflow-hidden transition-colors"
        :class="store.isDark
          ? 'bg-rp-surface border border-rp-border shadow-[0_24px_48px_rgba(0,0,0,0.5)]'
          : 'bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]'"
      >
        <!-- Hero banner (no image, stylized route card) -->
        <div
          class="relative h-52 lg:h-64 flex flex-col items-center justify-center overflow-hidden"
          :style="store.isDark
            ? 'background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);'
            : 'background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #eff6ff 100%);'"
        >
          <!-- Animated route line -->
          <div class="absolute inset-0 flex items-center justify-center opacity-10">
            <div class="w-full h-0.5 bg-blue-400" />
          </div>

          <!-- Transport type icon -->
          <div
            class="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-2xl"
            :class="store.isDark ? 'bg-blue-600' : 'bg-blue-500'"
          >
            <component :is="transportIcon" :size="42" class="text-white" />
          </div>

          <!-- Route -->
          <div class="flex items-center gap-4 z-10">
            <div class="text-center">
              <p class="text-2xl font-black" :class="store.isDark ? 'text-white' : 'text-blue-900'" style="font-family: 'Syne', sans-serif;">
                {{ transport.origin }}
              </p>
              <p class="text-xs font-bold uppercase tracking-widest opacity-70" :class="store.isDark ? 'text-blue-200' : 'text-blue-600'">
                Origen
              </p>
            </div>
            <div class="flex items-center gap-2 opacity-60">
              <div class="w-8 h-0.5 rounded-full" :class="store.isDark ? 'bg-blue-300' : 'bg-blue-400'" />
              <ArrowRight :size="18" :class="store.isDark ? 'text-blue-300' : 'text-blue-400'" />
              <div class="w-8 h-0.5 rounded-full" :class="store.isDark ? 'bg-blue-300' : 'bg-blue-400'" />
            </div>
            <div class="text-center">
              <p class="text-2xl font-black" :class="store.isDark ? 'text-white' : 'text-blue-900'" style="font-family: 'Syne', sans-serif;">
                {{ transport.destination }}
              </p>
              <p class="text-xs font-bold uppercase tracking-widest opacity-70" :class="store.isDark ? 'text-blue-200' : 'text-blue-600'">
                Destino
              </p>
            </div>
          </div>

          <!-- Type badge -->
          <div class="absolute top-4 left-4">
            <span
              class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md"
              :style="store.isDark
                ? 'background: rgba(37,99,235,0.85); color: #fff; border: 1px solid rgba(255,255,255,0.15);'
                : 'background: rgba(255,255,255,0.9); color: #2563eb;'"
            >
              <component :is="transportIcon" :size="11" />
              <span>{{ transport.type }}</span>
            </span>
          </div>

          <!-- Duration -->
          <div class="absolute top-4 right-4">
            <span
              class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md"
              :style="store.isDark
                ? 'background: rgba(17,17,24,0.85); color: #e8e8f0; border: 1px solid rgba(255,255,255,0.1);'
                : 'background: rgba(255,255,255,0.9); color: #111827;'"
            >
              <Clock :size="11" />
              <span>{{ transport.duration }}</span>
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
                {{ transport.name }}
              </h2>
              <p class="font-medium text-sm mt-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ transport.company }} · {{ transport.type }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :size="14"
                    :class="i <= Math.floor(transport.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'"
                  />
                </div>
                <span class="text-sm font-bold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                  {{ transport.rating }} ({{ transport.reviewsCount }} reseñas)
                </span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase tracking-widest font-bold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                Precio por billete
              </p>
              <p class="text-3xl font-black text-blue-500">{{ transport.currency }} {{ transport.pricePerTicket }}</p>
              <p class="text-xs mt-1 font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ transport.seatsAvailable }} plazas disponibles
              </p>
            </div>
          </div>

          <!-- Description -->
          <p class="leading-relaxed text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
            {{ transport.description }}
          </p>

          <!-- Quick info grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="info in quickInfo"
              :key="info.label"
              class="rounded-2xl p-4 flex flex-col gap-1 transition-colors"
              :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-gray-50 border border-gray-100'"
            >
              <component :is="info.icon" :size="18" class="text-blue-500" />
              <p class="text-xs font-bold uppercase tracking-wider" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                {{ info.label }}
              </p>
              <p class="text-sm font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ info.value }}</p>
            </div>
          </div>

          <!-- Amenities -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Servicios incluidos
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="amenity in transport.amenities"
                :key="amenity"
                class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                :class="store.isDark
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                  : 'bg-blue-50 text-blue-700'"
              >
                <Check :size="11" />
                <span>{{ amenity }}</span>
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
                v-for="tag in transport.tags"
                :key="tag"
                class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="store.isDark ? 'bg-rp-surface-2 text-rp-muted border border-rp-border' : 'bg-gray-100 text-gray-700'"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Booking -->
          <div
            class="rounded-2xl p-5 space-y-5 transition-colors"
            :class="store.isDark ? 'bg-rp-surface-2 border border-rp-border' : 'bg-gray-50 border border-gray-100'"
          >
            <h3 class="text-xs font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Comprar billetes
            </h3>

            <!-- Fecha y hora de salida -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                class="rounded-xl p-3 transition-colors"
                :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
              >
                <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Fecha de salida
                </p>
                <input
                  v-model="departureDate"
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
                  Hora de salida
                </p>
                <select
                  v-model="departureTime"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                >
                  <option value="">Selecciona hora</option>
                  <option v-for="t in transport.departureTimes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <!-- Clase -->
            <div
              class="rounded-xl p-3 transition-colors"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
            >
              <p class="text-xs font-bold uppercase tracking-wider mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Clase
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cls in transport.classes"
                  :key="cls.name"
                  class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all border"
                  :class="selectedClass?.name === cls.name
                    ? store.isDark
                      ? 'border-blue-500/50 bg-blue-950/40 text-blue-400'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : store.isDark
                      ? 'border-rp-border text-rp-muted hover:border-blue-500/30'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'"
                  @click="selectedClass = cls"
                >
                  {{ cls.name }} · +{{ transport.currency }} {{ cls.surcharge }}
                </button>
              </div>
            </div>

            <!-- Pasajeros -->
            <div
              class="rounded-xl p-3 transition-colors"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border' : 'bg-white border border-gray-100'"
            >
              <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Pasajeros
              </p>
              <div class="flex items-center gap-4">
                <button
                  class="w-8 h-8 rounded-full font-black text-lg flex items-center justify-center transition-all"
                  :class="store.isDark ? 'bg-rp-surface-2 text-rp-text hover:bg-blue-950/40 hover:text-blue-400' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'"
                  @click="tickets = Math.max(1, tickets - 1)"
                >−</button>
                <span class="text-xl font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ tickets }}</span>
                <button
                  class="w-8 h-8 rounded-full font-black text-lg flex items-center justify-center transition-all"
                  :class="store.isDark ? 'bg-rp-surface-2 text-rp-text hover:bg-blue-950/40 hover:text-blue-400' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'"
                  @click="tickets = Math.min(transport.seatsAvailable, tickets + 1)"
                >+</button>
                <span class="text-sm font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  {{ tickets === 1 ? 'pasajero' : 'pasajeros' }}
                </span>
              </div>
            </div>

            <!-- Total -->
            <div
              v-if="departureDate && departureTime && selectedClass"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors"
              :class="store.isDark ? 'bg-blue-950/20 border border-blue-900/30' : 'bg-white border border-blue-100'"
            >
              <p class="text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                {{ tickets }} billete{{ tickets !== 1 ? 's' : '' }} × {{ transport.currency }} {{ ticketUnitPrice }} ({{ selectedClass?.name }})
              </p>
              <p class="text-2xl font-black text-blue-500">
                Total: {{ transport.currency }} {{ totalTransportPrice }}
              </p>
            </div>

            <div v-if="bookingError" class="text-sm text-red-400 font-semibold">{{ bookingError }}</div>

            <button
              class="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              :class="store.isDark
                ? 'bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_12px_32px_rgba(37,99,235,0.4)]'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.3)] hover:from-blue-600 hover:to-indigo-700'"
              :disabled="!canBook"
              @click="handleBook"
            >
              <span v-if="!booked">Comprar billetes</span>
              <span v-else>✓ Billetes confirmados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight, Star, Clock, Check, Plane, Train, Bus, Car, Ship, Bike } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { transportsMock, type TransportMock } from '@/mocks/transport'

const store = useAppStore()
const emit = defineEmits(['close'])

const props = defineProps<{ transport?: TransportMock }>()

const transport = computed(() => props.transport ?? transportsMock[0])

const today = new Date().toISOString().split('T')[0]
const departureDate = ref('')
const departureTime = ref('')
const tickets = ref(1)
const selectedClass = ref<{ name: string; surcharge: number } | null>(null)
const bookingError = ref('')
const booked = ref(false)

const transportIconMap: Record<string, unknown> = {
  'Vuelo': Plane,
  'Tren': Train,
  'Bus': Bus,
  'Coche': Car,
  'Ferry': Ship,
  'Bicicleta': Bike
}

const transportIcon = computed(() =>
  transportIconMap[transport.value?.type ?? ''] ?? Plane
)

const quickInfo = computed(() => [
  { label: 'Duración', value: transport.value?.duration ?? '-', icon: Clock },
  { label: 'Empresa', value: transport.value?.company ?? '-', icon: transportIcon.value },
  { label: 'Origen', value: transport.value?.origin ?? '-', icon: ArrowRight },
  { label: 'Destino', value: transport.value?.destination ?? '-', icon: ArrowRight }
])

const ticketUnitPrice = computed(() =>
  (transport.value?.pricePerTicket ?? 0) + (selectedClass.value?.surcharge ?? 0)
)

const totalTransportPrice = computed(() =>
  (tickets.value * ticketUnitPrice.value).toLocaleString()
)

const canBook = computed(() =>
  !booked.value && departureDate.value !== '' && departureTime.value !== '' && selectedClass.value !== null
)

function handleBook() {
  if (!canBook.value) {
    bookingError.value = 'Completa todos los campos antes de continuar.'
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
</style>
