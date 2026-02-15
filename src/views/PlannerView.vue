<template>
  <div class="p-6 lg:p-12 min-h-full">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
            Mis Viajes
          </h2>
          <div class="h-1.5 w-16 bg-orange-500 rounded-full mt-3" />
        </div>
        <button
          class="flex items-center space-x-2 bg-rumbo-orange text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all hover:shadow-xl hover:-translate-y-1"
          @click="showAddTripModal = true"
        >
          <Plus :size="20" />
          <span class="hidden sm:inline">Nuevo Viaje</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="store.trips.length === 0" class="text-center py-20">
        <div class="w-32 h-32 bg-orange-50 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Plane :size="64" class="text-rumbo-orange" />
        </div>
        <h3 class="text-2xl font-black text-gray-800 mb-4">¡Comienza tu aventura!</h3>
        <p class="text-gray-500 mb-8">Aún no has creado ningún viaje. Crea tu primer itinerario ahora.</p>
        <button
          class="bg-rumbo-orange text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
          @click="showAddTripModal = true"
        >
          Crear Mi Primer Viaje
        </button>
      </div>

      <!-- Trips Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <TransitionGroup name="trip">
          <div
            v-for="trip in store.trips"
            :key="trip.id"
            class="bg-white rounded-[40px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.06)] border border-gray-50 group hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            @click="selectTrip(trip)"
          >
            <div class="relative h-48 bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden">
              <div class="absolute inset-0 bg-black/20" />
              <div class="absolute bottom-4 left-4 right-4 text-white">
                <h3 class="text-2xl font-black uppercase tracking-tight mb-2">{{ trip.title }}</h3>
                <div class="flex items-center space-x-2 text-sm">
                  <Calendar :size="16" />
                  <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
                </div>
              </div>
              <button
                class="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all"
                @click.stop="deleteTrip(trip.id)"
              >
                <Trash2 :size="18" />
              </button>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 text-gray-600">
                  <MapPin :size="16" />
                  <span class="text-sm font-bold">{{ getDaysCount(trip) }} días</span>
                </div>
                <div class="flex items-center space-x-2 text-rumbo-orange">
                  <Activity :size="16" />
                  <span class="text-sm font-bold">{{ getActivitiesCount(trip) }} actividades</span>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Add Trip Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddTripModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showAddTripModal = false"
        >
          <div class="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-black uppercase tracking-tight">Nuevo Viaje</h3>
              <button
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                @click="showAddTripModal = false"
              >
                <X :size="24" />
              </button>
            </div>

            <form @submit.prevent="handleAddTrip" class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Título del viaje
                </label>
                <input
                  v-model="newTrip.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
                  placeholder="Ej: Aventura en Tailandia"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Fecha inicio
                  </label>
                  <input
                    v-model="newTrip.startDate"
                    type="date"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Fecha fin
                  </label>
                  <input
                    v-model="newTrip.endDate"
                    type="date"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-rumbo-orange text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
              >
                Crear Viaje
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Trip Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedTrip"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          @click.self="selectedTrip = null"
        >
          <div class="bg-white rounded-[40px] p-8 max-w-4xl w-full shadow-2xl transform transition-all my-8">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-3xl font-black uppercase tracking-tight">{{ selectedTrip.title }}</h3>
                <p class="text-gray-500 mt-2">
                  {{ formatDate(selectedTrip.startDate) }} - {{ formatDate(selectedTrip.endDate) }}
                </p>
              </div>
              <button
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                @click="selectedTrip = null"
              >
                <X :size="24" />
              </button>
            </div>

            <!-- Days Tabs -->
            <div class="flex overflow-x-auto space-x-2 mb-8 pb-4 border-b border-gray-200">
              <button
                v-for="day in getDaysCount(selectedTrip)"
                :key="day"
                class="px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all"
                :class="selectedDay === day
                  ? 'bg-rumbo-orange text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                @click="selectedDay = day"
              >
                Día {{ day }}
              </button>
            </div>

            <!-- Activities for selected day -->
            <div class="space-y-4 mb-8">
              <div
                v-for="activity in getActivitiesForDay(selectedTrip, selectedDay)"
                :key="activity.id"
                class="flex items-start space-x-4 p-4 bg-orange-50 rounded-2xl"
              >
                <div class="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Clock :size="24" class="text-rumbo-orange" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="font-bold text-gray-800">{{ activity.title }}</h4>
                    <span class="text-sm font-bold text-rumbo-orange">{{ activity.time }}</span>
                  </div>
                  <p class="text-sm text-gray-600 flex items-center">
                    <MapPin :size="14" class="mr-1" />
                    {{ activity.location }}
                  </p>
                </div>
              </div>

              <button
                class="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-rumbo-orange hover:text-rumbo-orange transition-all flex items-center justify-center space-x-2"
                @click="showAddActivityModal = true"
              >
                <Plus :size="20" />
                <span class="font-bold">Agregar Actividad</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add Activity Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddActivityModal && selectedTrip"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showAddActivityModal = false"
        >
          <div class="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-black uppercase tracking-tight">Nueva Actividad</h3>
              <button
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                @click="showAddActivityModal = false"
              >
                <X :size="24" />
              </button>
            </div>

            <form @submit.prevent="handleAddActivity" class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Título
                </label>
                <input
                  v-model="newActivity.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
                  placeholder="Ej: Visita al templo"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Ubicación
                </label>
                <input
                  v-model="newActivity.location"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
                  placeholder="Ej: Bangkok, Tailandia"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Hora
                </label>
                <input
                  v-model="newActivity.time"
                  type="time"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                class="w-full bg-rumbo-orange text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
              >
                Agregar Actividad
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { Plus, Plane, Calendar, MapPin, Activity, Trash2, X, Clock } from 'lucide-vue-next'
import type { Trip, Activity as ActivityType } from '@/types'

