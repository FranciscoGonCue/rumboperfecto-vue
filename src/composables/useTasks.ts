import { ref } from 'vue'
import apiService from '@/services/api'

export function useTasks() {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTasks = async () => {
    loading.value = true
    error.value = null
    try {
      tasks.value = await apiService.get('/tasks/')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: any) => {
    loading.value = true
    error.value = null
    try {
      const newTask = await apiService.post('/tasks/', taskData)
      tasks.value.push(newTask)
      return newTask
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, taskData: any) => {
    loading.value = true
    error.value = null
    try {
      const updated = await apiService.put(`/tasks/${id}/`, taskData)
      const index = tasks.value.findIndex((t: any) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await apiService.delete(`/tasks/${id}/`)
      tasks.value = tasks.value.filter((t: any) => t.id !== id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
