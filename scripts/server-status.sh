#!/bin/bash
if curl -s -f "http://localhost:3001/api/health" > /dev/null 2>&1; then
    echo -e "\033[0;32m[OK]\033[0m Server is running at http://localhost:3001"
    echo "Health check: $(curl -s http://localhost:3001/api/health)"
else
    echo -e "\033[0;31m[ERROR]\033[0m Server is not running"
fi
