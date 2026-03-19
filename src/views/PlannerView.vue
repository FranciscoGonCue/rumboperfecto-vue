<template><!-- Contenedor principal con padding adaptativo (6 en móvil, 12 en desktop) y altura mínima completa -->
  <!-- Contenedor principal con padding adaptativo (6 en móvil, 12 en desktop) y altura mínima completa -->
  <div class="p-6 lg:p-12 min-h-full">
    <!-- Contenedor centrado con máximo ancho para mantener legibilidad -->
    <div class="max-w-6xl mx-auto">
      <!-- ========== HEADER / ENCABEZADO ========== -->
      <!-- Barra superior: título a la izquierda, botones a la derecha -->
      <div class="flex items-center justify-between mb-12">
        <div>
          <!-- Título "Mis Viajes" en grande, negrita, mayúsculas -->
          <h2 class="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
            Mis Viajes
          </h2>
          <!-- Línea decorativa naranja debajo del título -->
          <div class="h-1.5 w-16 bg-orange-500 rounded-full mt-3" />
        </div>
        <!-- Contenedor de botones a la derecha -->
        <div class="flex items-center space-x-4">
          <!-- Toggle de vistas (Tarjetas/Calendario) -->
          <div class="flex bg-gray-100 rounded-2xl p-1 shadow-md">
            <button
              class="px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-200"
              :class="viewMode === 'cards' ? 'bg-white shadow-md text-rumbo-orange' : 'text-gray-500 hover:text-gray-700'"
              @click="viewMode = 'cards'"
              title="Vista de tarjetas"
            >
              <span class="hidden sm:inline">Tarjetas</span>
              <span class="sm:hidden">📇</span>
            </button>
            <button
              class="px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-200"
              :class="viewMode === 'calendar' ? 'bg-white shadow-md text-rumbo-orange' : 'text-gray-500 hover:text-gray-700'"
              @click="viewMode = 'calendar'"
              title="Vista de calendario"
            >
              <span class="hidden sm:inline">Calendario</span>
              <span class="sm:hidden">📅</span>
            </button>
          </div>

          <!-- Botón "Nuevo Viaje": abre modal para crear un viaje -->
          <button
            class="flex items-center space-x-2 bg-gradient-to-r from-rumbo-orange to-orange-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
            @click="showAddTripModal = true"
            title="Crear un nuevo viaje"
          >
            <Plus :size="20" />
            <!-- El texto solo se muestra en pantallas pequeñas (@click abre el modal) -->
            <span class="hidden sm:inline">Nuevo Viaje</span>
          </button>
        </div>
      </div>

      <!-- ========== EMPTY STATE (sin viajes) ========== -->
      <!-- Se muestra SOLO si la lista de viajes está vacía -->
      <div v-if="store.trips.length === 0" class="text-center py-20">
        <!-- Icono grande de avión con fondo naranja claro -->
        <div class="w-32 h-32 bg-orange-50 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Plane :size="64" class="text-rumbo-orange" />
        </div>
        <!-- Texto motivacional -->
        <h3 class="text-2xl font-black text-gray-800 mb-4">¡Comienza tu aventura!</h3>
        <p class="text-gray-500 mb-8">Aún no has creado ningún viaje. Crea tu primer itinerario ahora.</p>
        <!-- Botón para crear el primer viaje -->
        <button
          class="bg-gradient-to-r from-rumbo-orange to-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
          @click="showAddTripModal = true"
        >
          Crear Mi Primer Viaje
        </button>
      </div>

      <!-- ========== CONTENIDO PRINCIPAL (TARJETAS O CALENDARIO) ========== -->
      <!-- Se muestra si hay al menos 1 viaje (v-else del Empty State) -->
      <div v-else>
        <!-- MODO TARJETAS: Grid de viajes -->
        <div v-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- v-for itera sobre todos los viajes del store -->
          <div
            v-for="trip in store.trips"
            :key="trip.id"
            class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-[1.02]"
            @click="selectTrip(trip)"
          >
            <!-- Encabezado de la tarjeta con color del viaje -->
            <div
              class="h-3 bg-gradient-to-r from-rumbo-orange to-orange-600"
              :style="{ backgroundColor: getTripColor(trip.id) }"
            />

            <!-- Contenido de la tarjeta -->
            <div class="p-6">
              <!-- Título del viaje -->
              <h3 class="text-xl font-black uppercase tracking-tight mb-3 text-gray-800 group-hover:text-rumbo-orange transition-colors">
                {{ trip.title }}
              </h3>

              <!-- Información de fechas -->
              <div class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <Calendar :size="18" class="text-rumbo-orange" />
                <span class="font-semibold">
                  {{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}
                </span>
              </div>

              <!-- Stats: Días y Actividades -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <!-- Contador de días -->
                <div class="bg-orange-50 rounded-xl p-3 text-center">
                  <p class="text-2xl font-black text-rumbo-orange">{{ getDaysCount(trip) }}</p>
                  <p class="text-xs font-bold text-gray-600 uppercase tracking-wider">días</p>
                </div>
                <!-- Contador de actividades -->
                <div class="bg-blue-50 rounded-xl p-3 text-center">
                  <p class="text-2xl font-black text-blue-600">{{ getActivitiesCount(trip) }}</p>
                  <p class="text-xs font-bold text-gray-600 uppercase tracking-wider">actividades</p>
                </div>
              </div>

              <!-- Botón para ver detalles -->
              <button
                class="w-full py-3 bg-gradient-to-r from-rumbo-orange to-orange-600 text-white rounded-xl font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.05]"
                @click.stop="selectTrip(trip)"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <!-- MODO CALENDARIO: FullCalendar -->
        <div v-else class="bg-white rounded-3xl shadow-lg overflow-hidden">
          <FullCalendar :options="calendarOptions" />
        </div>
      </div>
    </div>

    <!-- ========== MODAL: AGREGAR NUEVO VIAJE ========== -->
    <!-- Teleport: renderiza el modal fuera del árbol Vue (directamente en body) -->
    <!-- Transition: anima entrada y salida del modal -->
    <Teleport to="body">
      <Transition name="modal">
        <!-- Se muestra solo cuando showAddTripModal es true -->
        <div
          v-if="showAddTripModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showAddTripModal = false"
        >
          <!-- Fondo oscuro semitransparente que cierra el modal al hacer click -->
          <div class="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl transform transition-all">
            <!-- Encabezado del modal con título y botón cerrar -->
            <div class="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-100">
              <div class="flex items-center space-x-3">
                <div class="p-3 bg-gradient-to-br from-rumbo-orange to-orange-600 rounded-xl">
                  <Plane :size="28" class="text-white" />
                </div>
                <h3 class="text-2xl font-black uppercase tracking-tight">Nuevo Viaje</h3>
              </div>
              <!-- Botón X para cerrar el modal -->
              <button
                class="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 transform hover:scale-110"
                @click="showAddTripModal = false"
                title="Cerrar"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- FORMULARIO para crear un nuevo viaje -->
            <!-- @submit.prevent previene recarga de página y ejecuta handleAddTrip -->
            <form @submit.prevent="handleAddTrip" class="space-y-6">
              <!-- Campo Título del viaje -->
              <!-- v-model vincula bidireccional con newTrip.title -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Título del viaje
                </label>
                <input
                  v-model="newTrip.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-rumbo-orange focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md"
                  placeholder="Ej: Aventura en Tailandia"
                />
              </div>

              <!-- Campos de fechas en 2 columnas -->
              <div class="grid grid-cols-2 gap-4">
                <!-- Fecha de inicio -->
                <!-- v-model vincula con newTrip.startDate -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Fecha inicio
                  </label>
                  <input
                    v-model="newTrip.startDate"
                    type="date"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-rumbo-orange focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md"
                  />
                </div>

                <!-- Fecha de fin -->
                <!-- v-model vincula con newTrip.endDate -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Fecha fin
                  </label>
                  <input
                    v-model="newTrip.endDate"
                    type="date"
                    required
                    :min="newTrip.startDate"
                    class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-rumbo-orange focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md"
                  />
                </div>
              </div>

              <!-- Botón submit: envía el formulario y crea el viaje -->
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-rumbo-orange to-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
              >
                Crear Viaje
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ========== MODAL: DETALLE DE VIAJE ========== -->
    <!-- Se abre al hacer click en una tarjeta de viaje -->
    <Teleport to="body">
      <Transition name="modal">
        <!-- Se muestra solo cuando selectedTrip tiene un valor -->
        <div
          v-if="selectedTrip"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          @click.self="selectedTrip = null"
        >
          <!-- Contenedor del modal con información del viaje seleccionado -->
          <div class="bg-white rounded-[40px] p-8 max-w-4xl w-full shadow-2xl transform transition-all my-8">
            <!-- Encabezado con título del viaje y fecha -->
            <div class="flex items-center justify-between mb-8">
              <div>
                <!-- Nombre del viaje en grande -->
                <h3 class="text-3xl font-black uppercase tracking-tight">{{ selectedTrip.title }}</h3>
                <!-- Fechas del viaje -->
                <p class="text-gray-500 mt-2">
                  {{ formatDate(selectedTrip.startDate) }} - {{ formatDate(selectedTrip.endDate) }}
                </p>
              </div>
              <!-- Botones de acción: Eliminar y Cerrar -->
              <div class="flex items-center space-x-3">
                <!-- Botón eliminar viaje con estilos mejorados -->
                <button
                  class="p-3 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-200 group shadow-sm hover:shadow-md transform hover:scale-110"
                  @click.stop="deleteTrip(selectedTrip.id); selectedTrip = null"
                  title="Eliminar viaje"
                >
                  <Trash2 :size="20" class="text-red-400 group-hover:text-red-600 transition-colors duration-200" />
                </button>
                <!-- Botón cerrar modal -->
                <button
                  class="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                  @click="selectedTrip = null"
                  title="Cerrar"
                >
                  <X :size="20" class="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                </button>
              </div>
            </div>

            <!-- ========== TABS DE DÍAS ========== -->
            <!-- Muestra un botón para cada día del viaje -->
            <!-- Cada botón cambia selectedDay al hacer click -->
            <div class="flex overflow-x-auto space-x-2 mb-8 pb-4 border-b border-gray-200">
              <!-- v-for itera desde 1 hasta el número de días del viaje -->
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

            <!-- ========== ACTIVIDADES DEL DÍA SELECCIONADO ========== -->
            <!-- Contenedor de actividades y botón para agregar -->
            <div class="space-y-4 mb-8">
              <!-- v-for itera sobre las actividades del día seleccionado -->
              <!-- getActivitiesForDay retorna un array vacío si no hay actividades -->
              <div
                v-for="activity in getActivitiesForDay(selectedTrip, selectedDay)"
                :key="activity.id"
                class="flex items-start space-x-4 p-4 bg-orange-50 rounded-2xl"
              >
                <!-- Icono de reloj en un cuadrado blanco -->
                <div class="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Clock :size="24" class="text-rumbo-orange" />
                </div>
                <!-- Información de la actividad -->
                <div class="flex-1">
                  <!-- Título de la actividad y hora a la derecha -->
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="font-bold text-gray-800">{{ activity.title }}</h4>
                    <span class="text-sm font-bold text-rumbo-orange">{{ activity.time }}</span>
                  </div>
                  <!-- Ubicación con icono de pin -->
                  <p class="text-sm text-gray-600 flex items-center">
                    <MapPin :size="14" class="mr-1" />
                    {{ activity.location }}
                  </p>
                </div>
              </div>

              <!-- Botón para agregar nueva actividad al día seleccionado -->
              <button
                class="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-rumbo-orange hover:text-rumbo-orange transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-orange-50 font-bold"
                @click="showAddActivityModal = true"
              >
                <Plus :size="20" />
                <span>Agregar Actividad</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ========== MODAL: AGREGAR ACTIVIDAD ========== -->
    <!-- Se muestra solo cuando showAddActivityModal es true Y hay un viaje seleccionado -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddActivityModal && selectedTrip"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showAddActivityModal = false"
        >
          <!-- z-[60] aparece encima del modal anterior (z-50) -->
          <div class="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl transform transition-all">
            <!-- Encabezado con título y botón cerrar -->
            <div class="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-100">
              <div class="flex items-center space-x-3">
                <div class="p-3 bg-gradient-to-br from-rumbo-orange to-orange-600 rounded-xl">
                  <Activity :size="28" class="text-white" />
                </div>
                <h3 class="text-2xl font-black uppercase tracking-tight">Nueva Actividad</h3>
              </div>
              <button
                class="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 transform hover:scale-110"
                @click="showAddActivityModal = false"
                title="Cerrar"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- FORMULARIO para crear una nueva actividad -->
            <!-- @submit.prevent ejecuta handleAddActivity sin recargar la página -->
            <form @submit.prevent="handleAddActivity" class="space-y-6">
              <!-- Campo Título de la actividad -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Título
                </label>
                <input
                  v-model="newActivity.title"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-rumbo-orange focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md"
                  placeholder="Ej: Visita al templo"
                />
              </div>

              <!-- Campo Ubicación -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Ubicación
                </label>
                <input
                  v-model="newActivity.location"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-rumbo-orange focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md"
                  placeholder="Ej: Bangkok, Tailandia"
                />
              </div>

              <!-- Campo Hora de la actividad -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Hora
                </label>
                <input
                  v-model="newActivity.time"
                  type="time"
                  required
                  class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-rumbo-orange focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md"
                />
              </div>

              <!-- Botón submit: envía el formulario y crea la actividad -->
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-rumbo-orange to-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
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
// ========== IMPORTACIONES ==========
// ref: crea variables reactivas simples (primitivos)
// reactive: crea objetos reactivos (más complejo)
// computed: calcula valores derivados de variables reactivas
// watch: reacciona a cambios en variables reactivas
import { ref, reactive, computed, watch } from 'vue'

// Importa el store (gestor de estado global con Pinia)
// Aquí se guardan y gestionan todos los viajes y actividades
import { useAppStore } from '@/stores/app'

// Importa iconos de la librería lucide (Plus, Plane, Calendar, etc.)
import { Plus, Plane, Calendar, MapPin, Activity, Trash2, X, Clock } from 'lucide-vue-next'

// Importa tipos de TypeScript para viajes y actividades
import type { Trip, Activity as ActivityType } from '@/types'

// Importa FullCalendar para Vue 3 y sus plugins
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// ========== INSTANCIA DEL STORE ==========
// Acceso a la tienda global de datos (viajes y actividades)
const store = useAppStore()

// ========== VARIABLES REACTIVAS DE CONTROL ==========
// Modo de visualización: 'cards' (tarjetas) o 'calendar' (calendario)
// Vista por defecto es 'cards'
const viewMode = ref<'cards' | 'calendar'>('cards')

// Controla si mostrar u ocultar el modal para crear un viaje
const showAddTripModal = ref(false)

// Controla si mostrar u ocultar el modal para crear una actividad
const showAddActivityModal = ref(false)

// Almacena el viaje que está siendo visualizado (null = ningún viaje seleccionado)
const selectedTrip = ref<Trip | null>(null)

// Almacena el día seleccionado del viaje (comienza en día 1)
const selectedDay = ref(1)

// ========== VARIABLES PARA EL CALENDARIO ==========
// Map que almacena el color asignado a cada viaje
const tripColors = new Map<string, string>()

// Paleta de colores para los viajes (10 colores diferentes)
const colorPalette = [
  '#FF6B6B', // Rojo coral
  '#4ECDC4', // Turquesa
  '#FFD93D', // Amarillo
  '#6C5CE7', // Púrpura
  '#A29BFE', // Lavanda
  '#FF7675', // Rojo claro
  '#00B894', // Verde
  '#FDCB6E', // Naranja
  '#E84393', // Rosa magenta
  '#0984E3'  // Azul
]

// ========== DATOS DEL FORMULARIO: NUEVO VIAJE ==========
// Objeto reactivo que almacena los datos del viaje a crear
// Se resetea después de crear un viaje
const newTrip = reactive({
  title: '',       // Nombre del viaje
  startDate: '',   // Fecha inicio en formato YYYY-MM-DD
  endDate: ''      // Fecha fin en formato YYYY-MM-DD
})

// ========== DATOS DEL FORMULARIO: NUEVA ACTIVIDAD ==========
// Objeto reactivo que almacena los datos de la actividad a crear
// Se resetea después de crear una actividad
const newActivity = reactive({
  title: '',       // Nombre de la actividad
  location: '',    // Ubicación de la actividad
  time: ''         // Hora en formato HH:mm
})

// ========== FUNCIÓN AUXILIAR: OBTENER COLOR DEL VIAJE ==========
/**
 * getTripColor(tripId):
 * - Asigna un color único a cada viaje
 * - Si el viaje ya tiene color asignado, lo retorna
 * - Si no, asigna uno de la paleta y lo guarda
 */
function getTripColor(tripId: string): string {
  if (!tripColors.has(tripId)) {
    tripColors.set(tripId, colorPalette[tripColors.size % colorPalette.length])
  }
  return tripColors.get(tripId) || colorPalette[0]
}

// ========== COMPUTED: EVENTOS DEL CALENDARIO ==========
/**
 * calendarEvents (computed):
 * - Transforma los viajes del store en eventos de FullCalendar
 * - Cada viaje se convierte en un evento que ocupa desde startDate hasta endDate
 * - Incluye metadatos del viaje para poder recuperarlo al hacer click
 * - Se recalcula automáticamente cuando cambian los viajes en el store
 */
const calendarEvents = computed(() => {
  return store.trips.map((trip) => {
    return {
      id: trip.id,
      title: trip.title,
      start: trip.startDate,
      end: new Date(new Date(trip.endDate).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // +1 día para incluir el último día
      backgroundColor: getTripColor(trip.id),
      borderColor: getTripColor(trip.id),
      textColor: '#fff',
      extendedProps: {
        tripId: trip.id,
        trip: trip // Almacena el objeto Trip completo
      },
      display: 'block'
    }
  })
})

// ========== COMPUTED: OPCIONES DEL CALENDARIO ==========
/**
 * calendarOptions (computed):
 * - Configuración de FullCalendar
 * - Incluye plugins, idioma, eventos, manejadores, etc.
 * - Se recalcula cuando cambiam los eventos (via calendarEvents)
 */
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  events: calendarEvents.value,
  eventClick: handleEventClick,
  locale: 'es',
  eventDisplay: 'block'
}))

