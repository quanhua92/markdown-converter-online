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
