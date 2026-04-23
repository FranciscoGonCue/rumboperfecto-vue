export type TransportType = 'Vuelo' | 'Tren' | 'Bus' | 'Coche' | 'Ferry' | 'Bicicleta'

export type TransportClass = { name: string; surcharge: number }

export type TransportMock = {
  id: string
  name: string
  type: TransportType
  company: string
  origin: string
  destination: string
  duration: string
  currency: string
  pricePerTicket: number
  seatsAvailable: number
  rating: number
  reviewsCount: number
  description: string
  amenities: string[]
  tags: string[]
  departureTimes: string[]
  classes: TransportClass[]
}

export const transportsMock: TransportMock[] = [
  {
    id: 't-1',
    name: 'Vuelo directo al atardecer',
    type: 'Vuelo',
    company: 'SkyWings',
    origin: 'Madrid',
    destination: 'Lisboa',
    duration: '1h 25m',
    currency: '€',
    pricePerTicket: 79,
    seatsAvailable: 14,
    rating: 4.6,
    reviewsCount: 1240,
    description:
      'Un vuelo cómodo y rápido con equipaje de mano incluido. Ideal para escapadas de fin de semana.',
    amenities: ['Wi‑Fi', 'Equipaje mano', 'Asiento asignado', 'Snack'],
    tags: ['Directo', 'Mejor precio', 'Recomendado'],
    departureTimes: ['08:10', '12:40', '19:05', '21:30'],
    classes: [
      { name: 'Básica', surcharge: 0 },
      { name: 'Confort', surcharge: 25 },
      { name: 'Premium', surcharge: 60 },
    ],
  },
  {
    id: 't-2',
    name: 'Tren panorámico',
    type: 'Tren',
    company: 'IberRail',
    origin: 'Barcelona',
    destination: 'Valencia',
    duration: '2h 50m',
    currency: '€',
    pricePerTicket: 39,
    seatsAvailable: 36,
    rating: 4.3,
    reviewsCount: 810,
    description:
      'Viaja con vistas al Mediterráneo, enchufes en el asiento y vagón cafetería.',
    amenities: ['Enchufe', 'Vagón cafetería', 'Asiento reclinable'],
    tags: ['Panorámico', 'Flexible'],
    departureTimes: ['07:20', '10:00', '16:15', '18:45'],
    classes: [
      { name: 'Turista', surcharge: 0 },
      { name: 'Preferente', surcharge: 18 },
    ],
  },
  {
    id: 't-3',
    name: 'Bus nocturno',
    type: 'Bus',
    company: 'RutaExpress',
    origin: 'Sevilla',
    destination: 'Granada',
    duration: '3h 05m',
    currency: '€',
    pricePerTicket: 18,
    seatsAvailable: 22,
    rating: 4.1,
    reviewsCount: 420,
    description:
      'Opción económica con salidas tardías. Recomendado si quieres llegar y dormir.',
    amenities: ['A/C', 'Asiento XL', 'Parada 10 min'],
    tags: ['Económico', 'Nocturno'],
    departureTimes: ['20:30', '22:00', '23:15'],
    classes: [
      { name: 'Estándar', surcharge: 0 },
      { name: 'Asiento XL', surcharge: 6 },
    ],
  },
]

