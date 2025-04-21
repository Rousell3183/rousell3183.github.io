/**
 * Sound Effects System
 * 
 * Uses Howler.js to manage sci-fi sound effects for UI and transitions
 */

import { Howl, Howler } from 'howler';

// Default sound library configuration
const DEFAULT_SOUNDS = {
  // UI Sounds
  click: {
    src: '/assets/sounds/click.mp3',
    volume: 0.5,
    preload: true
  },
  hover: {
    src: '/assets/sounds/hover.mp3',
    volume: 0.3,
    preload: true
  },
  confirm: {
    src: '/assets/sounds/confirm.mp3',
    volume: 0.6,
    preload: true
  },
  
  // Transition sounds
  pageTransition: {
    src: '/assets/sounds/page-transition.mp3',
    volume: 0.7,
    preload: true
  },
  elevator: {
    src: '/assets/sounds/elevator.mp3',
    volume: 0.8,
    preload: true
  },
  hologramActivate: {
    src: '/assets/sounds/hologram-activate.mp3',
    volume: 0.8,
    preload: true,
    spatial: true
  },
  
  // Starship corridor sounds
  doorOpen: {
    src: '/assets/sounds/door-open.mp3',
    volume: 0.7,
    preload: true
  },
  doorClose: {
    src: '/assets/sounds/door-close.mp3',
    volume: 0.7,
    preload: true
  },
  corridorAmbient: {
    src: '/assets/sounds/corridor-ambient.mp3',
    volume: 0.2,
    loop: true,
    preload: true
  },
  
  // Ambient sounds
  ambientHum: {
    src: '/assets/sounds/ambient-hum.mp3',
    volume: 0.2,
    loop: true,
    preload: true
  }
};

/**
 * Sound System Class
 * Manages all sound effects for the sci-fi interface
 */
class SoundSystem {
  /**
   * Initialize the sound system
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      enabled: true,
      masterVolume: 0.7,
      sounds: { ...DEFAULT_SOUNDS, ...options.sounds },
      ...options
    };
    
    this.sounds = new Map();
    this.initialized = false;
    
    // Set master volume
    Howler.volume(this.options.masterVolume);
  }
  
  /**
   * Initialize the sound system
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  init() {
    if (this.initialized) return Promise.resolve();
    
    // Load default sounds
    Object.entries(this.options.sounds).forEach(([id, config]) => {
      if (config.preload) {
        this.loadSound(id, config);
      }
    });
    
    this.initialized = true;
    return Promise.resolve();
  }
  
  /**
   * Load a sound into the system
   * @param {string} id - Sound identifier
   * @param {Object} config - Sound configuration
   * @returns {Howl} The Howl instance
   */
  loadSound(id, config) {
    if (this.sounds.has(id)) {
      return this.sounds.get(id);
    }
    
    const sound = new Howl({
      src: Array.isArray(config.src) ? config.src : [config.src],
      volume: config.volume || 1.0,
      loop: config.loop || false,
      autoplay: config.autoplay || false,
      preload: config.preload !== false
    });
    
    this.sounds.set(id, sound);
    return sound;
  }
  
  /**
   * Play a sound by ID
   * @param {string} id - Sound identifier
   * @param {Object} options - Playback options
   * @returns {number} Sound ID or -1 if sound not found/disabled
   */
  play(id, options = {}) {
    if (!this.options.enabled) return -1;
    
    // Load sound if not loaded yet
    if (!this.sounds.has(id) && this.options.sounds[id]) {
      this.loadSound(id, this.options.sounds[id]);
    }
    
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound not found: ${id}`);
      return -1;
    }
    
    // Override volume if specified
    if (options.volume !== undefined) {
      sound.volume(options.volume);
    }
    
    return sound.play();
  }
  
  /**
   * Stop a sound by ID
   * @param {string} id - Sound identifier or 'all' to stop all sounds
   */
  stop(id) {
    if (id === 'all') {
      this.sounds.forEach(sound => sound.stop());
      return;
    }
    
    const sound = this.sounds.get(id);
    if (sound) {
      sound.stop();
    }
  }
  
  /**
   * Pause a sound by ID
   * @param {string} id - Sound identifier or 'all' to pause all sounds
   */
  pause(id) {
    if (id === 'all') {
      this.sounds.forEach(sound => sound.pause());
      return;
    }
    
    const sound = this.sounds.get(id);
    if (sound) {
      sound.pause();
    }
  }
  
  /**
   * Toggle mute state
   * @param {boolean} muted - Force mute state (optional)
   * @returns {boolean} New mute state
   */
  toggleMute(muted = null) {
    const newState = muted !== null ? muted : !Howler._muted;
    Howler.mute(newState);
    return newState;
  }
}

// Export the SoundSystem class
export default SoundSystem;

