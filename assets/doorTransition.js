// assets/doorTransition.js
// Reusable Grimdark Door Transition with Sound and Light Flicker
// Requires: GSAP, Howler.js, door overlay HTML, and the relevant CSS

// ---- Door Transition Module ----
(function(window) {
    // Sound setup (expects Howler.js loaded)
    const sounds = {
        doorOpenClose: new Howl({ src: ['assets/sounds/door_open_close.mp3'], volume: 0.77 }),
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
        <div class="grimdark-paneldoor-frame">
            <svg class="paneldoor-light-svg" width="100vw" height="54" viewBox="0 0 1920 54">
                <rect id="paneldoorLightBulb" class="paneldoor-light-bulb red" x="0" y="0" width="1920" height="54" rx="12" fill="#f44336"/>
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
        <div id="doorFog" class="grimdark-elevator-fog"></div>
        `;
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '99999';
        document.body.appendChild(overlay);
    }

    // Play door transition (direction: 'close' or 'open')
    function playDoorTransition(direction = 'close', opts = {}) {
        // If audio not unlocked yet, defer playing until unlock
        if (!audioUnlocked) {
            pendingDoorTransition = [direction, opts];
            return;
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
        const fog = overlay.querySelector('#doorFog');
        const lightBulb = document.getElementById('paneldoorLightBulb');
        // Start doors fully open (offscreen)
        gsap.set(fog, { opacity: 0, y: 40, scaleY: 0.6 });
        leftPanels.forEach(p => gsap.set(p, { x: direction === 'open' ? '0%' : '-200%' }));
        rightPanels.forEach(p => gsap.set(p, { x: direction === 'open' ? '0%' : '200%' }));
        lightBulb.classList.remove('green','red');
        overlay.offsetHeight;
        // Flicker timeline
        const flickerDuration = 2.8;
        const flickerSteps = Math.floor(flickerDuration / 0.09);
        const flickerKeyframes = [];
        for (let i = 0; i < flickerSteps; ++i) {
            flickerKeyframes.push({ opacity: 0.4 + Math.random()*0.6, duration: 0.045 });
            flickerKeyframes.push({ opacity: 1, duration: 0.045 });
        }
        const lightFlicker = gsap.timeline();
        lightFlicker
            .set(lightBulb, { attr: { fill: '#f44336' } })
            .add(() => { lightBulb.classList.remove('green'); lightBulb.classList.add('red'); }, 0)
            .to(lightBulb, { keyframes: flickerKeyframes, repeat: 0 }, 0)
            .to(lightBulb, { attr: { fill: '#5fc34d' }, opacity: 1, duration: 0.24,
                onStart: () => { lightBulb.classList.remove('red'); lightBulb.classList.add('green'); }
            }, `+=0`);
        // Animate
        const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            onComplete: () => {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                overlay.style.zIndex = '';
                document.body.classList.remove('grimdark-lock-scroll');
                if (opts && typeof opts.onComplete === 'function') opts.onComplete();
            }
        });
        if (direction === 'close') {
            tl.add(() => { sounds.doorOpenClose.stop(); sounds.doorOpenClose.play(); }, 0) // Play sound at start, always
              .to(leftPanels, { x: '0%', stagger: 0.1, duration: 0.9 }, 0)
              .to(rightPanels, { x: '0%', stagger: 0.1, duration: 0.9 }, 0)
              .to(fog, { opacity: 0.7, scaleY: 1, y: 0, duration: 0.8 }, '-=0.3')
              .to({}, { duration: 1.0 });
        } else {
            tl.add(() => { sounds.doorOpenClose.stop(); sounds.doorOpenClose.play(); }, 0) // Play sound at start, always
              .to(leftPanels, { x: '-200%', stagger: 0.1, duration: 1.2 }, 0)
              .to(rightPanels, { x: '200%', stagger: 0.1, duration: 1.2 }, 0)
              .to(fog, { opacity: 0, duration: 0.7 }, '-=0.5');
        }
        return tl;
    }

    // Hijack navigation for door transition
    function enableDoorTransitionsOnLinks() {
        injectDoorTransitionCSS();
        document.querySelectorAll('a[data-door-transition], a.door-transition').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || link.target === '_blank') return;
                e.preventDefault();
                playDoorTransition('close', {
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
        ensureOverlay: ensureDoorOverlay
    };
})(window);
