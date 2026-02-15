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

export type View = 'inicio' | 'plan' | 'perfil'

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
