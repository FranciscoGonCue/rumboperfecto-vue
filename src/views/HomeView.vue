<template>
  <div class="relative lg:flex w-full overflow-x-visible" :class="mapExpanded ? 'h-screen' : 'lg:h-[calc(100vh-80px)]'">
    <!-- MAP PANEL -->
    <div 
      class="relative transition-all duration-700 ease-in-out overflow-hidden shadow-2xl z-10"
      :class="[
        mapExpanded 
          ? 'h-screen w-full lg:w-[75%]' 
          : (isMobile ? 'h-[25vh]' : (mapCollapsed ? 'lg:h-full lg:w-0' : 'lg:h-full lg:w-[20%]'))
      ]"
      :style="(!mapExpanded && !isMobile && mapCollapsed) ? 'pointer-events:none;' : ''"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Mobile Overlay Text (hide when expanded) -->
      <Transition name="fade">
        <div 
          v-if="!mapExpanded"
          class="lg:hidden absolute inset-0 flex flex-col justify-end p-8 z-20 pointer-events-none"
          style="background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%);"
        >
          <h2 class="text-white text-3xl font-black uppercase tracking-tighter leading-none"
              style="font-family: 'Syne', sans-serif;">
            Explora el <br />Mundo
          </h2>
          <div class="mt-4 flex items-center space-x-2 text-white/80">
            <div class="w-1 h-6 bg-white/60 rounded-full animate-bounce" />
            <span class="text-xs font-bold uppercase tracking-wider">Desliza hacia arriba</span>
          </div>
        </div>
      </Transition>

      <!-- Interactive Leaflet Map -->
      <div id="map" class="h-full w-full" />

      <!-- Collapse / Expand Map (desktop) -->
      <Transition name="fade">
        <button
          v-if="!mapExpanded && !isMobile"
          @click.stop="toggleMapCollapsed"
          class="absolute top-5 -right-3 z-[1000] hidden lg:flex items-center justify-center w-10 h-10 rounded-2xl backdrop-blur-md shadow-xl transition-all"
          :style="store.isDark ? 'background: rgba(17,17,24,0.92); border: 1px solid rgba(255,255,255,0.1);' : 'background: rgba(255,255,255,0.95); border: 1px solid rgba(15,23,42,0.08);'"
        >
          <ChevronRight v-if="mapCollapsed" :size="18" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'" />
          <ChevronLeft v-else :size="18" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'" />
        </button>
      </Transition>

      <!-- Desktop Map UI Elements -->
      <Transition name="fade">
        <div 
          v-if="!mapExpanded"
          class="hidden lg:flex absolute top-10 left-10 right-10 flex-col space-y-4 pointer-events-none z-[1000]"
        >
          <div class="backdrop-blur-md p-5 rounded-2xl shadow-xl flex items-center space-x-4 pointer-events-auto"
               style="background: rgba(17,17,24,0.9); border: 1px solid rgba(249,115,22,0.2);">
            <div class="bg-rp-accent p-3 rounded-xl text-white shadow-lg shadow-orange-900/40">
              <MapPin :size="22" />
            </div>
            <div>
              <h3 class="font-black text-rp-text uppercase text-sm tracking-tight">Tu próxima aventura</h3>
              <p class="text-xs font-bold text-rp-muted uppercase tracking-widest">Encuentra planes en el mapa</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Exit Map Mode Button -->
      <Transition name="fade">
        <button
          v-if="mapExpanded"
          @click="exitMapMode"
          class="absolute top-4 left-6 z-[1000] flex items-center space-x-2 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl transition-all"
          style="background: rgba(17,17,24,0.92); border: 1px solid rgba(255,255,255,0.1);"
        >
          <X :size="18" class="text-rp-text" />
          <span class="font-bold text-rp-text uppercase text-xs tracking-wider">Salir</span>
        </button>
      </Transition>

      <!-- Mobile Menu Toggle (hidden) -->
      <Transition name="fade">
        <button
          v-if="false"
          @click="toggleMobileSidebar"
          class="absolute top-6 right-6 z-[1000] bg-rp-accent text-white p-4 rounded-2xl shadow-2xl hover:bg-orange-500 transition-all"
        >
          <Menu v-if="!showMobileSidebar" :size="24" />
          <X v-else :size="24" />
        </button>
      </Transition>
    </div>

    <!-- RIGHT PANEL: FEED VIEW (default) -->
    <div 
      v-if="!mapExpanded"
      key="feed"
      class="w-full lg:h-full overflow-y-auto lg:rounded-l-[50px] relative z-20 shadow-[-20px_0_60px_rgba(0,0,0,0.4)]"
      :class="(!isMobile && mapCollapsed) ? 'lg:w-full' : 'lg:w-[80%]'"
      :style="store.isDark ? 'background: var(--rp-bg);' : 'background: #ffffff;'"
    >
      <div class="pb-32 lg:pb-12 pt-6 lg:pt-12 px-6 lg:px-10">
        <!-- Search Bar -->
        <div class="relative mb-6 -mt-12 lg:mt-0 w-full">
          <div class="flex flex-col lg:flex-row lg:items-center rounded-2xl px-4 py-3 lg:px-5 lg:py-4 transition-all gap-3 lg:gap-0"
               :style="store.isDark
                 ? 'background: var(--rp-surface); border: 1px solid var(--rp-border); box-shadow: 0 8px 32px rgba(0,0,0,0.4);'
                 : 'background: white; box-shadow: 0 15px 30px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;'">
            <!-- Destino -->
            <div class="flex items-center flex-1 min-w-0 px-3 py-2.5 rounded-xl transition-all"
                 :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
              <Search :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-[10px] font-black uppercase tracking-widest"
                      :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Destino</span>
                <input
                  v-model="destinationQuery"
                  type="text"
                  placeholder="¿A dónde vamos?"
                  class="w-full outline-none text-sm font-bold bg-transparent"
                  :style="store.isDark
                    ? 'color: var(--rp-text); caret-color: var(--rp-accent);'
                    : 'color: #111827;'"
                  :class="store.isDark ? 'placeholder:text-rp-muted' : 'placeholder:text-gray-400'"
                  @keyup.enter="handleSearch"
                />
              </div>
            </div>

            <!-- Fechas -->
            <div class="grid grid-cols-2 gap-2 lg:gap-0 lg:flex lg:flex-[0.95] lg:items-center lg:mx-3">
              <div class="flex items-center px-3 py-2.5 rounded-xl transition-all"
                   :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
                <Calendar :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-[10px] font-black uppercase tracking-widest"
                        :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-in</span>
                  <input
                    v-model="checkIn"
                    type="date"
                    class="w-full outline-none text-sm font-bold bg-transparent"
                    :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                  />
                </div>
              </div>
              <div class="flex items-center px-3 py-2.5 rounded-xl transition-all"
                   :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
                <Calendar :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-[10px] font-black uppercase tracking-widest"
                        :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Check-out</span>
                  <input
                    v-model="checkOut"
                    type="date"
                    class="w-full outline-none text-sm font-bold bg-transparent"
                    :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                  />
                </div>
              </div>
            </div>

            <!-- Huéspedes -->
            <div class="flex items-center px-3 py-2.5 rounded-xl transition-all lg:flex-[0.55]"
                 :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
              <Users :size="18" class="text-rp-accent mr-2 flex-shrink-0" />
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-[10px] font-black uppercase tracking-widest"
                      :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Huéspedes</span>
                <div class="flex items-center justify-between gap-2">
                  <input
                    v-model.number="guests"
                    type="number"
                    min="1"
                    max="20"
                    class="w-full outline-none text-sm font-bold bg-transparent"
                    :style="store.isDark ? 'color: var(--rp-text);' : 'color: #111827;'"
                    @keyup.enter="handleSearch"
                  />
                  <span class="text-[10px] font-black uppercase tracking-widest"
                        :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                    {{ guestsLabel }}
                  </span>
                </div>
              </div>
            </div>

            <button
              class="hidden lg:flex text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ml-0 lg:ml-3 cursor-pointer transition-colors"
              style="background: var(--rp-accent);"
              @click="handleSearch"
            >
              Buscar y planificar
            </button>
          </div>
        </div>

        <!-- Compact Categories (chips) -->
        <div class="flex flex-wrap gap-2.5 mb-8">
          <button
            v-for="(cat, idx) in categories"
            :key="idx"
            class="flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all border"
            :class="store.isDark
              ? selectedCategory === cat.label
                ? 'border-rp-accent/40 bg-orange-950/20 shadow-[0_4px_16px_rgba(249,115,22,0.12)]'
                : 'border-rp-border bg-rp-surface hover:border-rp-accent/30'
              : selectedCategory === cat.label
                ? cat.activeColor + ' border-transparent'
                : cat.color + ' border-transparent hover:border-orange-100 hover:shadow-xl'"
            @click="filterByCategory(cat.label)"
          >
            <component :is="cat.icon" :size="18" :class="store.isDark ? 'text-rp-accent' : ''" />
            <span class="text-[11px] font-black uppercase tracking-widest"
                  :class="store.isDark ? 'text-rp-muted' : 'text-gray-800'">{{ cat.label }}</span>
          </button>

          <!-- Map toggle (desktop) -->
          <button
            v-if="!isMobile"
            class="ml-auto hidden lg:flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all border"
            :class="store.isDark
              ? 'border-rp-border bg-rp-surface hover:border-rp-accent/30'
              : 'border-transparent bg-gray-50 hover:bg-orange-50'"
            @click="toggleMapCollapsed"
          >
            <MapPin :size="18" class="text-rp-accent" />
            <span class="text-[11px] font-black uppercase tracking-widest"
                  :class="store.isDark ? 'text-rp-muted' : 'text-gray-800'">
              {{ mapCollapsed ? 'Ver en el mapa' : 'Ocultar mapa' }}
            </span>
          </button>
        </div>

        <!-- Planner highlight -->
        <div class="mb-10">
          <div class="rounded-[32px] p-6 lg:p-7 border transition-all"
               :style="store.isDark
                 ? 'background: linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(17,17,24,0.9) 55%); border: 1px solid rgba(249,115,22,0.18);'
                 : 'background: linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(255,255,255,1) 55%); border: 1px solid rgba(15,23,42,0.06);'"
          >
            <div class="flex items-start justify-between gap-6">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <div class="bg-rp-accent text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/30">
                    <Compass :size="20" />
                  </div>
                  <h3 class="text-lg lg:text-xl font-black uppercase tracking-tight"
                      :class="store.isDark ? 'text-rp-text' : 'text-gray-900'"
                      style="font-family: 'Syne', sans-serif;">
                    Tus próximos planes
                  </h3>
                </div>

                <p class="text-sm font-medium leading-snug"
                   :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                  Continúa organizando tu itinerario: alojamientos, actividades y rutas en un solo lugar.
                </p>

                <div v-if="nextTrip" class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-[11px] font-black uppercase tracking-widest"
                         :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                      Tu viaje en curso
                    </div>
                    <div class="font-black uppercase tracking-tight text-sm truncate"
                         :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
                      {{ nextTrip.title }}
                    </div>
                    <div class="text-xs font-bold"
                         :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                      {{ formatTripDates(nextTrip.startDate, nextTrip.endDate) }}
                    </div>
                  </div>
                  <button
                    class="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all"
                    style="background: var(--rp-accent);"
                    @click="goToPlan"
                  >
                    Continuar organizando
                  </button>
                </div>

                <div v-else class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="text-xs font-bold"
                       :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                    Aún no tienes un viaje creado. Empieza uno y vuelve aquí para retomarlo en 1 clic.
                  </div>
                  <button
                    class="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all"
                    style="background: var(--rp-accent);"
                    @click="goToPlan"
                  >
                    Crear mi plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feed Section -->
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

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <TransitionGroup name="feed">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="relative rounded-[32px] overflow-hidden group cursor-pointer hover:-translate-y-1.5 transition-transform duration-300"
                :style="store.isDark
                  ? 'background: var(--rp-surface); border: 1px solid var(--rp-border); box-shadow: 0 8px 32px rgba(0,0,0,0.4);'
                  : 'background: white; border: 1px solid #f8fafc; box-shadow: 0 8px 24px rgba(0,0,0,0.06);'"
                @click="openItemDetail(item)"
              >
                <div class="relative h-56 overflow-hidden">
                  <img
                    :src="item.img"
                    :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <!-- Gradient overlay on dark -->
                  <div v-if="store.isDark" class="absolute inset-0 bg-gradient-to-t from-rp-surface/40 to-transparent" />
                  <div class="absolute top-4 left-4 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md"
                       :style="store.isDark ? 'background: rgba(17,17,24,0.85); border: 1px solid rgba(255,255,255,0.1);' : 'background: rgba(255,255,255,0.9);'">
                    <Star :size="11" class="fill-orange-500 text-orange-500" />
                    <span class="text-[10px] font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ item.rating }}</span>
                  </div>
                  <button
                    class="absolute top-4 right-4 p-2.5 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all"
                    :style="store.isDark ? 'background: rgba(17,17,24,0.6);' : 'background: rgba(255,255,255,0.3);'"
                    @click.stop="toggleFavorite(item.id)"
                  >
                    <Heart :size="18" :class="{ 'fill-red-500 text-red-500': favorites.includes(item.id) }" />
                  </button>
                </div>
                <div class="p-6">
                  <h4 class="text-base font-black uppercase tracking-tight leading-tight mb-1"
                      :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">
                    {{ item.title }}
                  </h4>
                  <div class="flex items-center gap-2 mt-2">
                    <MapPin :size="14" class="text-rp-accent flex-shrink-0" />
                    <span class="text-xs font-bold truncate"
                          :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                      {{ item.city }}, {{ item.country }}
                    </span>
                  </div>
                  <div class="mt-1 text-[11px] font-bold uppercase tracking-widest"
                       :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                    Desde {{ item.price }} / noche
                  </div>
                  <div class="flex justify-between items-center mt-5">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-bold uppercase tracking-widest"
                            :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Desde</span>
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
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>

    <!-- MAP SIDEBAR (when map is expanded) -->
    <div 
      v-else
      key="sidebar"
      class="relative z-20 overflow-y-auto"
      :class="isMobile ? 'hidden' : 'lg:block lg:w-[25%] lg:h-full'"
      :style="store.isDark
        ? 'background: var(--rp-surface); border-left: 1px solid var(--rp-border); box-shadow: -8px 0 32px rgba(0,0,0,0.5);'
        : 'background: white; box-shadow: -20px 0 40px rgba(0,0,0,0.1);'"
    >
      <div class="p-6 h-full flex flex-col">
        <div class="mb-7">
          <h2 class="text-xl font-black uppercase tracking-tight mb-2"
              :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
              style="font-family: 'Syne', sans-serif;">
            Navegación
          </h2>
          <div class="h-0.5 w-10 bg-rp-accent rounded-full" />
        </div>

        <!-- Map Controls Section -->
        <div class="space-y-3 mb-7">
          <h3 class="text-[10px] font-bold uppercase tracking-widest mb-2"
              :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Vista del Mapa</h3>
          
          <button
            v-for="view in mapViews.filter(v => v.id === 'world')"
            :key="view.id"
            @click="changeMapView(view.id)"
            class="w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all border"
            :class="store.isDark
              ? currentMapView === view.id
                ? 'border-rp-accent/40 bg-orange-950/20 shadow-[0_4px_16px_rgba(249,115,22,0.1)]'
                : 'border-rp-border bg-rp-surface-2 hover:border-rp-accent/30'
              : currentMapView === view.id
                ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-100'
                : 'bg-gray-50 border-transparent hover:border-orange-200 hover:bg-orange-50'"
          >
            <div 
              class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
              :class="currentMapView === view.id
                ? 'bg-rp-accent text-white'
                : store.isDark ? 'bg-rp-surface text-rp-muted' : 'bg-white text-gray-600'"
            >
              <component :is="view.icon" :size="20" />
            </div>
            <div class="flex-1 text-left">
              <div class="font-black text-xs uppercase tracking-tight"
                   :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ view.label }}</div>
              <div class="text-[10px]" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">{{ view.description }}</div>
            </div>
          </button>
        </div>

        <!-- Filters Section -->
        <div class="space-y-3 mb-7">
          <h3 class="text-[10px] font-bold uppercase tracking-widest mb-2"
              :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Filtrar por</h3>
          
          <button
            v-for="cat in categories"
            :key="cat.label"
            @click="filterByCategory(cat.label)"
            class="w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all border"
            :class="store.isDark
              ? selectedCategory === cat.label
                ? 'border-rp-accent/40 bg-orange-950/20'
                : 'border-rp-border bg-rp-surface-2 hover:border-rp-accent/30'
              : selectedCategory === cat.label
                ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-100'
                : 'bg-gray-50 border-transparent hover:border-orange-200'"
          >
            <div 
              class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
              :class="selectedCategory === cat.label
                ? 'bg-rp-accent text-white'
                : store.isDark ? 'bg-rp-surface text-rp-muted' : cat.color"
            >
              <component :is="cat.icon" :size="18" />
            </div>
            <div class="flex-1 text-left">
              <div class="font-black text-xs uppercase tracking-tight"
                   :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ cat.label }}</div>
            </div>
            <div 
              v-if="selectedCategory === cat.label"
              class="w-1.5 h-1.5 bg-rp-accent rounded-full"
            />
          </button>
        </div>

        <!-- Destinations List -->
        <div class="flex-1 space-y-2">
          <h3 class="text-[10px] font-bold uppercase tracking-widest mb-2"
              :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
            Destinos ({{ filteredItems.length }})
          </h3>
          
          <button
            v-for="item in filteredItems"
            :key="item.id"
            @click="focusOnDestination(item)"
            class="w-full flex items-start space-x-3 p-3 rounded-xl transition-all"
            :class="store.isDark
              ? 'hover:bg-rp-surface-2'
              : 'hover:bg-orange-50'"
          >
            <img 
              :src="item.img" 
              :alt="item.title"
              class="w-14 h-14 rounded-lg object-cover shadow-sm"
            />
            <div class="flex-1 text-left">
              <div class="font-bold text-xs uppercase tracking-tight mb-1"
                   :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ item.title }}</div>
              <div class="flex items-center justify-between">
                <span class="text-rp-accent font-black text-xs">{{ item.price }}</span>
                <span class="text-[10px]" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">⭐ {{ item.rating }}</span>
              </div>
            </div>
          </button>
        </div>

        <!-- Reset Button -->
        <button
          @click="resetFilters"
          class="mt-5 w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
          :class="store.isDark
            ? 'bg-rp-surface-2 border border-rp-border text-rp-muted hover:border-rp-accent/30 hover:text-rp-accent'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>

    <!-- MOBILE/TABLET SIDEBAR (slides from right) -->
    <Transition name="slide-right">
      <div
        v-if="mapExpanded && showMobileSidebar && isMobile"
        class="fixed top-0 right-0 bottom-0 w-[85%] sm:w-[70%] md:w-[400px] z-[2000] overflow-y-auto"
        :style="store.isDark
          ? 'background: var(--rp-surface); border-left: 1px solid var(--rp-border);'
          : 'background: white; box-shadow: -4px 0 32px rgba(0,0,0,0.15);'"
      >
        <div class="p-6 h-full flex flex-col">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-black uppercase tracking-tight"
                  :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                  style="font-family: 'Syne', sans-serif;">
                Navegación
              </h2>
              <button
                @click="showMobileSidebar = false"
                class="p-2 rounded-full transition-colors"
                :class="store.isDark ? 'hover:bg-rp-surface-2 text-rp-muted' : 'hover:bg-gray-100 text-gray-700'"
              >
                <X :size="22" />
              </button>
            </div>
            <div class="h-0.5 w-10 bg-rp-accent rounded-full" />
          </div>

          <!-- Map Controls Section -->
          <div class="space-y-3 mb-6">
            <h3 class="text-[10px] font-bold uppercase tracking-widest mb-2"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Vista del Mapa</h3>
            
            <button
              v-for="view in mapViews.filter(v => v.id === 'world')"
              :key="view.id"
              @click="changeMapView(view.id); showMobileSidebar = false"
              class="w-full flex items-center space-x-3 p-3 rounded-xl transition-all border"
              :class="store.isDark
                ? currentMapView === view.id
                  ? 'border-rp-accent/40 bg-orange-950/20'
                  : 'border-rp-border bg-rp-surface-2'
                : currentMapView === view.id
                  ? 'bg-orange-50 border-orange-500 shadow-md'
                  : 'bg-gray-50 border-transparent'"
            >
              <div 
                class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                :class="currentMapView === view.id
                  ? 'bg-rp-accent text-white'
                  : store.isDark ? 'bg-rp-surface text-rp-muted' : 'bg-white text-gray-600'"
              >
                <component :is="view.icon" :size="18" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-black text-xs uppercase tracking-tight"
                     :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ view.label }}</div>
                <div class="text-[10px]" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">{{ view.description }}</div>
              </div>
            </button>
          </div>

          <!-- Filters Section -->
          <div class="space-y-3 mb-6">
            <h3 class="text-[10px] font-bold uppercase tracking-widest mb-2"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Filtrar por</h3>
            
            <button
              v-for="cat in categories"
              :key="cat.label"
              @click="filterByCategory(cat.label)"
              class="w-full flex items-center space-x-3 p-3 rounded-xl transition-all border"
              :class="store.isDark
                ? selectedCategory === cat.label
                  ? 'border-rp-accent/40 bg-orange-950/20'
                  : 'border-rp-border bg-rp-surface-2'
                : selectedCategory === cat.label
                  ? 'bg-orange-50 border-orange-500 shadow-md'
                  : 'bg-gray-50 border-transparent'"
            >
              <div 
                class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                :class="selectedCategory === cat.label ? cat.activeColor : cat.color"
              >
                <component :is="cat.icon" :size="16" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-black text-xs uppercase tracking-tight"
                     :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ cat.label }}</div>
              </div>
              <div 
                v-if="selectedCategory === cat.label"
                class="w-1.5 h-1.5 bg-rp-accent rounded-full"
              />
            </button>
          </div>

          <!-- Destinations List -->
          <div class="flex-1 mb-4">
            <h3 class="text-[10px] font-bold uppercase tracking-widest mb-3"
                :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
              Destinos ({{ filteredItems.length }})
            </h3>
            
            <div class="space-y-2">
              <button
                v-for="item in filteredItems"
                :key="item.id"
                @click="focusOnDestination(item); showMobileSidebar = false"
                class="w-full flex items-start space-x-3 p-3 rounded-xl transition-all"
                :class="store.isDark ? 'hover:bg-rp-surface-2' : 'hover:bg-orange-50'"
              >
                <img 
                  :src="item.img" 
                  :alt="item.title"
                  class="w-12 h-12 rounded-lg object-cover"
                />
                <div class="flex-1 text-left">
                  <div class="font-bold text-xs uppercase tracking-tight mb-1"
                       :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ item.title }}</div>
                  <div class="flex items-center justify-between">
                    <span class="text-rp-accent font-black text-xs">{{ item.price }}</span>
                    <span class="text-[10px]" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">⭐ {{ item.rating }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <button
            @click="resetFilters"
            class="w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            :class="store.isDark
              ? 'bg-rp-surface-2 border border-rp-border text-rp-muted'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </Transition>

    <!-- Overlay for mobile sidebar -->
    <Transition name="fade">
      <div
        v-if="mapExpanded && showMobileSidebar && isMobile"
        @click="showMobileSidebar = false"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1999]"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Search, Hotel, Compass, Utensils, Plane, Heart, MapPin, Star, X, Globe, Navigation, Layers, Menu, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { accommodationsMock } from '@/mocks/accommodations'
