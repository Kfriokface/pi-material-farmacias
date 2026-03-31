#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "######################################################################################################"
echo "Iniciando servicios de Material Farmacias"
echo "######################################################################################################"
echo

# Iniciar MySQL
echo "Iniciando MySQL (puerto ${MF_DB_PORT})..."
sudo systemctl start mysql
if [ $? -eq 0 ]; then
  echo "MySQL iniciado en puerto ${MF_DB_PORT}"
else
  echo "Error al iniciar MySQL"
fi

echo

# Iniciar backend con PM2
echo "Iniciando backend..."
cd ${MF_ROOT_BACKEND}
pm2 delete backend 2>/dev/null
pm2 start npm --name backend -- run dev
echo "Backend iniciado con PM2"

echo

# Iniciar frontend con PM2
echo "Iniciando frontend..."
cd ${MF_ROOT_FRONTEND}
pm2 delete frontend 2>/dev/null
pm2 start npm --name frontend -- run dev
echo "Frontend iniciado con PM2"

echo
pm2 list
echo
echo "######################################################################################################"
echo "Servicios iniciados"
echo "  - MySQL:    localhost:${MF_DB_PORT}"
echo "  - Backend:  http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "Ver logs en tiempo real:"
echo "  pm2 logs backend"
echo "  pm2 logs frontend"
echo "  pm2 logs        (ambos)"
echo "######################################################################################################"
echo
