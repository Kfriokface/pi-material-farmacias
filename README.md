# Material Farmacias

Aplicación web para la gestión de material promocional y corporativo para una red de farmacias.

Proyecto Intermodular del Grado Superior de Desarrollo de Aplicaciones Web.

---

## Descripción

La aplicación permite a una red de comerciales (gerentes y delegados) solicitar material promocional (vinilos, batas, folletos, etc.) para las farmacias que gestionan. Los administradores aprueban, gestionan y hacen seguimiento de cada solicitud hasta su entrega.

### Roles

| Rol | Descripción |
|---|---|
| **ADMIN** | Acceso total. Gestiona usuarios, áreas, materiales, proveedores y establecimientos. Aprueba o rechaza solicitudes y las mueve por el flujo de estados. |
| **GERENTE** | Ve las farmacias y solicitudes de su área. Puede crear solicitudes para los establecimientos de su área y marcarlas como completadas una vez recibido el material. |
| **DELEGADO** | Ve únicamente sus farmacias asignadas y sus propias solicitudes. Puede crear solicitudes y marcarlas como completadas una vez recibido el material. |

### Flujo de una solicitud

```
PENDIENTE → EN_FABRICACION → COMPLETADA
              └→ RECHAZADA
```

- El **DELEGADO** o **GERENTE** crea la solicitud (`PENDIENTE`).
- El **ADMIN** la aprueba (`EN_FABRICACION`) o rechaza. Al aprobar, se fija la dirección de entrega y se notifica al proveedor por email.
- El **DELEGADO** o **GERENTE** marca su propia solicitud como completada cuando recibe el material (`COMPLETADA`).

---

## Estructura del repositorio

```
pi-material-farmacias/
├── backend/    # API REST (Node.js + Express + Prisma + MySQL)
└── frontend/   # Aplicación web (React + Vite)
```

- [backend/README.md](backend/README.md) — instalación y documentación de la API
- [frontend/README.md](frontend/README.md) — instalación y configuración del frontend

---

## Requisitos previos

- Node.js >= 20
- MySQL >= 8
- npm
