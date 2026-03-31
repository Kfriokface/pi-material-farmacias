#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${MF_ROOT_BACKUPS}/mysql/bd__${MF_ENV}__${MF_DB_NAME}__${MF_USER}__${FECHA}.sql"

echo "######################################################################################################"
echo "Backup de Base de Datos - Material Farmacias"
echo "######################################################################################################"
echo
echo "Entorno:  ${MF_ENV}"
echo "Base de datos: ${MF_DB_NAME}"
echo "Host:     ${MF_DB_HOST}:${MF_DB_PORT}"
echo "Usuario:  ${MF_USER}"
echo
echo "Archivo:  ${BACKUP_FILE}"
echo "######################################################################################################"
echo

# Crear directorio si no existe
mkdir -p ${MF_ROOT_BACKUPS}/mysql

# Realizar backup
echo "Generando backup..."
mysqldump --protocol=TCP -h ${MF_DB_HOST} -P ${MF_DB_PORT} -u ${MF_DB_USER} -p \
  --single-transaction --skip-lock-tables \
  ${MF_DB_NAME} > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  # Comprimir
  echo "Comprimiendo..."
  gzip ${BACKUP_FILE}

  echo
  echo "Backup completado:"
  ls -lh "${BACKUP_FILE}.gz"
else
  echo
  echo "Error al generar backup"
  rm -f ${BACKUP_FILE}
  exit 1
fi

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
