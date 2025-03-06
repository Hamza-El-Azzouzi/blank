#!/bin/bash
docker stop blank-server-container blank-ui-container
docker rm blank-server-container blank-ui-container
docker rmi blank-server blank-ui
