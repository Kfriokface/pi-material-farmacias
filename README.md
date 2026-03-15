# Material Farmacias — Backend

API REST para la gestión de material promocional y corporativo para farmacias.

---

## Contexto del Proyecto Intermodular

Este proyecto es el **Trabajo de Fin de Ciclo (Proyecto Intermodular)** del Grado Superior de Desarrollo de Aplicaciones Web.

Parte de la base de un proyecto real en producción que gestiona material promocional para una red de farmacias. Para el PI, todos los datos (usuarios, establecimientos, zonas, etc.) son **ficticios**. El proyecto real opera con datos reales de la empresa, pero esta entrega académica utiliza una copia anonimizada con datos de prueba generados específicamente para este fin.

El PI se entrega en dos fases:
- **Fase 1 (actual):** Backend — API REST completa con autenticación, gestión de roles, catálogo de materiales y flujo de solicitudes.
- **Fase 2 (desarrollo futuro):** Frontend — aplicación React que consume esta API.

---

## Descripción de la aplicación

La aplicación permite a una red de comerciales (delegados) solicitar material promocional (vinilos, batas, folletos, etc.) para las farmacias que gestionan. Los administradores aprueban, gestionan y hacen seguimiento de cada solicitud hasta su entrega.

### Roles

| Rol | Descripción |
|---|---|
| **ADMIN** | Acceso total. Gestiona usuarios, zonas, materiales, proveedores y establecimientos. Aprueba o rechaza solicitudes y las mueve por el flujo de estados. |
| **GERENTE** | Ve las farmacias y solicitudes de su zona. Puede crear solicitudes para los establecimientos de su zona y para eventos. |
| **DELEGADO** | Ve únicamente sus farmacias asignadas y sus propias solicitudes. Puede crear solicitudes y marcarlas como completadas una vez recibido el material. |

### Flujo de una solicitud

```
PENDIENTE → EN_FABRICACION → ENVIADA → COMPLETADA
              └→ RECHAZADA
```

- El **DELEGADO** o **GERENTE** crea la solicitud (`PENDIENTE`).
- El **ADMIN** la aprueba (`EN_FABRICACION`) o rechaza. Al aprobar, se fija la dirección de entrega y se envía un email al fabricante/proveedor con un enlace de confirmación.
- El **fabricante** confirma el envío accediendo al enlace (`ENVIADA`).
- El **DELEGADO** marca la solicitud como completada cuando recibe el material (`COMPLETADA`).

---

## Stack tecnológico

- **Runtime:** Node.js 20
- **Framework:** Express 5
- **ORM:** Prisma 5 + MySQL
- **Autenticación:** JWT (jsonwebtoken + bcryptjs)
- **Subida de archivos:** Multer + Sharp (procesado de imágenes a WebP)
- **Email:** Nodemailer
- **Documentación API:** Swagger (swagger-jsdoc + swagger-ui-express)

---

## Requisitos previos

- Node.js >= 20
- MySQL >= 8 (en ejecución)
- npm

---

## Instalación y configuración

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/albertosancho/pi-material-farmacias.git
cd pi-material-farmacias/backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp .env.example .env
```

Variables obligatorias:

```env
NODE_ENV=dev
PORT=3000

# Cadena de conexión MySQL
DATABASE_URL="mysql://usuario:password@localhost:3306/pi_material_farmacias"

# Ruta local donde se almacenan los archivos subidos
FILES_PATH=/ruta/absoluta/al/backend/files

# URL pública desde la que se sirven los archivos
FILES_URL=http://localhost:3000/files

# JWT
JWT_SECRET=cambia_esto_por_un_secreto_seguro
JWT_EXPIRATION=24h

# URL pública de la app
APP_URL=http://localhost:3000
```

> Las variables SMTP son opcionales. Sin ellas, el servidor funciona correctamente pero no enviará emails de notificación.

### 3. Crear la base de datos

```sql
CREATE DATABASE pi_material_farmacias;
```

### 4. Ejecutar migraciones y seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

El seed carga datos ficticios:
- 2 gerencias (Centro y Sur), 4 zonas (Madrid Centro, Madrid Periferia, Sevilla, Córdoba)
- 13 usuarios (1 admin, 4 gerentes, 8 delegados)
- 22 establecimientos (16 farmacias, 6 clínicas)
- Materiales y proveedores de ejemplo

**Credenciales de acceso (todos los usuarios):** `password123`

**Usuario admin:** consultar el seed en `prisma/seed.js` o listar usuarios tras el seed.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`.

---

## Estructura del proyecto

```
backend/
├── prisma/
│   ├── schema.prisma       # Modelos de base de datos
│   ├── migrations/         # Migraciones generadas por Prisma
│   └── seed.js             # Datos ficticios de prueba
├── src/
│   ├── app.js              # Configuración de Express y rutas
│   ├── swagger.js          # Configuración de Swagger/OpenAPI
│   ├── controllers/        # Lógica de negocio por recurso
│   ├── routes/             # Definición de rutas + documentación Swagger
│   ├── middleware/         # Autenticación, autorización, validación
│   ├── validators/         # Reglas de validación (express-validator)
│   ├── lib/                # Utilidades: Prisma, JWT, email, archivos
│   └── constants/          # Constantes de la aplicación
├── files/                  # Archivos subidos (avatares, imágenes de materiales, fotos)
├── server.js               # Punto de entrada
├── .env.example            # Plantilla de variables de entorno
└── package.json
```

