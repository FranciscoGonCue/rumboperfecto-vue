<template>
  <div
    class="relative min-h-screen overflow-x-visible transition-colors duration-300"
    :class="store.isDark ? 'bg-rp-bg text-rp-text' : 'bg-white text-gray-900'"
  >
    <!-- Show Auth View when not authenticated -->
    <AuthView v-if="!store.isAuthenticated" />

    <!-- Show Main App when authenticated -->
    <template v-else>
      <SplashScreen :isVisible="showSplash" @complete="showSplash = false" />
      <div class="flex flex-col min-h-screen">
        <!-- RESPONSIVE HEADER -->
        <header
          class="sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300"
          :class="store.isDark
            ? 'bg-rp-surface/95 border-b border-rp-border'
            : 'bg-white/95 border-b border-orange-100 shadow-sm'"
        >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-rp-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-900/30 rotate-3">
            <Plane :size="22" class="-rotate-12" />
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight text-rp-accent uppercase leading-none">
              RumboPerfecto
            </h1>
            <p class="text-[10px] font-bold uppercase tracking-widest mt-1"
               :class="store.isDark ? 'text-rp-muted' : 'text-gray-400'">
              Travel Planner
            </p>
          </div>
        </div>

        <!-- Desktop Navigation (Top) -->
        <nav class="hidden lg:flex items-center space-x-1">
          <DesktopNavLink
            :active="store.currentView === 'inicio'"
            :dark="store.isDark"
            label="Inicio"
            :icon="Home"
            @click="store.setCurrentView('inicio')"
          />
          <DesktopNavLink
            :active="store.currentView === 'plan'"
            :dark="store.isDark"
            label="Plan"
            :icon="Calendar"
            @click="store.setCurrentView('plan')"
          />
          <DesktopNavLink
            v-if="store.user.seller"
            :active="store.currentView === 'gestion'"
            :dark="store.isDark"
            label="Gestión"
            :icon="LayoutGrid"
            @click="store.setCurrentView('gestion')"
          />
          <DesktopNavLink
            :active="store.currentView === 'perfil'"
            :dark="store.isDark"
            label="Perfil"
            :icon="User"
            @click="store.setCurrentView('perfil')"
          />
        </nav>

        <div class="flex items-center space-x-3">
          <ThemeToggle />
          <button
            class="lg:hidden p-2 text-rp-accent rounded-full transition-colors"
            :class="store.isDark ? 'bg-rp-surface-2' : 'bg-orange-50'"
          >
            <Plus :size="20" />
          </button>
          <div
            class="w-9 h-9 rounded-full overflow-hidden border-2 border-rp-accent/30 shadow-inner ring-1 ring-rp-accent/10"
            :class="store.isDark ? 'bg-rp-surface-2' : 'bg-orange-100'"
          >
            <img :src="store.user.avatar" alt="avatar" class="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT AREA -->
      <main class="flex-1 w-full max-w-none mx-0 min-h-[50vh]">
        <AccommodationDetailView
          v-if="store.currentView === 'alojamiento'"
          :key="store.currentView"
        />
        <TransportDetailView
          v-else-if="store.currentView === 'transporte'"
          :key="store.currentView + ':' + (store.selectedTransportId ?? 'default')"
          :transport="selectedTransport"
        />
        <ActivityDetailView
          v-else-if="store.currentView === 'actividad'"
          :key="store.currentView + ':' + (store.selectedActivityId ?? 'default')"
          :activity="selectedActivity"
        />
        <RestaurantDetailView
          v-else-if="store.currentView === 'restaurante'"
          :key="store.currentView + ':' + (store.selectedRestaurantId ?? 'default')"
          :restaurant="selectedRestaurant"
        />
        <component
          v-else
          :is="currentViewComponent"
          :key="store.currentView"
        />
      </main>

      <!-- MOBILE/TABLET BOTTOM NAVIGATION -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-5 pb-5">
        <div
          class="backdrop-blur-xl rounded-[30px] flex items-center justify-around h-[68px] px-2 max-w-md mx-auto transition-colors duration-300"
          :class="store.isDark
            ? 'bg-rp-surface/98 border border-rp-border shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-white/98 border border-orange-50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'"
        >
          <NavButton
            :is-active="store.currentView === 'inicio'"
            :dark="store.isDark"
            :icon="Home"
            label="Inicio"
            @click="store.setCurrentView('inicio')"
          />
          <NavButton
            :is-active="store.currentView === 'plan'"
            :dark="store.isDark"
            :icon="Calendar"
            label="Plan"
            @click="store.setCurrentView('plan')"
          />
          <NavButton
            v-if="store.user.seller"
            :is-active="store.currentView === 'gestion'"
            :dark="store.isDark"
            :icon="LayoutGrid"
            label="Gestión"
            @click="store.setCurrentView('gestion')"
          />
          <NavButton
            :is-active="store.currentView === 'perfil'"
            :dark="store.isDark"
            :icon="User"
            label="Perfil"
            @click="store.setCurrentView('perfil')"
          />
        </div>
      </nav>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { Home, Calendar, User, Plane, Plus, LayoutGrid } from 'lucide-vue-next'
