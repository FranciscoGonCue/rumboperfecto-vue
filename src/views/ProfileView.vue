<template>
  <div class="min-h-full flex items-center justify-center p-6">
    <!-- Not Authenticated -->
    <div v-if="!store.isAuthenticated" class="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-md w-full border border-orange-50">
      <div class="w-32 h-32 rounded-full bg-orange-50 mx-auto mb-6 p-1 border-4 border-rumbo-orange shadow-xl flex items-center justify-center">
        <User :size="64" class="text-rumbo-orange" />
      </div>

      <h2 class="text-3xl font-black text-gray-800 uppercase tracking-tight mb-2">Bienvenido</h2>
      <p class="text-gray-500 mb-8">Inicia sesión para acceder a tu perfil</p>

      <Transition name="fade" mode="out-in">
        <form v-if="!showRegister" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <input
              v-model="loginForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
              placeholder="Contraseña"
            />
          </div>

          <div v-if="auth.error.value" class="p-3 bg-red-50 rounded-xl">
            <p class="text-sm text-red-600 font-bold">{{ auth.error.value }}</p>
          </div>

          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="w-full bg-rumbo-orange text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!auth.isLoading.value">Iniciar Sesión</span>
            <span v-else>Cargando...</span>
          </button>

          <button
            type="button"
            class="w-full text-gray-600 hover:text-rumbo-orange transition-colors text-sm font-bold"
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
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rumbo-orange focus:outline-none transition-colors"
              placeholder="Contraseña (mín. 6 caracteres)"
            />
          </div>

          <div v-if="auth.error.value" class="p-3 bg-red-50 rounded-xl">
            <p class="text-sm text-red-600 font-bold">{{ auth.error.value }}</p>
          </div>

          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="w-full bg-rumbo-orange text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!auth.isLoading.value">Registrarse</span>
            <span v-else>Cargando...</span>
          </button>

          <button
            type="button"
            class="w-full text-gray-600 hover:text-rumbo-orange transition-colors text-sm font-bold"
            @click="showRegister = false"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </Transition>
    </div>

    <!-- Authenticated -->
    <div v-else class="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-md w-full border border-orange-50">
      <div class="w-32 h-32 rounded-full bg-orange-50 mx-auto mb-6 p-1 border-4 border-rumbo-orange shadow-xl overflow-hidden">
        <img :src="store.user.avatar" class="w-full h-full object-cover" alt="profile" />
      </div>
      
      <h2 class="text-3xl font-black text-gray-800 uppercase tracking-tight">{{ store.user.name }}</h2>
      <p class="text-rumbo-orange font-bold mt-1 tracking-wider">VIAJERO DIAMANTE</p>

      <div class="grid grid-cols-2 gap-4 mt-10">
        <div class="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p class="text-rumbo-orange text-3xl font-black">{{ store.tripCount }}</p>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Viajes</p>
        </div>
        <div class="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p class="text-rumbo-orange text-3xl font-black">{{ destinationsCount }}</p>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Destinos</p>
        </div>
      </div>

      <button
        class="w-full mt-8 py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl border border-gray-100 hover:bg-orange-50 hover:text-rumbo-orange transition-colors"
      >
        Editar Perfil
      </button>

      <button
        class="w-full mt-4 py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
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

const store = useAppStore()
const auth = useAuth()

const showRegister = ref(false)
const destinationsCount = computed(() => {
  // Count unique destinations based on trip titles
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

function handleLogout() {
  auth.logout()
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
</style>
