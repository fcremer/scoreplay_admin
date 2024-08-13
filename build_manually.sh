#!/bin/bash

###############################################################################
# Script Name:    build_manually.sh
# Description:    manually builds ionic app, creates container and pushes to Docker Hub
# Author:         Fabian CREMER
# Created:        2024-08-12
# Version:        1.0
# License:        MIT License
#
# Usage:          ./build_manually.sh
#
# Revision History:
# Date            Author          Version      Description
# ----            ------          -------      -----------
# 2024-08-12      Fabian CREMER       1.0          Initial version
###############################################################################

ionic build -prod        
podman build -t fabiancemer/scoreplay_admin:latest . --log-level=debug 
podman tag localhost/fabiancemer/scoreplay_admin docker.io/fabiancremer/scoreplay_admin:latest
podman push docker.io/fabiancremer/scoreplay_admin:latest  