#!/bin/bash

# Build script for API Gateway
echo "🚀 Building API Gateway..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed! Build aborted.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Tests passed${NC}"

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t api-gateway:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Tag with version
VERSION=$(node -p "require('./package.json').version")
docker tag api-gateway:latest api-gateway:$VERSION
echo -e "${GREEN}✅ Tagged image as api-gateway:$VERSION${NC}"

echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo -e "${YELLOW}To run: docker-compose up -d${NC}"
