<template>
  <div class="relative min-h-screen text-gray-900 overflow-x-visible bg-white">
    <div class="flex flex-col min-h-screen">
      <!-- RESPONSIVE HEADER -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-rumbo-orange rounded-xl flex items-center justify-center text-white shadow-lg rotate-3">
            <Plane :size="22" class="-rotate-12" />
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight text-rumbo-orange uppercase leading-none">
              RumboPerfecto
            </h1>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Travel Planner
            </p>
          </div>
        </div>

        <!-- Desktop Navigation (Top) -->
        <nav class="hidden lg:flex items-center space-x-8">
          <DesktopNavLink
            :active="store.currentView === 'inicio'"
            label="Inicio"
            :icon="Home"
            @click="store.setCurrentView('inicio')"
          />
          <DesktopNavLink
            :active="store.currentView === 'plan'"
            label="Plan"
            :icon="Calendar"
            @click="store.setCurrentView('plan')"
          />
          <DesktopNavLink
            :active="store.currentView === 'perfil'"
            label="Perfil"
            :icon="User"
            @click="store.setCurrentView('perfil')"
          />
        </nav>

        <div class="flex items-center space-x-4">
          <!-- Theme Toggle Button -->
          <ThemeToggle />
          
          <button class="lg:hidden p-2 text-rumbo-orange bg-orange-50 rounded-full">
            <Plus :size="20" />
          </button>
          <div class="w-10 h-10 rounded-full bg-orange-100 overflow-hidden border-2 border-rumbo-orange/20 shadow-inner">
            <img :src="store.user.avatar" alt="avatar" />
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT AREA (sin Transition: evita contenido con opacidad 0 colgada) -->
      <main class="flex-1 w-full max-w-none mx-0 min-h-[50vh]">
        <component :is="currentViewComponent" :key="store.currentView" />
      </main>

      <!-- MOBILE/TABLET BOTTOM NAVIGATION -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6">
        <div class="bg-white/95 backdrop-blur-xl rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-orange-50 flex items-center justify-around h-20 px-2 max-w-md mx-auto">
          <NavButton
            :is-active="store.currentView === 'inicio'"
            :icon="Home"
            label="Inicio"
            @click="store.setCurrentView('inicio')"
          />
          <NavButton
            :is-active="store.currentView === 'plan'"
            :icon="Calendar"
            label="Plan"
            @click="store.setCurrentView('plan')"
          />
          <NavButton
            :is-active="store.currentView === 'perfil'"
            :icon="User"
            label="Perfil"
            @click="store.setCurrentView('perfil')"
          />
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { Home, Calendar, User, Plane, Plus } from 'lucide-vue-next'
import HomeView from '@/views/HomeView.vue'
import PlannerView from '@/views/PlannerView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DesktopNavLink from '@/components/DesktopNavLink.vue'
import NavButton from '@/components/NavButton.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const store = useAppStore()

const currentViewComponent = computed(() => {
  const views = {
    inicio: HomeView,
    plan: PlannerView,
    perfil: ProfileView
  }
  return views[store.currentView] ?? HomeView
})

onMounted(() => {
  store.loadTripsFromStorage()
  store.loadUserFromStorage()
  store.loadThemeFromStorage()
})
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

html.map-expanded header {
  display: none;
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
