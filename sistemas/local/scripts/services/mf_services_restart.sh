#!/bin/bash -i

source ${MF_ROOT_SCRIPTS}/mf_vars.sh

${MF_ROOT_SCRIPTS}/scripts/services/mf_services_stop.sh
sleep 2
${MF_ROOT_SCRIPTS}/scripts/services/mf_services_start.sh
