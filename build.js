#!/usr/bin/env node

/**
 * Custom build script for Render deployment
 * Bypasses permission issues with vite binary
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting build process...');

try {
  // Use node to directly execute vite from node_modules
  const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
  
  console.log('📦 Building with Vite...');
  execSync(`node "${vitePath}" build`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