import { activitiesMock } from '@/mocks/activities'
import { restaurantsMock } from '@/mocks/restaurants'
import { transportsMock } from '@/mocks/transport'
import { useAppStore } from '@/stores/app'

const categories = [
  {
    icon: Hotel,
    label: 'Alojamiento',
    color: 'bg-blue-50 text-blue-500',
    activeColor: 'bg-blue-200 text-blue-700'
  },
  {
    icon: Compass,
    label: 'Aventuras',
    color: 'bg-emerald-50 text-emerald-500',
    activeColor: 'bg-emerald-200 text-emerald-700'
  },
  {
    icon: Utensils,
    label: 'Comida',
    color: 'bg-orange-50 text-rumbo-orange',
    activeColor: 'bg-orange-200 text-orange-700'
  },
  {
    icon: Plane,
    label: 'Transporte',
    color: 'bg-sky-50 text-sky-600',
    activeColor: 'bg-sky-200 text-sky-800'
  }
]

const mapViews = [
  { id: 'world', label: 'Vista Mundial', description: 'Todos los destinos', icon: Globe },
  { id: 'routes', label: 'Rutas', description: 'Conectar destinos', icon: Navigation },
  { id: 'clusters', label: 'Agrupados', description: 'Por región', icon: Layers }
]

type FeedCategory = 'Alojamiento' | 'Aventuras' | 'Comida' | 'Transporte'
type FeedKind = 'accommodation' | 'activity' | 'restaurant' | 'transport'

