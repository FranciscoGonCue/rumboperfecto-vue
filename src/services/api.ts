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
  amenidades: string[] | null
  fecha_disponible_desde: string | null
  fecha_disponible_hasta: string | null
  fechas_no_disponibles: string[] | null
  /** Texto libre o lista serializada desde el backend */
  servicios_extra?: string | null
}

export interface DetalleTransporteAPI {
  ciudad_origen: string | null
  ciudad_destino: string | null
  compania: string | null
  codigo_vuelo: string | null
  duracion_minutos: number | null
  asientos_disponibles: number | null
  comodidades: string[] | null
  horarios_salida: string[] | null
  clases: { nombre: string; recargo: number }[] | null
}

export interface DetalleRestauracionAPI {
  tipo_cocina: string | null
  es_vegano: boolean | null
  precio_medio: number | null
  requiere_reserva: boolean | null
  rango_precios: string | null
  abierto_ahora: boolean | null
  especialidades: string[] | null
  horario: Record<string, string> | null
  ubicacion_texto: string | null
  fecha_disponible_desde: string | null
  fecha_disponible_hasta: string | null
  fechas_no_disponibles: string[] | null
  turnos_disponibles: string[] | null
  turnos_ocupados: Record<string, string[]> | null
}

export interface DetalleActividadAPI {
  duracion_estimada: number | null
  aforo_maximo: number | null
  horario_apertura: string | null
  guia_incluido: boolean | null
  dificultad: string | null
  duracion_texto: string | null
  ubicacion_texto: string | null
  incluye: string[] | null
  requisitos: string[] | null
  turnos_disponibles: string[] | null
  fecha_disponible_desde: string | null
  fecha_disponible_hasta: string | null
  fechas_no_disponibles: string[] | null
  turnos_ocupados: Record<string, string[]> | null
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
  // Campos comunes añadidos en migración 0004
  valoracion: number | null
  num_resenas: number | null
  ciudad: string | null
  pais: string | null
  direccion: string | null
  moneda: string | null
  etiquetas: string[] | null
  destacado: boolean | null
  detalle_alojamiento: DetalleAlojamientoAPI | null
  detalle_transporte: DetalleTransporteAPI | null
  detalle_restauracion: DetalleRestauracionAPI | null
  detalle_actividad: DetalleActividadAPI | null
}

// ── Adaptadores Servicio → Mock types ────────────────────────────────────────

import type { Accommodation } from '@/types'
import type { ActivityMock, ActivityDifficulty } from '@/mocks/activities'
import type { RestaurantMock } from '@/mocks/restaurants'
import type { TransportMock, TransportType } from '@/mocks/transport'

