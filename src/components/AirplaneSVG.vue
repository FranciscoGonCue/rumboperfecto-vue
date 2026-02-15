<template>
  <svg viewBox="0 0 100 100" :class="props.className" fill="white">
    <!-- Body -->
    <path d="M20 50 Q 50 40 80 50 Q 50 60 20 50" />
    <!-- Wings -->
    <path d="M45 46 L 40 25 L 55 43 Z" />
    <!-- Bottom Wing -->
    <path d="M45 54 L 40 75 L 55 57 Z" />
    <!-- Tail -->
    <path d="M20 50 L 10 35 L 15 50 L 10 65 Z" />
    <!-- Windows -->
    <circle cx="55" cy="49" r="1" fill="#FF7F50" />
    <circle cx="62" cy="49.5" r="1" fill="#FF7F50" />
    <circle cx="69" cy="50" r="1" fill="#FF7F50" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})
</script>
