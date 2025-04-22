// assets/doorTransition.js
// Reusable Grimdark Door Transition with Sound and Light Flicker
// Requires: GSAP, Howler.js, door overlay HTML, and the relevant CSS

// ---- Door Transition Module ----
(function(window) {
    // Sound setup (expects Howler.js loaded)
    const sounds = {
        doorOpenClose: new Howl({ src: ['assets/sounds/door_open_close.mp3'], volume: 0.48 }),
        btnClick: new Howl({ src: ['assets/sounds/btnClick.wav'], volume: 0.45 })
    };

    // --- AUDIO UNLOCK ON FIRST USER INTERACTION ---
    let audioUnlocked = false;
    let pendingDoorTransition = null;
    function unlockAudioAndPlayPending() {
        if (audioUnlocked) return;
        audioUnlocked = true;
        // Unlock Howler (if needed)
        if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
        // Play pending door sound if needed
        if (pendingDoorTransition) {
            playDoorTransition(...pendingDoorTransition);
            pendingDoorTransition = null;
        }
        // Remove listeners
        window.removeEventListener('click', unlockAudioAndPlayPending);
        window.removeEventListener('keydown', unlockAudioAndPlayPending);
        window.removeEventListener('touchstart', unlockAudioAndPlayPending);
    }
    window.addEventListener('click', unlockAudioAndPlayPending);
    window.addEventListener('keydown', unlockAudioAndPlayPending);
    window.addEventListener('touchstart', unlockAudioAndPlayPending);

    // Inject CSS automatically if not present
    function injectDoorTransitionCSS() {
        if (!document.querySelector('link[data-door-transition-css]')) {
            var l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = 'assets/doorTransition.css';
            l.setAttribute('data-door-transition-css', 'true');
            document.head.appendChild(l);
        }
    }

    // Create overlay if not present
    function ensureDoorOverlay() {
        if (document.getElementById('grimdarkDoorOverlay')) return;
        const overlay = document.createElement('div');
        overlay.className = 'grimdark-paneldoor-overlay';
        overlay.id = 'grimdarkDoorOverlay';
        overlay.innerHTML = `
        <!-- Caution border frame as a screen outline, metallic edge perfectly flush with screen edge -->
        <svg class="grimdark-caution-frame" width="100vw" height="100vh" viewBox="0 0 1920 1080" preserveAspectRatio="none"
             style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:200;pointer-events:none;">
          <defs>
            <pattern id="cautionStripes" patternUnits="userSpaceOnUse" width="64" height="64" patternTransform="rotate(45)">
              <rect x="0" y="0" width="32" height="64" fill="#FFD600"/>
              <rect x="32" y="0" width="32" height="64" fill="#222"/>
            </pattern>
            <linearGradient id="metalEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#d3d7db"/>
              <stop offset="50%" stop-color="#888d92"/>
              <stop offset="100%" stop-color="#44474a"/>
            </linearGradient>
          </defs>
          <!-- Top metallic border -->
          <rect x="0" y="0" width="1920" height="96" fill="url(#metalEdge)" shape-rendering="crispEdges"/>
          <!-- Top caution stripes -->
          <rect x="0" y="0" width="1920" height="64" fill="url(#cautionStripes)" shape-rendering="crispEdges"/>
          <!-- Bottom metallic border -->
          <rect x="0" y="984" width="1920" height="96" fill="url(#metalEdge)" shape-rendering="crispEdges"/>
          <!-- Bottom caution stripes -->
          <rect x="0" y="1016" width="1920" height="64" fill="url(#cautionStripes)" shape-rendering="crispEdges"/>
          <!-- Left metallic border -->
          <rect x="0" y="96" width="96" height="888" fill="url(#metalEdge)" shape-rendering="crispEdges"/>
          <!-- Left caution stripes -->
          <rect x="0" y="96" width="64" height="888" fill="url(#cautionStripes)" shape-rendering="crispEdges"/>
          <!-- Right metallic border -->
          <rect x="1824" y="96" width="96" height="888" fill="url(#metalEdge)" shape-rendering="crispEdges"/>
          <!-- Right caution stripes -->
          <rect x="1856" y="96" width="64" height="888" fill="url(#cautionStripes)" shape-rendering="crispEdges"/>
        </svg>
        <div class="grimdark-paneldoor-frame" style="position:relative;z-index:210;width:100vw;">
            <!-- Light bar with metallic receptacle, in front of frame -->
            <svg class="paneldoor-light-receptacle" width="440" height="70" viewBox="0 0 440 70" style="position:absolute;left:50%;top:0;transform:translateX(-50%);z-index:211;">
                <!-- Receptacle base -->
                <rect x="0" y="10" width="440" height="50" rx="18" fill="#b0b6bb" stroke="#888d92" stroke-width="3"/>
                <rect x="16" y="24" width="408" height="22" rx="8" fill="#23272b" stroke="#d3d7db" stroke-width="1.5"/>
                <!-- Light bar -->
                <rect id="paneldoorLightBulb" class="paneldoor-light-bulb red" x="20" y="26" width="400" height="18" rx="9" fill="#f44336"/>
            </svg>
        </div>
        <div class="grimdark-paneldoor-container">
            <div class="grimdark-paneldoor-left grimdark-paneldoor-door">
                <div class="grimdark-paneldoor-panel"></div>
                <div class="grimdark-paneldoor-panel"></div>
                <div class="grimdark-paneldoor-panel"></div>
            </div>
            <div class="grimdark-paneldoor-right grimdark-paneldoor-door">
                <div class="grimdark-paneldoor-panel"></div>
                <div class="grimdark-paneldoor-panel"></div>
                <div class="grimdark-paneldoor-panel"></div>
            </div>
        </div>
        `;
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '99999';
        document.body.appendChild(overlay);
    }

    // Play door transition (direction: 'close' or 'open')
    function playDoorTransition(direction = 'close', opts = {}) {
        // If this is a navigation close, persist overlay for next page
        if (direction === 'close' && opts && opts.persistForNextPage) {
            sessionStorage.setItem('doorTransitionPending', '1');
        }
        injectDoorTransitionCSS();
        ensureDoorOverlay();
        const overlay = document.getElementById('grimdarkDoorOverlay');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '99999';
        document.body.classList.add('grimdark-lock-scroll');
        const leftPanels = Array.from(overlay.querySelectorAll('.grimdark-paneldoor-left .grimdark-paneldoor-panel'));
        const rightPanels = Array.from(overlay.querySelectorAll('.grimdark-paneldoor-right .grimdark-paneldoor-panel'));
        const lightBulb = document.getElementById('paneldoorLightBulb');
        // Set doors to closed (covering screen)
        if (direction === 'close') {
            leftPanels.forEach(p => gsap.set(p, { x: '0%' }));
            rightPanels.forEach(p => gsap.set(p, { x: '0%' }));
            lightBulb.setAttribute('fill', '#f44336');
            lightBulb.classList.remove('green');
            lightBulb.classList.add('red');
            gsap.set(lightBulb, { opacity: 1 });
        }
        // Animate open
        if (direction === 'open') {
            // Animate doors opening with proper timing before hiding overlay
            if (window.grimdarkTimeline) window.grimdarkTimeline.kill();
            window.grimdarkTimeline = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
                onComplete: () => {
                    // Turn light green when door is fully open
                    if (lightBulb) {
                        lightBulb.setAttribute('fill', '#5fc34d');
                        lightBulb.classList.remove('red');
                        lightBulb.classList.add('green');
                    }
                    // Hide/remove overlay and remove is-preload after animation completes
                    const overlay = document.getElementById('grimdarkDoorOverlay');
                    if (overlay) {
                        overlay.style.opacity = '0';
                        overlay.style.pointerEvents = 'none';
                        setTimeout(() => {
                            overlay.remove();
                            document.body.classList.remove('is-preload');
                            document.documentElement.classList.remove('is-preload');
                        }, 500);
                    }
                    document.body.classList.remove('grimdark-lock-scroll');
                    if (opts && typeof opts.onComplete === 'function') opts.onComplete();
                }
            });
            // Flicker/flick GSAP timeline for the light bar
            const flickerDuration = 2.2;
            const flickerSteps = Math.floor(flickerDuration / 0.09);
            const flickerKeyframes = [];
            for (let i = 0; i < flickerSteps; ++i) {
                flickerKeyframes.push({ opacity: 0.4 + Math.random()*0.6, duration: 0.045 });
                flickerKeyframes.push({ opacity: 1, duration: 0.045 });
            }
            const lightFlicker = gsap.timeline();
            lightFlicker
                .set(lightBulb, { attr: { fill: '#f44336' } })
                .add(() => lightBulb.classList.add('red'))
                .to(lightBulb, { keyframes: flickerKeyframes, repeat: 0 }, 0)
                .to(lightBulb, { opacity: 1, duration: 0.18 }, `+=0`);
            window.grimdarkTimeline
                .to({}, { duration: 0.5 }) // open delay
                .add(() => { if (audioUnlocked && opts.playSound) sounds.doorOpenClose.play(); }, '<') // play sound only if requested
                .to(leftPanels, { x: '-200%', stagger: 0.1, duration: 2.0 }, '<')
                .to(rightPanels, { x: '200%', stagger: 0.1, duration: 2.0 }, '<')
                .add(() => {
                    if (lightBulb) {
                        lightBulb.setAttribute('fill', '#5fc34d');
                        lightBulb.classList.remove('red');
                        lightBulb.classList.add('green');
                    }
                }, '>-0.2'); // turn green just before the overlay is removed
            return;
        }
        // Flicker/flick GSAP timeline for the light bar
        const flickerDuration = 2.2; // slightly shorter since no fog
        const flickerSteps = Math.floor(flickerDuration / 0.09);
        const flickerKeyframes = [];
        for (let i = 0; i < flickerSteps; ++i) {
            flickerKeyframes.push({ opacity: 0.4 + Math.random()*0.6, duration: 0.045 });
            flickerKeyframes.push({ opacity: 1, duration: 0.045 });
        }
        const lightFlicker = gsap.timeline();
        lightFlicker
            .set(lightBulb, { attr: { fill: '#f44336' } })
            .add(() => lightBulb.classList.add('red'))
            .to(lightBulb, { keyframes: flickerKeyframes, repeat: 0 }, 0)
            .to(lightBulb, { opacity: 1, duration: 0.18 }, `+=0`);
        if (window.grimdarkTimeline) window.grimdarkTimeline.kill();
        window.grimdarkTimeline = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            onComplete: () => {
                // Removed code here
                document.body.classList.remove('grimdark-lock-scroll');
                if (opts && typeof opts.onComplete === 'function') opts.onComplete();
            }
        });
        window.grimdarkTimeline
            .to({}, { duration: 0.5 }) // open delay
            .add(() => { if (audioUnlocked && opts.playSound) sounds.doorOpenClose.play(); }, '<') // play sound only if requested
            .to(leftPanels, { x: direction === 'open' ? '-200%' : '0%', stagger: 0.1, duration: 0.8 }, '<')
            .to(rightPanels, { x: direction === 'open' ? '200%' : '0%', stagger: 0.1, duration: 0.8 }, '<');
    }

    // On page load, show the door and wait for user click to open
    window.addEventListener('DOMContentLoaded', () => {
        injectDoorTransitionCSS();
        ensureDoorOverlay();
        waitForUserToOpenDoor();
    });

    // Show door closed and wait for user click to open
    function waitForUserToOpenDoor() {
        const overlay = document.getElementById('grimdarkDoorOverlay');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '99999';
        document.body.classList.add('grimdark-lock-scroll');
        const leftPanels = Array.from(overlay.querySelectorAll('.grimdark-paneldoor-left .grimdark-paneldoor-panel'));
        const rightPanels = Array.from(overlay.querySelectorAll('.grimdark-paneldoor-right .grimdark-paneldoor-panel'));
        const lightBulb = document.getElementById('paneldoorLightBulb');
        // Restore door to closed state and red light
        leftPanels.forEach(p => gsap.set(p, { x: '0%' }));
        rightPanels.forEach(p => gsap.set(p, { x: '0%' }));
        if (lightBulb) {
            lightBulb.setAttribute('fill', '#f44336');
            lightBulb.classList.remove('green');
            lightBulb.classList.add('red');
            gsap.set(lightBulb, { opacity: 1 });
        }
        // Add overlay text if missing
        if (!overlay.querySelector('.door-enter-message')) {
            const msg = document.createElement('div');
            msg.className = 'door-enter-message';
            msg.innerHTML = '<span style="font-size:2rem;color:#fff;text-shadow:0 2px 8px #000a;">Click to Enter</span>';
            Object.assign(msg.style, {
                position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none', userSelect: 'none'
            });
            overlay.appendChild(msg);
        }
        // Wait for first click anywhere
        function openOnClick() {
            setTimeout(() => {
                playDoorTransition('open', { playSound: true });
            }, 200);
            overlay.querySelector('.door-enter-message')?.remove();
            window.removeEventListener('click', openOnClick);
            window.removeEventListener('keydown', openOnClick);
            window.removeEventListener('touchstart', openOnClick);
        }
        window.addEventListener('click', openOnClick);
        window.addEventListener('keydown', openOnClick);
        window.addEventListener('touchstart', openOnClick);
    }

    // Add a function to handle user click, delay, then play sound and open door
    function waitForUserToOpenWithDelayAndSound(delayMs = 300) {
        const overlay = document.getElementById('grimdarkDoorOverlay');
        if (!overlay) return;
        overlay.style.cursor = 'pointer';
        overlay.addEventListener('click', function handler() {
            overlay.removeEventListener('click', handler);
            overlay.style.cursor = 'default';
            setTimeout(() => {
                if (window.DoorTransition && typeof DoorTransition.play === 'function') {
                    DoorTransition.play('open', { playSound: true });
                }
            }, delayMs);
        });
    }

    // Hijack navigation for door transition
    function enableDoorTransitionsOnLinks() {
        injectDoorTransitionCSS();
        document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"])').forEach(link => {
            // Avoid double-binding
            if (link.hasAttribute('data-door-nav-bound')) return;
            link.setAttribute('data-door-nav-bound', 'true');
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || link.target === '_blank' || link.hasAttribute('download')) return;
                e.preventDefault();
                playDoorTransition('close', {
                    persistForNextPage: true,
                    onComplete: () => { window.location.href = href; }
                });
            });
        });
    }

    // Play open on page load
    function playDoorOpenOnLoad() {
        injectDoorTransitionCSS();
        window.addEventListener('DOMContentLoaded', () => {
            playDoorTransition('open');
        });
    }

    // Expose API
    window.DoorTransition = {
        play: playDoorTransition,
        enableOnLinks: enableDoorTransitionsOnLinks,
        playOpenOnLoad: playDoorOpenOnLoad,
        ensureOverlay: ensureDoorOverlay,
        waitForUserToOpen: waitForUserToOpenDoor,
        waitForUserToOpenWithDelayAndSound: waitForUserToOpenWithDelayAndSound
    };
})(window);
