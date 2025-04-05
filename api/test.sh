#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL - change this to test different environments
BASE_URL="http://localhost:3000"
#BASE_URL="https://your-vercel-url.vercel.app" # Uncomment to test production

echo -e "${GREEN}Testing API Endpoints${NC}\n"

# Test hit counter with various paths
echo -e "${GREEN}1. Testing hit counter for /test-page${NC}"
curl -v "${BASE_URL}/api/route?pathname=/test-page"
echo -e "\n"

echo -e "${GREEN}2. Testing hit counter for path without leading slash${NC}"
curl -v "${BASE_URL}/api/route?pathname=about"
echo -e "\n"

echo -e "${GREEN}3. Testing hit counter for path with special characters${NC}"
curl -v "${BASE_URL}/api/route?pathname=%2Fblog%2Fmy-first-post"
echo -e "\n"

echo -e "${GREEN}4. Testing hit counter without pathname (should error)${NC}"
curl -v "${BASE_URL}/api/route"
echo -e "\n"

# Test debug endpoint to verify counts
echo -e "${GREEN}5. Testing debug endpoint to verify counts${NC}"
curl -v "${BASE_URL}/api/debug"
echo -e "\n"

# Test TypeScript serve endpoint
echo -e "${GREEN}6. Testing TypeScript serve endpoint${NC}"
curl -v "${BASE_URL}/api/serve-ts?path=main"
echo -e "\n"

echo -e "\n\n✨ Tests completed!" 