<template>
  <div class="relative lg:flex w-full overflow-x-visible" :class="mapExpanded ? 'h-screen' : 'lg:h-[calc(100vh-80px)]'">
    <!-- MAP PANEL (expands when active) -->
    <div 
      class="relative transition-all duration-700 ease-in-out overflow-hidden shadow-2xl z-10"
      :class="[
        mapExpanded 
          ? 'h-screen w-full lg:w-[75%]' 
          : 'h-[25vh] lg:h-full lg:w-[20%]'
      ]"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Mobile Overlay Text (hide when expanded) -->
      <Transition name="fade">
        <div 
          v-if="!mapExpanded"
          class="lg:hidden absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 z-20 pointer-events-none"
        >
          <h2 class="text-white text-3xl font-black uppercase tracking-tighter leading-none">
            Explora el <br />Mundo
          </h2>
          <!-- Swipe Up Indicator -->
          <div class="mt-4 flex items-center space-x-2 text-white/80">
            <div class="w-1 h-6 bg-white/60 rounded-full animate-bounce" />
            <span class="text-xs font-bold uppercase tracking-wider">Desliza hacia arriba</span>
          </div>
        </div>
      </Transition>

      <!-- Interactive Leaflet Map -->
      <div id="map" class="h-full w-full" />

      <!-- Desktop Map UI Elements (hide when expanded) -->
      <Transition name="fade">
        <div 
          v-if="!mapExpanded"
          class="hidden lg:flex absolute top-10 left-10 right-10 flex-col space-y-4 pointer-events-none z-[1000]"
        >
          <div class="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100 flex items-center space-x-4 pointer-events-auto">
            <div class="bg-orange-500 p-3 rounded-2xl text-white shadow-lg">
              <MapPin :size="24" />
            </div>
            <div>
              <h3 class="font-black text-gray-800 uppercase text-lg tracking-tight">Tu próxima aventura</h3>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Encuentra planes en el mapa</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Exit Map Mode Button (show when expanded) -->
      <Transition name="fade">
        <button
          v-if="mapExpanded"
          @click="exitMapMode"
          class="absolute top-4 z-[1000] flex items-center space-x-2 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl hover:bg-white transition-all group"
          :class="isMobile ? 'left-6' : 'left-6'"
        >
          <X :size="20" class="text-gray-700" />
          <span class="font-bold text-gray-700 uppercase text-sm tracking-wider">Salir</span>
        </button>
      </Transition>

      <!-- Mobile Menu Toggle (show when expanded on mobile/tablet) -->
      <Transition name="fade">
        <button
          v-if="false"
          @click="toggleMobileSidebar"
          class="absolute top-6 right-6 z-[1000] bg-orange-500 text-white p-4 rounded-2xl shadow-2xl hover:bg-orange-600 transition-all"
        >
          <Menu v-if="!showMobileSidebar" :size="24" />
          <X v-else :size="24" />
        </button>
      </Transition>
    </div>

    <!-- RIGHT PANEL: FEED & CONTENT (or SIDEBAR when map expanded) — sin Transition mode out-in (evita panel invisible) -->
      <!-- FEED VIEW (default) -->
      <div 
        v-if="!mapExpanded"
        key="feed"
        class="w-full lg:w-[80%] lg:h-full overflow-y-auto bg-white lg:rounded-l-[60px] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] relative z-20"
      >
        <div class="pb-32 lg:pb-12 pt-6 lg:pt-12 px-6 lg:px-12">
          <!-- Search Bar -->
          <div class="relative mb-10 -mt-12 lg:mt-0 lg:max-w-xl">
            <div class="flex items-center bg-white lg:bg-gray-50 rounded-3xl px-6 py-5 shadow-[0_15px_30px_rgba(0,0,0,0.08)] lg:shadow-none border border-gray-100 lg:border-transparent lg:focus-within:border-orange-200 transition-all">
              <Search :size="22" class="text-rumbo-orange mr-4" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Busca tu próximo destino..."
                class="flex-1 outline-none text-base font-medium text-gray-700 bg-transparent placeholder:text-gray-400"
                @keyup.enter="handleSearch"
              />
              <button
                class="hidden lg:flex bg-orange-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 ml-4 cursor-pointer hover:bg-orange-600 transition-colors"
                @click="handleSearch"
              >
                Buscar
              </button>
            </div>
          </div>

          <!-- Categories Grid -->
          <div class="grid grid-cols-3 gap-4 mb-12">
            <button
              v-for="(cat, idx) in categories"
              :key="idx"
              class="flex flex-col items-center justify-center space-y-3 p-6 rounded-[32px] transition-all shadow-sm border border-transparent hover:border-orange-100 hover:shadow-xl group"
              :class="cat.color"
              @click="filterByCategory(cat.label)"
            >
              <div class="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                <component :is="cat.icon" :size="28" />
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest">{{ cat.label }}</span>
            </button>
          </div>

          <!-- Feed Section -->
          <div class="space-y-8">
            <div class="flex items-end justify-between">
              <div>
                <h3 class="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                  Ofertas <br />Destacadas
                </h3>
                <div class="h-1.5 w-12 bg-orange-500 rounded-full mt-3" />
              </div>
              <button class="text-xs font-black text-rumbo-orange uppercase tracking-widest border-b-2 border-orange-200 pb-1">
                Ver todos
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              <TransitionGroup name="feed">
                <div
                  v-for="item in filteredItems"
                  :key="item.id"
                  class="relative rounded-[40px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.06)] bg-white border border-gray-50 group cursor-pointer hover:-translate-y-2 transition-transform duration-300"
                >
                  <div class="relative h-64 overflow-hidden">
                    <img
                      :src="item.img"
                      :alt="item.title"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div class="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                      <Star :size="12" class="fill-orange-500 text-orange-500" />
                      <span class="text-[10px] font-black text-gray-800">{{ item.rating }}</span>
                    </div>
                    <button
                      class="absolute top-5 right-5 p-3 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all"
                      @click.stop="toggleFavorite(item.id)"
                    >
                      <Heart :size="20" :class="{ 'fill-red-500 text-red-500': favorites.includes(item.id) }" />
                    </button>
                  </div>
                  <div class="p-8">
                    <h4 class="text-xl font-black text-gray-800 uppercase tracking-tight leading-tight mb-2">
                      {{ item.title }}
                    </h4>
                    <div class="flex justify-between items-center mt-6">
                      <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desde</span>
                        <span class="text-rumbo-orange font-black text-2xl tracking-tighter">{{ item.price }}</span>
                      </div>
                      <button class="p-4 bg-gray-50 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                        <Compass :size="24" />
                      </button>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <!-- MAP SIDEBAR (when map is expanded) -->
      <div 
        v-else
        key="sidebar"
        class="bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.1)] relative z-20 overflow-y-auto"
        :class="isMobile ? 'hidden' : 'lg:block lg:w-[25%] lg:h-full'"
      >
        <div class="p-6 h-full flex flex-col">
          <!-- Header -->
          <div class="mb-8">
            <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">
              Navegación
            </h2>
            <div class="h-1 w-12 bg-orange-500 rounded-full" />
          </div>

          <!-- Map Controls Section -->
          <div class="space-y-4 mb-8">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Vista del Mapa</h3>
            
            <button
              v-for="view in mapViews.filter(v => v.id === 'world')"
              :key="view.id"
              @click="changeMapView(view.id)"
              class="w-full flex items-center space-x-4 p-4 rounded-2xl transition-all border-2"
              :class="currentMapView === view.id 
                ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-100' 
                : 'bg-gray-50 border-transparent hover:border-orange-200 hover:bg-orange-50'"
            >
              <div 
                class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                :class="currentMapView === view.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'"
              >
                <component :is="view.icon" :size="24" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-black text-sm uppercase tracking-tight text-gray-800">{{ view.label }}</div>
                <div class="text-xs text-gray-500">{{ view.description }}</div>
              </div>
            </button>
          </div>

          <!-- Filters Section -->
          <div class="space-y-4 mb-8">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Filtrar por</h3>
            
            <button
              v-for="cat in categories"
              :key="cat.label"
              @click="filterByCategory(cat.label)"
              class="w-full flex items-center space-x-4 p-4 rounded-2xl transition-all border-2"
              :class="selectedCategory === cat.label
                ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-100'
                : 'bg-gray-50 border-transparent hover:border-orange-200'"
            >
              <div 
                class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                :class="cat.color"
              >
                <component :is="cat.icon" :size="20" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-black text-sm uppercase tracking-tight text-gray-800">{{ cat.label }}</div>
              </div>
              <div 
                v-if="selectedCategory === cat.label"
                class="w-2 h-2 bg-orange-500 rounded-full"
              />
            </button>
          </div>

          <!-- Destinations List -->
          <div class="flex-1 space-y-4">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Destinos ({{ filteredItems.length }})</h3>
            
            <div class="space-y-3">
              <button
                v-for="item in filteredItems"
                :key="item.id"
                @click="focusOnDestination(item)"
                class="w-full flex items-start space-x-3 p-3 rounded-xl hover:bg-orange-50 transition-all group"
              >
                <img 
                  :src="item.img" 
                  :alt="item.title"
                  class="w-16 h-16 rounded-lg object-cover shadow-sm"
                />
                <div class="flex-1 text-left">
                  <div class="font-bold text-xs uppercase tracking-tight text-gray-800 mb-1">{{ item.title }}</div>
                  <div class="flex items-center justify-between">
                    <span class="text-orange-500 font-black text-sm">{{ item.price }}</span>
                    <span class="text-xs text-gray-500">⭐ {{ item.rating }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Reset Button -->
          <button
            @click="resetFilters"
            class="mt-6 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm uppercase tracking-wider text-gray-700 transition-all"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

    <!-- MOBILE/TABLET SIDEBAR (slides from right) -->
    <Transition name="slide-right">
      <div
        v-if="mapExpanded && showMobileSidebar && isMobile"
        class="fixed top-0 right-0 bottom-0 w-[85%] sm:w-[70%] md:w-[400px] bg-white shadow-2xl z-[2000] overflow-y-auto"
      >
        <div class="p-6 h-full flex flex-col">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-black text-gray-800 uppercase tracking-tight">
                Navegación
              </h2>
              <button
                @click="showMobileSidebar = false"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X :size="24" class="text-gray-700" />
              </button>
            </div>
            <div class="h-1 w-12 bg-orange-500 rounded-full" />
          </div>

          <!-- Map Controls Section -->
          <div class="space-y-3 mb-6">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Vista del Mapa</h3>
            
            <button
              v-for="view in mapViews.filter(v => v.id === 'world')"
              :key="view.id"
              @click="changeMapView(view.id); showMobileSidebar = false"
              class="w-full flex items-center space-x-3 p-3 rounded-xl transition-all border-2"
              :class="currentMapView === view.id 
                ? 'bg-orange-50 border-orange-500 shadow-md shadow-orange-100' 
                : 'bg-gray-50 border-transparent hover:border-orange-200'"
            >
              <div 
                class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                :class="currentMapView === view.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'"
              >
                <component :is="view.icon" :size="20" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-black text-xs uppercase tracking-tight text-gray-800">{{ view.label }}</div>
                <div class="text-[10px] text-gray-500">{{ view.description }}</div>
              </div>
            </button>
          </div>

          <!-- Filters Section -->
          <div class="space-y-3 mb-6">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Filtrar por</h3>
            
            <button
              v-for="cat in categories"
              :key="cat.label"
              @click="filterByCategory(cat.label)"
              class="w-full flex items-center space-x-3 p-3 rounded-xl transition-all border-2"
              :class="selectedCategory === cat.label
                ? 'bg-orange-50 border-orange-500 shadow-md shadow-orange-100'
                : 'bg-gray-50 border-transparent hover:border-orange-200'"
            >
              <div 
                class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                :class="cat.color"
              >
                <component :is="cat.icon" :size="18" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-black text-xs uppercase tracking-tight text-gray-800">{{ cat.label }}</div>
              </div>
              <div 
                v-if="selectedCategory === cat.label"
                class="w-2 h-2 bg-orange-500 rounded-full"
              />
            </button>
          </div>

          <!-- Destinations List -->
          <div class="flex-1 space-y-3 mb-4">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Destinos ({{ filteredItems.length }})</h3>
            
            <div class="space-y-2">
              <button
                v-for="item in filteredItems"
                :key="item.id"
                @click="focusOnDestination(item); showMobileSidebar = false"
                class="w-full flex items-start space-x-3 p-3 rounded-xl hover:bg-orange-50 transition-all"
              >
                <img 
                  :src="item.img" 
                  :alt="item.title"
                  class="w-14 h-14 rounded-lg object-cover shadow-sm"
                />
                <div class="flex-1 text-left">
                  <div class="font-bold text-xs uppercase tracking-tight text-gray-800 mb-1">{{ item.title }}</div>
                  <div class="flex items-center justify-between">
                    <span class="text-orange-500 font-black text-xs">{{ item.price }}</span>
                    <span class="text-[10px] text-gray-500">⭐ {{ item.rating }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Reset Button -->
          <button
            @click="resetFilters"
            class="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm uppercase tracking-wider text-gray-700 transition-all"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </Transition>

    <!-- Overlay for mobile sidebar -->
    <Transition name="fade">
      <div
        v-if="mapExpanded && showMobileSidebar && isMobile"
        @click="showMobileSidebar = false"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1999]"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Search, Hotel, Compass, Utensils, Heart, MapPin, Star, X, Globe, Navigation, Layers, Menu } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const categories = [
  { icon: Hotel, label: 'Hoteles', color: 'bg-blue-50 text-blue-500' },
  { icon: Compass, label: 'Aventuras', color: 'bg-emerald-50 text-emerald-500' },
  { icon: Utensils, label: 'Comida', color: 'bg-orange-50 text-rumbo-orange' }
]

