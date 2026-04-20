# RumboPerfecto Frontend (Vue 3)

Frontend de planificacion de viajes integrado con backend real (Django REST).

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000`

## Configuracion

1. Instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
copy .env.example .env
```

3. Levanta en desarrollo:

```bash
npm run dev
```

## Scripts

- `npm run dev`: desarrollo
- `npm run dev:force`: limpia optimize deps de Vite
- `npm run type-check`: chequeo TypeScript con `vue-tsc`
- `npm run build`: type-check + build de produccion
- `npm run preview`: servir build local

## Funcionalidades implementadas

- Registro/login/logout reales con JWT
- Refresh de token automatico en 401
- Carga de sesion al recargar app (`/auth/me` + `/trips`)
- CRUD de viajes persistido en backend
- Alta de actividades por viaje y dia
- Manejo de expiracion de sesion en cliente

## Variables de entorno

Archivo `.env`:

```bash
VITE_API_URL=http://localhost:8000/api
```

## Flujo esperado

1. Usuario se registra o inicia sesion
2. Crea viajes y actividades
3. Al recargar navegador, la sesion y datos persisten por usuario
4. Si el token expira, el cliente refresca automaticamente