type FeedItem = {
  id: string
  kind: FeedKind
  title: string
  price: string
  rating: number
  category: FeedCategory
  img: string
  city: string
  country: string
  lat: number
  lng: number
  availableFrom?: string
  availableTo?: string
  unavailableDates?: string[]
}

type AccommodationFeedItem = FeedItem & {
  kind: 'accommodation'
  availableFrom: string
  availableTo: string
  unavailableDates: string[]
}

const accommodationItems: FeedItem[] = accommodationsMock.map((acc, index) => ({
  id: acc.id,
  kind: 'accommodation',
  title: acc.title,
  price: `${acc.currency} ${acc.pricePerNight}`,
  rating: acc.rating,
  category: 'Alojamiento',
  img: acc.image,
  city: acc.city,
  country: acc.country,
  availableFrom: acc.availableFrom,
  availableTo: acc.availableTo,
  unavailableDates: acc.unavailableDates,
  lat: 40.4168 + (index * 1.25),
  lng: -3.7038 + (index * 1.25)
}))

const activityItems: FeedItem[] = activitiesMock.map((act, index) => ({
  id: act.id,
  kind: 'activity',
  title: act.title,
  price: `${act.currency} ${act.pricePerPerson}`,
  rating: act.rating,
  category: 'Aventuras',
  img: act.image,
  city: act.city,
  country: act.category,
  lat: 41.0 + (index * 0.8),
  lng: -2.0 + (index * 0.9)
}))