const mapViews = [
  { id: 'world', label: 'Vista Mundial', description: 'Todos los destinos', icon: Globe },
  { id: 'routes', label: 'Rutas', description: 'Conectar destinos', icon: Navigation },
  { id: 'clusters', label: 'Agrupados', description: 'Por región', icon: Layers }
]

const feedItems = [
  { id: 1, title: 'Escapada a Bali', price: '$450', rating: 4.8, category: 'Aventuras', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80', lat: -8.3405, lng: 115.0920 },
  { id: 2, title: 'Ruta Gastronómica', price: '$80', rating: 4.9, category: 'Comida', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', lat: 41.3851, lng: 2.1734 },
  { id: 3, title: 'Aventura en los Alpes', price: '$220', rating: 4.7, category: 'Aventuras', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80', lat: 46.5197, lng: 7.9738 },
  { id: 4, title: 'Playa Secreta', price: '$150', rating: 4.5, category: 'Hoteles', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', lat: 18.7883, lng: -98.9856 },
  { id: 5, title: 'Safari en Kenya', price: '$890', rating: 5.0, category: 'Aventuras', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80', lat: -1.2921, lng: 36.8219 },
  { id: 6, title: 'Luces de Tokyo', price: '$540', rating: 4.6, category: 'Hoteles', img: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d82?auto=format&fit=crop&w=400&q=80', lat: 35.6762, lng: 139.6503 }
]

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const favorites = ref<number[]>([])
const mapExpanded = ref(false)
const currentMapView = ref('world')
const showMobileSidebar = ref(false)
const isMobile = ref(false)

watch(mapExpanded, (expanded) => {
  document.documentElement.classList.toggle('map-expanded', expanded)
})
let map: L.Map | null = null
const markers: L.Marker[] = []

// Vista por defecto al entrar: acercar Europa.
const europeCenter: [number, number] = [50, 10]
const europeZoom = 4

// Touch gesture handling
let touchStartY = 0
let touchStartTime = 0

const filteredItems = computed(() => {
  let items = feedItems

  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => item.title.toLowerCase().includes(query))
  }

  return items
})

function checkIsMobile() {
  isMobile.value = window.innerWidth < 1024 // lg breakpoint
}

function handleTouchStart(event: TouchEvent) {
  if (mapExpanded.value || !isMobile.value) return
  
  touchStartY = event.touches[0].clientY
  touchStartTime = Date.now()
}

function handleTouchMove(event: TouchEvent) {
  if (mapExpanded.value || !isMobile.value) return
  
  const currentY = event.touches[0].clientY
  const deltaY = touchStartY - currentY
  
  // Si el deslizamiento es hacia arriba y suficientemente largo
  if (deltaY > 50) {
    // Prevenir el scroll normal
    event.preventDefault()
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (mapExpanded.value || !isMobile.value) return
  
  const touchEndY = event.changedTouches[0].clientY
  const deltaY = touchStartY - touchEndY
  const deltaTime = Date.now() - touchStartTime
  
  // Swipe hacia arriba: deltaY positivo > 50px y duración < 300ms
  if (deltaY > 50 && deltaTime < 300) {
    mapExpanded.value = true
    // Pequeño delay para suavizar la transición
    setTimeout(() => {
      map?.invalidateSize()
    }, 750)
  }
}

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value
}

function handleSearch() {
  console.log('Searching for:', searchQuery.value)
}

function filterByCategory(category: string) {
  if (selectedCategory.value === category) {
    selectedCategory.value = null
    showAllMarkers()
  } else {
    selectedCategory.value = category
    filterMarkersByCategory(category)
  }
}

function toggleFavorite(id: number) {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }
}

function exitMapMode() {
  mapExpanded.value = false
  showMobileSidebar.value = false
  
  // Reset view to Europe with animation
  if (map) {
    setTimeout(() => {
      map?.setView(europeCenter, europeZoom, { animate: true, duration: 1 })
      map?.invalidateSize()
    }, 750)
  }
}

function changeMapView(_viewId: string) {
  // Solo se permite la vista mundial.
  // Aunque se llame con otro id (por ejemplo por un click viejo o por código),
  // forzamos siempre la vista 'world'.
  currentMapView.value = 'world'
  
  if (!map) return

  map.setView(europeCenter, europeZoom, { animate: true, duration: 1 })
}

function focusOnDestination(item: typeof feedItems[0]) {
  if (!map) return
  
  map.setView([item.lat, item.lng], 8, { animate: true, duration: 1 })
  
  // Find and open the popup for this destination
  markers.forEach(marker => {
    const latlng = marker.getLatLng()
    if (latlng.lat === item.lat && latlng.lng === item.lng) {
      marker.openPopup()
    }
  })
}

function filterMarkersByCategory(category: string) {
  markers.forEach((marker, index) => {
    const item = feedItems[index]
    if (item.category === category) {
      marker.setOpacity(1)
    } else {
      marker.setOpacity(0.2)
    }
  })
}

function showAllMarkers() {
  markers.forEach(marker => {
    marker.setOpacity(1)
  })
}

function resetFilters() {
  selectedCategory.value = null
  searchQuery.value = ''
  showAllMarkers()
  if (map) {
    map.setView(europeCenter, europeZoom, { animate: true, duration: 1 })
  }
  currentMapView.value = 'world'
}

function initMap() {
  const el = document.getElementById('map')
  if (!el) {
    console.warn('[HomeView] #map no encontrado; mapa omitido')
    return
  }

  try {
  // Inicializar el mapa centrado en el mundo
  map = L.map('map', {
    center: europeCenter,
    zoom: europeZoom,
    // Límite de zoom hacia afuera (zoom inverso).
    // En Leaflet: zoom más bajo = más “zoom out”.
    minZoom: 2,
    // Acotar el mapa al “mundo” (evita salir de los límites pero con un margen
    // mayor para que no se vean bordes en gris).
    maxBounds: [
      [-89, -180],
      [89, 180],
    ],
    maxBoundsViscosity: 1.0,
    zoomControl: false,
    scrollWheelZoom: true,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    boxZoom: false,
    keyboard: true
  })

  // Zoom buttons (+ / -) en la esquina inferior izquierda
  L.control.zoom({ position: 'bottomleft' }).addTo(map)

  // Asegura que maxBounds quede aplicado incluso si Leaflet lo resuelve tardíamente.
  map.setMaxBounds([
    [-89, -180],
    [89, 180],
  ])

  // Añadir capa de tiles de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)

  // Crear icono personalizado naranja
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; background: rgba(249, 115, 22, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
        <div style="width: 16px; height: 16px; background: #f97316; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 1;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })

  // Añadir marcadores para cada destino
  feedItems.forEach(item => {
    const marker = L.marker([item.lat, item.lng], { icon: customIcon })
      .addTo(map!)
      .bindPopup(`
        <div style="min-width: 200px;">
          <img src="${item.img}" alt="${item.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />
          <h4 style="font-weight: 800; font-size: 14px; text-transform: uppercase; margin-bottom: 4px; color: #1f2937;">${item.title}</h4>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${item.category}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 800; font-size: 18px; color: #f97316;">${item.price}</span>
            <span style="font-size: 12px; color: #6b7280;">⭐ ${item.rating}</span>
          </div>
        </div>
      `, {
        maxWidth: 250,
        className: 'custom-popup'
      })
    
    markers.push(marker)
  })

  // Detectar interacción con el mapa para expandirlo (solo desktop)
  if (!isMobile.value) {
    map.on('movestart', () => {
      if (!mapExpanded.value) {
        mapExpanded.value = true
      }
    })

    map.on('zoomstart', () => {
      if (!mapExpanded.value) {
        mapExpanded.value = true
      }
    })

    map.on('click', () => {
      if (!mapExpanded.value) {
        mapExpanded.value = true
      }
    })
  }

  // Invalidar el tamaño del mapa después de la transición
  setTimeout(() => {
    map?.invalidateSize()
  }, 100)
  } catch (e) {
    console.error('[HomeView] Error al inicializar Leaflet', e)
  }
}

// Watch for map expansion to invalidate size
let resizeTimeout: ReturnType<typeof setTimeout>
onMounted(() => {
  // Check if mobile
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)

  setTimeout(() => {
    initMap()
  }, 100)

  // Observer para detectar cambios de tamaño
  const observer = new MutationObserver(() => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      map?.invalidateSize()
    }, 750)
  })

  const mapElement = document.getElementById('map')
  if (mapElement?.parentElement) {
    observer.observe(mapElement.parentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
  if (map) {
    map.remove()
    map = null
  }

  document.documentElement.classList.remove('map-expanded')
})
</script>

<style scoped>
.feed-enter-active,
.feed-leave-active {
  transition: all 0.5s ease;
}

.feed-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.feed-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide panel transition */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.7s ease-in-out;
}

.slide-panel-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* Slide from right (mobile sidebar) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* Swipe indicator animation */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* Estilos para el mapa */
#map {
  position: relative;
  z-index: 1;
}

/* Colocar el control de zoom en la esquina inferior izquierda */
:deep(.leaflet-control-zoom) {
  top: auto !important;
  bottom: 24px !important;
  left: 16px !important;
}

/* Animación de pulso para los marcadores */
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Estilos personalizados para los popups */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 20px !important;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #fef3c7 !important;
}

:deep(.leaflet-popup-tip) {
  background: white !important;
  border: 1px solid #fef3c7 !important;
}

:deep(.leaflet-popup-content) {
  margin: 12px !important;
}

/* Estilos para los controles de zoom */
:deep(.leaflet-control-zoom) {
  border: none !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

:deep(.leaflet-control-zoom a) {
  width: 40px !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 20px !important;
  border: none !important;
  background: white !important;
  color: #f97316 !important;
  font-weight: bold !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #f97316 !important;
  color: white !important;
}

:deep(.leaflet-control-zoom a:first-child) {
  border-bottom: 1px solid #f3f4f6 !important;
}

/* Scrollbar personalizado para el sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #f97316;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #ea580c;
}

/* Prevent body scroll when mobile sidebar is open */
body:has(.slide-right-enter-active),
body:has(.slide-right-leave-active) {
  overflow: hidden;
}
</style>
