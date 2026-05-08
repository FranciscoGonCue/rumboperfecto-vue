<template>
  <div class="relative lg:flex w-full overflow-hidden" :class="globeExpanded ? 'h-screen' : 'lg:h-[calc(100vh-80px)]'">

    <!-- GLOBE PANEL -->
    <div
      class="relative transition-all duration-700 ease-in-out overflow-hidden shadow-2xl lg:flex-shrink-0"
      :class="[
        globeExpanded
          ? 'h-screen w-full lg:flex-1 lg:min-w-0 z-[50]'
          : (isMobile ? (mobileGlobeHidden ? 'h-0' : 'h-[35vh]') : (globeCollapsed ? 'lg:h-full lg:w-0' : 'lg:h-full lg:w-[30%]')),
        !globeExpanded ? 'z-10' : '',
      ]"
      :style="(!globeExpanded && ((!isMobile && globeCollapsed) || (isMobile && mobileGlobeHidden))) ? 'pointer-events:none;' : ''"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Globo 3D (se oculta al pasar al mapa cercano) -->
      <canvas
        ref="globeCanvas"
        class="absolute inset-0 block size-full transition-opacity duration-300"
        :class="detailMapMode ? 'opacity-0 pointer-events-none cursor-default' : 'cursor-grab opacity-100'"
      />

      <!-- Mapa Leaflet al acercar mucho el zoom en el globo -->
      <div
        ref="leafletHost"
        class="home-leaflet-host absolute inset-0 z-[200] transition-opacity duration-300"
        :class="detailMapMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
      />

      <Transition name="fade">
        <button
          v-if="detailMapMode"
          type="button"
          class="absolute top-4 right-4 z-[250] flex items-center gap-2 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border transition-all"
          style="background: rgba(10,14,26,0.92); border-color: rgba(249,115,22,0.35);"
          @click="exitDetailMapMode"
        >
          <Globe :size="18" class="text-orange-400" />
          <span class="font-bold text-white uppercase text-[10px] tracking-wider">Globo 3D</span>
        </button>
      </Transition>

      <!-- Deep space background -->
      <div class="absolute inset-0 -z-10" style="background: radial-gradient(ellipse at center, #0a0e1a 0%, #000308 100%);" />

      <!-- Mobile overlay text -->
      <Transition name="fade">
        <div
          v-if="!globeExpanded"
          class="lg:hidden absolute inset-0 flex flex-col justify-end p-8 z-20 pointer-events-none"
          style="background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%);"
        >
          <h2 class="text-white text-3xl font-black uppercase tracking-tighter leading-none" style="font-family: 'Syne', sans-serif;">
            Explora el <br />Mundo
          </h2>
          <div class="mt-4 flex items-center space-x-2 text-white/80">
            <div class="w-1 h-6 bg-white/60 rounded-full animate-bounce" />
            <span class="text-xs font-bold uppercase tracking-wider">Desliza hacia arriba</span>
          </div>
        </div>
      </Transition>

      <!-- Desktop card: "Tu próxima aventura" -->
      <Transition name="fade">
        <div
          v-if="!globeExpanded && !isMobile"
          class="absolute top-5 left-5 right-5 pointer-events-auto z-[100]"
        >
          <div class="backdrop-blur-md p-5 rounded-2xl shadow-xl flex items-center space-x-4"
               style="background: rgba(10,14,26,0.88); border: 1px solid rgba(249,115,22,0.25);">
            <div class="bg-rp-accent p-3 rounded-xl text-white shadow-lg shadow-orange-900/40">
              <MapPin :size="22" />
            </div>
            <div>
              <h3 class="font-black text-white uppercase text-sm tracking-tight">Tu próxima aventura</h3>
              <p class="text-xs font-bold text-white/50 uppercase tracking-widest">Acerca un poco con la rueda para pasar al mapa detallado</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Collapse/Expand button (desktop) -->
      <Transition name="fade">
        <button
          v-if="!globeExpanded && !isMobile"
          @click.stop="toggleGlobeCollapsed"
          class="absolute top-5 -right-3 z-[1000] hidden lg:flex items-center justify-center w-10 h-10 rounded-2xl backdrop-blur-md shadow-xl transition-all"
          style="background: rgba(10,14,26,0.92); border: 1px solid rgba(255,255,255,0.1);"
        >
          <ChevronRight v-if="globeCollapsed" :size="18" class="text-white" />
          <ChevronLeft v-else :size="18" class="text-white" />
        </button>
      </Transition>

      <!-- Salir modo globo expandido (visible encima del mapa → etiqueta reconocible) -->
      <Transition name="fade">
        <button
          v-if="globeExpanded && !detailMapMode && !isMobile"
          type="button"
          @click="exitGlobeMode"
          class="absolute top-4 left-4 z-[1000] hidden lg:flex items-center gap-2.5 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border transition-all hover:brightness-110"
          style="background: rgba(10,14,26,0.94); border-color: rgba(249,115,22,0.45);"
        >
          <ChevronLeft :size="20" class="text-orange-400 shrink-0" />
          <div class="text-left leading-tight">
            <span class="block font-black text-white uppercase text-[11px] tracking-wider">Ocultar globo</span>
            <span class="block font-bold text-white/55 text-[9px] tracking-wide mt-0.5 uppercase">Ir al inicio</span>
          </div>
        </button>
      </Transition>

      <!-- Móvil: mismo control más compacto -->
      <Transition name="fade">
        <button
          v-if="globeExpanded && !detailMapMode && isMobile"
          type="button"
          @click="exitGlobeMode"
          class="absolute top-3 left-3 z-[1000] flex items-center gap-2 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border lg:hidden max-w-[min(92vw,280px)]"
          style="background: rgba(10,14,26,0.94); border-color: rgba(249,115,22,0.45);"
        >
          <ChevronLeft :size="18" class="text-orange-400 shrink-0" />
          <span class="font-black text-white uppercase text-[10px] tracking-wide truncate">Ocultar globo</span>
        </button>
      </Transition>

      <!-- Espejo de «Expandir globo»: pill inferior para encontrar la acción fácil -->
      <Transition name="fade">
        <button
          v-if="globeExpanded && !detailMapMode && !isMobile"
          type="button"
          @click="exitGlobeMode"
          class="absolute bottom-5 left-1/2 z-[1000] hidden lg:flex items-center gap-2 -translate-x-1/2 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border transition-all hover:brightness-105"
          style="background: rgba(249,115,22,0.22); border: 1px solid rgba(249,115,22,0.45);"
        >
          <Globe :size="16" class="text-orange-300" />
          <span class="font-black text-orange-50 text-xs tracking-wider uppercase">Ocultar globo</span>
        </button>
      </Transition>

      <!-- Exit globe mode (solo si falta hueco lateral; mismo handler) -->
      <Transition name="fade">
        <button
          v-if="!globeExpanded && !isMobile"
          @click="expandGlobe"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center space-x-2 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl transition-all"
          style="background: rgba(249,115,22,0.18); border: 1px solid rgba(249,115,22,0.35);"
        >
          <Globe :size="15" class="text-orange-400" />
          <span class="font-bold text-orange-300 text-xs tracking-wider uppercase">Expandir globo</span>
        </button>
      </Transition>

      <!-- Service popup floating card -->
      <Transition name="pop">
        <div
          v-if="hoveredMarker"
          class="absolute z-[500] pointer-events-none"
          :style="{ left: hoveredMarker.sx + 'px', top: hoveredMarker.sy + 'px', transform: 'translate(-50%, -110%)' }"
        >
          <div class="backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden min-w-[180px] max-w-[228px]"
               style="background: rgba(10,14,26,0.95); border: 1px solid rgba(249,115,22,0.3);">
            <div class="relative aspect-[5/3] w-full bg-black/30">
              <img
                v-if="hoveredMarker.img"
                :src="hoveredMarker.img"
                :alt="hoveredMarker.title"
                class="w-full h-full object-cover"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
                :style="`background: linear-gradient(145deg, ${leafletPinColorForKind(hoveredMarker.kind)}44, rgba(0,0,0,0.35));`"
              >
                <MapPin class="text-white/35" :size="28" />
              </div>
              <div class="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg backdrop-blur-md"
                   style="background: rgba(10,14,26,0.82); border: 1px solid rgba(255,255,255,0.12);">
                <div
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  :style="{ background: leafletPinColorForKind(hoveredMarker.kind) }"
                />
                <span
                  class="text-[9px] font-black uppercase tracking-widest leading-none"
                  :style="{ color: leafletPinColorForKind(hoveredMarker.kind) }"
                >{{ feedKindLabel(hoveredMarker.kind) }}</span>
              </div>
            </div>
            <div class="p-3.5 pt-3">
              <p class="text-white font-black text-sm leading-tight line-clamp-2">{{ hoveredMarker.title }}</p>
              <p class="text-white/50 text-xs mt-1 line-clamp-1">{{ hoveredMarker.city }}, {{ hoveredMarker.country }}</p>
              <p class="font-black text-base mt-2" :style="{ color: leafletPinColorForKind(hoveredMarker.kind) }">{{ hoveredMarker.price }}</p>
            </div>
          </div>
          <!-- Arrow -->
          <div class="mx-auto w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent" style="border-top-color: rgba(249,115,22,0.3);" />
        </div>
      </Transition>
    </div>

    <!-- RIGHT PANEL: FEED -->
    <div
      v-if="!globeExpanded"
      class="w-full lg:h-full overflow-y-auto lg:rounded-l-[50px] relative z-20 shadow-[-20px_0_60px_rgba(0,0,0,0.4)]"
      :class="(!isMobile && globeCollapsed) ? 'lg:w-full' : 'lg:w-[70%]'"
      :style="store.isDark ? 'background: var(--rp-bg);' : 'background: #ffffff;'"
    >
      <div class="pb-32 lg:pb-12 pt-6 lg:pt-12 px-6 lg:px-10">

        <!-- Search bar -->
        <div class="relative mb-6 -mt-12 lg:mt-0 w-full">
          <div class="flex flex-col lg:flex-row lg:items-center rounded-2xl px-4 py-3 lg:px-5 lg:py-4 transition-all gap-3 lg:gap-0"
               :style="store.isDark
                 ? 'background: var(--rp-surface); border: 1px solid var(--rp-border); box-shadow: 0 8px 32px rgba(0,0,0,0.4);'
                 : 'background: white; box-shadow: 0 15px 30px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;'">
            <div class="flex items-center flex-1 min-w-0 px-3 py-2.5 rounded-xl transition-all"
                 :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
              <Search :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-[10px] font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Destino</span>
                <input v-model="destinationQuery" type="text" placeholder="¿A dónde vamos?"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text); caret-color: var(--rp-accent);' : 'color: #111827;'"
                  :class="store.isDark ? 'placeholder:text-rp-muted' : 'placeholder:text-gray-400'"
                  @keyup.enter="handleSearch" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 lg:gap-0 lg:flex lg:flex-[0.95] lg:items-center lg:mx-3">
              <div class="flex items-center px-3 py-2.5 rounded-xl transition-all" :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
                <Calendar :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-[10px] font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-in</span>
                  <input v-model="checkIn" type="date" class="w-full outline-none text-sm font-bold bg-transparent"
                    :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'" />
                </div>
              </div>
              <div class="flex items-center px-3 py-2.5 rounded-xl transition-all" :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
                <Calendar :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-[10px] font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-out</span>
                  <input v-model="checkOut" type="date" class="w-full outline-none text-sm font-bold bg-transparent"
                    :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'" />
                </div>
              </div>
            </div>
            <div class="flex items-center px-3 py-2.5 rounded-xl transition-all lg:flex-[0.55]" :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
              <Users :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-[10px] font-black uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Huéspedes</span>
                <input v-model.number="guests" type="number" min="1" max="20"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'" />
              </div>
            </div>
            <button class="hidden lg:flex text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ml-0 lg:ml-3 cursor-pointer transition-colors"
              style="background: var(--rp-accent);" @click="handleSearch">
              Buscar y planificar
            </button>
          </div>
        </div>

        <!-- Categories -->
        <div class="flex flex-wrap gap-2.5 mb-8">
          <button
            v-for="(cat, idx) in categories" :key="idx"
            class="flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all border"
            :class="store.isDark
              ? selectedCategory === cat.label
                ? 'border-rp-accent/40 bg-orange-950/20'
                : 'border-rp-border bg-rp-surface hover:border-rp-accent/30'
              : selectedCategory === cat.label
                ? cat.activeColor + ' border-transparent'
                : cat.color + ' border-transparent hover:border-orange-100'"
            @click="filterByCategory(cat.label)"
          >
            <component :is="cat.icon" :size="18" :class="store.isDark ? 'text-rp-accent' : ''" />
            <span class="text-[11px] font-black uppercase tracking-widest"
                  :class="store.isDark ? 'text-rp-muted' : 'text-gray-800'">{{ cat.label }}</span>
          </button>
          <button
            v-if="!isMobile"
            class="ml-auto hidden lg:flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all border"
            :class="store.isDark
              ? 'border-rp-border bg-rp-surface hover:border-rp-accent/30'
              : 'border-transparent bg-gray-50 hover:bg-orange-50'"
            @click="toggleGlobeCollapsed"
          >
            <Globe :size="18" class="text-rp-accent" />
            <span class="text-[11px] font-black uppercase tracking-widest"
                  :class="store.isDark ? 'text-rp-muted' : 'text-gray-800'">
              {{ globeCollapsed ? 'Ver globo' : 'Ocultar globo' }}
            </span>
          </button>
        </div>

        <!-- Feed header -->
        <div class="space-y-7">
          <div class="flex items-end justify-between">
            <div>
              <h3 class="text-3xl font-black uppercase tracking-tighter leading-none"
                  :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                  style="font-family: 'Syne', sans-serif;">
                Ofertas <br />Destacadas
              </h3>
              <div class="h-1 w-10 bg-rp-accent rounded-full mt-3" />
            </div>
            <button class="text-xs font-black text-rp-accent uppercase tracking-widest border-b border-rp-accent/30 pb-1">
              Ver todos
            </button>
          </div>

          <!-- Skeleton -->
          <div v-if="isLoadingServicios" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="n in 6" :key="n" class="rounded-[32px] overflow-hidden animate-pulse"
                 :style="store.isDark ? 'background: var(--rp-surface); border: 1px solid var(--rp-border);' : 'background: #f8fafc;'">
              <div class="h-56" :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-200'" />
              <div class="p-6 space-y-3">
                <div class="h-4 rounded-full w-3/4" :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-200'" />
                <div class="h-3 rounded-full w-1/2" :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-200'" />
              </div>
            </div>
          </div>

          <!-- Service cards grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="relative rounded-[32px] overflow-hidden group cursor-pointer hover:-translate-y-1.5 transition-transform duration-300"
              :style="store.isDark
                ? 'background: var(--rp-surface); border: 1px solid var(--rp-border); box-shadow: 0 8px 32px rgba(0,0,0,0.4);'
                : 'background: white; border: 1px solid #f8fafc; box-shadow: 0 8px 24px rgba(0,0,0,0.06);'"
              @click="openItemDetail(item)"
              @mouseenter="flyToService(item)"
            >
              <div class="relative h-56 overflow-hidden">
                <img v-if="item.img" :src="item.img" :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  @error="($event.target as HTMLImageElement).style.display='none'" />
                <div v-if="!item.img" class="w-full h-full flex flex-col items-center justify-center gap-3"
                  :style="`background: linear-gradient(135deg, ${feedKindColor(item.kind)}22, ${feedKindColor(item.kind)}44)`">
                  <component :is="feedKindIcon(item.kind)" :size="44" :style="`color:${feedKindColor(item.kind)}`" class="opacity-60" />
                  <span class="text-xs font-black uppercase tracking-widest opacity-40">{{ feedKindLabel(item.kind) }}</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                <div class="absolute top-4 left-4 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md"
                     :style="store.isDark ? 'background: rgba(17,17,24,0.85); border: 1px solid rgba(255,255,255,0.1);' : 'background: rgba(255,255,255,0.9);'">
                  <Star :size="11" class="fill-orange-500 text-orange-500" />
                  <span class="text-[10px] font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ item.rating }}</span>
                </div>
              </div>
              <div class="p-6">
                <h4 class="text-base font-black uppercase tracking-tight leading-tight mb-1"
                    :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ item.title }}</h4>
                <div class="flex items-center gap-2 mt-2">
                  <MapPin :size="14" class="text-rp-accent flex-shrink-0" />
                  <span class="text-xs font-bold truncate" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                    {{ item.city }}, {{ item.country }}
                  </span>
                </div>
                <div class="flex justify-between items-center mt-5">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Desde</span>
                    <span class="text-rp-accent font-black text-xl tracking-tighter">{{ item.price }}</span>
                  </div>
                  <button
                    class="p-3.5 rounded-xl transition-all shadow-sm"
                    :class="store.isDark
                      ? 'bg-rp-surface-2 text-rp-muted group-hover:bg-rp-accent group-hover:text-white'
                      : 'bg-gray-50 group-hover:bg-orange-500 group-hover:text-white'"
                    @click.stop="openItemDetail(item)"
                  >
                    <Compass :size="22" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAP SIDEBAR: mini inicio cuando el globo está expandido -->
    <div
      v-else
      class="relative z-20 flex flex-col min-h-0 lg:flex-shrink-0 border-l shadow-[-12px_0_32px_rgba(0,0,0,0.06)]"
      :class="isMobile ? 'hidden' : 'lg:flex lg:w-[min(340px,32vw)] lg:max-w-[380px] lg:h-full'"
      :style="store.isDark
        ? 'background: var(--rp-surface); border-color: var(--rp-border);'
        : 'background: #fafbfc; border-color: rgba(0,0,0,0.06);'"
    >
      <div class="flex flex-col min-h-0 flex-1 p-4 pt-5 lg:p-5 lg:pt-6">
        <!-- Cabecera -->
        <header class="flex-shrink-0 mb-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-rp-accent mb-1">Inicio rápido</p>
              <h2 class="text-lg font-black uppercase tracking-tight leading-tight"
                  :class="store.isDark ? 'text-rp-text' : 'text-gray-900'"
                  style="font-family: 'Syne', sans-serif;">
                Explorar globo
              </h2>
            </div>
          </div>
          <div class="h-0.5 w-10 bg-rp-accent rounded-full mt-3" />
          <button
            type="button"
            class="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-opacity hover:opacity-95"
            style="background: var(--rp-accent); box-shadow: 0 8px 24px rgba(249,115,22,0.35);"
            @click="exitGlobeMode"
          >
            <ChevronLeft :size="18" class="shrink-0 opacity-90" />
            Ocultar globo
          </button>
          <p class="text-[9px] font-bold text-center mt-2 uppercase tracking-wide"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
            Vuelve al inicio con la lista completa
          </p>
        </header>

        <!-- Búsqueda y filtros (misma lógica que el panel principal, compactos) -->
        <div class="flex-shrink-0 rounded-2xl p-3 mb-3 transition-shadow"
             :style="store.isDark
               ? 'background: var(--rp-surface-2); border: 1px solid var(--rp-border);'
               : 'background: white; border: 1px solid #ebeef3; box-shadow: 0 4px 20px rgba(0,0,0,0.04);'">
          <label class="block">
            <span class="text-[9px] font-black uppercase tracking-widest"
                  :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Destino</span>
            <div class="mt-1 flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors min-w-0"
                 :class="store.isDark ? 'bg-black/25' : 'bg-gray-50'">
              <Search :size="15" class="text-rp-accent flex-shrink-0" />
              <input
                v-model="destinationQuery"
                type="text"
                placeholder="Ciudad o nombre…"
                class="w-full min-w-0 outline-none text-[13px] font-bold bg-transparent"
                :style="store.isDark ? 'color: var(--rp-text); caret-color: var(--rp-accent);' : 'color: #111827;'"
                :class="store.isDark ? 'placeholder:text-rp-muted' : 'placeholder:text-gray-400'"
                @keyup.enter="handleSearch"
              />
            </div>
          </label>
          <div class="grid grid-cols-2 gap-2 mt-2.5">
            <label class="block min-w-0">
              <span class="text-[9px] font-black uppercase tracking-widest"
                    :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-in</span>
              <div class="mt-0.5 flex items-center rounded-lg px-2 py-1.5 transition-colors min-w-0"
                   :class="store.isDark ? 'bg-black/25' : 'bg-gray-50'">
                <Calendar :size="13" class="text-rp-accent mr-1 flex-shrink-0" />
                <input v-model="checkIn" type="date"
                  class="w-full min-w-0 outline-none text-[11px] font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'" />
              </div>
            </label>
            <label class="block min-w-0">
              <span class="text-[9px] font-black uppercase tracking-widest"
                    :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-out</span>
              <div class="mt-0.5 flex items-center rounded-lg px-2 py-1.5 transition-colors min-w-0"
                   :class="store.isDark ? 'bg-black/25' : 'bg-gray-50'">
                <Calendar :size="13" class="text-rp-accent mr-1 flex-shrink-0" />
                <input v-model="checkOut" type="date"
                  class="w-full min-w-0 outline-none text-[11px] font-bold bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'" />
              </div>
            </label>
          </div>
          <div class="flex items-center gap-2 mt-2.5">
            <div class="flex-1 flex items-center rounded-xl px-2.5 py-2 transition-colors min-w-0"
                 :class="store.isDark ? 'bg-black/25' : 'bg-gray-50'">
              <Users :size="14" class="text-rp-accent mr-1.5 flex-shrink-0" />
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5"
                      :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Huéspedes</span>
                <input v-model.number="guests" type="number" min="1" max="20"
                  class="w-full outline-none text-[13px] font-black bg-transparent"
                  :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'" />
              </div>
            </div>
            <button
              type="button"
              class="rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shrink-0 transition-opacity hover:opacity-90"
              style="background: var(--rp-accent);"
              @click="handleSearch"
            >
              Buscar
            </button>
          </div>
        </div>

        <!-- Categorías -->
        <div class="flex-shrink-0 mb-3">
          <p class="text-[9px] font-black uppercase tracking-widest mb-2"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Filtros</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="(cat, idx) in categories"
              :key="'globe-cat-'+idx"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition-all"
              :class="store.isDark
                ? selectedCategory === cat.label
                  ? 'border-rp-accent/50 bg-orange-950/25 text-rp-accent'
                  : 'border-rp-border bg-rp-surface text-rp-muted hover:border-rp-accent/35'
                : selectedCategory === cat.label
                  ? cat.activeColor + ' border-transparent'
                  : cat.color + ' border-transparent text-gray-800 hover:border-orange-100'"
              @click="filterByCategory(cat.label)"
            >
              <component :is="cat.icon" :size="14" />
              <span class="text-[9px] font-black uppercase tracking-wider leading-none">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Lugares -->
        <div class="flex items-end justify-between flex-shrink-0 gap-2 mb-2">
          <h3 class="text-sm font-black uppercase tracking-tight"
              :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
              style="font-family: 'Syne', sans-serif;">
            Lugares
          </h3>
          <span class="text-[10px] font-bold tabular-nums"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
            {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'resultado' : 'resultados' }}
          </span>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-2.5 globe-explore-scroll">
          <template v-if="isLoadingServicios">
            <div v-for="n in 5" :key="'globe-sk-'+n" class="rounded-2xl overflow-hidden animate-pulse border"
                 :class="store.isDark ? 'border-rp-border bg-rp-surface-2' : 'border-transparent bg-gray-100'">
              <div class="flex gap-3 p-3">
                <div class="w-[72px] h-[72px] rounded-xl shrink-0" :class="store.isDark ? 'bg-black/40' : 'bg-gray-200'" />
                <div class="flex-1 space-y-2 py-1">
                  <div class="h-3 rounded-full w-full" :class="store.isDark ? 'bg-black/35' : 'bg-gray-200'" />
                  <div class="h-2.5 rounded-full w-2/3" :class="store.isDark ? 'bg-black/25' : 'bg-gray-200'" />
                  <div class="h-3 rounded-full w-1/4" :class="store.isDark ? 'bg-black/30' : 'bg-gray-200'" />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <article
              v-for="item in filteredItems"
              :key="'globe-item-'+item.id"
              class="rounded-2xl overflow-hidden cursor-pointer transition-all border group"
              :class="store.isDark
                ? 'border-rp-border bg-rp-surface-2 hover:border-rp-accent/45 hover:bg-rp-surface'
                : 'border-gray-100 bg-white hover:border-orange-100 hover:shadow-md'"
              @click="flyToService(item); openItemDetail(item)"
              @mouseenter="flyToService(item)"
            >
              <div class="flex gap-3 p-2.5">
                <div class="relative w-[76px] h-[76px] rounded-xl overflow-hidden shrink-0 bg-black/20">
                  <img
                    v-if="item.img"
                    :src="item.img"
                    :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div v-else
                    class="w-full h-full flex items-center justify-center"
                    :style="`background: linear-gradient(145deg, ${feedKindColor(item.kind)}33, ${feedKindColor(item.kind)}55);`">
                    <component :is="feedKindIcon(item.kind)" :size="28" :style="`color:${feedKindColor(item.kind)}`" class="opacity-75" />
                  </div>
                  <div class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wide backdrop-blur-sm"
                       :style="{ background: 'rgba(0,0,0,0.55)', color: feedKindColor(item.kind) }">
                    {{ feedKindLabel(item.kind) }}
                  </div>
                </div>
                <div class="min-w-0 flex-1 flex flex-col justify-center py-0.5">
                  <p class="font-black text-[12px] leading-snug uppercase tracking-tight line-clamp-2 mb-1"
                     :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">{{ item.title }}</p>
                  <div class="flex items-center gap-1 text-[10px] font-bold truncate"
                       :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                    <MapPin :size="11" class="text-rp-accent shrink-0" />
                    <span class="truncate">{{ item.city }}{{ item.country ? ', ' + item.country : '' }}</span>
                  </div>
                  <div class="flex items-center justify-between mt-2 gap-2">
                    <span class="text-rp-accent font-black text-sm tracking-tight">{{ item.price }}</span>
                    <div class="flex items-center gap-0.5 shrink-0">
                      <Star :size="11" class="fill-orange-500 text-orange-500" />
                      <span class="text-[10px] font-black" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">{{ item.rating }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </template>
          <p
            v-if="!isLoadingServicios && filteredItems.length === 0"
            class="text-center text-[11px] font-bold py-8 px-2 rounded-xl border border-dashed"
            :class="store.isDark ? 'text-rp-muted border-rp-border' : 'text-gray-500 border-gray-200'"
          >
            No hay lugares con estos filtros. Prueba otra búsqueda o categoría.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  MapPin, ChevronLeft, ChevronRight, Search, Calendar, Users,
  Star, Compass, Globe, Hotel, Bike, Utensils, Tent, Plane,
} from 'lucide-vue-next'
import L from 'leaflet'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useAppStore } from '@/stores/app'
import { serviciosApi, detectServicioView, type Servicio } from '@/services/api'

