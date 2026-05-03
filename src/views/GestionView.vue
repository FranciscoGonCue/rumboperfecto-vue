<template>
  <div class="min-h-full pb-32 lg:pb-12" :class="store.isDark ? 'bg-rp-bg text-rp-text' : 'bg-gray-50 text-gray-900'">

    <!-- DETAIL EDIT MODAL -->
    <Transition name="slide-up">
      <div v-if="editingItem" class="fixed inset-0 z-[200] flex items-end lg:items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeEdit" />
        <!-- Modal -->
        <div
          class="relative w-full lg:max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-[32px] lg:rounded-[28px] z-10"
          :class="store.isDark
            ? 'bg-rp-surface border border-rp-border shadow-[0_-24px_80px_rgba(0,0,0,0.7)]'
            : 'bg-white border border-gray-100 shadow-[0_-24px_80px_rgba(0,0,0,0.15)]'"
        >
          <!-- Drag handle (mobile) -->
          <div class="lg:hidden flex justify-center pt-4 pb-2">
            <div class="w-10 h-1 rounded-full" :class="store.isDark ? 'bg-rp-border' : 'bg-gray-200'" />
          </div>

          <!-- Modal Header -->
          <div class="px-6 lg:px-8 pt-4 lg:pt-6 pb-5 flex items-center justify-between border-b"
               :class="store.isDark ? 'border-rp-border' : 'border-gray-100'">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                   :style="`background: ${getCategoryColor(editingItem.categoria)}`">
                {{ getCategoryIcon(editingItem.categoria) }}
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest"
                   :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Editando</p>
                <h2 class="text-lg font-black" style="font-family: 'Syne', sans-serif;">
                  {{ editingItem.nombre }}
                </h2>
              </div>
            </div>
            <button @click="closeEdit"
                    class="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                    :class="store.isDark ? 'bg-rp-surface-2 text-rp-muted hover:text-rp-text' : 'bg-gray-100 text-gray-500 hover:text-gray-700'">
              <X :size="18" />
            </button>
          </div>

          <!-- Form Fields -->
          <div class="px-6 lg:px-8 py-6 space-y-5">

            <!-- Image preview + URL -->
            <div class="relative rounded-2xl overflow-hidden h-40 lg:h-52 border"
                 :class="store.isDark ? 'border-rp-border' : 'border-gray-100'">
              <img v-if="editForm.imagen" :src="editForm.imagen" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center"
                   :class="store.isDark ? 'bg-rp-surface-2' : 'bg-gray-50'">
                <span class="text-4xl">🖼️</span>
              </div>
              <div class="absolute bottom-3 left-3 right-3">
                <div class="flex items-center rounded-xl px-3 py-2 space-x-2 backdrop-blur-md"
                     style="background: rgba(0,0,0,0.6);">
                  <ImageIcon :size="14" class="text-white/70 flex-shrink-0" />
                  <input v-model="editForm.imagen" type="text" placeholder="URL de imagen..."
                         class="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/40 font-medium" />
                </div>
              </div>
            </div>

            <!-- Nombre + Estado -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div class="lg:col-span-2">
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Nombre del anuncio</label>
                <input v-model="editForm.nombre" type="text"
                       class="field-input"
                       :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Estado</label>
                <select v-model="editForm.estado"
                        class="field-input"
                        :class="store.isDark ? 'dark-input' : 'light-input'">
                  <option value="activo">✅ Activo</option>
                  <option value="pausado">⏸️ Pausado</option>
                  <option value="borrador">📝 Borrador</option>
                </select>
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Descripción</label>
              <textarea v-model="editForm.descripcion" rows="3"
                        class="field-input resize-none"
                        :class="store.isDark ? 'dark-input' : 'light-input'" />
            </div>

            <!-- Location row -->
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Ciudad</label>
                <input v-model="editForm.ciudad" type="text" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">País</label>
                <input v-model="editForm.pais" type="text" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Dirección</label>
                <input v-model="editForm.direccion" type="text" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
            </div>

            <!-- Price row -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Precio</label>
                <input v-model.number="editForm.precio" type="number" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Moneda</label>
                <select v-model="editForm.moneda" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'">
                  <option>EUR</option><option>USD</option><option>GBP</option><option>MXN</option>
                </select>
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Valoración</label>
                <input v-model.number="editForm.valoracion" type="number" min="0" max="5" step="0.1" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Nº Reseñas</label>
                <input v-model.number="editForm.reseñas" type="number" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
            </div>

            <!-- Category-specific fields -->
            <!-- ALOJAMIENTO extra -->
            <template v-if="editingItem.categoria === 'alojamiento'">
              <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Habitaciones</label>
                  <input v-model.number="editForm.habitaciones" type="number" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
                </div>
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Baños</label>
                  <input v-model.number="editForm.banos" type="number" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
                </div>
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Capacidad</label>
                  <input v-model.number="editForm.capacidad" type="number" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
                </div>
              </div>
            </template>

            <!-- RESTAURANTE extra -->
            <template v-if="editingItem.categoria === 'restaurante'">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Tipo de cocina</label>
                  <input v-model="editForm.tipoCocina" type="text" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
                </div>
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Horario</label>
                  <input v-model="editForm.horario" type="text" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
                </div>
              </div>
            </template>

            <!-- ACTIVIDAD extra -->
            <template v-if="editingItem.categoria === 'actividad'">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Duración</label>
                  <input v-model="editForm.duracion" type="text" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
                </div>
                <div>
                  <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Dificultad</label>
                  <select v-model="editForm.dificultad" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'">
                    <option>Fácil</option><option>Moderada</option><option>Difícil</option><option>Extrema</option>
                  </select>
                </div>
              </div>
            </template>

            <!-- Tags -->
            <div>
              <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Etiquetas (separadas por coma)</label>
              <input v-model="editForm.etiquetas" type="text" placeholder="wifi, piscina, parking..."
                     class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
            </div>

            <!-- Coordenadas -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Latitud</label>
                <input v-model.number="editForm.latitud" type="number" step="0.000001" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
              <div>
                <label class="field-label" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">Longitud</label>
                <input v-model.number="editForm.longitud" type="number" step="0.000001" class="field-input" :class="store.isDark ? 'dark-input' : 'light-input'" />
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 lg:px-8 pb-6 pt-2 flex items-center justify-between border-t gap-3"
               :class="store.isDark ? 'border-rp-border' : 'border-gray-100'">
            <button @click="deleteItem(editingItem)"
                    class="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border"
                    :class="store.isDark ? 'border-red-900/40 text-red-400 hover:bg-red-950/30' : 'border-red-200 text-red-500 hover:bg-red-50'">
              <Trash2 :size="15" />
              <span>Eliminar</span>
            </button>
            <div class="flex items-center space-x-3">
              <button @click="closeEdit"
                      class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                      :class="store.isDark ? 'bg-rp-surface-2 text-rp-muted hover:text-rp-text' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                Cancelar
              </button>
              <button @click="saveEdit"
                      class="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider text-white transition-all"
                      style="background: var(--rp-accent);">
                <Save :size="15" />
                <span>Guardar cambios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- PAGE CONTENT -->
    <div class="max-w-6xl mx-auto px-5 lg:px-10 pt-8 lg:pt-10">

      <!-- Page Header -->
      <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-900/30"
                 style="background: var(--rp-accent);">
              <LayoutGrid :size="22" />
            </div>
            <h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight leading-none"
                style="font-family: 'Syne', sans-serif;">
              Gestión
            </h1>
          </div>
          <p class="text-sm font-medium ml-14"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
            Administra tus alojamientos, restaurantes y actividades
          </p>
        </div>

        <!-- Add new button -->
        <button @click="openNewItemModal"
                class="flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-orange-900/30 hover:scale-[1.02] active:scale-[0.98]"
                style="background: var(--rp-accent);">
          <Plus :size="18" />
          <span>Nuevo anuncio</span>
        </button>
      </div>

      <!-- Stats strip -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div v-for="stat in statsBar" :key="stat.label"
             class="rounded-2xl p-4 flex items-center space-x-3 border transition-all"
             :class="store.isDark
               ? 'bg-rp-surface border-rp-border'
               : 'bg-white border-gray-100 shadow-sm'">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base"
               :style="`background: ${stat.color}`">
            {{ stat.icon }}
          </div>
          <div class="min-w-0">
            <p class="text-xl font-black leading-none" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'">{{ stat.value }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate"
               :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="flex items-center space-x-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 border"
          :class="activeTab === tab.key
            ? 'text-white border-transparent shadow-lg'
            : store.isDark
              ? 'bg-rp-surface border-rp-border text-rp-muted hover:text-rp-text'
              : 'bg-white border-gray-100 text-gray-500 hover:text-gray-700 shadow-sm'"
          :style="activeTab === tab.key ? `background: ${tab.color}; box-shadow: 0 8px 20px ${tab.glow}` : ''"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span class="ml-1 px-1.5 py-0.5 rounded-full text-[9px]"
                :class="activeTab === tab.key ? 'bg-white/20' : store.isDark ? 'bg-rp-surface-2 text-rp-muted' : 'bg-gray-100 text-gray-400'">
            {{ getCountByCategory(tab.key) }}
          </span>
        </button>
      </div>

      <!-- Search + Sort bar -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex-1 flex items-center rounded-xl px-4 py-2.5 space-x-2 border transition-all"
             :class="store.isDark ? 'bg-rp-surface border-rp-border' : 'bg-white border-gray-100 shadow-sm'">
          <Search :size="16" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'" />
          <input v-model="searchQuery" type="text" placeholder="Buscar anuncios..."
                 class="flex-1 bg-transparent text-sm outline-none font-medium"
                 :class="store.isDark ? 'text-rp-text placeholder:text-rp-muted' : 'text-gray-700 placeholder:text-gray-400'" />
          <button v-if="searchQuery" @click="searchQuery = ''" class="text-rp-muted hover:text-rp-accent transition-colors">
            <X :size="14" />
          </button>
        </div>
        <select v-model="sortBy"
                class="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all appearance-none cursor-pointer"
                :class="store.isDark ? 'bg-rp-surface border-rp-border text-rp-text' : 'bg-white border-gray-100 text-gray-700 shadow-sm'">
          <option value="reciente">Más reciente</option>
          <option value="nombre">Nombre A-Z</option>
          <option value="precio">Precio</option>
          <option value="valoracion">Valoración</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20 space-x-3"
           :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
        <Loader2 :size="22" class="animate-spin" />
        <span class="text-sm font-semibold">Cargando tus servicios…</span>
      </div>

      <!-- Fetch error -->
      <div v-else-if="fetchError" class="flex flex-col items-center justify-center py-20 text-center">
        <p class="text-sm font-bold text-red-400 mb-4">{{ fetchError }}</p>
        <button @click="fetchMisServicios"
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style="background: var(--rp-accent);">
          Reintentar
        </button>
      </div>

      <!-- Listings Grid -->
      <TransitionGroup v-else name="card-list" tag="div" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="group rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.01]"
          :class="store.isDark
            ? 'bg-rp-surface border-rp-border hover:border-rp-accent/30 hover:shadow-[0_12px_32px_rgba(249,115,22,0.08)]'
            : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-100'"
        >
          <!-- Card Image -->
          <div class="relative h-40 overflow-hidden">
            <img :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <!-- Category badge -->
            <div class="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider"
                 :style="`background: ${getCategoryColor(item.categoria)}; box-shadow: 0 4px 12px ${getCategoryGlow(item.categoria)}`">
              <span>{{ getCategoryIcon(item.categoria) }}</span>
              <span>{{ item.categoria }}</span>
            </div>

            <!-- Status badge -->
            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    :class="item.estado === 'activo'
                      ? 'bg-emerald-500/90 text-white'
                      : item.estado === 'pausado'
                        ? 'bg-amber-500/90 text-white'
                        : 'bg-gray-500/90 text-white'">
                {{ item.estado === 'activo' ? '✅' : item.estado === 'pausado' ? '⏸️' : '📝' }}
                {{ item.estado }}
              </span>
            </div>

            <!-- Price overlay -->
            <div class="absolute bottom-3 right-3 text-right">
              <p class="text-white font-black text-lg leading-none drop-shadow">
                {{ item.moneda }} {{ item.precio }}
              </p>
              <p class="text-white/70 text-[10px] font-bold">{{ item.unidadPrecio }}</p>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-4">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <h3 class="font-black text-sm truncate" :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                    style="font-family: 'Syne', sans-serif;">
                  {{ item.nombre }}
                </h3>
                <p class="text-xs font-medium mt-0.5 flex items-center space-x-1"
                   :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  <MapPin :size="11" />
                  <span class="truncate">{{ item.ciudad }}, {{ item.pais }}</span>
                </p>
              </div>
              <div class="flex items-center space-x-1 flex-shrink-0 text-amber-400">
                <Star :size="13" fill="currentColor" />
                <span class="text-xs font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-700'">{{ item.valoracion }}</span>
                <span class="text-[10px]" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">({{ item.reseñas }})</span>
              </div>
            </div>

            <p class="text-xs leading-relaxed line-clamp-2 mb-4"
               :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
              {{ item.descripcion }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span v-for="tag in item.etiquetas.slice(0, 3)" :key="tag"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                    :class="store.isDark ? 'bg-orange-950/30 text-rp-accent' : 'bg-orange-50 text-orange-600'">
                {{ tag }}
              </span>
              <span v-if="item.etiquetas.length > 3"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="store.isDark ? 'bg-rp-surface-2 text-rp-muted' : 'bg-gray-100 text-gray-400'">
                +{{ item.etiquetas.length - 3 }}
              </span>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center space-x-2">
              <button @click="openEdit(item)"
                      class="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style="background: var(--rp-accent);">
                <Edit3 :size="13" />
                <span>Editar detalles</span>
              </button>
              <button @click="toggleStatus(item)"
                      class="w-10 h-10 rounded-xl flex items-center justify-center transition-all border"
                      :class="store.isDark ? 'bg-rp-surface-2 border-rp-border hover:border-rp-accent/30 text-rp-muted hover:text-rp-accent' : 'bg-gray-50 border-gray-100 hover:border-orange-100 text-gray-500 hover:text-orange-500'">
                <Power :size="15" />
              </button>
              <button @click="duplicateItem(item)"
                      class="w-10 h-10 rounded-xl flex items-center justify-center transition-all border"
                      :class="store.isDark ? 'bg-rp-surface-2 border-rp-border hover:border-rp-accent/30 text-rp-muted hover:text-rp-accent' : 'bg-gray-50 border-gray-100 hover:border-orange-100 text-gray-500 hover:text-orange-500'">
                <Copy :size="15" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="text-6xl mb-4">{{ activeTab === 'todo' ? '📭' : getCategoryIcon(activeTab) }}</div>
        <h3 class="text-xl font-black uppercase mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'"
            style="font-family: 'Syne', sans-serif;">
          {{ searchQuery ? 'Sin resultados' : 'Sin anuncios aún' }}
        </h3>
        <p class="text-sm mb-6" :class="store.isDark ? 'text-rp-muted/60' : 'text-gray-400'">
          {{ searchQuery ? `No encontramos resultados para "${searchQuery}"` : 'Crea tu primer anuncio para empezar a recibir reservas' }}
        </p>
        <button v-if="!searchQuery" @click="openNewItemModal"
                class="flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all"
                style="background: var(--rp-accent);">
          <Plus :size="16" />
          <span>Añadir anuncio</span>
        </button>
      </div>

    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toast.show"
           class="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-white text-sm font-bold shadow-2xl"
           :class="toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-700'">
        <span>{{ toast.icon }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { misServiciosApi } from '@/services/api'
import type { Servicio } from '@/services/api'
import {
  LayoutGrid, Plus, Search, Edit3, Trash2, Save, X, Copy, Power,
  MapPin, Star, ImageIcon, Loader2
} from 'lucide-vue-next'

const store = useAppStore()

// ── Types ──────────────────────────────────────────────────────────────────────
interface GestionItem {
  id: string
  categoria: 'alojamiento' | 'restaurante' | 'actividad'
  nombre: string
  descripcion: string
  imagen: string
  ciudad: string
  pais: string
  direccion: string
  precio: number
  moneda: string
  unidadPrecio: string
  valoracion: number
  reseñas: number
  estado: 'activo' | 'pausado' | 'borrador'
  etiquetas: string[]
  latitud: number
  longitud: number
  habitaciones?: number
  banos?: number
  capacidad?: number
  tipoCocina?: string
  horario?: string
  duracion?: string
  dificultad?: string
  creadoEn: string
}

// ── Mapping helpers ────────────────────────────────────────────────────────────
function tipoToCategoria(nombreTipo: string | null | undefined): GestionItem['categoria'] {
  const t = (nombreTipo || '').toLowerCase()
  if (t.includes('restaur')) return 'restaurante'
  if (t.includes('actividad')) return 'actividad'
  return 'alojamiento'
}

function unidadByCategoria(cat: GestionItem['categoria']): string {
  if (cat === 'restaurante') return '/ persona'
  if (cat === 'actividad') return '/ persona'
  return '/ noche'
}

function mapServicio(s: Servicio): GestionItem {
  const categoria = tipoToCategoria(s.tipo?.nombre_tipo)
  const estado: GestionItem['estado'] =
    s.disponible === true ? 'activo' : s.disponible === false ? 'pausado' : 'borrador'

  return {
    id: String(s.id_servicio),
    categoria,
    nombre: s.nombre || '',
    descripcion: s.descripcion || '',
    imagen: s.imagen_url || '',
    ciudad: '',
    pais: '',
    direccion: '',
    precio: s.precio_base ?? 0,
    moneda: 'EUR',
    unidadPrecio: unidadByCategoria(categoria),
    valoracion: 0,
    reseñas: 0,
    estado,
    etiquetas: s.detalle_alojamiento?.servicios_extra
      ? s.detalle_alojamiento.servicios_extra.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    latitud: s.ubicacion_lat ?? 0,
    longitud: s.ubicacion_lon ?? 0,
    creadoEn: new Date().toISOString().slice(0, 10),
    tipoCocina: s.detalle_restauracion?.tipo_cocina ?? undefined,
    duracion: s.detalle_actividad?.duracion_estimada
      ? `${s.detalle_actividad.duracion_estimada} min`
      : undefined,
  }
}

// ── State ──────────────────────────────────────────────────────────────────────
const items = ref<GestionItem[]>([])
const loading = ref(false)
const fetchError = ref<string | null>(null)

async function fetchMisServicios() {
  loading.value = true
  fetchError.value = null
  try {
    const data = await misServiciosApi.getAll()
    items.value = data.map(mapServicio)
  } catch {
    fetchError.value = 'No se pudieron cargar tus servicios.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchMisServicios)

watch(
  () => store.currentView,
  (view) => { if (view === 'gestion') fetchMisServicios() },
)

// ── State ──────────────────────────────────────────────────────────────────────
const activeTab = ref<string>('todo')
const searchQuery = ref('')
const sortBy = ref('reciente')
const editingItem = ref<GestionItem | null>(null)
const editForm = reactive<Record<string, any>>({})

const toast = reactive({ show: false, message: '', type: 'success', icon: '✅' })

// ── Tabs config ───────────────────────────────────────────────────────────────
const tabs = [
  { key: 'todo', label: 'Todo', icon: '🗂️', color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  { key: 'alojamiento', label: 'Alojamientos', icon: '🏠', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { key: 'restaurante', label: 'Restaurantes', icon: '🍽️', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { key: 'actividad', label: 'Actividades', icon: '🧗', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCategoryColor(cat: string) {
  const map: Record<string, string> = { alojamiento: '#3b82f6', restaurante: '#10b981', actividad: '#8b5cf6' }
  return map[cat] || '#f97316'
}
function getCategoryGlow(cat: string) {
  const map: Record<string, string> = { alojamiento: 'rgba(59,130,246,0.4)', restaurante: 'rgba(16,185,129,0.4)', actividad: 'rgba(139,92,246,0.4)' }
  return map[cat] || 'rgba(249,115,22,0.4)'
}
function getCategoryIcon(cat: string) {
  const map: Record<string, string> = { alojamiento: '🏠', restaurante: '🍽️', actividad: '🧗', todo: '🗂️' }
  return map[cat] || '📌'
}
function getCountByCategory(key: string) {
  if (key === 'todo') return items.value.length
  return items.value.filter(i => i.categoria === key).length
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const statsBar = computed(() => [
  { label: 'Alojamientos', value: items.value.filter(i => i.categoria === 'alojamiento').length, icon: '🏠', color: '#3b82f6' },
  { label: 'Restaurantes', value: items.value.filter(i => i.categoria === 'restaurante').length, icon: '🍽️', color: '#10b981' },
  { label: 'Actividades', value: items.value.filter(i => i.categoria === 'actividad').length, icon: '🧗', color: '#8b5cf6' },
])

// ── Filtered + Sorted ─────────────────────────────────────────────────────────
const filteredItems = computed(() => {
  let result = [...items.value]
  if (activeTab.value !== 'todo') result = result.filter(i => i.categoria === activeTab.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i =>
      i.nombre.toLowerCase().includes(q) ||
      i.ciudad.toLowerCase().includes(q) ||
      i.descripcion.toLowerCase().includes(q) ||
      i.etiquetas.some(t => t.toLowerCase().includes(q))
    )
  }
  if (sortBy.value === 'nombre') result.sort((a, b) => a.nombre.localeCompare(b.nombre))
  else if (sortBy.value === 'precio') result.sort((a, b) => b.precio - a.precio)
  else if (sortBy.value === 'valoracion') result.sort((a, b) => b.valoracion - a.valoracion)
  else result.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
  return result
})

// ── Edit ──────────────────────────────────────────────────────────────────────
function openEdit(item: GestionItem) {
  editingItem.value = item
  Object.assign(editForm, {
    ...item,
    etiquetas: item.etiquetas.join(', '),
  })
}

function closeEdit() {
  editingItem.value = null
}

function saveEdit() {
  if (!editingItem.value) return
  const idx = items.value.findIndex(i => i.id === editingItem.value!.id)
  if (idx !== -1) {
    items.value[idx] = {
      ...editingItem.value,
      ...editForm,
      etiquetas: String(editForm.etiquetas).split(',').map((t: string) => t.trim()).filter(Boolean),
    } as GestionItem
  }
  closeEdit()
  showToast('✅', 'Cambios guardados correctamente', 'success')
}

function deleteItem(item: GestionItem) {
  items.value = items.value.filter(i => i.id !== item.id)
  closeEdit()
  showToast('🗑️', 'Anuncio eliminado', 'error')
}

function toggleStatus(item: GestionItem) {
  const newStatus = item.estado === 'activo' ? 'pausado' : 'activo'
  item.estado = newStatus
  showToast(newStatus === 'activo' ? '✅' : '⏸️', `Anuncio ${newStatus === 'activo' ? 'activado' : 'pausado'}`, 'success')
}

function duplicateItem(item: GestionItem) {
  const newItem: GestionItem = {
    ...JSON.parse(JSON.stringify(item)),
    id: Date.now().toString(),
    nombre: item.nombre + ' (copia)',
    estado: 'borrador',
    creadoEn: new Date().toISOString().slice(0, 10),
  }
  items.value.unshift(newItem)
  showToast('📋', 'Anuncio duplicado como borrador', 'success')
}

function openNewItemModal() {
  const blank: GestionItem = {
    id: Date.now().toString(),
    categoria: activeTab.value === 'todo' ? 'alojamiento' : activeTab.value as any,
    nombre: '', descripcion: '', imagen: '',
    ciudad: '', pais: '', direccion: '',
    precio: 0, moneda: 'EUR', unidadPrecio: '/ noche',
    valoracion: 0, reseñas: 0, estado: 'borrador',
    etiquetas: [], latitud: 0, longitud: 0,
    creadoEn: new Date().toISOString().slice(0, 10),
  }
  items.value.unshift(blank)
  openEdit(blank)
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(icon: string, message: string, type: string) {
  toast.show = true; toast.message = message; toast.type = type; toast.icon = icon
  setTimeout(() => { toast.show = false }, 3000)
}
</script>

<style scoped>
.bg-rp-bg { background-color: var(--rp-bg); }
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.bg-rp-accent { background-color: var(--rp-accent); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.border-rp-border { border-color: var(--rp-border); }
.hover\:border-rp-accent\/30:hover { border-color: rgba(249,115,22,0.3); }
.hover\:text-rp-accent:hover { color: var(--rp-accent); }
.hover\:text-rp-text:hover { color: var(--rp-text); }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.field-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  border: 1px solid;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
  box-sizing: border-box;
}

.dark-input {
  background: var(--rp-surface-2);
  border-color: var(--rp-border);
  color: var(--rp-text);
}
.dark-input:focus {
  border-color: rgba(249,115,22,0.4);
  box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
}
.dark-input option { background: var(--rp-surface); }

.light-input {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #111827;
}
.light-input:focus {
  border-color: rgba(249,115,22,0.4);
  box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
  background: white;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(40px); }

.card-list-enter-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.card-list-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: absolute; }
.card-list-enter-from { opacity: 0; transform: scale(0.95) translateY(10px); }
.card-list-leave-to { opacity: 0; transform: scale(0.95); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
