<template>
  <div class="pd-root" :class="store.isDark ? 'dark-mode' : 'light-mode'">

    <!-- ══ HEADER ══ -->
    <header class="pd-header flex items-center gap-3 px-4 lg:px-6 py-3">
      <button class="back-btn flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm" @click="$emit('close')">
        <ArrowLeft :size="15" /><span class="hidden sm:inline">Mis Viajes</span>
      </button>

      <div class="flex-1 min-w-0">
        <h1 class="pd-title text-lg font-black uppercase tracking-tighter truncate" style="font-family:'Syne',sans-serif;">
          {{ plan.nombre_plan || `Plan ${plan.id_plan}` }}
        </h1>
        <p class="pd-meta text-[10px] font-bold uppercase tracking-widest mt-0.5">
          {{ plan.fecha_inicio ? fmtFull(plan.fecha_inicio) : '—' }} → {{ plan.fecha_fin ? fmtFull(plan.fecha_fin) : '—' }} · {{ totalDays }} días
        </p>
      </div>

      <span v-if="plan.estado_plan" class="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase"
        :class="{
          'bg-yellow-500/15 text-yellow-500': plan.estado_plan === 'Borrador',
          'bg-green-500/15 text-green-500': plan.estado_plan === 'Confirmado',
          'bg-gray-500/15 text-gray-400': plan.estado_plan === 'Finalizado',
        }">{{ plan.estado_plan }}</span>

      <!-- type pills -->
      <div class="hidden lg:flex items-center gap-1.5">
        <div v-for="t in serviceTypes" :key="t.id" class="stat-pill flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black" :style="`--pc:${t.color}`">
          <component :is="t.icon" :size="10" /><span>{{ plan.items.filter(i => matchesType(i, t.id)).length }}</span>
        </div>
      </div>

      <button class="add-fab flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-white" @click="openAddModal()">
        <Plus :size="14" /><span class="hidden sm:inline">Añadir</span>
      </button>
      <button class="delete-btn p-2.5 rounded-xl" @click="confirmDelete"><Trash2 :size="15" /></button>
    </header>

    <!-- ══ BODY ══ -->
    <div v-if="loading" class="flex-1 flex justify-center items-center py-20">
      <div class="w-10 h-10 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>

    <div v-else class="pd-body flex overflow-hidden" style="height:calc(100vh - 56px);">

      <!-- ── CALENDAR ── -->
      <div class="pd-cal flex-1 overflow-hidden p-3 lg:p-5" style="min-width:0;">
        <FullCalendar ref="calRef" :options="calendarOptions" class="pd-fc h-full" />
      </div>

      <!-- ── RIGHT PANEL ── -->
      <Transition name="panel-slide">
        <aside v-if="selectedDay" class="pd-panel flex flex-col" style="width:320px;flex-shrink:0;">

          <!-- Panel header -->
          <div class="panel-header flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{{ dayLong(selectedDay) }}</p>
              <h2 class="text-2xl font-black uppercase tracking-tighter leading-none" style="font-family:'Syne',sans-serif;">
                Día <span class="text-accent">{{ selectedDayIndex }}</span>
              </h2>
            </div>
            <div class="flex items-center gap-2">
              <button class="add-day-btn flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs text-white" @click="openAddModal(selectedDayIndex)">
                <Plus :size="12" /> Añadir
              </button>
              <button class="close-panel-btn p-2 rounded-xl" @click="selectedDay = null"><X :size="14" /></button>
            </div>
          </div>

          <!-- Panel items -->
          <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
            <div v-if="selectedDayItems.length === 0" class="empty-panel flex flex-col items-center justify-center py-10 text-center rounded-2xl mt-2">
              <CalendarPlus :size="28" class="opacity-30 mb-3" />
              <p class="text-sm font-black uppercase opacity-40">Día libre</p>
              <button class="add-cta mt-4 px-4 py-2 rounded-xl font-black text-xs text-white uppercase tracking-widest" @click="openAddModal(selectedDayIndex)">+ Añadir evento</button>
            </div>

            <div v-else v-for="item in selectedDayItems" :key="item.id_item"
              class="panel-item rounded-2xl group" :style="`--ca:${svc(item).color}`">
              <div class="h-[3px] rounded-t-2xl" :style="`background:${svc(item).color}`" />
              <div class="p-3 flex gap-2.5 items-start">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  :style="`background:${svc(item).color}18;color:${svc(item).color}`">
                  <component :is="svc(item).icon" :size="16" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-1">
                    <div>
                      <p class="text-[8px] font-black uppercase tracking-widest mb-0.5" :style="`color:${svc(item).color}`">{{ svc(item).label }}</p>
                      <h4 class="font-black text-sm uppercase leading-tight" style="font-family:'Syne',sans-serif;">
                        {{ item.nombre_servicio || `Ítem ${item.id_item}` }}
                      </h4>
                    </div>
                    <button class="del-item-btn opacity-0 group-hover:opacity-100 p-1 rounded-lg flex-shrink-0 transition-all"
                      @click="handleDeleteItem(item)">
                      <Trash2 :size="11" />
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                    <span v-if="item.fecha_hora_inicio" class="text-[10px] font-bold opacity-50 flex items-center gap-0.5">
                      <Clock :size="9" />{{ fmtTime(item.fecha_hora_inicio) }}
                      <template v-if="item.fecha_hora_fin"> → {{ fmtTime(item.fecha_hora_fin) }}</template>
                    </span>
                    <span v-if="item.estado_pago" class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-700': item.estado_pago === 'Pendiente',
                        'bg-green-100 text-green-700': item.estado_pago === 'Pagado',
                        'bg-red-100 text-red-600': item.estado_pago === 'Cancelado',
                      }">{{ item.estado_pago }}</span>
                  </div>
                  <div class="flex gap-2 mt-1.5">
                    <span v-if="item.monto_total != null" class="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                      :style="`background:${svc(item).color}12;color:${svc(item).color}`">
                      {{ item.monto_total.toFixed(2) }} €
                    </span>
                    <span v-if="item.localizador_confirmacion" class="text-[10px] opacity-40 font-semibold">
                      Loc: {{ item.localizador_confirmacion }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div v-if="selectedDayItems.length > 0" class="panel-footer px-5 py-3 flex items-center justify-between">
            <span class="text-[10px] font-black uppercase opacity-40">Total día</span>
            <span class="text-lg font-black text-accent">
              {{ selectedDayItems.reduce((s, i) => s + (i.monto_total ?? i.precio_estimado ?? 0), 0).toFixed(2) }} €
            </span>
          </div>
        </aside>
      </Transition>
    </div>

    <!-- ══ ADD ITEM MODAL ══ -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showAddModal"
          class="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
          style="background:rgba(0,0,0,0.78);backdrop-filter:blur(12px)"
          @click.self="showAddModal = false">

          <div class="add-sheet w-full sm:max-w-[500px] rounded-t-[32px] sm:rounded-[32px] overflow-hidden relative">

            <!-- Progress -->
            <div class="flex gap-1.5 px-6 pt-5 pb-3">
              <div v-for="s in 3" :key="s" class="h-1 rounded-full flex-1 transition-all duration-500"
                :style="s <= step ? `background:${currentType.color}` : 'background:var(--border)'" />
            </div>
            <p class="px-6 pb-4 text-[10px] font-black uppercase tracking-[0.18em] opacity-35">
              {{ ['Elige el tipo', 'Rellena los detalles', 'Confirma y añade'][step - 1] }}
            </p>

            <!-- STEP 1 -->
            <Transition name="step-slide" mode="out-in">
              <div v-if="step === 1" key="s1" class="px-6 pb-6 space-y-4">
                <div>
                  <h3 class="modal-title text-xl font-black uppercase" style="font-family:'Syne',sans-serif;">¿Qué vas a añadir?</h3>
                  <p class="text-xs opacity-40 font-bold uppercase tracking-widest mt-0.5">Día {{ form.day }} · {{ form.day <= totalDays ? dayShort(form.day) : '' }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <button v-for="t in serviceTypes" :key="t.id"
                    class="type-card flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden"
                    :class="form.typeId === t.id ? 'type-card-sel' : ''"
                    :style="form.typeId === t.id ? `border-color:${t.color};background:${t.color}14` : ''"
                    @click="form.typeId = t.id">
                    <div class="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      :class="form.typeId === t.id ? 'opacity-100' : 'opacity-0'"
                      :style="`background:radial-gradient(circle at 30% 30%, ${t.color}20, transparent 70%)`" />
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 transition-all"
                      :style="form.typeId === t.id ? `background:${t.color};color:#fff;box-shadow:0 6px 20px ${t.color}55` : `background:${t.color}18;color:${t.color}`">
                      <component :is="t.icon" :size="22" />
                    </div>
                    <div class="relative z-10">
                      <p class="font-black uppercase tracking-wide text-sm">{{ t.label }}</p>
                      <p class="text-[10px] opacity-50 font-semibold mt-0.5">{{ t.desc }}</p>
                    </div>
                    <div v-if="form.typeId === t.id" class="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" :style="`background:${t.color}`">
                      <CheckCircle2 :size="13" class="text-white" />
                    </div>
                  </button>
                </div>
                <button class="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm text-white"
                  :style="`background:${currentType.color};box-shadow:0 6px 20px ${currentType.color}45`"
                  @click="step = 2">Continuar →</button>
              </div>
            </Transition>

            <!-- STEP 2 -->
            <Transition name="step-slide" mode="out-in">
              <div v-if="step === 2" key="s2" class="px-6 pb-6 space-y-3">
                <div class="flex items-center gap-3 mb-2">
                  <button class="back-step p-2 rounded-xl" @click="step = 1"><ChevronLeft :size="15" /></button>
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="`background:${currentType.color};color:#fff`">
                      <component :is="currentType.icon" :size="16" />
                    </div>
                    <div>
                      <p class="font-black uppercase text-sm" :style="`color:${currentType.color}`">{{ currentType.label }}</p>
                      <p class="text-[10px] opacity-40 font-bold">Día {{ form.day }}</p>
                    </div>
                  </div>
                </div>
                <div class="field"><label class="flbl">{{ currentType.nameLabel }} *</label>
                  <input v-model="form.nombre" type="text" class="finput w-full" :placeholder="currentType.placeholder" @keyup.enter="form.nombre && (step=3)" /></div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="field"><label class="flbl">{{ currentType.startLabel }}</label>
                    <input v-model="form.fechaInicio" type="datetime-local" class="finput w-full" /></div>
                  <div class="field"><label class="flbl">{{ currentType.endLabel }}</label>
                    <input v-model="form.fechaFin" type="datetime-local" class="finput w-full" /></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="field"><label class="flbl">Precio (€)</label>
                    <input v-model="form.precio" type="number" min="0" step="0.01" class="finput w-full" placeholder="0.00" /></div>
                  <div class="field"><label class="flbl">Estado pago</label>
                    <select v-model="form.estadoPago" class="finput w-full">
                      <option value="">Sin definir</option>
                      <option>Pendiente</option><option>Pagado</option><option>Cancelado</option>
                    </select></div>
                </div>
                <div class="field"><label class="flbl">{{ currentType.locLabel }}</label>
                  <input v-model="form.localizador" type="text" class="finput w-full" :placeholder="currentType.locPlaceholder" /></div>
                <button class="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm text-white disabled:opacity-40"
                  :style="`background:${currentType.color};box-shadow:0 6px 20px ${currentType.color}45`"
                  :disabled="!form.nombre" @click="step = 3">Vista previa →</button>
              </div>
            </Transition>

            <!-- STEP 3 -->
            <Transition name="step-slide" mode="out-in">
              <div v-if="step === 3" key="s3" class="px-6 pb-6 space-y-4">
                <div class="flex items-center gap-3 mb-1">
                  <button class="back-step p-2 rounded-xl" @click="step = 2"><ChevronLeft :size="15" /></button>
                  <p class="font-black uppercase text-sm opacity-50">Vista previa</p>
                </div>
                <div class="preview-card rounded-2xl overflow-hidden" :style="`border:1px solid ${currentType.color}35`">
                  <div class="h-[3px]" :style="`background:${currentType.color}`" />
                  <div class="p-4 flex gap-3">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      :style="`background:${currentType.color}18;color:${currentType.color}`">
                      <component :is="currentType.icon" :size="19" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[9px] font-black uppercase" :style="`color:${currentType.color}`">{{ currentType.label }}</p>
                      <h4 class="font-black text-sm uppercase" style="font-family:'Syne',sans-serif;">{{ form.nombre }}</h4>
                      <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-50 mt-1 font-semibold">
                        <span v-if="form.fechaInicio">📅 {{ fmtPreview(form.fechaInicio) }}</span>
                        <span v-if="form.fechaFin">→ {{ fmtPreview(form.fechaFin) }}</span>
                      </div>
                      <div class="flex gap-2 mt-1.5">
                        <span v-if="form.precio" class="text-xs font-black px-2 py-0.5 rounded-md" :style="`background:${currentType.color}12;color:${currentType.color}`">{{ Number(form.precio).toFixed(2) }} €</span>
                        <span v-if="form.localizador" class="text-xs opacity-40">Loc: {{ form.localizador }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="confirm-row rounded-xl p-3 flex items-center gap-3">
                  <CalendarDays :size="15" class="opacity-40 flex-shrink-0" />
                  <div class="flex-1"><p class="text-[10px] font-black uppercase opacity-40">Se añadirá al</p>
                    <p class="text-sm font-black">Día {{ form.day }} · {{ form.day <= totalDays ? dayLong(form.day) : '' }}</p></div>
                  <div class="flex gap-1">
                    <button class="p-1.5 rounded-lg opacity-40 hover:opacity-100 disabled:opacity-15" :disabled="form.day<=1" @click="form.day--"><ChevronLeft :size="12" /></button>
                    <button class="p-1.5 rounded-lg opacity-40 hover:opacity-100 disabled:opacity-15" :disabled="form.day>=totalDays" @click="form.day++"><ChevronRight :size="12" /></button>
                  </div>
                </div>
                <button class="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  :style="`background:${currentType.color};box-shadow:0 8px 24px ${currentType.color}50`"
                  :disabled="saving" @click="confirmAdd">
                  <component :is="currentType.icon" :size="15" />{{ saving ? 'Guardando...' : 'Confirmar y añadir' }}
                </button>
              </div>
            </Transition>

            <!-- SUCCESS -->
            <Transition name="success-pop">
              <div v-if="showSuccess" class="absolute inset-0 flex flex-col items-center justify-center rounded-[32px] z-10" :style="`background:${currentType.color}`">
                <div class="success-ring w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <CheckCircle2 :size="36" class="text-white" />
                </div>
                <p class="text-white font-black text-2xl uppercase" style="font-family:'Syne',sans-serif;">¡Listo!</p>
                <p class="text-white/70 text-sm font-bold mt-1 px-6 text-center">{{ form.nombre }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import {
  ArrowLeft, Trash2, Plus, ChevronLeft, ChevronRight,
  Hotel, Compass, Utensils, Car, CalendarPlus, CalendarDays,
  Clock, CheckCircle2, X
} from 'lucide-vue-next'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventDropArg, EventClickArg, DateClickArg } from '@fullcalendar/core'
import { useAppStore } from '@/stores/app'
import { plansApi, tiposServicioApi } from '@/services/api'
import type { ItemPlan, PlanViaje } from '@/types'

const props = defineProps<{ plan: PlanViaje; loading?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'delete', id: number): void }>()

const store = useAppStore()
const calRef = ref<InstanceType<typeof FullCalendar> | null>(null)

// ─── Service types ────────────────────────────────────────────────────────────
const serviceTypes = [
  { id: 'alojamiento', label: 'Alojamiento', icon: Hotel,   color: '#3b82f6', keywords: ['alojamiento','hotel','hospedaje','apartamento'], desc:'Hotel, Airbnb...', nameLabel:'Nombre del alojamiento', placeholder:'Hotel Ritz...', startLabel:'Check-in', endLabel:'Check-out', locLabel:'Nº reserva', locPlaceholder:'BK-12345' },
  { id: 'actividad',   label: 'Actividad',   icon: Compass, color: '#10b981', keywords: ['actividad','aventura','excursión','tour','visita'], desc:'Tours, excursiones...', nameLabel:'Nombre actividad', placeholder:'Visita al Coliseo...', startLabel:'Inicio', endLabel:'Fin', locLabel:'Referencia', locPlaceholder:'TK-98765' },
  { id: 'restaurante', label: 'Restaurante', icon: Utensils,color: '#ef4444', keywords: ['restaurante','restauración','comida','cena'], desc:'Cenas, almuerzos...', nameLabel:'Nombre restaurante', placeholder:'La Mar...', startLabel:'Hora reserva', endLabel:'Hora salida', locLabel:'Nº reserva', locPlaceholder:'RES-001' },
  { id: 'transporte',  label: 'Transporte',  icon: Car,     color: '#6366f1', keywords: ['transporte','vuelo','tren','bus','ruta'], desc:'Vuelos, trenes...', nameLabel:'Vuelo / trayecto', placeholder:'Vuelo IB1234...', startLabel:'Salida', endLabel:'Llegada', locLabel:'Localizador', locPlaceholder:'ABC123' },
]

function matchesType(item: ItemPlan, typeId: string): boolean {
  const name = (item.tipo_nombre ?? '').toLowerCase()
  const t = serviceTypes.find(s => s.id === typeId)
  return t ? t.keywords.some(k => name.includes(k)) : false
}
function svc(item: ItemPlan) { return serviceTypes.find(t => matchesType(item, t.id)) ?? serviceTypes[1] }

// ─── Tipos backend ───────────────────────────────────────────────────────────
const backendTipos = ref<{ id_tipo: number; nombre_tipo: string }[]>([])
onMounted(async () => { try { backendTipos.value = await tiposServicioApi.getAll() } catch {} })
function tipoIdForCategory(catId: string): number | null {
  const kws = serviceTypes.find(s => s.id === catId)?.keywords ?? []
  return backendTipos.value.find(t => kws.some(k => (t.nombre_tipo ?? '').toLowerCase().includes(k)))?.id_tipo ?? null
}

// ─── State ────────────────────────────────────────────────────────────────────
const selectedDay = ref<Date | null>(null)

// ─── Helpers ─────────────────────────────────────────────────────────────────
const totalDays = computed(() => {
  if (!props.plan.fecha_inicio || !props.plan.fecha_fin) return 1
  const s = new Date(props.plan.fecha_inicio), e = new Date(props.plan.fecha_fin)
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1)
})

function dayIndexOf(date: Date): number {
  if (!props.plan.fecha_inicio) return 1
  return Math.floor((date.getTime() - new Date(props.plan.fecha_inicio).getTime()) / 86400000) + 1
}

const selectedDayIndex = computed(() => selectedDay.value ? dayIndexOf(selectedDay.value) : 1)

const selectedDayItems = computed(() => {
  if (!selectedDay.value) return []
  const iso = selectedDay.value.toISOString().split('T')[0]
  return props.plan.items.filter(i => i.fecha_hora_inicio?.startsWith(iso) || i.fecha_hora_fin?.startsWith(iso))
    .sort((a, b) => (a.fecha_hora_inicio ?? '').localeCompare(b.fecha_hora_inicio ?? ''))
})

function fmtFull(s: string) { return new Date(s).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' }) }
function dayShort(d: number) {
  const date = new Date(props.plan.fecha_inicio ?? new Date())
  date.setDate(date.getDate() + d - 1)
  return date.toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' })
}
function dayLong(d: number) {
  const date = new Date(props.plan.fecha_inicio ?? new Date())
  date.setDate(date.getDate() + d - 1)
  return date.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })
}
function fmtTime(dt: string) { return new Date(dt).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }) }
function fmtPreview(dt: string) { return new Date(dt).toLocaleString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) }