const store = useAppStore()

// ── Feed items (globo + lista) ────────────────────────────────────────────
type FeedItem = {
  id: string
  title: string
  kind: string
  city: string
  country: string
  lat: number
  lng: number
  price: string
  rating: number
  img: string | null
}

// ── State ──────────────────────────────────────────────────────────────────
const globeCanvas = ref<HTMLCanvasElement | null>(null)
const globeExpanded = ref(false)
const globeCollapsed = ref(false)
const isMobile = ref(false)
const mobileGlobeHidden = ref(false)
const hoveredMarker = ref<any>(null)
const isLoadingServicios = ref(false)
const selectedCategory = ref('Todos')
const destinationQuery = ref('')
const checkIn = ref('')
const checkOut = ref('')
const guests = ref(2)

// Touch swipe
let touchStartY = 0

// ── THREE.js refs ──────────────────────────────────────────────────────────
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let globe: THREE.Mesh | null = null
let atmosphere: THREE.Mesh | null = null
let markersGroup: THREE.Group | null = null
let clouds: THREE.Mesh | null = null
let controls: InstanceType<typeof OrbitControls> | null = null
let animFrameId: number | null = null
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const _tmpHoverPos = new THREE.Vector3()

let flyTweenRaf: number | null = null
const feedItems = ref<FeedItem[]>([])
const detailMapMode = ref(false)
const leafletHost = ref<HTMLElement | null>(null)
let leafletMap: L.Map | null = null
let leafletMarkers: L.Marker[] = []
/** Ítem con hover activo en el mapa 2D (para reposicionar la mini tarjeta al pan/zoom). */
let leafletHoverItemCache: FeedItem | null = null
let globeResumeCamera: { dir: THREE.Vector3, dist: number } | null = null

