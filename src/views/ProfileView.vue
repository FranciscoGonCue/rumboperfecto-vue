<template>
  <div class="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden transition-colors duration-300"
       :class="store.isDark
         ? 'bg-rp-bg'
         : 'bg-gradient-to-br from-gray-50 via-white to-orange-50'">

    <ParticleBackground :is-dark="store.isDark" />

    <div v-if="store.isDark" class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
           style="background: radial-gradient(circle, #f97316 0%, transparent 70%);"></div>
    </div>

    <div class="relative z-10 p-10 rounded-[40px] text-center max-w-md w-full transition-colors duration-300"
         :class="store.isDark
           ? 'bg-rp-surface border border-rp-border shadow-[0_24px_64px_rgba(0,0,0,0.6)]'
           : 'bg-white/95 backdrop-blur-sm border border-orange-50 shadow-2xl'">

      <div class="relative w-28 h-28 mx-auto mb-6">
        <div class="absolute inset-0 rounded-full animate-pulse-slow"
             :style="store.isDark ? 'box-shadow: 0 0 24px rgba(249,115,22,0.25)' : ''"></div>
        <div class="w-28 h-28 rounded-full overflow-hidden border-2 border-rp-accent/40 shadow-xl">
          <img :src="store.user.avatar" class="w-full h-full object-cover" alt="profile" />
        </div>
      </div>

      <h2 class="text-2xl font-black uppercase tracking-tight"
          :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
          style="font-family: 'Syne', sans-serif;">{{ store.user.name }}</h2>
      <p class="text-rp-accent font-bold mt-1 tracking-widest text-xs uppercase">
        {{ store.user.seller ? 'VENDEDOR' : 'VIAJERO DIAMANTE' }}
      </p>
      <p class="text-sm mt-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
        {{ store.user.email }}
      </p>

      <div class="grid grid-cols-2 gap-3 mt-8">
        <div class="p-5 rounded-2xl transition-colors"
             :class="store.isDark
               ? 'bg-rp-surface-2 border border-rp-border'
               : 'bg-orange-50 border border-orange-100'">
          <p class="text-rp-accent text-3xl font-black">{{ store.tripCount }}</p>
          <p class="text-[10px] font-bold uppercase tracking-widest mt-1"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Viajes</p>
        </div>
        <div class="p-5 rounded-2xl transition-colors"
             :class="store.isDark
               ? 'bg-rp-surface-2 border border-rp-border'
               : 'bg-orange-50 border border-orange-100'">
          <p class="text-rp-accent text-3xl font-black">{{ destinationsCount }}</p>
          <p class="text-[10px] font-bold uppercase tracking-widest mt-1"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">Destinos</p>
        </div>
      </div>

      <button
        class="w-full mt-6 py-3.5 font-bold rounded-2xl border transition-colors text-sm"
        :class="store.isDark
          ? 'bg-transparent border-rp-border text-rp-muted hover:border-rp-accent/40 hover:text-rp-accent'
          : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-orange-50 hover:text-rp-accent'"
        @click="openModal"
      >
        Editar Perfil
      </button>

      <button
        class="w-full mt-3 py-3.5 font-bold rounded-2xl border transition-colors text-sm"
        :class="store.isDark
          ? 'bg-red-950/30 border-red-800/40 text-red-400 hover:bg-red-950/50'
          : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'"
        @click="handleLogout"
      >
        Cerrar Sesión
      </button>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal" />

        <div
          class="relative w-full max-w-md rounded-[32px] p-8 transition-colors duration-300 max-h-[90vh] overflow-y-auto"
          :class="store.isDark
            ? 'bg-rp-surface border border-rp-border shadow-[0_32px_80px_rgba(0,0,0,0.8)]'
            : 'bg-white border border-orange-50 shadow-2xl'"
        >
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-black uppercase tracking-tight"
                :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
                style="font-family: 'Syne', sans-serif;">
              Editar Perfil
            </h3>
            <button
              class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors text-lg font-bold"
              :class="store.isDark
                ? 'bg-rp-surface-2 text-rp-muted hover:text-rp-text'
                : 'bg-gray-100 text-gray-400 hover:text-gray-700'"
              @click="closeModal"
            >✕</button>
          </div>

          <Transition name="fade">
            <div
              v-if="successMessage"
              class="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold"
              :class="store.isDark
                ? 'bg-green-900/30 border border-green-700/40 text-green-400'
                : 'bg-green-50 border border-green-200 text-green-700'"
            >
              {{ successMessage }}
            </div>
          </Transition>

          <Transition name="fade">
            <div
              v-if="errorMessage"
              class="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold"
              :class="store.isDark
                ? 'bg-red-900/30 border border-red-700/40 text-red-400'
                : 'bg-red-50 border border-red-200 text-red-700'"
            >
              {{ errorMessage }}
            </div>
          </Transition>

          <p class="text-[10px] font-bold uppercase tracking-widest mb-3"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
            Información Personal
          </p>

          <div class="space-y-3 mb-6">
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Nombre completo
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Tu nombre"
                class="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/50'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-orange-300'"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Correo electrónico
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="tu@email.com"
                class="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/50'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-orange-300'"
              />
            </div>
          </div>

          <p class="text-[10px] font-bold uppercase tracking-widest mb-3"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
            Tipo de Cuenta
          </p>

          <div
            class="flex items-center justify-between px-4 py-4 rounded-2xl mb-6 transition-colors"
            :class="store.isDark
              ? 'bg-rp-surface-2 border border-rp-border'
              : 'bg-gray-50 border border-gray-200'"
          >
            <div>
              <p class="text-sm font-bold" :class="store.isDark ? 'text-rp-text' : 'text-gray-700'">
                Cuenta Vendedor
              </p>
              <p class="text-xs mt-0.5" :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
                Activa el panel de gestión de servicios
              </p>
            </div>
            <button
              type="button"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50"
              :class="form.seller ? 'bg-rp-accent' : (store.isDark ? 'bg-rp-border' : 'bg-gray-300')"
              :disabled="savingSeller"
              @click="form.seller = !form.seller; handleToggleSeller()"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                :class="form.seller ? 'translate-x-6' : 'translate-x-0'"
              />
            </button>
          </div>

          <button
            class="w-full py-3.5 font-bold rounded-2xl transition-colors text-sm mb-6"
            :class="store.isDark
              ? 'bg-rp-accent text-white hover:bg-orange-500 disabled:opacity-40'
              : 'bg-rp-accent text-white hover:bg-orange-500 disabled:opacity-40'"
            :disabled="savingProfile"
            @click="handleSaveProfile"
          >
            <span v-if="savingProfile">Guardando…</span>
            <span v-else>Guardar Cambios</span>
          </button>

          <div class="border-t mb-6" :class="store.isDark ? 'border-rp-border' : 'border-gray-100'" />

          <p class="text-[10px] font-bold uppercase tracking-widest mb-3"
             :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
            Cambiar Contraseña
          </p>

          <div class="space-y-3 mb-4">
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Contraseña actual
              </label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="••••••••"
                class="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/50'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-orange-300'"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Nueva contraseña
              </label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                class="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-colors"
                :class="store.isDark
                  ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/50'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-orange-300'"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
                Confirmar contraseña
              </label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Repite la nueva contraseña"
                class="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-colors"
                :class="[
                  store.isDark
                    ? 'bg-rp-surface-2 border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/50'
                    : 'bg-gray-50 border text-gray-800 placeholder:text-gray-400 focus:border-orange-300',
                  passwordMismatch
                    ? (store.isDark ? 'border-red-700' : 'border-red-400')
                    : (store.isDark ? 'border-rp-border' : 'border-gray-200')
                ]"
              />
              <p v-if="passwordMismatch" class="text-xs text-red-400 mt-1 ml-1">
                Las contraseñas no coinciden
              </p>
            </div>
          </div>

          <button
            class="w-full py-3.5 font-bold rounded-2xl border transition-colors text-sm"
            :class="store.isDark
              ? 'bg-transparent border-rp-border text-rp-muted hover:border-rp-accent/40 hover:text-rp-accent disabled:opacity-30'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-orange-50 hover:text-rp-accent disabled:opacity-30'"
            :disabled="savingPassword || !canSavePassword"
            @click="handleChangePassword"
          >
            <span v-if="savingPassword">Cambiando…</span>
            <span v-else>Cambiar Contraseña</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuth } from '@/composables/useAuth'
