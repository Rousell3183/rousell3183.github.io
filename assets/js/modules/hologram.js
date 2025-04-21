/**
 * Hologram Module
 * 
 * Implements Three.js holographic overlays with sci-fi style effects
 */

import * as THREE from 'three';

// Hologram shader code
const HologramShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Add slight wave effect to vertices
      vec3 newPosition = position;
      newPosition.y += sin(position.x * 10.0 + time) * 0.005;
      newPosition.x += cos(position.y * 10.0 + time) * 0.005;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    uniform float opacity;
    uniform vec3 hologramColor;
    uniform sampler2D baseTexture;
    uniform bool hasTexture;
    
    // Noise function for scanlines and flickering
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      // Base color from texture or default hologram color
      vec4 baseColor = hasTexture ? texture2D(baseTexture, vUv) : vec4(hologramColor, 1.0);
      
      // Scanlines effect
      float scanLine = sin(vUv.y * 100.0 + time * 5.0) * 0.05 + 0.05;
      
      // Horizontal lines
      float horizontalLines = step(0.99, sin(vUv.y * 100.0) * 0.5 + 0.5);
      
      // Flickering effect
      float flicker = noise(vec2(time * 5.0, time * 10.0)) * 0.1 + 0.9;
      
      // Edge highlighting effect
      float edge = pow(1.0 - max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0, 2.0) * 0.5;
      
      // Combine effects
      vec3 finalColor = baseColor.rgb + vec3(scanLine) + vec3(horizontalLines * 0.1);
      finalColor *= flicker;
      finalColor += edge * hologramColor * 0.5;
      
      // Apply opacity with distance fade
      float alphaFade = min(1.0, 10.0 * (0.5 - abs(vUv.y - 0.5)));
      float finalOpacity = opacity * baseColor.a * alphaFade;
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `
};

/**
 * Hologram System for creating and managing holographic elements
 */
class HologramSystem {
  /**
   * Initialize the hologram system
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      containerSelector: '[data-hologram-container]',
      color: new THREE.Color(0x00ccff),
      intensity: 1.5,
      opacity: 0.7,
      animationSpeed: 1.0,
      autoRotate: true,
      enableInteraction: true,
      renderOnDemand: false,
      ...options
    };
    
    this.scenes = new Map();
    this.renderers = new Map();
    this.cameras = new Map();
    this.holograms = new Map();
    this.clock = new THREE.Clock();
    this.initialized = false;
  }
  
  /**
   * Initialize the system and set up containers
   */
  init() {
    if (this.initialized) return this;
    
    // Find all hologram containers
    const containers = document.querySelectorAll(this.options.containerSelector);
    if (containers.length === 0) {
      console.warn('No hologram containers found with selector:', this.options.containerSelector);
    }
    
    // Set up each container
    containers.forEach((container, index) => {
      const id = container.id || `hologram-${index}`;
      this.setupContainer(container, id);
    });
    
    // Start animation loop if not using on-demand rendering
    if (!this.options.renderOnDemand) {
      this.animate();
    }
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Set up a hologram container with Three.js scene
   * @param {HTMLElement} container - Container element
   * @param {string} id - Unique identifier for this container
   */
  setupContainer(container, id) {
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
    // Append to container
    container.appendChild(renderer.domElement);
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      
      // Force render on resize if using on-demand rendering
      if (this.options.renderOnDemand) {
        this.render(id);
      }
    });
    resizeObserver.observe(container);
    
    // Add to maps
    this.scenes.set(id, { scene, container, resizeObserver });
    this.cameras.set(id, camera);
    this.renderers.set(id, renderer);
    this.holograms.set(id, []);
    
    // Add mouse interaction if enabled
    if (this.options.enableInteraction) {
      this.setupInteraction(container, id);
    }
  }
  
  /**
   * Set up mouse/touch interaction for a container
   * @param {HTMLElement} container - Container element
   * @param {string} id - Container ID
   */
  setupInteraction(container, id) {
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    const getHolograms = () => this.holograms.get(id) || [];
    
    container.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    
    container.addEventListener('touchstart', (e) => {
      isMouseDown = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    });
    
    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
    
    window.addEventListener('touchend', () => {
      isMouseDown = false;
    });
    
    container.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      getHolograms().forEach(hologram => {
        hologram.rotation.y += deltaX * 0.01;
        hologram.rotation.x += deltaY * 0.01;
      });
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      
      // Force render if using on-demand rendering
      if (this.options.renderOnDemand) {
        this.render(id);
      }
    });
    
    container.addEventListener('touchmove', (e) => {
      if (!isMouseDown) return;
      
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      
      getHolograms().forEach(hologram => {
        hologram.rotation.y += deltaX * 0.01;
        hologram.rotation.x += deltaY * 0.01;
      });
      
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      
      // Force render if using on-demand rendering
      if (this.options.renderOnDemand) {
        this.render(id);
      }
    });
    
    // Scroll to zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const camera = this.cameras.get(id);
      if (!camera) return;
      
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(10, camera.position.z));
      
      // Force render if using on-demand rendering
      if (this.options.renderOnDemand) {
        this.render(id);
      }
    }, { passive: false });
  }
  
  /**
   * Create a holographic object from a mesh or geometry
   * @param {Object} options - Hologram options
   * @returns {THREE.Object3D} Hologram object
   */
  createHologram(options = {}) {
    const config = {
      geometry: null,  // Geometry to use (required unless mesh is provided)
      mesh: null,      // Mesh to convert to hologram (optional)
      size: 1.0,       // Size multiplier
      color: this.options.color.clone(),
      opacity: this.options.opacity,
      texture: null,   // Optional texture path
      wireframe: true, // Show wireframe
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      containerId: null, // Which container to add to (null = all)
      glitchIntensity: 0.2,
      ...options
    };
    
    let geometry;
    
    // Use provided geometry, mesh, or create default cube
    if (config.geometry) {
      geometry = config.geometry;
    } else if (config.mesh) {
      geometry = config.mesh.geometry;
    } else {
      geometry = new THREE.BoxGeometry(config.size, config.size, config.size);
    }
    
    // Create material with hologram shader
    const uniforms = {
      time: { value: 0 },
      opacity: { value: config.opacity },
      hologramColor: { value: new THREE.Color(config.color) },
      hasTexture: { value: !!config.texture },
      baseTexture: { value: null }
    };
    
    // Load texture if provided
    if (config.texture) {
      new THREE.TextureLoader().load(config.texture, (texture) => {
        uniforms.baseTexture.value = texture;
        // Force render if using on-demand rendering
        if (this.options.renderOnDemand) {
          this.render();
        }
      });
    }
    
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: HologramShader.vertexShader,
      fragmentShader: HologramShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    // Create mesh
    const hologramMesh = new THREE.Mesh(geometry, material);
    
    // Add wireframe if enabled
    if (config.wireframe) {
      const wireGeometry = geometry.clone();
      const wireMaterial = new THREE.LineBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: config.opacity * 0.5
      });
      
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(wireGeometry),
        wireMaterial
      );
      hologramMesh.add(wireframe);
    }
    
    // Set position and rotation
    hologramMesh.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    
    hologramMesh.rotation.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    
    // Scale mesh
    hologramMesh.scale.multiplyScalar(config.size);
    
    // Add animation attributes
    hologramMesh.userData = {
      hologram: true,
      rotationSpeed: 0.005 * this.options.animationSpeed,
      glitchTime: 0,
      glitchIntensity: config.glitchIntensity,
      uniforms: uniforms
    };
    
    // Add to scenes
    if (config.containerId) {
      // Add to specific container
      const scene = this.scenes.get(config.containerId)?.scene;
      if (scene) {
        scene.add(hologramMesh);
        this.holograms.get(config.containerId)?.push(hologramMesh);
      }
    } else {
      // Add to all containers
      this.scenes.forEach(({ scene }, id) => {
        const clonedHologram = hologramMesh.clone();
        clonedHologram.userData = { ...hologramMesh.userData };
        scene.add(clonedHologram);
        this.holograms.get(id)?.push(clonedHologram);
      });
    }
    
    return hologramMesh;
  }
  
  /**
   * Create a holographic text element
   * @param {string} text - Text to display
   * @param {Object} options - Configuration options
   * @returns {THREE.Object3D} Text hologram
   */
  createTextHologram(text, options = {}) {
    const loader = new THREE.FontLoader();
    
    // Return a promise that resolves when the font is loaded
    return new Promise((resolve, reject) => {
      // Use injected three.js font or load a default one
      const fontPath = options.fontPath || 'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json';
      
      loader.load(fontPath, (font) => {
        const textGeometry = new THREE.TextGeometry(text, {
          font: font,
          size: options.size || 0.2,
          height: options.depth || 0.05,
          curveSegments: 4,
          bevelEnabled: false
        });
        
        textGeometry.center();
        
        const hologram = this.createHologram({
          geometry: textGeometry,
          wireframe: options.wireframe !== undefined ? options.wireframe : true,
          ...options
        });
        
        resolve(hologram);
      }, undefined, reject);
    });
  }
  
  /**
   * Start animation loop
   */
  animate() {
    if (!this.initialized) return;
    
    const time = this.clock.getElapsedTime();
    
    // Animate all containers
    this.scenes.forEach((sceneData, id) => {
      // Get relevant objects
      const camera = this.cameras.get(id);
      const renderer = this.renderers.get(id);
      const holograms = this.holograms.get(id) || [];
      
      if (!camera || !renderer || !sceneData.scene) return;
      
      // Animate each hologram
      holograms.forEach(hologram => {
        // Update uniforms (for shader)
        if (hologram.userData.uniforms) {
          hologram.userData.uniforms.time.value = time;
        }
        
        // Auto-rotate if enabled
        if (this.options.autoRotate) {
          hologram.rotation.y += hologram.userData.rotationSpeed || 0.005;
        }
        
        // Random glitch effect
        if (Math.random() < 0.01 * (hologram.userData.glitchIntensity || 0.2)) {
          hologram.position.y += (Math.random() - 0.5) * 0.01;
          setTimeout(() => {
            hologram.position.y -= (Math.random() - 0.5) * 0.01;
          }, 150);
        }
      });
      
      // Render the scene
      renderer.render(sceneData.scene, camera);
    });
    
    // Request next frame if not using on-demand rendering
    if (!this.options.renderOnDemand) {
      requestAnimationFrame(() => this.animate());
    }
  }
  
  /**
   * Render specific container or all containers once
   * @param {string} id - Container ID (optional, renders all if not specified)
   */
  render(id = null) {
    if (id) {
      // Render specific container
      const sceneData = this.scenes.get(id);
      const camera = this.cameras.get(id);
      const renderer = this.renderers.get(id);
      
      if (sceneData?.scene && camera && renderer) {
        renderer.render(sceneData.scene, camera);
      }
    } else {
      // Render all containers
      this.scenes.forEach((sceneData, containerId) => {
        const camera = this.cameras.get(containerId);
        const renderer = this.renderers.get(containerId);
        
        if (sceneData.scene && camera && renderer) {
          renderer.render(sceneData.scene, camera);
        }
      });
    }
  }
  
  /**
   * Dispose of resources and clean up
   */
  dispose() {
    // Stop animation loop
    this.options.renderOnDemand = true;
    
    // Dispose scenes and renderers
    this.scenes.forEach((sceneData, id) => {
      // Disconnect resize observer
      if (sceneData.resizeObserver) {
        sceneData.resizeObserver.disconnect();
      }
      
      // Dispose renderer
      const renderer = this.renderers.get(id);
      if (renderer) {
        renderer.dispose();
        
        // Remove canvas from DOM
        const canvas = renderer.domElement;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
      
      // Dispose scene objects
      const holograms = this.holograms.get(id) || [];
      holograms.forEach(hologram => {
        if (hologram.geometry) hologram.geometry.dispose();
        if (hologram.material) hologram.material.dispose();
        sceneData.scene.remove(hologram);
      });
    });
    
    // Clear maps
    this.scenes.clear();
    this.renderers.clear();
    this.cameras.clear();
    this.holograms.clear();
    
    this.initialized = false;
  }
}

// Export the HologramSystem class
export { HologramSystem };