/** Por debajo de esta distancia órbita → mapa 2D (un poco por encima del mínimo del control). */
/** Distancia cámara–centro menor o igual que esto ⇒ mapa 2D (valor mayor = antes, sin tanto zoom acercando). */
const GLOBE_TO_MAP_DISTANCE = 2.35
/** Al alejar el mapa hasta este zoom (o menos), volvemos al globo. */
/** Alejar así con el zoom del mapa → volver al globo (debe estar por debajo del zoom inicial del mapa). */
const LEAFLET_EXIT_ZOOM = 3

const categories = [
  { label: 'Todos', icon: Globe, color: 'bg-gray-100', activeColor: 'bg-orange-100 text-orange-700' },
  { label: 'Alojamientos', icon: Hotel, color: 'bg-blue-50', activeColor: 'bg-blue-100 text-blue-700' },
  { label: 'Experiencias', icon: Bike, color: 'bg-purple-50', activeColor: 'bg-purple-100 text-purple-700' },
  { label: 'Restaurantes', icon: Utensils, color: 'bg-green-50', activeColor: 'bg-green-100 text-green-700' },
]

const filteredItems = computed(() => {
  let items = feedItems.value
  const q = destinationQuery.value.trim().toLowerCase()
  if (q) {
    items = items.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q),
    )
  }
  if (selectedCategory.value === 'Todos') return items
  const map: Record<string, string> = {
    Alojamientos: 'alojamiento',
    Experiencias: 'experiencia',
    Restaurantes: 'restaurante',
  }
  const k = map[selectedCategory.value]
  return k ? items.filter((s) => s.kind === k) : items
})