---

## Documentación de la API

Con el servidor en marcha, la documentación interactiva (Swagger UI) está disponible en:

```
http://localhost:3000/api-docs
```

Desde ahí puedes autenticarte con el botón **Authorize** (usar el token obtenido en `POST /api/auth/login`) y probar todos los endpoints directamente.

### Resumen de endpoints

#### Auth
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/register` | Registrar usuario | Público (solo dev) |
| GET | `/api/auth/me` | Datos del usuario autenticado | Todos |
| PATCH | `/api/auth/profile` | Actualizar perfil propio | Todos |
| PATCH | `/api/auth/avatar` | Subir avatar propio | Todos |

#### Usuarios
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/usuarios` | Listar usuarios | ADMIN |
| GET | `/api/usuarios/:id` | Ver usuario | ADMIN / propio usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario | ADMIN |
| DELETE | `/api/usuarios/:id` | Desactivar usuario | ADMIN |

#### Zonas
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/zonas` | Listar zonas | Todos |
| GET | `/api/zonas/:id` | Ver zona | Todos |
| POST | `/api/zonas` | Crear zona | ADMIN |
| PUT | `/api/zonas/:id` | Actualizar zona | ADMIN |

#### Gerencias
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/gerencias` | Listar gerencias | Todos |
| GET | `/api/gerencias/:id` | Ver gerencia | Todos |
| POST | `/api/gerencias` | Crear gerencia | ADMIN |
| PUT | `/api/gerencias/:id` | Actualizar gerencia | ADMIN |

#### Establecimientos
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/establecimientos` | Listar establecimientos | Todos (filtrado por rol) |
| GET | `/api/establecimientos/:id` | Ver establecimiento | Todos (filtrado por rol) |
| POST | `/api/establecimientos` | Crear establecimiento | ADMIN |
| PUT | `/api/establecimientos/:id` | Actualizar establecimiento | ADMIN |
| DELETE | `/api/establecimientos/:id` | Desactivar establecimiento | ADMIN |

#### Materiales
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/materiales` | Listar materiales | Todos (filtrado por rol) |
| GET | `/api/materiales/:id` | Ver material | Todos |
| POST | `/api/materiales` | Crear material | ADMIN |
| PUT | `/api/materiales/:id` | Actualizar material | ADMIN |
| DELETE | `/api/materiales/:id` | Desactivar material | ADMIN |
| POST | `/api/materiales/:id/imagen` | Subir imagen principal | ADMIN |
| DELETE | `/api/materiales/:id/imagen` | Eliminar imagen principal | ADMIN |
| POST | `/api/materiales/:id/galeria` | Añadir imagen a galería | ADMIN |
| DELETE | `/api/materiales/:id/galeria/:filename` | Eliminar imagen de galería | ADMIN |

#### Marcas
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/marcas` | Listar marcas | Todos |
| GET | `/api/marcas/:id` | Ver marca | Todos |
| POST | `/api/marcas` | Crear marca | ADMIN |
| PUT | `/api/marcas/:id` | Actualizar marca | ADMIN |
| DELETE | `/api/marcas/:id` | Desactivar marca | ADMIN |

#### Proveedores
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/proveedores` | Listar proveedores | Todos |
| GET | `/api/proveedores/:id` | Ver proveedor | Todos |
| POST | `/api/proveedores` | Crear proveedor | ADMIN |
| PUT | `/api/proveedores/:id` | Actualizar proveedor | ADMIN |
| DELETE | `/api/proveedores/:id` | Desactivar proveedor | ADMIN |

#### Solicitudes
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/solicitudes` | Listar solicitudes | Todos (filtrado por rol) |
| GET | `/api/solicitudes/presupuesto` | Consultar gasto anual | Todos |
| GET | `/api/solicitudes/:id` | Ver solicitud | Todos (filtrado por rol) |
| POST | `/api/solicitudes` | Crear solicitud | ADMIN, GERENTE, DELEGADO |
| PATCH | `/api/solicitudes/:id/estado` | Cambiar estado (aprobar/rechazar) | ADMIN |
| PATCH | `/api/solicitudes/:id/completar` | Marcar como completada | ADMIN, GERENTE, DELEGADO |
| POST | `/api/solicitudes/:id/fotos` | Subir foto de instalación | Todos |
| DELETE | `/api/solicitudes/:id/fotos/:fotoId` | Eliminar foto de instalación | ADMIN |
| POST | `/api/solicitudes/:id/archivos-personalizacion` | Subir archivo de personalización | ADMIN, GERENTE, DELEGADO |

#### Configuración
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/configuracion` | Ver configuración del sistema | Todos |
| PUT | `/api/configuracion` | Actualizar configuración | ADMIN |

#### Fabricante (público)
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/api/fabricante/confirmar/:token` | Confirmar envío de pedido | Público (enlace por email) |
