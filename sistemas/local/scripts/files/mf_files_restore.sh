#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

BACKUP_DIR="${MF_ROOT_BACKUPS}/files"

echo "######################################################################################################"
echo "Restaurar Backup de Archivos - Material Farmacias"
echo "######################################################################################################"
echo

# Selector de entorno para filtrar backups
echo "¿Backups de qué entorno quieres ver?"
echo
echo "  1) Todos"
echo "  2) local"
echo
read -p "Selecciona (1-2): " ENV_OPTION

case $ENV_OPTION in
  1) PATTERN="files__*__*.tar.gz" ;;
  2) PATTERN="files__local__*.tar.gz" ;;
  *) echo "Opción inválida"; exit 1 ;;
esac

echo
echo "Backups disponibles en ${BACKUP_DIR}:"
echo

mapfile -t BACKUPS < <(ls -t ${BACKUP_DIR}/${PATTERN} 2>/dev/null)

if [ ${#BACKUPS[@]} -eq 0 ]; then
  echo "No hay backups disponibles"
  exit 1
fi

for i in "${!BACKUPS[@]}"; do
  INFO=$(ls -lh "${BACKUPS[$i]}" | awk '{print $5, $6, $7, $8}')
  echo "  $((i+1))) $(basename ${BACKUPS[$i]})  [${INFO}]"
done

echo
read -p "Selecciona el backup a restaurar (1-${#BACKUPS[@]}): " SELECTION

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#BACKUPS[@]} ]; then
  echo "Selección inválida"
  exit 1
fi

BACKUP_FILE="${BACKUPS[$((SELECTION-1))]}"

echo
echo "Archivo seleccionado: $(basename ${BACKUP_FILE})"
echo
echo "ADVERTENCIA: Esto SOBRESCRIBIRÁ los archivos actuales en:"
echo "  - ${MF_ROOT_BACKEND_FILES}/avatars"
echo "  - ${MF_ROOT_BACKEND_FILES}/materiales"
echo
read -p "¿Estás seguro? (escribe 'SI' para continuar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
  echo "Restauración cancelada"
  exit 0
fi

echo
echo "Restaurando archivos..."
cd ${MF_ROOT_BACKEND_FILES}
tar -xzf ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo
  echo "Archivos restaurados correctamente"
else
  echo
  echo "Error al restaurar archivos"
  exit 1
fi

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
