docker network create blank-network 2>/dev/null || true
docker build -t blank-server .

docker run -d --network=blank-network -p 1414:1414 --name blank-server-container blank-server


