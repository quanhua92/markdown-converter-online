#!/bin/bash

# Test script for Docker-based Marp conversion
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Testing Marp PowerPoint conversion via Docker...${NC}"

# Test markdown content for presentation
markdown_content='{
  "markdown": "---\ntheme: default\npaginate: true\n---\n\n# Docker Test Presentation\nTesting Marp conversion in Docker container\n\n---\n\n## Features Tested\n- **Docker deployment** with Alpine Linux\n- **Chromium browser** for headless rendering\n- **Marp CLI** for PowerPoint generation\n- **API timeout handling**\n\n---\n\n## Technical Stack\n- Node.js + Express backend\n- Chromium browser (headless)\n- Marp CLI for presentation generation\n- Docker containerization\n\n---\n\n## Results\nIf you see this as a PowerPoint file...\n**SUCCESS!** 🎉\n\nThe Docker setup is working perfectly!"
}'

echo -e "${BLUE}Sending conversion request to Docker container...${NC}"
echo -e "${YELLOW}This may take up to 30 seconds for first conversion...${NC}"

# Make API call with timeout and progress indicator
temp_response_file=$(mktemp)
curl -s -w "\n%{http_code}" \
    --max-time 45 \
    --connect-timeout 10 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$markdown_content" \
    "http://localhost:3001/api/convert/marp" > "$temp_response_file" &

curl_pid=$!

# Show progress
wait_count=0
printf "Converting"
while kill -0 $curl_pid 2>/dev/null; do
    printf "."
    sleep 1
    wait_count=$((wait_count + 1))
    if [ $wait_count -gt 45 ]; then
        kill $curl_pid 2>/dev/null
        rm -f "$temp_response_file"
        echo -e "\n${RED}Request timed out after 45 seconds${NC}"
        exit 1
    fi
done
echo

# Get the response
wait $curl_pid
curl_exit_code=$?
response=$(cat "$temp_response_file")
rm -f "$temp_response_file"

if [ $curl_exit_code -ne 0 ]; then
    echo -e "${RED}API request failed - connection error${NC}"
    exit 1
fi

# Parse response
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}Success! API returned HTTP $http_code${NC}"
    echo "Response: $response_body"
    
    # Try to download the file
    download_url=$(echo "$response_body" | jq -r '.downloadUrl')
    filename=$(echo "$response_body" | jq -r '.filename')
    
    if [ "$download_url" != "null" ] && [ "$filename" != "null" ]; then
        echo -e "${BLUE}Downloading PowerPoint file...${NC}"
        output_file="docker-test-presentation.pptx"
        
        if curl -s -f --max-time 30 "http://localhost:3001${download_url}" -o "$output_file"; then
            echo -e "${GREEN}PowerPoint file downloaded successfully!${NC}"
            echo -e "${GREEN}File saved as: $output_file${NC}"
            echo "File size: $(du -h "$output_file" | cut -f1)"
            
            # Try to open the file (macOS)
            if command -v open >/dev/null 2>&1; then
                echo -e "${YELLOW}Opening PowerPoint presentation...${NC}"
                open "$output_file"
            fi
        else
            echo -e "${RED}Failed to download file${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Invalid response - missing download URL${NC}"
        exit 1
    fi
else
    echo -e "${RED}Failed! HTTP $http_code${NC}"
    echo "Response: $response_body"
    
    # Show container logs for debugging
    echo -e "\n${YELLOW}Container logs (last 20 lines):${NC}"
    docker-compose logs --tail=20 markdown-converter
    exit 1
fi

echo -e "\n${GREEN}✅ Docker Marp conversion test completed successfully!${NC}"