const restaurantItems: FeedItem[] = restaurantsMock.map((r, index) => ({
  id: r.id,
  kind: 'restaurant',
  title: r.name,
  price: `${r.currency} ${r.avgPricePerPerson}`,
  rating: r.rating,
  category: 'Comida',
  img: r.image,
  city: r.city,
  country: r.cuisine,
  lat: 40.2 + (index * 0.7),
  lng: -4.3 + (index * 0.8)
}))

const transportImageByType: Record<string, string> = {
  Vuelo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80',
  Tren: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1800&q=80',
  Bus: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1800&q=80',
  Coche: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1800&q=80',
  Ferry: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80',
  Bicicleta: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1800&q=80',
}

const transportItems: FeedItem[] = transportsMock.map((t, index) => ({
  id: t.id,
  kind: 'transport',
  title: `${t.origin} → ${t.destination}`,
  price: `${t.currency} ${t.pricePerTicket}`,
  rating: t.rating,
  category: 'Transporte',
  img: transportImageByType[t.type] ?? transportImageByType.Vuelo,
  city: t.origin,
  country: t.destination,
  lat: 39.5 + (index * 1.0),
  lng: -1.0 + (index * 1.1),
}))

const feedItems: FeedItem[] = [
  ...accommodationItems,
  ...activityItems,
  ...restaurantItems,
  ...transportItems,
]

