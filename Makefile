# Start containers
start:
	@echo "Starting Docker containers..."
	docker compose -f docker-compose.yml up -d
	@echo "Containers are running."

# Stop containers
stop:
	@echo "Stopping Docker containers..."
	docker compose -f docker-compose.yml down
	@echo "Containers have been stopped."

# Rebuild containers from scratch
rebuild:
	@echo "Rebuilding Docker containers..."
	docker compose -f docker-compose.yml down --volumes
	docker compose -f docker-compose.yml up --build -d
	@echo "Rebuild complete."