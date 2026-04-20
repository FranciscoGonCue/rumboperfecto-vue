<template>
  <button
    class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all"
    :class="props.active
      ? 'bg-rumbo-orange text-white shadow-lg shadow-orange-200'
      : props.dark
        ? 'text-slate-300 hover:text-rumbo-orange hover:bg-slate-800'
        : 'text-gray-500 hover:text-rumbo-orange hover:bg-orange-50'"
    @click="emit('click')"
  >
    <component :is="props.icon" :size="18" />
    <span class="text-sm uppercase tracking-wider">{{ props.label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  active: boolean
  dark?: boolean
  label: string
  icon: Component
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()
</script>
