<template>
  <div class="pd-root" :class="store.isDark ? 'dark-mode' : 'light-mode'">

    <header class="pd-header flex items-center gap-3 px-4 lg:px-6 py-3">
      <button class="back-btn flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm" @click="$emit('close')">
        <ArrowLeft :size="15" /><span class="hidden sm:inline">Mis Viajes</span>
      </button>

      <div class="flex-1 min-w-0">
        <h1 class="pd-title text-xl font-black uppercase tracking-tighter truncate" style="font-family:'Syne',sans-serif;">
          {{ plan.nombre_plan || `Plan ${plan.id_plan}` }}
        </h1>
        <p class="pd-meta text-xs font-bold uppercase tracking-widest mt-0.5">
          {{ plan.fecha_inicio ? fmtFull(plan.fecha_inicio) : '—' }} → {{ plan.fecha_fin ? fmtFull(plan.fecha_fin) : '—' }} · {{ totalDays }} días
        </p>
      </div>

      <span v-if="plan.estado_plan" class="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-black uppercase"
        :class="{
          'bg-yellow-500/15 text-yellow-500': plan.estado_plan === 'Borrador',
          'bg-green-500/15 text-green-500': plan.estado_plan === 'Confirmado',
          'bg-gray-500/15 text-gray-400': plan.estado_plan === 'Finalizado',
        }">{{ plan.estado_plan }}</span>

      <div class="hidden lg:flex items-center gap-1.5">
        <div v-for="t in serviceTypes" :key="t.id"
          class="stat-pill flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black"
          :style="`--pc:${t.color}`">
          <component :is="t.icon" :size="10" />
          <span>{{ plan.items.filter(i => matchesType(i, t.id)).length }}</span>
        </div>
      </div>

      <div class="tab-switcher">
        <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'semanal' }" @click="activeTab = 'semanal'">
          <CalendarRange :size="14" /><span>Semanal</span>
        </button>
        <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'mapa' }" @click="activeTab = 'mapa'">
          <Map :size="14" /><span>Mapa</span>
        </button>
      </div>

      <Transition name="fade-quick">
        <div v-if="activeTab === 'semanal'" class="week-nav flex items-center gap-1 px-2 py-1.5 rounded-xl">
          <button class="nav-btn p-1.5 rounded-lg" @click="prevWeek" :disabled="currentWeekStart <= 0">
            <ChevronLeft :size="14" />
          </button>
          <span class="text-xs font-black uppercase tracking-widest px-1 min-w-[80px] text-center text-accent">
            {{ weekLabel }}
          </span>
          <button class="nav-btn p-1.5 rounded-lg" @click="nextWeek" :disabled="currentWeekStart + 7 >= totalDays">
            <ChevronRight :size="14" />
          </button>
        </div>
      </Transition>

      <button class="add-fab flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-white" @click="openAddModal()">
        <Plus :size="14" /><span class="hidden sm:inline">Añadir</span>
      </button>
      <button class="delete-btn p-2.5 rounded-xl" @click="confirmDelete"><Trash2 :size="15" /></button>
    </header>

    <div v-if="loading" class="flex-1 flex justify-center items-center py-20">
      <div class="w-10 h-10 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>

    <div v-else-if="activeTab === 'mapa'" class="map-view flex flex-col flex-1 overflow-hidden relative min-h-0">
      <div class="map-day-toolbar flex-shrink-0">
        <div class="map-day-toolbar-inner">
          <button
            type="button"
            class="map-day-chip map-day-chip--all"
            :class="{ 'map-day-chip--active': mapDayFilter === 'all' }"
            @click="mapDayFilter = 'all'"
          >
            <CalendarRange :size="13" class="map-day-chip-icon" />
            <div class="map-day-chip-all-text">
              <span class="map-day-chip-title">Todos los días</span>
              <span class="map-day-chip-meta">{{ itemsWithCoords.length }}/{{ props.plan.items.length }} con ubicación</span>
            </div>
          </button>
          <button
            v-for="d in mapDayChips"
            :key="d.index"
            type="button"
            class="map-day-chip"
            :class="{ 'map-day-chip--active': mapDayFilter === d.index }"
            @click="mapDayFilter = d.index"
          >
            <span class="map-day-chip-title">Día {{ d.index }}</span>
            <span class="map-day-chip-date">{{ d.weekdayShort }} {{ d.dayNum }}</span>
            <span class="map-day-chip-meta">{{ d.coordsCount }} mapa · {{ d.activityCount }} act.</span>
          </button>
        </div>
        <p v-if="mapDayFilter !== 'all' && mapItemsForView.length === 0 && dayActivityWithoutCoords > 0" class="map-day-hint">
          Este día tiene actividades sin ubicación; añade coordenadas al editar el ítem.
        </p>
      </div>
      <div ref="mapContainer" class="map-canvas w-full flex-1 min-h-0 relative" />
      <!-- Leyenda: solo ítems visibles según día -->
      <div class="map-legend">
        <div class="map-legend-head">
          <span>{{ mapLegendTitle }}</span>
        </div>
        <template v-if="mapItemsForView.length > 0">
          <div v-for="item in mapItemsForView" :key="item.id_item" class="map-legend-item"
            @click="flyToItem(item)">
            <div class="map-legend-dot" :style="`background:${svc(item).color}`" />
            <div class="map-legend-copy">
              <span class="map-legend-name">{{ item.nombre_servicio || `Ítem ${item.id_item}` }}</span>
              <span class="map-legend-sub">{{ legendSubline(item) }}</span>
            </div>
          </div>
        </template>
        <div v-else-if="itemsWithCoords.length === 0" class="map-no-coords">
          <Map :size="20" class="opacity-30" />
          <p>Ningún ítem tiene coordenadas guardadas</p>
        </div>
        <div v-else class="map-no-coords map-no-coords--soft">
          <Map :size="20" class="opacity-35" />
          <p>{{ mapLegendEmpty }}</p>
        </div>
      </div>
    </div>

    <div v-else class="pd-body flex-1 overflow-hidden flex flex-col">

      <div class="week-grid-wrapper flex-1 overflow-hidden px-3 lg:px-5 pt-3 pb-3">
        <div class="week-grid" :style="`grid-template-columns: repeat(${visibleDays.length}, minmax(0, 1fr))`">

          <div
            v-for="day in visibleDays"
            :key="day.index"
            class="day-col"
            :class="{ 'day-col--active': selectedDayIndex === day.index, 'day-col--today': day.isToday }"
            @dragover.prevent="onDragOver(day.index)"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop(day.index)"
          >
            <div class="day-header" @click="selectDay(day.index)">
              <div class="day-header-inner">
                <span class="day-weekday">{{ day.weekdayShort }}</span>
                <span class="day-number" :class="{ 'today-badge': day.isToday }">{{ day.dayNum }}</span>
                <span class="day-month">{{ day.monthShort }}</span>
              </div>
              <div class="day-label">Día {{ day.index }}</div>
              <div v-if="day.items.length > 0" class="day-count">{{ day.items.length }}</div>
            </div>

            <div class="day-items-wrapper">
              <div v-if="dragOverDay === day.index && draggedItemId" class="drop-indicator">
                <span>Soltar aquí</span>
              </div>

              <TransitionGroup name="item-move" tag="div" class="day-items">
                <div
                  v-for="item in day.items"
                  :key="item.id_item"
                  class="day-item group"
                  :style="`--ca:${svc(item).color}`"
                  draggable="true"
                  @dragstart="onDragStart($event, item)"
                  @dragend="onDragEnd"
                  @click.stop="openEditItem(item)"
                >
                  <div class="item-bar" :style="`background:${svc(item).color}`" />
                  <div class="item-body">
                    <div class="item-icon" :style="`background:${svc(item).color}20;color:${svc(item).color}`">
                      <component :is="svc(item).icon" :size="16" />
                    </div>
                    <div class="item-info">
                      <p class="item-type" :style="`color:${svc(item).color}`">{{ svc(item).label }}</p>
                      <p class="item-name">{{ item.nombre_servicio || `Ítem ${item.id_item}` }}</p>
                      <div class="item-meta">
                        <span v-if="item.estado_pago" class="pay-badge"
                          :class="{
                            'pay-pending': item.estado_pago === 'Pendiente',
                            'pay-paid': item.estado_pago === 'Pagado',
                            'pay-cancel': item.estado_pago === 'Cancelado',
                          }">{{ item.estado_pago }}</span>
                        <span v-if="item.monto_total != null" class="price-tag"
                          :style="`background:${svc(item).color}18;color:${svc(item).color}`">
                          {{ item.monto_total.toFixed(0) }}€
                        </span>
                      </div>
                    </div>
                    <button class="del-item-btn opacity-0 group-hover:opacity-100" @click.stop="handleDeleteItem(item)">
                      <Trash2 :size="10" />
                    </button>
                  </div>
                </div>
              </TransitionGroup>

              <div v-if="day.items.length === 0 && dragOverDay !== day.index" class="empty-day" @click="openAddModal(day.index)">
                <Plus :size="14" class="opacity-30" />
              </div>
            </div>

            <div v-if="day.total > 0" class="day-footer">
              <span class="day-total">{{ day.total.toFixed(0) }}€</span>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-bar flex items-center gap-4 px-5 py-3">
        <div v-for="t in serviceTypes" :key="t.id" class="summary-type flex items-center gap-1.5">
          <div class="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="`background:${t.color}20;color:${t.color}`">
            <component :is="t.icon" :size="11" />
          </div>
          <span class="text-xs font-black uppercase" :style="`color:${t.color}`">
            {{ plan.items.filter(i => matchesType(i, t.id)).length }}
          </span>
        </div>
        <div class="flex-1" />
        <div class="total-budget">
          <span class="text-xs font-black uppercase opacity-40 mr-2">Total</span>
          <span class="text-lg font-black text-accent">
            {{ plan.items.reduce((s, i) => s + (i.monto_total ?? i.precio_estimado ?? 0), 0).toFixed(2) }}€
          </span>
        </div>
      </div>
    </div>

    <Transition name="day-panel">
      <div v-if="selectedDay" class="day-panel-overlay" @click.self="selectedDayIndex = null">
        <div class="day-panel" :style="`width:${dayPanelWidth}px`">

          <div class="day-panel-resizer" @mousedown="startPanelResize" />

          <div class="day-panel-header">
            <div class="day-panel-date-block">
              <div class="day-panel-big-num" :class="{ 'text-accent': selectedDay.isToday }">
                {{ selectedDay.dayNum }}
              </div>
              <div class="day-panel-date-info">
                <span class="day-panel-weekday">{{ selectedDay.weekdayShort }} · {{ selectedDay.monthShort }}</span>
                <span class="day-panel-tag" :class="{ 'day-panel-tag--today': selectedDay.isToday }">
                  {{ selectedDay.isToday ? 'HOY' : `DÍA ${selectedDay.index}` }}
                </span>
              </div>
            </div>
            <div class="flex-1" />
            <div v-if="selectedDay.total > 0" class="day-panel-budget">
              <span class="day-panel-budget-label">Total día</span>
              <span class="day-panel-budget-amount">{{ selectedDay.total.toFixed(2) }}€</span>
            </div>
            <button class="day-panel-close" @click="selectedDayIndex = null"><X :size="16" /></button>
          </div>

          <div v-if="selectedDay.items.length > 0" class="day-panel-types">
            <div v-for="t in serviceTypes" :key="t.id"
              class="day-panel-type-chip"
              :style="selectedDay.items.some(i => matchesType(i, t.id)) ? `background:${t.color}15;color:${t.color};border-color:${t.color}30` : ''"
              :class="{ 'opacity-25': !selectedDay.items.some(i => matchesType(i, t.id)) }">
              <component :is="t.icon" :size="11" />
              <span>{{ selectedDay.items.filter(i => matchesType(i, t.id)).length }}</span>
            </div>
          </div>

          <div class="day-panel-body">
            <div v-if="selectedDay.items.length === 0" class="day-panel-empty">
              <div class="day-panel-empty-icon"><Plus :size="22" /></div>
              <p class="day-panel-empty-text">Sin actividades este día</p>
              <button class="day-panel-empty-btn" @click="openAddModal(selectedDay.index)">
                <Plus :size="13" /> Añadir el primero
              </button>
            </div>

            <div v-else class="day-panel-items">
              <div
                v-for="item in selectedDay.items"
                :key="item.id_item"
                class="day-panel-item group"
                :style="`--ci:${svc(item).color}`"
                @click="openEditItem(item)"
              >
                <div class="day-panel-item-stripe" :style="`background:${svc(item).color}`" />
                <div class="day-panel-item-icon" :style="`background:${svc(item).color}18;color:${svc(item).color}`">
                  <component :is="svc(item).icon" :size="18" />
                </div>
                <div class="day-panel-item-info">
                  <p class="day-panel-item-type" :style="`color:${svc(item).color}`">{{ svc(item).label }}</p>
                  <p class="day-panel-item-name">{{ item.nombre_servicio || `Ítem ${item.id_item}` }}</p>
                  <div class="day-panel-item-meta">
                    <span v-if="item.fecha_hora_inicio" class="day-panel-item-date">
                      <CalendarDays :size="10" /> {{ fmtPreviewDate(item.fecha_hora_inicio) }}
                      <template v-if="item.fecha_hora_fin"> → {{ fmtPreviewDate(item.fecha_hora_fin) }}</template>
                    </span>
                    <span v-if="item.estado_pago" class="pay-badge"
                      :class="{
                        'pay-pending': item.estado_pago === 'Pendiente',
                        'pay-paid':    item.estado_pago === 'Pagado',
                        'pay-cancel':  item.estado_pago === 'Cancelado',
                      }">{{ item.estado_pago }}</span>
                    <span v-if="item.monto_total != null" class="price-tag"
                      :style="`background:${svc(item).color}18;color:${svc(item).color}`">
                      {{ item.monto_total.toFixed(2) }}€
                    </span>
                  </div>
                </div>
                <button class="day-panel-del opacity-0 group-hover:opacity-100" @click.stop="handleDeleteItem(item)">
                  <Trash2 :size="12" />
                </button>
              </div>
            </div>
          </div>

          <div class="day-panel-footer">
            <button class="day-panel-add-btn" @click="openAddModal(selectedDay.index)">
              <Plus :size="15" /> Añadir al día {{ selectedDay.index }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <Transition name="drawer">
      <div v-if="selectedItem" class="item-drawer" @click.self="selectedItem = null">
        <div class="drawer-card">

          <div class="drawer-accent-bar" :style="`background:${svc(selectedItem).color}`" />

          <div class="drawer-header flex items-center gap-3 px-5 pt-4 pb-3">
            <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              :style="`background:${svc(selectedItem).color}20;color:${svc(selectedItem).color}`">
              <component :is="svc(selectedItem).icon" :size="20" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[9px] font-black uppercase tracking-[0.18em]" :style="`color:${svc(selectedItem).color}`">
                {{ svc(selectedItem).label }} · Día {{ dayIndexOf2(selectedItem) }}
              </p>
              <h3 class="text-base font-black uppercase leading-tight truncate" style="font-family:'Syne',sans-serif;">
                {{ editForm.nombre || selectedItem.nombre_servicio || `Ítem ${selectedItem.id_item}` }}
              </h3>
            </div>
            <Transition name="success-pop">
              <span v-if="editSuccess" class="edit-saved-badge">
                <CheckCircle2 :size="11" /> Guardado
              </span>
            </Transition>
            <button class="close-drawer p-2 rounded-xl" @click="selectedItem = null"><X :size="15" /></button>
          </div>

          <div class="drawer-form px-5 pb-4 space-y-3 overflow-y-auto flex-1">

            <div class="field">
              <label class="flbl">Nombre</label>
              <input v-model="editForm.nombre" type="text" class="finput w-full"
                :placeholder="selectedItem.nombre_servicio || 'Nombre del servicio'" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="field">
                <label class="flbl">Fecha inicio</label>
                <input v-model="editForm.fechaInicio" type="date" class="finput w-full" />
              </div>
              <div class="field">
                <label class="flbl">Fecha fin</label>
                <input v-model="editForm.fechaFin" type="date" class="finput w-full" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="field">
                <label class="flbl">Precio estimado (€)</label>
                <input v-model="editForm.precioEstimado" type="number" min="0" step="0.01"
                  class="finput w-full" placeholder="0.00" />
              </div>
              <div class="field">
                <label class="flbl">Monto total (€)</label>
                <input v-model="editForm.montoTotal" type="number" min="0" step="0.01"
                  class="finput w-full" placeholder="0.00" />
              </div>
            </div>

            <div class="field">
              <label class="flbl">Estado de pago</label>
              <div class="edit-pay-group">
                <button v-for="op in ['Pendiente','Pagado','Cancelado']" :key="op"
                  class="edit-pay-btn"
                  :class="{
                    'edit-pay-pending': editForm.estadoPago === op && op === 'Pendiente',
                    'edit-pay-paid':    editForm.estadoPago === op && op === 'Pagado',
                    'edit-pay-cancel':  editForm.estadoPago === op && op === 'Cancelado',
                    'edit-pay-inactive': editForm.estadoPago !== op,
                  }"
                  @click="editForm.estadoPago = editForm.estadoPago === op ? '' : op">
                  {{ op }}
                </button>
              </div>
            </div>

            <div class="field">
              <label class="flbl">Localizador / Referencia</label>
              <input v-model="editForm.localizador" type="text" class="finput w-full font-mono"
                placeholder="ABC-123" />
            </div>

            <div class="field">
              <label class="flbl">Dirección en mapa</label>
              <p class="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-1.5">Geocodificación (OpenStreetMap)</p>
              <div class="flex gap-2">
                <input v-model="editForm.direccion" type="text" class="finput flex-1 min-w-0"
                  placeholder="Ej. Gran Vía 28, Madrid" @keydown.enter.prevent="lookupEditAddress" />
                <button type="button" class="geocode-btn" :disabled="geocodeEditLoading"
                  @click="lookupEditAddress">
                  {{ geocodeEditLoading ? '…' : 'Buscar' }}
                </button>
              </div>
              <p v-if="geocodeEditError" class="edit-geo-msg edit-geo-msg--err">{{ geocodeEditError }}</p>
              <p v-else-if="editMapCoords" class="edit-geo-msg edit-geo-msg--ok">
                <MapPin :size="12" class="inline-block mr-1 align-middle text-[var(--accent)]" />
                <span>{{ editMapCoords.lat.toFixed(5) }}, {{ editMapCoords.lon.toFixed(5) }}</span>
              </p>
              <button v-if="editMapCoords || editForm.direccion.trim()" type="button" class="edit-geo-clear"
                @click="clearEditMapLocation">Quitar ubicación del mapa</button>
            </div>

          </div>

          <div class="drawer-footer px-5 py-4 flex gap-2">
            <button class="del-full-btn flex-shrink-0 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all"
              @click="handleDeleteItem(selectedItem)">
              <Trash2 :size="12" class="inline mr-1" />
            </button>
            <button class="edit-save-btn flex-1 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all"
              :style="`background:${svc(selectedItem).color};box-shadow:0 4px 16px ${svc(selectedItem).color}40`"
              :class="{ 'opacity-50': !editDirty || editSaving }"
              :disabled="!editDirty || editSaving"
              @click="saveEditItem">
              <CheckCircle2 v-if="!editSaving" :size="15" />
              <div v-else class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {{ editSaving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showAddModal"
          class="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
          style="background:rgba(0,0,0,0.78);backdrop-filter:blur(12px)"
          @click.self="showAddModal = false">

          <div class="add-sheet w-full sm:max-w-[500px] rounded-t-[32px] sm:rounded-[32px] overflow-hidden relative">

            <div class="flex gap-1.5 px-6 pt-5 pb-3">
              <div v-for="s in 3" :key="s" class="h-1 rounded-full flex-1 transition-all duration-500"
                :style="s <= step ? `background:${currentType.color}` : 'background:var(--border)'" />
            </div>
            <p class="px-6 pb-4 text-[10px] font-black uppercase tracking-[0.18em] opacity-35">
              {{ ['Elige el tipo', 'Rellena los detalles', 'Confirma y añade'][step - 1] }}
            </p>

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
                    <input v-model="form.fechaInicio" type="date" class="finput w-full" /></div>
                  <div class="field"><label class="flbl">{{ currentType.endLabel }}</label>
                    <input v-model="form.fechaFin" type="date" class="finput w-full" /></div>
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
                <div class="field">
                  <label class="flbl">Dirección en mapa</label>
                  <p class="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-1.5">Opcional · aparecerá como pin</p>
                  <div class="flex gap-2">
                    <input v-model="form.direccion" type="text" class="finput flex-1 min-w-0"
                      placeholder="Calle Mayor 1, Sevilla" @keydown.enter.prevent="lookupAddAddress" />
                    <button type="button" class="geocode-btn" :disabled="geocodeAddLoading" @click="lookupAddAddress">
                      {{ geocodeAddLoading ? '…' : 'Buscar' }}
                    </button>
                  </div>
                  <p v-if="geocodeAddError" class="edit-geo-msg edit-geo-msg--err">{{ geocodeAddError }}</p>
                  <p v-else-if="addMapCoords" class="edit-geo-msg edit-geo-msg--ok">
                    <MapPin :size="12" class="inline mr-1 align-middle opacity-70" /> Ubicación lista
                  </p>
                  <button v-if="addMapCoords || form.direccion.trim()" type="button" class="edit-geo-clear"
                    @click="clearAddMapLocation">Quitar del mapa</button>
                </div>
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
                        <span v-if="form.fechaInicio">📅 {{ form.fechaInicio }}</span>
                        <span v-if="form.fechaFin">→ {{ form.fechaFin }}</span>
                      </div>
                      <div class="flex gap-2 mt-1.5">
                        <span v-if="form.precio" class="text-xs font-black px-2 py-0.5 rounded-md" :style="`background:${currentType.color}12;color:${currentType.color}`">{{ Number(form.precio).toFixed(2) }} €</span>
                        <span v-if="form.localizador" class="text-xs opacity-40">Loc: {{ form.localizador }}</span>
                        <span v-if="addMapCoords" class="text-xs font-bold px-2 py-0.5 rounded-md bg-white/25">📍 Mapa</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="confirm-row rounded-xl p-3 flex items-center gap-3">
                  <CalendarDays :size="15" class="opacity-40 flex-shrink-0" />
                  <div class="flex-1">
                    <p class="text-[10px] font-black uppercase opacity-40">Se añadirá al</p>
                    <p class="text-sm font-black">Día {{ form.day }} · {{ form.day <= totalDays ? dayShort(form.day) : '' }}</p>
                  </div>
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
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import {
  ArrowLeft, Trash2, Plus, ChevronLeft, ChevronRight,
  Hotel, Compass, Utensils, Car, CalendarDays,
  CheckCircle2, X, CalendarRange, Map, MapPin
} from 'lucide-vue-next'
import L from 'leaflet'
import { useAppStore } from '@/stores/app'
import { plansApi, tiposServicioApi, geocodeApi } from '@/services/api'
import type { ItemPlan, PlanViaje } from '@/types'

const props = defineProps<{ plan: PlanViaje; loading?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'delete', id: number): void }>()

const store = useAppStore()
const activeTab = ref<'semanal' | 'mapa'>('semanal')
const mapDayFilter = ref<'all' | number>('all')

const mapContainer = ref<HTMLElement | null>(null)
let leafletMap: L.Map | null = null
let markers: L.Marker[] = []
const markerByItemId: Record<number, L.Marker> = {}

const itemsWithCoords = computed(() =>
  props.plan.items.filter(i => i.ubicacion_lat != null && i.ubicacion_lon != null)
)

function buildMarkerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 3px 10px ${color}66;
      border:2px solid #fff;
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function popupWhenLine(item: ItemPlan): string {
  const di = dayIndexForItem(item)
  if (!item.fecha_hora_inicio) return `Día ${di}`
  const dt = new Date(item.fecha_hora_inicio).toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Día ${di} · ${dt}`
}

function legendSubline(item: ItemPlan): string {
  const time = popupWhenLine(item)
  const dir = (item.ubicacion_direccion || '').trim()
  if (dir) {
    const short = dir.length > 44 ? `${dir.slice(0, 42)}…` : dir
    return `${short} · ${time}`
  }
  return time
}

const MAP_FIT_MAX_ZOOM = 13

function initMap() {
  if (!mapContainer.value || leafletMap) return
  leafletMap = L.map(mapContainer.value, { zoomControl: true })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 19,
  }).addTo(leafletMap)
  renderMarkers()
}

function renderMarkers() {
  if (!leafletMap) return
  markers.forEach(m => m.remove())
  markers = []
  for (const k of Object.keys(markerByItemId)) delete markerByItemId[+k]
  const bounds: [number, number][] = []
  for (const item of mapItemsForView.value) {
    const lat = item.ubicacion_lat!
    const lon = item.ubicacion_lon!
    const s = svc(item)
    const title = escapeHtml(item.nombre_servicio || `Ítem ${item.id_item}`)
    const dirLine = item.ubicacion_direccion
      ? `<p style="font-size:10px;opacity:.85;margin:0 0 4px;line-height:1.3">${escapeHtml(item.ubicacion_direccion)}</p>`
      : ''
    const marker = L.marker([lat, lon], { icon: buildMarkerIcon(s.color) })
      .addTo(leafletMap!)
      .bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;min-width:160px">
          <p style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:${s.color};margin:0 0 2px">${s.label}</p>
          <p style="font-size:13px;font-weight:900;text-transform:uppercase;margin:0 0 4px">${title}</p>
          ${dirLine}
          <p style="font-size:11px;opacity:.92;margin:0 0 6px;line-height:1.35">${escapeHtml(popupWhenLine(item))}</p>
          ${item.monto_total != null ? `<p style="font-size:12px;font-weight:900;color:${s.color};margin:0">${item.monto_total.toFixed(2)}€</p>` : ''}
        </div>
      `, { maxWidth: 220 })
    markers.push(marker)
    markerByItemId[item.id_item] = marker
    bounds.push([lat, lon])
  }
  if (bounds.length > 0) {
    leafletMap.fitBounds(L.latLngBounds(bounds), { padding: [56, 56], maxZoom: MAP_FIT_MAX_ZOOM })
  } else {
    leafletMap.setView([40.4, -3.7], 5)
  }
}

