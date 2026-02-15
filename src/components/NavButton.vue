<template>
  <button
    class="flex flex-col items-center justify-center space-y-1 w-20 h-full transition-all relative"
    :class="props.isActive ? 'text-rumbo-orange' : 'text-gray-400'"
    @click="emit('click')"
  >
    <div
      class="p-2 rounded-xl transition-all"
      :class="props.isActive ? 'bg-orange-50' : ''"
    >
      <component
        :is="props.icon"
        :size="24"
        :stroke-width="props.isActive ? 2.5 : 2"
      />
    </div>
    <span
      class="text-[9px] font-black uppercase tracking-widest"
      :class="props.isActive ? 'opacity-100' : 'opacity-60'"
    >
      {{ props.label }}
    </span>
    <Transition name="pill">
      <div
        v-if="props.isActive"
        class="absolute -top-1 w-8 h-1 bg-rumbo-orange rounded-full"
      />
    </Transition>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  isActive: boolean
  icon: Component
  label: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()
</script>

<style scoped>
.pill-enter-active,
.pill-leave-active {
  transition: all 0.3s ease;
}

.pill-enter-from,
.pill-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