function kindForFeed(v: ReturnType<typeof detectServicioView>): string {
  if (v === 'actividad') return 'experiencia'
  if (v === 'servicio') return 'experiencia'
  return v
}

function priceLabel(s: Servicio): string {
  const cur = s.moneda?.trim() || '€'
  if (s.precio_base == null) return `${cur} —`
  const n = Number(s.precio_base)
  if (Number.isNaN(n)) return `${cur} —`
  return `${cur}${n.toFixed(n % 1 === 0 ? 0 : 2)}`
}

function servicioToFeedItem(s: Servicio): FeedItem {
  const lat = s.ubicacion_lat ?? 0
  const lng = s.ubicacion_lon ?? 0
  return {
    id: String(s.id_servicio),
    title: s.nombre ?? 'Servicio',
    kind: kindForFeed(detectServicioView(s)),
    city: s.ciudad ?? '',
    country: s.pais ?? '',
    lat,
    lng,
    price: priceLabel(s),
    rating: s.valoracion != null ? Number(s.valoracion) : 4.5,
    img: s.imagen_url,
  }
}

async function loadServicios(): Promise<void> {
  isLoadingServicios.value = true
  try {
    const list = await serviciosApi.getAll()
    feedItems.value = list
      .filter((s) => s.ubicacion_lat != null && s.ubicacion_lon != null)
      .map(servicioToFeedItem)
  } catch {
    feedItems.value = []
  } finally {
    isLoadingServicios.value = false
  }
}

