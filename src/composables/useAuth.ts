import { computed, ref } from 'vue'

import { useAppStore } from '@/stores/app'

function resolveErrorMessage(err: unknown, fallback: string): string {
  const candidate = err as any

  if (candidate?.response?.data?.detail && typeof candidate.response.data.detail === 'string') {
    return candidate.response.data.detail
  }

  if (candidate?.response?.data && typeof candidate.response.data === 'object') {
    const firstEntry = Object.values(candidate.response.data)[0]
    if (Array.isArray(firstEntry) && typeof firstEntry[0] === 'string') {
      return firstEntry[0]
    }
  }

  if (candidate instanceof Error && candidate.message) {
    return candidate.message
  }

  return fallback
}

export function useAuth() {
  const store = useAppStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => store.isAuthenticated)

  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const ok = await store.login(email, password)
      if (!ok) {
        error.value = store.networkError ?? 'Credenciales invalidas.'
      }
      return ok
    } catch (err: unknown) {
      error.value = resolveErrorMessage(err, 'Error al iniciar sesion.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(
    email: string,
    password: string,
    name: string,
    seller = false,
    alojamiento: string[] = [],
    actividad: string[] = [],
    restaurante: string[] = [],
  ): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const ok = await store.register(email, password, name, seller, alojamiento, actividad, restaurante)
      if (!ok) {
        error.value = store.networkError ?? 'No se pudo completar el registro.'
      }
      return ok
    } catch (err: unknown) {
      error.value = resolveErrorMessage(err, 'Error al registrarse.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await store.logout()
    } catch (err: unknown) {
      error.value = resolveErrorMessage(err, 'Error al cerrar sesion.')
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  }
}
