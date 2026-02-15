<template>
  <Transition
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  >
    <div
      v-if="props.isVisible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-rumbo-orange"
    >
      <!-- Animated Plane -->
      <div
        ref="planeRef"
        class="w-48 h-48 drop-shadow-[0_25px_30px_rgba(0,0,0,0.3)]"
        :style="planeStyle"
      >
        <AirplaneSVG />
      </div>

      <!-- Slogan -->
      <div
        class="absolute bottom-24 flex flex-col items-center space-y-2"
        :style="sloganStyle"
      >
        <div class="text-white font-black text-4xl tracking-tighter uppercase italic leading-none">
          RUMBO
        </div>
        <div class="text-white/80 font-bold text-lg tracking-[0.5em] uppercase ml-1">
          PERFECTO
        </div>
        <div class="w-12 h-1 bg-white/30 rounded-full mt-4" />
      </div>

      <!-- Subtle Clouds Background -->
      <div class="absolute inset-0 pointer-events-none opacity-20">
        <div class="absolute top-1/4 left-1/4 w-32 h-12 bg-white rounded-full blur-2xl animate-pulse" />
        <div
          class="absolute top-2/3 right-1/4 w-48 h-16 bg-white rounded-full blur-3xl animate-pulse"
          style="animation-delay: 1s"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AirplaneSVG from './AirplaneSVG.vue'

interface Props {
  isVisible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  complete: []
}>()

const planeRef = ref<HTMLElement>()
const animationProgress = ref(0)
const sloganOpacity = ref(0)

const planeStyle = computed(() => {
  const progress = animationProgress.value
  const x = -130 + (260 * progress) // From -130vw to 130vw
  const y = [0, -50, 40, -40, 0]
  const rotate = [0, -8, 4, -4, 0]
  
  const yIndex = Math.min(Math.floor(progress * 4), 3)
  const yProgress = (progress * 4) % 1
  const currentY = y[yIndex] + (y[yIndex + 1] - y[yIndex]) * yProgress
  const currentRotate = rotate[yIndex] + (rotate[yIndex + 1] - rotate[yIndex]) * yProgress

  return {
    transform: `translateX(${x}vw) translateY(${currentY}px) rotate(${currentRotate}deg)`,
    transition: 'transform 0.05s linear'
  }
})

const sloganStyle = computed(() => ({
  opacity: sloganOpacity.value,
  transform: `translateY(${40 - sloganOpacity.value * 40}px)`,
  transition: 'all 1.2s ease-out'
}))

onMounted(() => {
  let startTime: number | null = null
  const duration = 5500 // 5.5 seconds

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)

    animationProgress.value = progress

    // Show slogan after 1.5s
    if (elapsed > 1500) {
      sloganOpacity.value = Math.min((elapsed - 1500) / 1200, 1)
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      setTimeout(() => {
        emit('complete')
      }, 300)
    }
  }

  requestAnimationFrame(animate)
})

function onBeforeLeave(el: Element) {
  (el as HTMLElement).style.opacity = '1'
}

function onLeave(el: Element, done: () => void) {
  const element = el as HTMLElement
  element.style.transition = 'opacity 1s ease-in-out'
  element.style.opacity = '0'
  setTimeout(done, 1000)
}
</script>
