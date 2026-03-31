#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${MF_ROOT_BACKUPS}/files/files__${MF_ENV}__${MF_USER}__${FECHA}.tar.gz"

echo "######################################################################################################"
echo "Backup de Archivos - Material Farmacias"
echo "######################################################################################################"
echo
echo "Entorno:  ${MF_ENV}"
echo "Usuario:  ${MF_USER}"
echo
echo "Archivo:  ${BACKUP_FILE}"
echo "######################################################################################################"
echo

# Crear directorio si no existe
mkdir -p ${MF_ROOT_BACKUPS}/files

echo "Creando backup de archivos..."
echo "  - Avatars: ${MF_ROOT_BACKEND_FILES}/avatars"
echo "  - Materiales: ${MF_ROOT_BACKEND_FILES}/materiales"
echo

# Crear tar.gz excluyendo backups y temp
cd ${MF_ROOT_BACKEND_FILES}
tar -czf ${BACKUP_FILE} --exclude='temp' avatars/ materiales/

if [ $? -eq 0 ]; then
  echo
  echo "Backup completado:"
  ls -lh "${BACKUP_FILE}"

  # Mostrar contenido del backup
  echo
  echo "Contenido del backup:"
  tar -tzf ${BACKUP_FILE} | head -20
  echo "..."
else
  echo
  echo "Error al generar backup"
  exit 1
fi

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