// ─── FullCalendar events ──────────────────────────────────────────────────────
const calendarEvents = computed(() =>
  props.plan.items.map(item => {
    const t = svc(item)
    const hasTime = !!item.fecha_hora_inicio
    return {
      id: String(item.id_item),
      title: item.nombre_servicio || `Ítem ${item.id_item}`,
      start: item.fecha_hora_inicio ?? props.plan.fecha_inicio ?? undefined,
      end: item.fecha_hora_fin ?? undefined,
      allDay: !hasTime,
      backgroundColor: t.color,
      borderColor: t.color,
      textColor: '#fff',
      extendedProps: { item },
    }
  })
)

// ─── FullCalendar options ─────────────────────────────────────────────────────
const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  initialDate: props.plan.fecha_inicio ?? undefined,
  validRange: props.plan.fecha_inicio && props.plan.fecha_fin
    ? { start: props.plan.fecha_inicio, end: new Date(new Date(props.plan.fecha_fin).getTime() + 86400000).toISOString().split('T')[0] }
    : undefined,
  locale: 'es',
  firstDay: 1,
  height: '100%',
  expandRows: true,
  allDaySlot: true,
  slotMinTime: '07:00:00',
  slotMaxTime: '23:00:00',
  editable: true,
  droppable: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek,dayGridMonth',
  },
  buttonText: { today: 'Hoy', week: 'Semana', month: 'Mes' },
  events: calendarEvents.value,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  eventContent: renderEventContent,
}))

