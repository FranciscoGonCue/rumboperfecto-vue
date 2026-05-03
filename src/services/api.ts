import axios from 'axios'

import type {
  Activity,
  AuthResponse,
  BackendActivity,
  BackendTrip,
  BackendUser,
  ItemPlan,
  LoginPayload,
  PlanViaje,
  RegisterPayload,
  Trip,
  User,
} from '@/types'

const envUrl = (import.meta.env.VITE_API_URL as string) || ''
const API_BASE_URL = envUrl || (typeof window !== 'undefined' && window.location.protocol === 'https:' ? '/api' : 'http://localhost:8000/api')

type SessionListener = () => void

const TOKEN_STORAGE_KEY = 'rumbo_access_token'
const REFRESH_STORAGE_KEY = 'rumbo_refresh_token'

let onSessionExpired: SessionListener | null = null

function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_STORAGE_KEY)
}

function saveTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, access)
  localStorage.setItem(REFRESH_STORAGE_KEY, refresh)
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_STORAGE_KEY)
}

export function setSessionExpiredHandler(handler: SessionListener | null): void {
  onSessionExpired = handler
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    const response = await refreshClient.post('/auth/refresh/', { refresh })
    const nextAccess = response.data?.access as string | undefined
    if (!nextAccess) return null

    const nextRefresh = (response.data?.refresh as string | undefined) ?? refresh
    saveTokens(nextAccess, nextRefresh)
    return nextAccess
  } catch {
    clearTokens()
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status as number | undefined

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false
      })
    }

    const nextAccess = await refreshPromise
    if (!nextAccess) {
      clearTokens()
      if (onSessionExpired) {
        onSessionExpired()
      }
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${nextAccess}`
    return api(originalRequest)
  },
)

function buildDisplayName(user: BackendUser): string {
  const first = user.first_name?.trim() ?? ''
  const last = user.last_name?.trim() ?? ''
  const composed = `${first} ${last}`.trim()
  if (composed) return composed
  if (user.username?.trim()) return user.username.trim()
  return user.email
}

function avatarFromEmail(email: string): string {
  const seed = encodeURIComponent(email || 'traveler')
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

export function mapBackendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    name: buildDisplayName(user),
    email: user.email,
    avatar: avatarFromEmail(user.email),
    isAuthenticated: true,
    seller: user.seller ?? false,
    planings: user.planings ?? [],
  }
}

export function mapBackendTrip(trip: BackendTrip): Trip {
  const groupedActivities: Record<number, Activity[]> = {}

  for (const activity of trip.activities ?? []) {
    if (!groupedActivities[activity.day]) {
      groupedActivities[activity.day] = []
    }
    groupedActivities[activity.day].push(mapBackendActivity(activity))
  }

  return {
    id: String(trip.id),
    title: trip.title,
    startDate: trip.start_date,
    endDate: trip.end_date,
    activities: groupedActivities,
  }
}

export function mapBackendActivity(activity: BackendActivity): Activity {
  return {
    id: String(activity.id),
    title: activity.title,
    location: activity.location,
    time: activity.time.slice(0, 5),
  }
}

function mapAuthResponse(response: AuthResponse): { user: User; access: string; refresh: string } {
  return {
    user: mapBackendUser(response.user),
    access: response.access,
    refresh: response.refresh,
  }
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<{ user: User; access: string; refresh: string }> {
    const response = await api.post<AuthResponse>('/auth/register/', payload)
    return mapAuthResponse(response.data)
  },

  async login(payload: LoginPayload): Promise<{ user: User; access: string; refresh: string }> {
    const response = await api.post<AuthResponse>('/auth/login/', payload)
    return mapAuthResponse(response.data)
  },

  async me(): Promise<User> {
    const response = await api.get<BackendUser>('/auth/me/')
    return mapBackendUser(response.data)
  },

  async updateProfile(payload: { name?: string; email?: string }): Promise<User> {
    const response = await api.patch<BackendUser>('/auth/me/', payload)
    return mapBackendUser(response.data)
  },

  async updateSeller(seller: boolean): Promise<User> {
    const response = await api.post<BackendUser>('/auth/seller/', { seller })
    return mapBackendUser(response.data)
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password/', { old_password: oldPassword, new_password: newPassword })
  },

  async logout(): Promise<void> {
    const refresh = getRefreshToken()
    if (!refresh) return
    await api.post('/auth/logout/', { refresh })
  },

  saveSession(access: string, refresh: string): void {
    saveTokens(access, refresh)
  },

  clearSession(): void {
    clearTokens()
  },

  hasSession(): boolean {
    return Boolean(getAccessToken() && getRefreshToken())
  },
}

export const tripsApi = {
  async getAll(): Promise<Trip[]> {
    const response = await api.get<{ results?: BackendTrip[] } | BackendTrip[]>('/trips/')
    const raw = Array.isArray(response.data) ? response.data : response.data.results ?? []
    return raw.map(mapBackendTrip)
  },

  async create(payload: { title: string; start_date: string; end_date: string }): Promise<Trip> {
    const response = await api.post<BackendTrip>('/trips/', payload)
    return mapBackendTrip(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/trips/${id}/`)
  },
}