const store = useAppStore()
const destinationQuery = ref('')
const checkIn = ref('')
const checkOut = ref('')
const guests = ref(2)
const selectedCategory = ref<string | null>(null)
const favorites = ref<string[]>([])
const mapExpanded = ref(false)
const currentMapView = ref('world')
const showMobileSidebar = ref(false)
const isMobile = ref(false)
const isExitingMapMode = ref(false)
const mapCollapsed = ref(true)

watch(mapExpanded, (expanded) => {
  document.documentElement.classList.toggle('map-expanded', expanded)
})
let map: L.Map | null = null
const markers: L.Marker[] = []

const europeCenter: [number, number] = [50, 10]
const europeZoom = 4

let touchStartY = 0
let touchStartTime = 0

const filteredItems = computed(() => {
  let items = feedItems
  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }
  if (destinationQuery.value) {
    const query = destinationQuery.value.toLowerCase()
    items = items.filter(item => item.title.toLowerCase().includes(query) || `${item.city} ${item.country}`.toLowerCase().includes(query))
  }

  if (checkIn.value && checkOut.value) {
    items = items.filter((item) => {
      if (item.kind !== 'accommodation') return true
      return isAccommodationAvailable(item as AccommodationFeedItem, checkIn.value, checkOut.value)
    })
  }

  return items
})