// ========== MANEJADORES DE EVENTOS DEL CALENDARIO ==========
/**
 * handleEventClick(info):
 * - Se ejecuta cuando hace click en un evento del calendario
 * - Extrae el viaje del evento
 * - Abre el modal de detalle del viaje
 */
function handleEventClick(info: any) {
  const trip = info.event.extendedProps.trip
  if (trip) {
    selectTrip(trip)
  }
}

// ========== FUNCIÓN: CREAR UN NUEVO VIAJE ==========
/**
 * handleAddTrip():
 * - Crea un objeto Trip con los datos del formulario
 * - genera un ID único basado en timestamp
 * - Añade el viaje al store
 * - Cierra el modal
 * - Limpia el formulario
 */
function handleAddTrip() {
  const trip: Trip = {
    id: Date.now().toString(),  // ID único = timestamp actual
    title: newTrip.title,        // Título ingresado en el formulario
    startDate: newTrip.startDate,// Fecha inicio ingresada
    endDate: newTrip.endDate,    // Fecha fin ingresada
    activities: {}               // Inicia sin actividades
  }

  // Añade el viaje a la tienda global
  store.addTrip(trip)
  
  // Cierra el modal
  showAddTripModal.value = false
  
  // Limpia el formulario para la próxima vez
  newTrip.title = ''
  newTrip.startDate = ''
  newTrip.endDate = ''
}

