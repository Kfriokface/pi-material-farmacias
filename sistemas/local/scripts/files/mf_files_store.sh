#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

BACKUP_DIR="${MF_ROOT_BACKUPS}/files"
REMOTE_PATH="${MF_REMOTE_USER}@${MF_REMOTE_HOST}:${MF_REMOTE_PATH}/files/"

echo "######################################################################################################"
echo "Almacenar Backups de Archivos en Servidor Remoto"
echo "######################################################################################################"
echo

# Listar backups locales del usuario actual
BACKUPS=$(ls -t ${BACKUP_DIR}/files__${MF_ENV}__*.tar.gz 2>/dev/null)

if [ -z "$BACKUPS" ]; then
  echo "No hay backups disponibles para subir"
  exit 1
fi

echo "Backups disponibles:"
echo
ls -lht ${BACKUP_DIR}/files__${MF_ENV}__*.tar.gz | head -5

echo
read -p "¿Subir todos los backups listados? (s/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
  echo "Operación cancelada"
  exit 0
fi

echo
echo "Subiendo backups a:"
echo "  ${REMOTE_PATH}"
echo

scp -P ${MF_REMOTE_PORT} ${BACKUP_DIR}/files__${MF_ENV}__*.tar.gz ${REMOTE_PATH}

if [ $? -eq 0 ]; then
  echo
  echo "Backups almacenados correctamente"
else
  echo
  echo "Error al almacenar backups"
  exit 1
fi

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
