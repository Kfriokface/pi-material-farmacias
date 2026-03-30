# Material Farmacias — Frontend

Aplicación web para la gestión de material promocional y corporativo para farmacias.

Consume la API REST del [backend](../backend/README.md).

---

## Stack tecnológico

- **Framework:** React 19 + Vite 7
- **Routing:** React Router v7
- **Estado global:** Zustand
- **Peticiones HTTP:** Axios + TanStack Query
- **Formularios:** React Hook Form
- **Estilos:** Tailwind CSS
- **PWA:** vite-plugin-pwa

---

## Instalación

```bash
cd frontend
npm install
```

---

## Configuración

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

Sin `.env`, la aplicación apunta a `http://localhost:3000/api` por defecto, lo que funciona si ejecutas el backend en local con su configuración estándar.

> Si quieres acceder desde otro equipo en la misma red, puedes añadir un alias en tu archivo `hosts`:
> ```
> 127.0.0.1   materiales.local
> ```
> Y configurar `VITE_API_URL=http://materiales.local:3000/api` en tu `.env`.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación arranca en `http://localhost:5173`.

El backend debe estar en marcha (ver [backend/README.md](../backend/README.md)).

---

## Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` lista para desplegar en el servidor.
