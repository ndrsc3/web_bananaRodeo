import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'node:fs';
import { templateProcessor } from './src/vite-plugins/template-processor';

// Resolve paths relative to client package
const resolvePath = (...parts: string[]) => resolve(__dirname, ...parts);

// Get all HTML pages as entry points
const getPageEntries = () => {
  const pagesDir = resolvePath('public/pages');
  const entries: Record<string, string> = {
    'index': resolvePath('index.html')
  };
  
  fs.readdirSync(pagesDir)
    .filter((file: string) => file.endsWith('.html'))
    .forEach((file: string) => {
      const name = file.replace('.html', '');
      entries[`pages/${name}/index`] = resolvePath('public/pages', file);
    });
    
  return entries;
};

export default defineConfig({
  root: __dirname,
  publicDir: false, // Disable automatic public directory copying
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: getPageEntries(),
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            const parts = assetInfo.name.split('/');
            if (parts.length > 1) {
              return assetInfo.name;
            }
            return 'index.html';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': resolvePath('src'),
      '@assets': resolvePath('src/assets'),
      '@components': resolvePath('src/components'),
      '@styles': resolvePath('public/styles'),
      '@templates': resolvePath('public/templates')
    }
  },

  css: {
    // Preserve CSS structure
    modules: {
      localsConvention: 'camelCase'
    },
    // Handle CSS imports
    devSourcemap: true,
    // Ensure all CSS files are processed
    postcss: {
      plugins: []
    }
  },

  plugins: [
    templateProcessor({
      templatesDir: resolvePath('public/templates'),
      pagesDir: resolvePath('public/pages')
    })
  ],

  // Configure server for development
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    watch: {
      // Watch templates and pages for changes
      ignored: ['!**/public/templates/**', '!**/public/pages/**']
    }
  },

  // Optimize handling of Web 1.0 assets
  assetsInclude: ['**/*.gif', '**/*.mid', '**/*.midi', '**/*.wav'],
}); 