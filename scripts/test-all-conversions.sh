#!/bin/bash

# Comprehensive test script for all conversion formats
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Test results tracking
total_tests=0
passed_tests=0
test_results_health=""
test_results_web=""
test_results_html=""
test_results_docx=""
test_results_pdf=""
test_results_pptx=""

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  MARKDOWN CONVERTER TEST SUITE${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

print_test() {
    echo -e "${BLUE}[TEST $((total_tests + 1))]${NC} $1"
    total_tests=$((total_tests + 1))
}

print_success() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    passed_tests=$((passed_tests + 1))
}

print_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
}

print_summary() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}           TEST SUMMARY${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo -e "Total Tests: $total_tests"
    echo -e "Passed: ${GREEN}$passed_tests${NC}"
    echo -e "Failed: ${RED}$((total_tests - passed_tests))${NC}"
    
    if [ $passed_tests -eq $total_tests ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
        echo -e "${GREEN}The markdown converter is fully functional!${NC}"
    else
        echo -e "\n${RED}❌ Some tests failed. Check the output above.${NC}"
    fi
}

# Test markdown content
get_test_markdown() {
    local format=$1
    case $format in
        "pptx")
            echo '{
  "markdown": "---\ntheme: default\npaginate: true\n---\n\n# PowerPoint Test\nTesting Marp conversion to .pptx\n\n---\n\n## Features\n- **Bold text**\n- *Italic text*  \n- Lists and bullets\n- Code blocks\n\n```javascript\nconsole.log(\"Hello PowerPoint!\");\n```\n\n---\n\n## Math & Symbols\n- Mathematical notation: $E = mc^2$\n- Arrows: → ← ↑ ↓\n- Checkmarks: ✅ ❌\n\n---\n\n## Final Slide\n**SUCCESS!** If you can see this as a PowerPoint presentation, the conversion worked perfectly! 🎉"
}'
            ;;
        *)
            echo '{
  "markdown": "# Document Test\n\nTesting Pandoc conversion to .'$format'\n\n## Text Formatting\n- **Bold text**\n- *Italic text*\n- ~~Strikethrough~~\n- `inline code`\n\n## Lists\n1. Numbered list\n2. Second item\n   - Nested bullet\n   - Another nested item\n\n## Code Block\n```python\ndef hello_world():\n    print(\"Hello, '$format' format!\")\n    return \"success\"\n```\n\n## Table\n| Feature | Status |\n|---------|--------|\n| Conversion | ✅ Working |\n| Format | '$format' |\n| Quality | Excellent |\n\n## Conclusion\nIf you can read this in .'$format' format, the conversion was successful! 🎉",
  "format": "'$format'"
}'
            ;;
    esac
}

# Test conversion function
test_conversion() {
    local format=$1
    local endpoint=$2
    local expected_extension=$3
    local timeout=${4:-30}
    
    print_test "Converting markdown to $format"
    
    # Get test content
    local test_content=$(get_test_markdown "$format")
    
    # Make API call
    echo -e "${YELLOW}Sending request to $endpoint...${NC}"
    
    local temp_file=$(mktemp)
    local success=false
    
    if curl -s -w "\n%{http_code}" \
        --max-time $timeout \
        --connect-timeout 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_content" \
        "http://localhost:3001$endpoint" > "$temp_file" 2>/dev/null; then
        
        local http_code=$(tail -n1 "$temp_file")
        local response_body=$(sed '$d' "$temp_file")
        
        if [ "$http_code" = "200" ]; then
            local download_url=$(echo "$response_body" | jq -r '.downloadUrl' 2>/dev/null)
            local filename=$(echo "$response_body" | jq -r '.filename' 2>/dev/null)
            
            if [ "$download_url" != "null" ] && [ "$download_url" != "" ]; then
                # Download the file
                local output_file="test-output.$expected_extension"
                if curl -s -f --max-time 30 "http://localhost:3001$download_url" -o "$output_file" 2>/dev/null; then
                    if [ -f "$output_file" ] && [ -s "$output_file" ]; then
                        local file_size=$(du -h "$output_file" | cut -f1)
                        print_success "$format conversion - File: $output_file ($file_size)"
                        case $format in
                            "health") test_results_health="PASS - $file_size" ;;
                            "web") test_results_web="PASS - $file_size" ;;
                            "html") test_results_html="PASS - $file_size" ;;
                            "docx") test_results_docx="PASS - $file_size" ;;
                            "pdf") test_results_pdf="PASS - $file_size" ;;
                            "pptx") test_results_pptx="PASS - $file_size" ;;
                        esac
                        success=true
                        
                        # Verify file type
                        local file_type=$(file "$output_file" 2>/dev/null || echo "unknown")
                        echo -e "   ${BLUE}File type:${NC} $file_type"
                    fi
                fi
            fi
        else
            echo -e "   ${RED}HTTP Error: $http_code${NC}"
            echo -e "   ${RED}Response: $response_body${NC}"
        fi
    fi
    
    rm -f "$temp_file"
    
    if [ "$success" = false ]; then
        print_fail "$format conversion failed"
        case $format in
            "health") test_results_health="FAIL" ;;
            "web") test_results_web="FAIL" ;;
            "html") test_results_html="FAIL" ;;
            "docx") test_results_docx="FAIL" ;;
            "pdf") test_results_pdf="FAIL" ;;
            "pptx") test_results_pptx="FAIL" ;;
        esac
    fi
    
    echo ""
}

