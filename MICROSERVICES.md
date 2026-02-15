# 🏗️ Arquitectura de Microservicios para RumboPerfecto

Este documento describe la arquitectura de microservicios recomendada cuando decidas escalar RumboPerfecto a un sistema backend completo.

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue 3)                          │
│                     Puerto: 3000                                 │
│  - SPA con Vue 3 + TypeScript                                   │
│  - State Management: Pinia                                       │
│  - UI: Tailwind CSS                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS/REST/GraphQL
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     API GATEWAY                                  │
│                     Puerto: 8080                                 │
│  - Kong / NGINX / Traefik                                        │
│  - Rate Limiting                                                 │
│  - Authentication                                                │
│  - Load Balancing                                                │
└──────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │          │
       │          │          │          │          │
   ┌───▼───┐  ┌──▼───┐  ┌───▼───┐  ┌──▼───┐  ┌──▼───┐
   │ Auth  │  │Trips │  │ Maps  │  │ Pay  │  │ User │
   │Service│  │Serv. │  │Service│  │Serv. │  │Serv. │
   │:3001  │  │:3002 │  │:3003  │  │:3004 │  │:3005 │
   └───┬───┘  └──┬───┘  └───┬───┘  └──┬───┘  └──┬───┘
       │         │          │          │         │
       │         │          │          │         │
       └─────────┴──────────┴──────────┴─────────┘
                         │
              ┌──────────▼──────────┐
              │   MESSAGE BROKER    │
              │   (RabbitMQ/Kafka)  │
              │      Puerto: 5672   │
              └──────────┬──────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   ┌───▼────┐      ┌─────▼─────┐    ┌────▼─────┐
   │MongoDB │      │PostgreSQL │    │  Redis   │
   │:27017  │      │   :5432   │    │  :6379   │
   │        │      │           │    │          │
   │Trips   │      │Users      │    │Cache     │
   │Activ.  │      │Payments   │    │Sessions  │
   └────────┘      └───────────┘    └──────────┘
```

## 🎯 Microservicios Principales

### 1. Authentication Service (Puerto 3001)

**Responsabilidades:**
- Registro y login de usuarios
- JWT token generation y validación
- OAuth2 integración (Google, Facebook)
- Password reset
- 2FA (Two-Factor Authentication)

**Stack Tecnológico:**
```
- Node.js + Express / NestJS
- Passport.js para autenticación
- bcrypt para hashing de contraseñas
- JWT para tokens
- Redis para almacenar tokens de refresh
```

**Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email/:token
```

**Base de Datos:**
- PostgreSQL para datos de usuarios
- Redis para sesiones y tokens

### 2. Trips Service (Puerto 3002)

**Responsabilidades:**
- CRUD de viajes
- Gestión de itinerarios
- Gestión de actividades por día
- Compartir viajes con otros usuarios
- Exportar viajes a PDF/ICS

**Stack Tecnológico:**
```
- Node.js + Express / NestJS
- MongoDB para flexibilidad en estructura de datos
- Mongoose ODM
```

**Endpoints:**
```
GET    /api/trips
GET    /api/trips/:id
POST   /api/trips
PUT    /api/trips/:id
DELETE /api/trips/:id
POST   /api/trips/:id/activities
PUT    /api/trips/:id/activities/:activityId
DELETE /api/trips/:id/activities/:activityId
POST   /api/trips/:id/share
GET    /api/trips/:id/export/pdf
```

**Base de Datos:**
- MongoDB

**Modelo de Datos:**
```typescript
interface Trip {
  _id: ObjectId
  userId: string
  title: string
  startDate: Date
  endDate: Date
  destination: string
  budget?: number
  activities: {
    day: number
    items: Activity[]
  }[]
  sharedWith: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 3. Maps Service (Puerto 3003)

**Responsabilidades:**
- Búsqueda de lugares
- Geocoding y reverse geocoding
- Cálculo de rutas
- Puntos de interés cercanos
- Integración con Google Maps / Mapbox

**Stack Tecnológico:**
```
- Node.js + Express
- Google Maps API / Mapbox
- Nominatim (OpenStreetMap)
- Redis para cachear búsquedas
```

**Endpoints:**
```
GET    /api/maps/search?query=barcelona
GET    /api/maps/geocode?address=Plaza+Mayor
GET    /api/maps/reverse?lat=40.4168&lng=-3.7038
GET    /api/maps/places/nearby?lat=40.4168&lng=-3.7038&type=restaurant
GET    /api/maps/route?origin=Madrid&destination=Barcelona
```

**Base de Datos:**
- Redis para cache de búsquedas

### 4. Payment Service (Puerto 3004)

**Responsabilidades:**
- Crear intenciones de pago
- Procesar pagos con Stripe
- Gestionar suscripciones
- Historial de transacciones
- Webhooks de Stripe

**Stack Tecnológico:**
```
- Node.js + Express / NestJS
- Stripe SDK
- PostgreSQL para transacciones
```

**Endpoints:**
```
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/history
POST   /api/payments/webhooks/stripe
GET    /api/payments/subscriptions
POST   /api/payments/subscriptions/create
PUT    /api/payments/subscriptions/:id/cancel
```

**Base de Datos:**
- PostgreSQL

### 5. User Profile Service (Puerto 3005)

**Responsabilidades:**
- Gestión de perfil de usuario
- Preferencias del usuario
- Avatar y fotos
- Estadísticas de viajes
- Notificaciones

**Stack Tecnológico:**
```
- Node.js + Express / NestJS
- PostgreSQL para datos de perfil
- S3 / Cloudinary para almacenar imágenes
```

**Endpoints:**
```
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/avatar
GET    /api/users/:id/stats
GET    /api/users/:id/preferences
PUT    /api/users/:id/preferences
GET    /api/users/:id/notifications
POST   /api/users/:id/notifications/mark-read
```

**Base de Datos:**
- PostgreSQL

## 🔐 Seguridad

### API Gateway Security

```javascript
// Kong configuration example
{
  "plugins": [
    {
      "name": "jwt",
      "config": {
        "key_claim_name": "kid",
        "secret_is_base64": false
      }
    },
    {
      "name": "rate-limiting",
      "config": {
        "minute": 100,
        "hour": 10000
      }
    },
    {
      "name": "cors",
      "config": {
        "origins": ["https://rumboperfecto.com"],
        "credentials": true
      }
    }
  ]
}
```

### Service-to-Service Communication

```javascript
// Using JWT for inter-service authentication
const axios = require('axios');

