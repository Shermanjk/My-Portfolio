/**
 * DomeGallery — 3D Spherical Gallery Component (React Bits Native Vanilla JS Port)
 * Full 3D spherical dome projection, drag momentum with inertia,
 * perimeter radial blur vignettes, and direct connection to Split Modal.
 */

(function () {
  'use strict';

  const DOME_WORK_IMAGES = [
    {
      index: 0,
      src: 'assets/img/photos/cenro-deployment.jpg',
      alt: 'CENRO System Walkthrough & Training',
      title: 'CENRO System Walkthrough & Training'
    },
    {
      index: 1,
      src: 'assets/img/photos/field-deployment.jpg',
      alt: 'On-Site Client Deployment',
      title: 'On-Site Client Deployment'
    },
    {
      index: 2,
      src: 'assets/img/photos/hardware-servicing.jpg',
      alt: 'Hardware Diagnostics & Maintenance',
      title: 'Hardware Diagnostics & Maintenance'
    },
    {
      index: 3,
      src: 'assets/img/photos/dev-battlestation.jpg',
      alt: 'Development & System Engineering',
      title: 'Development & System Engineering'
    },
    {
      index: 4,
      src: 'assets/img/photos/build-staging.jpg',
      alt: 'Build Staging & Hardware Testing',
      title: 'Build Staging & Hardware Testing'
    },
    {
      index: 5,
      src: 'assets/img/photos/late-night-coding.jpg',
      alt: 'Focused Development Session',
      title: 'Focused Development Session'
    }
  ];

  const CONFIG = {
    segments: 35,
    maxVerticalRotationDeg: 6,
    dragSensitivity: 22,
    dragDampening: 0.65,
    minRadius: 360,
    maxRadius: 600,
    fit: 0.52,
    fitBasis: 'auto',
    grayscale: false,
    imageBorderRadius: '14px'
  };

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const wrapAngleSigned = deg => {
    const a = (((deg + 180) % 360) + 360) % 360;
    return a - 180;
  };

  function buildItems(pool, seg) {
    const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
    const evenYs = [-4, -2, 0, 2, 4];
    const oddYs = [-3, -1, 1, 3, 5];

    const coords = xCols.flatMap((x, c) => {
      const ys = c % 2 === 0 ? evenYs : oddYs;
      return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
    });

    const totalSlots = coords.length;
    const normalizedImages = pool.map(img => ({
      index: img.index,
      src: img.src || '',
      alt: img.alt || ''
    }));

    const usedImages = Array.from(
      { length: totalSlots },
      (_, i) => normalizedImages[i % normalizedImages.length]
    );

    // De-duplicate adjacent identical images
    for (let i = 1; i < usedImages.length; i++) {
      if (usedImages[i].src === usedImages[i - 1].src) {
        for (let j = i + 1; j < usedImages.length; j++) {
          if (usedImages[j].src !== usedImages[i].src) {
            const tmp = usedImages[i];
            usedImages[i] = usedImages[j];
            usedImages[j] = tmp;
            break;
          }
        }
      }
    }

    return coords.map((c, i) => ({
      ...c,
      index: usedImages[i].index,
      src: usedImages[i].src,
      alt: usedImages[i].alt
    }));
  }

  function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
    const unit = 360 / segments / 2;
    const rotateY = unit * (offsetX + (sizeX - 1) / 2);
    const rotateX = unit * (offsetY - (sizeY - 1) / 2);
    return { rotateX, rotateY };
  }

  function initDomeGallery() {
    const container = document.getElementById('dome-gallery-container');
    if (!container) return;

    // Clear existing contents
    container.innerHTML = '';

    // Create wrapper & DOM elements
    const wrapper = document.createElement('div');
    wrapper.className = 'dome-gallery-wrapper';

    const root = document.createElement('div');
    root.className = 'sphere-root';
    root.style.setProperty('--segments-x', CONFIG.segments);
    root.style.setProperty('--segments-y', CONFIG.segments);
    root.style.setProperty('--tile-radius', CONFIG.imageBorderRadius);
    root.style.setProperty('--image-filter', CONFIG.grayscale ? 'grayscale(1)' : 'none');

    const main = document.createElement('main');
    main.className = 'sphere-main';

    const stage = document.createElement('div');
    stage.className = 'stage';

    const sphere = document.createElement('div');
    sphere.className = 'sphere';

    // Modal trigger helper with debounce
    let lastModalTriggerTime = 0;
    function openModalForTile(photoIdx, triggerEl) {
      const now = performance.now();
      if (now - lastModalTriggerTime < 350) return;
      lastModalTriggerTime = now;

      if (typeof window.openGalleryModal === 'function') {
        window.openGalleryModal(photoIdx, triggerEl);
      }
    }

    // Generate Items
    const items = buildItems(DOME_WORK_IMAGES, CONFIG.segments);

    items.forEach(it => {
      const itemEl = document.createElement('div');
      itemEl.className = 'item';
      itemEl.dataset.src = it.src;
      itemEl.dataset.offsetX = it.x;
      itemEl.dataset.offsetY = it.y;
      itemEl.dataset.sizeX = it.sizeX;
      itemEl.dataset.sizeY = it.sizeY;
      itemEl.dataset.photoIndex = it.index;

      itemEl.style.setProperty('--offset-x', it.x);
      itemEl.style.setProperty('--offset-y', it.y);
      itemEl.style.setProperty('--item-size-x', it.sizeX);
      itemEl.style.setProperty('--item-size-y', it.sizeY);

      const rot = computeItemBaseRotation(it.x, it.y, it.sizeX, it.sizeY, CONFIG.segments);
      itemEl.style.transform = `rotateY(${rot.rotateY}deg) rotateX(${rot.rotateX}deg) translateZ(var(--radius))`;

      const btn = document.createElement('div');
      btn.className = 'item__image';
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('aria-label', it.alt || 'View details');

      const img = document.createElement('img');
      img.src = it.src;
      img.alt = it.alt;
      img.draggable = false;
      img.loading = 'lazy';

      // Direct click listener on each tile
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasMoved) return;
        const photoIdx = parseInt(itemEl.dataset.photoIndex, 10);
        if (!isNaN(photoIdx)) {
          openModalForTile(photoIdx, btn);
        }
      });

      // Keyboard accessibility (Enter / Space)
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const photoIdx = parseInt(itemEl.dataset.photoIndex, 10);
          if (!isNaN(photoIdx)) {
            openModalForTile(photoIdx, btn);
          }
        }
      });

      btn.appendChild(img);
      itemEl.appendChild(btn);
      sphere.appendChild(itemEl);
    });

    stage.appendChild(sphere);
    main.appendChild(stage);


    root.appendChild(main);
    wrapper.appendChild(root);
    container.appendChild(wrapper);

    // ── Dynamic Resize Observer for Dome Radius ──
    function updateDimensions() {
      const rect = wrapper.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const minDim = Math.min(w, h);
      const aspect = w / h;
      const basis = aspect >= 1.3 ? w : minDim;

      let radius = basis * CONFIG.fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, CONFIG.minRadius, CONFIG.maxRadius);
      const roundedRadius = Math.round(radius);

      root.style.setProperty('--radius', `${roundedRadius}px`);
      applyTransform(rotation.x, rotation.y);
    }

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(wrapper);

    // ── Transformation Controller ──
    const rotation = { x: 0, y: 0 };

    function applyTransform(xDeg, yDeg) {
      sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }

    applyTransform(rotation.x, rotation.y);

    // ── Continuous Auto-Spin & Unified Physics Engine ──
    const AUTO_SPIN_BASE = 0.11; // Ambient degrees per frame at 60fps
    const AUTO_SPIN_HOVER = 0.02; // Slow glide on mouse hover for easy clicking
    let currentAutoSpeed = AUTO_SPIN_BASE;
    let isHovered = false;
    let inertiaVx = 0;
    let inertiaVy = 0;
    let spinRAF = null;
    let lastFrameTime = performance.now();
    let isGalleryVisible = true;

    function isModalOpen() {
      const modal = document.getElementById('gallery-split-modal');
      return modal && modal.classList.contains('modal-active');
    }

    function updateRender(time) {
      const dt = Math.min(36, Math.max(1, time - lastFrameTime));
      const deltaFactor = dt / 16.67; // Normalized to standard 60fps
      lastFrameTime = time;

      if (!isPointerDown && !isModalOpen()) {
        const hasInertia = Math.abs(inertiaVx) > 0.005 || Math.abs(inertiaVy) > 0.005;

        if (hasInertia) {
          // Apply flick inertia with dampening
          const d = clamp(CONFIG.dragDampening, 0, 1);
          const frictionMul = Math.pow(0.94 + 0.055 * d, deltaFactor);
          inertiaVx *= frictionMul;
          inertiaVy *= frictionMul;

          rotation.x = clamp(
            rotation.x - (inertiaVy * deltaFactor) / 200,
            -CONFIG.maxVerticalRotationDeg,
            CONFIG.maxVerticalRotationDeg
          );
          rotation.y = wrapAngleSigned(rotation.y + (inertiaVx * deltaFactor) / 200);

          if (Math.abs(inertiaVx) <= 0.005 && Math.abs(inertiaVy) <= 0.005) {
            inertiaVx = 0;
            inertiaVy = 0;
          }
        } else {
          // Continuous Ambient Turntable Rotation (Auto-Spin)
          const targetSpeed = isHovered ? AUTO_SPIN_HOVER : AUTO_SPIN_BASE;
          currentAutoSpeed += (targetSpeed - currentAutoSpeed) * (0.06 * deltaFactor);

          rotation.y = wrapAngleSigned(rotation.y + currentAutoSpeed * deltaFactor);

          // Gentle vertical horizon stabilization towards 0°
          if (Math.abs(rotation.x) > 0.01) {
            rotation.x += (0 - rotation.x) * (0.015 * deltaFactor);
          }
        }

        applyTransform(rotation.x, rotation.y);
      }

      if (isGalleryVisible) {
        spinRAF = requestAnimationFrame(updateRender);
      }
    }

    function startSpinLoop() {
      if (spinRAF) cancelAnimationFrame(spinRAF);
      lastFrameTime = performance.now();
      spinRAF = requestAnimationFrame(updateRender);
    }

    function stopSpinLoop() {
      if (spinRAF) {
        cancelAnimationFrame(spinRAF);
        spinRAF = null;
      }
    }

    // Hover slowdown detection on gallery
    wrapper.addEventListener('pointerenter', () => { isHovered = true; });
    wrapper.addEventListener('pointerleave', () => { isHovered = false; });

    // Performance: Pause auto-spin loop when gallery is offscreen
    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver((entries) => {
        const isVisible = entries[0].isIntersecting;
        if (isVisible && !isGalleryVisible) {
          isGalleryVisible = true;
          startSpinLoop();
        } else if (!isVisible && isGalleryVisible) {
          isGalleryVisible = false;
          stopSpinLoop();
        }
      }, { threshold: 0.05 });
      visibilityObserver.observe(container);
    } else {
      startSpinLoop();
    }

    // ── Pointer Event Tracking (Seamless Mouse & Touch Drag + Robust Tile Click) ──
    let isPointerDown = false;
    let hasMoved = false;
    let startPos = { x: 0, y: 0 };
    let startRot = { x: 0, y: 0 };
    let lastPos = { x: 0, y: 0, t: 0 };
    let velocity = { vx: 0, vy: 0 };
    let activeTileTarget = null;

    function onGlobalPointerMove(e) {
      if (!isPointerDown) return;

      const dxTotal = e.clientX - startPos.x;
      const dyTotal = e.clientY - startPos.y;
      const dist = Math.hypot(dxTotal, dyTotal);

      // Distinguish drag from tap/click (requires at least 8px movement)
      if (!hasMoved && dist > 8) {
        hasMoved = true;
        main.classList.add('is-dragging');
      }

      if (hasMoved) {
        const nextX = clamp(
          startRot.x - dyTotal / CONFIG.dragSensitivity,
          -CONFIG.maxVerticalRotationDeg,
          CONFIG.maxVerticalRotationDeg
        );
        const nextY = wrapAngleSigned(startRot.y + dxTotal / CONFIG.dragSensitivity);

        rotation.x = nextX;
        rotation.y = nextY;
        applyTransform(nextX, nextY);

        const now = performance.now();
        const dt = Math.max(1, now - lastPos.t);
        velocity = {
          vx: (e.clientX - lastPos.x) / dt,
          vy: (e.clientY - lastPos.y) / dt
        };
        lastPos = { x: e.clientX, y: e.clientY, t: now };
      }
    }

    function onGlobalPointerUp(e) {
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);

      if (!isPointerDown) return;
      isPointerDown = false;
      main.classList.remove('is-dragging');

      if (hasMoved) {
        // Drag release with inertia
        const vx = clamp(velocity.vx, -1.2, 1.2);
        const vy = clamp(velocity.vy, -1.2, 1.2);
        if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
          inertiaVx = vx * 80;
          inertiaVy = vy * 80;
        }
      } else {
        // Tap/click on a photo tile
        const targetTile = activeTileTarget || (e.target && e.target.closest && e.target.closest('.item__image'));
        if (targetTile) {
          const itemEl = targetTile.closest('.item');
          if (itemEl) {
            const photoIdx = parseInt(itemEl.dataset.photoIndex, 10);
            if (!isNaN(photoIdx)) {
              openModalForTile(photoIdx, targetTile);
            }
          }
        }
      }

      activeTileTarget = null;
    }

    main.addEventListener('pointerdown', (e) => {
      // Don't drag on right clicks
      if (e.button && e.button !== 0) return;

      inertiaVx = 0;
      inertiaVy = 0;
      isPointerDown = true;
      hasMoved = false;

      startPos = { x: e.clientX, y: e.clientY };
      startRot = { ...rotation };
      lastPos = { x: e.clientX, y: e.clientY, t: performance.now() };
      velocity = { vx: 0, vy: 0 };

      // Identify the tile clicked directly under the cursor
      activeTileTarget = e.target.closest('.item__image') || null;

      // Track movement and release globally without pointer capture hijacking
      window.addEventListener('pointermove', onGlobalPointerMove, { passive: false });
      window.addEventListener('pointerup', onGlobalPointerUp);
      window.addEventListener('pointercancel', onGlobalPointerUp);
    });

    // Start continuous auto-spin
    startSpinLoop();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDomeGallery);
  } else {
    initDomeGallery();
  }
})();
