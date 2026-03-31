#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

BACKUP_DIR="${MF_ROOT_BACKUPS}/mysql"
REMOTE_PATH="${MF_REMOTE_USER}@${MF_REMOTE_HOST}:${MF_REMOTE_PATH}/mysql/"

echo "######################################################################################################"
echo "Almacenar Backups en Servidor Remoto"
echo "######################################################################################################"
echo

# Listar backups locales del usuario actual
BACKUPS=$(ls -t ${BACKUP_DIR}/bd__${MF_ENV}__*.sql.gz 2>/dev/null)

if [ -z "$BACKUPS" ]; then
  echo "No hay backups disponibles para subir"
  exit 1
fi

echo "Backups disponibles:"
echo
ls -lht ${BACKUP_DIR}/bd__${MF_ENV}__*.sql.gz | head -5

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

scp -P ${MF_REMOTE_PORT} ${BACKUP_DIR}/bd__${MF_ENV}__*.sql.gz ${REMOTE_PATH}

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
