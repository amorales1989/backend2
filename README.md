# Ecommerce - Autenticación y Autorización

Entrega N° 1 — CRUD de usuarios + Autenticación con Passport y JWT.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Instalación

```bash
npm install
```

Copiar el archivo `.env.example` a `.env` y completar las variables:

```bash
cp .env.example .env
```

```
PORT=8080
MONGO_URL=mongodb://localhost:27017/ecommerce
JWT_SECRET=miClaveSecretaSuperSegura123
JWT_COOKIE_NAME=jwtCookieToken
```

## Ejecución

```bash
npm start
# o en modo desarrollo
npm run dev
```

## Estructura

```
src/
├── app.js                          # Punto de entrada
├── config/
│   └── passport.config.js          # Estrategias de Passport (register, login, current)
├── dao/
│   └── models/
│       ├── user.model.js           # Modelo User
│       └── cart.model.js           # Modelo Cart
├── middlewares/
│   └── auth.js                     # passportCall y authorization
├── routes/
│   └── sessions.router.js          # Rutas /api/sessions
└── utils/
    └── utils.js                    # bcrypt + jwt helpers
```

## Modelo User

| Campo        | Tipo      | Detalle                      |
| ------------ | --------- | ---------------------------- |
| first_name   | String    | requerido                    |
| last_name    | String    | requerido                    |
| email        | String    | requerido, único             |
| age          | Number    | requerido                    |
| password     | String    | hasheada con bcrypt.hashSync |
| cart         | ObjectId  | referencia a `Carts`         |
| role         | String    | default: `'user'`            |

## Endpoints

### Registro
```
POST /api/sessions/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@mail.com",
  "age": 30,
  "password": "1234"
}
```

### Login (genera JWT)
```
POST /api/sessions/login
Content-Type: application/json

{
  "email": "juan@mail.com",
  "password": "1234"
}
```

Respuesta:
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

El token se envía también como cookie `httpOnly` llamada `jwtCookieToken`.

### Current (valida JWT)
```
GET /api/sessions/current
Cookie: jwtCookieToken=<token>
```

Devuelve los datos del usuario asociados al token. Si el token es inválido o inexistente, responde con `401`.

### Logout
```
POST /api/sessions/logout
```

### CRUD usuarios (requiere JWT)
```
GET    /api/sessions/users
GET    /api/sessions/users/:uid
PUT    /api/sessions/users/:uid
DELETE /api/sessions/users/:uid
```

## Estrategias de Passport implementadas

- `register` — registra un nuevo usuario, hashea la password con `bcrypt.hashSync` y crea un carrito asociado.
- `login` — valida email + password contra la base.
- `current` — estrategia JWT que extrae el token desde la cookie y valida al usuario logueado.
