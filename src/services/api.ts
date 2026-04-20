import axios from 'axios'

import type {
  Activity,
  AuthResponse,
  BackendActivity,
  BackendTrip,
  BackendUser,
  LoginPayload,
  RegisterPayload,
  Trip,
  User,
} from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api'

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

export default api
