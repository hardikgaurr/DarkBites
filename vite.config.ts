import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any hosting path (artifact, static host, sub-folder).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
  },
});
