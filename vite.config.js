import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base directory
  base: './',
  
  // Resolve aliases for clean imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets'),
      '@js': resolve(__dirname, './assets/js'),
      '@css': resolve(__dirname, './assets/css'),
      '@modules': resolve(__dirname, './assets/js/modules'),
      '@effects': resolve(__dirname, './assets/js/effects')
    }
  },
  
  // Enable CSS processing
  css: {
    // Enable CSS source maps during development
    devSourcemap: true
  },
  
  // Build options
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    
    // Target ES modules
    target: 'es2020',
    
    // Output configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Add any other pages you want to process
        'github-projects': resolve(__dirname, 'github-projects.html'),
        'ai-project': resolve(__dirname, 'ai-project.html'),
        'city-events': resolve(__dirname, 'city-events.html'),
        'junk-busters': resolve(__dirname, 'junk-busters.html')
      },
      
      // External dependencies that should not be bundled
      external: [
        'jquery',
        'assets/js/lib/jquery.scrollex.min.js',
        'assets/js/lib/jquery.scrolly.min.js',
        'assets/js/lib/browser.min.js',
        'assets/js/lib/breakpoints.min.js'
      ],
      
      output: {
        // Ensure chunks have deterministic names
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize asset output
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name].[hash].[ext]';
          }
          
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return 'assets/images/[name].[hash].[ext]';
          }
          
          if (/\.css$/.test(assetInfo.name)) {
            return 'assets/css/[name].[hash].[ext]';
          }
          
          return `assets/[ext]/[name].[hash].[ext]`;
        }
      }
    }
  },
  
  // Server options
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Handle legacy scripts
  optimizeDeps: {
    // Exclude legacy scripts from optimization
    exclude: [
      'jquery',
      'assets/js/lib/jquery.scrollex.min.js',
      'assets/js/lib/jquery.scrolly.min.js', 
      'assets/js/lib/browser.min.js',
      'assets/js/lib/breakpoints.min.js'
    ],
    // Don't try to scan these directories for dependencies
    entries: [
      '**/*.html',
      'assets/js/main.js'
    ]
  },
  
  // Configure plugins
  plugins: [
    {
      name: 'legacy-scripts-handler',
      configureServer(server) {
        // Intercept requests to legacy scripts to serve them directly
        server.middlewares.use((req, res, next) => {
          if (req.url.includes('/assets/js/lib/')) {
            // Set proper content type
            res.setHeader('Content-Type', 'application/javascript');
            // Skip vite transform
            req.skipViteTransform = true;
          }
          next();
        });
      }
    }
  ]
});
