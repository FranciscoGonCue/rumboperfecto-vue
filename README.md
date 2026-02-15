# 🌍 RumboPerfecto - Vue Travel Planner

Aplicación moderna de planificación de viajes construida con Vue 3, TypeScript y Tailwind CSS. Incluye autenticación, integración de mapas y sistema de pagos.

![RumboPerfecto Banner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)

## ✨ Características

- 🎨 **Diseño Moderno y Responsivo**: Interfaz vibrante optimizada para móvil y escritorio
- ⚡ **Vue 3 + Composition API**: Arquitectura moderna y reactiva
- 🔐 **Sistema de Autenticación**: Login y registro de usuarios
- 🗺️ **Integración de Mapas**: Búsqueda de lugares con Leaflet y OpenStreetMap
- 💳 **Pagos con Stripe**: Preparado para integración de pagos
- 🎭 **Animaciones Fluidas**: Transiciones suaves con CSS y Vue Transition
- 💾 **Persistencia Local**: Datos guardados en localStorage
- 📱 **Progressive Web App**: Listo para PWA
- 🎯 **TypeScript**: Tipado fuerte para mayor seguridad

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd rumboperfecto-vue

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Type checking
npm run type-check
```

## 🏗️ Estructura del Proyecto

```
rumboperfecto-vue/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── SplashScreen.vue
│   │   ├── AirplaneSVG.vue
│   │   ├── NavButton.vue
│   │   └── DesktopNavLink.vue
│   ├── views/              # Vistas principales
│   │   ├── HomeView.vue
│   │   ├── PlannerView.vue
│   │   └── ProfileView.vue
│   ├── stores/             # Pinia stores
│   │   └── app.ts
│   ├── composables/        # Composables de Vue
│   │   ├── useAuth.ts
│   │   ├── useMap.ts
│   │   └── usePayment.ts
│   ├── types/              # Definiciones TypeScript
│   │   └── index.ts
│   ├── App.vue             # Componente raíz
│   ├── main.ts             # Punto de entrada
│   └── style.css           # Estilos globales
├── public/                 # Archivos estáticos
├── index.html             # HTML principal
├── vite.config.ts         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── package.json
```

## 🔧 Características Técnicas

### State Management (Pinia)

```typescript
import { useAppStore } from '@/stores/app'

const store = useAppStore()
store.addTrip(trip)
store.setCurrentView('plan')
```

### Autenticación

```typescript
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()
await auth.login(email, password)
await auth.register(email, password, name)
auth.logout()
```

### Mapas

```typescript
import { useMap } from '@/composables/useMap'

const { initMap, addMarker, searchPlaces } = useMap('map-container')
await initMap([40.4168, -3.7038])
const places = await searchPlaces('Barcelona')
```

### Pagos

```typescript
import { usePayment } from '@/composables/usePayment'

const { createPaymentIntent, confirmPayment } = usePayment()
const clientSecret = await createPaymentIntent(5000, 'eur')
await confirmPayment(clientSecret, paymentMethod)
```

## 🌐 Integración con Backend

Para conectar con un backend real, crea un archivo `.env`:

```bash
VITE_API_URL=https://api.tudominio.com
VITE_STRIPE_PUBLIC_KEY=pk_live_tu_clave_stripe
```

Modifica los composables para hacer llamadas a tu API:

```typescript
// En useAuth.ts
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

## 🎨 Personalización

### Colores

Modifica `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'rumbo-orange': '#FF7F50',  // Cambia esto
    }
  }
}
```

### Animaciones

Ajusta las transiciones en `App.vue` o componentes individuales:

```vue
<Transition name="fade" mode="out-in">
  <component :is="currentView" />
</Transition>
```

## 🔐 Seguridad

- ⚠️ **IMPORTANTE**: Nunca expongas claves API en el frontend
- Usa variables de entorno para claves públicas únicamente
- Implementa autenticación JWT con tu backend
- Valida todos los inputs del usuario
- Sanitiza datos antes de guardar en localStorage

## 📱 PWA (Progressive Web App)

Para convertir en PWA, instala:

```bash
npm install vite-plugin-pwa -D
```

Configura en `vite.config.ts`:

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RumboPerfecto',
        short_name: 'Rumbo',
        theme_color: '#FF7F50'
      }
    })
  ]
})
```

## 🚀 Despliegue

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Solución de Problemas

### Error: Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Problemas con TypeScript

```bash
npm run type-check
```

### Mapas no cargan

Verifica que Leaflet CSS esté incluido en `index.html`

## 📄 Licencia

MIT

## 👨‍💻 Autor

Tu Nombre

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas, abre un issue en GitHub o contacta a [tu-email@ejemplo.com]

---

**¡Hecho con ❤️ y Vue 3!**
