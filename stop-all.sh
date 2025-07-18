#!/bin/bash

echo "🛑 Stopping ALL processes related to markdown-converter..."

# Stop Docker containers
echo "📦 Stopping Docker containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker stop $(docker ps -q --filter "name=markdown-converter") 2>/dev/null || true

# Kill processes by port
echo "🔌 Killing processes on common ports..."
for port in 3000 5173 5174 5175 8080 4000; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "  Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null || true
    fi
done

# Kill Node.js processes related to the project
echo "🟢 Killing Node.js processes..."
pkill -f "node.*markdown-converter" 2>/dev/null || true
pkill -f "vite.*markdown-converter" 2>/dev/null || true
pkill -f "nodemon.*markdown-converter" 2>/dev/null || true

# Kill pnpm/npm processes
echo "📦 Killing pnpm/npm processes..."
pkill -f "pnpm.*dev" 2>/dev/null || true
pkill -f "pnpm.*start" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

# Kill any remaining vite processes
echo "⚡ Killing Vite processes..."
pkill -f "vite" 2>/dev/null || true

# Kill concurrently processes
echo "🔄 Killing concurrently processes..."
pkill -f "concurrently" 2>/dev/null || true

# Kill any TypeScript compiler processes
echo "📝 Killing TypeScript processes..."
pkill -f "tsc.*watch" 2>/dev/null || true

# Kill any remaining Express/server processes
echo "🌐 Killing Express server processes..."
pkill -f "server.*index.js" 2>/dev/null || true
pkill -f "express" 2>/dev/null || true

# Remove any Docker networks
echo "🌐 Cleaning up Docker networks..."
docker network prune -f 2>/dev/null || true

# List remaining processes that might be related
echo "🔍 Checking for remaining processes..."
echo "Node processes:"
ps aux | grep -i node | grep -v grep || echo "  No Node processes found"

echo "Port usage:"
for port in 3000 5173 5174 5175; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "  Port $port still in use by PID $pid"
        ps -p $pid -o pid,command 2>/dev/null || true
    else
        echo "  Port $port is free"
    fi
done

echo "✅ All cleanup attempts completed!"
echo ""
echo "🔄 To start fresh:"
echo "  docker compose up -d --build"
echo "  or"
echo "  pnpm dev"