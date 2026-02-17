#!/bin/bash
echo "🚀 Starting custom build..."

# Install dependencies
npm ci --include=dev

# Run vite build using npx (avoids permission issues)
npx --yes vite build

echo "✅ Build completed successfully!"