function flyToItem(item: ItemPlan) {
  if (!leafletMap || item.ubicacion_lat == null || item.ubicacion_lon == null) return
  leafletMap.flyTo([item.ubicacion_lat, item.ubicacion_lon], 15, { duration: 1 })
  window.setTimeout(() => markerByItemId[item.id_item]?.openPopup?.(), 380)
}

watch(activeTab, async (tab) => {
  if (tab === 'mapa') {
    await nextTick()
    if (!leafletMap) initMap()
    else { leafletMap.invalidateSize(); renderMarkers() }
  }
})

watch(
  () => [mapDayFilter.value, props.plan.items] as const,
  async () => {
    if (activeTab.value !== 'mapa' || !leafletMap) return
    await nextTick()
    renderMarkers()
  },
  { deep: true },
)

watch(() => props.plan.id_plan, () => {
  mapDayFilter.value = 'all'
})

const serviceTypes = [
  { id: 'alojamiento', label: 'Alojamiento', icon: Hotel,    color: '#3b82f6', keywords: ['alojamiento','hotel','hospedaje','apartamento','hostal','pension','motel'], desc:'Hotel, Airbnb...', nameLabel:'Nombre del alojamiento', placeholder:'Hotel Ritz...', startLabel:'Check-in', endLabel:'Check-out', locLabel:'Nº reserva', locPlaceholder:'BK-12345' },
  { id: 'actividad',   label: 'Actividad',   icon: Compass,  color: '#10b981', keywords: ['actividad','aventura','excursion','excursión','tour','visita','experiencia'], desc:'Tours, excursiones...', nameLabel:'Nombre actividad', placeholder:'Visita al Coliseo...', startLabel:'Inicio', endLabel:'Fin', locLabel:'Referencia', locPlaceholder:'TK-98765' },
  { id: 'restaurante', label: 'Restaurante', icon: Utensils, color: '#ef4444', keywords: ['restaurante','restauraci','comida','cena','gastro','bar','cafeter','bistro','almuerzo','lunch','dinner','food'], desc:'Cenas, almuerzos...', nameLabel:'Nombre restaurante', placeholder:'La Mar...', startLabel:'Fecha reserva', endLabel:'Fecha salida', locLabel:'Nº reserva', locPlaceholder:'RES-001' },
  { id: 'transporte',  label: 'Transporte',  icon: Car,      color: '#6366f1', keywords: ['transporte','vuelo','tren','bus','ruta','ferry','taxi','transfer','coche','avion','avión'], desc:'Vuelos, trenes...', nameLabel:'Vuelo / trayecto', placeholder:'Vuelo IB1234...', startLabel:'Salida', endLabel:'Llegada', locLabel:'Localizador', locPlaceholder:'ABC123' },
]

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
function matchesType(item: ItemPlan, typeId: string): boolean {
  const name = normalize(item.tipo_nombre ?? '')
  const t = serviceTypes.find(s => s.id === typeId)
  return t ? t.keywords.some(k => name.includes(normalize(k))) : false
}

