<template>
  <div class="planner-root min-h-screen" :class="store.isDark ? 'dark-mode' : 'light-mode'">

    <!-- ══════════════════════════════════════════
         STICKY HEADER
    ══════════════════════════════════════════ -->
    <header class="planner-header sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center gap-3">
      <button class="back-btn flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-sm transition-all" @click="$emit('close')">
        <ArrowLeft :size="15" />
        <span class="hidden sm:inline">Viajes</span>
      </button>

      <div class="flex-1 min-w-0">
        <h1 class="trip-title text-lg lg:text-xl font-black uppercase tracking-tighter truncate" style="font-family:'Syne',sans-serif;">
          {{ trip.title }}
        </h1>
        <p class="trip-meta text-[10px] font-bold uppercase tracking-widest mt-0.5">
          {{ fmtFull(trip.startDate) }} → {{ fmtFull(trip.endDate) }} · {{ totalDays }} días
        </p>
      </div>

      <!-- Summary pills -->
      <div class="hidden lg:flex items-center gap-1.5">
        <div v-for="t in serviceTypes" :key="t.id"
          class="stat-pill flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black"
          :style="`--pc:${t.color}`">
          <component :is="t.icon" :size="10" />
          <span>{{ allItems.filter(i=>i.type===t.id).length }}</span>
        </div>
      </div>

      <!-- View toggle -->
      <div class="view-toggle flex rounded-xl overflow-hidden p-0.5 gap-0.5">
        <button class="vtbtn px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all"
          :class="viewMode==='days'?'vtbtn-active':''" @click="viewMode='days'">
          <LayoutList :size="13" class="inline mr-1" />Días
        </button>
        <button class="vtbtn px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all"
          :class="viewMode==='week'?'vtbtn-active':''" @click="viewMode='week'">
          <CalendarDays :size="13" class="inline mr-1" />Semana
        </button>
      </div>

      <!-- Add event FAB -->
      <button class="add-fab flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-white transition-all"
        @click="openAddModal()">
        <Plus :size="15" />
        <span class="hidden sm:inline">Añadir</span>
      </button>

      <button class="delete-btn p-2.5 rounded-xl transition-all" @click="confirmDelete">
        <Trash2 :size="15" />
      </button>
    </header>

    <!-- ══════════════════════════════════════════
         VIEW: DAYS
    ══════════════════════════════════════════ -->
    <div v-if="viewMode==='days'" class="planner-body flex flex-col lg:flex-row min-h-[calc(100vh-72px)]">

      <!-- Day rail -->
      <aside class="day-rail lg:w-[200px] xl:w-[230px] flex-shrink-0">
        <div class="day-rail-inner p-3 lg:p-4 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto lg:h-[calc(100vh-72px)] lg:sticky lg:top-[72px]">
          <span class="day-rail-lbl hidden lg:block text-[9px] font-black uppercase tracking-[0.2em] px-1 mb-1">Días</span>
          <button v-for="d in totalDays" :key="d"
            class="day-btn flex-shrink-0 flex flex-col lg:flex-row items-center gap-1 lg:gap-2.5 px-2.5 py-2 lg:px-3 lg:py-2.5 rounded-2xl transition-all"
            :class="activeDay===d?'day-btn-active':''"
            @click="setDay(d)">
            <div class="day-num w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">{{ d }}</div>
            <div class="flex flex-col items-center lg:items-start gap-px">
              <span class="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{{ dayShort(d) }}</span>
              <span class="day-count-lbl text-[8px] font-bold whitespace-nowrap">{{ getDay(d).length }} ev.</span>
            </div>
            <div class="hidden lg:flex gap-1 ml-auto">
              <div v-for="t in serviceTypes" :key="t.id" v-show="countType(d,t.id)>0"
                class="w-1.5 h-1.5 rounded-full" :style="`background:${t.color}`" />
            </div>
          </button>
        </div>
      </aside>

      <!-- Timeline main -->
      <main class="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">

        <!-- Day heading -->
        <div class="flex items-end justify-between gap-4 mb-7">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{{ dayLong(activeDay) }}</p>
            <h2 class="text-3xl lg:text-5xl font-black uppercase tracking-tighter" style="font-family:'Syne',sans-serif;">
              Día <span class="text-accent">{{ activeDay }}</span>
            </h2>
            <p class="text-sm font-semibold opacity-40 mt-0.5">
              {{ getDay(activeDay).length===0 ? 'Sin eventos aún' : `${getDay(activeDay).length} evento${getDay(activeDay).length!==1?'s':''} planificados` }}
            </p>
          </div>
          <div class="hidden sm:flex flex-wrap gap-1.5">
            <span v-for="t in serviceTypes" :key="t.id"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
              :style="`background:${t.color}15;color:${t.color};border:1px solid ${t.color}30`">
              <component :is="t.icon" :size="10" />{{ t.label }}
            </span>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="getDay(activeDay).length===0"
          class="empty-state rounded-3xl p-12 lg:p-20 flex flex-col items-center text-center">
          <div class="empty-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <CalendarPlus :size="30" />
          </div>
          <h3 class="text-lg font-black uppercase mb-2" style="font-family:'Syne',sans-serif;">Día libre</h3>
          <p class="text-sm opacity-40 mb-6 max-w-xs">Agrega tu primer evento para este día</p>
          <button class="add-cta px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all"
            @click="openAddModal()">+ Agregar evento</button>
        </div>

        <!-- Timeline list -->
        <TransitionGroup v-else name="item-anim" tag="div" class="space-y-3 mb-4">
          <div v-for="(item,idx) in sortedDay" :key="item.id" class="timeline-item pl-7">
            <div class="tl-conn" :class="idx<sortedDay.length-1?'tl-conn-line':''">
              <div class="tl-dot" :style="`background:${svc(item.type).color};box-shadow:0 0 0 4px ${svc(item.type).color}25`" />
            </div>
            <div class="item-card rounded-2xl lg:rounded-3xl group transition-all"
              :style="`--ca:${svc(item.type).color}`">
              <div class="card-top-strip h-[3px] rounded-t-2xl" :style="`background:${svc(item.type).color}`" />
              <div class="p-4 lg:p-5 flex gap-3 items-start">
                <div class="svc-icon w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  :style="`background:${svc(item.type).color}18;color:${svc(item.type).color}`">
                  <component :is="svc(item.type).icon" :size="19" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <p class="text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
                        :style="`color:${svc(item.type).color}`">{{ svc(item.type).label }}</p>
                      <h4 class="item-title font-black text-sm lg:text-base uppercase tracking-tight" style="font-family:'Syne',sans-serif;">
                        {{ item.title }}
                      </h4>
                    </div>
                    <span v-if="item.time" class="time-chip flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-black"
                      :style="`background:${svc(item.type).color}18;color:${svc(item.type).color}`">
                      {{ item.time }}
                    </span>
                  </div>
                  <div v-if="item.location" class="flex items-center gap-1 mt-1.5">
                    <MapPin :size="11" class="opacity-35 flex-shrink-0" />
                    <span class="text-xs font-semibold opacity-50 truncate">{{ item.location }}</span>
                  </div>
                  <p v-if="item.notes" class="text-xs opacity-40 mt-1.5 leading-relaxed">{{ item.notes }}</p>
                  <span v-if="item.price" class="inline-block mt-2 text-xs font-black px-2 py-0.5 rounded-md"
                    :style="`background:${svc(item.type).color}12;color:${svc(item.type).color}`">{{ item.price }}</span>
                </div>
                <button class="del-item-btn p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-auto flex-shrink-0"
                  @click="removeItem(activeDay,item.id)">
                  <X :size="13" />
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Add more -->
        <button v-if="getDay(activeDay).length>0"
          class="add-more-btn w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 border-2 border-dashed transition-all mt-2"
          @click="openAddModal()">
          <Plus :size="16" /> Agregar evento al día {{ activeDay }}
        </button>

        <!-- Day nav -->
        <div class="flex items-center justify-between mt-8 gap-3">
          <button class="nav-btn px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all disabled:opacity-25"
            :disabled="activeDay<=1" @click="activeDay--">
            <ChevronLeft :size="15" /> Anterior
          </button>
          <div class="flex gap-1.5 items-center">
            <div v-for="d in Math.min(totalDays,12)" :key="d"
              class="prog-dot rounded-full cursor-pointer transition-all"
              :class="d===activeDay?'prog-active':getDay(d).length>0?'prog-filled':'prog-empty'"
              @click="setDay(d)" />
            <span v-if="totalDays>12" class="text-[10px] opacity-30 font-bold">+{{ totalDays-12 }}</span>
          </div>
          <button class="nav-btn px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all disabled:opacity-25"
            :disabled="activeDay>=totalDays" @click="activeDay++">
            Siguiente <ChevronRight :size="15" />
          </button>
        </div>
      </main>
    </div>

    <!-- ══════════════════════════════════════════
         VIEW: WEEK CALENDAR
    ══════════════════════════════════════════ -->
    <div v-else class="p-4 lg:p-8">

      <div class="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl lg:text-3xl font-black uppercase tracking-tighter" style="font-family:'Syne',sans-serif;">
            Vista <span class="text-accent">semanal</span>
          </h2>
          <p class="text-xs font-bold opacity-40 uppercase tracking-widest mt-0.5">
            Semana {{ currentWeek+1 }} de {{ totalWeeks }} · {{ weekRangeLabel }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button class="nav-btn px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1 disabled:opacity-25 transition-all"
            :disabled="currentWeek===0" @click="currentWeek--">
            <ChevronLeft :size="14" />
          </button>
          <span class="week-counter text-sm font-black px-3 py-2 rounded-xl">
            {{ currentWeek+1 }} / {{ totalWeeks }}
          </span>
          <button class="nav-btn px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1 disabled:opacity-25 transition-all"
            :disabled="currentWeek>=totalWeeks-1" @click="currentWeek++">
            <ChevronRight :size="14" />
          </button>
          <button class="add-fab px-4 py-2 rounded-xl font-black text-xs text-white ml-2 transition-all"
            @click="openAddModal()">
            <Plus :size="13" class="inline mr-1" />Evento
          </button>
        </div>
      </div>

      <!-- Calendar grid wrapper (horizontal scroll on mobile) -->
      <div class="overflow-x-auto rounded-3xl border cal-grid-border">
        <div class="cal-grid min-w-[600px] rounded-3xl overflow-hidden">

          <!-- Header -->
          <div class="cal-header grid" :style="`grid-template-columns: 56px repeat(${weekDays.length}, 1fr)`">
            <div class="cal-header-cell-time" />
            <div v-for="col in weekDays" :key="'h'+col.dayNum"
              class="cal-header-cell px-2 py-3 text-center cursor-pointer transition-all"
              :class="col.isToday?'cal-header-today':''"
              @click="switchToDay(col.dayNum)">
              <p class="text-[9px] font-black uppercase tracking-widest opacity-50">{{ col.weekdayShort }}</p>
              <p class="text-xl font-black mt-0.5 leading-none" :class="col.isToday?'text-accent':''">{{ col.dayOfMonth }}</p>
              <p class="text-[8px] font-bold opacity-35 mt-0.5 uppercase">{{ col.monthShort }}</p>
              <!-- item dots summary -->
              <div class="flex justify-center gap-0.5 mt-1.5">
                <div v-for="t in serviceTypes" :key="t.id" v-show="countType(col.dayNum,t.id)>0"
                  class="w-1.5 h-1.5 rounded-full" :style="`background:${t.color}`" />
              </div>
            </div>
          </div>

          <!-- All-day row (alojamiento + transporte) -->
          <div class="cal-allday-strip grid" :style="`grid-template-columns: 56px repeat(${weekDays.length}, 1fr)`">
            <div class="allday-label text-[8px] font-black uppercase opacity-30 flex items-center justify-center px-1">Todo día</div>
            <div v-for="col in weekDays" :key="'ad'+col.dayNum"
              class="cal-cell p-1 min-h-[44px]"
              :class="col.isToday?'cal-today-col':''"
              @click="openAddModal(col.dayNum)">
              <TransitionGroup name="chip-anim" tag="div" class="flex flex-col gap-1">
                <div v-for="item in getDay(col.dayNum).filter(i=>['alojamiento','transporte'].includes(i.type))"
                  :key="item.id"
                  class="cal-chip group flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black cursor-default"
                  :style="`background:${svc(item.type).color}22;color:${svc(item.type).color};border:1px solid ${svc(item.type).color}40`"
                  @click.stop="">
                  <component :is="svc(item.type).icon" :size="9" class="flex-shrink-0" />
                  <span class="truncate flex-1">{{ item.title }}</span>
                  <button class="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    @click.stop="removeItem(col.dayNum,item.id)">
                    <X :size="8" />
                  </button>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- Time slot rows -->
          <div v-for="slot in timeSlots" :key="slot"
            class="cal-slot-row grid"
            :style="`grid-template-columns: 56px repeat(${weekDays.length}, 1fr)`">
            <div class="time-lbl flex items-start justify-end pr-2 pt-2">
              <span class="text-[10px] font-black opacity-25 uppercase">{{ slot }}</span>
            </div>
            <div v-for="col in weekDays" :key="col.dayNum+slot"
              class="cal-cell p-1 min-h-[52px]"
              :class="col.isToday?'cal-today-col':''"
              @click="openAddModal(col.dayNum, slot)">
              <TransitionGroup name="chip-anim" tag="div" class="flex flex-col gap-1">
                <div v-for="item in getItemsForSlot(col.dayNum, slot)"
                  :key="item.id"
                  class="cal-chip-timed group flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black cursor-default"
                  :style="`background:${svc(item.type).color};color:#fff;box-shadow:0 2px 8px ${svc(item.type).color}60`"
                  @click.stop="">
                  <component :is="svc(item.type).icon" :size="10" class="flex-shrink-0 mt-0.5" />
                  <span class="truncate leading-tight flex-1">{{ item.title }}</span>
                  <button class="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    @click.stop="removeItem(col.dayNum,item.id)">
                    <X :size="9" />
                  </button>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-2.5 mt-5">
        <span v-for="t in serviceTypes" :key="t.id"
          class="flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-full"
          :style="`background:${t.color}14;color:${t.color};border:1px solid ${t.color}28`">
          <component :is="t.icon" :size="11" />{{ t.label }}
        </span>
        <span class="text-xs font-bold opacity-40 self-center ml-2">Haz clic en una celda para añadir un evento a ese día y hora</span>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         ADD EVENT MODAL — 3 steps
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style="background:rgba(0,0,0,0.72);backdrop-filter:blur(10px)"
          @click.self="showModal=false">

          <div class="add-sheet w-full sm:max-w-[480px] rounded-t-[32px] sm:rounded-[32px] overflow-hidden relative">

            <!-- Progress bar -->
            <div class="flex items-center gap-1.5 px-6 pt-5 pb-4">
              <div v-for="s in 3" :key="s"
                class="h-1 rounded-full flex-1 transition-all duration-500"
                :style="s<=step?`background:${svc(form.type).color}`:'background:var(--border)'" />
            </div>

            <!-- ── STEP 1: type selection ── -->
            <Transition name="step-slide" mode="out-in">
              <div v-if="step===1" key="s1" class="px-6 pb-6 space-y-4">
                <div>
                  <h3 class="modal-title text-xl font-black uppercase" style="font-family:'Syne',sans-serif;">
                    ¿Qué tipo de evento?
                  </h3>
                  <p class="text-xs opacity-40 font-bold uppercase tracking-widest mt-0.5">
                    Día {{ form.day }} · {{ dayShort(form.day) }}
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <button v-for="t in serviceTypes" :key="t.id"
                    class="type-card flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left"
                    :class="form.type===t.id?'type-card-sel':''"
                    :style="form.type===t.id?`border-color:${t.color};background:${t.color}12`:''"
                    @click="form.type=t.id">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                      :style="`background:${form.type===t.id?t.color:t.color+'18'};color:${form.type===t.id?'#fff':t.color}`">
                      <component :is="t.icon" :size="20" />
                    </div>
                    <div>
                      <p class="font-black uppercase tracking-wide text-sm">{{ t.label }}</p>
                      <p class="text-[10px] opacity-50 font-semibold mt-0.5">{{ t.desc }}</p>
                    </div>
                    <div v-if="form.type===t.id"
                      class="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      :style="`background:${t.color}`">
                      <CheckCircle2 :size="13" class="text-white" />
                    </div>
                  </button>
                </div>
                <button class="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all disabled:opacity-40"
                  :style="`background:${svc(form.type).color};box-shadow:0 6px 20px ${svc(form.type).color}45`"
                  @click="step=2">
                  Continuar →
                </button>
              </div>
            </Transition>

            <!-- ── STEP 2: details form ── -->
            <Transition name="step-slide" mode="out-in">
              <div v-if="step===2" key="s2" class="px-6 pb-6 space-y-3">
                <div class="flex items-center gap-3 mb-1">
                  <button class="back-step p-2 rounded-xl transition-all" @click="step=1">
                    <ChevronLeft :size="15" />
                  </button>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      :style="`background:${svc(form.type).color};color:#fff`">
                      <component :is="svc(form.type).icon" :size="14" />
                    </div>
                    <div>
                      <p class="font-black uppercase text-sm" :style="`color:${svc(form.type).color}`">{{ svc(form.type).label }}</p>
                      <p class="text-[10px] opacity-40 font-bold">Día {{ form.day }}</p>
                    </div>
                  </div>
                </div>

                <div class="field">
                  <label class="flbl">Nombre *</label>
                  <input v-model="form.title" type="text" class="finput w-full"
                    :placeholder="svc(form.type).placeholder"
                    @keyup.enter="form.title&&(step=3)" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="field">
                    <label class="flbl">Hora</label>
                    <input v-model="form.time" type="time" class="finput w-full" />
                  </div>
                  <div class="field">
                    <label class="flbl">Precio</label>
                    <input v-model="form.price" type="text" class="finput w-full" placeholder="€ 0" />
                  </div>
                </div>
                <div class="field">
                  <label class="flbl">Ubicación</label>
                  <input v-model="form.location" type="text" class="finput w-full" placeholder="Ciudad, dirección..." />
                </div>
                <div class="field">
                  <label class="flbl">Notas</label>
                  <textarea v-model="form.notes" class="finput w-full resize-none" rows="2"
                    placeholder="Detalles, confirmación..." />
                </div>
                <button class="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all disabled:opacity-40"
                  :style="`background:${svc(form.type).color};box-shadow:0 6px 20px ${svc(form.type).color}45`"
                  :disabled="!form.title" @click="step=3">
                  Vista previa →
                </button>
              </div>
            </Transition>

            <!-- ── STEP 3: preview + confirm ── -->
            <Transition name="step-slide" mode="out-in">
              <div v-if="step===3" key="s3" class="px-6 pb-6 space-y-4">
                <div class="flex items-center gap-3 mb-1">
                  <button class="back-step p-2 rounded-xl transition-all" @click="step=2">
                    <ChevronLeft :size="15" />
                  </button>
                  <p class="font-black uppercase text-sm opacity-50">Vista previa</p>
                </div>

                <!-- Preview card matches timeline card -->
                <div class="preview-card rounded-2xl overflow-hidden"
                  :style="`border:1px solid ${svc(form.type).color}35;background:var(--surface-2)`">
                  <div class="h-[3px]" :style="`background:${svc(form.type).color}`" />
                  <div class="p-4 flex gap-3">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      :style="`background:${svc(form.type).color}18;color:${svc(form.type).color}`">
                      <component :is="svc(form.type).icon" :size="19" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <p class="text-[9px] font-black uppercase tracking-[0.15em]" :style="`color:${svc(form.type).color}`">{{ svc(form.type).label }}</p>
                          <h4 class="font-black text-sm uppercase tracking-tight" style="font-family:'Syne',sans-serif;">{{ form.title }}</h4>
                        </div>
                        <span v-if="form.time" class="text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0"
                          :style="`background:${svc(form.type).color}18;color:${svc(form.type).color}`">{{ form.time }}</span>
                      </div>
                      <div v-if="form.location" class="flex items-center gap-1 mt-1.5">
                        <MapPin :size="10" class="opacity-35 flex-shrink-0" />
                        <span class="text-xs opacity-50">{{ form.location }}</span>
                      </div>
                      <p v-if="form.notes" class="text-xs opacity-40 mt-1">{{ form.notes }}</p>
                      <span v-if="form.price" class="inline-block mt-2 text-xs font-black px-2 py-0.5 rounded-md"
                        :style="`background:${svc(form.type).color}12;color:${svc(form.type).color}`">{{ form.price }}</span>
                    </div>
                  </div>
                </div>

                <!-- Day selector -->
                <div class="confirm-row rounded-xl p-3 flex items-center gap-3">
                  <CalendarDays :size="15" class="opacity-40 flex-shrink-0" />
                  <div class="flex-1">
                    <p class="text-[10px] font-black uppercase opacity-40 tracking-widest">Se añadirá al</p>
                    <p class="text-sm font-black">Día {{ form.day }} · {{ dayLong(form.day) }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <button class="p-1.5 rounded-lg transition-all opacity-40 hover:opacity-100 disabled:opacity-15"
                      :disabled="form.day<=1" @click="form.day--">
                      <ChevronLeft :size="12" />
                    </button>
                    <button class="p-1.5 rounded-lg transition-all opacity-40 hover:opacity-100 disabled:opacity-15"
                      :disabled="form.day>=totalDays" @click="form.day++">
                      <ChevronRight :size="12" />
                    </button>
                  </div>
                </div>

                <button class="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all flex items-center justify-center gap-2"
                  :style="`background:${svc(form.type).color};box-shadow:0 8px 24px ${svc(form.type).color}50`"
                  @click="confirmAdd">
                  <component :is="svc(form.type).icon" :size="15" />
                  Confirmar y agregar
                </button>
              </div>
            </Transition>

            <!-- ── SUCCESS OVERLAY ── -->
            <Transition name="success-pop">
              <div v-if="showSuccess"
                class="absolute inset-0 flex flex-col items-center justify-center rounded-[32px] z-10"
                :style="`background:${svc(lastType).color}`">
                <div class="success-ring w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <CheckCircle2 :size="36" class="text-white" />
                </div>
                <p class="text-white font-black text-2xl uppercase tracking-tight" style="font-family:'Syne',sans-serif;">¡Listo!</p>
                <p class="text-white/70 text-sm font-bold mt-1 px-6 text-center">{{ lastTitle }}</p>
                <p class="text-white/50 text-xs font-bold mt-0.5 uppercase tracking-widest">Día {{ lastDay }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  ArrowLeft, Trash2, MapPin, Plus, X, ChevronLeft, ChevronRight,
  Hotel, Compass, Utensils, Car, CalendarPlus, CalendarDays,
  LayoutList, CheckCircle2
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

interface PlanItem {
  id: string; type: string; title: string; time: string
  location: string; notes: string; price: string
}
interface Trip {
  id: string; title: string; startDate: string; endDate: string
  activities?: Record<number, any[]>
}

const props = defineProps<{ trip: Trip }>()
const emit = defineEmits<{ (e:'close'):void; (e:'delete',id:string):void }>()
const store = useAppStore()

// ─── Service types ─────────────────────────────────────────────────────────────
const serviceTypes = [
  { id:'alojamiento', label:'Hotel',    icon:Hotel,    color:'#3b82f6', desc:'Dónde te quedas',  placeholder:'Hotel Ritz, Airbnb...' },
  { id:'actividad',   label:'Aventura', icon:Compass,  color:'#10b981', desc:'Qué vas a hacer',  placeholder:'Visita al templo...' },
  { id:'restaurante', label:'Comida',   icon:Utensils, color:'#ef4444', desc:'Dónde comer',      placeholder:'Restaurante La Mar...' },
  { id:'transporte',  label:'Ruta',     icon:Car,      color:'#6366f1', desc:'Cómo te mueves',   placeholder:'Vuelo IB1234, AVE...' },
]
const svc = (id:string) => serviceTypes.find(t=>t.id===id) ?? serviceTypes[1]

// ─── State ────────────────────────────────────────────────────────────────────
const viewMode = ref<'days'|'week'>('days')
const activeDay = ref(1)
const currentWeek = ref(0)
const showModal = ref(false)
const step = ref(1)
const showSuccess = ref(false)
const lastType = ref('actividad')
const lastTitle = ref('')
const lastDay = ref(1)

const localItems = reactive<Record<number,PlanItem[]>>({})

// Hydrate from trip
;(() => {
  if (!props.trip?.activities) return
  Object.entries(props.trip.activities).forEach(([k,v]) => {
    localItems[Number(k)] = (v as any[]).map(item => ({
      id: item.id || String(Date.now()+Math.random()),
      type: item.type || 'actividad',
      title: item.title || '',
      time: item.time || '',
      location: item.location || '',
      notes: item.notes || '',
      price: item.price || '',
    }))
  })
})()

const form = reactive({ day:1, type:'actividad', title:'', time:'', location:'', notes:'', price:'' })

// ─── Computed ──────────────────────────────────────────────────────────────────
const totalDays = computed(() => {
  const s = new Date(props.trip.startDate), e = new Date(props.trip.endDate)
  return Math.max(1, Math.ceil((e.getTime()-s.getTime())/86400000)+1)
})

const allItems = computed(() => Object.values(localItems).flat())

const sortedDay = computed(() =>
  [...(localItems[activeDay.value]??[])].sort((a,b)=>a.time.localeCompare(b.time))
)

const totalWeeks = computed(() => Math.ceil(totalDays.value/7))

const weekRangeLabel = computed(() => {
  const s = currentWeek.value*7+1
  const e = Math.min(s+6, totalDays.value)
  return `Días ${s}–${e}`
})

const weekDays = computed(() => {
  const startD = currentWeek.value*7+1
  const today = new Date()
  const cols = []
  for (let i=0; i<7; i++) {
    const dayNum = startD+i
    if (dayNum>totalDays.value) break
    const d = dayDate(dayNum)
    cols.push({
      dayNum,
      weekdayShort: d.toLocaleDateString('es-ES',{weekday:'short'}),
      dayOfMonth: d.getDate(),
      monthShort: d.toLocaleDateString('es-ES',{month:'short'}),
      isToday: d.toDateString()===today.toDateString()
    })
  }
  return cols
})

const timeSlots = ['08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dayDate(day:number):Date {
  const d = new Date(props.trip.startDate)
  d.setDate(d.getDate()+day-1)
  return d
}
function fmtFull(s:string) { return new Date(s).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) }
function dayShort(d:number) { return dayDate(d).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'}) }
function dayLong(d:number) { return dayDate(d).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}) }
function getDay(d:number):PlanItem[] { return localItems[d]??[] }
function countType(d:number, t:string) { return getDay(d).filter(i=>i.type===t).length }

function getItemsForSlot(dayNum:number, slot:string):PlanItem[] {
  return getDay(dayNum).filter(i => {
    if (!i.time || !['actividad','restaurante'].includes(i.type)) return false
    return i.time.startsWith(slot.split(':')[0].padStart(2,'0'))
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function setDay(d:number) { activeDay.value=d }

function switchToDay(d:number) {
  viewMode.value='days'
  activeDay.value=d
}

function openAddModal(day?:number, time?:string) {
  Object.assign(form, { day: day??activeDay.value, type:'actividad', title:'', time:time??'', location:'', notes:'', price:'' })
  step.value=1
  showModal.value=true
  showSuccess.value=false
}

function confirmAdd() {
  if (!form.title) return
  const item:PlanItem = {
    id: Date.now().toString(),
    type: form.type, title: form.title, time: form.time,
    location: form.location, notes: form.notes, price: form.price
  }
  if (!localItems[form.day]) localItems[form.day]=[]
  localItems[form.day].push(item)

  // persist
  try { store.addActivity?.(props.trip.id, form.day, { id:item.id, title:item.title, location:item.location, time:item.time }) } catch {}

  lastType.value=form.type
  lastTitle.value=form.title
  lastDay.value=form.day
  activeDay.value=form.day
  showSuccess.value=true
  setTimeout(()=>{ showSuccess.value=false; showModal.value=false }, 1500)
}

function removeItem(day:number, id:string) {
  if (!localItems[day]) return
  localItems[day]=localItems[day].filter(i=>i.id!==id)
}

function confirmDelete() {
  if (confirm(`¿Eliminar "${props.trip.title}"?`)) {
    emit('delete', props.trip.id)
    emit('close')
  }
}
</script>

<style scoped>
.dark-mode {
  --bg:#0a0a0f; --surface:#111118; --surface-2:#18181f;
  --border:rgba(255,255,255,0.07); --text:#e8e8f0; --muted:#5a5a70; --accent:#f97316;
}
.light-mode {
  --bg:#f4f4f9; --surface:#ffffff; --surface-2:#f0f0f6;
  --border:rgba(15,23,42,0.08); --text:#0f172a; --muted:#94a3b8; --accent:#f97316;
}
.planner-root { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }
.text-accent { color:var(--accent); }

/* HEADER */
.planner-header { background:var(--surface); border-bottom:1px solid var(--border); box-shadow:0 2px 20px rgba(0,0,0,.13); }
.back-btn { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); }
.back-btn:hover { color:var(--accent); border-color:rgba(249,115,22,.3); }
.trip-title { color:var(--text); }
.trip-meta { color:var(--muted); }
.stat-pill { background:color-mix(in srgb,var(--pc) 12%,transparent); color:var(--pc); border:1px solid color-mix(in srgb,var(--pc) 25%,transparent); }
.delete-btn { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); }
.delete-btn:hover { background:rgba(239,68,68,.12); color:#ef4444; }
.view-toggle { background:var(--surface-2); border:1px solid var(--border); }
.vtbtn { color:var(--muted); }
.vtbtn:hover { color:var(--text); }
.vtbtn-active { background:var(--surface); color:var(--accent); box-shadow:0 2px 8px rgba(0,0,0,.15); }
.add-fab { background:var(--accent); box-shadow:0 4px 16px rgba(249,115,22,.35); }
.add-fab:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(249,115,22,.5); }

/* DAY RAIL */
.day-rail { background:var(--surface); border-bottom:1px solid var(--border); }
@media(min-width:1024px){ .day-rail { border-bottom:none; border-right:1px solid var(--border); } }
.day-rail-inner { scrollbar-width:none; }
.day-rail-inner::-webkit-scrollbar { display:none; }
.day-rail-lbl { color:var(--muted); }
.day-btn { color:var(--muted); }
.day-btn:hover { background:var(--surface-2); color:var(--text); }
.day-btn-active { background:color-mix(in srgb,var(--accent) 10%,transparent); color:var(--accent); }
.day-num { background:var(--surface-2); color:var(--muted); font-family:'Syne',sans-serif; transition:all .2s; }
.day-btn-active .day-num { background:var(--accent); color:#fff; box-shadow:0 3px 10px rgba(249,115,22,.4); }
.day-count-lbl { color:var(--muted); }

/* TIMELINE */
.empty-state { background:var(--surface); border:2px dashed var(--border); }
.empty-icon { background:var(--surface-2); color:var(--muted); }
.add-cta { background:var(--accent); box-shadow:0 6px 20px rgba(249,115,22,.35); }
.add-cta:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(249,115,22,.5); }
.timeline-item { position:relative; }
.tl-conn { position:absolute; left:0; top:0; bottom:-12px; width:28px; display:flex; flex-direction:column; align-items:center; }
.tl-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:20px; z-index:1; }
.tl-conn-line::before { content:''; position:absolute; left:5px; top:32px; bottom:-12px; width:2px; background:var(--border); }
.item-card { background:var(--surface); border:1px solid var(--border); box-shadow:0 3px 12px rgba(0,0,0,.07); transition:all .2s; }
.item-card:hover { border-color:color-mix(in srgb,var(--ca) 28%,transparent); box-shadow:0 6px 24px rgba(0,0,0,.13); transform:translateX(3px); }
.item-title { color:var(--text); }
.del-item-btn { background:var(--surface-2); color:var(--muted); }
.del-item-btn:hover { background:rgba(239,68,68,.12); color:#ef4444; }
.add-more-btn { border-color:var(--border); color:var(--muted); }
.add-more-btn:hover { border-color:var(--accent); color:var(--accent); background:color-mix(in srgb,var(--accent) 5%,transparent); }
.nav-btn { background:var(--surface); border:1px solid var(--border); color:var(--muted); }
.nav-btn:not(:disabled):hover { color:var(--accent); border-color:rgba(249,115,22,.3); }
.prog-dot { }
.prog-active { background:var(--accent); width:20px; height:8px; box-shadow:0 0 0 3px rgba(249,115,22,.2); }
.prog-filled { background:var(--muted); width:8px; height:8px; }
.prog-empty { background:var(--border); width:8px; height:8px; }

/* WEEK CALENDAR */
.week-counter { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); font-family:'Syne',sans-serif; }
.cal-grid-border { border-color:var(--border); }
.cal-grid { background:var(--surface); }
.cal-header { background:var(--surface-2); border-bottom:2px solid var(--border); }
.cal-header-cell-time { border-right:1px solid var(--border); }
.cal-header-cell { border-right:1px solid var(--border); color:var(--text); cursor:pointer; }
.cal-header-cell:hover { background:color-mix(in srgb,var(--accent) 6%,transparent); }
.cal-header-cell:last-child { border-right:none; }
.cal-header-today { background:color-mix(in srgb,var(--accent) 8%,transparent); }
.cal-allday-strip { border-bottom:2px solid var(--border); background:color-mix(in srgb,var(--surface-2) 50%,transparent); }
.allday-label { border-right:1px solid var(--border); color:var(--muted); font-size:8px; }
.cal-cell { border-right:1px solid var(--border); cursor:pointer; transition:background .15s; }
.cal-cell:last-child { border-right:none; }
.cal-cell:hover { background:color-mix(in srgb,var(--accent) 4%,transparent); }
.cal-today-col { background:color-mix(in srgb,var(--accent) 3%,transparent); }
.cal-slot-row { border-bottom:1px solid var(--border); }
.cal-slot-row:last-child { border-bottom:none; }
.time-lbl { background:var(--surface-2); border-right:1px solid var(--border); color:var(--muted); }
.cal-chip { transition:all .2s; }
.cal-chip:hover { transform:scale(1.01); }
.cal-chip-timed { transition:all .2s; }
.cal-chip-timed:hover { transform:scale(1.02) translateY(-1px); }

/* MODAL SHEET */
.add-sheet { background:var(--surface); border-top:1px solid var(--border); }
@media(min-width:640px){ .add-sheet { border:1px solid var(--border); box-shadow:0 40px 80px rgba(0,0,0,.6); } }
.modal-title { color:var(--text); }
.type-card { background:var(--surface-2); border-color:var(--border); color:var(--text); position:relative; }
.type-card:hover { background:var(--surface); }
.back-step { background:var(--surface-2); border:1px solid var(--border); color:var(--muted); }
.back-step:hover { color:var(--text); }
.field { display:flex; flex-direction:column; gap:5px; }
.flbl { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.15em; color:var(--muted); }
.finput { padding:10px 14px; border-radius:14px; background:var(--surface-2); border:1px solid var(--border); color:var(--text); font-size:13px; font-weight:700; outline:none; transition:all .2s; }
.finput:focus { border-color:rgba(249,115,22,.45); background:var(--surface); }
.finput::placeholder { color:var(--muted); font-weight:500; }
.confirm-row { background:var(--surface-2); border:1px solid var(--border); color:var(--text); }

/* success */
.success-ring { animation:ring-in .4s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes ring-in { from { transform:scale(0) rotate(-20deg); opacity:0; } to { transform:scale(1) rotate(0); opacity:1; } }

/* TRANSITIONS */
.item-anim-enter-active { transition:all .3s cubic-bezier(.34,1.56,.64,1); }
.item-anim-leave-active { transition:all .18s ease; }
.item-anim-enter-from { opacity:0; transform:translateX(-14px) scale(.97); }
.item-anim-leave-to { opacity:0; transform:translateX(10px) scale(.97); }
.chip-anim-enter-active { transition:all .25s cubic-bezier(.34,1.56,.64,1); }
.chip-anim-leave-active { transition:all .15s ease; }
.chip-anim-enter-from { opacity:0; transform:scale(.85); }
.chip-anim-leave-to { opacity:0; transform:scale(.9); }
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