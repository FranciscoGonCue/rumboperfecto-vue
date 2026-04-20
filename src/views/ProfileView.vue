<template>
  <div class="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden transition-colors duration-300"
       :class="store.isDark
         ? 'bg-rp-bg'
         : 'bg-gradient-to-br from-gray-50 via-white to-orange-50'">

    <!-- Animated Background -->
    <ParticleBackground :is-dark="store.isDark" />

    <!-- Ambient glow effect dark mode -->
    <div v-if="store.isDark" class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
           style="background: radial-gradient(circle, #f97316 0%, transparent 70%);"></div>
    </div>

    <!-- Not Authenticated -->
    <div v-if="!store.isAuthenticated"
         class="relative z-10 p-10 rounded-[40px] text-center max-w-md w-full transition-colors duration-300"
         :class="store.isDark
           ? 'bg-rp-surface border border-rp-border shadow-[0_24px_64px_rgba(0,0,0,0.6)]'
           : 'bg-white/95 backdrop-blur-sm border border-orange-50 shadow-2xl'">

      <div class="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-rp-accent/40 shadow-lg shadow-orange-900/20"
           :class="store.isDark ? 'bg-rp-surface-2' : 'bg-orange-50'">
        <User :size="56" class="text-rp-accent" />
      </div>

      <h2 class="text-3xl font-black uppercase tracking-tight mb-1"
          :class="store.isDark ? 'text-rp-text' : 'text-gray-800'"
          style="font-family: 'Syne', sans-serif;">Bienvenido</h2>
      <p class="mb-8 text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
        Inicia sesión para acceder a tu perfil
      </p>

      <Transition name="fade" mode="out-in">
        <form v-if="!showRegister" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <input
              v-model="loginForm.email"
              type="email"
              required
              class="rp-input w-full px-4 py-3 rounded-2xl focus:outline-none transition-all"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/60'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-rumbo-orange focus:bg-white'"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="rp-input w-full px-4 py-3 rounded-2xl focus:outline-none transition-all"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/60'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-rumbo-orange focus:bg-white'"
              placeholder="Contraseña"
            />
          </div>

          <div v-if="auth.error.value" class="p-3 rounded-xl"
               :class="store.isDark ? 'bg-red-950/50 border border-red-800/50' : 'bg-red-50'">
            <p class="text-sm text-red-400 font-bold">{{ auth.error.value }}</p>
          </div>

          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="w-full py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :class="store.isDark
              ? 'bg-rp-accent text-white hover:bg-orange-500 shadow-orange-900/40 hover:shadow-orange-900/60'
              : 'bg-rumbo-orange text-white hover:bg-orange-600 shadow-orange-200'"
          >
            <span v-if="!auth.isLoading.value">Iniciar Sesión</span>
            <span v-else>Cargando...</span>
          </button>

          <button
            type="button"
            class="w-full text-sm font-bold transition-colors"
            :class="store.isDark ? 'text-rp-muted hover:text-rp-accent' : 'text-gray-600 hover:text-rumbo-orange'"
            @click="showRegister = true"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>

        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <input
              v-model="registerForm.name"
              type="text"
              required
              class="rp-input w-full px-4 py-3 rounded-2xl focus:outline-none transition-all"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/60'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-rumbo-orange focus:bg-white'"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="rp-input w-full px-4 py-3 rounded-2xl focus:outline-none transition-all"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/60'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-rumbo-orange focus:bg-white'"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              class="rp-input w-full px-4 py-3 rounded-2xl focus:outline-none transition-all"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder:text-rp-muted focus:border-rp-accent/60'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-rumbo-orange focus:bg-white'"
              placeholder="Contraseña (mín. 6 caracteres)"
            />
          </div>

          <div v-if="auth.error.value" class="p-3 rounded-xl"
               :class="store.isDark ? 'bg-red-950/50 border border-red-800/50' : 'bg-red-50'">
            <p class="text-sm text-red-400 font-bold">{{ auth.error.value }}</p>
          </div>

          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="w-full py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :class="store.isDark
              ? 'bg-rp-accent text-white hover:bg-orange-500 shadow-orange-900/40'
              : 'bg-rumbo-orange text-white hover:bg-orange-600 shadow-orange-200'"
          >
            <span v-if="!auth.isLoading.value">Registrarse</span>
            <span v-else>Cargando...</span>
          </button>

          <button
            type="button"
            class="w-full text-sm font-bold transition-colors"
            :class="store.isDark ? 'text-rp-muted hover:text-rp-accent' : 'text-gray-600 hover:text-rumbo-orange'"
            @click="showRegister = false"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </Transition>
    </div>

    <!-- Authenticated -->
    <div v-else
         class="relative z-10 p-10 rounded-[40px] text-center max-w-md w-full transition-colors duration-300"
         :class="store.isDark
           ? 'bg-rp-surface border border-rp-border shadow-[0_24px_64px_rgba(0,0,0,0.6)]'
           : 'bg-white/95 backdrop-blur-sm border border-orange-50 shadow-2xl'">

      <!-- Avatar ring with glow -->
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
      <p class="text-rp-accent font-bold mt-1 tracking-widest text-xs uppercase">VIAJERO DIAMANTE</p>

      <!-- Stats -->
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
          : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-orange-50 hover:text-rumbo-orange'"
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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuth } from '@/composables/useAuth'
import { User } from 'lucide-vue-next'
import ParticleBackground from '@/components/ParticleBackground.vue'

const store = useAppStore()
const auth = useAuth()

const showRegister = ref(false)
const destinationsCount = computed(() => {
  return store.trips.length > 0 ? Math.min(store.trips.length * 2, 50) : 0
})

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: ''
})

async function handleLogin() {
  const success = await auth.login(loginForm.email, loginForm.password)
  if (success) {
    loginForm.email = ''
    loginForm.password = ''
  }
}

async function handleRegister() {
  const success = await auth.register(
    registerForm.email,
    registerForm.password,
    registerForm.name
  )
  if (success) {
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    showRegister.value = false
  }
}

async function handleLogout() {
  await auth.logout()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.rp-input {
  font-family: inherit;
}

.bg-rp-bg { background-color: var(--rp-bg); }
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.border-rp-border { border-color: var(--rp-border); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.bg-rp-accent { background-color: var(--rp-accent); }
.border-rp-accent\/40 { border-color: rgba(249,115,22,0.4); }
.border-rp-accent\/60 { border-color: rgba(249,115,22,0.6); }
.hover\:border-rp-accent\/40:hover { border-color: rgba(249,115,22,0.4); }
.hover\:text-rp-accent:hover { color: var(--rp-accent); }
.shadow-orange-900\/20 { --tw-shadow-color: rgba(124,45,18,0.2); }
.shadow-orange-900\/40 { --tw-shadow-color: rgba(124,45,18,0.4); }
.shadow-orange-900\/60 { --tw-shadow-color: rgba(124,45,18,0.6); }

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>
