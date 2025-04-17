/**
 * Elevator Transition System
 * 
 * Creates smooth vertical transitions between sections with sci-fi style animations
 * using GSAP and AOS libraries.
 */

import { gsap } from 'gsap';
import AOS from 'aos';

// Default configuration
const DEFAULT_CONFIG = {
  duration: 1.2,           // Duration of main transition in seconds
  ease: 'power2.inOut',    // GSAP easing function
  staggerDelay: 0.1,       // Delay between staggered elements
  soundEffects: true,      // Whether to play sound effects
  direction: 'vertical',   // 'vertical' or 'horizontal'
  aosAnimation: 'fade-up', // Default AOS animation style
  aosDuration: 800,        // AOS animation duration in ms
};

class ElevatorSystem {
  /**
   * Initialize the elevator transition system
   * @param {Object} customConfig - Override default configuration
   */
  constructor(customConfig = {}) {
    // Merge default config with custom config
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.timeline = null;
    this.initialized = false;
    this.currentSection = null;
    this.sections = [];
    
    // Initialize AOS
    AOS.init({
      duration: this.config.aosDuration,
      once: false,
      mirror: true,
      anchorPlacement: 'top-bottom',
    });
  }

  /**
   * Initialize the system and identify all sections
   */
  init() {
    if (this.initialized) return;
    
    // Find all sections
    this.sections = Array.from(document.querySelectorAll('.section, section, [data-elevator-section]'));
    
    // Add data attributes for AOS if they don't exist
    this.sections.forEach((section, index) => {
      section.setAttribute('data-elevator-index', index);
      
      // Add AOS attributes to children elements that don't have them
      const childElements = section.querySelectorAll('.animate, [data-elevator-animate]');
      childElements.forEach(el => {
        if (!el.hasAttribute('data-aos')) {
          el.setAttribute('data-aos', this.config.aosAnimation);
          el.setAttribute('data-aos-delay', Math.random() * 300);
        }
      });
    });

    // Set initial section
    this.currentSection = this.sections[0] || null;
    this.initialized = true;
    
    // Setup scroll event listeners for triggering transitions
    this.setupScrollListeners();
    
    // Refresh AOS to recognize new elements
    AOS.refresh();
    
    return this;
  }

  /**
   * Setup scroll event listeners
   */
  setupScrollListeners() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      const scrollingDown = st > lastScrollTop;
      
      // Determine visible section based on scroll position
      const viewportHeight = window.innerHeight;
      const scrollMiddle = st + (viewportHeight / 2);
      
      this.sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + st;
        const sectionBottom = sectionTop + rect.height;
        
        if (scrollMiddle >= sectionTop && scrollMiddle <= sectionBottom) {
          if (this.currentSection !== section) {
            this.navigateTo(section, { triggeredByScroll: true, direction: scrollingDown ? 'down' : 'up' });
          }
        }
      });
      
      lastScrollTop = st <= 0 ? 0 : st;
    }, { passive: true });
  }

  /**
   * Create a GSAP timeline for transition between sections
   * @param {HTMLElement} fromSection - Source section
   * @param {HTMLElement} toSection - Target section
   * @param {Object} options - Additional options
   * @returns {gsap.core.Timeline} GSAP Timeline
   */
  createTransitionTimeline(fromSection, toSection, options = {}) {
    const tl = gsap.timeline({ 
      paused: true,
      onComplete: () => {
        // Refresh AOS animations after transition
        AOS.refresh();
        if (toSection) {
          // Trigger AOS animations for the target section
          const animatedElements = toSection.querySelectorAll('[data-aos]');
          animatedElements.forEach(el => {
            el.classList.add('aos-animate');
          });
        }
      }
    });
    
    if (!fromSection || !toSection) return tl;
    
    // Direction based movement
    const direction = options.direction || (options.triggeredByScroll ? options.direction : null) || 'down';
    const yOffset = direction === 'up' ? '100%' : '-100%';
    
    // Create sci-fi style transition
    tl.set(toSection, { y: yOffset, opacity: 0 })
      .to(fromSection, {
        y: direction === 'up' ? '-100%' : '100%', 
        opacity: 0,
        duration: this.config.duration / 2,
        ease: this.config.ease
      })
      .to(toSection, {
        y: '0%',
        opacity: 1,
        duration: this.config.duration / 2,
        ease: this.config.ease
      }, '-=0.2')
      .fromTo(
        toSection.querySelectorAll('.stagger, [data-elevator-stagger]'),
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: this.config.staggerDelay,
          duration: Math.min(this.config.duration / 2, 0.5),
          ease: 'power1.out'
        }
      );
    
    // Add flashing/tech effect for more sci-fi feel
    const overlay = document.createElement('div');
    overlay.className = 'elevator-transition-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,200,255,0.1)',
      mixBlendMode: 'lighten',
      zIndex: 9999,
      pointerEvents: 'none',
      opacity: 0
    });
    document.body.appendChild(overlay);
    
    tl.to(overlay, { opacity: 0.7, duration: 0.1 }, this.config.duration / 3)
      .to(overlay, { opacity: 0, duration: 0.3 })
      .set(overlay, { opacity: 0.5 })
      .to(overlay, { opacity: 0, duration: 0.2 })
      .call(() => {
        document.body.removeChild(overlay);
      });
    
    return tl;
  }

  /**
   * Navigate to a specific section
   * @param {HTMLElement|number} target - Target section or index
   * @param {Object} options - Additional options
   */
  navigateTo(target, options = {}) {
    if (!this.initialized) this.init();
    
    // If target is a number, treat it as an index
    const targetSection = typeof target === 'number' 
      ? this.sections[target]
      : target;
    
    if (!targetSection || targetSection === this.currentSection) return;
    
    // Create and play the transition timeline
    const tl = this.createTransitionTimeline(this.currentSection, targetSection, options);
    tl.play();
    
    // Update current section
    this.currentSection = targetSection;
    
    // Play sound effect if enabled
    if (this.config.soundEffects && window.soundSystem) {
      window.soundSystem.play('elevator');
    }
    
    // Fire custom event
    const event = new CustomEvent('elevatorTransition', {
      detail: {
        from: this.sections.indexOf(this.currentSection),
        to: this.sections.indexOf(targetSection),
        options
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Navigate to the next section
   */
  next() {
    if (!this.initialized) this.init();
    if (!this.currentSection) return;
    
    const currentIndex = this.sections.indexOf(this.currentSection);
    const nextIndex = (currentIndex + 1) % this.sections.length;
    
    this.navigateTo(this.sections[nextIndex], { direction: 'down' });
  }

  /**
   * Navigate to the previous section
   */
  prev() {
    if (!this.initialized) this.init();
    if (!this.currentSection) return;
    
    const currentIndex = this.sections.indexOf(this.currentSection);
    const prevIndex = (currentIndex - 1 + this.sections.length) % this.sections.length;
    
    this.navigateTo(this.sections[prevIndex], { direction: 'up' });
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Update AOS configuration
    AOS.refreshHard();
    AOS.init({
      duration: this.config.aosDuration,
      once: false,
      mirror: true,
      anchorPlacement: 'top-bottom',
    });
    
    return this;
  }
}

// Export as singleton
const elevatorSystem = new ElevatorSystem();
export default elevatorSystem;

// Also export class for custom instances
export { ElevatorSystem };

