import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/geocode': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const query = url.searchParams.get('query') || '';
          const country = url.searchParams.get('country') || 'jm';
          return `/search?q=${encodeURIComponent(query)}&countrycodes=${country}&format=json&addressdetails=1&limit=5&accept-language=en`;
        },
        headers: {
          'User-Agent': 'LinkUpWork/1.0 (voice-gig-connect)'
        }
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