watch(filteredItems, () => {
  addServiceMarkers()
  refreshLeafletMarkers()
}, { deep: true })

// ── Helpers ────────────────────────────────────────────────────────────────
function feedKindColor(kind: string) {
  const m: Record<string, string> = { alojamiento: '#3b82f6', experiencia: '#8b5cf6', restaurante: '#22c55e', transporte: '#f59e0b' }
  return m[kind] || '#f97316'
}
function feedKindIcon(kind: string) {
  const m: Record<string, any> = { alojamiento: Hotel, experiencia: Bike, restaurante: Utensils, transporte: Plane }
  return m[kind] || Tent
}
function feedKindLabel(kind: string) {
  const m: Record<string, string> = { alojamiento: 'Alojamiento', experiencia: 'Experiencia', restaurante: 'Restaurante', transporte: 'Transporte' }
  return m[kind] || kind
}

// ── THREE.js Globe Setup ───────────────────────────────────────────────────
const TEX_BASE = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r125/examples/textures/planets/'
/** Segmentos meridiano/paralelo (~48² ≈ menos de la mitad de triángulos que 96²). */
const GLOBE_SPHERE_SEG = 48
const CLOUD_SPHERE_SEG = 40

function rendererPixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, isMobile.value ? 1 : 1.5)
}


function createProceduralEarthTexture(): THREE.Texture {
  const earthCanvas = document.createElement('canvas')
  earthCanvas.width = 2048
  earthCanvas.height = 1024
  const ctx = earthCanvas.getContext('2d')!
  drawEarthTexture(ctx, earthCanvas.width, earthCanvas.height)
  return new THREE.CanvasTexture(earthCanvas)
}

function loadTex(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject)
  })
}

async function initGlobe() {
  const canvas = globeCanvas.value
  if (!canvas) return

  await nextTick()
  const dims0 = globePanelDims()
  const w = dims0?.w ?? 400
  const h = dims0?.h ?? 400

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile.value,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(w, h)
  renderer.setPixelRatio(rendererPixelRatio())
  renderer.setClearColor(0x000000, 0)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(0, 0.15, 2.85)

  const starsGeo = new THREE.BufferGeometry()
  const starCount = 1400
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 120
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.85 })
  scene.add(new THREE.Points(starsGeo, starsMat))

  let earthTex: THREE.Texture
  try {
    earthTex = await loadTex(`${TEX_BASE}earth_atmos_2048.jpg`)
    earthTex.generateMipmaps = true
  } catch {
    earthTex = createProceduralEarthTexture()
  }

  /** Lambert + solo diffuse: bastante más barato que Phong + normal + spec por píxel. */
  const globeGeo = new THREE.SphereGeometry(1, GLOBE_SPHERE_SEG, GLOBE_SPHERE_SEG)
  const globeMat = new THREE.MeshLambertMaterial({
    map: earthTex,
    emissive: new THREE.Color(0x0a1628),
    emissiveIntensity: 0.15,
  })
  globe = new THREE.Mesh(globeGeo, globeMat)
  scene.add(globe)

  try {
    const cloudT = await loadTex(`${TEX_BASE}earth_clouds_1024.png`)
    const cloudGeo = new THREE.SphereGeometry(1.018, CLOUD_SPHERE_SEG, CLOUD_SPHERE_SEG)
    const cloudMat = new THREE.MeshLambertMaterial({
      map: cloudT,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    clouds = new THREE.Mesh(cloudGeo, cloudMat)
    scene.add(clouds)
  } catch {
    clouds = null
  }

  const atmGeo = new THREE.SphereGeometry(1.055, GLOBE_SPHERE_SEG - 12, GLOBE_SPHERE_SEG - 12)
  const atmMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.72 - dot(vNormal, vec3(0,0,1.0)), 3.0);
        gl_FragColor = vec4(0.15, 0.5, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
  })
  atmosphere = new THREE.Mesh(atmGeo, atmMat)
  scene.add(atmosphere)

  const ambient = new THREE.AmbientLight(0x223355, 0.65)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xffffff, 1.55)
  sun.position.set(5, 2.5, 5)
  scene.add(sun)

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.055
  controls.rotateSpeed = 0.65
  controls.minDistance = 1.38
  controls.maxDistance = 4.8
  controls.zoomSpeed = 0.85
  controls.autoRotate = false
  controls.enablePan = false

  controls.addEventListener('change', onOrbitNearThreshold)

  markersGroup = new THREE.Group()
  scene.add(markersGroup)
  addServiceMarkers()

  canvas.addEventListener('pointermove', onPointerMoveGlobe)
  canvas.addEventListener('click', onGlobeClick)

  resizeRenderer()
  animate()
}

function drawEarthTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Ocean base
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, '#0b2d5e')
  gradient.addColorStop(0.5, '#0d3d7a')
  gradient.addColorStop(1, '#0a2952')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // Ocean shimmer lines
  ctx.strokeStyle = 'rgba(20,80,160,0.25)'
  ctx.lineWidth = 1
  for (let i = 0; i < 40; i++) {
    ctx.beginPath()
    ctx.moveTo(0, (i / 40) * h)
    ctx.lineTo(w, (i / 40) * h + Math.random() * 20 - 10)
    ctx.stroke()
  }

  // Simplified continental shapes (very approximate)
  ctx.fillStyle = '#1a5c2e'
  const continents = [
    // Europe + Africa
    [[0.35, 0.25], [0.45, 0.2], [0.48, 0.35], [0.45, 0.55], [0.42, 0.72], [0.38, 0.85], [0.33, 0.85], [0.30, 0.72], [0.32, 0.55], [0.30, 0.35]],
    // Americas
    [[0.15, 0.15], [0.25, 0.12], [0.28, 0.3], [0.26, 0.5], [0.22, 0.65], [0.18, 0.85], [0.14, 0.88], [0.10, 0.75], [0.08, 0.5], [0.10, 0.25]],
    // Asia
    [[0.5, 0.15], [0.75, 0.12], [0.88, 0.2], [0.9, 0.38], [0.82, 0.5], [0.7, 0.55], [0.55, 0.5], [0.48, 0.38]],
    // Australia
    [[0.72, 0.65], [0.82, 0.62], [0.85, 0.72], [0.82, 0.82], [0.72, 0.83], [0.68, 0.75]],
  ]
  continents.forEach(pts => {
    ctx.beginPath()
    ctx.moveTo(pts[0][0] * w, pts[0][1] * h)
    pts.slice(1).forEach(p => ctx.lineTo(p[0] * w, p[1] * h))
    ctx.closePath()
    ctx.fill()
    // Coastline glow
    ctx.strokeStyle = 'rgba(40,200,120,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  // Latitude/longitude grid
  ctx.strokeStyle = 'rgba(30,100,180,0.15)'
  ctx.lineWidth = 0.5
  for (let lat = 0; lat <= 180; lat += 30) {
    ctx.beginPath()
    ctx.moveTo(0, (lat / 180) * h)
    ctx.lineTo(w, (lat / 180) * h)
    ctx.stroke()
  }
  for (let lng = 0; lng <= 360; lng += 30) {
    ctx.beginPath()
    ctx.moveTo((lng / 360) * w, 0)
    ctx.lineTo((lng / 360) * w, h)
    ctx.stroke()
  }

  // City lights overlay (night side dots)
  const cityPositions = [
    [0.372, 0.28], [0.41, 0.3], [0.39, 0.31], [0.44, 0.26], // Europe
    [0.56, 0.28], [0.60, 0.32], [0.65, 0.30], [0.72, 0.32], [0.78, 0.32], // Asia
    [0.18, 0.32], [0.22, 0.33], [0.19, 0.45], // Americas
  ]
  cityPositions.forEach(([lx, ly]) => {
    const grd = ctx.createRadialGradient(lx * w, ly * h, 0, lx * w, ly * h, 6)
    grd.addColorStop(0, 'rgba(255,220,120,0.8)')
    grd.addColorStop(1, 'rgba(255,220,120,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(lx * w, ly * h, 6, 0, Math.PI * 2)
    ctx.fill()
  })
}

function latLngToVector3(lat: number, lng: number, radius = 1.02): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/** Centro del disco del globo a pantalla ↔ lat/lng (cámara mirando al origen). */
function vector3DirToLatLng(v: THREE.Vector3): { lat: number, lng: number } {
  const u = v.clone().normalize()
  const phi = Math.acos(THREE.MathUtils.clamp(u.y, -1, 1))
  const lat = 90 - THREE.MathUtils.radToDeg(phi)
  const theta = Math.atan2(u.z, -u.x)
  let lng = THREE.MathUtils.radToDeg(theta) - 180
  if (lng > 180) lng -= 360
  if (lng < -180) lng += 360
  return { lat, lng }
}

/**
 * Zoom Leaflet inicial según cómo estabas en el globo al cambiar.
 * Umbrales alineados con GLOBE_TO_MAP_DISTANCE (más cerca del min ⇒ zoom algo mayor).
 */
function leafletZoomFromGlobeDistance(d: number): number {
  const dMin = 1.38
  const dMax = GLOBE_TO_MAP_DISTANCE + 0.12
  const t = THREE.MathUtils.clamp((d - dMin) / Math.max(dMax - dMin, 0.01), 0, 1)
  return Math.round(THREE.MathUtils.lerp(7, 4, t))
}

/** Color de pin Leaflet igual que PlanDetail.vue (servicio tipo). */
function leafletPinColorForKind(kind: string): string {
  switch (kind) {
    case 'alojamiento':
      return '#3b82f6'
    case 'experiencia':
      return '#10b981'
    case 'restaurante':
      return '#ef4444'
    case 'transporte':
      return '#6366f1'
    default:
      return '#f97316'
  }
}

/** Pin 2D compacto (antes 32px). */
const LEAFLET_PIN_PX = 22

function buildLeafletPin(color: string) {
  const s = LEAFLET_PIN_PX
  const half = Math.round(s / 2)
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 2px 6px ${color}55;
      border:1.5px solid #fff;
    "></div>`,
    iconSize: [s, s],
    iconAnchor: [half, s],
    popupAnchor: [0, -(s + 6)],
  })
}

function onLeafletZoomEnd() {
  if (!detailMapMode.value || !leafletMap) return
  if (leafletMap.getZoom() <= LEAFLET_EXIT_ZOOM) exitDetailMapMode()
}

function leafletMarkerMiniCardPx(lat: number, lng: number): { sx: number, sy: number } | null {
  if (!leafletMap || !leafletHost.value) return null
  const pt = leafletMap.latLngToContainerPoint(L.latLng(lat, lng))
  return { sx: pt.x, sy: pt.y }
}

