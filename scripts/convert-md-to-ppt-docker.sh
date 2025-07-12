#!/bin/bash

# Script to convert markdown to PowerPoint using the API
# Usage: ./convert-md-to-ppt.sh [markdown_file] [output_name]

set -e  # Exit on any error

# Configuration
API_URL="http://localhost:3000"
DOWNLOADS_DIR="./downloads"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if server is running
check_server() {
    print_info "Checking if server is running..."
    if curl -s -f --max-time 5 "${API_URL}/api/health" > /dev/null 2>&1; then
        print_success "Server is running"
        return 0
    else
        print_error "Server is not running or not accessible at ${API_URL}"
        print_info "Please run 'pnpm dev' or 'pnpm run server:start' first"
        return 1
    fi
}

# Function to create sample markdown if no file provided
create_sample_markdown() {
    local sample_file="$1"
    cat > "$sample_file" << 'EOF'
---
theme: default
paginate: true
---

# Sample Presentation
Welcome to my slides created via API!

---

## About This Demo
- This presentation was created using a bash script
- It calls the markdown converter API
- Converts markdown to PowerPoint format

---

## Features
- **Marp-powered** slide generation
- **API-based** conversion
- **Automated** file download
- **Cross-platform** compatibility

---

## Technical Stack
- Node.js + Express backend
- React + Vite frontend
- Marp CLI for presentation generation
- TypeScript for type safety

---

## Thank You!
Questions about the API?

Visit: http://localhost:5173
EOF
    print_info "Created sample markdown file: $sample_file"
}

# Main function
main() {
    local markdown_file=""
    local output_name=""
    local temp_file=""
    
    print_info "Markdown to PowerPoint Converter Script"
    echo "========================================"
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Handle input arguments
    if [ $# -eq 0 ]; then
        # No arguments - create sample markdown
        temp_file="sample_presentation.md"
        create_sample_markdown "$temp_file"
        markdown_file="$temp_file"
        output_name="sample_presentation"
        print_info "Using sample markdown file"
    elif [ $# -eq 1 ]; then
        # One argument - markdown file provided
        markdown_file="$1"
        output_name=$(basename "$markdown_file" .md)
        if [ ! -f "$markdown_file" ]; then
            print_error "Markdown file not found: $markdown_file"
            exit 1
        fi
    elif [ $# -eq 2 ]; then
        # Two arguments - markdown file and output name
        markdown_file="$1"
        output_name="$2"
        if [ ! -f "$markdown_file" ]; then
            print_error "Markdown file not found: $markdown_file"
            exit 1
        fi
    else
        print_error "Usage: $0 [markdown_file] [output_name]"
        print_info "Examples:"
        print_info "  $0                           # Use sample markdown"
        print_info "  $0 my_slides.md              # Convert my_slides.md"
        print_info "  $0 my_slides.md presentation # Convert with custom name"
        exit 1
    fi
    
    print_info "Input file: $markdown_file"
    print_info "Output name: $output_name"
    
    # Read markdown content
    if ! markdown_content=$(cat "$markdown_file" 2>/dev/null); then
        print_error "Failed to read markdown file: $markdown_file"
        exit 1
    fi
    
    print_info "Read $(echo "$markdown_content" | wc -l) lines of markdown"
    
    # Prepare JSON payload
    json_payload=$(jq -n --arg markdown "$markdown_content" '{markdown: $markdown}')
    
    # Create downloads directory
    mkdir -p "$DOWNLOADS_DIR"
    
    print_info "Sending conversion request to API..."
    print_info "This may take a few seconds for conversion..."
    
    # Make API call with timeout and show progress
    temp_response_file=$(mktemp)
    curl -s -w "\n%{http_code}" \
        --max-time 30 \
        --connect-timeout 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "${API_URL}/api/convert/marp" > "$temp_response_file" &
    
    curl_pid=$!
    
    # Show progress while waiting
    wait_count=0
    while kill -0 $curl_pid 2>/dev/null; do
        printf "."
        sleep 1
        wait_count=$((wait_count + 1))
        if [ $wait_count -gt 30 ]; then
            kill $curl_pid 2>/dev/null
            rm -f "$temp_response_file"
            print_error "Request timed out after 30 seconds"
            exit 1
        fi
    done
    echo
    
    # Get the response
    wait $curl_pid
    curl_exit_code=$?
    response=$(cat "$temp_response_file")
    rm -f "$temp_response_file"
    
    # Check if curl command succeeded
    if [ $curl_exit_code -ne 0 ]; then
        print_error "API request failed - connection timeout or server error"
        print_info "Make sure the server is running and accessible"
        exit 1
    fi
    
    # Parse response
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        print_success "API call successful (HTTP $http_code)"
        
        # Parse JSON response
        download_url=$(echo "$response_body" | jq -r '.downloadUrl')
        filename=$(echo "$response_body" | jq -r '.filename')
        
        if [ "$download_url" != "null" ] && [ "$filename" != "null" ]; then
            print_info "Download URL: ${API_URL}${download_url}"
            print_info "Filename: $filename"
            
            # Download the file
            local output_file="${DOWNLOADS_DIR}/${output_name}.pptx"
            print_info "Downloading to: $output_file"
            
            if curl -s -f --max-time 60 --connect-timeout 10 "${API_URL}${download_url}" -o "$output_file"; then
                print_success "File downloaded successfully!"
                print_success "PowerPoint presentation saved as: $output_file"
                
                # Show file info
                file_size=$(du -h "$output_file" | cut -f1)
                print_info "File size: $file_size"
                
                # Try to open the file (macOS)
                if command -v open >/dev/null 2>&1; then
                    read -p "$(echo -e "${YELLOW}Open the presentation? (y/N): ${NC}")" -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        open "$output_file"
                    fi
                fi
            else
                print_error "Failed to download file from: ${API_URL}${download_url}"
                exit 1
            fi
        else
            print_error "Invalid response from API - missing download URL or filename"
            print_error "Response: $response_body"
            exit 1
        fi
    else
        print_error "API call failed (HTTP $http_code)"
        print_error "Response: $response_body"
        exit 1
    fi
    
    # Clean up temporary file if created
    if [ -n "$temp_file" ] && [ -f "$temp_file" ]; then
        rm "$temp_file"
        print_info "Cleaned up temporary file: $temp_file"
    fi
    
    print_success "Conversion completed successfully!"
}

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    print_error "curl is required but not installed"
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    print_error "jq is required but not installed"
    print_info "Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    exit 1
fi

# Run main function
main "$@"