import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'
import { execSync } from 'child_process'

// Try to get git commit hash, fallback to environment variable or 'dev'
let gitCommitHash = 'dev'
try {
  gitCommitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
} catch (error) {
  // If git is not available (e.g., in Docker), use environment variable
  gitCommitHash = process.env.GIT_COMMIT_HASH || process.env.GIT_COMMIT || 'unknown'
}

console.log('🔧 Vite config - Git commit hash:', gitCommitHash)
console.log('🔧 Vite config - Define value:', JSON.stringify(gitCommitHash))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    // Remove proxy for production - frontend will call external API
    // For local development, set VITE_API_BASE_URL=http://localhost:3000
    ...(process.env.NODE_ENV === 'development' && process.env.VITE_API_BASE_URL?.includes('localhost') ? {
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    } : {})
  },
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(gitCommitHash)
  }
})
