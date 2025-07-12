#!/bin/bash

# Script to start the server in the background
# Usage: ./start-server.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to check if server is already running
check_server_running() {
    if curl -s -f "http://localhost:3001/api/health" > /dev/null 2>&1; then
        return 0  # Server is running
    else
        return 1  # Server is not running
    fi
}

# Function to stop existing server
stop_server() {
    print_info "Stopping existing server processes..."
    pkill -f "node server/dist/index.js" 2>/dev/null || true
    pkill -f "ts-node.*server/index.ts" 2>/dev/null || true
    pkill -f "nodemon.*server" 2>/dev/null || true
    sleep 2
}

# Function to start production server
start_prod_server() {
    print_info "Starting production server..."
    
    # Ensure server is built
    if [ ! -f "server/dist/index.js" ]; then
        print_info "Building server..."
        if [ -f "server/tsconfig.json" ]; then
            npx tsc --project server/tsconfig.json
        else
            print_error "Server build files not found. Please run 'pnpm run client:build' first."
            exit 1
        fi
    fi
    
    # Start server in background
    nohup pnpm run server:start > server.log 2>&1 &
    server_pid=$!
    
    # Wait a moment for server to start
    sleep 3
    
    if check_server_running; then
        print_success "Production server started successfully (PID: $server_pid)"
        print_info "Server running at: http://localhost:3001"
        print_info "Logs: tail -f server.log"
    else
        print_error "Failed to start production server"
        print_info "Check logs: cat server.log"
        exit 1
    fi
}

# Function to start development server
start_dev_server() {
    print_info "Starting development server..."
    
    # Start server in background with logs
    nohup pnpm run server:dev > server-dev.log 2>&1 &
    server_pid=$!
    
    # Wait for server to start
    sleep 5
    
    if check_server_running; then
        print_success "Development server started successfully (PID: $server_pid)"
        print_info "Server running at: http://localhost:3001"
        print_info "Logs: tail -f server-dev.log"
    else
        print_error "Failed to start development server"
        print_info "Check logs: cat server-dev.log"
        exit 1
    fi
}

# Main function
main() {
    local mode="${1:-prod}"
    
    print_info "Server Startup Script"
    echo "===================="
    
    # Check if server is already running
    if check_server_running; then
        print_warning "Server is already running at http://localhost:3001"
        read -p "$(echo -e "${YELLOW}Stop and restart? (y/N): ${NC}")" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing server running"
            exit 0
        fi
        stop_server
    fi
    
    case "$mode" in
        "dev"|"development")
            start_dev_server
            ;;
        "prod"|"production")
            start_prod_server
            ;;
        *)
            print_error "Invalid mode: $mode"
            print_info "Usage: $0 [dev|prod]"
            print_info "  dev  - Start development server with auto-reload"
            print_info "  prod - Start production server (default)"
            exit 1
            ;;
    esac
    
    # Create a simple status script
    cat > scripts/server-status.sh << 'EOF'
#!/bin/bash
if curl -s -f "http://localhost:3001/api/health" > /dev/null 2>&1; then
    echo -e "\033[0;32m[OK]\033[0m Server is running at http://localhost:3001"
    echo "Health check: $(curl -s http://localhost:3001/api/health)"
else
    echo -e "\033[0;31m[ERROR]\033[0m Server is not running"
fi
EOF
    chmod +x scripts/server-status.sh
    
    # Create a stop script
    cat > scripts/stop-server.sh << 'EOF'
#!/bin/bash
echo -e "\033[0;34m[INFO]\033[0m Stopping server..."
pkill -f "node server/dist/index.js" 2>/dev/null || true
pkill -f "ts-node.*server/index.ts" 2>/dev/null || true
pkill -f "nodemon.*server" 2>/dev/null || true
sleep 2
if curl -s -f "http://localhost:3001/api/health" > /dev/null 2>&1; then
    echo -e "\033[0;31m[ERROR]\033[0m Failed to stop server"
else
    echo -e "\033[0;32m[SUCCESS]\033[0m Server stopped"
fi
EOF
    chmod +x scripts/stop-server.sh
    
    print_success "Server management scripts created:"
    print_info "  ./scripts/server-status.sh - Check server status"
    print_info "  ./scripts/stop-server.sh    - Stop the server"
}

# Run main function
main "$@"