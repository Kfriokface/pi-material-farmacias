#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

BACKUP_DIR="${MF_ROOT_BACKUPS}/files"
BASE_REMOTE_PATH="${MF_REMOTE_PATH%/${MF_ENV}}"

echo "######################################################################################################"
echo "Descargar Backups de Archivos desde Servidor Remoto"
echo "######################################################################################################"
echo

# Solo se trabaja en local
SELECTED_ENV="local"

echo "Entorno: ${SELECTED_ENV}"
echo
echo "Descargando desde:"
echo "  ${MF_REMOTE_USER}@${MF_REMOTE_HOST}:${BASE_REMOTE_PATH}/${SELECTED_ENV}/files/"
echo "Hacia:"
echo "  ${BACKUP_DIR}"
echo

# Crear directorio si no existe
mkdir -p ${BACKUP_DIR}

scp -P ${MF_REMOTE_PORT} "${MF_REMOTE_USER}@${MF_REMOTE_HOST}:${BASE_REMOTE_PATH}/${SELECTED_ENV}/files/files__${SELECTED_ENV}__*.tar.gz" ${BACKUP_DIR}/

if [ $? -eq 0 ]; then
  echo
  echo "Backups descargados correctamente:"
  echo
  ls -lht ${BACKUP_DIR}/files__${SELECTED_ENV}__*.tar.gz 2>/dev/null | head -5
else
  echo
  echo "Error al descargar backups (puede que no existan en el servidor)"
  exit 1
fi

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