const backendTipos = ref<{ id_tipo: number; nombre_tipo: string }[]>([])
onMounted(async () => { try { backendTipos.value = await tiposServicioApi.getAll() } catch {} })

const tipoIdToCat = computed(() => {
  const record: Record<number, string> = {}
  for (const bt of backendTipos.value) {
    const name = normalize(bt.nombre_tipo ?? '')
    for (const st of serviceTypes) {
      if (st.keywords.some(k => name.includes(normalize(k)))) {
        record[bt.id_tipo] = st.id
        break
      }
    }
  }
  return record
})

const itemCategoryCache: Record<number, string> = {}

function svc(item: ItemPlan) {
  const cached = itemCategoryCache[item.id_item]
  if (cached) return serviceTypes.find(t => t.id === cached) ?? serviceTypes[0]
  if (item.tipo != null && tipoIdToCat.value[item.tipo]) {
    const catId = tipoIdToCat.value[item.tipo]
    return serviceTypes.find(t => t.id === catId) ?? serviceTypes[0]
  }
  return serviceTypes.find(t => matchesType(item, t.id)) ?? serviceTypes[0]
}

function tipoIdForCategory(catId: string): number | null {
  const kws = serviceTypes.find(s => s.id === catId)?.keywords ?? []
  return backendTipos.value.find(t => kws.some(k => normalize(t.nombre_tipo ?? '').includes(normalize(k))))?.id_tipo ?? null
}