// ========== FUNCIÓN: CREAR UNA NUEVA ACTIVIDAD ==========
/**
 * handleAddActivity():
 * - Valida que hay un viaje seleccionado
 * - Crea un objeto Activity con los datos del formulario
 * - Genera un ID único basado en timestamp
 * - Añade la actividad al store en el viaje y día seleccionado
 * - Cierra el modal
 * - Limpia el formulario
 * - Refresca los datos del viaje seleccionado
 */
function handleAddActivity() {
  // Valida que hay un viaje seleccionado (seguridad)
  if (!selectedTrip.value) return

  const activity: ActivityType = {
    id: Date.now().toString(),       // ID único = timestamp actual
    title: newActivity.title,        // Título ingresado
    location: newActivity.location,  // Ubicación ingresada
    time: newActivity.time           // Hora ingresada en formato HH:mm
  }

  // Añade la actividad al store: viaje y día específicos
  store.addActivity(selectedTrip.value.id, selectedDay.value, activity)
  
  // Cierra el modal
  showAddActivityModal.value = false

  // Limpia el formulario para la próxima vez
  newActivity.title = ''
  newActivity.location = ''
  newActivity.time = ''

  // Refresca los datos del viaje seleccionado (actualiza en pantalla)
  // Busca el viaje en el store y actualiza selectedTrip con los datos nuevos
  selectedTrip.value = store.trips.find(t => t.id === selectedTrip.value?.id) || null
}