function renderEventContent(arg: any) {
  const item: ItemPlan = arg.event.extendedProps.item
  const t = svc(item)
  const time = arg.event.start
    ? new Date(arg.event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''
  return {
    html: `<div class="fc-custom-event" style="background:${t.color};border-radius:8px;padding:4px 7px;height:100%;overflow:hidden;box-shadow:0 2px 8px ${t.color}55;">
      <div style="font-size:9px;font-weight:800;text-transform:uppercase;opacity:0.8;letter-spacing:0.08em;">${time}</div>
      <div style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.nombre_servicio || `Ítem ${item.id_item}`}</div>
    </div>`
  }
}

async function handleEventDrop(arg: EventDropArg) {
  const item: ItemPlan = arg.event.extendedProps.item
  const newStart = arg.event.start?.toISOString() ?? null
  const newEnd = arg.event.end?.toISOString() ?? null
  try {
    const updated = await plansApi.updateItem(props.plan.id_plan, item.id_item, {
      fecha_hora_inicio: newStart,
      fecha_hora_fin: newEnd,
    })
    const idx = props.plan.items.findIndex(i => i.id_item === item.id_item)
    if (idx !== -1) props.plan.items[idx] = updated
  } catch { arg.revert() }
}

async function handleEventResize(arg: any) {
  const item: ItemPlan = arg.event.extendedProps.item
  try {
    const updated = await plansApi.updateItem(props.plan.id_plan, item.id_item, {
      fecha_hora_inicio: arg.event.start?.toISOString() ?? null,
      fecha_hora_fin: arg.event.end?.toISOString() ?? null,
    })
    const idx = props.plan.items.findIndex(i => i.id_item === item.id_item)
    if (idx !== -1) props.plan.items[idx] = updated
  } catch { arg.revert() }
}

function handleEventClick(arg: EventClickArg) {
  selectedDay.value = arg.event.start ?? null
}

function handleDateClick(arg: DateClickArg) {
  selectedDay.value = arg.date
}

async function handleDeleteItem(item: ItemPlan) {
  if (!confirm(`¿Eliminar "${item.nombre_servicio || `Ítem ${item.id_item}`}"?`)) return
  await plansApi.deleteItem(props.plan.id_plan, item.id_item)
  const idx = props.plan.items.findIndex(i => i.id_item === item.id_item)
  if (idx !== -1) props.plan.items.splice(idx, 1)
}

function confirmDelete() {
  if (confirm(`¿Eliminar "${props.plan.nombre_plan || `Plan ${props.plan.id_plan}`}"?`)) {
    emit('delete', props.plan.id_plan)
  }
}

// ─── Add item modal ───────────────────────────────────────────────────────────
const showAddModal = ref(false)
const step = ref(1)
const saving = ref(false)
const showSuccess = ref(false)
const form = reactive({ day: 1, typeId: 'actividad', nombre: '', fechaInicio: '', fechaFin: '', precio: '', estadoPago: '', localizador: '' })
const currentType = computed(() => serviceTypes.find(t => t.id === form.typeId) ?? serviceTypes[1])

function openAddModal(day?: number) {
  Object.assign(form, { day: day ?? selectedDayIndex.value ?? 1, typeId: 'actividad', nombre: '', fechaInicio: '', fechaFin: '', precio: '', estadoPago: '', localizador: '' })
  step.value = 1; showSuccess.value = false; showAddModal.value = true
}

async function confirmAdd() {
  if (!form.nombre || saving.value) return
  saving.value = true
  try {
    const newItem = await plansApi.createItem(props.plan.id_plan, {
      nombre_servicio: form.nombre,
      tipo: tipoIdForCategory(form.typeId),
      fecha_hora_inicio: form.fechaInicio || null,
      fecha_hora_fin: form.fechaFin || null,
      precio_estimado: form.precio ? parseFloat(form.precio) : null,
      estado_pago: form.estadoPago || null,
      localizador_confirmacion: form.localizador || null,
    })
    props.plan.items.push(newItem)
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false; showAddModal.value = false }, 1400)
  } finally { saving.value = false }
}
</script>

