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
  | 'inicio'
  | 'plan'
  | 'perfil'
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
}

export interface BackendUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
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