const nextTrip = computed(() => {
  if (!store.trips?.length) return null
  return store.trips[0] ?? null
})

const guestsLabel = computed(() => (guests.value === 1 ? '1' : `${guests.value}`))

function checkIsMobile() {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    mapCollapsed.value = false
  }
}

function handleTouchStart(event: TouchEvent) {
  if (mapExpanded.value || !isMobile.value) return
  touchStartY = event.touches[0].clientY
  touchStartTime = Date.now()
}

function handleTouchMove(event: TouchEvent) {
  if (mapExpanded.value || !isMobile.value) return
  const currentY = event.touches[0].clientY
  const deltaY = touchStartY - currentY
  if (deltaY > 50) {
    event.preventDefault()
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (mapExpanded.value || !isMobile.value) return
  const touchEndY = event.changedTouches[0].clientY
  const deltaY = touchStartY - touchEndY
  const deltaTime = Date.now() - touchStartTime
  if (deltaY > 50 && deltaTime < 300) {
    mapExpanded.value = true
    setTimeout(() => {
      map?.invalidateSize()
    }, 750)
  }
}

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value
}

function handleSearch() {
  console.log('Search:', {
    destination: destinationQuery.value,
    checkIn: checkIn.value,
    checkOut: checkOut.value,
    guests: guests.value,
    category: selectedCategory.value
  })
}

