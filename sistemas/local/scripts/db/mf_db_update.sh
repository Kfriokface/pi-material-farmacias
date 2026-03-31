#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "######################################################################################################"
echo "Ejecutar updates en la base de datos - Material Farmacias"
echo "######################################################################################################"
echo

cd ${MF_ROOT_BACKEND}

echo "Ejecutando updates de base de datos con Prisma..."
echo

npx prisma migrate deploy

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
