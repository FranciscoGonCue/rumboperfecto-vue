import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

export function useAuth() {
  const store = useAppStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      // Simulación de API call - reemplazar con tu backend real
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email && password.length >= 6) {
        store.login(email, password)
        return true
      } else {
        error.value = 'Credenciales inválidas'
        return false
      }
    } catch (e) {
      error.value = 'Error al iniciar sesión'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(email: string, password: string, name: string) {
    isLoading.value = true
    error.value = null

    try {
      // Simulación de API call - reemplazar con tu backend real
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email && password.length >= 6 && name) {
        store.user.name = name
        store.login(email, password)
        return true
      } else {
        error.value = 'Datos inválidos'
        return false
      }
    } catch (e) {
      error.value = 'Error al registrarse'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    store.logout()
  }

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: () => store.isAuthenticated
  }
}
