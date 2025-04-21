// Starship Corridor Animation System
// This module handles page transitions with a sci-fi starship door effect
import barba from '@barba/core';
import { gsap } from 'gsap';
import { Howl } from 'howler';

// Define sound effects using Howler.js
const sounds = {
  doorOpen: new Howl({
    src: ['assets/sounds/door-open.mp3'],
    volume: 0.7
  }),
  doorClose: new Howl({
    src: ['assets/sounds/door-close.mp3'],
    volume: 0.7
  }),
  ambient: new Howl({
    src: ['assets/sounds/corridor-ambient.mp3'],
    loop: true,
    volume: 0.2
  })
};

// Create overlay elements for the door animation
function createOverlayElements() {
  const overlay = document.createElement('div');
  overlay.className = 'transition-overlay';
  
  const leftDoor = document.createElement('div');
  leftDoor.className = 'door left-door';
  
  const rightDoor = document.createElement('div');
  rightDoor.className = 'door right-door';
  
  // Add panel details for sci-fi appearance
  for (let i = 0; i < 3; i++) {
    const leftPanel = document.createElement('div');
    leftPanel.className = `panel panel-${i}`;
    leftDoor.appendChild(leftPanel);
    
    const rightPanel = document.createElement('div');
    rightPanel.className = `panel panel-${i}`;
    rightDoor.appendChild(rightPanel);
  }
  
  overlay.appendChild(leftDoor);
  overlay.appendChild(rightDoor);
  document.body.appendChild(overlay);
  
  return { overlay, leftDoor, rightDoor };
}

// Initialize the door elements
const doorElements = createOverlayElements();

// Animation for opening the corridor doors
function openDoors() {
  return new Promise(resolve => {
    sounds.doorOpen.play();
    
    const timeline = gsap.timeline({
      onComplete: resolve
    });
    
    // Animate each panel with slight delay for mechanical feel
    timeline
      .set(doorElements.overlay, { autoAlpha: 1 })
      .to(doorElements.leftDoor.querySelectorAll('.panel'), {
        x: '-100%',
        stagger: 0.1,
        ease: 'power2.out',
        duration: 0.8
      }, 0)
      .to(doorElements.rightDoor.querySelectorAll('.panel'), {
        x: '100%',
        stagger: 0.1,
        ease: 'power2.out',
        duration: 0.8
      }, 0);
  });
}

// Animation for closing the corridor doors
function closeDoors() {
  return new Promise(resolve => {
    sounds.doorClose.play();
    
    const timeline = gsap.timeline({
      onComplete: resolve
    });
    
    // Animate each panel with slight delay for mechanical feel
    timeline
      .to(doorElements.leftDoor.querySelectorAll('.panel'), {
        x: '0%',
        stagger: 0.1,
        ease: 'power2.in',
        duration: 0.8
      }, 0)
      .to(doorElements.rightDoor.querySelectorAll('.panel'), {
        x: '0%',
        stagger: 0.1,
        ease: 'power2.in',
        duration: 0.8
      }, 0)
      .set(doorElements.overlay, { autoAlpha: 0 });
  });
}

// Initialize Barba.js for page transitions
function initPageTransitions() {
  barba.init({
    transitions: [{
      name: 'starship-corridor-transition',
      async leave(data) {
        // Close the doors before leaving current page
        await closeDoors();
        
        // Wait for the doors to close completely
        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.3
        });
      },
      async enter(data) {
        // Wait for doors to open before revealing new page
        await openDoors();
        
        // Fade in the new page content
        return gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.3
        });
      }
    }]
  });
}

// Initialize ambient sounds
function initAmbientSounds() {
  // Start ambient sound on first user interaction
  const startAmbient = () => {
    sounds.ambient.play();
    document.removeEventListener('click', startAmbient);
  };
  
  document.addEventListener('click', startAmbient);
}

// Add necessary CSS for the transition overlay
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      visibility: hidden;
      pointer-events: none;
    }
    
    .door {
      width: 50%;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .left-door {
      left: 0;
    }
    
    .right-door {
      right: 0;
    }
    
    .panel {
      flex: 1;
      background: linear-gradient(90deg, #2a3b4d, #1c2836);
      border: 1px solid #4a7ca5;
      box-shadow: inset 0 0 10px rgba(74, 124, 165, 0.5);
      position: relative;
    }
    
    .panel::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        90deg,
        rgba(74, 124, 165, 0.1),
        rgba(74, 124, 165, 0.1) 10px,
        transparent 10px,
        transparent 20px
      );
    }
  `;
  document.head.appendChild(style);
}

// Main initialization function
function init() {
  injectStyles();
  initPageTransitions();
  initAmbientSounds();
  
  // Make functions available globally for manual triggering if needed
  window.starshipTransitions = {
    openDoors,
    closeDoors
  };
  
  console.log('Starship corridor transition system initialized');
}

export default { init };

