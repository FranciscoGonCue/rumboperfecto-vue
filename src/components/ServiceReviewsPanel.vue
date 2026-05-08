<template>
  <section
    v-if="isCatalogServicio"
    class="rounded-2xl p-5 border transition-colors"
    :class="store.isDark
      ? 'bg-rp-surface-2 border-rp-border'
      : 'bg-orange-50/60 border-orange-100'"
  >
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h3
          class="text-xs font-black uppercase tracking-[0.2em]"
          :class="store.isDark ? 'text-rp-accent' : 'text-orange-600'"
        >
          Reseñas
        </h3>
        <p class="text-sm font-bold mt-1" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
          {{ listaResenas.length }}
          {{ listaResenas.length === 1 ? 'opinión' : 'opiniones' }}
          <span v-if="mediaText" class="font-black text-rp-accent"> · {{ mediaText }}</span>
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
        :class="store.isDark
          ? 'bg-rp-accent text-white hover:brightness-110 shadow-orange-950/40'
          : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg'"
        @click="onTapEscribir"
      >
        <MessageSquarePlus :size="16" />
        Escribir reseña
      </button>
    </div>

    <p v-if="!store.isAuthenticated" class="text-xs font-semibold mb-3" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
      Inicia sesión para publicar tu valoración.
    </p>

    <ul v-if="listaResenas.length" class="space-y-3 max-h-[320px] overflow-y-auto pr-1">
      <li
        v-for="r in listaResenas"
        :key="r.id"
        class="rounded-xl p-3.5 border text-left transition-colors"
        :class="store.isDark ? 'bg-rp-surface border-rp-border' : 'bg-white border-gray-100'"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-sm font-black" :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
            {{ r.usuario.nombre }}
          </span>
          <span class="text-xs font-black text-rp-accent shrink-0">{{ r.puntuacion }}★</span>
        </div>
        <p class="text-sm leading-relaxed" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">{{ r.mensaje }}</p>
        <p class="text-[10px] font-bold uppercase tracking-wider mt-2 opacity-70" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
          {{ formatDate(r.creado_en) }}
        </p>
      </li>
    </ul>
    <p v-else class="text-sm font-medium italic" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
      Todavía no hay reseñas. ¡Sé el primero en opinar!
    </p>

    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-4 sm:p-6"
        :class="store.isDark ? 'bg-black/65' : 'bg-black/40'"
        aria-modal="true"
        role="dialog"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border"
          :class="store.isDark ? 'bg-rp-surface border-rp-border' : 'bg-white border-gray-200'"
          @click.stop
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b"
            :class="store.isDark ? 'border-rp-border' : 'border-gray-100'"
          >
            <h4 class="text-sm font-black uppercase tracking-wide" :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
              Tu reseña
            </h4>
            <button
              type="button"
              class="p-2 rounded-xl transition-colors"
              :class="store.isDark ? 'hover:bg-rp-surface-2 text-rp-muted' : 'hover:bg-gray-100 text-gray-500'"
              aria-label="Cerrar"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="p-5 space-y-5">
            <div v-if="!store.isAuthenticated" class="text-center space-y-3">
              <p class="text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
                Necesitas una cuenta para publicar una reseña en este servicio.
              </p>
              <button
                type="button"
                class="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-rp-accent text-white"
                @click="irPerfil"
              >
                Ir a perfil / iniciar sesión
              </button>
            </div>

            <template v-else>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Puntuación
                </p>
                <div class="flex gap-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    class="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rp-accent/40"
                    :aria-label="`${n} estrellas`"
                    @click="draftStars = n"
                  >
                    <Star
                      :size="28"
                      :class="n <= draftStars ? 'fill-amber-400 text-amber-400' : (store.isDark ? 'text-rp-border' : 'text-gray-200')"
                    />
                  </button>
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black uppercase tracking-widest block mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                  Comentario
                </label>
                <textarea
                  v-model="draftMessage"
                  rows="4"
                  maxlength="2000"
                  placeholder="¿Qué te pareció este servicio?"
                  class="w-full rounded-xl px-3 py-3 text-sm font-medium resize-none border outline-none ring-1 ring-transparent focus:ring-rp-accent/30"
                  :class="store.isDark
                    ? 'bg-black/25 border-rp-border text-rp-text placeholder:text-rp-muted'
                    : 'bg-gray-50 border-gray-200 text-gray-900'"
                />
              </div>

              <p v-if="formError" class="text-sm font-bold text-red-500">{{ formError }}</p>

              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider border"
                  :class="store.isDark ? 'border-rp-border text-rp-muted hover:bg-rp-surface-2' : 'border-gray-200 text-gray-600'"
                  @click="closeModal"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-rp-accent text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="sending || !draftMessage.trim()"
                  @click="enviar"
                >
                  {{ sending ? 'Enviando…' : 'Publicar' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Star, MessageSquarePlus, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { apiErrorMessage, serviciosApi } from '@/services/api'

const props = defineProps<{
  servicioId: string
}>()

const store = useAppStore()

const modalOpen = ref(false)
const draftStars = ref(5)
const draftMessage = ref('')
const formError = ref('')
const sending = ref(false)

const isCatalogServicio = computed(
  () =>
    store.selectedServicioId != null
    && store.selectedServicio != null
    && String(store.selectedServicioId) === String(props.servicioId),
)

const listaResenas = computed(() => {
  const r = store.selectedServicio?.resenas
  return Array.isArray(r) ? r : []
})

const mediaText = computed(() => {
  const v = store.selectedServicio?.valoracion
  if (v == null) return ''
  return `Media ${Number(v).toFixed(1)} / 5`
})

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function onTapEscribir() {
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  formError.value = ''
}

function irPerfil() {
  closeModal()
  store.setCurrentView('perfil')
}

async function enviar() {
  formError.value = ''
  const msg = draftMessage.value.trim()
  if (!msg) return
  sending.value = true
  try {
    await serviciosApi.postResena(String(props.servicioId), {
      mensaje: msg,
      puntuacion: draftStars.value,
    })
    await store.refreshSelectedServicio()
    draftMessage.value = ''
    draftStars.value = 5
    closeModal()
  } catch (e) {
    formError.value = apiErrorMessage(e, 'No se pudo publicar la reseña.')
  } finally {
    sending.value = false
  }
}

watch(modalOpen, (open) => {
  if (open) {
    draftStars.value = 5
    formError.value = ''
  }
})

watch(isCatalogServicio, () => closeModal())
</script>
