export interface Activity {
  id: string
  time: string
  title: string
  location: string
}

export interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  activities: Record<number, Activity[]>
}

export type View =
  | 'auth'
  | 'inicio'
  | 'plan'
  | 'perfil'
  | 'gestion'
  | 'alojamiento'
  | 'transporte'
  | 'actividad'
  | 'restaurante'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAuthenticated: boolean
  seller: boolean
  planings: string[]
}

export interface BackendUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  seller?: boolean
  alojamientos?: string[]
  actividades?: string[]
  restaurantes?: string[]
  planings?: string[]
}

export interface AuthResponse {
  user: BackendUser
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  seller: boolean
  alojamientos: string[]
  actividades: string[]
  restaurantes: string[]
  planings: string[]
}

export interface ItemPlan {
  id_item: number
  nombre_servicio: string | null
  tipo: number | null
  tipo_nombre: string | null
  fecha_hora_inicio: string | null
  fecha_hora_fin: string | null
  precio_estimado: number | null
  monto_total: number | null
  estado_pago: 'Pendiente' | 'Pagado' | 'Cancelado' | null
  localizador_confirmacion: string | null
  fecha_transaccion: string | null
  ubicacion_lat: number | null
  ubicacion_lon: number | null
}

export interface PlanViaje {
  id_plan: number
  nombre_plan: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  estado_plan: 'Borrador' | 'Confirmado' | 'Finalizado' | null
  items: ItemPlan[]
}

export interface BackendActivity {
  id: number
  day: number
  title: string
  location: string
  time: string
}

export interface BackendTrip {
  id: number
  title: string
  start_date: string
  end_date: string
  activities: BackendActivity[]
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
}

export interface MapLocation {
  lat: number
  lng: number
  title: string
  description?: string
}

export interface Accommodation {
  id: string
  title: string
  location: string
  city: string
  country: string
  description: string
  pricePerNight: number
  currency: string
  rating: number
  reviewsCount: number
  image: string
  amenities: string[]
  tags: string[]
  isFeatured: boolean
  availableFrom: string
  availableTo: string
  unavailableDates: string[]
}