export const activitiesApi = {
  async create(
    payload: { trip: string; day: number; title: string; location: string; time: string },
  ): Promise<Activity> {
    const response = await api.post<BackendActivity>('/activities/', payload)
    return mapBackendActivity(response.data)
  },
}

export const tasksAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/tasks/', { params }),
  getById: (id: number) => api.get(`/tasks/${id}/`),
  create: (data: Record<string, unknown>) => api.post('/tasks/', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/tasks/${id}/`, data),
  delete: (id: number) => api.delete(`/tasks/${id}/`),
}

// ── Catálogo de Servicios ────────────────────────────────────────────────────

export interface TipoServicioAPI {
  id_tipo: number
  nombre_tipo: string
  icono: string
}

export interface DetalleAlojamientoAPI {
  estrellas: number | null
  hora_checkin: string | null
  hora_checkout: string | null
  servicios_extra: string | null
}

export interface DetalleTransporteAPI {
  ciudad_origen: string | null
  ciudad_destino: string | null
  compania: string | null
  codigo_vuelo: string | null
  duracion_minutos: number | null
}

export interface DetalleRestauracionAPI {
  tipo_cocina: string | null
  es_vegano: boolean | null
  precio_medio: number | null
  requiere_reserva: boolean | null
}

export interface DetalleActividadAPI {
  duracion_estimada: number | null
  aforo_maximo: number | null
  horario_apertura: string | null
  guia_incluido: boolean | null
}

export interface Servicio {
  id_servicio: number
  tipo: TipoServicioAPI | null
  nombre: string | null
  descripcion: string | null
  precio_base: number | null
  ubicacion_lat: number | null
  ubicacion_lon: number | null
  imagen_url: string | null
  disponible: boolean | null
  detalle_alojamiento: DetalleAlojamientoAPI | null
  detalle_transporte: DetalleTransporteAPI | null
  detalle_restauracion: DetalleRestauracionAPI | null
  detalle_actividad: DetalleActividadAPI | null
}

// Cliente sin credenciales para endpoints públicos (evita CORS preflight complejo)
const publicClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
})

export const serviciosApi = {
  async getAll(): Promise<Servicio[]> {
    const response = await publicClient.get<Servicio[]>('/servicios/')
    return response.data
  },
}

export const misServiciosApi = {
  async getAll(): Promise<Servicio[]> {
    const response = await api.get<Servicio[]>('/auth/mis-servicios/')
    return response.data
  },
}

export const plansApi = {
  async getAll(): Promise<PlanViaje[]> {
    const response = await api.get<PlanViaje[]>('/auth/mis-planes/')
    return response.data
  },

  async getOne(id: number): Promise<PlanViaje> {
    const response = await api.get<PlanViaje>(`/auth/mis-planes/${id}/`)
    return response.data
  },

  async create(payload: { nombre_plan: string; fecha_inicio: string; fecha_fin: string }): Promise<PlanViaje> {
    const response = await api.post<PlanViaje>('/auth/mis-planes/', payload)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/auth/mis-planes/${id}/`)
  },

  async updateItem(planId: number, itemId: number, payload: Partial<{
    fecha_hora_inicio: string | null
    fecha_hora_fin: string | null
    nombre_servicio: string
    precio_estimado: number | null
    estado_pago: string | null
    localizador_confirmacion: string | null
  }>): Promise<ItemPlan> {
    const response = await api.patch<ItemPlan>(`/auth/mis-planes/${planId}/items/${itemId}/`, payload)
    return response.data
  },

  async deleteItem(planId: number, itemId: number): Promise<void> {
    await api.delete(`/auth/mis-planes/${planId}/items/${itemId}/`)
  },

  async createItem(planId: number, payload: {
    nombre_servicio: string
    tipo?: number | null
    fecha_hora_inicio?: string | null
    fecha_hora_fin?: string | null
    precio_estimado?: number | null
    estado_pago?: string | null
    localizador_confirmacion?: string | null
  }): Promise<ItemPlan> {
    const response = await api.post<ItemPlan>(`/auth/mis-planes/${planId}/items/`, payload)
    return response.data
  },
}

export const tiposServicioApi = {
  async getAll(): Promise<{ id_tipo: number; nombre_tipo: string; icono: string | null }[]> {
    const response = await api.get('/tipos-servicio/')
    return response.data
  },
}

export default api
