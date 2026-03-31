import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      'next/link': path.resolve(__dirname, 'shims/next-link.jsx'),
      'next/navigation': path.resolve(__dirname, 'shims/next-navigation.js'),
    },
  },
})
