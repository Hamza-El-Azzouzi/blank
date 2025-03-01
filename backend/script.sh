docker build -t blank-server .
docker run -d --network=blank-network -p 1414:1414 --name blank-server-container blank-server
docker container ps
docker images
docker logs blank-server-container
docker system prune -a