/** Reposa la tarjeta flotante si el hovering es del mapa Leaflet (pan/zoom). */
function onLeafletMapPanOrZoom() {
  if (!detailMapMode.value || !leafletHoverItemCache || !leafletMap) return
  const item = leafletHoverItemCache
  const p = leafletMarkerMiniCardPx(item.lat, item.lng)
  if (!p) return
  hoveredMarker.value = { ...item, sx: p.sx, sy: p.sy }
}

function setLeafletHoveredService(item: FeedItem | null) {
  leafletHoverItemCache = item
  if (!item) {
    hoveredMarker.value = null
    return
  }
  const p = leafletMarkerMiniCardPx(item.lat, item.lng)
  if (!p) return
  hoveredMarker.value = { ...item, sx: p.sx, sy: p.sy }
}

function initLeafletMap() {
  const el = leafletHost.value
  if (!el || leafletMap) return
  leafletMap = L.map(el, { zoomControl: true })

  /**
   * OpenStreetMap: estable; Carto a veces no sirve teselas en este cliente.
   */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(leafletMap)

  leafletMap.on('zoomend', onLeafletZoomEnd)
  leafletMap.on('move', onLeafletMapPanOrZoom)
  leafletMap.on('zoom', onLeafletMapPanOrZoom)
}