function formatMinutes(minutes: number | null): string {
  if (!minutes) return '-'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** Comparación laxa de hora (espacios, HH:MM vs HH:MM:SS). */
export function turnosEquivalentes(a: string, b: string): boolean {
  const x = (a ?? '').trim()
  const y = (b ?? '').trim()
  if (!x || !y) return false
  if (x === y) return true
  const head = (s: string) => (s.length >= 5 ? s.slice(0, 5) : s)
  return head(x) === head(y)
}

export function shiftsLibresParaFecha(
  baseShifts: string[],
  fecha: string,
  ocupados: Record<string, string[]> | null | undefined,
): string[] {
  if (!fecha) return []
  const bloq = ocupados?.[fecha] ?? []
  return baseShifts.filter((s) => !bloq.some((o) => turnosEquivalentes(s, o)))
}

export function diaSinTurnosLibres(
  baseShifts: string[],
  fecha: string,
  ocupados: Record<string, string[]> | null | undefined,
): boolean {
  return baseShifts.length > 0 && shiftsLibresParaFecha(baseShifts, fecha, ocupados).length === 0
}

/** Detecta a qué vista debe ir un servicio según su tipo */
export function detectServicioView(svc: Servicio): 'alojamiento' | 'actividad' | 'restaurante' | 'transporte' | 'servicio' {
  const t = (svc.tipo?.nombre_tipo ?? '').toLowerCase()
  if (t.includes('alojamiento') || t.includes('hotel')) return 'alojamiento'
  if (t.includes('restaur') || t.includes('comida') || t.includes('gastro')) return 'restaurante'
  if (t.includes('transporte') || t.includes('vuelo') || t.includes('tren') || t.includes('bus') || t.includes('ferry')) return 'transporte'
  if (t.includes('actividad') || t.includes('aventura') || t.includes('tour') || t.includes('excursion')) return 'actividad'
  // Fallback por subtipo de detalle presente
  if (svc.detalle_alojamiento) return 'alojamiento'
  if (svc.detalle_restauracion) return 'restaurante'
  if (svc.detalle_transporte) return 'transporte'
  if (svc.detalle_actividad) return 'actividad'
  return 'servicio'
}

export function servicioToAccommodation(s: Servicio): Accommodation {
  const d = s.detalle_alojamiento
  return {
    id: String(s.id_servicio),
    title: s.nombre ?? '',
    location: s.direccion ?? s.ciudad ?? '',
    city: s.ciudad ?? '',
    country: s.pais ?? '',
    description: s.descripcion ?? '',
    pricePerNight: s.precio_base ?? 0,
    currency: s.moneda ?? '€',
    rating: s.valoracion != null ? Number(s.valoracion) : 4.5,
    reviewsCount: s.num_resenas ?? 0,
    image: s.imagen_url ?? '',
    amenities: d?.amenidades ?? [],
    tags: s.etiquetas ?? [],
    isFeatured: s.destacado ?? false,
    availableFrom: d?.fecha_disponible_desde ?? '',
    availableTo: d?.fecha_disponible_hasta ?? '',
    unavailableDates: d?.fechas_no_disponibles ?? [],
  }
}

export function servicioToActivity(s: Servicio): ActivityMock {
  const d = s.detalle_actividad
  return {
    id: String(s.id_servicio),
    title: s.nombre ?? '',
    image: s.imagen_url ?? '',
    category: s.tipo?.nombre_tipo ?? '',
    difficulty: (d?.dificultad as ActivityDifficulty) ?? 'Fácil',
    duration: d?.duracion_texto ?? formatMinutes(d?.duracion_estimada ?? null),
    location: d?.ubicacion_texto ?? s.ciudad ?? '',
    city: s.ciudad ?? '',
    rating: s.valoracion != null ? Number(s.valoracion) : 4.5,
    reviewsCount: s.num_resenas ?? 0,
    pricePerPerson: s.precio_base ?? 0,
    currency: s.moneda ?? '€',
    maxGroupSize: d?.aforo_maximo ?? 10,
    description: s.descripcion ?? '',
    includes: d?.incluye ?? [],
    requirements: d?.requisitos ?? [],
    tags: s.etiquetas ?? [],
    availableShifts: d?.turnos_disponibles ?? [],
    occupiedShiftsByDate: d?.turnos_ocupados ?? {},
    availableFrom: d?.fecha_disponible_desde ?? '',
    availableTo: d?.fecha_disponible_hasta ?? '',
    unavailableDates: d?.fechas_no_disponibles ?? [],
  }
}

export function servicioToRestaurant(s: Servicio): RestaurantMock {
  const d = s.detalle_restauracion
  return {
    id: String(s.id_servicio),
    name: s.nombre ?? '',
    image: s.imagen_url ?? '',
    cuisine: d?.tipo_cocina ?? '',
    priceRange: d?.rango_precios ?? '€€',
    address: d?.ubicacion_texto ?? s.direccion ?? s.ciudad ?? '',
    city: s.ciudad ?? '',
    rating: s.valoracion != null ? Number(s.valoracion) : 4.5,
    reviewsCount: s.num_resenas ?? 0,
    avgPricePerPerson: d?.precio_medio ?? s.precio_base ?? 0,
    currency: s.moneda ?? '€',
    openNow: d?.abierto_ahora ?? false,
    description: s.descripcion ?? '',
    specialties: d?.especialidades ?? [],
    tags: s.etiquetas ?? [],
    schedule: d?.horario ?? {},
    availableShifts: d?.turnos_disponibles ?? [],
    occupiedShiftsByDate: d?.turnos_ocupados ?? {},
    availableFrom: d?.fecha_disponible_desde ?? '',
    availableTo: d?.fecha_disponible_hasta ?? '',
    unavailableDates: d?.fechas_no_disponibles ?? [],
  }
}

export function servicioToTransport(s: Servicio): TransportMock {
  const d = s.detalle_transporte
  return {
    id: String(s.id_servicio),
    name: s.nombre ?? '',
    type: (s.tipo?.nombre_tipo as TransportType) ?? 'Vuelo',
    company: d?.compania ?? '',
    origin: d?.ciudad_origen ?? '',
    destination: d?.ciudad_destino ?? '',
    duration: d ? formatMinutes(d.duracion_minutos) : '-',
    currency: s.moneda ?? '€',
    pricePerTicket: s.precio_base ?? 0,
    seatsAvailable: d?.asientos_disponibles ?? 0,
    rating: s.valoracion != null ? Number(s.valoracion) : 4.5,
    reviewsCount: s.num_resenas ?? 0,
    description: s.descripcion ?? '',
    amenities: d?.comodidades ?? [],
    tags: s.etiquetas ?? [],
    departureTimes: d?.horarios_salida ?? [],
    classes: d?.clases?.map(c => ({ name: c.nombre, surcharge: c.recargo })) ?? [],
  }
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
  async getOne(id: string): Promise<Servicio> {
    const base = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api'
    const url = `${base.replace(/\/$/, '')}/servicios/${id}/`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json() as Promise<Servicio>
  },
}

export const misServiciosApi = {
  async getAll(): Promise<Servicio[]> {
    const response = await api.get<Servicio[]>('/auth/mis-servicios/')
    return response.data
  },

  async update(id: string, payload: Record<string, unknown>): Promise<Servicio> {
    const response = await api.patch<Servicio>(`/auth/mis-servicios/${id}/`, payload)
    return response.data
  },
}

/** Lista de planes: admite array plano o paginación `{ results: [...] }`. */
function normalizePlanListPayload(data: unknown): PlanViaje[] {
  if (Array.isArray(data)) return data as PlanViaje[]
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { results?: unknown }).results)
  ) {
    return (data as { results: PlanViaje[] }).results
  }
  return []
}

