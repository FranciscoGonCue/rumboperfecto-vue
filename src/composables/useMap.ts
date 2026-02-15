import { ref, onMounted, onUnmounted } from 'vue'
import type { MapLocation } from '@/types'
import L from 'leaflet'

export function useMap(containerId: string) {
  const map = ref<L.Map | null>(null)
  const markers = ref<L.Marker[]>([])
  const isLoaded = ref(false)

  async function initMap(center: [number, number] = [40.4168, -3.7038]) {
    try {
      // Inicializar mapa de Leaflet
      map.value = L.map(containerId).setView(center, 6)

      // Usar OpenStreetMap como proveedor de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map.value)

      isLoaded.value = true
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  function addMarker(location: MapLocation) {
    if (!map.value) return

    const marker = L.marker([location.lat, location.lng])
      .addTo(map.value)
      .bindPopup(`<b>${location.title}</b><br>${location.description || ''}`)

    markers.value.push(marker)
  }

  function clearMarkers() {
    markers.value.forEach(marker => marker.remove())
    markers.value = []
  }

  function flyTo(lat: number, lng: number, zoom = 13) {
    if (map.value) {
      map.value.flyTo([lat, lng], zoom, {
        duration: 1.5
      })
    }
  }

  async function searchPlaces(query: string) {
    try {
      // Usar Nominatim API de OpenStreetMap para búsqueda
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      
      return data.map((place: any) => ({
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        title: place.display_name,
        description: place.type
      }))
    } catch (error) {
      console.error('Error searching places:', error)
      return []
    }
  }

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
    }
  })

  return {
    map,
    markers,
    isLoaded,
    initMap,
    addMarker,
    clearMarkers,
    flyTo,
    searchPlaces
  }
}