const selectedItem = ref<ItemPlan | null>(null)
const currentWeekStart = ref(0)
const draggedItemId = ref<number | null>(null)
const dragOverDay = ref<number | null>(null)

const totalDays = computed(() => {
  if (!props.plan.fecha_inicio || !props.plan.fecha_fin) return 7
  const s = new Date(props.plan.fecha_inicio), e = new Date(props.plan.fecha_fin)
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1)
})

function getDateForDay(dayIndex: number): Date {
  const base = new Date(props.plan.fecha_inicio ?? new Date())
  base.setDate(base.getDate() + dayIndex - 1)
  return base
}

function dayIndexForItem(item: ItemPlan): number {
  if (!item.fecha_hora_inicio || !props.plan.fecha_inicio) return 1
  const base = new Date(props.plan.fecha_inicio)
  const itemDate = new Date(item.fecha_hora_inicio)
  return Math.max(1, Math.floor((itemDate.getTime() - base.getTime()) / 86400000) + 1)
}

function dayIndexOf2(item: ItemPlan): number {
  return dayIndexForItem(item)
}

const mapItemsForView = computed(() => {
  const coords = props.plan.items.filter(i => i.ubicacion_lat != null && i.ubicacion_lon != null)
  if (mapDayFilter.value === 'all') return coords
  return coords.filter(i => dayIndexForItem(i) === mapDayFilter.value)
})

const mapDayChips = computed(() => {
  const out: {
    index: number
    dayNum: number
    weekdayShort: string
    coordsCount: number
    activityCount: number
  }[] = []
  for (let idx = 1; idx <= totalDays.value; idx++) {
    const date = getDateForDay(idx)
    const row = props.plan.items.filter(i => dayIndexForItem(i) === idx)
    const coordsCount = row.filter(i => i.ubicacion_lat != null && i.ubicacion_lon != null).length
    out.push({
      index: idx,
      dayNum: date.getDate(),
      weekdayShort: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().slice(0, 3),
      coordsCount,
      activityCount: row.length,
    })
  }
  return out
})

