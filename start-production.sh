#!/bin/bash

# Production startup script for DMHCA CRM
echo "🚀 Starting DMHCA CRM in production mode..."

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_API_URL not set, using default"
fi

# Check if backend is accessible
echo "🔍 Checking backend connectivity..."
BACKEND_URL="${NEXT_PUBLIC_API_URL:-http://localhost:5000/api/v1}"
HEALTH_URL="${BACKEND_URL/\/api\/v1/}/health"

if curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "✅ Backend is accessible at $HEALTH_URL"
else
    echo "⚠️  Backend not accessible - application will run in demo mode"
fi

# Build the application if not already built
if [ ! -d ".next" ]; then
    echo "📦 Building application..."
    npm run build
fi

# Start the application
echo "🌟 Starting Next.js application..."
NODE_ENV=production npm start
