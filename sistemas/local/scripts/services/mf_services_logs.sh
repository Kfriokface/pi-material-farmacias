#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

echo "Mostrando logs de backend y frontend..."
echo "Presiona Ctrl+C para salir"
echo

pm2 logs
