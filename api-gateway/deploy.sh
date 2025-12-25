#!/bin/bash

# Deploy script for API Gateway
echo "🚀 Deploying API Gateway..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please update .env with your actual values${NC}"
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
fi

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Build
echo -e "${YELLOW}Building application...${NC}"
bash build.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Deployment aborted.${NC}"
    exit 1
fi

# Start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker-compose up -d

# Wait for health check
echo -e "${YELLOW}Waiting for health check...${NC}"
sleep 5

# Check health
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API Gateway is healthy!${NC}"
        echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
        echo ""
        echo -e "${YELLOW}API Gateway is running at: http://localhost:3000${NC}"
        echo -e "${YELLOW}Health check: http://localhost:3000/health${NC}"
        echo -e "${YELLOW}Service status: http://localhost:3000/api/status${NC}"
        echo ""
        echo -e "${YELLOW}To view logs: npm run docker:logs${NC}"
        exit 0
    fi
    echo "Attempt $i/10: Waiting for service to be ready..."
    sleep 3
done

echo -e "${RED}❌ Health check failed! Service may not be running correctly.${NC}"
echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
exit 1
