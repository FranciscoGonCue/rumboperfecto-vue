import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, User, Activity } from '@/types'

export const useAppStore = defineStore('app', () => {
  // State
  const currentView = ref<'inicio' | 'plan' | 'perfil'>('inicio')
  const trips = ref<Trip[]>([])
  const user = ref<User>({
    id: '1',
    name: 'Félix Explorer',
    email: 'felix@rumboperfecto.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    isAuthenticated: false
  })

  // Computed
  const tripCount = computed(() => trips.value.length)
  const isAuthenticated = computed(() => user.value.isAuthenticated)

  // Actions
  function setCurrentView(view: 'inicio' | 'plan' | 'perfil') {
    currentView.value = view
  }

  function loadTripsFromStorage() {
    const saved = localStorage.getItem('rumbo_trips')
    if (saved) {
      try {
        trips.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse trips', e)
      }
    }
  }

  function saveTripsToStorage() {
    localStorage.setItem('rumbo_trips', JSON.stringify(trips.value))
  }

  function addTrip(trip: Trip) {
    trips.value.push(trip)
    saveTripsToStorage()
  }

  function deleteTrip(id: string) {
    trips.value = trips.value.filter(t => t.id !== id)
    saveTripsToStorage()
  }

  function addActivity(tripId: string, day: number, activity: Activity) {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      if (!trip.activities[day]) {
        trip.activities[day] = []
      }
      trip.activities[day].push(activity)
      saveTripsToStorage()
    }
  }

  function login(email: string, password: string) {
    // Simulación de login - en producción conectar con API real
    user.value.isAuthenticated = true
    user.value.email = email
    localStorage.setItem('rumbo_user', JSON.stringify(user.value))
  }

  function logout() {
    user.value.isAuthenticated = false
    localStorage.removeItem('rumbo_user')
  }

  function loadUserFromStorage() {
    const saved = localStorage.getItem('rumbo_user')
    if (saved) {
      try {
        user.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse user', e)
      }
    }
  }

  return {
    // State
    currentView,
    trips,
    user,
    // Computed
    tripCount,
    isAuthenticated,
    // Actions
    setCurrentView,
    loadTripsFromStorage,
    saveTripsToStorage,
    addTrip,
    deleteTrip,
    addActivity,
    login,
    logout,
    loadUserFromStorage
  }
})
