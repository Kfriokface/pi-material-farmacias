#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "######################################################################################################"
echo "Deteniendo servicios de Material Farmacias"
echo "######################################################################################################"
echo

# Detener backend y frontend
echo "Deteniendo backend y frontend..."
pm2 delete backend frontend 2>/dev/null
if [ $? -eq 0 ]; then
  echo "Backend y Frontend detenidos"
else
  echo "Backend/Frontend no estaban corriendo"
fi

echo

# Detener MySQL
echo "Deteniendo MySQL..."
read -p "¿Detener MySQL en puerto ${MF_DB_PORT}? Esto afectará a otros proyectos en este puerto (s/n): " CONFIRM
if [[ "$CONFIRM" =~ ^[Ss]$ ]]; then
  sudo systemctl stop mysql
  echo "MySQL detenido"
else
  echo "MySQL se mantiene corriendo"
fi

echo
pm2 list
echo
echo "######################################################################################################"
echo "Servicios detenidos"
echo "######################################################################################################"
echo