function filterByCategory(category: string) {
  if (selectedCategory.value === category) {
    selectedCategory.value = null
    showAllMarkers()
  } else {
    selectedCategory.value = category
    filterMarkersByCategory(category)
  }
}

function toggleFavorite(id: string) {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }
}

function openItemDetail(item: FeedItem) {
  if (item.kind === 'accommodation') {
    store.openAccommodationDetail(item.id)
    return
  }
  if (item.kind === 'activity') {
    store.openActivityDetail(item.id)
    return
  }
  if (item.kind === 'restaurant') {
    store.openRestaurantDetail(item.id)
    return
  }
  store.openTransportDetail(item.id)
}

function exitMapMode() {
  isExitingMapMode.value = true
  mapExpanded.value = false
  showMobileSidebar.value = false
  
  if (map) {
    setTimeout(() => {
      map?.setView(europeCenter, europeZoom, { animate: true, duration: 1 })
      map?.invalidateSize()
      setTimeout(() => {
        isExitingMapMode.value = false
      }, 1000)
    }, 750)
  }
}

function changeMapView(_viewId: string) {
  currentMapView.value = 'world'
  if (!map) return
  map.setView(europeCenter, europeZoom, { animate: true, duration: 1 })
}

function focusOnDestination(item: typeof feedItems[0]) {
  if (!map) return
  map.setView([item.lat, item.lng], 8, { animate: true, duration: 1 })
  markers.forEach(marker => {
    const latlng = marker.getLatLng()
    if (latlng.lat === item.lat && latlng.lng === item.lng) {
      marker.openPopup()
    }
  })
}

function filterMarkersByCategory(category: string) {
  markers.forEach((marker, index) => {
    const item = feedItems[index]
    if (item.category === category) {
      marker.setOpacity(1)
    } else {
      marker.setOpacity(0.2)
    }
  })
}

function showAllMarkers() {
  markers.forEach(marker => {
    marker.setOpacity(1)
  })
}

function resetFilters() {
  selectedCategory.value = null
  destinationQuery.value = ''
  checkIn.value = ''
  checkOut.value = ''
  guests.value = 2
  showAllMarkers()
  if (map) {
    map.setView(europeCenter, europeZoom, { animate: true, duration: 1 })
  }
  currentMapView.value = 'world'
}

function toggleMapCollapsed() {
  if (isMobile.value || mapExpanded.value) return
  mapCollapsed.value = !mapCollapsed.value
  if (!mapCollapsed.value) {
    setTimeout(() => map?.invalidateSize(), 750)
  }
}

function formatTripDates(start: string, end: string): string {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })
  return `${fmt.format(s)} – ${fmt.format(e)}`
}

function goToPlan() {
  store.setCurrentView('plan')
}

