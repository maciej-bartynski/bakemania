build:
	docker stop bakemania-container || true && \
	docker rm bakemania-container || true && \
	docker rmi bakemania-app || true && \
	docker build -t bakemania-app .

build-staging:
	docker stop staging-bakemania-container || true && \
	docker rm staging-bakemania-container || true && \
	docker rmi staging-bakemania-app || true && \
	docker build -t staging-bakemania-app .

build-local:
	docker stop local-bakemania-container || true && \
	docker rm local-bakemania-container || true && \
	docker rmi local-bakemania-app || true && \
	docker build -t local-bakemania-app .

start:
	docker run -d \
	--env-file .env \
	-p 3000:3000 \
	-v ./db:/app/db \
	-v ./logs:/app/logs \
	--name bakemania-container bakemania-app

start-staging:
	docker run -d \
	--env-file .env \
	-p 3001:3000 \
	-v ./db:/app/db \
	-v ./logs:/app/logs \
	--name staging-bakemania-container staging-bakemania-app

start-local:
	docker run -d \
	--env-file .env \
	-p 3000:3000 \
	-v ./db:/app/db \
	-v ./logs:/app/logs \
	--name local-bakemania-container local-bakemania-app

get-in:
	docker exec -it bakemania-container sh

get-in-staging:
	docker exec -it staging-bakemania-container sh

get-in-local:
	docker exec -it local-bakemania-container sh

see-logs:
	docker logs -f bakemania-container

see-logs-staging:
	docker logs -f staging-bakemania-container

see-logs-local:
	docker logs -f local-bakemania-container

reset-db: 
	npm run build && npm run reset-db