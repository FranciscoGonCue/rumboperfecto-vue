<template>
  <div class="min-h-screen w-full transition-colors duration-300"
       :class="store.isDark ? 'bg-rp-bg' : 'bg-gray-50'">

    <div class="max-w-4xl mx-auto px-5 lg:px-10 pt-8 pb-16">

      <!-- Header -->
      <div class="mb-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
               style="background: var(--rp-accent);">
            <CalendarCheck :size="22" />
          </div>
          <div>
            <h1 class="text-3xl font-black uppercase tracking-tight"
                style="font-family: 'Syne', sans-serif;"
                :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
              Mis Reservas
            </h1>
            <p class="text-xs font-semibold mt-0.5"
               :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              Historial y reservas activas
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            v-for="f in filters" :key="f.value"
            @click="activeFilter = f.value"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
            :class="activeFilter === f.value
              ? 'text-white border-transparent'
              : (store.isDark ? 'border-rp-border text-rp-muted hover:text-rp-text' : 'border-gray-200 text-gray-500 hover:text-gray-800')"
            :style="activeFilter === f.value ? 'background: var(--rp-accent)' : ''"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center py-20 gap-3">
        <div class="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
             style="border-color: var(--rp-accent) transparent var(--rp-accent) var(--rp-accent)"></div>
        <p class="text-sm font-semibold" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Cargando reservas…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <p class="font-bold text-red-500 mb-4">{{ error }}</p>
        <button @click="loadReservas"
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style="background: var(--rp-accent)">Reintentar</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredReservas.length" class="text-center py-24">
        <CalendarX :size="48" class="mx-auto mb-4 opacity-20" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'" />
        <p class="font-bold text-lg" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
          {{ activeFilter === 'all' ? 'Aún no tienes reservas' : 'Sin reservas en este estado' }}
        </p>
        <p class="text-sm mt-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
          Reserva tu primera experiencia desde el catálogo
        </p>
      </div>

      <!-- Lista reservas -->
      <TransitionGroup v-else name="card-list" tag="div" class="space-y-4">
        <div
          v-for="r in filteredReservas" :key="r.id"
          class="rounded-2xl border overflow-hidden transition-all"
          :class="store.isDark
            ? 'bg-rp-surface border-rp-border hover:border-rp-accent/30'
            : 'bg-white border-gray-100 shadow-sm hover:shadow-md'"
        >
          <div class="flex gap-0">
            <!-- Imagen -->
            <div class="w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 overflow-hidden">
              <img
                v-if="r.servicio_imagen"
                :src="r.servicio_imagen"
                :alt="r.servicio_nombre ?? ''"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center"
                   :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-100'">
                <MapPin :size="24" class="opacity-20" />
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <div class="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p class="font-black text-sm lg:text-base leading-tight"
                       :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
                      {{ r.servicio_nombre ?? r.servicio }}
                    </p>
                    <p class="text-xs font-medium mt-0.5"
                       :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                      <MapPin :size="11" class="inline -mt-0.5 mr-0.5" />{{ r.servicio_ciudad ?? '—' }}
                      <span v-if="r.servicio_tipo" class="ml-2 opacity-70">· {{ r.servicio_tipo }}</span>
                    </p>
                  </div>
                  <span class="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        :class="estadoClass(r.estado)">
                    {{ r.estado }}
                  </span>
                </div>

                <!-- Fechas y turno -->
                <div class="flex flex-wrap gap-3 mt-2 text-xs font-semibold"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  <span class="flex items-center gap-1">
                    <Calendar :size="12" />
                    {{ formatDate(r.fecha_inicio) }}
                    <template v-if="r.fecha_fin"> → {{ formatDate(r.fecha_fin) }}</template>
                  </span>
                  <span v-if="r.turno" class="flex items-center gap-1">
                    <Clock :size="12" /> {{ r.turno }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Users :size="12" /> {{ r.personas }} persona{{ r.personas !== 1 ? 's' : '' }}
                  </span>
                  <span v-if="r.precio_total != null" class="flex items-center gap-1 font-bold"
                        style="color: var(--rp-accent)">
                    {{ r.precio_total.toLocaleString('es-ES', { minimumFractionDigits: 0 }) }} €
                  </span>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center justify-between mt-3">
                <p class="text-[10px]" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                  Ref. #{{ r.id }} · {{ formatDatetime(r.creado_en) }}
                </p>
                <button
                  v-if="r.estado !== 'Cancelada'"
                  @click="cancelar(r)"
                  class="text-[11px] font-bold px-3 py-1 rounded-lg border transition-all"
                  :class="store.isDark
                    ? 'border-red-900/40 text-red-400 hover:bg-red-950/30'
                    : 'border-red-100 text-red-500 hover:bg-red-50'"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Añadir reserva existente a un plan (una sola vez por reserva) -->
          <div
            v-if="r.estado !== 'Cancelada'"
            class="border-t transition-colors px-4 py-4"
            :class="store.isDark ? 'border-rp-border bg-rp-surface-2/50' : 'border-gray-100 bg-gray-50/80'"
          >
            <div
              v-if="reservaYaEnPlan(r)"
              class="rounded-2xl px-4 py-3.5 text-center text-xs font-semibold"
              :class="store.isDark ? 'bg-rp-surface border border-rp-border text-rp-muted' : 'bg-white border border-gray-200 text-gray-600'"
            >
              <span class="font-black uppercase tracking-wider text-[10px]" :class="store.isDark ? 'text-rp-accent' : 'text-orange-600'">
                Ya en un plan
              </span>
              <p class="mt-1 normal-case">{{ planLabelForReserva(r) }}</p>
            </div>

            <template v-else>
            <button
              type="button"
              class="w-full py-4 px-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] flex flex-col items-center justify-center gap-1"
              style="background: var(--rp-accent); color: #fff; box-shadow: 0 10px 28px rgba(249,115,22,0.35);"
              :aria-expanded="planPickerReservaId === r.id"
              @click="togglePlanPicker(r)"
            >
              <span class="inline-flex items-center gap-2.5 text-sm sm:text-base">
                <BookmarkPlus :size="24" />
                Añadir al plan
              </span>
              <span class="text-[10px] sm:text-[11px] font-semibold normal-case tracking-wide opacity-90 text-center px-1">
                Elige el viaje donde guardar esta reserva
              </span>
            </button>

            <div
              v-if="planPickerReservaId === r.id"
              class="rounded-2xl p-4 space-y-3 border mt-3 transition-colors"
              :class="store.isDark
                ? 'bg-rp-surface border-rp-border'
                : 'bg-white border-orange-100 shadow-sm'"
            >
              <p class="text-xs font-black uppercase tracking-widest mb-0.5"
                 :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Tus planes
              </p>

              <div
                v-if="plansPickerLoading"
                class="flex items-center justify-center gap-3 py-6 text-xs font-semibold"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'"
              >
                <span
                  class="inline-block w-8 h-8 rounded-full border-[3px] border-transparent animate-spin shrink-0"
                  style="border-top-color: var(--rp-accent); border-left-color: rgba(249,115,22,0.35);"
                />
                Cargando planes…
              </div>
              <p
                v-else-if="plansPickerError"
                class="text-xs text-red-400 font-semibold"
              >
                {{ plansPickerError }}
              </p>
              <div
                v-else-if="store.planes.length === 0"
                class="rounded-xl p-3 text-xs transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface-2 border border-rp-border text-rp-muted'
                  : 'border border-gray-200 bg-gray-50 text-gray-600'"
              >
                No tienes planes. Crea uno desde Mis viajes.
              </div>
              <div v-else class="space-y-2 max-h-56 overflow-y-auto pr-1">
                <button
                  v-for="plan in store.planes"
                  :key="plan.id_plan"
                  type="button"
                  class="w-full text-left p-3 rounded-xl border-2 transition-all text-sm"
                  :class="selectedPlanId === String(plan.id_plan)
                    ? store.isDark
                      ? 'border-rp-accent bg-orange-950/25 ring-1 ring-orange-500/30'
                      : 'border-orange-500 bg-orange-50 ring-1 ring-orange-200'
                    : store.isDark
                      ? 'border-rp-border hover:border-rp-accent/50 bg-rp-surface-2'
                      : 'border-gray-200 hover:border-orange-200 bg-white'"
                  @click="selectedPlanId = String(plan.id_plan)"
                >
                  <span class="font-bold uppercase tracking-wide block" :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
                    {{ plan.nombre_plan?.trim() || `Plan ${plan.id_plan}` }}
                  </span>
                  <span class="text-[11px] mt-1 block" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                    {{ formatPlanRange(plan) }}
                  </span>
                </button>
              </div>
              <p v-if="planModalError && planPickerReservaId === r.id" class="text-xs text-red-400 font-semibold">{{ planModalError }}</p>
              <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
                <button
                  type="button"
                  class="w-full sm:w-auto px-3 py-2.5 rounded-xl border font-bold text-xs transition-colors"
                  :class="store.isDark ? 'border-rp-border text-rp-muted hover:bg-rp-surface-2' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                  @click="closePlanPicker"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white disabled:opacity-55 transition-colors"
                  style="background: var(--rp-accent);"
                  :disabled="plansPickerLoading || store.planes.length === 0 || !selectedPlanId"
                  @click="confirmAddToPlan(r)"
                >
                  Añadir a este plan
                </button>
              </div>
            </div>
            </template>
          </div>
        </div>
      </TransitionGroup>

    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white"
           :style="`background: ${toast.type === 'success' ? 'var(--rp-accent)' : '#ef4444'}`">
        <span>{{ toast.icon }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Calendar, CalendarCheck, CalendarX, Clock, MapPin, Users, BookmarkPlus } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { plansApi, reservasApi, tiposServicioApi, apiErrorMessage, type Reserva } from '@/services/api'
import type { PlanViaje } from '@/types'

const store = useAppStore()

const reservas = ref<Reserva[]>([])
const loading  = ref(false)
const error    = ref<string | null>(null)

const filters = [
  { label: 'Todas',     value: 'all'       },
  { label: 'Activas',   value: 'Pendiente' },
  { label: 'Confirmadas', value: 'Confirmada' },
  { label: 'Canceladas', value: 'Cancelada' },
]
const activeFilter = ref<string>('all')

const filteredReservas = computed(() =>
  activeFilter.value === 'all'
    ? reservas.value
    : reservas.value.filter(r => r.estado === activeFilter.value)
)

async function loadReservas() {
  loading.value = true
  error.value = null
  try {
    const [list] = await Promise.all([
      reservasApi.getMias(),
      store.isAuthenticated ? store.fetchPlanes() : Promise.resolve(),
    ])
    reservas.value = list
  } catch {
    error.value = 'No se pudieron cargar las reservas.'
  } finally {
    loading.value = false
  }
}

async function cancelar(r: Reserva) {
  const ok = window.confirm(
    '¿Seguro que quieres cancelar esta reserva? Podrás seguir viéndola como cancelada en el listado.'
  )
  if (!ok) return
  try {
    const updated = await reservasApi.cancelar(r.id)
    const idx = reservas.value.findIndex(x => x.id === r.id)
    if (idx !== -1) reservas.value[idx] = updated
    showToast('✅', 'Reserva cancelada')
  } catch {
    showToast('❌', 'Error al cancelar', 'error')
  }
}

function estadoClass(estado: Reserva['estado']) {
  if (estado === 'Confirmada') return store.isDark
    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  if (estado === 'Cancelada') return store.isDark
    ? 'bg-red-950/40 text-red-400 border border-red-900/40'
    : 'bg-red-50 text-red-500 border border-red-100'
  return store.isDark
    ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
    : 'bg-amber-50 text-amber-600 border border-amber-100'
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatDatetime(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })
function showToast(icon: string, message: string, type = 'success') {
  toast.value = { show: true, message, type, icon }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(loadReservas)

watch(() => store.currentView, (v) => { if (v === 'reservas') loadReservas() })

const planPickerReservaId = ref<number | null>(null)
const selectedPlanId = ref('')
const planModalError = ref('')
const plansPickerLoading = ref(false)
const plansPickerError = ref('')

function formatPlanRange(plan: PlanViaje): string {
  const a = plan.fecha_inicio ? formatDate(plan.fecha_inicio) : '—'
  const b = plan.fecha_fin ? formatDate(plan.fecha_fin) : '—'
  return `${a} — ${b}`
}

function reservaYaEnPlan(r: Reserva): boolean {
  const rid = r.id
  return store.planes.some((p) =>
    (p.items ?? []).some((it) => (it.reserva_id ?? null) === rid))
}

function planLabelForReserva(r: Reserva): string {
  const plan = store.planes.find((p) =>
    (p.items ?? []).some((it) => (it.reserva_id ?? null) === r.id))
  if (!plan) return 'Esta reserva ya figura en uno de tus planes.'
  const title = plan.nombre_plan?.trim()
  return title ? `Incluida en «${title}».` : `Incluida en el plan #${plan.id_plan}.`
}

async function togglePlanPicker(r: Reserva) {
  if (reservaYaEnPlan(r)) return

  if (planPickerReservaId.value === r.id) {
    closePlanPicker()
    return
  }
  planModalError.value = ''
  plansPickerError.value = ''
  planPickerReservaId.value = r.id
  selectedPlanId.value = ''

  if (!store.isAuthenticated) {
    plansPickerError.value = 'Inicia sesión para ver tus planes.'
    return
  }

  plansPickerLoading.value = true
  try {
    const list = await plansApi.getAll()
    store.planes = list
    selectedPlanId.value = list[0] ? String(list[0].id_plan) : ''
  } catch (e) {
    plansPickerError.value = apiErrorMessage(
      e,
      'No se pudieron cargar tus planes. Inténtalo de nuevo.',
    )
  } finally {
    plansPickerLoading.value = false
  }
}

function closePlanPicker() {
  planPickerReservaId.value = null
  planModalError.value = ''
  plansPickerError.value = ''
}

function turnoToDisplayTime(turno: string | null): string {
  if (!turno) return '12:00'
  const t = turno.trim()
  return t.length >= 5 ? t.slice(0, 5) : t
}

function normalizeTipoLabel(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** id_tipo del catálogo para el ItemPlan (evita clasificar todo como Alojamiento en el planificador). */
async function resolveTipoIdForReserva(r: Reserva): Promise<number | null> {
  if (r.servicio_tipo_id != null) return r.servicio_tipo_id
  const label = r.servicio_tipo?.trim()
  if (!label) return null
  try {
    const tipos = await tiposServicioApi.getAll()
    const target = normalizeTipoLabel(label)
    const exact = tipos.find((t) => normalizeTipoLabel(t.nombre_tipo ?? '') === target)
    if (exact) return exact.id_tipo
    return (
      tipos.find((t) => {
        const n = normalizeTipoLabel(t.nombre_tipo ?? '')
        return n.includes(target) || target.includes(n)
      })?.id_tipo ?? null
    )
  } catch {
    return null
  }
}

function firstApiErrorDetail(err: unknown): string | null {
  const res = err as { response?: { data?: Record<string, unknown> } }
  const data = res.response?.data
  if (!data || typeof data !== 'object') return null
  const d = data.detail
  if (typeof d === 'string' && d.trim()) return d
  for (const v of Object.values(data)) {
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
    if (typeof v === 'string') return v
  }
  return null
}

async function confirmAddToPlan(r: Reserva) {
  planModalError.value = ''
  if (reservaYaEnPlan(r)) {
    planModalError.value = 'Esta reserva ya está en un plan.'
    return
  }
  if (!selectedPlanId.value) {
    planModalError.value = 'Selecciona un plan.'
    return
  }
  const planViaje = store.planes.find(p => String(p.id_plan) === selectedPlanId.value)
  if (!planViaje) {
    planModalError.value = 'No se encontró el plan.'
    return
  }
  if (!planViaje.fecha_inicio || !planViaje.fecha_fin) {
    planModalError.value = 'El plan no tiene fechas completas; edítalo en Mis viajes.'
    return
  }
  const start = new Date(`${planViaje.fecha_inicio}T12:00:00`)
  const end = new Date(`${planViaje.fecha_fin}T12:00:00`)
  const resDate = new Date(`${r.fecha_inicio}T12:00:00`)
  if (resDate < start || resDate > end) {
    planModalError.value = 'La fecha de esta reserva no encaja en las fechas de ese viaje.'
    return
  }
  const tipo = r.servicio_tipo ? `${r.servicio_tipo}: ` : ''
  const nombreServicio = `${tipo}${r.servicio_nombre ?? r.servicio}`
  const hm = turnoToDisplayTime(r.turno)
  const fechaHoraInicio = `${r.fecha_inicio}T${hm}:00`

  const tipoId = await resolveTipoIdForReserva(r)
  if (tipoId == null) {
    planModalError.value =
      'No se pudo determinar el tipo de servicio. Recarga Mis reservas tras actualizar la app o revisa que el servicio tenga tipo en el catálogo.'
    return
  }

  try {
    await plansApi.createItem(planViaje.id_plan, {
      nombre_servicio: nombreServicio,
      tipo: tipoId,
      reserva: r.id,
      fecha_hora_inicio: fechaHoraInicio,
      precio_estimado: r.precio_total ?? null,
    })
    await store.fetchPlanes()
    closePlanPicker()
    showToast('✅', 'Reserva añadida al plan')
    store.setCurrentView('plan')
  } catch (e) {
    planModalError.value =
      firstApiErrorDetail(e) ?? 'No se pudo añadir al plan. Inténtalo de nuevo.'
  }
}
</script>

<style scoped>
.card-list-enter-active { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
.card-list-leave-active { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: absolute; }
.card-list-enter-from  { opacity: 0; transform: translateY(12px); }
.card-list-leave-to    { opacity: 0; transform: translateY(-4px); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