# Test health endpoint
test_health() {
    print_test "API Health Check"
    
    if response=$(curl -s --max-time 5 "http://localhost:3001/api/health" 2>/dev/null); then
        if echo "$response" | jq -e '.status == "OK"' >/dev/null 2>&1; then
            print_success "API is healthy and responding"
            test_results_health="PASS"
        else
            print_fail "API health check - invalid response"
            test_results_health="FAIL"
        fi
    else
        print_fail "API health check - no response"
        test_results_health="FAIL"
    fi
    echo ""
}

# Test web interface
test_web_interface() {
    print_test "Web Interface Accessibility"
    
    if curl -s -I --max-time 10 "http://localhost:3001/" 2>/dev/null | grep -q "HTTP/1.1 200"; then
        print_success "Web interface is accessible"
        test_results_web="PASS"
    else
        print_fail "Web interface is not accessible"
        test_results_web="FAIL"
    fi
    echo ""
}

# Main execution
main() {
    print_header
    
    # Check if Docker container is running
    if ! docker-compose ps | grep -q "Up"; then
        echo -e "${RED}❌ Docker container is not running!${NC}"
        echo -e "${YELLOW}Please run: docker-compose up -d${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Docker container is running${NC}\n"
    
    # Wait for server to be ready
    echo -e "${YELLOW}Waiting for server to be ready...${NC}"
    for i in {1..10}; do
        if curl -s --max-time 2 "http://localhost:3001/api/health" >/dev/null 2>&1; then
            echo -e "${GREEN}Server is ready!${NC}\n"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${RED}Server failed to respond after 10 attempts${NC}"
            exit 1
        fi
        sleep 2
        printf "."
    done
    
    # Run tests
    test_health
    test_web_interface
    
    echo -e "${BLUE}Testing document conversions (Pandoc)...${NC}\n"
    test_conversion "html" "/api/convert/pandoc" "html" 15
    test_conversion "docx" "/api/convert/pandoc" "docx" 20
    test_conversion "pdf" "/api/convert/pandoc" "pdf" 25
    
    echo -e "${BLUE}Testing presentation conversion (Marp)...${NC}\n"
    test_conversion "pptx" "/api/convert/marp" "pptx" 45
    
    # Clean up test files
    echo -e "${YELLOW}Cleaning up test files...${NC}"
    rm -f test-output.* 2>/dev/null || true
    
    print_summary
    
    # Show detailed results
    echo -e "\n${PURPLE}Detailed Results:${NC}"
    
    show_result() {
        local name=$1
        local result=$2
        if [ -n "$result" ]; then
            if [[ "$result" == PASS* ]]; then
                echo -e "  $name: ${GREEN}$result${NC}"
            else
                echo -e "  $name: ${RED}$result${NC}"
            fi
        fi
    }
    
    show_result "health" "$test_results_health"
    show_result "web" "$test_results_web"
    show_result "html" "$test_results_html"
    show_result "docx" "$test_results_docx"
    show_result "pdf" "$test_results_pdf"
    show_result "pptx" "$test_results_pptx"
    
    echo ""
    
    # Exit with proper code
    if [ $passed_tests -eq $total_tests ]; then
        exit 0
    else
        exit 1
    fi
}

# Check dependencies
if ! command -v jq >/dev/null 2>&1; then
    echo -e "${RED}Error: jq is required but not installed${NC}"
    echo -e "${YELLOW}Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)${NC}"
    exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    echo -e "${RED}Error: docker-compose is required but not installed${NC}"
    exit 1
fi

# Run main function
main "$@"