// ========== FUNCIÓN: SELECCIONAR UN VIAJE ==========
/**
 * selectTrip(trip):
 * - Abre el modal de detalle del viaje
 * - Resetea el contador al día 1
 * - Prepara la vista para mostrar las actividades del viaje
 */
function selectTrip(trip: Trip) {
  selectedTrip.value = trip  // Asigna el viaje como seleccionado
  selectedDay.value = 1      // Comienza en el día 1
}

// ========== FUNCIÓN: ELIMINAR UN VIAJE ==========
/**
 * deleteTrip(id):
 * - Pide confirmación al usuario
 * - Si confirma, elimina el viaje del store
 */
function deleteTrip(id: string) {
  // Muestra un diálogo de confirmación
  if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
    store.deleteTrip(id)  // Elimina el viaje del store
  }
}

// ========== FUNCIÓN AUXILIAR: FORMATEAR FECHA ==========
/**
 * formatDate(dateStr):
 * - Convierte una fecha en formato YYYY-MM-DD a "25 dic"
 * - Ejemplo: "2024-12-25" → "25 dic"
 * - Usa locales en español
 */
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  // toLocaleDateString en español: { day: 'numeric', month: 'short' }
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// ========== FUNCIÓN AUXILIAR: CONTAR DÍAS DEL VIAJE ==========
/**
 * getDaysCount(trip):
 * - Calcula la diferencia en días entre fecha inicio y fin
 * - Suma 1 para incluir ambos días
 * - Ejemplo: 1 dic a 5 dic = 5 días (no 4)
 */
