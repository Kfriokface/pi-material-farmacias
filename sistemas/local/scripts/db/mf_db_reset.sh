#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "######################################################################################################"
echo "Ejecutar reset de la base de datos - Material Farmacias"
echo "######################################################################################################"
echo

cd ${MF_ROOT_BACKEND}

echo "Ejecutando reset de Prisma..."
echo

npx prisma migrate reset --skip-seed

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