const mapLegendTitle = computed(() =>
  mapDayFilter.value === 'all'
    ? `Todas (${mapItemsForView.value.length})`
    : `Día ${mapDayFilter.value} (${mapItemsForView.value.length})`,
)

const mapLegendEmpty = computed(() =>
  mapDayFilter.value === 'all'
    ? 'No hay ubicaciones registradas.'
    : 'Este día no tiene ítems con ubicación en el mapa.',
)

const dayActivityWithoutCoords = computed(() => {
  if (mapDayFilter.value === 'all') return 0
  const ix = mapDayFilter.value
  return props.plan.items.filter(
    i =>
      dayIndexForItem(i) === ix &&
      (i.ubicacion_lat == null || i.ubicacion_lon == null),
  ).length
})

const selectedDayIndex = ref<number | null>(null)

const dayPanelWidth = ref(Math.round(window.innerWidth * 0.5))
function startPanelResize(e: MouseEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startW = dayPanelWidth.value
  const onMove = (ev: MouseEvent) => {
    const delta = startX - ev.clientX
    const min = Math.round(window.innerWidth * 0.25)
    const max = Math.round(window.innerWidth * 0.85)
    dayPanelWidth.value = Math.min(max, Math.max(min, startW + delta))
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const selectedDay = computed(() =>
  selectedDayIndex.value !== null
    ? visibleDays.value.find(d => d.index === selectedDayIndex.value) ?? null
    : null
)

const visibleDays = computed(() => {
  const days = []
  const weekSize = Math.min(7, totalDays.value)
  for (let i = 0; i < weekSize; i++) {
    const dayIdx = currentWeekStart.value + i + 1
    if (dayIdx > totalDays.value) break
    const date = getDateForDay(dayIdx)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const items = props.plan.items.filter(item => dayIndexForItem(item) === dayIdx)
    const total = items.reduce((s, item) => s + (item.monto_total ?? item.precio_estimado ?? 0), 0)
    days.push({
      index: dayIdx,
      date,
      isToday,
      weekdayShort: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().slice(0, 3),
      dayNum: date.getDate(),
      monthShort: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().slice(0, 3),
      items,
      total,
    })
  }
  return days
})

const weekLabel = computed(() => {
  const start = currentWeekStart.value + 1
  const end = Math.min(currentWeekStart.value + 7, totalDays.value)
  if (start === end) return `DÍA ${start}`
  return `DÍA ${start}–${end}`
})

function prevWeek() {
  currentWeekStart.value = Math.max(0, currentWeekStart.value - 7)
}
function nextWeek() {
  if (currentWeekStart.value + 7 < totalDays.value) {
    currentWeekStart.value = Math.min(totalDays.value - 1, currentWeekStart.value + 7)
  }
}

function selectDay(idx: number) {
  selectedDayIndex.value = selectedDayIndex.value === idx ? null : idx
}

function onDragStart(event: DragEvent, item: ItemPlan) {
  draggedItemId.value = item.id_item
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(item.id_item))
  }
}

function onDragEnd() {
  draggedItemId.value = null
  dragOverDay.value = null
}

function onDragOver(dayIdx: number) {
  dragOverDay.value = dayIdx
}

function onDragLeave() {
  dragOverDay.value = null
}

async function onDrop(targetDayIdx: number) {
  dragOverDay.value = null
  if (!draggedItemId.value) return
  const item = props.plan.items.find(i => i.id_item === draggedItemId.value)
  if (!item) return

  const sourceDayIdx = dayIndexForItem(item)
  if (sourceDayIdx === targetDayIdx) return

  const targetDate = getDateForDay(targetDayIdx)
  let newStart: string | null = null
  let newEnd: string | null = null

  if (item.fecha_hora_inicio) {
    const oldStart = new Date(item.fecha_hora_inicio)
    const newStartDate = new Date(targetDate)
    newStartDate.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0)
    newStart = newStartDate.toISOString().slice(0, 10)

    if (item.fecha_hora_fin) {
      const oldEnd = new Date(item.fecha_hora_fin)
      const diff = oldEnd.getTime() - oldStart.getTime()
      const newEndDate = new Date(newStartDate.getTime() + diff)
      newEnd = newEndDate.toISOString().slice(0, 10)
    }
  } else {
    newStart = targetDate.toISOString().slice(0, 10)
  }

  try {
    const updated = await plansApi.updateItem(props.plan.id_plan, item.id_item, {
      fecha_hora_inicio: newStart,
      fecha_hora_fin: newEnd,
    })
    const idx = props.plan.items.findIndex(i => i.id_item === item.id_item)
    if (idx !== -1) props.plan.items[idx] = updated
  } catch (e) {
    console.error('Error moving item', e)
  }
  draggedItemId.value = null
}

