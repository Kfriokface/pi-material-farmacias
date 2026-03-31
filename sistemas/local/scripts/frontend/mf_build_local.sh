#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "######################################################################################################"
echo "Build frontend — LOCAL"
echo "  Modo: development"
echo "  Output: ${MF_ROOT_FRONTEND}/dist"
echo "######################################################################################################"
echo

cd ${MF_ROOT_FRONTEND}

echo "[1/2] Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then echo "ERROR: npm install falló"; exit 1; fi
echo

echo "[2/2] Construyendo..."
npm run build -- --mode development
if [ $? -ne 0 ]; then echo "ERROR: build falló"; exit 1; fi
echo

echo "######################################################################################################"
echo "Build completado → ${MF_ROOT_FRONTEND}/dist"
echo "######################################################################################################"
echo
