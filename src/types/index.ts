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

export type View = 'inicio' | 'plan' | 'perfil' | 'alojamiento'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAuthenticated: boolean
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
