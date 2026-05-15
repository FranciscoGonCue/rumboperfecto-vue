export type ActivityDifficulty = 'Fácil' | 'Moderado' | 'Difícil' | 'Extremo'

export type ActivityMock = {
  id: string
  title: string
  image: string
  category: string
  difficulty: ActivityDifficulty
  duration: string
  location: string
  city: string
  rating: number
  reviewsCount: number
  pricePerPerson: number
  currency: string
  maxGroupSize: number
  description: string
  includes: string[]
  requirements: string[]
  tags: string[]
  availableShifts: string[]
  occupiedShiftsByDate: Record<string, string[]>
  availableFrom: string
  availableTo: string
  unavailableDates: string[]
}

export const activitiesMock: ActivityMock[] = [
  {
    id: 'a-1',
    title: 'Tour gastronómico por el casco antiguo',
    image:
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1800&q=80',
    category: 'Gastronomía',
    difficulty: 'Fácil',
    duration: '2h 30m',
    location: 'Barrio histórico',
    city: 'Lisboa',
    rating: 4.8,
    reviewsCount: 980,
    pricePerPerson: 29,
    currency: '€',
    maxGroupSize: 12,
    description:
      'Prueba sabores locales en 4 paradas seleccionadas y conoce historias del barrio con un guía local.',
    includes: ['Guía local', '4 degustaciones', 'Agua'],
    requirements: ['Avisa alergias con antelación'],
    tags: ['Local', 'Top ventas', 'Ideal parejas'],
    availableShifts: ['10:30', '12:00', '17:30', '19:00'],
    occupiedShiftsByDate: {},
    availableFrom: '', availableTo: '', unavailableDates: [],
  },
  {
    id: 'a-2',
    title: 'Atardecer en mirador + fotos',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=80',
    category: 'Cultura',
    difficulty: 'Fácil',
    duration: '1h 45m',
    location: 'Mirador principal',
    city: 'Granada',
    rating: 4.5,
    reviewsCount: 410,
    pricePerPerson: 15,
    currency: '€',
    maxGroupSize: 18,
    description:
      'Ruta suave hasta el mirador, tips de fotografía móvil y tiempo para disfrutar del atardecer.',
    includes: ['Acompañamiento', 'Tips de foto', 'Mini guía de spots'],
    requirements: ['Calzado cómodo'],
    tags: ['Atardecer', 'Fotos', 'Suave'],
    availableShifts: ['18:00', '18:30', '19:00'],
    occupiedShiftsByDate: {},
    availableFrom: '', availableTo: '', unavailableDates: [],
  },
  {
    id: 'a-3',
    title: 'Sendero circular por costa',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
    category: 'Naturaleza',
    difficulty: 'Moderado',
    duration: '3h 15m',
    location: 'Parque natural',
    city: 'Valencia',
    rating: 4.2,
    reviewsCount: 260,
    pricePerPerson: 19,
    currency: '€',
    maxGroupSize: 10,
    description:
      'Caminata con tramos de arena y piedra. Buenas vistas, paradas para fotos y descanso.',
    includes: ['Guía', 'Seguro básico'],
    requirements: ['Agua 1L', 'Protector solar'],
    tags: ['Outdoor', 'Vistas', 'Activo'],
    availableShifts: ['09:00', '09:30'],
    occupiedShiftsByDate: {},
    availableFrom: '', availableTo: '', unavailableDates: [],
  },
]

