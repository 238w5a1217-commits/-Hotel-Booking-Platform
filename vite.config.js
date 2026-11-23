const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Only crawl client files for browser dependencies - ignore backend controllers/routes
    entries: ['index.html', 'src/main.jsx', 'src/**/*.jsx'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
