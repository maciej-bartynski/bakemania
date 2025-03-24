build:
	docker stop bakemania-container || true && docker rm bakemania-container || true && docker build -t bakemania-app .

start:
	docker run -d \
	--env-file .env \
	-p 3000:3000 \
	-v ./db:/app/db \
	--name bakemania-container bakemania-app

get-in:
	docker exec -it bakemania-container sh

see-logs:
	docker logs -f bakemania-container

dev:
	docker run -d \
	--env-file .env \
	-p 3000:3000 \
	-v ./db:/app/db \
	--name bakemania-container bakemania-app

reset-db: 
	npm run build && npm run reset-db