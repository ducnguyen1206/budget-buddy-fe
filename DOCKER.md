# Docker Setup Guide

This guide explains how to run the Budget Buddy frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### Production Build (Recommended)

Build and run the production version with nginx:

```bash
# Build and run
docker-compose up budget-buddy-prod --build

# Or run in detached mode
docker-compose up -d budget-buddy-prod --build
```

The application will be available at: `http://localhost:3000`

### Development Mode

Run the development server with hot-reload:

```bash
# Build and run
docker-compose up budget-buddy-dev --build

# Or run in detached mode
docker-compose up -d budget-buddy-dev --build
```

The application will be available at: `http://localhost:5173`

## Docker Commands

### Build Only

```bash
# Production build
docker build -t budget-buddy:latest -f Dockerfile .

# Development build
docker build -t budget-buddy:dev -f Dockerfile.dev .
```

### Run Container

```bash
# Production
docker run -d -p 3000:80 --name budget-buddy-prod budget-buddy:latest

# Development
docker run -d -p 5173:5173 --name budget-buddy-dev budget-buddy:dev
```

### Stop Containers

```bash
# Stop using docker-compose
docker-compose down

# Stop individual container
docker stop budget-buddy-prod
docker stop budget-buddy-dev
```

### View Logs

```bash
# Using docker-compose
docker-compose logs -f budget-buddy-prod
docker-compose logs -f budget-buddy-dev

# Using docker
docker logs -f budget-buddy-prod
docker logs -f budget-buddy-dev
```

### Remove Containers

```bash
# Remove using docker-compose
docker-compose down -v

# Remove individual container
docker rm budget-buddy-prod
docker rm budget-buddy-dev
```

## Environment Variables

To use environment variables, create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For development, you can also pass environment variables:

```bash
docker run -d -p 5173:5173 \
  -e VITE_API_BASE_URL=http://localhost:8080 \
  --name budget-buddy-dev \
  budget-buddy:dev
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use, change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Rebuild After Changes

If you make changes to dependencies or Dockerfile:

```bash
docker-compose build --no-cache budget-buddy-prod
docker-compose up budget-buddy-prod
```

### Access Container Shell

```bash
# Production container
docker exec -it budget-buddy-prod sh

# Development container
docker exec -it budget-buddy-dev sh
```

## Production Deployment

For production deployment, consider:

1. Using environment-specific `.env` files
2. Setting up SSL/TLS with a reverse proxy
3. Configuring proper CORS settings
4. Setting up CI/CD pipeline for automated builds

