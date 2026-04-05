# Sistemas — Entorno local

Scripts Bash para la operación y mantenimiento de la aplicación en local. Proporcionan comandos abreviados para las tareas habituales de desarrollo: gestión de servicios, base de datos, archivos y builds.

> Requiere Linux o WSL (Windows Subsystem for Linux). No es compatible con CMD ni PowerShell.

## Instalación

```bash
cd sistemas/local
bash install.sh
source ~/.bashrc
```

El script de instalación registra los alias y variables en `~/.bashrc`. Solo es necesario ejecutarlo una vez. Para verificar que todo está disponible:

```bash
ayuda_mf
```

## Comandos disponibles

### Navegación

| Comando | Descripción |
|---|---|
| `mf_ws_home` | Raíz del workspace |
| `mf_backend_home` | Directorio del backend |
| `mf_frontend_home` | Directorio del frontend |
| `mf_files_home` | Carpeta de archivos subidos |
| `mf_backups_home` | Carpeta de backups |
| `mf_scripts_home` | Carpeta de scripts |

### Servicios

| Comando | Descripción |
|---|---|
| `mf_services_start` | Inicia backend y frontend |
| `mf_services_stop` | Detiene backend y frontend |
| `mf_services_restart` | Reinicia backend y frontend |
| `mf_services_logs` | Muestra los logs de los servicios |

### Base de datos

| Comando | Descripción |
|---|---|
| `mf_db_migrate` | Ejecuta migraciones pendientes (`prisma migrate dev`) |
| `mf_db_update` | Despliega migraciones en entorno existente (`prisma migrate deploy`) |
| `mf_db_reset` | Resetea la base de datos (`prisma migrate reset --skip-seed`) |
| `mf_db_seed` | Carga los datos iniciales (`prisma db seed`) |
| `mf_db_import_data` | Importa usuarios, establecimientos y zonas desde Excel |
| `mf_db_backup` | Genera un backup local comprimido (`.sql.gz`) |
| `mf_db_restore` | Restaura un backup local (selección interactiva) |
| `mf_db_store` | Sube backups locales al servidor remoto |
| `mf_db_get` | Descarga backups desde el servidor remoto |

### Archivos

| Comando | Descripción |
|---|---|
| `mf_files_backup` | Backup de archivos subidos (avatars, imágenes de materiales) |
| `mf_files_restore` | Restaura un backup de archivos |
| `mf_files_store` | Sube el backup de archivos al servidor remoto |
| `mf_files_get` | Descarga el backup de archivos desde el servidor remoto |

### Build

| Comando | Descripción |
|---|---|
| `mf_build_local` | Genera el `dist/` del frontend en modo development |

## Configuración

Las rutas del proyecto se calculan automáticamente a partir de la ubicación del repositorio. Solo es necesario revisar las credenciales de base de datos en `mf_vars.sh` si difieren de los valores por defecto:

```bash
MF_DB_NAME="pi_material_farmacias"   # Nombre de la base de datos
MF_DB_USER="root"                    # Usuario MySQL
```

La contraseña de MySQL (`MF_DB_PASS`) se solicita de forma interactiva en cada operación que la requiere.

## Flujo habitual

```bash
# Primera vez
mf_db_migrate
mf_db_import_data
mf_db_seed

# Operación diaria
mf_services_start
mf_db_backup
mf_db_store
```
