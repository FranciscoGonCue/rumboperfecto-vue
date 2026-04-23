export type RestaurantMock = {
  id: string
  name: string
  image: string
  cuisine: string
  priceRange: string
  address: string
  city: string
  rating: number
  reviewsCount: number
  avgPricePerPerson: number
  currency: string
  openNow: boolean
  description: string
  specialties: string[]
  tags: string[]
  schedule: Record<string, string>
}

export const restaurantsMock: RestaurantMock[] = [
  {
    id: 'r-1',
    name: 'La Brasa Moderna',
    image:
      'https://images.unsplash.com/photo-1555992336-03a23c7b20b1?auto=format&fit=crop&w=1800&q=80',
    cuisine: 'Mediterránea',
    priceRange: '€€',
    address: 'Calle del Mercado 12',
    city: 'Valencia',
    rating: 4.7,
    reviewsCount: 1520,
    avgPricePerPerson: 24,
    currency: '€',
    openNow: true,
    description:
      'Carta corta, producto fresco y brasas. Ambiente moderno con opciones vegetarianas.',
    specialties: ['Arroz meloso', 'Verduras a la brasa', 'Tarta de queso'],
    tags: ['Casual', 'Terraza', 'Para compartir'],
    schedule: {
      Lun: '13:00–16:00 · 20:00–23:00',
      Mar: '13:00–16:00 · 20:00–23:00',
      Mié: '13:00–16:00 · 20:00–23:00',
      Jue: '13:00–16:00 · 20:00–23:30',
      Vie: '13:00–16:30 · 20:00–00:00',
      Sáb: '13:00–16:30 · 20:00–00:00',
      Dom: '13:00–16:00',
    },
  },
  {
    id: 'r-2',
    name: 'Sabor de Barrio',
    image:
      'https://images.unsplash.com/photo-1541544181051-e46601ce3cfc?auto=format&fit=crop&w=1800&q=80',
    cuisine: 'Tapas',
    priceRange: '€',
    address: 'Plaza Central 3',
    city: 'Sevilla',
    rating: 4.4,
    reviewsCount: 860,
    avgPricePerPerson: 16,
    currency: '€',
    openNow: false,
    description:
      'Tapas clásicas, raciones generosas y buen precio. Ideal para ir en grupo.',
    specialties: ['Croquetas', 'Solomillo al whisky', 'Tortilla'],
    tags: ['Tradicional', 'Ruidoso', 'Grupos'],
    schedule: {
      Lun: 'Cerrado',
      Mar: '12:30–16:00 · 19:30–23:30',
      Mié: '12:30–16:00 · 19:30–23:30',
      Jue: '12:30–16:00 · 19:30–23:30',
      Vie: '12:30–16:30 · 19:30–00:00',
      Sáb: '12:30–16:30 · 19:30–00:00',
      Dom: '12:30–16:00',
    },
  },
  {
    id: 'r-3',
    name: 'Ramen & Co.',
    image:
      'https://images.unsplash.com/photo-1604909053672-6f9b2d2b88d0?auto=format&fit=crop&w=1800&q=80',
    cuisine: 'Japonesa',
    priceRange: '€€',
    address: 'Avenida del Puerto 80',
    city: 'Barcelona',
    rating: 4.6,
    reviewsCount: 1100,
    avgPricePerPerson: 22,
    currency: '€',
    openNow: true,
    description:
      'Caldo cocido 12 horas, noodles artesanos y opciones picantes. Reserva recomendada.',
    specialties: ['Tonkotsu', 'Gyozas', 'Mochi'],
    tags: ['Moderno', 'Rápido', 'Picante'],
    schedule: {
      Lun: '13:00–16:00 · 20:00–23:00',
      Mar: '13:00–16:00 · 20:00–23:00',
      Mié: '13:00–16:00 · 20:00–23:00',
      Jue: '13:00–16:00 · 20:00–23:00',
      Vie: '13:00–16:30 · 20:00–23:30',
      Sáb: '13:00–16:30 · 20:00–23:30',
      Dom: '13:00–16:00 · 20:00–22:30',
    },
  },
]

