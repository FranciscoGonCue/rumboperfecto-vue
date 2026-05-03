<template>
  <div class="min-h-screen flex items-center justify-center p-4" :class="store.isDark ? 'bg-rp-bg' : 'bg-white'">
    <!-- Particle Background -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <ParticleBackground v-if="!store.isDark" :is-dark="store.isDark" />
    </div>

    <!-- Animated Gradient Background (Dark Mode) -->
    <div
      v-if="store.isDark"
      class="absolute inset-0 -z-10 overflow-hidden"
    >
      <div class="absolute -inset-1/2 bg-gradient-to-r from-orange-600/20 via-transparent to-purple-600/20 blur-3xl animate-pulse" />
    </div>

    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-rp-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-900/40">
          <Plane :size="32" class="text-white" />
        </div>
        <h1 class="text-3xl font-black text-rp-accent uppercase tracking-tight mb-2">
          RumboPerfecto
        </h1>
        <p class="text-sm font-bold uppercase tracking-widest" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
          Travel Planner
        </p>
      </div>

      <!-- Auth Form Container -->
      <div
        class="rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 shadow-2xl"
        :class="store.isDark
          ? 'bg-rp-surface/90 border border-rp-border'
          : 'bg-white/80 border border-orange-100 shadow-orange-200/50'"
      >
        <!-- Login Form -->
        <div v-if="!isRegister">
          <h2 class="text-2xl font-black uppercase tracking-tight mb-2" :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
            Iniciar Sesión
          </h2>
          <p class="text-sm mb-6" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
            Bienvenido de vuelta. Ingresa tus credenciales.
          </p>

          <!-- Error Message -->
          <Transition name="fade">
            <div
              v-if="authError"
              class="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3"
            >
              <AlertCircle :size="20" class="text-red-500 mt-0.5 flex-shrink-0" />
              <p class="text-sm text-red-500 font-semibold">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Email Input -->
          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
              Correo Electrónico
            </label>
            <input
              v-model="loginForm.email"
              type="email"
              :disabled="isLoading"
              placeholder="tu@email.com"
              class="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder-rp-muted focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-rp-accent/20'
                : 'bg-orange-50 border border-orange-200 text-gray-900 placeholder-gray-500 focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-orange-300/50'"
            />
          </div>

          <!-- Password Input -->
          <div class="mb-6">
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
              Contraseña
            </label>
            <input
              v-model="loginForm.password"
              type="password"
              :disabled="isLoading"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder-rp-muted focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-rp-accent/20'
                : 'bg-orange-50 border border-orange-200 text-gray-900 placeholder-gray-500 focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-orange-300/50'"
            />
          </div>

          <!-- Login Button -->
          <button
            @click="handleLogin"
            :disabled="isLoading || !loginForm.email || !loginForm.password"
            class="w-full py-3 rounded-xl font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-rp-accent hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-900/40"
          >
            <Loader2 v-if="isLoading" :size="20" class="inline mr-2 animate-spin" />
            {{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
          </button>

          <!-- Divider -->
          <div class="flex items-center space-x-3 my-6">
            <div class="flex-1 h-px" :class="store.isDark ? 'bg-rp-border' : 'bg-orange-200'" />
            <span class="text-xs font-bold uppercase" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">O</span>
            <div class="flex-1 h-px" :class="store.isDark ? 'bg-rp-border' : 'bg-orange-200'" />
          </div>

          <!-- Register Link -->
          <p class="text-center text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
            ¿No tienes cuenta?
            <button
              @click="isRegister = true"
              class="font-black text-rp-accent hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        <!-- Register Form -->
        <div v-else>
          <h2 class="text-2xl font-black uppercase tracking-tight mb-2" :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">
            Crear Cuenta
          </h2>
          <p class="text-sm mb-6" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
            Únete a RumboPerfecto y comienza a planificar tus viajes.
          </p>

          <!-- Error Message -->
          <Transition name="fade">
            <div
              v-if="authError"
              class="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3"
            >
              <AlertCircle :size="20" class="text-red-500 mt-0.5 flex-shrink-0" />
              <p class="text-sm text-red-500 font-semibold">{{ authError }}</p>
            </div>
          </Transition>

          <!-- Name Input -->
          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
              Nombre Completo
            </label>
            <input
              v-model="registerForm.name"
              type="text"
              :disabled="isLoading"
              placeholder="Tu nombre"
              class="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder-rp-muted focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-rp-accent/20'
                : 'bg-orange-50 border border-orange-200 text-gray-900 placeholder-gray-500 focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-orange-300/50'"
            />
          </div>

          <!-- Seller Toggle -->
          <div class="mb-4 flex items-center justify-between gap-4 rounded-xl px-4 py-3 border"
               :class="store.isDark ? 'border-rp-border bg-rp-surface-2/80' : 'border-orange-200 bg-orange-50'">
            <div>
              <p class="text-sm font-bold" :class="store.isDark ? 'text-rp-text' : 'text-gray-900'">Vendedor</p>
              <p class="text-xs" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">Activa esta opción si vas a ofrecer servicios.</p>
            </div>
            <input v-model="registerForm.seller" type="checkbox" :disabled="isLoading" class="h-5 w-5 accent-orange-500" />
          </div>

          <!-- Email Input -->
          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
              Correo Electrónico
            </label>
            <input
              v-model="registerForm.email"
              type="email"
              :disabled="isLoading"
              placeholder="tu@email.com"
              class="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder-rp-muted focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-rp-accent/20'
                : 'bg-orange-50 border border-orange-200 text-gray-900 placeholder-gray-500 focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-orange-300/50'"
            />
          </div>

          <!-- Password Input -->
          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
              Contraseña
            </label>
            <input
              v-model="registerForm.password"
              type="password"
              :disabled="isLoading"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder-rp-muted focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-rp-accent/20'
                : 'bg-orange-50 border border-orange-200 text-gray-900 placeholder-gray-500 focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-orange-300/50'"
            />
          </div>

          <!-- Password Confirm Input -->
          <div class="mb-6">
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" :class="store.isDark ? 'text-rp-muted' : 'text-gray-700'">
              Confirmar Contraseña
            </label>
            <input
              v-model="registerForm.passwordConfirm"
              type="password"
              :disabled="isLoading"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              :class="store.isDark
                ? 'bg-rp-surface-2 border border-rp-border text-rp-text placeholder-rp-muted focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-rp-accent/20'
                : 'bg-orange-50 border border-orange-200 text-gray-900 placeholder-gray-500 focus:border-rp-accent focus:outline-none focus:ring-2 focus:ring-orange-300/50'"
            />
          </div>

          <!-- Password Mismatch Error -->
          <Transition name="fade">
            <p v-if="registerForm.password !== registerForm.passwordConfirm && registerForm.passwordConfirm" class="text-xs text-red-500 font-semibold mb-4">
              Las contraseñas no coinciden.
            </p>
          </Transition>

          <!-- Register Button -->
          <button
            @click="handleRegister"
            :disabled="isLoading || !registerForm.email || !registerForm.name || !registerForm.password || registerForm.password !== registerForm.passwordConfirm"
            class="w-full py-3 rounded-xl font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-rp-accent hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-900/40"
          >
            <Loader2 v-if="isLoading" :size="20" class="inline mr-2 animate-spin" />
            {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>

          <!-- Divider -->
          <div class="flex items-center space-x-3 my-6">
            <div class="flex-1 h-px" :class="store.isDark ? 'bg-rp-border' : 'bg-orange-200'" />
            <span class="text-xs font-bold uppercase" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">O</span>
            <div class="flex-1 h-px" :class="store.isDark ? 'bg-rp-border' : 'bg-orange-200'" />
          </div>

          <!-- Login Link -->
          <p class="text-center text-sm" :class="store.isDark ? 'text-rp-muted' : 'text-gray-600'">
            ¿Ya tienes cuenta?
            <button
              @click="isRegister = false"
              class="font-black text-rp-accent hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>

      <!-- Footer Text -->
      <p class="text-center text-xs mt-6" :class="store.isDark ? 'text-rp-muted' : 'text-gray-500'">
        Al continuar, aceptas nuestros términos de servicio
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuth } from '@/composables/useAuth'
import { Plane, Loader2, AlertCircle } from 'lucide-vue-next'
import ParticleBackground from '@/components/ParticleBackground.vue'

const store = useAppStore()
const { login, register, isLoading, error } = useAuth()

const isRegister = ref(false)
const authError = ref<string | null>(null)

const loginForm = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  seller: false,
})

async function handleLogin() {
  authError.value = null
  const success = await login(loginForm.value.email, loginForm.value.password)
  if (!success) {
    authError.value = error.value ?? 'Credenciales invalidas. Intenta de nuevo.'
  } else {
    // Success - the store will handle redirecting to the home view
    store.setCurrentView('inicio')
  }
}

async function handleRegister() {
  authError.value = null
  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    authError.value = 'Las contraseñas no coinciden.'
    return
  }
  const success = await register(
    registerForm.value.email,
    registerForm.value.password,
    registerForm.value.name,
    registerForm.value.seller,
  )
  if (!success) {
    authError.value = error.value ?? 'No se pudo crear la cuenta. Intenta de nuevo.'
  } else {
    // Success - the store will handle redirecting to the home view
    store.setCurrentView('inicio')
    isRegister.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
