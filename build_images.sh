#!/bin/bash
docker network create blank-network
# Navigate to the backend folder and run the script
cd ./backend
./script.sh

# Check if the backend script run successfully
if [ $? -ne 0 ]; then
    echo "Backend script failed. Exiting."
    exit 1
fi
cd ..
# Navigate to the frontend folder and run the script
cd ./frontend
./script.sh

# Check if the frontend script run successfully
if [ $? -ne 0 ]; then
    echo "Frontend script failed."
    exit 1
fi

echo "Both scripts run successfully."
docker system prune -a
docker images
docker container ps
docker logs -f blank-server-container
docker logs -f blank-ui-container