#!/bin/bash

# Local Client Development Script
# Usage: ./scripts/local-client.sh [PORT] [&]
# Default port: 3000
# Add & at the end to run in background

PORT=${1:-3000}

echo "🚀 Starting local client development server..."
echo "📋 Port: $PORT"

# Kill any existing processes on the port
echo "🔧 Checking for existing processes on port $PORT..."
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is in use, killing existing processes..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start Vite dev server on specified port in background
echo "🔨 Starting Vite development server on port $PORT in background..."
nohup npx vite --port $PORT --host 0.0.0.0 > /tmp/vite-$PORT.log 2>&1 &
VITE_PID=$!

echo "✅ Vite server started with PID: $VITE_PID"
echo "🌐 Local URL: http://localhost:$PORT"
echo "📄 Logs: /tmp/vite-$PORT.log"

# Wait for the server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        echo "🎯 Development server is running in background (PID: $VITE_PID)"
        echo "📝 Ready for testing and development!"
        echo "🛑 To stop: kill $VITE_PID"
        exit 0
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Server failed to start after 30 seconds"
        echo "📄 Check logs: cat /tmp/vite-$PORT.log"
        exit 1
    fi
    sleep 1
done