import ParticleBackground from '@/components/ParticleBackground.vue'

const store = useAppStore()
const { logout } = useAuth()

const destinationsCount = computed(() => {
  return store.trips.length > 0 ? Math.min(store.trips.length * 2, 50) : 0
})

async function handleLogout() {
  await logout()
}
  
const showModal = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const savingSeller = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  seller: false,
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordMismatch = computed(() =>
  passwordForm.confirmPassword.length > 0 &&
  passwordForm.newPassword !== passwordForm.confirmPassword,
)

const canSavePassword = computed(() =>
  passwordForm.oldPassword.length > 0 &&
  passwordForm.newPassword.length >= 6 &&
  !passwordMismatch.value,
)

function openModal() {
  form.name = store.user.name
  form.email = store.user.email
  form.seller = store.user.seller
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  successMessage.value = ''
  errorMessage.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function showSuccess(msg: string) {
  successMessage.value = msg
  errorMessage.value = ''
  setTimeout(() => { successMessage.value = '' }, 3000)
}

function showError(msg: string) {
  errorMessage.value = msg
  successMessage.value = ''
}

async function handleToggleSeller() {
  savingSeller.value = true
  errorMessage.value = ''
  try {
    await store.updateSeller(form.seller)
    showSuccess(form.seller ? 'Cuenta cambiada a Vendedor.' : 'Cuenta cambiada a Viajero.')
  } catch {
    form.seller = !form.seller
    showError(store.networkError ?? 'No se pudo cambiar el tipo de cuenta.')
  } finally {
    savingSeller.value = false
  }
}

async function handleSaveProfile() {
  savingProfile.value = true
  errorMessage.value = ''
  try {
    await store.updateProfile({
      name: form.name.trim() || undefined,
      email: form.email.trim() || undefined,
    })
    showSuccess('Perfil actualizado correctamente.')
  } catch {
    showError(store.networkError ?? 'No se pudo actualizar el perfil.')
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  if (!canSavePassword.value) return
  savingPassword.value = true
  errorMessage.value = ''
  try {
    await store.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showSuccess('Contraseña cambiada correctamente.')
  } catch {
    showError(store.networkError ?? 'No se pudo cambiar la contraseña.')
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative {
  transform: scale(0.96) translateY(8px);
}
.modal-leave-to .relative {
  transform: scale(0.96) translateY(8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.rp-input {
  font-family: inherit;
}

.bg-rp-bg        { background-color: var(--rp-bg); }
.bg-rp-surface   { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.border-rp-border { border-color: var(--rp-border); }
.text-rp-text    { color: var(--rp-text); }
.text-rp-muted   { color: var(--rp-muted); }
.text-rp-accent  { color: var(--rp-accent); }
.bg-rp-accent    { background-color: var(--rp-accent); }
.hover\:bg-orange-500:hover { background-color: #f97316; }
.border-rp-accent\/40  { border-color: rgba(249,115,22,0.4); }
.border-rp-accent\/50  { border-color: rgba(249,115,22,0.5); }
.hover\:border-rp-accent\/40:hover { border-color: rgba(249,115,22,0.4); }
.hover\:text-rp-accent:hover { color: var(--rp-accent); }
.focus\:border-rp-accent\/50:focus { border-color: rgba(249,115,22,0.5); }

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.04); }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>
