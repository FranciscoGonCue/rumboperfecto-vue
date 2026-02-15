<template>
  <div class="lg:flex lg:h-[calc(100vh-80px)] overflow-hidden">
    <!-- LEFT PANEL: MAP (Desktop Only) / HERO (Mobile) -->
    <div class="relative lg:w-[40%] h-[25vh] lg:h-full overflow-hidden shadow-2xl z-10">
      <!-- Mobile Overlay Text -->
      <div class="lg:hidden absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 z-20">
        <h2 class="text-white text-3xl font-black uppercase tracking-tighter leading-none">
          Explora el <br />Mundo
        </h2>
      </div>

      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
        alt="Map Background"
        class="h-full w-full object-cover grayscale-[0.2] brightness-75 hover:grayscale-0 transition-all duration-700 scale-110 lg:scale-100"
      />

      <!-- Desktop Map UI Elements -->
      <div class="hidden lg:flex absolute top-10 left-10 right-10 flex-col space-y-4">
        <div class="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100 flex items-center space-x-4">
          <div class="bg-orange-500 p-3 rounded-2xl text-white shadow-lg">
            <MapPin :size="24" />
          </div>
          <div>
            <h3 class="font-black text-gray-800 uppercase text-lg tracking-tight">Tu próxima aventura</h3>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Encuentra planes en el mapa</p>
          </div>
        </div>
      </div>

      <!-- Floating pulse point on desktop map -->
      <div class="hidden lg:block absolute top-[60%] left-[45%]">
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-orange-500/30 rounded-full animate-ping" />
          <div class="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: FEED & CONTENT -->
    <div class="lg:w-[60%] lg:h-full overflow-y-auto bg-white lg:rounded-l-[60px] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] relative z-20">
      <div class="pb-32 lg:pb-12 pt-6 lg:pt-12 px-6 lg:px-12">
        <!-- Search Bar -->
        <div class="relative mb-10 -mt-12 lg:mt-0 lg:max-w-xl">
          <div class="flex items-center bg-white lg:bg-gray-50 rounded-3xl px-6 py-5 shadow-[0_15px_30px_rgba(0,0,0,0.08)] lg:shadow-none border border-gray-100 lg:border-transparent lg:focus-within:border-orange-200 transition-all">
            <Search :size="22" class="text-rumbo-orange mr-4" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Busca tu próximo destino..."
              class="flex-1 outline-none text-base font-medium text-gray-700 bg-transparent placeholder:text-gray-400"
              @keyup.enter="handleSearch"
            />
            <button
              class="hidden lg:flex bg-orange-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 ml-4 cursor-pointer hover:bg-orange-600 transition-colors"
              @click="handleSearch"
            >
              Buscar
            </button>
          </div>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-3 gap-4 mb-12">
          <button
            v-for="(cat, idx) in categories"
            :key="idx"
            class="flex flex-col items-center justify-center space-y-3 p-6 rounded-[32px] transition-all shadow-sm border border-transparent hover:border-orange-100 hover:shadow-xl group"
            :class="cat.color"
            @click="filterByCategory(cat.label)"
          >
            <div class="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all">
              <component :is="cat.icon" :size="28" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest">{{ cat.label }}</span>
          </button>
        </div>

        <!-- Feed Section -->
        <div class="space-y-8">
          <div class="flex items-end justify-between">
            <div>
              <h3 class="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Ofertas <br />Destacadas
              </h3>
              <div class="h-1.5 w-12 bg-orange-500 rounded-full mt-3" />
            </div>
            <button class="text-xs font-black text-rumbo-orange uppercase tracking-widest border-b-2 border-orange-200 pb-1">
              Ver todos
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <TransitionGroup name="feed">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="relative rounded-[40px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.06)] bg-white border border-gray-50 group cursor-pointer hover:-translate-y-2 transition-transform duration-300"
              >
                <div class="relative h-64 overflow-hidden">
                  <img
                    :src="item.img"
                    :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div class="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                    <Star :size="12" class="fill-orange-500 text-orange-500" />
                    <span class="text-[10px] font-black text-gray-800">{{ item.rating }}</span>
                  </div>
                  <button
                    class="absolute top-5 right-5 p-3 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all"
                    @click.stop="toggleFavorite(item.id)"
                  >
                    <Heart :size="20" :class="{ 'fill-red-500 text-red-500': favorites.includes(item.id) }" />
                  </button>
                </div>
                <div class="p-8">
                  <h4 class="text-xl font-black text-gray-800 uppercase tracking-tight leading-tight mb-2">
                    {{ item.title }}
                  </h4>
                  <div class="flex justify-between items-center mt-6">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desde</span>
                      <span class="text-rumbo-orange font-black text-2xl tracking-tighter">{{ item.price }}</span>
                    </div>
                    <button class="p-4 bg-gray-50 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                      <Compass :size="24" />
                    </button>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Hotel, Compass, Utensils, Heart, MapPin, Star } from 'lucide-vue-next'

const categories = [
  { icon: Hotel, label: 'Hoteles', color: 'bg-blue-50 text-blue-500' },
  { icon: Compass, label: 'Aventuras', color: 'bg-emerald-50 text-emerald-500' },
  { icon: Utensils, label: 'Comida', color: 'bg-orange-50 text-rumbo-orange' }
]

const feedItems = [
  { id: 1, title: 'Escapada a Bali', price: '$450', rating: 4.8, category: 'Aventuras', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'Ruta Gastronómica', price: '$80', rating: 4.9, category: 'Comida', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  { id: 3, title: 'Aventura en los Alpes', price: '$220', rating: 4.7, category: 'Aventuras', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
  { id: 4, title: 'Playa Secreta', price: '$150', rating: 4.5, category: 'Hoteles', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
  { id: 5, title: 'Safari en Kenya', price: '$890', rating: 5.0, category: 'Aventuras', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80' },
  { id: 6, title: 'Luces de Tokyo', price: '$540', rating: 4.6, category: 'Hoteles', img: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d82?auto=format&fit=crop&w=400&q=80' }
]

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const favorites = ref<number[]>([])

const filteredItems = computed(() => {
  let items = feedItems

  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => item.title.toLowerCase().includes(query))
  }

  return items
})

function handleSearch() {
  console.log('Searching for:', searchQuery.value)
}

function filterByCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

function toggleFavorite(id: number) {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }
}
</script>

<style scoped>
.feed-enter-active,
.feed-leave-active {
  transition: all 0.5s ease;
}

.feed-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.feed-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