<style scoped>
.dark-mode { --bg:#0a0a0f; --surface:#111118; --surface-2:#18181f; --border:rgba(255,255,255,0.07); --text:#e8e8f0; --muted:#5a5a70; --accent:#f97316; }
.light-mode { --bg:#f4f4f9; --surface:#ffffff; --surface-2:#f0f0f6; --border:rgba(15,23,42,0.08); --text:#0f172a; --muted:#94a3b8; --accent:#f97316; }

.pd-root { position:fixed; inset:0; z-index:9999; display:flex; flex-direction:column; width:100vw; height:100vh; overflow:hidden; background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; }
.text-accent { color:var(--accent); }

.pd-header { background:var(--surface); border-bottom:1px solid var(--border); box-shadow:0 2px 16px rgba(0,0,0,.12); flex-shrink:0; }
.pd-title { color:var(--text); }
.pd-meta { color:var(--muted); }
.back-btn { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); transition:all .2s; }
.back-btn:hover { color:var(--accent); border-color:rgba(249,115,22,.3); }
.stat-pill { background:color-mix(in srgb,var(--pc) 12%,transparent); color:var(--pc); border:1px solid color-mix(in srgb,var(--pc) 25%,transparent); }
.delete-btn { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); transition:all .2s; }
.delete-btn:hover { background:rgba(239,68,68,.12); color:#ef4444; }
.add-fab { background:var(--accent); box-shadow:0 4px 16px rgba(249,115,22,.35); transition:all .2s; }
.add-fab:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(249,115,22,.5); }

