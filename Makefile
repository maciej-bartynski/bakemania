build:
	docker stop bakemania-container || true && docker rm bakemania-container || true && docker build -t bakemania-app .

start:
	docker run -d \
	--env-file .env.prod \
	-p 3000:3000 \
	-v ./db \
	--name bakemania-container bakemania-app