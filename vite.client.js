/**
 * Custom Vite client configuration for hot module reloading
 * This file is automatically detected and used by Vite during development
 */

// Store original console methods for debugging
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

// Debug mode configuration
const DEBUG = false;

/**
 * Custom HMR handler for our modules
 */
export function handleHotUpdate(ctx) {
  // Get the file path being updated
  const { file, modules, read, server } = ctx;
  
  // Log HMR updates in debug mode
  if (DEBUG) {
    originalConsole.log(`[HMR] File updated: ${file}`);
  }

  // Special handling for specific module types
  if (file.includes('/modules/elevator.js')) {
    if (DEBUG) originalConsole.log('[HMR] Handling elevator.js update');
    
    // Custom handling for elevator module updates
    return modules;
  }
  
  if (file.includes('/modules/hologram.js')) {
    if (DEBUG) originalConsole.log('[HMR] Handling hologram.js update');
    
    // Custom handling for hologram module updates
    return modules;
  }
  
  if (file.includes('/effects/sound.js')) {
    if (DEBUG) originalConsole.log('[HMR] Handling sound.js update');
    
    // Custom handling for sound module updates
    return modules;
  }
  
  // Default handling for other files
  return modules;
}

/**
 * Custom error overlay configuration
 */
export const errorOverlay = {
  // Customize error overlay style
  customStyle: `
    .vite-error-overlay {
      background-color: rgba(0, 0, 0, 0.85) ;
      color: #00c8ff ;
      border: 1px solid #7b35e5 ;
      border-radius: 4px ;
      font-family: 'Roboto Mono', monospace ;
    }
    .vite-error-overlay-message {
      color: #fe5578 ;
    }
    .vite-error-overlay button {
      background: linear-gradient(90deg, #00c8ff, #7b35e5) ;
      color: white ;
      border: none ;
      padding: 8px 16px ;
      border-radius: 4px ;
      cursor: pointer ;
    }
  `,
  
  // Additional hooks for error handling
  onError(err) {
    originalConsole.error('[Vite Error]', err);
    
    // You can add custom error logging or reporting here
    return true; // Continue with default error handler
  }
};

/**
 * WebSocket connection configuration
 */
export const websocketOptions = {
  // Set a longer timeout for slow connections
  timeout: 30000,
  
  // Customize overlay
  overlay: true,
  
  // Configure HMR
  hmr: {
    // Configure which files to reload the page for
    reloadPageOnResourceUpdate: [
      // Reload the page for CSS changes
      'css',
      // Reload the page for HTML changes
      'html',
      // Don't reload for JS updates (use HMR instead)
      // 'js', 
      // Reload for JSON changes
      'json'
    ],
    
    // Configure protocol
    protocol: 'ws',
    
    // Host configuration (null = auto)
    host: null,
    
    // Port configuration (null = auto)
    port: null,
    
    // Path for the HMR client
    path: '/hmr',
    
    // Configure which files trigger HMR
    include: [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/*.vue',
      '**/*.css'
    ],
    
    // Configure which files to exclude from HMR
    exclude: [
      '**/node_modules/**',
      '**/public/**',
      '**/dist/**'
    ]
  }
};

// Export a configuration function
export default function configureHMR() {
  if (DEBUG) {
    originalConsole.log('[Vite] Custom client configuration loaded');
  }
  
  // Add global HMR accept handler
  if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
      if (DEBUG) {
        originalConsole.log('[HMR] Module updated:', newModule);
      }
    });
    
    // Add dispose handler
    import.meta.hot.dispose(() => {
      if (DEBUG) {
        originalConsole.log('[HMR] Module disposed');
      }
    });
  }
}

// Initialize the configuration
configureHMR();