function getDaysCount(trip: Trip) {
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  // Calcula diferencia en milisegundos
  const diffTime = Math.abs(end.getTime() - start.getTime())
  // Convierte milisegundos a días (1000ms * 60s * 60m * 24h)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  // Suma 1 para incluir el día de inicio y fin
  return diffDays + 1
}

// ========== FUNCIÓN AUXILIAR: CONTAR ACTIVIDADES ==========
/**
 * getActivitiesCount(trip):
 * - Suma TODAS las actividades de todos los días del viaje
 * - trip.activities = { 1: [act1, act2], 2: [act3], ... }
 * - Retorna el total de actividades
 */
function getActivitiesCount(trip: Trip) {
  // Object.values(trip.activities) retorna arrays de actividades
  // reduce suma el largo de cada array
  return Object.values(trip.activities).reduce((sum, activities) => sum + activities.length, 0)
}

// ========== FUNCIÓN AUXILIAR: GET ACTIVIDADES DE UN DÍA ==========
/**
 * getActivitiesForDay(trip, day):
 * - Retorna las actividades de un día específico del viaje
 * - Si no hay actividades ese día, retorna un array vacío
 * - Ejemplo: day=1 devuelve trip.activities[1]
 */
function getActivitiesForDay(trip: Trip, day: number) {
  return trip.activities[day] || []  // Retorna actividades o array vacío
}

