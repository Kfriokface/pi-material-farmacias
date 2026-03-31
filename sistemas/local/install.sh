#!/bin/bash

echo "######################################################################################################"
echo "Instalación de comandos Material Farmacias - Entorno LOCAL (PI)"
echo "######################################################################################################"
echo

# Obtener ruta absoluta del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MF_ROOT_SCRIPTS="$SCRIPT_DIR"

# Verificar que estamos en la ubicación correcta
if [[ ! "$SCRIPT_DIR" == *"/pi-material-farmacias/sistemas/local"* ]]; then
  echo "ERROR: Este script debe ejecutarse desde /media/pi-material-farmacias/sistemas/local"
  exit 1
fi

# Archivo bashrc del usuario
BASHRC="$HOME/.bashrc"

# Verificar si ya está instalado
if grep -q "# Material Farmacias Scripts" "$BASHRC"; then
  echo "Los comandos ya están instalados en $BASHRC"
  read -p "¿Quieres reinstalar? (s/n): " REINSTALL
  if [[ ! "$REINSTALL" =~ ^[Ss]$ ]]; then
    echo "Instalación cancelada."
    exit 0
  fi
  # Eliminar instalación anterior
  sed -i '/# Material Farmacias Scripts/,/# End Material Farmacias Scripts/d' "$BASHRC"
fi

# Añadir al bashrc
echo "" >> "$BASHRC"
echo "# Material Farmacias Scripts - Auto-generated $(date)" >> "$BASHRC"
echo "export MF_ROOT_SCRIPTS=\"$MF_ROOT_SCRIPTS\"" >> "$BASHRC"
echo "source \${MF_ROOT_SCRIPTS}/mf_vars.sh" >> "$BASHRC"
echo "source \${MF_ROOT_SCRIPTS}/mf_aliases.sh" >> "$BASHRC"
echo "# End Material Farmacias Scripts" >> "$BASHRC"

echo "Comandos instalados correctamente"
echo ""
echo "Para activar los comandos ejecuta:"
echo "  source ~/.bashrc"
echo ""
echo "O abre una nueva terminal."
echo ""
echo "Comandos disponibles:"
echo "  - ayuda_mf"
echo "  - mf_backend_home"
echo "  - mf_services_start"
echo "  - mf_db_backup"
echo "  - etc..."
echo ""
echo "######################################################################################################"