function fmtFull(s: string) {
  return new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
function dayShort(d: number) {
  const date = getDateForDay(d)
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtPreviewDate(dt: string) {
  return new Date(dt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}


const editForm = reactive({
  nombre: '', fechaInicio: '', fechaFin: '',
  precioEstimado: '', montoTotal: '', estadoPago: '', localizador: '',
  direccion: '',
})
const editMapCoords = ref<{ lat: number; lon: number } | null>(null)
const geocodeEditLoading = ref(false)
const geocodeEditError = ref('')

async function lookupEditAddress() {
  geocodeEditError.value = ''
  const q = editForm.direccion.trim()
  if (q.length < 4) {
    geocodeEditError.value = 'Escribe al menos 4 caracteres.'
    return
  }
  geocodeEditLoading.value = true
  try {
    const r = await geocodeApi.search(q)
    editMapCoords.value = { lat: r.lat, lon: r.lon }
    editForm.direccion = r.display_name
    editDirty.value = true
  } catch (err: unknown) {
    const ax = err as { response?: { data?: { detail?: string } } }
    geocodeEditError.value = typeof ax.response?.data?.detail === 'string'
      ? ax.response.data.detail
      : 'No se encontró la dirección.'
  } finally {
    geocodeEditLoading.value = false
  }
}

function clearEditMapLocation() {
  editMapCoords.value = null
  editForm.direccion = ''
  geocodeEditError.value = ''
  editDirty.value = true
}
const editSaving = ref(false)
const editDirty = ref(false)
const editSuccess = ref(false)

function openEditItem(item: ItemPlan) {
  if (selectedItem.value?.id_item === item.id_item) { selectedItem.value = null; return }
  selectedItem.value = item
  editDirty.value = false
  editSuccess.value = false
  Object.assign(editForm, {
    nombre:        item.nombre_servicio ?? '',
    fechaInicio:   item.fecha_hora_inicio?.slice(0, 10) ?? '',
    fechaFin:      item.fecha_hora_fin?.slice(0, 10) ?? '',
    precioEstimado: item.precio_estimado != null ? String(item.precio_estimado) : '',
    montoTotal:    item.monto_total != null ? String(item.monto_total) : '',
    estadoPago:    item.estado_pago ?? '',
    localizador:   item.localizador_confirmacion ?? '',
    direccion:     item.ubicacion_direccion ?? '',
  })
  editMapCoords.value =
    item.ubicacion_lat != null && item.ubicacion_lon != null
      ? { lat: item.ubicacion_lat, lon: item.ubicacion_lon }
      : null
  geocodeEditError.value = ''
}

watch(editForm, () => { editDirty.value = true })

async function saveEditItem() {
  if (!selectedItem.value || editSaving.value) return
  editSaving.value = true
  try {
    const updated = await plansApi.updateItem(props.plan.id_plan, selectedItem.value.id_item, {
      nombre_servicio:          editForm.nombre || undefined,
      fecha_hora_inicio:        editForm.fechaInicio || null,
      fecha_hora_fin:           editForm.fechaFin || null,
      precio_estimado:          editForm.precioEstimado ? parseFloat(editForm.precioEstimado) : null,
      monto_total:              editForm.montoTotal ? parseFloat(editForm.montoTotal) : null,
      estado_pago:              editForm.estadoPago || null,
      localizador_confirmacion: editForm.localizador || null,
      ubicacion_lat:            editMapCoords.value?.lat ?? null,
      ubicacion_lon:            editMapCoords.value?.lon ?? null,
      ubicacion_direccion:      editForm.direccion.trim() || null,
    })
    const idx = props.plan.items.findIndex(i => i.id_item === updated.id_item)
    if (idx !== -1) props.plan.items[idx] = updated
    selectedItem.value = updated
    editDirty.value = false
    editSuccess.value = true
    setTimeout(() => { editSuccess.value = false }, 2000)
  } finally {
    editSaving.value = false
  }
}

async function handleDeleteItem(item: ItemPlan) {
  if (!confirm(`¿Eliminar "${item.nombre_servicio || `Ítem ${item.id_item}`}"?`)) return
  await plansApi.deleteItem(props.plan.id_plan, item.id_item)
  const idx = props.plan.items.findIndex(i => i.id_item === item.id_item)
  if (idx !== -1) props.plan.items.splice(idx, 1)
  if (selectedItem.value?.id_item === item.id_item) selectedItem.value = null
}

function confirmDelete() {
  if (confirm(`¿Eliminar "${props.plan.nombre_plan || `Plan ${props.plan.id_plan}`}"?`)) {
    emit('delete', props.plan.id_plan)
  }
}

const showAddModal = ref(false)
const step = ref(1)
const saving = ref(false)
const showSuccess = ref(false)
const form = reactive({ day: 1, typeId: 'actividad', nombre: '', fechaInicio: '', fechaFin: '', precio: '', estadoPago: '', localizador: '', direccion: '' })
const addMapCoords = ref<{ lat: number; lon: number } | null>(null)
const geocodeAddLoading = ref(false)
const geocodeAddError = ref('')

async function lookupAddAddress() {
  geocodeAddError.value = ''
  const q = form.direccion.trim()
  if (q.length < 4) {
    geocodeAddError.value = 'Escribe al menos 4 caracteres.'
    return
  }
  geocodeAddLoading.value = true
  try {
    const r = await geocodeApi.search(q)
    addMapCoords.value = { lat: r.lat, lon: r.lon }
    form.direccion = r.display_name
  } catch (err: unknown) {
    const ax = err as { response?: { data?: { detail?: string } } }
    geocodeAddError.value = typeof ax.response?.data?.detail === 'string'
      ? ax.response.data.detail
      : 'No se encontró la dirección.'
  } finally {
    geocodeAddLoading.value = false
  }
}

function clearAddMapLocation() {
  addMapCoords.value = null
  form.direccion = ''
  geocodeAddError.value = ''
}
const currentType = computed(() => serviceTypes.find(t => t.id === form.typeId) ?? serviceTypes[1])

function openAddModal(day?: number) {
  Object.assign(form, {
    day: day ?? selectedDayIndex.value ?? 1,
    typeId: 'actividad', nombre: '', fechaInicio: '', fechaFin: '',
    precio: '', estadoPago: '', localizador: '', direccion: '',
  })
  addMapCoords.value = null
  geocodeAddError.value = ''
  step.value = 1; showSuccess.value = false; showAddModal.value = true
}

async function confirmAdd() {
  if (!form.nombre || saving.value) return
  saving.value = true
  try {
    const dayDate = getDateForDay(form.day)
    const dateStr = dayDate.toISOString().slice(0, 10)
    const newItem = await plansApi.createItem(props.plan.id_plan, {
      nombre_servicio: form.nombre,
      tipo: tipoIdForCategory(form.typeId),
      fecha_hora_inicio: form.fechaInicio || dateStr,
      fecha_hora_fin: form.fechaFin || null,
      precio_estimado: form.precio ? parseFloat(form.precio) : null,
      estado_pago: form.estadoPago || null,
      localizador_confirmacion: form.localizador || null,
      ubicacion_lat: addMapCoords.value?.lat ?? null,
      ubicacion_lon: addMapCoords.value?.lon ?? null,
      ubicacion_direccion: form.direccion.trim() || null,
    })
    props.plan.items.push(newItem)
    itemCategoryCache[newItem.id_item] = form.typeId
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false; showAddModal.value = false }, 1400)
  } finally { saving.value = false }
}
</script>

<style scoped>
.dark-mode {
  --bg: #0a0a0f;
  --surface: #111118;
  --surface-2: #18181f;
  --border: rgba(255,255,255,0.07);
  --text: #e8e8f0;
  --muted: #5a5a70;
  --accent: #f97316;
  --drag-over: rgba(249,115,22,0.08);
}
.light-mode {
  --bg: #f4f4f9;
  --surface: #ffffff;
  --surface-2: #f0f0f6;
  --border: rgba(15,23,42,0.08);
  --text: #0f172a;
  --muted: #94a3b8;
  --accent: #f97316;
  --drag-over: rgba(249,115,22,0.06);
}

.pd-root {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; flex-direction: column;
  width: 100vw; height: 100vh; overflow: hidden;
  background: var(--bg); color: var(--text);
  font-family: 'DM Sans', sans-serif;
}
.text-accent { color: var(--accent); }

.pd-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  box-shadow: 0 2px 20px rgba(249,115,22,.15), 0 2px 8px rgba(0,0,0,.1);
  flex-shrink: 0;
}
.pd-title { color: var(--accent); }
.pd-meta { color: var(--muted); }
.back-btn {
  background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.25); color: var(--accent); transition: all .2s;
}
.back-btn:hover { background: rgba(249,115,22,.15); border-color: rgba(249,115,22,.5); color: var(--accent); }
.stat-pill {
  background: color-mix(in srgb, var(--pc) 12%, transparent);
  color: var(--pc);
  border: 1px solid color-mix(in srgb, var(--pc) 25%, transparent);
}
.delete-btn { background: var(--surface-2); border: 1px solid var(--border); color: var(--muted); transition: all .2s; }
.delete-btn:hover { background: rgba(239,68,68,.12); color: #ef4444; }
.add-fab {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 4px 20px rgba(249,115,22,.45), 0 1px 4px rgba(249,115,22,.3);
  transition: all .2s;
}
.add-fab:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(249,115,22,.6); }

.tab-switcher {
  display: flex; align-items: center;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 12px; padding: 3px; gap: 2px;
}
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 9px;
  font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .06em;
  color: var(--muted); cursor: pointer; transition: all .2s; white-space: nowrap;
  background: transparent; border: none;
}
.tab-btn--active {
  background: var(--accent); color: #fff;
  box-shadow: 0 2px 10px rgba(249,115,22,.4);
}
.tab-btn:not(.tab-btn--active):hover { color: var(--text); background: var(--surface); }

.week-nav { background: rgba(249,115,22,.06); border: 1px solid rgba(249,115,22,.25); }
.nav-btn { color: var(--accent); opacity: .65; transition: all .2s; }
.nav-btn:hover:not(:disabled) { opacity: 1; color: var(--accent); background: rgba(249,115,22,.12); border-radius: 8px; }
.nav-btn:disabled { opacity: 0.2; }
.pd-body { background: var(--bg); display: flex; flex-direction: column; height: calc(100vh - 56px); }

.week-grid-wrapper {
  flex: 1;
  overflow: hidden;
}
.week-grid {
  display: grid;
  height: 100%;
  gap: 8px;
}

.day-col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
  min-height: 0;
}
.day-col--active {
  border-color: rgba(249,115,22,.55);
  box-shadow: 0 0 0 2px rgba(249,115,22,.2), 0 6px 28px rgba(249,115,22,.18);
}
.day-col--today .day-header {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
}
.day-col--today {
  border-color: rgba(249,115,22,.4);
}

