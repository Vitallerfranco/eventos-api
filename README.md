# API Backend — Plataforma de Eventos

API REST para una plataforma de eventos: los **organizadores** publican eventos y los **usuarios** se inscriben recibiendo un ticket con código de reserva y un email de confirmación. Incluye autenticación con JWT en cookie httpOnly, roles, control de cupos y arquitectura profesional por capas (routes → controllers → services → repositories → DAO + DTO).

---

## Tabla de contenidos

- [Temática](#temática)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Comandos](#comandos)
- [Roles y permisos](#roles-y-permisos)
- [Usuarios de prueba](#usuarios-de-prueba)
- [Endpoints](#endpoints)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Flujo de autenticación](#flujo-de-autenticación)
- [Flujo de inscripción](#flujo-de-inscripción)
- [Checklist de verificación](#checklist-de-verificación)
- [Colección de Postman](#colección-de-postman)

---

## Temática

La API modela una plataforma donde:

- Cualquier persona puede registrarse (rol `user` por defecto) y ver el catálogo de eventos publicados.
- Un `organizer` crea, edita, publica, cancela y finaliza **sus** eventos.
- Un `user` se inscribe a eventos publicados y obtiene un **ticket** con `reservationCode`.
- El cupo se controla en tiempo real: los tickets cancelados liberan lugares automáticamente.
- Cada inscripción dispara un **email de confirmación** vía Nodemailer.
- Un `admin` puede operar sobre los eventos y tickets de cualquier organizador.

---

## Tecnologías

| Área | Stack |
|---|---|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 4 |
| Base de datos | MongoDB + Mongoose 8 |
| Autenticación | Passport (`local`, `jwt`) + jsonwebtoken + cookie-parser |
| Seguridad | bcrypt (hash de passwords) |
| Emails | Nodemailer |
| Config | dotenv |

---

## Arquitectura

```
src/
├── config/        # variables de entorno, conexión a Mongo, estrategias de Passport
├── routes/        # definición de endpoints y middlewares aplicados
├── controllers/   # sólo coordinan request/response
├── services/      # lógica de negocio y validaciones
├── repositories/  # abstracción sobre la persistencia
├── dao/           # único lugar donde se importan los modelos de Mongoose
├── dto/           # formato de salida (nunca exponen password)
├── models/        # schemas de Mongoose
├── middlewares/   # autenticación, autorización, manejo centralizado de errores
├── utils/         # hash, jwt, códigos de reserva, validadores, constantes, logger
└── scripts/       # seed de datos de prueba
```

**Reglas que respeta el proyecto**

- Los modelos de Mongoose **sólo** se importan en `src/dao/`.
- Los `services` consumen `repositories`, nunca DAOs ni modelos.
- Los `controllers` no tienen lógica de negocio: llaman al service y responden.
- Las respuestas de usuario, evento y ticket pasan siempre por un **DTO**.
- Errores centralizados en `middlewares/error.middleware.js`, con códigos 400 / 401 / 403 / 404 / 409 / 500.
- Las credenciales (JWT, email) viven exclusivamente en variables de entorno.

### Capas en una petición

```
POST /api/events/:eid/tickets
  routes/events.router.js  → authenticate
  controllers/tickets      → lee params/body, arma la respuesta
  services/ticket.service  → valida estado del evento, duplicados y cupo
  repositories/ticket      → delega en el DAO
  dao/mongo/ticket.dao     → Mongoose
  dto/ticket.dto           → respuesta final
```

---

## Instalación

```bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
npm install
cp .env.example .env   # y completar los valores
npm run seed           # opcional: crea usuarios y eventos de prueba
npm start
```

La API queda en `http://localhost:8080/api`. Verificación rápida: `GET /api/health`.

**Requisitos:** Node.js 18 o superior y una instancia de MongoDB (local o Atlas).

---

## Variables de entorno

Todas se declaran en `.env` (ver `.env.example`). El servidor no arranca si falta `MONGO_URL` o `JWT_SECRET`.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `8080` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGO_URL` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/eventos` |
| `JWT_SECRET` | Secreto para firmar los JWT | `un_secreto_largo` |
| `JWT_EXPIRES_IN` | Expiración del token | `1d` |
| `JWT_COOKIE_NAME` | Nombre de la cookie httpOnly | `authToken` |
| `MAIL_HOST` | Host SMTP | `smtp.gmail.com` |
| `MAIL_PORT` | Puerto SMTP | `587` |
| `MAIL_USER` | Usuario SMTP | `tu_correo@gmail.com` |
| `MAIL_PASS` | Contraseña de aplicación | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | Remitente visible | `Eventos <tu_correo@gmail.com>` |

> Si las variables `MAIL_*` no están configuradas, la API funciona igual: el envío se omite y queda registrado un aviso en consola.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta el servidor |
| `npm run dev` | Levanta el servidor con recarga automática (`node --watch`) |
| `npm run seed` | Crea los usuarios y eventos de prueba |

---

## Roles y permisos

| Acción | user | organizer | admin |
|---|:--:|:--:|:--:|
| Registrarse / iniciar sesión | ✅ | ✅ | ✅ |
| Ver listado y detalle de eventos | ✅ | ✅ | ✅ |
| Crear evento | ❌ 403 | ✅ | ✅ |
| Editar / cambiar estado de evento propio | ❌ 403 | ✅ | ✅ |
| Editar evento ajeno | ❌ 403 | ❌ 403 | ✅ |
| Eliminar evento | ❌ 403 | ❌ 403 | ✅ |
| Inscribirse a un evento | ✅ | ✅ | ✅ |
| Ver inscripciones de un evento | ❌ 403 | ✅ (propio) | ✅ |
| Cancelar ticket | ✅ (propio) | ✅ (propio) | ✅ (cualquiera) |

El registro público **siempre** asigna el rol `user`: el campo `role` enviado en el body se ignora. Para crear un `organizer` o un `admin` se usa `npm run seed` o se actualiza el documento en la base.

---

## Usuarios de prueba

Los crea `npm run seed`:

| Rol | Email | Password |
|---|---|---|
| user | `user@test.com` | `user1234` |
| organizer | `organizer@test.com` | `organizer1234` |
| admin | `admin@test.com` | `admin1234` |

El seed también crea tres eventos, uno de ellos con **capacidad 2** para poder probar el error de cupo agotado.

---

## Endpoints

Base URL: `http://localhost:8080/api`

### Sesiones

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/sessions/register` | — | Registro público (rol `user`) |
| POST | `/sessions/login` | — | Login; devuelve JWT en cookie httpOnly |
| GET | `/sessions/current` | JWT | Datos del usuario autenticado (DTO) |
| POST | `/sessions/logout` | — | Limpia la cookie de sesión |

### Eventos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/events` | — | Listado con filtros, orden y paginación |
| GET | `/events/:eid` | — | Detalle con cupos reservados y disponibles |
| POST | `/events` | organizer, admin | Crear evento |
| PUT | `/events/:eid` | dueño o admin | Editar evento |
| PATCH | `/events/:eid/status` | dueño o admin | Cambiar estado |
| DELETE | `/events/:eid` | admin | Eliminar evento |

**Query params de `GET /events`:** `status`, `category`, `location`, `dateFrom`, `dateTo`, `organizer`, `page`, `limit`, `sortBy` (`date` \| `price` \| `title` \| `createdAt`), `order` (`asc` \| `desc`).

### Tickets / Inscripciones

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/events/:eid/tickets` | JWT | Inscribirse a un evento publicado |
| GET | `/events/:eid/tickets` | dueño o admin | Inscripciones del evento + resumen de cupos |
| GET | `/tickets/my-tickets` | JWT | Tickets propios con datos del evento |
| PATCH | `/tickets/:tid/cancel` | dueño o admin | Cancela el ticket (no lo borra) |

### Utilidad

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la API |

---

## Ejemplos de uso

### Registro

```http
POST /api/sessions/register
Content-Type: application/json

{ "first_name": "Ana", "last_name": "Perez", "email": "ana@test.com", "password": "ana12345" }
```

```json
{
  "status": "success",
  "payload": {
    "id": "665f1b...",
    "first_name": "Ana",
    "last_name": "Perez",
    "full_name": "Ana Perez",
    "email": "ana@test.com",
    "role": "user"
  }
}
```

### Login

```bash
curl -i -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"user1234"}' \
  -c cookies.txt
```

La respuesta incluye `Set-Cookie: authToken=...; HttpOnly`.

### Crear un evento (organizer)

```http
POST /api/events
Content-Type: application/json
Cookie: authToken=<jwt del organizer>

{
  "title": "Congreso Tech 2026",
  "description": "Charlas de arquitectura backend",
  "category": "tecnologia",
  "date": "2026-12-10T19:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 50,
  "price": 15000,
  "status": "published"
}
```

### Listado paginado

```http
GET /api/events?status=published&page=2&limit=5&sortBy=date&order=asc
```

```json
{
  "status": "success",
  "data": [{ "id": "...", "title": "Congreso Tech 2026", "status": "published" }],
  "page": 2,
  "limit": 5,
  "total": 27,
  "totalPages": 6
}
```

### Inscripción

```http
POST /api/events/6690.../tickets
Cookie: authToken=<jwt del user>

{ "quantity": 1 }
```

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "reservationCode": "EVT-7QK2",
    "quantity": 1,
    "status": "active",
    "event": "6690...",
    "user": "665f..."
  }
}
```

### Errores típicos

```json
// 409 — inscripción duplicada
{ "status": "error", "message": "Ya tenes una inscripcion activa a este evento" }

// 409 — sin cupo
{ "status": "error", "message": "El evento no tiene cupos disponibles" }

// 403 — rol insuficiente
{ "status": "error", "message": "Acceso restringido. Roles permitidos: organizer, admin" }

// 401 — sin sesión
{ "status": "error", "message": "No autenticado" }
```

---

## Flujo de autenticación

1. `POST /api/sessions/register` → Passport ejecuta la estrategia `register`, hashea la password con bcrypt y guarda al usuario con rol `user`.
2. `POST /api/sessions/login` → la estrategia `login` valida las credenciales; el controller genera el JWT (payload: `id`, `email`, `role` — **nunca** la password) y lo guarda en una cookie `httpOnly`.
3. `GET /api/sessions/current` → la estrategia `current` (passport-jwt) extrae el token de la cookie, busca al usuario y lo devuelve como `UserDTO`.
4. `POST /api/sessions/logout` → limpia la cookie; a partir de ahí `/current` responde **401**.

---

## Flujo de inscripción

1. El `user` autenticado llama a `POST /api/events/:eid/tickets`.
2. El service valida que el evento exista, esté **publicado** y no haya ocurrido.
3. Verifica que el usuario no tenga ya una inscripción **activa** al mismo evento → si la tiene, **409**.
4. Calcula el cupo ocupado sumando las cantidades de los tickets `active` y `used` (los `cancelled` no cuentan) → si no alcanza, **409** con el detalle de lugares restantes.
5. Crea el ticket con un `reservationCode` único y dispara el email de confirmación con Nodemailer.
6. Al cancelar (`PATCH /api/tickets/:tid/cancel`) el ticket pasa a `cancelled` con `cancelledAt`; el documento **no se elimina** y el cupo queda liberado para una nueva inscripción.

---

## Checklist de verificación

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Registro → login → `/current` → logout → `/current` | 200 / 200 / 200 / 200 / **401** |
| 2 | `user` intenta crear un evento | **403** |
| 3 | `organizer` crea evento → `user` se inscribe | **201**, email enviado, cupo descontado |
| 4 | `user` se inscribe de nuevo al mismo evento | **409** duplicado |
| 5 | Inscripción a evento sin cupo | **409** con mensaje claro |
| 6 | `user` cancela su ticket y vuelve a inscribirse | 200 y luego **201** |
| 7 | `organizer` modifica evento ajeno | **403** |
| 8 | `admin` modifica evento de otro organizador | **200** |
| 9 | Respuestas de usuario / evento / ticket | sin campo `password` |
| 10 | `GET /events?status=published&page=2&limit=5` | `data`, `page`, `limit`, `total`, `totalPages` |

---

## Colección de Postman

En `postman/plataforma-eventos.postman_collection.json` está el flujo completo ordenado (health → registro → login → eventos → inscripción → cancelación → casos de error), 33 requests que cubren los 10 casos del [checklist](#checklist-de-verificación). Se importa desde Postman con *Import → File*.

La colección usa la variable `{{baseUrl}}` (valor por defecto `http://localhost:8080/api`) y guarda cookies automáticamente, así que basta con ejecutar las requests en orden. Cada request valida su código HTTP con `pm.test`, y todas verifican que la respuesta no exponga `password`.

Está pensada para correr una vez sobre una base recién sembrada (`npm run seed`): la request `01` registra `ana@test.com` y una segunda corrida devolvería 409. También se puede ejecutar desde la terminal con [Newman](https://github.com/postmanlabs/newman):

```bash
npx newman run postman/plataforma-eventos.postman_collection.json
```

---

## Autor

**Franco Vitaller**