function refreshLeafletMarkers() {
  if (!leafletMap) return
  setLeafletHoveredService(null)
  leafletMarkers.forEach((m) => m.remove())
  leafletMarkers = []
  filteredItems.value.forEach((item) => {
    const col = leafletPinColorForKind(item.kind)
    const marker = L.marker([item.lat, item.lng], { icon: buildLeafletPin(col) })
    marker
      .bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;min-width:160px">
          <p style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:${col};margin:0 0 2px">${feedKindLabel(item.kind)}</p>
          <p style="font-size:13px;font-weight:900;text-transform:uppercase;margin:0 0 4px">${item.title}</p>
          <p style="font-size:11px;opacity:.8;margin:0 0 4px">${item.city}, ${item.country}</p>
          <p style="font-size:12px;font-weight:900;color:${col};margin:0">${item.price}</p>
        </div>`,
        { maxWidth: 220 },
      )
      .on('click', () => openItemDetail(item))
      .on('mouseover', () => setLeafletHoveredService(item))
      .on('mouseout', () => {
        if (leafletHoverItemCache?.id === item.id) setLeafletHoveredService(null)
      })
    marker.addTo(leafletMap!)
    leafletMarkers.push(marker)
  })
}

async function enterDetailMapMode() {
  if (!camera || !controls || detailMapMode.value) return
  const d = camera.position.distanceTo(controls.target)
  if (d > GLOBE_TO_MAP_DISTANCE) return

  globeResumeCamera = {
    dir: camera.position.clone().normalize(),
    dist: d,
  }
  detailMapMode.value = true
  leafletHoverItemCache = null
  hoveredMarker.value = null
  controls.autoRotate = false
  controls.enabled = false

  await nextTick()

  if (leafletMap) {
    leafletMarkers.forEach((m) => m.remove())
    leafletMarkers = []
    leafletMap.off('zoomend', onLeafletZoomEnd)
    leafletMap.off('move', onLeafletMapPanOrZoom)
    leafletMap.off('zoom', onLeafletMapPanOrZoom)
    leafletMap.remove()
    leafletMap = null
  }

  initLeafletMap()
  const map2d = leafletMap as L.Map | null
  if (!map2d) return

  const { lat, lng } = vector3DirToLatLng(camera.position)
  const z = leafletZoomFromGlobeDistance(d)
  map2d.setView([lat, lng], z, { animate: false })
  refreshLeafletMarkers()
  const invalidateLeafletSize = () => map2d.invalidateSize()
  map2d.whenReady(invalidateLeafletSize)
  requestAnimationFrame(invalidateLeafletSize)
  window.setTimeout(invalidateLeafletSize, 50)
  window.setTimeout(invalidateLeafletSize, 350)
  resizeRenderer()
}

function exitDetailMapMode() {
  if (!detailMapMode.value) return
  leafletHoverItemCache = null
  hoveredMarker.value = null
  detailMapMode.value = false
  if (camera && controls && globeResumeCamera) {
    const dist = Math.max(2.35, globeResumeCamera.dist * 1.22)
    camera.position.copy(globeResumeCamera.dir.clone().multiplyScalar(dist))
    controls.target.set(0, 0, 0)
    globeResumeCamera = null
  }
  if (controls) {
    controls.enabled = true
    controls.update()
  }
  requestAnimationFrame(() => {
    resizeRenderer()
    leafletMap?.invalidateSize()
  })
}

function onOrbitNearThreshold() {
  if (!camera || !controls || detailMapMode.value) return
  const d = camera.position.distanceTo(controls.target)
  if (d <= GLOBE_TO_MAP_DISTANCE) void enterDetailMapMode()
}

function addServiceMarkers() {
  if (!markersGroup || !scene) return
  markersGroup.clear()

  filteredItems.value.forEach((svc) => {
    const pos = latLngToVector3(svc.lat, svc.lng)
    /** Un único marker (más pequeño que antes para molestar menos en el globo). */
    const pinGeo = new THREE.CylinderGeometry(0, 0.01, 0.052, 6)
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xff7a29 })
    const pin = new THREE.Mesh(pinGeo, pinMat)
    pin.position.copy(pos.clone().multiplyScalar(1.02))
    pin.lookAt(0, 0, 0)
    pin.rotateX(Math.PI / 2)
    pin.userData.isMarkerPick = true
    pin.userData.feedItemOrbit = svc
    markersGroup!.add(pin)
  })
}

// ── Animation loop ─────────────────────────────────────────────────────────
function animate() {
  animFrameId = requestAnimationFrame(animate)
  if (document.visibilityState === 'hidden') return
  if (!renderer || !scene || !camera || !globe) return
  if (detailMapMode.value) return

  if (clouds) clouds.rotation.y += 0.0003

  controls?.update()

  renderer.render(scene, camera)
}

// ── Pointer / click (rotación y zoom: OrbitControls) ────────────────────────
/** Un raycaster/hover como máximo una vez por frame (menos trabajo enmousemove). */
let hoverRafQueued = false
let lastPointerForHover: Pick<PointerEvent, 'clientX' | 'clientY'> | null = null

function onPointerMoveGlobe(e: PointerEvent) {
  lastPointerForHover = { clientX: e.clientX, clientY: e.clientY }
  if (hoverRafQueued) return
  hoverRafQueued = true
  requestAnimationFrame(() => {
    hoverRafQueued = false
    const p = lastPointerForHover
    if (!p || detailMapMode.value) return
    checkHoverAt(p.clientX, p.clientY)
  })
}

function getScreenPos(worldPos: THREE.Vector3): { x: number, y: number } | null {
  if (!camera || !renderer) return null
  const projected = worldPos.clone().project(camera)
  const canvas = globeCanvas.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return {
    x: (projected.x * 0.5 + 0.5) * rect.width,
    y: (-projected.y * 0.5 + 0.5) * rect.height
  }
}

function checkHoverAt(clientX: number, clientY: number) {
  if (detailMapMode.value || !camera || !markersGroup || !globeCanvas.value) return
  const canvas = globeCanvas.value
  const rect = canvas.getBoundingClientRect()
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(markersGroup.children, false)
  if (hits.length > 0 && hits[0].object.userData.isMarkerPick) {
    const item = hits[0].object.userData.feedItemOrbit as FeedItem
    hits[0].object.getWorldPosition(_tmpHoverPos)
    const sp = getScreenPos(_tmpHoverPos)
    if (sp) hoveredMarker.value = { ...item, sx: sp.x, sy: sp.y }
  } else {
    hoveredMarker.value = null
  }
}

function onGlobeClick(e: MouseEvent) {
  if (detailMapMode.value) return
  if (!camera || !markersGroup || !globeCanvas.value) return
  const canvas = globeCanvas.value
  const rect = canvas.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(markersGroup.children, false)
  if (hits.length > 0 && hits[0].object.userData.isMarkerPick) {
    openItemDetail(hits[0].object.userData.feedItemOrbit as FeedItem)
  }
}

// ── Globe navigation ───────────────────────────────────────────────────────
function flyToService(svc: FeedItem) {
  if (svc.lat == null || svc.lng == null) return
  if (detailMapMode.value && leafletMap) {
    leafletMap.flyTo([svc.lat, svc.lng], 14, { duration: 1 })
    return
  }
  if (!camera || !controls) return
  controls.autoRotate = false
  const surface = latLngToVector3(svc.lat, svc.lng, 1).normalize()
  const startPos = camera.position.clone()
  const startTarget = controls.target.clone()
  const dist = 2.12
  const endPos = surface.clone().multiplyScalar(dist)
  const endTarget = new THREE.Vector3(0, 0, 0)
  let t0 = 0
  const duration = 1100
  if (flyTweenRaf != null) cancelAnimationFrame(flyTweenRaf)
  const tick = (now: number) => {
    if (!camera || !controls) return
    if (!t0) t0 = now
    const u = Math.min(1, (now - t0) / duration)
    const e = 1 - (1 - u) ** 3
    camera.position.lerpVectors(startPos, endPos, e)
    controls.target.lerpVectors(startTarget, endTarget, e)
    controls.update()
    if (u < 1) {
      flyTweenRaf = requestAnimationFrame(tick)
    }
  }
  flyTweenRaf = requestAnimationFrame(tick)
}

// Igual que Tailwind duration-700 sobre el panel del globo
const GLOBE_LAYOUT_MS = 720

function scheduleGlobeResize() {
  nextTick(() => {
    resizeRenderer()
    requestAnimationFrame(() => resizeRenderer())
    window.setTimeout(() => resizeRenderer(), GLOBE_LAYOUT_MS)
  })
}

/** Mide el panel contenedor — no el canvas (Three fuerza px en canvas.style). */
function globePanelDims(): { w: number, h: number } | null {
  const canvas = globeCanvas.value
  const panel = canvas?.parentElement
  if (!canvas || !panel) return null
  const w = Math.max(1, Math.round(panel.clientWidth))
  const h = Math.max(1, Math.round(panel.clientHeight))
  return { w, h }
}

function expandGlobe() {
  globeExpanded.value = true
  scheduleGlobeResize()
}
function exitGlobeMode() {
  globeExpanded.value = false
  scheduleGlobeResize()
}
function toggleGlobeCollapsed() {
  globeCollapsed.value = !globeCollapsed.value
  scheduleGlobeResize()
}

function resizeRenderer() {
  if (!renderer || !camera || !globeCanvas.value) return
  const dims = globePanelDims()
  if (!dims) return
  const { w, h } = dims
  renderer.setPixelRatio(rendererPixelRatio())
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  controls?.update()
  leafletMap?.invalidateSize()
  if (leafletHoverItemCache && detailMapMode.value) onLeafletMapPanOrZoom()
}

// ── Mobile swipe ────────────────────────────────────────────────────────────
function handleTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
}
function handleTouchMove() {}
function handleTouchEnd(e: TouchEvent) {
  const dy = touchStartY - e.changedTouches[0].clientY
  if (dy > 60) {
    if (!globeExpanded.value) expandGlobe()
  } else if (dy < -60) {
    if (globeExpanded.value) exitGlobeMode()
    else mobileGlobeHidden.value = true
  }
}

// ── Search / filters ────────────────────────────────────────────────────────
function handleSearch() {}
function filterByCategory(cat: string) {
  selectedCategory.value = cat
}
function openItemDetail(item: FeedItem) {
  void store.openServiceDetail(item.id)
}

// ── Resize observer ─────────────────────────────────────────────────────────
let resizeObs: ResizeObserver | null = null

function checkIsMobile() {
  isMobile.value = window.innerWidth < 1024
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  void loadServicios()
  setTimeout(() => {
    void initGlobe().catch((err) => console.error('[HomeView] initGlobe', err))
    resizeObs = new ResizeObserver(() => resizeRenderer())
    if (globeCanvas.value?.parentElement) {
      resizeObs.observe(globeCanvas.value.parentElement)
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
  if (flyTweenRaf != null) cancelAnimationFrame(flyTweenRaf)
  if (animFrameId) cancelAnimationFrame(animFrameId)
  resizeObs?.disconnect()
  const canvas = globeCanvas.value
  if (canvas) {
    canvas.removeEventListener('pointermove', onPointerMoveGlobe)
    canvas.removeEventListener('click', onGlobeClick)
  }
  controls?.removeEventListener('change', onOrbitNearThreshold)
  if (leafletMap) {
    leafletMap.off('zoomend', onLeafletZoomEnd)
    leafletMap.off('move', onLeafletMapPanOrZoom)
    leafletMap.off('zoom', onLeafletMapPanOrZoom)
    leafletMap.remove()
    leafletMap = null
  }
  leafletMarkers = []
  controls?.dispose()
  controls = null
  renderer?.dispose()
  renderer = null
})
</script>

<style scoped>
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.bg-rp-accent { background-color: var(--rp-accent); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.border-rp-border { border-color: var(--rp-border); }
.border-rp-accent\/40 { border-color: rgba(249,115,22,0.4); }
.border-rp-accent\/30 { border-color: rgba(249,115,22,0.3); }
.hover\:border-rp-accent\/40:hover { border-color: rgba(249,115,22,0.4); }
.hover\:border-rp-accent\/30:hover { border-color: rgba(249,115,22,0.3); }
.placeholder\:text-rp-muted::placeholder { color: var(--rp-muted); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.pop-enter-active { transition: all 0.2s cubic-bezier(.34,1.3,.64,1); }
.pop-leave-active { transition: all 0.15s ease; }
.pop-enter-from { opacity: 0; transform: translateX(-50%) translateY(-100%) scale(0.85); }
.pop-leave-to { opacity: 0; transform: translateX(-50%) translateY(-100%) scale(0.9); }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce { animation: bounce 2s infinite; }

.home-leaflet-host :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}

canvas { display: block; }

.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: var(--rp-surface-2); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.4); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #f97316; }

.globe-explore-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(249,115,22,0.35) transparent;
}
.globe-explore-scroll::-webkit-scrollbar {
  width: 5px;
}
.globe-explore-scroll::-webkit-scrollbar-thumb {
  background: rgba(249,115,22,0.35);
  border-radius: 10px;
}
</style>