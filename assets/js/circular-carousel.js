/**
 * CircularCarousel — React Bits Component Engine (Vanilla JS Port)
 * True 3D Cylindrical Ring with 8-Tile Curved Surfaces, Spring Physics & Kinematics.
 *
 * Implements:
 *  - 8-slice cylindrical tile generation (TILES = 8, OVERLAP = 2.5)
 *  - True 3D camera with perspective, tilt, yaw, pitch, and parallax
 *  - Spring damping settling (SPRING = 118, damping = 2 * sqrt(SPRING))
 *  - Continuous drift autoplay with pauseOnHover & momentum throw
 *  - Animated rolling reel digit counter (Digits reel)
 *  - Full keyboard, touch, mouse wheel & drag interaction
 */

(function() {
  "use strict";

  const WORK_ITEMS = [
    {
      src: "assets/img/photos/cenro-deployment.jpg",
      alt: "CENRO System Walkthrough & Training",
      title: "CENRO System Walkthrough & Training",
      subtitle: "Client Work",
      tags: ["Client Training", "System Validation", "Field Deployment"],
      description: "Guiding operational personnel through the CENRO Waste Tracker workflow, demonstrating the driver mobile application and administrative tools while validating platform performance in a real operational environment."
    },
    {
      src: "assets/img/photos/field-deployment.jpg",
      alt: "On-Site Client Deployment",
      title: "On-Site Client Deployment",
      subtitle: "Deployment",
      tags: ["Client Deployment", "POS Testing", "Production Setup"],
      description: "Deploying and validating the POS system in the client's store environment, testing cashier workflows, receipt printing, peripheral integration, and production configuration before daily operation."
    },
    {
      src: "assets/img/photos/hardware-servicing.jpg",
      alt: "Hardware Diagnostics & Maintenance",
      title: "Hardware Diagnostics & Maintenance",
      subtitle: "Hardware",
      tags: ["Diagnostics", "Maintenance", "Hardware Support"],
      description: "Performing hands-on hardware diagnostics and maintenance to identify component issues, restore reliable operation, and understand the physical systems supporting software environments."
    },
    {
      src: "assets/img/photos/dev-battlestation.jpg",
      alt: "Development & System Engineering",
      title: "Development & System Engineering",
      subtitle: "Development",
      tags: ["Full-Stack Dev", "Database Design", "System Architecture"],
      description: "Executing active full-stack software development, database schema refinement, API integration, and architectural testing across multiple terminal displays."
    },
    {
      src: "assets/img/photos/build-staging.jpg",
      alt: "Build Staging & Hardware Testing",
      title: "Build Staging & Hardware Testing",
      subtitle: "Hardware",
      tags: ["Staging", "Hardware Testing", "Peripheral Setup"],
      description: "Configuring and bench-testing client workstation hardware, peripheral devices, thermal ESC/POS receipt printers, and operating systems in a staging environment prior to client rollout."
    },
    {
      src: "assets/img/photos/late-night-coding.jpg",
      alt: "Focused Development Session",
      title: "Focused Development Session",
      subtitle: "Development",
      tags: ["Backend Dev", "Code Auditing", "Optimization"],
      description: "Engaged in focused late-night software engineering, solving complex application logic, conducting code audits, and ensuring system stability under demanding project timelines."
    }
  ];

  const PRESETS = {
    cylinder: {
      axis: 'y',
      tilt: -5,
      perspective: 2500,
      curve: 1,
      spread: 1,
      inward: false,
      billboard: false,
      backfaces: true,
      window: 0
    },
    orbit: {
      axis: 'y',
      tilt: -16,
      perspective: 1500,
      curve: 0,
      spread: 1.45,
      inward: false,
      billboard: true,
      backfaces: false,
      window: 0
    },
    wheel: {
      axis: 'x',
      tilt: 0,
      perspective: 1800,
      curve: 0,
      spread: 1,
      inward: false,
      billboard: false,
      backfaces: true,
      window: 1.7
    },
    panorama: {
      axis: 'y',
      tilt: 0,
      perspective: 0,
      curve: 1,
      spread: 1,
      inward: true,
      billboard: false,
      backfaces: false,
      window: 0
    }
  };

  const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
  const TILES = 8;
  const OVERLAP = 2.5;
  const DRAG_THRESHOLD = 5;
  const SPRING = 118;
  const SETTLE_SPEED = 9;
  const CAPTION_SPACE = 76;
  const TO_RAD = Math.PI / 180;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

  const rotateX = (p, degrees) => {
    const r = degrees * TO_RAD;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  };

  const rotateY = (p, degrees) => {
    const r = degrees * TO_RAD;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  };

  class CircularCarousel {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.getElementById(container) : container;
      if (!this.container) return;

      this.items = options.items && options.items.length ? options.items : WORK_ITEMS;
      this.count = this.items.length;
      this.preset = PRESETS[options.preset] ? options.preset : 'cylinder';
      this.layout = PRESETS[this.preset];
      this.axis = this.layout.axis;

      // Responsive card metrics
      const screenW = window.innerWidth;
      const defaultCardW = screenW < 480 ? 190 : (screenW < 992 ? 230 : 275);
      this.cardWidth = options.cardWidth ?? defaultCardW;
      this.aspectRatio = options.aspectRatio ?? 1.36;
      this.gap = options.gap ?? 24;
      this.curve = options.curve ?? this.layout.curve;
      this.tilt = options.tilt ?? this.layout.tilt;
      this.perspective = options.perspective ?? this.layout.perspective;
      this.autoplay = options.autoplay ?? 'drift';
      this.speed = options.speed ?? 13;
      this.interval = Math.max(0.5, options.interval ?? 3);
      this.direction = options.direction ?? 'left';
      this.draggable = options.draggable ?? true;
      this.momentum = clamp(options.momentum ?? 0.6, 0, 1);
      this.snap = options.snap ?? true;
      this.pauseOnHover = options.pauseOnHover ?? true;
      this.focusOnClick = options.focusOnClick ?? true;
      this.parallax = clamp(options.parallax ?? 0.28, 0, 1);
      this.stretch = clamp(options.stretch ?? 0.45, 0, 1);
      this.depthFade = clamp(options.depthFade ?? 0.6, 0, 1);
      this.fadeColor = options.fadeColor ?? '#0a0a0c';
      this.innerShade = clamp(options.innerShade ?? 0.65, 0, 1);
      this.cornerRadius = options.cornerRadius ?? 14;
      this.captions = options.captions ?? true;
      this.intro = options.intro ?? 'rise';

      this.reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
      if (this.reduced) {
        this.intro = 'none';
        this.autoplay = 'off';
        this.parallax = 0;
        this.stretch = 0;
      }

      this.active = 0;
      this.ready = false;
      this.dragging = false;

      // Internal State (Matching React Bits stateRef)
      this.state = {
        angle: 0,
        velocity: 0,
        target: null,
        dir: (this.direction === 'right' ? 1 : -1) * (this.layout.inward ? -1 : 1),
        press: null,
        drag: false,
        hover: false,
        pointer: { inside: false, x: 0, y: 0 },
        yaw: 0,
        pitch: 0,
        intro: null,
        introDone: false,
        holdUntil: 0,
        stepAt: 0,
        suppressClick: false,
        wheelTimer: 0,
        fit: 1,
        shift: 0,
        drop: 0,
        last: 0
      };

      this.cardRefs = [];
      this.raf = 0;
      this.visible = true;

      this.computeMetrics();
      this.buildDOM();
      this.bindEvents();
      this.loadImages();
      this.setupModal();
    }

    computeMetrics() {
      const cardW = Math.max(40, this.cardWidth);
      const cardH = cardW / clamp(this.aspectRatio, 0.2, 5);
      const along = this.axis === 'x' ? cardH : cardW;
      const step = 360 / this.count;
      const curveValue = this.layout.billboard ? 0 : clamp(this.curve, 0, 1);

      const n = Math.max(this.count, 3);
      const pitch = (along + this.gap) * this.layout.spread;
      const chord = pitch / (2 * Math.sin(Math.PI / n));
      const arc = (n * pitch) / (2 * Math.PI);
      const radius = Math.max(chord + (arc - chord) * curveValue, along * 0.6);

      this.cardW = cardW;
      this.cardH = cardH;
      this.along = along;
      this.step = step;
      this.curveValue = curveValue;
      this.radius = radius;
      this.perspVal = this.layout.inward ? radius : this.perspective;

      // Generate 8-slice cylindrical tiles
      const total = curveValue > 0.001 ? TILES : 1;
      const length = along / total;
      const bend = curveValue > 0.001 ? radius / curveValue : 0;

      this.tiles = Array.from({ length: total }, (_, index) => {
        const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
        const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0);
        const center = (start + end) / 2 - along / 2;
        const alpha = bend ? center / bend : 0;
        const shift = bend ? bend * Math.sin(alpha) : center;
        const sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
        const depth = this.layout.inward ? sink : -sink;
        const turn = ((this.layout.inward ? -alpha : alpha) * 180) / Math.PI;
        const move =
          this.axis === 'x'
            ? `translate3d(0px, ${shift}px, ${depth}px) rotateX(${-turn}deg)`
            : `translate3d(${shift}px, 0px, ${depth}px) rotateY(${turn}deg)`;
        return { index, total, start, end, size: end - start, move };
      });
    }

    renderTile(item, tile, back) {
      const strip = back ? tile.total - 1 - tile.index : tile.index;
      const first = strip === 0;
      const last = strip === tile.total - 1;
      const r = 'var(--cc-radius)';
      const frameRadius =
        this.axis === 'x'
          ? `${first ? r : 0} ${first ? r : 0} ${last ? r : 0} ${last ? r : 0}`
          : `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`;
      const offset = back ? this.along - tile.end : tile.start;
      const size = tile.size;
      const box =
        this.axis === 'x'
          ? `left: ${-this.cardW / 2}px; top: ${-size / 2}px; width: ${this.cardW}px; height: ${size}px;`
          : `left: ${-size / 2}px; top: ${-this.cardH / 2}px; width: ${size}px; height: ${this.cardH}px;`;
      const photoStyle =
        this.axis === 'x'
          ? `left: 0; top: ${-offset}px; width: ${this.cardW}px; height: ${this.cardH}px;`
          : `left: ${-offset}px; top: 0; width: ${this.cardW}px; height: ${this.cardH}px;`;
      const flip = this.axis === 'x' ? ' rotateX(180deg)' : ' rotateY(180deg)';

      return `
        <div class="circular-carousel__tile" style="${box} transform: ${tile.move + (back ? flip : '')};" aria-hidden="true">
          <div class="circular-carousel__frame" style="height: ${this.axis === 'x' ? size : this.cardH}px; border-radius: ${frameRadius};">
            <img class="circular-carousel__photo" src="${item.src}" alt="" draggable="false" decoding="async" style="${photoStyle}" />
            ${back ? '<div class="circular-carousel__inner"></div>' : ''}
            <div class="circular-carousel__shade"></div>
          </div>
        </div>
      `;
    }

    buildDOM() {
      this.container.innerHTML = `
        <div class="circular-carousel"
          style="--cc-fade: ${this.fadeColor}; --cc-radius: ${Math.max(0, this.cornerRadius)}px; --cc-inner: ${(1 - clamp(this.innerShade, 0, 1)).toFixed(3)};"
          role="region" aria-roledescription="carousel" aria-label="Work in Action 3D Gallery" tabindex="0"
          data-axis="${this.axis}" data-shape="${this.preset}" ${this.draggable ? 'data-draggable' : ''}>
          <div class="circular-carousel__view">
            <div class="circular-carousel__stage">
              <div class="circular-carousel__camera">
                <div class="circular-carousel__ring"></div>
              </div>
            </div>
          </div>
          ${this.captions ? `
            <div class="circular-carousel__caption" aria-hidden="true">
              <span class="circular-carousel__title">
                <span class="cc-title-text">${this.items[0].title}</span>
                <span class="circular-carousel__subtitle">${this.items[0].subtitle || ''}</span>
              </span>
              <span class="circular-carousel__count">
                <span class="circular-carousel__digits">
                  <span class="circular-carousel__digit">
                    <span class="circular-carousel__reel" style="transform: translateY(0%);">
                      ${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}
                    </span>
                  </span>
                  <span class="circular-carousel__digit">
                    <span class="circular-carousel__reel" style="transform: translateY(-10%);">
                      ${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}
                    </span>
                  </span>
                </span>
                <span class="circular-carousel__slash">/</span>
                <span>${String(this.count).padStart(2, '0')}</span>
              </span>
            </div>
          ` : ''}
          <div class="circular-carousel__live" aria-live="polite" aria-atomic="true"></div>
        </div>
      `;

      this.root = this.container.querySelector('.circular-carousel');
      this.stage = this.container.querySelector('.circular-carousel__stage');
      this.camera = this.container.querySelector('.circular-carousel__camera');
      this.ring = this.container.querySelector('.circular-carousel__ring');
      this.captionTitle = this.container.querySelector('.cc-title-text');
      this.captionSubtitle = this.container.querySelector('.circular-carousel__subtitle');
      this.reels = this.container.querySelectorAll('.circular-carousel__reel');
      this.liveEl = this.container.querySelector('.circular-carousel__live');

      // Populate Cards
      this.cardRefs = [];
      this.items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `circular-carousel__card ${index === 0 ? 'is-active' : ''}`;
        card.setAttribute('data-cc-index', index);
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'slide');
        card.setAttribute('aria-label', `${item.title}, ${index + 1} of ${this.count}`);

        let cardHtml = this.tiles.map(tile => this.renderTile(item, tile, false)).join('');
        if (this.layout.backfaces) {
          cardHtml += this.tiles.map(tile => this.renderTile(item, tile, true)).join('');
        }
        card.innerHTML = cardHtml;

        this.ring.appendChild(card);
        this.cardRefs.push(card);
      });
    }

    loadImages() {
      const sources = this.items.map(i => i.src);
      const load = src => new Promise(res => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => (img.decode ? img.decode().then(res, res) : res());
        img.onerror = res;
        img.src = src;
      });

      Promise.race([
        Promise.all(sources.map(load)),
        new Promise(res => setTimeout(res, 2200))
      ]).then(() => {
        this.ready = true;
        this.root.setAttribute('data-ready', '');
        this.state.introDone = false;
        this.state.intro = null;
        this.wake();
      });
    }

    measure() {
      const rect = this.root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const room = this.captions ? CAPTION_SPACE : 0;
      const width = rect.width * 0.94;
      const height = (rect.height - room) * 0.92;
      const P = this.perspVal;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      if (this.layout.inward) {
        minX = -width / 2;
        maxX = width / 2;
        minY = -this.cardH / 2;
        maxY = this.cardH / 2;
      } else {
        const corners = [
          [-this.cardW / 2, -this.cardH / 2],
          [this.cardW / 2, -this.cardH / 2],
          [-this.cardW / 2, this.cardH / 2],
          [this.cardW / 2, this.cardH / 2]
        ];
        const limit = this.layout.window ? this.layout.window * this.step : 180;
        for (let a = -limit; a <= limit; a += limit / 24) {
          for (const [cx, cy] of corners) {
            let p;
            if (this.axis === 'x') {
              p = rotateX([cx, cy, this.radius], -a);
              p = [p[0], p[1], p[2] - this.radius];
              p = rotateY(p, this.tilt);
            } else if (this.layout.billboard) {
              const c = rotateY([0, 0, this.radius], a);
              p = [c[0] + cx, cy, c[2] - this.radius];
              p = rotateX(p, this.tilt);
            } else {
              p = rotateY([cx, cy, this.radius], a);
              p = [p[0], p[1], p[2] - this.radius];
              p = rotateX(p, this.tilt);
            }
            if (p[2] >= P * 0.95) continue;
            const k = P / (P - p[2]);
            minX = Math.min(minX, p[0] * k);
            maxX = Math.max(maxX, p[0] * k);
            minY = Math.min(minY, p[1] * k);
            maxY = Math.max(maxY, p[1] * k);
          }
        }
      }

      const spanX = Math.max(maxX - minX, 1);
      const spanY = Math.max(maxY - minY, 1);
      const fit = Math.min(1, width / spanX, height / spanY);

      this.state.fit = fit;
      this.state.shift = -((minY + maxY) / 2) * fit - room / 2;
      this.state.drop = this.axis === 'x' ? (rect.width / fit) * 0.55 + this.cardW : (rect.height / fit) * 0.55 + this.cardH;

      this.stage.style.perspective = `${P}px`;
      this.stage.style.transform = `translate3d(0, ${this.state.shift}px, 0) scale(${fit})`;
    }

    introCard(elapsed, landing) {
      if (!this.state.intro) return { radius: 1, lift: 0 };
      const type = this.state.intro.type;
      const reach = Math.abs(wrap(landing + this.state.angle));

      if (type === 'assemble') {
        const delay = (reach / 180) * 420;
        const p = easeOut(clamp((elapsed - delay) / 1080, 0, 1));
        return { radius: 1 + 0.6 * (1 - p), lift: 0 };
      }
      if (type === 'rise') {
        const delay = (reach / 180) * 480;
        const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1));
        return { radius: 1, lift: (1 - p) * this.state.drop };
      }
      if (type === 'spin') {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
        return { radius: 1 + 0.28 * (1 - p), lift: 0 };
      }
      return { radius: 1, lift: 0 };
    }

    advance(dt, now) {
      const state = this.state;

      if (!state.introDone && this.ready) {
        if (!state.intro) {
          if (this.intro === 'none') state.introDone = true;
          else state.intro = { type: this.intro, start: now };
        }
        if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) {
          state.intro = null;
          state.introDone = true;
        }
      }

      const paused = (this.pauseOnHover && state.hover) || state.drag || now < state.holdUntil;
      const cruise = this.autoplay === 'drift' && !paused && !state.intro ? this.speed * state.dir : 0;
      let busy = Boolean(state.intro) || state.drag;

      if (state.drag || state.intro) {
        state.velocity = state.drag ? state.velocity : 0;
      } else if (state.target !== null) {
        let remaining = dt;
        const damping = 2 * Math.sqrt(SPRING);
        while (remaining > 0) {
          const h = Math.min(remaining, 1 / 240);
          const accel = SPRING * (state.target - state.angle) - damping * state.velocity;
          state.velocity += accel * h;
          state.angle += state.velocity * h;
          remaining -= h;
        }
        if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) {
          state.angle = state.target;
          state.velocity = 0;
          state.target = null;
        }
        busy = true;
      } else {
        const tau = 0.18 + this.momentum * 1.5;
        state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
        state.angle += state.velocity * dt;
        if (cruise === 0 && this.snap && Math.abs(state.velocity) < SETTLE_SPEED) {
          state.target = Math.round(state.angle / this.step) * this.step;
        }
        busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null;
      }

      if (this.autoplay === 'step' && !paused && !state.intro && state.introDone) {
        if (!state.stepAt) state.stepAt = now + this.interval * 1000;
        if (now >= state.stepAt) {
          const nearestAngle = Math.round(state.angle / this.step) * this.step;
          state.target = (state.target ?? nearestAngle) + this.step * state.dir;
          state.stepAt = now + this.interval * 1000;
        }
        busy = true;
      } else {
        state.stepAt = 0;
      }

      if (now < state.holdUntil) busy = true;

      const ease = 1 - Math.exp(-dt / 0.35);
      const aimYaw = state.pointer.inside ? state.pointer.x * this.parallax * 9 : 0;
      const aimPitch = state.pointer.inside ? -state.pointer.y * this.parallax * 6 : 0;
      state.yaw += (aimYaw - state.yaw) * ease;
      state.pitch += (aimPitch - state.pitch) * ease;
      if (Math.abs(aimYaw - state.yaw) > 0.01 || Math.abs(aimPitch - state.pitch) > 0.01) busy = true;

      return busy;
    }

    render(now) {
      const state = this.state;
      const elapsed = state.intro ? now - state.intro.start : 0;
      const swell = 1 + this.stretch * 0.12 * Math.min(1, Math.abs(state.velocity) / 420);
      let spinOffset = 0;

      if (state.intro?.type === 'spin') {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
        spinOffset = -300 * state.dir * (1 - p);
      } else if (state.intro?.type === 'assemble') {
        const p = easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1));
        spinOffset = -32 * state.dir * (1 - p);
      }

      const angle = state.angle + spinOffset;
      const R = this.radius * swell;

      if (this.axis === 'x') {
        this.camera.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${this.tilt + state.yaw}deg) rotateX(${state.pitch}deg)`;
        this.ring.style.transform = `rotateX(${-angle}deg)`;
      } else if (this.layout.inward) {
        this.camera.style.transform = `translate3d(0, 0, ${this.perspective - 1}px) rotateX(${this.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`;
        this.ring.style.transform = `rotateY(${angle}deg)`;
      } else {
        this.camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${this.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`;
        this.ring.style.transform = `rotateY(${angle}deg)`;
      }

      for (let index = 0; index < this.count; index++) {
        const card = this.cardRefs[index];
        if (!card) continue;
        const base = index * this.step;
        const mod = this.introCard(elapsed, base);
        const r = R * mod.radius;
        let transform;

        if (this.axis === 'x') {
          transform = `rotateX(${-base}deg) translateZ(${r}px)`;
        } else if (this.layout.inward) {
          transform = `rotateY(${base}deg) translateZ(${-r}px)`;
        } else {
          transform = `rotateY(${base}deg) translateZ(${r}px)`;
          if (this.layout.billboard) transform += ` rotateY(${-(base + angle)}deg)`;
        }
        if (mod.lift) transform += this.axis === 'x' ? ` translateX(${mod.lift}px)` : ` translateY(${mod.lift}px)`;
        card.style.transform = transform;

        const world = wrap(base + angle);
        const facing = Math.cos(world * TO_RAD);
        if (this.layout.inward) card.style.visibility = Math.abs(world) > 86 ? 'hidden' : '';
        const fade = this.depthFade * Math.pow((1 - facing) / 2, 1.25);
        card.style.setProperty('--cc-depth', fade.toFixed(3));
      }

      const activeIndex = ((Math.round(-state.angle / this.step) % this.count) + this.count) % this.count || 0;
      if (activeIndex !== this.active) {
        this.active = activeIndex;
        this.updateActiveItem(activeIndex);
      }
    }

    updateActiveItem(index) {
      const item = this.items[index];
      if (!item) return;

      this.cardRefs.forEach((card, idx) => {
        card.classList.toggle('is-active', idx === index);
      });

      if (this.captionTitle) {
        this.captionTitle.textContent = item.title;
      }
      if (this.captionSubtitle) {
        this.captionSubtitle.textContent = item.subtitle || '';
      }

      // Animated Rolling Reel digits
      if (this.reels && this.reels.length === 2) {
        const digitsStr = String(index + 1).padStart(2, '0');
        this.reels[0].style.transform = `translateY(${-Number(digitsStr[0]) * 10}%)`;
        this.reels[1].style.transform = `translateY(${-Number(digitsStr[1]) * 10}%)`;
      }

      if (this.liveEl) {
        this.liveEl.textContent = `${item.title}, ${index + 1} of ${this.count}`;
      }
    }

    focusIndex(index) {
      const state = this.state;
      let target = -index * this.step;
      target += 360 * Math.round((state.angle - target) / 360);
      state.target = target;
      state.holdUntil = performance.now() + 2800;
      this.wake();
    }

    stepBy(delta) {
      const state = this.state;
      const base = state.target ?? Math.round(state.angle / this.step) * this.step;
      state.target = base - delta * this.step * (this.layout.inward ? -1 : 1);
      state.holdUntil = performance.now() + 2800;
      this.wake();
    }

    frame(now) {
      this.raf = 0;
      const dt = this.state.last ? Math.min((now - this.state.last) / 1000, 0.05) : 1 / 60;
      this.state.last = now;
      const busy = this.advance(dt, now);
      this.render(now);
      if (busy && this.visible && !document.hidden) {
        this.raf = requestAnimationFrame(t => this.frame(t));
      } else {
        this.state.last = 0;
      }
    }

    wake() {
      if (!this.raf && this.visible && !document.hidden) {
        this.raf = requestAnimationFrame(t => this.frame(t));
      }
    }

    updatePointer(e) {
      const rect = this.root.getBoundingClientRect();
      const pointer = this.state.pointer;
      pointer.x = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointer.y = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    }

    bindEvents() {
      const root = this.root;

      // Pointer interactions
      root.addEventListener('pointerdown', e => {
        this.state.suppressClick = false;
        if (!this.draggable || e.button !== 0) return;
        this.state.press = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          angle: this.state.angle,
          moved: false,
          origin: 0,
          samples: [{ time: performance.now(), angle: this.state.angle }]
        };
      });

      root.addEventListener('pointermove', e => {
        const state = this.state;
        if (e.pointerType === 'mouse') {
          state.pointer.inside = true;
          this.updatePointer(e);
        }
        const press = state.press;
        if (!press || press.id !== e.pointerId) {
          this.wake();
          return;
        }

        const delta = this.axis === 'x' ? e.clientY - press.y : e.clientX - press.x;
        const cross = this.axis === 'x' ? e.clientX - press.x : e.clientY - press.y;

        if (!press.moved) {
          if (Math.abs(delta) < DRAG_THRESHOLD) return;
          if (Math.abs(cross) > Math.abs(delta) * 1.2 && e.pointerType !== 'mouse') {
            state.press = null;
            return;
          }
          press.moved = true;
          press.origin = delta;
          state.drag = true;
          state.target = null;
          state.velocity = 0;
          this.dragging = true;
          root.setAttribute('data-dragging', '');
          try {
            root.setPointerCapture(e.pointerId);
          } catch {}
        }

        const perPixel = 180 / (Math.PI * this.radius * state.fit);
        state.angle = press.angle + (delta - press.origin) * perPixel * (this.layout.inward ? -1 : 1);
        const now = performance.now();
        press.samples.push({ time: now, angle: state.angle });
        while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
        this.wake();
      });

      const release = e => {
        const state = this.state;
        const press = state.press;
        if (!press || press.id !== e.pointerId) return;
        state.press = null;
        if (!press.moved) return;

        state.drag = false;
        this.dragging = false;
        root.removeAttribute('data-dragging');
        state.suppressClick = true;

        const first = press.samples[0];
        const last = press.samples[press.samples.length - 1];
        const span = (last.time - first.time) / 1000;
        const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
        state.velocity = velocity;
        if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity);

        const coasting = this.autoplay === 'drift' && !(this.pauseOnHover && state.hover && e.pointerType === 'mouse');
        if (this.snap && !coasting) {
          const tau = 0.18 + this.momentum * 1.5;
          state.target = Math.round((state.angle + velocity * tau * 0.55) / this.step) * this.step;
        }
        this.wake();
      };

      root.addEventListener('pointerup', release);
      root.addEventListener('pointercancel', release);

      root.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        this.state.hover = true;
        this.wake();
      });

      root.addEventListener('pointerleave', e => {
        if (e.pointerType === 'mouse') {
          this.state.hover = false;
          this.state.pointer.inside = false;
        }
        this.wake();
      });

      // Card click focusing
      root.addEventListener('click', e => {
        if (this.state.suppressClick) {
          this.state.suppressClick = false;
          return;
        }
        const card = e.target.closest('[data-cc-index]');
        if (!card) return;
        const index = Number(card.getAttribute('data-cc-index'));
        if (this.focusOnClick) this.focusIndex(index);
      });

      // Keyboard navigation
      root.addEventListener('keydown', e => {
        const forward = this.axis === 'x' ? 'ArrowDown' : 'ArrowRight';
        const backward = this.axis === 'x' ? 'ArrowUp' : 'ArrowLeft';
        if (e.key === forward) this.stepBy(1);
        else if (e.key === backward) this.stepBy(-1);
        else if (e.key === 'Home') this.focusIndex(0);
        else if (e.key === 'End') this.focusIndex(this.count - 1);
        else return;
        e.preventDefault();
      });

      // Mouse wheel / trackpad
      root.addEventListener('wheel', e => {
        if (!this.draggable) return;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (!delta) return;
        e.preventDefault();

        const perPixel = 180 / (Math.PI * this.radius * this.state.fit);
        this.state.target = null;
        this.state.angle -= delta * perPixel * (this.layout.inward ? -1 : 1);
        this.state.velocity = -delta * perPixel * (this.layout.inward ? -1 : 1) * 30;
        this.state.holdUntil = performance.now() + 1600;

        clearTimeout(this.state.wheelTimer);
        this.state.wheelTimer = setTimeout(() => {
          if (this.snap) {
            const nearestAngle = Math.round(this.state.angle / this.step) * this.step;
            this.state.target = nearestAngle;
          }
          this.wake();
        }, 140);
        this.wake();
      }, { passive: false });

      // Resize Observer
      const ro = new ResizeObserver(() => {
        this.computeMetrics();
        this.measure();
        this.wake();
      });
      ro.observe(this.root);

      // Intersection Observer (sleep when out of view)
      const io = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.wake();
        else {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
          this.state.last = 0;
        }
      });
      io.observe(this.root);

      // Visibility Change (sleep on background tab)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
          this.state.last = 0;
        } else {
          this.wake();
        }
      });

      this.measure();
      this.render(performance.now());
      this.wake();
    }

    setupModal() {
      const modalGrid = document.getElementById('cg-modal-grid');
      if (!modalGrid) return;

      modalGrid.innerHTML = this.items.map((item, idx) => `
        <div class="cg-modal-item">
          <div class="cg-modal-card">
            <div class="cg-modal-media" data-idx="${idx}">
              <img src="${item.src}" alt="${item.alt}" loading="lazy" />
              <div class="cg-modal-overlay">
                <span class="cg-zoom-btn"><i class="bi bi-arrows-angle-expand"></i></span>
              </div>
            </div>
            <div class="cg-modal-info">
              <span class="cg-modal-badge">${item.subtitle || 'Engineering'}</span>
              <h6 class="cg-modal-title">${item.title}</h6>
              <p class="cg-modal-desc">${item.description}</p>
              <div class="cg-modal-tags">
                ${(item.tags || []).map(t => `<span class="cg-tag-pill">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `).join('');

      modalGrid.querySelectorAll('.cg-modal-media').forEach(media => {
        media.addEventListener('click', () => {
          const idx = parseInt(media.getAttribute('data-idx'), 10);
          const modalEl = document.getElementById('workInActionModal');
          if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }

          setTimeout(() => {
            if (typeof GLightbox !== 'undefined') {
              const allLightbox = GLightbox({
                elements: this.items.map(item => ({
                  href: item.src,
                  type: 'image',
                  title: item.title,
                  description: `
                    <div class="cg-lb-content">
                      <p class="cg-lb-desc mb-2">${item.description}</p>
                      <div class="cg-lb-tags">
                        ${(item.tags || []).map(t => `<span class="badge bg-secondary-subtle text-light-emphasis me-1 mb-1">${t}</span>`).join('')}
                      </div>
                    </div>
                  `
                })),
                touchNavigation: true,
                loop: true,
                zoomable: true
              });
              allLightbox.openAt(idx);
            }
          }, 300);
        });
      });
    }
  }

  // Auto-mount when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new CircularCarousel('circular-carousel-root');
    });
  } else {
    new CircularCarousel('circular-carousel-root');
  }
})();
