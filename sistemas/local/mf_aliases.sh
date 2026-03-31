#!/bin/bash

##################################
# ALIASES ########################
##################################

# Cargar variables
source ${MF_ROOT_SCRIPTS}/mf_vars.sh

# Navegación
alias mf_ws_home="echo; echo 'Yendo a la raíz del workspace: ${MF_ROOT_WS}'; echo; cd ${MF_ROOT_WS}"
alias mf_backend_home="echo; echo 'Yendo al backend: ${MF_ROOT_BACKEND}'; echo; cd ${MF_ROOT_BACKEND}"
alias mf_frontend_home="echo; echo 'Yendo al frontend: ${MF_ROOT_FRONTEND}'; echo; cd ${MF_ROOT_FRONTEND}"
alias mf_files_home="echo; echo 'Yendo a files: ${MF_ROOT_FILES}'; echo; cd ${MF_ROOT_FILES}"
alias mf_backups_home="echo; echo 'Yendo a backups: ${MF_ROOT_BACKUPS}'; echo; cd ${MF_ROOT_BACKUPS}"
alias mf_backend_files_home="echo; echo 'Yendo a files: ${MF_ROOT_BACKEND_FILES}'; echo; cd ${MF_ROOT_BACKEND_FILES}"
alias mf_scripts_home="echo; echo 'Yendo a scripts: ${MF_ROOT_SCRIPTS}'; echo; cd ${MF_ROOT_SCRIPTS}"

# Ayudas
alias ayuda_mf="cat ${MF_ROOT_SCRIPTS}/ayuda/ayuda_mf.help.txt"
alias ayuda_mf_db="cat ${MF_ROOT_SCRIPTS}/ayuda/ayuda_mf_db.help.txt"

# Servicios
alias mf_services_start="${MF_ROOT_SCRIPTS}/scripts/services/mf_services_start.sh"
alias mf_services_stop="${MF_ROOT_SCRIPTS}/scripts/services/mf_services_stop.sh"
alias mf_services_restart="${MF_ROOT_SCRIPTS}/scripts/services/mf_services_restart.sh"
alias mf_services_logs="${MF_ROOT_SCRIPTS}/scripts/services/mf_services_logs.sh"

# Base de datos
alias mf_db_migrate="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_migrate.sh"
alias mf_db_update="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_update.sh"
alias mf_db_reset="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_reset.sh"
alias mf_db_seed="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_seed.sh"
alias mf_db_import_data="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_import_data.sh"
alias mf_db_backup="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_backup.sh"
alias mf_db_restore="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_restore.sh"
alias mf_db_store="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_store.sh"
alias mf_db_get="${MF_ROOT_SCRIPTS}/scripts/db/mf_db_get.sh"

# Files
alias mf_files_backup="${MF_ROOT_SCRIPTS}/scripts/files/mf_files_backup.sh"
alias mf_files_restore="${MF_ROOT_SCRIPTS}/scripts/files/mf_files_restore.sh"
alias mf_files_store="${MF_ROOT_SCRIPTS}/scripts/files/mf_files_store.sh"
alias mf_files_get="${MF_ROOT_SCRIPTS}/scripts/files/mf_files_get.sh"

# Frontend builds
alias mf_build_local="${MF_ROOT_SCRIPTS}/scripts/frontend/mf_build_local.sh"
