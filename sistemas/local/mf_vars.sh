#!/bin/bash

##################################
# VARIABLES ######################
##################################

MF_ENV="local"

# Rutas principales
# MF_ROOT_SCRIPTS se exporta desde install.sh — deriva el resto a partir de él
MF_ROOT_WS="$(dirname "$(dirname "$MF_ROOT_SCRIPTS")")"
MF_ROOT_FILES="${MF_ROOT_WS}/files"
MF_ROOT_CODE="${MF_ROOT_WS}"
MF_ROOT_BACKEND="${MF_ROOT_CODE}/backend"
MF_ROOT_FRONTEND="${MF_ROOT_CODE}/frontend"
MF_ROOT_BACKEND_FILES="${MF_ROOT_BACKEND}/files"
MF_ROOT_BACKUPS="${MF_ROOT_FILES}/backups"
MF_ROOT_SCRIPTS="${MF_ROOT_WS}/sistemas/${MF_ENV}"

# Base de datos
MF_DB_HOST="localhost"
MF_DB_PORT="3306"
MF_DB_NAME="pi_material_farmacias"
MF_DB_USER="root"
MF_DB_PASS=""  # Se pedirá interactivamente

# Usuario actual
MF_USER=$(whoami)

# Servidor remoto (para mf_db_store, mf_db_get, mf_files_store, mf_files_get)
# Configura estos valores según tu entorno antes de usar los comandos de sincronización remota
MF_REMOTE_HOST=""       # IP o dominio del servidor remoto
MF_REMOTE_PORT="22"     # Puerto SSH
MF_REMOTE_USER=""       # Usuario SSH
MF_REMOTE_PATH=""       # Ruta remota donde almacenar los backups
