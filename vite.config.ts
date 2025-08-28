import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const target = process.env.VITE_TARGET === 'app' ? 'app' : 'web';
  const devHost = process.env.VITE_HOST || '0.0.0.0';
  const hmrHost = process.env.VITE_HMR_HOST;
  return ({
  server: {
    host: devHost,
    port: 8080,
    hmr: {
      port: 8080,
      host: hmrHost || undefined,
    },
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, target === 'app' ? "./src/app" : "./src/web"),
      "@root": path.resolve(__dirname, target === 'app' ? "./src/app/AppRoot.tsx" : "./src/web/WebRoot.tsx"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@web": path.resolve(__dirname, "./src/web"),
      "@shared": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
    include: ['react-pdf', 'warning']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'pdf': ['pdfjs-dist', 'react-pdf'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  }
  });
});
