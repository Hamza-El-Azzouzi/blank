docker build -t blank-ui .
docker run -d --name blank-ui-container --network=blank-network -p 3000:3000 -e NEXT_PUBLIC_BACK_END_DOMAIN=http://127.0.0.1:1414/ blank-ui
# docker run -d --network=blank-network -p 3000:3000 --name blank-ui-container blank-ui
docker container ps
docker images
docker logs blank-ui-container
docker system prune -a