const store = useAppStore()

const showAddTripModal = ref(false)
const showAddActivityModal = ref(false)
const selectedTrip = ref<Trip | null>(null)
const selectedDay = ref(1)

const newTrip = reactive({
  title: '',
  startDate: '',
  endDate: ''
})

const newActivity = reactive({
  title: '',
  location: '',
  time: ''
})

function handleAddTrip() {
  const trip: Trip = {
    id: Date.now().toString(),
    title: newTrip.title,
    startDate: newTrip.startDate,
    endDate: newTrip.endDate,
    activities: {}
  }

  store.addTrip(trip)
  showAddTripModal.value = false
  
  // Reset form
  newTrip.title = ''
  newTrip.startDate = ''
  newTrip.endDate = ''
}

function handleAddActivity() {
  if (!selectedTrip.value) return

  const activity: ActivityType = {
    id: Date.now().toString(),
    title: newActivity.title,
    location: newActivity.location,
    time: newActivity.time
  }

  store.addActivity(selectedTrip.value.id, selectedDay.value, activity)
  showAddActivityModal.value = false

  // Reset form
  newActivity.title = ''
  newActivity.location = ''
  newActivity.time = ''

  // Refresh selected trip
  selectedTrip.value = store.trips.find(t => t.id === selectedTrip.value?.id) || null
}

function selectTrip(trip: Trip) {
  selectedTrip.value = trip
  selectedDay.value = 1
}

function deleteTrip(id: string) {
  if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
    store.deleteTrip(id)
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getDaysCount(trip: Trip) {
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

function getActivitiesCount(trip: Trip) {
  return Object.values(trip.activities).reduce((sum, activities) => sum + activities.length, 0)
}

function getActivitiesForDay(trip: Trip, day: number) {
  return trip.activities[day] || []
}
</script>

<style scoped>
.trip-enter-active,
.trip-leave-active {
  transition: all 0.5s ease;
}

.trip-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.trip-leave-to {
  opacity: 0;
  transform: scale(0.9);
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
</style>
