# RumboPerfecto — Frontend (Vue 3)

Cliente web (Vite + Vue 3 + TypeScript + Pinia + Tailwind) que consume la API Django en **`/api/`**.

El backend está en el mismo monorepo: carpeta **`RumboPerfecto/RumboPerfecto/`** (Django).

## Requisitos

- **Node.js 18+** (recomendado 20 LTS)
- Backend levantado, por defecto **`http://localhost:8000`**

## Configuración

### 1. Dependencias

```bash
npm install
```

### 2. Variables de entorno

**Windows**

```bash
copy .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

El archivo `.env.example` define la base de la URL de la API:

```bash
VITE_API_URL=http://localhost:8000/api
```

Sin `VITE_API_URL`, en **HTTP** el cliente usa por defecto `http://localhost:8000/api` (el backend debe tener CORS permitiendo el origen del front, p. ej. `http://localhost:3000`). El `proxy` de Vite en `vite.config.ts` aplica si las peticiones van a rutas relativas como `/api`. En **HTTPS** o producción, define siempre `VITE_API_URL` con la URL real de la API.

### 3. Desarrollo

```bash
npm run dev
```

Por defecto Vite sirve en **`http://localhost:3000`**. El backend debe permitir ese origen en `CORS_ALLOWED_ORIGINS`.

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run dev:force` | Desarrollo forzando reoptimización de dependencias de Vite |
| `npm run build` | `vue-tsc` + build de producción |
| `npm run preview` | Sirve el build generado en local |
| `npm run type-check` | Comprobación TypeScript sin emitir archivos |
| `npm run test` | Tests con Vitest (`tests/` bajo la raíz del frontend) |
| `npm run test:watch` | Vitest en modo observación |

## Funcionalidades (visión general)

- Registro, inicio y cierre de sesión con **JWT**; refresh ante `401` cuando hay refresh token.
- Perfil de usuario y flujo **vendedor** (`/api/auth/seller/`, gestión de anuncios).
- **Catálogo** público de servicios, detalle y reseñas.
- **Planes de viaje** e **ítems de plan** con fechas, tipos de servicio y enlace a reservas.
- **Reservas** del usuario y vistas de vendedor para reservas por servicio.
- **Mapas**: globo / Leaflet en home y planificación; geocodificación de direcciones vía API (`/api/auth/geocode/`).
- **Gestión**: formulario de anuncios; coordenadas pueden calcularse en servidor a partir de dirección al guardar (sin obligar a lat/lon salvo modo manual).

La persistencia de tokens y parte del estado vive en **`localStorage`**; recargar la página mantiene la sesión si los tokens siguen válidos.

## Build de producción

```bash
npm run build
```

Salida en `dist/`. Configura en el servidor o CDN la variable `VITE_API_URL` apuntando a la API real en el momento del build (Vite inyecta variables `VITE_*` en tiempo de compilación).

## Tests

Los tests de componentes/lógica viven en **`tests/`** (no dentro de `src/`). Ejemplo:

```bash
npm run test
```