import AuthView from '@/views/AuthView.vue'
import HomeView from '@/views/HomeView.vue'
import PlannerView from '@/views/PlannerView.vue'
import ProfileView from '@/views/ProfileView.vue'
import GestionView from '@/views/GestionView.vue'
import AccommodationDetailView from '@/views/AccommodationDetailView.vue'
import TransportDetailView from '@/views/TransportDetailView.vue'
import ActivityDetailView from '@/views/ActivityDetailView.vue'
import RestaurantDetailView from '@/views/RestaurantDetailView.vue'
import DesktopNavLink from '@/components/DesktopNavLink.vue'
import NavButton from '@/components/NavButton.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import { transportsMock } from '@/mocks/transport'
import { activitiesMock } from '@/mocks/activities'
import { restaurantsMock } from '@/mocks/restaurants'

const store = useAppStore()
const showSplash = ref(true)

const selectedTransport = computed(() => {
  const id = store.selectedTransportId
  return transportsMock.find((t) => t.id === id) ?? transportsMock[0]
})

const selectedActivity = computed(() => {
  const id = store.selectedActivityId
  return activitiesMock.find((a) => a.id === id) ?? activitiesMock[0]
})

const selectedRestaurant = computed(() => {
  const id = store.selectedRestaurantId
  return restaurantsMock.find((r) => r.id === id) ?? restaurantsMock[0]
})

const currentViewComponent = computed(() => {
  if (store.currentView === 'plan') return PlannerView
  if (store.currentView === 'perfil') return ProfileView
  if (store.currentView === 'gestion') return GestionView
  return HomeView
})

watch(
  () => store.user.seller,
  (isSeller) => {
    if (!isSeller && store.currentView === 'gestion') {
      store.setCurrentView('inicio')
    }
  },
)

onMounted(async () => {
  await store.bootstrapSession()
})
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap');

:root {
  --rp-bg: #0a0a0f;
  --rp-surface: #111118;
  --rp-surface-2: #18181f;
  --rp-border: rgba(255,255,255,0.07);
  --rp-text: #e8e8f0;
  --rp-muted: #5a5a70;
  --rp-accent: #f97316;
  --rp-accent-glow: rgba(249,115,22,0.15);
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: 'DM Sans', sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--rp-bg);
}

.bg-rp-bg { background-color: var(--rp-bg); }
.bg-rp-surface { background-color: var(--rp-surface); }
.bg-rp-surface-2 { background-color: var(--rp-surface-2); }
.border-rp-border { border-color: var(--rp-border); }
.text-rp-text { color: var(--rp-text); }
.text-rp-muted { color: var(--rp-muted); }
.text-rp-accent { color: var(--rp-accent); }
.bg-rp-accent { background-color: var(--rp-accent); }
.bg-rp-accent-glow { background-color: var(--rp-accent-glow); }
.ring-rp-accent\/10 { --tw-ring-color: rgba(249,115,22,0.1); }
.border-rp-accent\/30 { border-color: rgba(249,115,22,0.3); }
.shadow-orange-900\/30 { --tw-shadow-color: rgba(124,45,18,0.3); }

html.map-expanded header {
  display: none;
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
