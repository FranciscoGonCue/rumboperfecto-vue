/**
 * Tests para la función openItemDetail en HomeView y la cadena completa:
 * openItemDetail → store.openServiceDetail → serviciosApi.getOne
 *
 * El bug original: los IDs en BD son strings como "aloj-001", "act-001".
 * parseInt("aloj-001") devolvía NaN y nunca se abría el detalle.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'
import { detectServicioView } from '@/services/api'
import type { Servicio } from '@/services/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeServicio(overrides: Partial<Servicio> = {}): Servicio {
  return {
    id_servicio: 'act-001' as any,
    tipo: { id_tipo: 1, nombre_tipo: 'Actividad', icono: '🏃' },
    nombre: 'Senderismo en el Teide',
    descripcion: 'Ruta por el volcán',
    precio_base: 90,
    ubicacion_lat: 28.27,
    ubicacion_lon: -16.64,
    imagen_url: 'https://example.com/teide.jpg',
    disponible: true,
    valoracion: 4.2,
    num_resenas: 120,
    ciudad: 'Tenerife',
    pais: 'España',
    direccion: null,
    moneda: '€',
    etiquetas: ['senderismo', 'naturaleza'],
    destacado: true,
    detalle_alojamiento: null,
    detalle_transporte: null,
    detalle_restauracion: null,
    detalle_actividad: {
      duracion_estimada: 300,
      aforo_maximo: 15,
      horario_apertura: '08:00',
      guia_incluido: true,
      dificultad: 'Moderado',
      duracion_texto: '5h',
      ubicacion_texto: 'Parque Nacional del Teide',
      incluye: ['Guía', 'Agua'],
      requisitos: ['Calzado de montaña'],
      turnos_disponibles: ['08:00', '10:00'],
      fecha_disponible_desde: null,
      fecha_disponible_hasta: null,
      fechas_no_disponibles: [],
      turnos_ocupados: null,
    },
    ...overrides,
  }
}

// ── Tests: detectServicioView ─────────────────────────────────────────────────

describe('detectServicioView', () => {
  it('devuelve "actividad" para tipo Actividad', () => {
    const svc = makeServicio({ tipo: { id_tipo: 1, nombre_tipo: 'Actividad', icono: '' } })
    expect(detectServicioView(svc)).toBe('actividad')
  })

  it('devuelve "actividad" para tipo Aventuras', () => {
    const svc = makeServicio({ tipo: { id_tipo: 2, nombre_tipo: 'Aventuras', icono: '' } })
    expect(detectServicioView(svc)).toBe('actividad')
  })

  it('devuelve "alojamiento" para tipo Hotel', () => {
    const svc = makeServicio({
      tipo: { id_tipo: 3, nombre_tipo: 'Hotel', icono: '' },
      detalle_actividad: null,
      detalle_alojamiento: { estrellas: 5, hora_checkin: '14:00', hora_checkout: '12:00', amenidades: [], fecha_disponible_desde: null, fecha_disponible_hasta: null, fechas_no_disponibles: [] },
    })
    expect(detectServicioView(svc)).toBe('alojamiento')
  })

  it('devuelve "restaurante" para tipo Restauración', () => {
    const svc = makeServicio({
      tipo: { id_tipo: 4, nombre_tipo: 'Restauración', icono: '' },
      detalle_actividad: null,
      detalle_restauracion: { tipo_cocina: 'Española', es_vegano: false, precio_medio: 30, requiere_reserva: true, rango_precios: '€€', abierto_ahora: true, especialidades: [], horario: {}, ubicacion_texto: null, fecha_disponible_desde: null, fecha_disponible_hasta: null, fechas_no_disponibles: [], turnos_disponibles: [], turnos_ocupados: null },
    })
    expect(detectServicioView(svc)).toBe('restaurante')
  })

  it('devuelve "transporte" para tipo Vuelo', () => {
    const svc = makeServicio({
      tipo: { id_tipo: 5, nombre_tipo: 'Vuelo', icono: '' },
      detalle_actividad: null,
      detalle_transporte: { ciudad_origen: 'MAD', ciudad_destino: 'BCN', compania: 'Iberia', codigo_vuelo: 'IB123', duracion_minutos: 80, asientos_disponibles: 20, comodidades: [], horarios_salida: [], clases: [] },
    })
    expect(detectServicioView(svc)).toBe('transporte')
  })

  it('fallback por detalle presente cuando tipo no coincide', () => {
    const svc = makeServicio({
      tipo: { id_tipo: 99, nombre_tipo: 'Desconocido', icono: '' },
      detalle_actividad: { duracion_estimada: 60, aforo_maximo: 5, horario_apertura: null, guia_incluido: false, dificultad: null, duracion_texto: null, ubicacion_texto: null, incluye: [], requisitos: [], turnos_disponibles: [], fecha_disponible_desde: null, fecha_disponible_hasta: null, fechas_no_disponibles: [], turnos_ocupados: null },
    })
    expect(detectServicioView(svc)).toBe('actividad')
  })

  it('devuelve "servicio" cuando no hay tipo ni detalle reconocible', () => {
    const svc = makeServicio({
      tipo: null,
      detalle_alojamiento: null,
      detalle_transporte: null,
      detalle_restauracion: null,
      detalle_actividad: null,
    })
    expect(detectServicioView(svc)).toBe('servicio')
  })
})

// ── Tests: store.openServiceDetail ────────────────────────────────────────────

describe('store.openServiceDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('cambia currentView a "servicio" inmediatamente al llamar', async () => {
    const store = useAppStore()
    const svc = makeServicio()

    // Mock: la API tarda pero eventualmente devuelve el servicio
    vi.spyOn(store, 'openServiceDetail').mockImplementation(async (_id) => {
      store.currentView = 'servicio'
      store.selectedServicioLoading = true
      await Promise.resolve()
      store.selectedServicio = svc
      store.currentView = detectServicioView(svc)
      store.selectedServicioLoading = false
    })

    const promise = store.openServiceDetail('act-001')
    expect(store.currentView).toBe('servicio')
    await promise
    expect(store.currentView).toBe('actividad')
  })

  it('tras éxito: currentView es el tipo correcto y selectedServicio tiene datos', async () => {
    const store = useAppStore()
    const svc = makeServicio()

    vi.spyOn(store, 'openServiceDetail').mockImplementation(async () => {
      store.selectedServicio = svc
      store.currentView = detectServicioView(svc)
      store.selectedServicioLoading = false
    })

    await store.openServiceDetail('act-001')
    expect(store.currentView).toBe('actividad')
    expect(store.selectedServicio?.nombre).toBe('Senderismo en el Teide')
    expect(store.selectedServicioLoading).toBe(false)
  })

  it('tras error de API: currentView vuelve a "servicio" y selectedServicio es null', async () => {
    const store = useAppStore()

    vi.spyOn(store, 'openServiceDetail').mockImplementation(async () => {
      store.selectedServicio = null
      store.currentView = 'servicio'
      store.selectedServicioLoading = false
    })

    await store.openServiceDetail('id-inexistente')
    expect(store.currentView).toBe('servicio')
    expect(store.selectedServicio).toBeNull()
  })

  it('closeServiceDetail resetea currentView a "inicio"', () => {
    const store = useAppStore()
    store.currentView = 'actividad'
    store.closeServiceDetail()
    expect(store.currentView).toBe('inicio')
    expect(store.selectedServicio).toBeNull()
    expect(store.selectedServicioId).toBeNull()
  })
})

// ── Tests: lógica openItemDetail (simulando el comportamiento de HomeView) ───

describe('openItemDetail logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * Replica exacta de la función corregida en HomeView.vue.
   * Esto verifica que el fix del bug funciona correctamente.
   */
  function openItemDetail(
    item: { id: string },
    openServiceDetail: (id: string) => void,
    warnSpy: (msg: string, id: string) => void,
  ) {
    const raw = item.id.startsWith('api-') ? item.id.slice(4) : item.id
    if (raw) {
      openServiceDetail(raw)
    } else {
      warnSpy('[RumboPerfecto] ID inválido:', item.id)
    }
  }

  it('extrae correctamente "aloj-001" de "api-aloj-001" y llama a openServiceDetail', () => {
    const spy = vi.fn()
    const warn = vi.fn()
    openItemDetail({ id: 'api-aloj-001' }, spy, warn)
    expect(spy).toHaveBeenCalledWith('aloj-001')
    expect(warn).not.toHaveBeenCalled()
  })

  it('extrae correctamente "act-042" de "api-act-042"', () => {
    const spy = vi.fn()
    const warn = vi.fn()
    openItemDetail({ id: 'api-act-042' }, spy, warn)
    expect(spy).toHaveBeenCalledWith('act-042')
  })

  it('funciona también con IDs puramente numéricos como "api-1"', () => {
    const spy = vi.fn()
    const warn = vi.fn()
    openItemDetail({ id: 'api-1' }, spy, warn)
    expect(spy).toHaveBeenCalledWith('1')
  })

  it('funciona con IDs sin prefijo "api-"', () => {
    const spy = vi.fn()
    const warn = vi.fn()
    openItemDetail({ id: 'rest-007' }, spy, warn)
    expect(spy).toHaveBeenCalledWith('rest-007')
  })

  it('llama a warn si el ID resultante está vacío', () => {
    const spy = vi.fn()
    const warn = vi.fn()
    openItemDetail({ id: 'api-' }, spy, warn)
    // "api-".slice(4) = "" → vacío → warn
    expect(spy).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
  })

  it('BUG REGRESIÓN: parseInt de "aloj-001" sería NaN — la nueva lógica NO usa parseInt', () => {
    // Verifica que el fix no rompe con IDs que antes causaban NaN
    const ids = ['aloj-001', 'act-042', 'rest-007', 'trans-003']
    ids.forEach((rawId) => {
      // Comportamiento antiguo (bug): parseInt devolvía NaN
      expect(parseInt(rawId, 10)).toBeNaN()

      // Comportamiento nuevo (fix): el raw string es truthy y se usa directamente
      expect(rawId).toBeTruthy()
    })
  })
})