/* BODY */
.pd-body { background:var(--bg); }
.pd-cal { background:var(--bg); }

/* FULLCALENDAR THEME */
:deep(.fc) { font-family:'DM Sans',sans-serif; color:var(--text); height:100%; }
:deep(.fc-theme-standard td), :deep(.fc-theme-standard th), :deep(.fc-theme-standard .fc-scrollgrid) { border-color:var(--border); }
:deep(.fc-col-header) { background:var(--surface-2); }
:deep(.fc-col-header-cell) { padding:10px 0; font-weight:800; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text); }
:deep(.fc-timegrid-slot) { height:40px; }
:deep(.fc-timegrid-slot-label) { font-size:9px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; }
:deep(.fc-daygrid-day-number), :deep(.fc-col-header-cell-cushion) { color:var(--text); text-decoration:none; font-weight:800; }
:deep(.fc-scrollgrid) { border-radius:16px; overflow:hidden; border-color:var(--border); }
:deep(.fc-timegrid-now-indicator-line) { border-color:var(--accent); border-width:2px; }
:deep(.fc-timegrid-now-indicator-arrow) { border-color:var(--accent); }
:deep(.fc-button-primary) { background:var(--accent) !important; border:none !important; border-radius:10px !important; font-weight:800 !important; text-transform:uppercase !important; font-size:0.7rem !important; letter-spacing:0.05em !important; box-shadow:0 3px 10px rgba(249,115,22,.3) !important; transition:all .2s !important; }
:deep(.fc-button-primary:hover) { background:#ea6010 !important; transform:translateY(-1px); }
:deep(.fc-button-primary.fc-button-active) { background:#ea6010 !important; }
:deep(.fc-toolbar-title) { font-family:'Syne',sans-serif; font-weight:900; text-transform:uppercase; letter-spacing:-0.02em; font-size:1.2rem; color:var(--text); }
:deep(.fc-toolbar.fc-header-toolbar) { margin-bottom:12px; }
:deep(.fc-event) { border:none !important; border-radius:8px !important; cursor:pointer; }
:deep(.fc-event-main) { padding:0 !important; }
:deep(.fc-h-event .fc-event-main) { padding:3px 7px !important; }
:deep(.fc-daygrid-event) { border-radius:6px !important; }
:deep(.fc-day-today) { background:color-mix(in srgb,var(--accent) 5%,transparent) !important; }
:deep(.fc-highlight) { background:color-mix(in srgb,var(--accent) 10%,transparent) !important; }
:deep(.fc-timegrid-col.fc-day-today) { background:color-mix(in srgb,var(--accent) 4%,transparent) !important; }

/* RIGHT PANEL */
.pd-panel { background:var(--surface); border-left:1px solid var(--border); box-shadow:-4px 0 24px rgba(0,0,0,.15); }
.panel-header { border-bottom:1px solid var(--border); background:var(--surface); }
.add-day-btn { background:var(--accent); box-shadow:0 3px 10px rgba(249,115,22,.3); transition:all .2s; }
.add-day-btn:hover { transform:translateY(-1px); }
.close-panel-btn { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); transition:all .2s; }
.close-panel-btn:hover { color:var(--text); }
.empty-panel { background:var(--surface-2); border:2px dashed var(--border); }
.add-cta { background:var(--accent); box-shadow:0 4px 14px rgba(249,115,22,.3); transition:all .2s; }
.panel-item { background:var(--surface-2); border:1px solid var(--border); transition:all .2s; }
.panel-item:hover { border-color:color-mix(in srgb,var(--ca) 30%,transparent); }
.del-item-btn { background:var(--surface); border:1px solid var(--border); color:var(--muted); }
.del-item-btn:hover { background:rgba(239,68,68,.12); color:#ef4444; }
.panel-footer { border-top:1px solid var(--border); background:var(--surface-2); }

/* MODAL */
.add-sheet { background:var(--surface); border-top:1px solid var(--border); max-height:92vh; overflow-y:auto; }
@media(min-width:640px){ .add-sheet { border:1px solid var(--border); box-shadow:0 40px 80px rgba(0,0,0,.6); max-height:85vh; } }
.modal-title { color:var(--text); }
.type-card { background:var(--surface-2); border-color:var(--border); color:var(--text); cursor:pointer; }
.type-card:hover { background:var(--surface); transform:translateY(-1px); }
.type-card-sel { transform:translateY(-2px); }
.back-step { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); }
.back-step:hover { color:var(--text); }
.field { display:flex; flex-direction:column; gap:5px; }
.flbl { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.15em; color:var(--muted); }
.finput { padding:10px 14px; border-radius:14px; background:var(--surface-2); border:1px solid var(--border); color:var(--text); font-size:13px; font-weight:700; outline:none; transition:all .2s; }
.finput:focus { border-color:rgba(249,115,22,.45); background:var(--surface); box-shadow:0 0 0 3px rgba(249,115,22,.12); }
.finput::placeholder { color:var(--muted); font-weight:500; }
.finput option { background:var(--surface); color:var(--text); }
.preview-card { background:var(--surface-2); }
.confirm-row { background:var(--surface-2); border:1px solid var(--border); color:var(--text); }
.success-ring { animation:ring-in .4s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes ring-in { from { transform:scale(0) rotate(-20deg); opacity:0; } to { transform:scale(1) rotate(0); opacity:1; } }

/* TRANSITIONS */
.panel-slide-enter-active { transition:all .28s cubic-bezier(.34,1.2,.64,1); }
.panel-slide-leave-active { transition:all .2s ease; }
.panel-slide-enter-from { opacity:0; transform:translateX(32px); }
.panel-slide-leave-to { opacity:0; transform:translateX(24px); }
.sheet-enter-active { transition:all .35s cubic-bezier(.34,1.2,.64,1); }
.sheet-leave-active { transition:all .2s ease; }
.sheet-enter-from { opacity:0; transform:translateY(36px) scale(.97); }
.sheet-leave-to { opacity:0; transform:translateY(16px); }
.step-slide-enter-active { transition:all .22s cubic-bezier(.4,0,.2,1); }
.step-slide-leave-active { transition:all .15s ease; }
.step-slide-enter-from { opacity:0; transform:translateX(18px); }
.step-slide-leave-to { opacity:0; transform:translateX(-10px); }
.success-pop-enter-active { transition:all .28s cubic-bezier(.34,1.56,.64,1); }
.success-pop-leave-active { transition:all .18s ease; }
.success-pop-enter-from { opacity:0; transform:scale(.92); }
.success-pop-leave-to { opacity:0; }
</style>
