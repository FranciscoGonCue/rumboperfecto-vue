<template>
  <div class="tasks-container">
    <h1>Mis Tareas</h1>

    <!-- Mostrar tareas -->
    <div v-if="tasks.length > 0" class="tasks-list">
      <div v-for="task in tasks" :key="task.id" class="task-item">
        <h3>{{ task.titulo }}</h3>
        <p>{{ task.descripcion }}</p>
        <button @click="deleteTask(task.id)">Eliminar</button>
      </div>
    </div>

    <!-- Si no hay tareas -->
    <p v-else>No hay tareas aún</p>

    <!-- Formulario para crear tarea -->
    <div class="form-section">
      <h2>Crear nueva tarea</h2>
      <input v-model="newTask.titulo" placeholder="Título" />
      <input v-model="newTask.descripcion" placeholder="Descripción" />
      <button @click="createTask">Agregar tarea</button>
    </div>

    <!-- Mostrar errores -->
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="loading">Cargando...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { tasksAPI } from '@/services/api';

// Variables reactivas
const tasks = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const newTask = ref({
  titulo: '',
  descripcion: ''
});

// Cargar tareas cuando monta el componente
onMounted(async () => {
  await fetchTasks();
});

// Obtener todas las tareas
async function fetchTasks() {
  loading.value = true;
  error.value = '';
  try {
    const response = await tasksAPI.getAll();
    tasks.value = response.data;
    console.log('✅ Tareas cargadas:', response.data);
  } catch (err: any) {
    error.value = `Error al cargar tareas: ${err.message}`;
    console.error('❌ Error:', err);
  } finally {
    loading.value = false;
  }
}

// Crear nueva tarea
async function createTask() {
  if (!newTask.value.titulo.trim()) {
    alert('El título es obligatorio');
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const response = await tasksAPI.create(newTask.value);
    console.log('✅ Tarea creada:', response.data);
    tasks.value.push(response.data);
    newTask.value = { titulo: '', descripcion: '' }; // Limpiar formulario
  } catch (err: any) {
    error.value = `Error al crear tarea: ${err.message}`;
    console.error('❌ Error:', err);
  } finally {
    loading.value = false;
  }
}

// Eliminar tarea
async function deleteTask(id: number) {
  if (!confirm('¿Estás seguro?')) return;

  loading.value = true;
  error.value = '';
  try {
    await tasksAPI.delete(id);
    console.log('✅ Tarea eliminada');
    tasks.value = tasks.value.filter(t => t.id !== id);
  } catch (err: any) {
    error.value = `Error al eliminar tarea: ${err.message}`;
    console.error('❌ Error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.tasks-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.tasks-list {
  margin: 20px 0;
}

.task-item {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.form-section {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
}

input {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  padding: 8px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
}

.loading {
  color: blue;
  margin-top: 10px;
}
</style>
