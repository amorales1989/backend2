# Ecommerce - Backend Final

Servidor de ecommerce con arquitectura en capas, autenticación/autorización con Passport + JWT,
patrón **DAO / DTO / Repository**, recuperación de contraseña por correo y lógica de compra con
generación de tickets.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)
- Una cuenta de Gmail con **Contraseña de aplicación** (para el mailing)

## Instalación

```bash
npm install
```

Copiar `.env.example` a `.env` y completar las variables:

```bash
cp .env.example .env
```

```
PORT=8080
MONGO_URL=mongodb://localhost:27017/ecommerce

JWT_SECRET=miClaveSecretaSuperSegura123
JWT_COOKIE_NAME=jwtCookieToken


PERSISTENCE=mongo

MAIL_SERVICE=gmail
MAIL_USER=---
MAIL_PASS=---

BASE_URL=http://localhost:8080
```

> **Contraseña de aplicación de Gmail:** `MAIL_PASS` NO es la contraseña normal de la cuenta.
> Generala (con verificación en 2 pasos activada) en https://myaccount.google.com/apppasswords

## Ejecución

```bash
npm start        # producción
npm run dev      # desarrollo (nodemon)
npm run seed     # carga datos de ejemplo (admin, user y productos)
```

## Datos de ejemplo y pruebas

`npm run seed` crea:

| Email | Password | Rol |
| ----- | -------- | --- |
| `admin@mail.com` | `admin1234` | admin |
| `user@mail.com` | `user1234` | user |

Más 5 productos (uno sin stock, para probar la compra incompleta).

El archivo [`requests.http`](requests.http) tiene todos los requests listos para probar el flujo
completo con la extensión **REST Client** de VSCode (login, productos, carrito, compra y
recuperación de contraseña).

## Arquitectura

Arquitectura en capas con separación de responsabilidades:

```
Router → Controller → Repository (lógica de negocio) → DAO (acceso a datos) → Model (Mongoose)
                          │
                          └── DTO (transferencia de datos sin info sensible)
```

```
src/
├── app.js                          # Punto de entrada
├── config/
│   ├── config.js                   # Variables de entorno centralizadas
│   └── passport.config.js          # Estrategias Passport (register, login, current)
├── controllers/
│   ├── sessions.controller.js
│   ├── products.controller.js
│   └── carts.controller.js
├── dao/                            # Data Access Objects
│   ├── UserDao.js
│   ├── ProductDao.js
│   ├── CartDao.js
│   ├── TicketDao.js
│   └── models/                     # Esquemas de Mongoose
│       ├── user.model.js
│       ├── cart.model.js
│       ├── product.model.js
│       └── ticket.model.js
├── dto/
│   └── UserDTO.js                  # DTO de /current (sin datos sensibles)
├── repositories/                   # Lógica de negocio sobre los DAOs
│   ├── index.js                    # Factory: inyecta DAOs en los Repositories
│   ├── UserRepository.js
│   ├── ProductRepository.js
│   ├── CartRepository.js           # Lógica de compra
│   └── TicketRepository.js
├── middlewares/
│   └── auth.js                     # passportCall + authorization por rol
├── routes/
│   ├── sessions.router.js
│   ├── products.router.js
│   └── carts.router.js
└── utils/
    ├── utils.js                    # bcrypt, JWT, tokens de reset
    └── mailer.js                   # nodemailer (Gmail)
```

### Patrón DAO / DTO / Repository

- **DAO**: única capa que conoce Mongoose. Encapsula las consultas a la base.
- **Repository**: contiene la lógica de negocio y usa los DAOs (inyección de dependencias).
  Los controllers nunca tocan los DAOs ni los modelos directamente.
- **DTO**: `CurrentUserDTO` expone solo información no sensible en `/current` (nunca la password).

## Roles y autorización

El middleware `authorization(...roles)` se ejecuta después de `passportCall('current')` y valida
`req.user.role`:

- **admin** → único que puede **crear, actualizar y eliminar productos**.
- **user** → único que puede **operar su carrito y comprar**.

Para crear un admin, registrá un usuario y cambiale el campo `role` a `"admin"` en la base.

## Endpoints

### Sessions — `/api/sessions`

| Método | Ruta | Acceso | Descripción |
| ------ | ---- | ------ | ----------- |
| POST | `/register` | público | Registra usuario y le crea un carrito |
| POST | `/login` | público | Login, devuelve JWT en cookie `httpOnly` |
| POST | `/logout` | público | Cierra sesión |
| GET | `/current` | autenticado | Devuelve **DTO** del usuario (sin datos sensibles) |
| POST | `/forgot-password` | público | Envía correo de recuperación (link expira en 1h) |
| GET | `/reset-password?token=` | público | Formulario HTML para nueva contraseña |
| POST | `/reset-password` | público | Cambia la contraseña (no permite la anterior) |
| GET/PUT/DELETE | `/users[/:uid]` | admin | CRUD de usuarios |

### Products — `/api/products`

| Método | Ruta | Acceso | Descripción |
| ------ | ---- | ------ | ----------- |
| GET | `/` | público | Lista productos |
| GET | `/:pid` | público | Detalle de producto |
| POST | `/` | **admin** | Crea producto |
| PUT | `/:pid` | **admin** | Actualiza producto |
| DELETE | `/:pid` | **admin** | Elimina producto |

### Carts — `/api/carts`

| Método | Ruta | Acceso | Descripción |
| ------ | ---- | ------ | ----------- |
| GET | `/:cid` | autenticado | Ver carrito |
| POST | `/products/:pid` | **user** | Agrega producto al carrito propio (`{ quantity }`) |
| DELETE | `/products/:pid` | **user** | Quita producto del carrito propio |
| DELETE | `/` | **user** | Vacía el carrito propio |
| POST | `/purchase` | **user** | Finaliza la compra y genera ticket |

## Recuperación de contraseña

1. `POST /api/sessions/forgot-password` con `{ "email": "..." }`.
2. Llega un correo con un botón **Restablecer contraseña** (link con token JWT que **expira en 1 hora**).
3. El link abre un formulario (`GET /reset-password?token=`) que envía la nueva contraseña.
4. El sistema **rechaza** una contraseña igual a la anterior y un token vencido.

## Lógica de compra (Ticket)

`POST /api/carts/purchase`:

1. Recorre los productos del carrito y **verifica el stock** de cada uno.
2. Los productos con stock suficiente: **descuenta stock** y se incluyen en la compra.
3. Los productos sin stock: **quedan en el carrito** (compra incompleta).
4. Genera un **Ticket** con `code` único (UUID), `purchase_datetime`, `amount` total y `purchaser` (email).
5. La respuesta indica qué se compró (`purchased`) y qué quedó pendiente (`notPurchased`).

### Modelo Ticket

| Campo | Tipo | Detalle |
| ----- | ---- | ------- |
| code | String | único, autogenerado (UUID) |
| purchase_datetime | Date | fecha/hora de la compra |
| amount | Number | total de la compra |
| purchaser | String | email del comprador |

## Modelo User

| Campo | Tipo | Detalle |
| ----- | ---- | ------- |
| first_name | String | requerido |
| last_name | String | requerido |
| email | String | requerido, único |
| age | Number | requerido |
| password | String | hasheada con bcrypt |
| cart | ObjectId | referencia a `Carts` |
| role | String | `user` (default) / `admin` |