/** Mensaje legible para errores de axios (útil en Mis reservas / planes). */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  const data = error.response?.data
  if (data && typeof data === 'object') {
    const d = (data as { detail?: unknown }).detail
    if (typeof d === 'string' && d.trim()) return d
    if (Array.isArray(d) && typeof d[0] === 'string') return d[0]
    for (const v of Object.values(data)) {
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
      if (typeof v === 'string') return v
    }
  }
  const st = error.response?.status
  if (st === 401 || st === 403) return 'Sesión caducada o sin permiso. Vuelve a iniciar sesión.'
  if (st === 500)
    return 'Error en el servidor. Revisa los logs del backend y que las migraciones estén aplicadas (ej. planning 0006).'
  if (st) return `No se pudieron cargar los planes (código ${st}).`
  return fallback
}

export const plansApi = {
  async getAll(): Promise<PlanViaje[]> {
    const response = await api.get<unknown>('/auth/mis-planes/')
    return normalizePlanListPayload(response.data)
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
    reserva?: number | null
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

export interface Reserva {
  id: number
  servicio: string
  servicio_nombre: string | null
  servicio_imagen: string | null
  servicio_ciudad: string | null
  servicio_tipo: string | null
  /** FK `id_tipo` del servicio; necesario para ítems de plan correctos */
  servicio_tipo_id: number | null
  usuario_email: string | null
  usuario_nombre: string | null
  fecha_inicio: string
  fecha_fin: string | null
  turno: string | null
  personas: number
  precio_total: number | null
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada'
  notas: string | null
  creado_en: string
}

export interface ReservaPayload {
  servicio: string
  fecha_inicio: string
  fecha_fin?: string | null
  turno?: string | null
  personas: number
  precio_total?: number | null
  notas?: string | null
}

export const reservasApi = {
  async getMias(): Promise<Reserva[]> {
    const response = await api.get<Reserva[]>('/auth/mis-reservas/')
    return response.data
  },

  async crear(payload: ReservaPayload): Promise<Reserva> {
    const response = await api.post<Reserva>('/auth/mis-reservas/', payload)
    return response.data
  },

  async cancelar(id: number): Promise<Reserva> {
    const response = await api.patch<Reserva>(`/auth/mis-reservas/${id}/`, { estado: 'Cancelada' })
    return response.data
  },

  async getDeServicio(idServicio: string): Promise<Reserva[]> {
    const response = await api.get<Reserva[]>(`/auth/mis-servicios/${idServicio}/reservas/`)
    return response.data
  },

  /** Vendedor: confirma o cancela una reserva de su servicio */
  async patchEstadoVendedor(
    idServicio: string,
    reservaId: number,
    estado: 'Confirmada' | 'Cancelada',
  ): Promise<Reserva> {
    const response = await api.patch<Reserva>(
      `/auth/mis-servicios/${idServicio}/reservas/${reservaId}/`,
      { estado },
    )
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
