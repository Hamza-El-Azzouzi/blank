docker build -t blank-ui .

docker run -d --network=blank-network -p 3000:3000 --name blank-ui-container blank-ui