async function callTripService(userId, token) {
  const response = await axios.get(
    'http://trips-service:3002/api/trips',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Service-Token': process.env.SERVICE_SECRET
      }
    }
  );
  return response.data;
}
```

## 📨 Message Broker (RabbitMQ)

### Event-Driven Architecture

```javascript
// Publisher (Trips Service)
const amqp = require('amqplib');

async function publishTripCreated(trip) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('trips', 'topic', { durable: true });
  
  channel.publish(
    'trips',
    'trip.created',
    Buffer.from(JSON.stringify({
      userId: trip.userId,
      tripId: trip._id,
      title: trip.title,
      timestamp: new Date()
    }))
  );
}

// Consumer (Notification Service)
async function consumeTripEvents() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('trips', 'topic', { durable: true });
  const q = await channel.assertQueue('', { exclusive: true });
  
  channel.bindQueue(q.queue, 'trips', 'trip.*');
  
  channel.consume(q.queue, (msg) => {
    const event = JSON.parse(msg.content.toString());
    
    if (msg.fields.routingKey === 'trip.created') {
      sendNotificationToUser(event.userId, `Nuevo viaje creado: ${event.title}`);
    }
    
    channel.ack(msg);
  });
}
```

## 🐳 Docker Compose

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8080
    depends_on:
      - api-gateway

  # API Gateway
  api-gateway:
    image: kong:latest
    ports:
      - "8080:8000"
      - "8443:8443"
      - "8001:8001"
    environment:
      - KONG_DATABASE=postgres
      - KONG_PG_HOST=postgres
    depends_on:
      - postgres

  # Auth Service
  auth-service:
    build: ./services/auth
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  # Trips Service
  trips-service:
    build: ./services/trips
    ports:
      - "3002:3002"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/trips
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - mongodb
      - rabbitmq

  # Maps Service
  maps-service:
    build: ./services/maps
    ports:
      - "3003:3003"
    environment:
      - REDIS_HOST=redis
      - GOOGLE_MAPS_KEY=${GOOGLE_MAPS_KEY}
    depends_on:
      - redis

  # Payment Service
  payment-service:
    build: ./services/payment
    ports:
      - "3004:3004"
    environment:
      - DB_HOST=postgres
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres

  # User Service
  user-service:
    build: ./services/user
    ports:
      - "3005:3005"
    environment:
      - DB_HOST=postgres
      - S3_BUCKET=${S3_BUCKET}
    depends_on:
      - postgres

  # Databases
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres-data:
  mongo-data:
```

## 📊 Monitoreo y Observabilidad

### Prometheus + Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'trips-service'
    static_configs:
      - targets: ['trips-service:3002']
  
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
  
  # ... otros servicios
```

### Logging con ELK Stack

```javascript
// Winston logger configuration
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://elasticsearch:9200' }
    })
  ]
});

// Uso en servicios
logger.info('Trip created', { 
  userId: user.id, 
  tripId: trip.id,
  service: 'trips-service'
});
```

## 🚀 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Microservices

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm test
          
  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: |
          docker build -t myregistry/auth-service:latest ./services/auth
          docker build -t myregistry/trips-service:latest ./services/trips
          
      - name: Push to registry
        run: |
          docker push myregistry/auth-service:latest
          docker push myregistry/trips-service:latest
          
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
          kubectl rollout restart deployment/auth-service
          kubectl rollout restart deployment/trips-service
```

## 📈 Escalabilidad

### Horizontal Scaling

```yaml
# kubernetes/trips-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trips-service
spec:
  replicas: 3  # Escalar horizontalmente
  selector:
    matchLabels:
      app: trips-service
  template:
    metadata:
      labels:
        app: trips-service
    spec:
      containers:
      - name: trips-service
        image: myregistry/trips-service:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trips-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trips-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔄 Próximos Pasos

1. **Fase 1**: Implementar Auth Service y User Service
2. **Fase 2**: Implementar Trips Service con MongoDB
3. **Fase 3**: Integrar Maps Service y Payment Service
4. **Fase 4**: Configurar API Gateway (Kong)
5. **Fase 5**: Implementar Message Broker (RabbitMQ)
6. **Fase 6**: Configurar CI/CD y Kubernetes
7. **Fase 7**: Implementar monitoreo con Prometheus/Grafana

---

**¿Listo para empezar? Comienza con el Auth Service y construye gradualmente!**