.day-header {
  padding: 10px 10px 6px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  border-top: 2px solid transparent;
  flex-shrink: 0;
  background: var(--surface-2);
  position: relative;
  transition: background .15s, border-color .15s;
}
.day-header:hover {
  background: color-mix(in srgb, var(--accent) 8%, var(--surface-2));
  border-top-color: rgba(249,115,22,.4);
}
.day-col--active .day-header {
  border-top-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
}
.day-header-inner { display: flex; align-items: baseline; gap: 4px; }
.day-weekday { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
.day-number {
  font-size: 24px; font-weight: 900; line-height: 1;
  font-family: 'Syne', sans-serif; color: var(--text);
}
.day-col--active .day-number { color: var(--accent); }
.today-badge {
  color: var(--accent) !important;
}
.day-month { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted); }
.day-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: .08em; margin-top: 2px; }
.day-count {
  position: absolute; top: 8px; right: 8px;
  background: var(--accent); color: #fff;
  font-size: 10px; font-weight: 900;
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.day-items-wrapper {
  flex: 1; overflow-y: auto; padding: 6px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.day-items { display: flex; flex-direction: column; gap: 5px; }

.drop-indicator {
  border: 2px dashed var(--accent);
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 5px;
  text-align: center;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--accent);
  letter-spacing: .1em;
  animation: pulse-drop .8s ease-in-out infinite alternate;
}
@keyframes pulse-drop { from { opacity: .5; } to { opacity: 1; } }

.day-item {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  cursor: grab;
  transition: all .18s;
  position: relative;
}
.day-item:active { cursor: grabbing; opacity: .7; transform: scale(.97); }
.day-item:hover { border-color: color-mix(in srgb, var(--ca) 35%, transparent); box-shadow: 0 2px 12px color-mix(in srgb, var(--ca) 18%, transparent); }
.item-bar { width: 4px; position: absolute; left: 0; top: 0; bottom: 0; }
.item-body { display: flex; align-items: flex-start; gap: 8px; padding: 9px 8px 9px 13px; }
.item-icon {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.item-info { flex: 1; min-width: 0; }
.item-type { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; }
.item-name {
  font-size: 14px; font-weight: 900; text-transform: uppercase;
  font-family: 'Syne', sans-serif;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.25;
  margin-top: 1px;
}
.item-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.pay-badge {
  font-size: 9px; font-weight: 900; text-transform: uppercase;
  padding: 2px 6px; border-radius: 99px;
}
.pay-pending { background: rgba(234,179,8,.15); color: #ca8a04; }
.pay-paid { background: rgba(34,197,94,.15); color: #16a34a; }
.pay-cancel { background: rgba(239,68,68,.15); color: #dc2626; }
.price-tag {
  font-size: 11px; font-weight: 900;
  padding: 2px 6px; border-radius: 6px;
}
.del-item-btn {
  flex-shrink: 0; padding: 4px; border-radius: 6px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer; transition: all .15s;
}
.del-item-btn:hover { background: rgba(239,68,68,.12); color: #ef4444; border-color: rgba(239,68,68,.3); }

.empty-day {
  border: 2px dashed var(--border); border-radius: 10px;
  padding: 16px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s; margin-top: 2px;
  color: var(--muted);
}
.empty-day:hover { border-color: rgba(249,115,22,.3); color: var(--accent); background: rgba(249,115,22,.04); }

.day-footer {
  padding: 5px 10px;
  border-top: 1px solid rgba(249,115,22,.2);
  background: rgba(249,115,22,.05);
  flex-shrink: 0;
  display: flex; justify-content: flex-end;
}
.day-total { font-size: 13px; font-weight: 900; color: var(--accent); }

.summary-bar {
  background: var(--surface);
  border-top: 2px solid rgba(249,115,22,.3);
  box-shadow: 0 -2px 16px rgba(249,115,22,.08);
  flex-shrink: 0;
}

.item-drawer {
  position: fixed; inset: 0; z-index: 9998;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(8px);
}
.drawer-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px 24px 0 0;
  width: 100%; max-width: 480px;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0,0,0,.3);
}
.drawer-accent-bar { height: 3px; }
.close-drawer { background: var(--surface-2); border: 1px solid var(--border); color: var(--muted); cursor: pointer; transition: all .15s; }
.close-drawer:hover { color: var(--text); }
.detail-row { display: flex; align-items: center; gap: 8px; }
.drawer-card { display: flex; flex-direction: column; max-height: 90vh; }
.drawer-form { flex: 1; min-height: 0; }
.drawer-footer { border-top: 1px solid var(--border); background: var(--surface-2); flex-shrink: 0; }
.edit-saved-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em;
  padding: 4px 10px; border-radius: 99px;
  background: rgba(34,197,94,.15); color: #16a34a;
}
.edit-pay-group { display: flex; gap: 6px; }
.edit-pay-btn {
  flex: 1; padding: 8px 4px; border-radius: 10px; font-size: 10px; font-weight: 900;
  text-transform: uppercase; letter-spacing: .06em; cursor: pointer; transition: all .15s;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--muted);
}
.edit-pay-inactive:hover { border-color: rgba(255,255,255,.15); color: var(--text); }
.edit-pay-pending { background: rgba(234,179,8,.15); color: #ca8a04; border-color: rgba(234,179,8,.3); }
.edit-pay-paid    { background: rgba(34,197,94,.15);  color: #16a34a; border-color: rgba(34,197,94,.3); }
.edit-pay-cancel  { background: rgba(239,68,68,.15);  color: #dc2626; border-color: rgba(239,68,68,.3); }
.edit-save-btn { cursor: pointer; }
.edit-save-btn:disabled { cursor: default; }

.geocode-btn {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
  background: rgba(249,115,22,.14);
  border: 1px solid rgba(249,115,22,.38);
  color: var(--accent);
  cursor: pointer;
  transition: background .15s, border-color .15s, opacity .15s;
}
.geocode-btn:hover:not(:disabled) { background: rgba(249,115,22,.24); border-color: rgba(249,115,22,.55); }
.geocode-btn:disabled { opacity: .45; cursor: default; }

.edit-geo-msg { font-size: 11px; font-weight: 600; margin-top: 6px; line-height: 1.35; }
.edit-geo-msg--err { color: #f87171; }
.edit-geo-msg--ok { color: var(--muted); display: flex; align-items: center; gap: 4px; }
.edit-geo-clear {
  margin-top: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}
.edit-geo-clear:hover { color: var(--accent); }

.item-move-move { transition: transform .25s ease; }
.item-move-enter-active { transition: all .2s ease; }
.item-move-leave-active { transition: all .15s ease; }
.item-move-enter-from { opacity: 0; transform: translateY(-8px) scale(.96); }
.item-move-leave-to { opacity: 0; transform: scale(.94); }

.add-sheet {
  background: var(--surface);
  border-top: 1px solid var(--border);
  max-height: 92vh; overflow-y: auto;
}
@media (min-width: 640px) {
  .add-sheet {
    border: 1px solid var(--border);
    box-shadow: 0 40px 80px rgba(0,0,0,.6);
    max-height: 85vh;
  }
}
.modal-title { color: var(--text); }
.type-card { background: var(--surface-2); border-color: var(--border); color: var(--text); cursor: pointer; }
.type-card:hover { background: var(--surface); transform: translateY(-1px); }
.type-card-sel { transform: translateY(-2px); }
.back-step { background: var(--surface-2); border: 1px solid var(--border); color: var(--muted); }
.back-step:hover { color: var(--text); }
.field { display: flex; flex-direction: column; gap: 5px; }
.flbl { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .15em; color: var(--muted); }
.finput {
  padding: 10px 14px; border-radius: 14px;
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--text); font-size: 13px; font-weight: 700;
  outline: none; transition: all .2s;
}
.finput:focus { border-color: rgba(249,115,22,.45); background: var(--surface); box-shadow: 0 0 0 3px rgba(249,115,22,.12); }
.finput::placeholder { color: var(--muted); font-weight: 500; }
.finput option { background: var(--surface); color: var(--text); }
.preview-card { background: var(--surface-2); }
.confirm-row { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); }
.success-ring { animation: ring-in .4s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes ring-in { from { transform: scale(0) rotate(-20deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }

.drawer-enter-active { transition: all .3s cubic-bezier(.34,1.2,.64,1); }
.drawer-leave-active { transition: all .2s ease; }
.drawer-enter-from { opacity: 0; }
.drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-card { transform: translateY(40px); }
.drawer-leave-to .drawer-card { transform: translateY(20px); }

.sheet-enter-active { transition: all .35s cubic-bezier(.34,1.2,.64,1); }
.sheet-leave-active { transition: all .2s ease; }
.sheet-enter-from { opacity: 0; transform: translateY(36px) scale(.97); }
.sheet-leave-to { opacity: 0; transform: translateY(16px); }
.step-slide-enter-active { transition: all .22s cubic-bezier(.4,0,.2,1); }
.step-slide-leave-active { transition: all .15s ease; }
.step-slide-enter-from { opacity: 0; transform: translateX(18px); }
.step-slide-leave-to { opacity: 0; transform: translateX(-10px); }
.success-pop-enter-active { transition: all .28s cubic-bezier(.34,1.56,.64,1); }
.success-pop-leave-active { transition: all .18s ease; }
.success-pop-enter-from { opacity: 0; transform: scale(.92); }
.success-pop-leave-to { opacity: 0; }

.map-view { background: var(--bg); }
.map-day-toolbar {
  flex-shrink: 0;
  z-index: 1001;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(to bottom, var(--surface), var(--surface-2));
}
.map-day-toolbar-inner {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding: 10px 12px;
}
.map-day-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: border-color .15s, background .15s, box-shadow .15s, transform .1s;
  min-width: 0;
}
.map-day-chip:hover { border-color: rgba(249,115,22,.35); }
.map-day-chip:active { transform: scale(.98); }
.map-day-chip--active {
  border-color: rgba(249,115,22,.65);
  background: rgba(249,115,22,.14);
  box-shadow: 0 6px 20px rgba(249,115,22,.18);
}
.map-day-chip--all {
  flex-direction: row;
  align-items: center;
  min-width: 144px;
  gap: 10px;
}
.map-day-chip-icon { flex-shrink: 0; color: var(--accent); opacity: .9; }
.map-day-chip-all-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.map-day-chip-title {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .08em;
  line-height: 1.15;
}
.map-day-chip--all .map-day-chip-title { letter-spacing: .06em; }
.map-day-chip-date {
  font-size: 11px;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
}
.map-day-chip-meta {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  opacity: .95;
}
.map-day-hint {
  padding: 0 14px 10px;
  margin: -4px 0 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--muted);
}

.map-canvas { min-height: 200px; }

.map-legend {
  position: absolute; bottom: 16px; left: 16px; z-index: 1000;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 8px;
  max-height: min(38vh, 280px); overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,.25);
  min-width: 210px;
  max-width: min(92vw, 300px);
}
.map-legend-head {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--muted);
  padding-bottom: 2px;
  border-bottom: 1px solid var(--border);
}
.map-legend-item {
  display: flex; align-items: flex-start; gap: 8px;
  cursor: pointer; transition: opacity .15s; padding: 4px 0;
}
.map-legend-item:hover { opacity: .7; }
.map-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.map-legend-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.map-legend-name { font-size: 12px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 208px; }
.map-legend-sub { font-size: 10px; font-weight: 600; color: var(--muted); line-height: 1.35; word-break: break-word; white-space: normal; }
.map-no-coords {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 12px 8px; color: var(--muted); font-size: 12px; font-weight: 600; text-align: center;
}
.map-no-coords--soft {
  opacity: .92;
  padding-top: 8px;
}

.fade-quick-enter-active { transition: opacity .18s, transform .18s; }
.fade-quick-leave-active { transition: opacity .12s; }
.fade-quick-enter-from { opacity: 0; transform: translateX(6px); }
.fade-quick-leave-to { opacity: 0; }

.day-panel-overlay {
  position: fixed; inset: 0; z-index: 9997;
  display: flex; justify-content: flex-end;
  background: rgba(0,0,0,.35);
  backdrop-filter: blur(4px);
}
.day-panel {
  width: 100%;
  background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  height: 100%;
  box-shadow: -8px 0 40px rgba(0,0,0,.25);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.day-panel-resizer {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 6px; cursor: col-resize; z-index: 10;
  background: transparent;
  transition: background .15s;
}
.day-panel-resizer::after {
  content: '';
  position: absolute; left: 2px; top: 50%; transform: translateY(-50%);
  width: 2px; height: 40px; border-radius: 99px;
  background: var(--border);
  transition: background .15s, height .15s;
}
.day-panel-resizer:hover::after,
.day-panel-resizer:active::after {
  background: var(--accent);
  height: 60px;
}

.day-panel-header {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 18px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  flex-shrink: 0;
}
.day-panel-date-block { display: flex; align-items: center; gap: 10px; }
.day-panel-big-num {
  font-size: 48px; font-weight: 900; line-height: 1;
  font-family: 'Syne', sans-serif; color: var(--text);
}
.day-panel-date-info { display: flex; flex-direction: column; gap: 3px; }
.day-panel-weekday { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
.day-panel-tag {
  display: inline-block; font-size: 9px; font-weight: 900;
  text-transform: uppercase; letter-spacing: .12em;
  padding: 2px 7px; border-radius: 99px;
  background: var(--border); color: var(--muted);
  width: fit-content;
}
.day-panel-tag--today {
  background: rgba(249,115,22,.15); color: var(--accent);
}
.day-panel-budget { text-align: right; }
.day-panel-budget-label { display: block; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
.day-panel-budget-amount { font-size: 20px; font-weight: 900; color: var(--accent); font-family: 'Syne', sans-serif; }
.day-panel-close {
  padding: 8px; border-radius: 12px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer; transition: all .15s; flex-shrink: 0;
}
.day-panel-close:hover { color: var(--text); border-color: rgba(255,255,255,.15); }

.day-panel-types {
  display: flex; gap: 6px; padding: 10px 18px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0; flex-wrap: wrap;
}
.day-panel-type-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 10px; font-weight: 900; text-transform: uppercase;
  border: 1px solid var(--border); color: var(--muted);
  background: var(--surface-2);
  transition: all .15s;
}

.day-panel-body {
  flex: 1; overflow-y: auto; padding: 14px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}

.day-panel-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; gap: 12px; text-align: center;
}
.day-panel-empty-icon {
  width: 56px; height: 56px; border-radius: 18px;
  background: rgba(249,115,22,.08); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.day-panel-empty-text { font-size: 13px; font-weight: 700; color: var(--muted); }
.day-panel-empty-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 12px;
  background: rgba(249,115,22,.1); color: var(--accent);
  border: 1px solid rgba(249,115,22,.25);
  font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em;
  cursor: pointer; transition: all .2s;
}
.day-panel-empty-btn:hover { background: rgba(249,115,22,.18); }

.day-panel-items { display: flex; flex-direction: column; gap: 8px; }
.day-panel-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 12px 12px 14px;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 14px; cursor: pointer;
  transition: all .18s; position: relative; overflow: hidden;
}
.day-panel-item:hover {
  border-color: color-mix(in srgb, var(--ci) 35%, transparent);
  box-shadow: 0 3px 14px color-mix(in srgb, var(--ci) 14%, transparent);
  transform: translateY(-1px);
}
.day-panel-item-stripe {
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
}
.day-panel-item-icon {
  width: 38px; height: 38px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.day-panel-item-info { flex: 1; min-width: 0; }
.day-panel-item-type { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; }
.day-panel-item-name {
  font-size: 14px; font-weight: 900; text-transform: uppercase;
  font-family: 'Syne', sans-serif; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 1px;
}
.day-panel-item-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 6px; }
.day-panel-item-date {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 600; color: var(--muted);
}
.day-panel-del {
  flex-shrink: 0; padding: 6px; border-radius: 8px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer; transition: all .15s;
  align-self: flex-start;
}
.day-panel-del:hover { background: rgba(239,68,68,.12); color: #ef4444; border-color: rgba(239,68,68,.3); }

.day-panel-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  flex-shrink: 0;
}
.day-panel-add-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: #fff; font-size: 13px; font-weight: 900;
  text-transform: uppercase; letter-spacing: .08em;
  box-shadow: 0 4px 16px rgba(249,115,22,.35);
  cursor: pointer; transition: all .2s; border: none;
}
.day-panel-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(249,115,22,.5); }

.day-panel-enter-active { transition: all .3s cubic-bezier(.34,1.1,.64,1); }
.day-panel-leave-active { transition: all .22s ease; }
.day-panel-enter-from .day-panel { transform: translateX(100%); }
.day-panel-leave-to .day-panel { transform: translateX(100%); }
.day-panel-enter-from { opacity: 0; }
.day-panel-leave-to { opacity: 0; }
</style>