function isoToMidnight(iso: string): Date {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isAccommodationAvailable(
  item: AccommodationFeedItem,
  inDateIso: string,
  outDateIso: string
): boolean {
  const checkInDate = isoToMidnight(inDateIso)
  const checkOutDate = isoToMidnight(outDateIso)
  if (!(checkInDate < checkOutDate)) return true

  const availableFrom = isoToMidnight(item.availableFrom)
  const availableTo = isoToMidnight(item.availableTo)
  if (checkInDate < availableFrom) return false
  if (checkOutDate > addDays(availableTo, 1)) return false

  const blocked = new Set(item.unavailableDates ?? [])
  for (let d = new Date(checkInDate); d < checkOutDate; d = addDays(d, 1)) {
    if (blocked.has(toISODate(d))) return false
  }
  return true
}

function initMap() {
  const el = document.getElementById('map')
  if (!el) {
    console.warn('[HomeView] #map no encontrado; mapa omitido')
    return
  }

  try {
    map = L.map('map', {
      center: europeCenter,
      zoom: europeZoom,
      minZoom: 2,
      maxBounds: [
        [-89, -180],
        [89, 180],
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: true
    })

    L.control.zoom({ position: 'bottomleft' }).addTo(map)

    map.setMaxBounds([
      [-89, -180],
      [89, 180],
    ])

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(249, 115, 22, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="width: 16px; height: 16px; background: #f97316; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 1;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })

    feedItems.forEach(item => {
      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(map!)
        .bindPopup(`
          <div style="min-width: 200px; font-family: 'DM Sans', sans-serif;">
            <img src="${item.img}" alt="${item.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;" />
            <h4 style="font-weight: 800; font-size: 13px; text-transform: uppercase; margin-bottom: 3px; color: #1f2937;">${item.title}</h4>
            <p style="font-size: 11px; color: #6b7280; margin-bottom: 7px;">${item.category}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; font-size: 16px; color: #f97316;">${item.price}</span>
              <span style="font-size: 11px; color: #6b7280;">⭐ ${item.rating}</span>
            </div>
          </div>
        `, {
          maxWidth: 250,
          className: 'custom-popup'
        })
      
      markers.push(marker)
    })

    if (!isMobile.value) {
      map.on('movestart', () => {
        if (!mapExpanded.value && !isExitingMapMode.value) {
          mapExpanded.value = true
        }
      })

      map.on('zoomstart', () => {
        if (!mapExpanded.value && !isExitingMapMode.value) {
          mapExpanded.value = true
        }
      })

      map.on('click', () => {
        if (!mapExpanded.value && !isExitingMapMode.value) {
          mapExpanded.value = true
        }
      })
    }

    setTimeout(() => {
      map?.invalidateSize()
    }, 100)
  } catch (e) {
    console.error('[HomeView] Error al inicializar Leaflet', e)
  }
}

let resizeTimeout: ReturnType<typeof setTimeout>
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)

  setTimeout(() => {
    initMap()
  }, 100)

  const observer = new MutationObserver(() => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      map?.invalidateSize()
    }, 750)
  })

  const mapElement = document.getElementById('map')
  if (mapElement?.parentElement) {
    observer.observe(mapElement.parentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
  if (map) {
    map.remove()
    map = null
  }
  document.documentElement.classList.remove('map-expanded')
})
</script>

<style scoped>
/* CSS vars shortcuts */
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
.hover\:text-rp-accent:hover { color: var(--rp-accent); }
.hover\:bg-rp-surface-2:hover { background-color: var(--rp-surface-2); }
.from-rp-surface\/40 { --tw-gradient-from: rgba(17,17,24,0.4); }
.placeholder\:text-rp-muted::placeholder { color: var(--rp-muted); }

.feed-enter-active,
.feed-leave-active {
  transition: all 0.5s ease;
}
.feed-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.feed-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.7s ease-in-out;
}
.slide-panel-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from {
  transform: translateX(100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce {
  animation: bounce 2s infinite;
}

#map {
  position: relative;
  z-index: 1;
}

:deep(.leaflet-control-zoom) {
  top: auto !important;
  bottom: 24px !important;
  left: 16px !important;
}

:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 18px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(249,115,22,0.15) !important;
}

:deep(.leaflet-popup-tip) {
  background: white !important;
}

:deep(.leaflet-popup-content) {
  margin: 12px !important;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

:deep(.leaflet-control-zoom a) {
  width: 40px !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 18px !important;
  border: none !important;
  background: rgba(17,17,24,0.92) !important;
  color: #f97316 !important;
  font-weight: bold !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #f97316 !important;
  color: white !important;
}

:deep(.leaflet-control-zoom a:first-child) {
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--rp-surface-2);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(249,115,22,0.4);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #f97316;
}

body:has(.slide-right-enter-active),
body:has(.slide-right-leave-active) {
  overflow: hidden;
}
</style>