// ========== WATCHER: REACTUALIZAR CALENDARIO ==========
/**
 * watch(store.trips):
 * - Observa cambios en los viajes del store
 * - Reactualiza automáticamente el calendario cuando cambian
 * - El computed de calendarEvents se recalcula automáticamente
 */
watch(() => store.trips, () => {
  // El calendario se actualiza automáticamente via calendarEvents computed
}, { deep: true })
</script>

<style scoped>
/* ========== ANIMACIONES PARA MODALES ========== */

/* Animación activa: aplica transición suave de 0.3s cuando entra o sale */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

/* Estado inicial y final de la animación: invisible y 90% del tamaño */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;           /* Transparencia total */
  transform: scale(0.9); /* 90% del tamaño original */
}

/* ========== ANIMACIONES PARA TARJETAS ========== */

/* Animación de entrada para las tarjetas */
.trip-card-enter-active {
  transition: all 0.3s ease;
}

.trip-card-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* ========== ESTILOS DE GRID RESPONSIVE ========== */

/* Contenedor de tarjetas con auto-layout y gap personalizado */
.trips-grid {
  display: grid;
  grid-auto-flow: row;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ========== ESTILOS DE FULLCALENDAR ========== */

/* Contenedor general del calendario */
:deep(.fc) {
  font-family: inherit;
  color: #1f2937;
}

/* Encabezado del calendario (título, botones de navegación) */
:deep(.fc-header-toolbar) {
  background: linear-gradient(135deg, #fff5f0 0%, #faf5ff 100%);
  padding: 2rem;
  border-bottom: 2px solid #fbbf24;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 0;
}

/* Botones de navegación del calendario */
:deep(.fc-button-primary) {
  background-color: #ff6b35;
  border-color: #ff6b35;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

:deep(.fc-button-primary:hover) {
  background-color: #ff5722;
  border-color: #ff5722;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transform: translateY(-2px);
}

:deep(.fc-button-primary.fc-button-active) {
  background-color: #ff5722;
  border-color: #ff5722;
}

/* Título del mes/año */
:deep(.fc-toolbar-title) {
  font-size: 1.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: #1f2937;
}

/* Encabezados de días de la semana */
:deep(.fc-col-header-cell) {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.85rem;
  padding: 1.25rem 0.5rem;
  letter-spacing: 0.1em;
  border-color: #d1d5db;
}

/* Celdas del calendario */
:deep(.fc-daycell) {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 0;
  min-height: 130px;
}

:deep(.fc-daycell:hover) {
  background-color: #f9fafb;
}

/* Frame de la celda (contenedor interno) */
:deep(.fc-daycell-frame) {
  padding: 0.75rem;
  height: 100%;
}

/* Número del día */
:deep(.fc-daycell-bg + .fc-daycell-frame) {
  padding: 0.75rem;
}

/* Eventos en el calendario */
:deep(.fc-event) {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  margin: 0.5rem 0;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
  background-clip: padding-box;
}

:deep(.fc-event:hover) {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  transform: translateY(-3px);
}

/* Contenedor del evento */
:deep(.fc-event-main) {
  padding: 0.5rem 0.75rem;
}

/* Título del evento */
:deep(.fc-event-title) {
  font-weight: 800;
  white-space: normal;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 0.95rem;
}

/* Borde izquierdo del evento */
:deep(.fc-event-main::before) {
  content: '';
  display: inline-block;
  width: 4px;
  height: 100%;
  margin-right: 0.5rem;
  border-radius: 2px;
}

/* Día actual (hoy) */
:deep(.fc-day-today) {
  background-color: #fffbeb !important;
  border: 2px solid #ff6b35 !important;
}

/* Número de día para hoy */
:deep(.fc-day-today .fc-daycell-frame) {
  background-color: transparent;
}

/* Fin de semana */
:deep(.fc-day-sun),
:deep(.fc-day-sat) {
  background-color: #fafafa;
}

/* Columna de otros meses */
:deep(.fc-day-other) {
  opacity: 0.6;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  :deep(.fc-toolbar-title) {
    font-size: 1.5rem;
  }

  :deep(.fc-header-toolbar) {
    padding: 1.5rem;
  }

  :deep(.fc-col-header-cell) {
    font-size: 0.75rem;
    padding: 1rem 0.25rem;
  }

  :deep(.fc-daycell) {
    min-height: 110px;
  }

  :deep(.fc-daycell-frame) {
    padding: 0.5rem;
  }

  :deep(.fc-event-title) {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  :deep(.fc-toolbar-title) {
    font-size: 1.25rem;
  }

  :deep(.fc-header-toolbar) {
    padding: 1.25rem;
    gap: 1rem;
  }

  :deep(.fc-col-header-cell) {
    font-size: 0.65rem;
    padding: 0.75rem 0.2rem;
  }

  :deep(.fc-daycell) {
    min-height: 90px;
  }

  :deep(.fc-daycell-frame) {
    padding: 0.4rem;
  }

  :deep(.fc-event-title) {
    font-size: 0.7rem;
  }

  :deep(.fc-header-toolbar) {
    flex-direction: column;
    gap: 0.75rem;
  }

  :deep(.fc-button-primary) {
    padding: 0.6rem 1rem;
    font-size: 0.75rem;
  }
}
</style>
