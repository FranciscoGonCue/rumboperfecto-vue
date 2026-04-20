import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { activitiesApi, authApi, setSessionExpiredHandler, tripsApi } from '@/services/api'
import type { Activity, Trip, User, View } from '@/types'

const THEME_STORAGE_KEY = 'rumbo_theme'
const LOCAL_TRIPS_KEY = 'rumbo_local_trips'

function loadLocalTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(LOCAL_TRIPS_KEY)
    return raw ? (JSON.parse(raw) as Trip[]) : []
  } catch {
    return []
  }
}

function saveLocalTrips(trips: Trip[]): void {
  try {
    localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(trips))
  } catch {
    // Storage might be full or unavailable
  }
}

const GUEST_USER: User = {
  id: '0',
  name: 'Invitado',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
  isAuthenticated: false,
}

export const useAppStore = defineStore('app', () => {
  const currentView = ref<View>('inicio')
  const theme = ref<'light' | 'dark'>('light')
  const trips = ref<Trip[]>(loadLocalTrips())
  const user = ref<User>({ ...GUEST_USER })
  const selectedAccommodationId = ref<string | null>(null)

  const bootstrapping = ref(false)
  const tripsLoading = ref(false)
  const authLoading = ref(false)
  const networkError = ref<string | null>(null)

  const tripCount = computed(() => trips.value.length)
  const isAuthenticated = computed(() => user.value.isAuthenticated)
  const isDark = computed(() => theme.value === 'dark')

  function setCurrentView(view: View): void {
    currentView.value = view
  }

  function setSelectedAccommodationId(id: string | null): void {
    selectedAccommodationId.value = id
  }

  function openAccommodationDetail(id: string): void {
    selectedAccommodationId.value = id
    currentView.value = 'alojamiento'
  }

  function closeAccommodationDetail(): void {
    selectedAccommodationId.value = null
    currentView.value = 'inicio'
  }

  function applyThemeToDom(nextTheme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.toggle('theme-dark', nextTheme === 'dark')
    root.style.colorScheme = nextTheme
  }

  function setTheme(nextTheme: 'light' | 'dark'): void {
    theme.value = nextTheme
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    applyThemeToDom(nextTheme)
  }

  function toggleTheme(): void {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function loadThemeFromStorage(): void {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextTheme = saved ?? (prefersDark ? 'dark' : 'light')
    setTheme(nextTheme)
  }

  function clearSessionState(): void {
    authApi.clearSession()
    trips.value = loadLocalTrips()
    user.value = { ...GUEST_USER }
  }

  async function bootstrapSession(): Promise<void> {
    if (!authApi.hasSession()) return

    bootstrapping.value = true
    networkError.value = null

    try {
      const [resolvedUser, resolvedTrips] = await Promise.all([authApi.me(), tripsApi.getAll()])
      user.value = resolvedUser
      trips.value = resolvedTrips
    } catch {
      clearSessionState()
      networkError.value = 'No se pudo restaurar tu sesion. Inicia sesion nuevamente.'
    } finally {
      bootstrapping.value = false
    }
  }

  async function register(email: string, password: string, name: string): Promise<boolean> {
    authLoading.value = true
    networkError.value = null

    try {
      const session = await authApi.register({ email, password, name })
      authApi.saveSession(session.access, session.refresh)
      user.value = session.user
      trips.value = []
      return true
    } catch (error: any) {
      networkError.value = error?.response?.data?.detail ?? 'No se pudo completar el registro.'
      return false
    } finally {
      authLoading.value = false
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    authLoading.value = true
    networkError.value = null

    try {
      const session = await authApi.login({ email, password })
      authApi.saveSession(session.access, session.refresh)
      user.value = session.user
      trips.value = await tripsApi.getAll()
      return true
    } catch (error: any) {
      networkError.value = error?.response?.data?.detail ?? 'No se pudo iniciar sesion.'
      return false
    } finally {
      authLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // ignored on purpose; local session cleanup still required
    } finally {
      clearSessionState()
    }
  }

  async function loadTrips(): Promise<void> {
    if (!isAuthenticated.value) {
      trips.value = []
      return
    }

    tripsLoading.value = true
    networkError.value = null
    try {
      trips.value = await tripsApi.getAll()
    } catch {
      networkError.value = 'No se pudieron cargar los viajes.'
    } finally {
      tripsLoading.value = false
    }
  }

  async function addTrip(trip: Trip): Promise<void> {
    networkError.value = null

    if (!isAuthenticated.value) {
      const localTrip: Trip = {
        ...trip,
        id: `local-${Date.now()}`,
        activities: trip.activities ?? {},
      }
      trips.value.unshift(localTrip)
      saveLocalTrips(trips.value)
      return
    }

    try {
      const created = await tripsApi.create({
        title: trip.title,
        start_date: trip.startDate,
        end_date: trip.endDate,
      })
      trips.value.unshift(created)
      saveLocalTrips(trips.value)
    } catch {
      networkError.value = 'No se pudo crear el viaje.'
      throw new Error('trip-create-failed')
    }
  }

  async function deleteTrip(id: string): Promise<void> {
    networkError.value = null

    if (!isAuthenticated.value || id.startsWith('local-')) {
      trips.value = trips.value.filter((trip) => trip.id !== id)
      saveLocalTrips(trips.value)
      return
    }

    try {
      await tripsApi.delete(id)
      trips.value = trips.value.filter((trip) => trip.id !== id)
      saveLocalTrips(trips.value)
    } catch {
      networkError.value = 'No se pudo eliminar el viaje.'
      throw new Error('trip-delete-failed')
    }
  }

  async function addActivity(tripId: string, day: number, activity: Activity): Promise<void> {
    networkError.value = null

    if (!isAuthenticated.value || tripId.startsWith('local-')) {
      const trip = trips.value.find((t) => t.id === tripId)
      if (!trip) {
        networkError.value = 'Viaje no encontrado.'
        throw new Error('trip-not-found')
      }
      if (!trip.activities[day]) {
        trip.activities[day] = []
      }
      trip.activities[day].push({ ...activity, id: `local-act-${Date.now()}` })
      saveLocalTrips(trips.value)
      return
    }

    try {
      await activitiesApi.create({
        trip: tripId,
        day,
        title: activity.title,
        location: activity.location,
        time: activity.time,
      })
      await loadTrips()
      saveLocalTrips(trips.value)
    } catch {
      networkError.value = 'No se pudo agregar la actividad.'
      throw new Error('activity-create-failed')
    }
  }

  setSessionExpiredHandler(() => {
    clearSessionState()
    networkError.value = 'Tu sesion ha expirado. Inicia sesion nuevamente.'
  })

  return {
    currentView,
    selectedAccommodationId,
    theme,
    trips,
    user,
    bootstrapping,
    tripsLoading,
    authLoading,
    networkError,
    tripCount,
    isAuthenticated,
    isDark,
    setCurrentView,
    setSelectedAccommodationId,
    openAccommodationDetail,
    closeAccommodationDetail,
    setTheme,
    toggleTheme,
    loadThemeFromStorage,
    bootstrapSession,
    register,
    login,
    logout,
    loadTrips,
    addTrip,
    deleteTrip,
    addActivity,
  }
})
