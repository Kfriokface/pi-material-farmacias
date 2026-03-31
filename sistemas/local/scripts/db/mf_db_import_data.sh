#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "######################################################################################################"
echo "Ejecutar el script de importación de datos (import_data.js) - Material Farmacias"
echo "######################################################################################################"
echo

cd ${MF_ROOT_BACKEND}

echo "Ejecutando importación de datos..."
echo

node prisma/import_data.js

echo
echo "######################################################################################################"
echo "FIN"
echo "######################################################################################################"
echo
