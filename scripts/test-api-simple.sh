#!/bin/bash

# Simple API test script that tests pandoc conversion instead of marp
# This should work without browser dependencies

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Testing Pandoc API endpoint...${NC}"

# Test markdown content
markdown_content='{
  "markdown": "# Test Document\n\nThis is a simple test document.\n\n## Features\n- **Bold text**\n- *Italic text*\n- Lists\n\n## Conclusion\nThis tests the pandoc conversion.",
  "format": "html"
}'

echo -e "${BLUE}Sending request to pandoc API...${NC}"

response=$(curl -s -w "\n%{http_code}" \
    --max-time 30 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$markdown_content" \
    "http://localhost:3001/api/convert/pandoc")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}Success! API returned HTTP $http_code${NC}"
    echo "Response: $response_body"
    
    # Try to download the file
    download_url=$(echo "$response_body" | jq -r '.downloadUrl')
    if [ "$download_url" != "null" ]; then
        echo -e "${BLUE}Downloading file...${NC}"
        curl -s -f "http://localhost:3001${download_url}" -o "test-output.html"
        if [ -f "test-output.html" ]; then
            echo -e "${GREEN}File downloaded successfully: test-output.html${NC}"
            echo "File size: $(du -h test-output.html | cut -f1)"
        else
            echo -e "${RED}Download failed${NC}"
        fi
    fi
else
    echo -e "${RED}Failed! HTTP $http_code${NC}"
    echo "Response: $response_body"
fi