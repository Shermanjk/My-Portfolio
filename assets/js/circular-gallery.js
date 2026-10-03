/**
 * CircularGallery — Interactive 3D Curved Showcase (Refined)
 * Focused visual showcase of software development, system engineering,
 * hardware integration, testing, training, and client deployments.
 *
 * Refinements:
 *  - Dominant active center image (1.18x desktop / 1.07x mobile)
 *  - Smooth distance-based continuous interpolation (adjacent ~0.92x, farther ~0.86x)
 *  - Subtle 1px gold border & soft shadow (no neon glow)
 *  - Reduced bend/curvature for natural photo inspection
 *  - Custom per-image objectPosition to prevent improper cropping
 *  - Compact synchronized info with counter adjacent to active title
 *  - Shortened 1-2 line visible description; full text in lightbox & modal
 *  - 2-3 compact tags
 *  - Zero vertical bloat
 */

(function() {
  "use strict";

  // ── Work Items Dataset ──────────────────────────────────────
  const workItems = [
    {
      id: "cenro-training",
      image: "assets/img/photos/cenro-deployment.jpg",
      title: "CENRO System Walkthrough & Training",
      shortDescription: "Conducting a hands-on system walkthrough with CENRO personnel while validating the platform in a real operational environment.",
      fullDescription: "Guiding operational personnel through the CENRO Waste Tracker workflow, demonstrating the driver mobile application and administrative tools while validating how the system performs in an actual working environment.",
      category: "client-work",
      categoryLabel: "Client Work",
      tags: ["Client Training", "System Validation", "Field Deployment"],
      objectPosition: "center 28%",
      alt: "Conducting a hands-on system walkthrough with CENRO personnel while validating the platform in a real operational environment."
    },
    {
      id: "client-deployment",
      image: "assets/img/photos/field-deployment.jpg",
      title: "On-Site Client Deployment",
      shortDescription: "Deploying and validating the POS system in the client's store environment before daily operation.",
      fullDescription: "Deploying and validating the POS system in the client's actual store environment, testing cashier workflows, receipt printing, peripheral integration, and production configuration before daily operation.",
      category: "deployment",
      categoryLabel: "Deployment",
      tags: ["Client Deployment", "POS Testing", "Production Setup"],
      objectPosition: "center 24%",
      alt: "Deploying and validating the POS system in the client's store environment before daily operation."
    },
    {
      id: "hardware-diagnostics",
      image: "assets/img/photos/hardware-servicing.jpg",
      title: "Hardware Diagnostics & Maintenance",
      shortDescription: "Performing hands-on diagnostics and maintenance to identify hardware issues and restore reliable operation.",
      fullDescription: "Performing hands-on hardware diagnostics and maintenance to identify component issues, restore reliable operation, and understand the physical systems supporting software environments.",
      category: "hardware",
      categoryLabel: "Hardware",
      tags: ["Diagnostics", "Maintenance", "Hardware Support"],
      objectPosition: "center 42%",
      alt: "Performing hands-on diagnostics and maintenance to identify hardware issues and restore reliable operation."
    },
    {
      id: "system-engineering",
      image: "assets/img/photos/dev-battlestation.jpg",
      title: "Development & System Engineering",
      shortDescription: "Active software development, database design, debugging, and system integration toward a stable production-ready solution.",
      fullDescription: "Executing active full-stack software development, database schema refinement, API integration, and architectural testing across multiple terminal displays.",
      category: "development",
      categoryLabel: "Development",
      tags: ["Full-Stack Dev", "Database Design", "System Architecture"],
      objectPosition: "center center",
      alt: "Active software development, database design, debugging, and system integration toward a stable production-ready solution."
    },
    {
      id: "build-staging",
      image: "assets/img/photos/build-staging.jpg",
      title: "Build Staging & Hardware Testing",
      shortDescription: "Preparing and testing the POS system, printers, barcode equipment, and terminal configuration before deployment.",
      fullDescription: "Configuring and bench-testing client workstation hardware, peripheral devices, thermal ESC/POS receipt printers, and operating systems in a staging environment prior to client rollout.",
      category: "hardware",
      categoryLabel: "Hardware",
      tags: ["Staging", "Hardware Testing", "Peripheral Setup"],
      objectPosition: "center 32%",
      alt: "Preparing and testing the POS system, printers, barcode equipment, and terminal configuration before deployment."
    },
    {
      id: "focused-development",
      image: "assets/img/photos/late-night-coding.jpg",
      title: "Focused Development Session",
      shortDescription: "Continuing implementation, debugging, backend integration, and code refinement while preparing features for testing.",
      fullDescription: "Engaged in focused late-night software engineering, solving complex application logic, conducting code audits, and ensuring system stability under demanding project timelines.",
      category: "development",
      categoryLabel: "Development",
      tags: ["Backend Dev", "Code Auditing", "Optimization"],
      objectPosition: "center 40%",
      alt: "Continuing implementation, debugging, backend integration, and code refinement while preparing features for testing."
    }
  ];

  // ── CircularGallery Class ───────────────────────────────────
  class CircularGallery {
    constructor(options = {}) {
      this.stage = document.getElementById('circular-gallery-stage');
      if (!this.stage) return;

      this.track = document.getElementById('cg-track');
      this.titleEl = document.getElementById('cg-title');
      this.descEl = document.getElementById('cg-desc');
      this.tagsEl = document.getElementById('cg-tags');
      this.counterEl = document.getElementById('cg-counter');
      this.detailsEl = document.getElementById('cg-details');
      this.hintEl = document.getElementById('cg-hint');
      this.prevBtn = document.getElementById('cg-prev');
      this.nextBtn = document.getElementById('cg-next');
      this.filterBtns = document.querySelectorAll('.cg-filter-btn');
      this.modalGrid = document.getElementById('cg-modal-grid');

      // Gallery Configuration
      this.allData = workItems;
      this.filteredData = [...this.allData];
      this.currentCategory = 'all';

      // Subtle, gentle curve for easy photo inspection (reduced from 1.5)
      this.bend = options.bend ?? 0.9;
      this.scrollSpeed = options.scrollSpeed ?? 1.3;
      this.scrollEase = options.scrollEase ?? 0.085;
      this.snapStrength = 0.14;

      // Animation State
      this.targetX = 0;
      this.currentX = 0;
      this.activeNormalizedIndex = 0;
      this.activeSlotIndex = 0;
      this.isDragging = false;
      this.isWheeling = false;
      this.wheelTimer = null;
      this.dragStartX = 0;
      this.dragStartTargetX = 0;
      this.dragMovedDistance = 0;
      this.isPointerDown = false;
      this.hasInteracted = false;
      this.animId = null;
      this.isLoopRunning = false;

      // Slot Metrics
      this.slotWidth = 340;
      this.slotCount = 8;
      this.cardNodes = [];
      this.lightbox = null;

      // Reduced motion preference
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this.prefersReducedMotion) {
        this.bend = 0;
      }

      this.init();
    }

    init() {
      this.updateResponsiveMetrics();
      this.buildTrack();
      this.setupEventListeners();
      this.setupFilters();
      this.setupModal();
      this.initLightbox();
      this.updateDetails(0, true);
      this.wakeLoop();
    }

    updateResponsiveMetrics() {
      const w = window.innerWidth;
      if (w >= 1200) {
        // Desktop: 3-5 images visible, center dominant at 1.17x (1.15-1.18 range)
        this.slotWidth = 320;
        this.activeScale = 1.17;
        this.adjacentScale = 0.93;
        this.farScale = 0.88;
        this.bendFactor = this.prefersReducedMotion ? 0 : 0.65;
      } else if (w >= 992) {
        // Laptop: 3-4 images visible
        this.slotWidth = 290;
        this.activeScale = 1.15;
        this.adjacentScale = 0.93;
        this.farScale = 0.88;
        this.bendFactor = this.prefersReducedMotion ? 0 : 0.6;
      } else if (w >= 768) {
        // Tablet: 3 images visible
        this.slotWidth = 250;
        this.activeScale = 1.12;
        this.adjacentScale = 0.92;
        this.farScale = 0.86;
        this.bendFactor = this.prefersReducedMotion ? 0 : 0.5;
      } else if (w >= 480) {
        // Mobile: 1 centered image with neighboring edges visible, active scale 1.06 (1.05-1.08 range)
        this.slotWidth = 210;
        this.activeScale = 1.06;
        this.adjacentScale = 0.90;
        this.farScale = 0.84;
        this.bendFactor = this.prefersReducedMotion ? 0 : 0.4;
      } else {
        // Small Mobile (<480px)
        this.slotWidth = 185;
        this.activeScale = 1.06;
        this.adjacentScale = 0.89;
        this.farScale = 0.82;
        this.bendFactor = this.prefersReducedMotion ? 0 : 0.35;
      }
    }

    buildTrack() {
      if (!this.track) return;
      this.track.innerHTML = '';
      this.cardNodes = [];

      const n = this.filteredData.length;
      if (n === 0) return;

      const minSlotsNeeded = Math.max(n * 2, 8);
      this.slotCount = minSlotsNeeded;
      this.totalTrackWidth = this.slotCount * this.slotWidth;

      for (let i = 0; i < this.slotCount; i++) {
        const itemIndex = ((i % n) + n) % n;
        const item = this.filteredData[itemIndex];

        const card = document.createElement('div');
        card.className = 'cg-card';
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'slide');
        card.setAttribute('aria-label', `${item.title} (${itemIndex + 1} of ${n})`);
        card.setAttribute('data-slot-index', i);
        card.setAttribute('data-item-index', itemIndex);

        const cropPos = item.objectPosition || 'center center';

        card.innerHTML = `
          <div class="cg-card-inner">
            <span class="cg-card-badge">${item.categoryLabel || item.category}</span>
            <img src="${item.image}" alt="${item.alt}" class="cg-card-img" style="object-position: ${cropPos};" loading="lazy" />
            <div class="cg-card-overlay">
              <span class="cg-zoom-btn" title="View Full Size"><i class="bi bi-arrows-angle-expand"></i></span>
            </div>
          </div>
        `;

        // Card Click Handler
        card.addEventListener('click', (e) => this.onCardClick(e, i, itemIndex));

        this.track.appendChild(card);
        this.cardNodes.push({
          el: card,
          slotIndex: i,
          itemIndex: itemIndex
        });
      }

      this.render();
    }

    render() {
      if (!this.stage || this.cardNodes.length === 0) return;

      const viewportWidth = this.stage.clientWidth || window.innerWidth;
      const totalWidth = this.totalTrackWidth;
      const halfTotal = totalWidth / 2;
      const maxDistance = viewportWidth * 0.52;

      // Arc radius calculation for gentle curvature
      const R = Math.max(viewportWidth * 1.35, 950) / (this.bendFactor || 1);

      let minCenterDist = Infinity;
      let closestSlot = 0;
      let closestNormalized = 0;

      for (let i = 0; i < this.cardNodes.length; i++) {
        const node = this.cardNodes[i];
        const card = node.el;
        const baseSlotX = node.slotIndex * this.slotWidth;

        // Signed horizontal offset from viewport center
        let dx = baseSlotX - this.currentX;
        dx = ((dx + halfTotal) % totalWidth + totalWidth) % totalWidth - halfTotal;

        const distance = Math.abs(dx);
        const u = distance / (this.slotWidth || 300);

        // Smooth continuous scaling interpolation:
        // Center (u=0): activeScale (1.15-1.18x desktop)
        // Adjacent (u=1): adjacentScale (0.92-0.95x desktop)
        // Farther (u>=2): farScale (0.86-0.90x desktop)
        let scale;
        if (u <= 1) {
          const t = u * u * (3 - 2 * u);
          scale = this.activeScale - t * (this.activeScale - this.adjacentScale);
        } else {
          const t = Math.min(u - 1, 1);
          const tSmooth = t * t * (3 - 2 * t);
          scale = this.adjacentScale - tSmooth * (this.adjacentScale - this.farScale);
        }

        const normDist = Math.min(distance / maxDistance, 1.0);
        const opacity = Math.max(1.0 - normDist * 0.42, 0.58);

        // Gentle, subtle 3D curvature: easy to inspect, zero aggressive distortion
        let X = dx;
        let Z = 0;
        let rotY = 0;

        if (this.bendFactor > 0) {
          const theta = dx / R;
          X = R * Math.sin(theta);
          Z = -R * (1 - Math.cos(theta)) * 0.20 - distance * 0.02;
          rotY = -theta * (180 / Math.PI) * 0.20;
        }

        // Apply hardware-accelerated transforms
        card.style.transform = `translate3d(calc(${X}px - 50%), -50%, ${Z}px) rotateY(${rotY}deg) scale(${scale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = Math.round((1 - normDist) * 100);

        // Track nearest item to center
        if (distance < minCenterDist) {
          minCenterDist = distance;
          closestSlot = node.slotIndex;
          closestNormalized = node.itemIndex;
        }

        node.dx = dx;
      }

      // Update Active State
      this.activeSlotIndex = closestSlot;
      this.cardNodes.forEach(node => {
        const isActive = (node.slotIndex === closestSlot);
        node.el.classList.toggle('is-active', isActive);
        node.el.setAttribute('aria-current', isActive ? 'true' : 'false');
      });

      // Update text details only when normalized active index changes
      if (closestNormalized !== this.activeNormalizedIndex) {
        this.activeNormalizedIndex = closestNormalized;
        this.updateDetails(closestNormalized);
      }
    }

    animate() {
      // Smooth interpolation toward target
      this.currentX += (this.targetX - this.currentX) * this.scrollEase;

      // Apply snapping when user isn't actively dragging or wheeling
      if (!this.isDragging && !this.isWheeling && this.cardNodes.length > 0) {
        const closestNode = this.cardNodes.find(n => n.slotIndex === this.activeSlotIndex);
        if (closestNode && typeof closestNode.dx === 'number') {
          const snapOffset = closestNode.dx;
          if (Math.abs(snapOffset) > 0.4) {
            this.targetX += snapOffset * this.snapStrength;
          } else {
            this.targetX += snapOffset;
          }
        }
      }

      this.render();

      // Check if settled to put RAF loop to sleep
      const diff = Math.abs(this.targetX - this.currentX);
      if (!this.isDragging && !this.isWheeling && diff < 0.04) {
        this.currentX = this.targetX;
        this.render();
        this.isLoopRunning = false;
        return;
      }

      this.animId = requestAnimationFrame(() => this.animate());
    }

    wakeLoop() {
      if (!this.isLoopRunning) {
        this.isLoopRunning = true;
        this.animId = requestAnimationFrame(() => this.animate());
      }
    }

    updateDetails(index, immediate = false) {
      const item = this.filteredData[index];
      if (!item) return;

      const total = this.filteredData.length;
      const formattedNum = String(index + 1).padStart(2, '0');
      const formattedTotal = String(total).padStart(2, '0');

      if (this.counterEl) {
        this.counterEl.textContent = `${formattedNum} / ${formattedTotal}`;
      }

      const applyContent = () => {
        if (this.titleEl) this.titleEl.textContent = item.title;
        // Display 1-2 line concise narrative
        if (this.descEl) this.descEl.textContent = item.shortDescription || item.description;
        // Keep 2-3 compact tags
        if (this.tagsEl) {
          const visibleTags = item.tags.slice(0, 3);
          this.tagsEl.innerHTML = visibleTags
            .map(tag => `<span class="cg-tag-pill">${tag}</span>`)
            .join('');
        }
      };

      if (immediate || !this.detailsEl) {
        applyContent();
      } else {
        this.detailsEl.classList.add('cg-updating');
        setTimeout(() => {
          applyContent();
          this.detailsEl.classList.remove('cg-updating');
        }, 120);
      }
    }

    onCardClick(e, slotIndex, itemIndex) {
      if (this.dragMovedDistance > 8) return;

      this.dismissHint();

      // If clicked item is NOT the active centered item -> snap to center first
      if (slotIndex !== this.activeSlotIndex) {
        const clickedNode = this.cardNodes.find(n => n.slotIndex === slotIndex);
        if (clickedNode && typeof clickedNode.dx === 'number') {
          this.targetX += clickedNode.dx;
          this.wakeLoop();
        }
        return;
      }

      // If already active and centered -> open full-size lightbox
      this.openLightbox(itemIndex);
    }

    dismissHint() {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
        if (this.hintEl) {
          this.hintEl.classList.add('faded');
        }
      }
    }

    step(direction = 1) {
      this.dismissHint();
      this.targetX += direction * this.slotWidth;
      this.wakeLoop();
    }

    setupEventListeners() {
      // Prev / Next Buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.step(-1));
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.step(1));
      }

      // Pointer / Drag / Touch Events
      const stage = this.stage;

      stage.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        this.isPointerDown = true;
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartTargetX = this.targetX;
        this.dragMovedDistance = 0;
        stage.classList.add('is-grabbing');

        try {
          stage.setPointerCapture(e.pointerId);
        } catch (_) {}

        this.wakeLoop();
      });

      stage.addEventListener('pointermove', (e) => {
        if (!this.isPointerDown) return;

        const delta = e.clientX - this.dragStartX;
        this.dragMovedDistance += Math.abs(delta);

        this.targetX = this.dragStartTargetX - delta * 1.08;
        this.dismissHint();
        this.wakeLoop();
      });

      const endPointer = (e) => {
        if (!this.isPointerDown) return;
        this.isPointerDown = false;
        this.isDragging = false;
        stage.classList.remove('is-grabbing');

        try {
          if (stage.hasPointerCapture(e.pointerId)) {
            stage.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}

        this.wakeLoop();
      };

      stage.addEventListener('pointerup', endPointer);
      stage.addEventListener('pointercancel', endPointer);

      // Wheel & Trackpad
      stage.addEventListener('wheel', (e) => {
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);

        if (absX > absY || e.shiftKey) {
          e.preventDefault();
          this.targetX += (e.deltaX || e.deltaY) * this.scrollSpeed * 0.8;
          this.isWheeling = true;
          this.dismissHint();
          clearTimeout(this.wheelTimer);
          this.wheelTimer = setTimeout(() => {
            this.isWheeling = false;
            this.wakeLoop();
          }, 160);
          this.wakeLoop();
        } else if (absY > 30) {
          this.isWheeling = true;
          this.targetX += Math.sign(e.deltaY) * this.slotWidth * 0.5;
          this.dismissHint();
          clearTimeout(this.wheelTimer);
          this.wheelTimer = setTimeout(() => {
            this.isWheeling = false;
            this.wakeLoop();
          }, 180);
          this.wakeLoop();
        }
      }, { passive: false });

      // Keyboard Navigation on Stage Focus
      stage.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.step(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.step(1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(this.activeNormalizedIndex);
        }
      });

      // Window Resize Listener
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.updateResponsiveMetrics();
          this.totalTrackWidth = this.slotCount * this.slotWidth;
          this.wakeLoop();
        }, 150);
      });
    }

    setupFilters() {
      if (!this.filterBtns || this.filterBtns.length === 0) return;

      this.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const category = btn.getAttribute('data-category');
          if (category === this.currentCategory) return;

          this.filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          this.currentCategory = category;
          this.filter(category);
        });
      });
    }

    filter(category) {
      if (category === 'all') {
        this.filteredData = [...this.allData];
      } else {
        this.filteredData = this.allData.filter(item => item.category === category);
      }

      this.targetX = 0;
      this.currentX = 0;
      this.activeNormalizedIndex = 0;
      this.activeSlotIndex = 0;

      this.buildTrack();
      this.initLightbox();
      this.updateDetails(0, true);
      this.wakeLoop();
    }

    initLightbox() {
      if (typeof GLightbox === 'undefined') return;

      if (this.lightbox) {
        try {
          this.lightbox.destroy();
        } catch (_) {}
      }

      const elements = this.filteredData.map(item => ({
        href: item.image,
        type: 'image',
        title: item.title,
        description: `
          <div class="cg-lb-content">
            <p class="cg-lb-desc mb-2">${item.fullDescription || item.description || item.shortDescription}</p>
            <div class="cg-lb-tags">
              ${item.tags.map(t => `<span class="badge bg-secondary-subtle text-light-emphasis me-1 mb-1">${t}</span>`).join('')}
            </div>
          </div>
        `
      }));

      this.lightbox = GLightbox({
        elements: elements,
        touchNavigation: true,
        loop: true,
        zoomable: true
      });
    }

    openLightbox(index) {
      if (this.lightbox && typeof this.lightbox.openAt === 'function') {
        this.lightbox.openAt(index);
      }
    }

    setupModal() {
      if (!this.modalGrid) return;

      this.modalGrid.innerHTML = this.allData.map((item, idx) => {
        const cropPos = item.objectPosition || 'center center';
        return `
          <div class="cg-modal-item" data-category="${item.category}">
            <div class="cg-modal-card">
              <div class="cg-modal-media" data-idx="${idx}">
                <img src="${item.image}" alt="${item.alt}" style="object-position: ${cropPos};" loading="lazy" />
                <div class="cg-modal-overlay">
                  <span class="cg-zoom-btn"><i class="bi bi-arrows-angle-expand"></i></span>
                </div>
              </div>
              <div class="cg-modal-info">
                <span class="cg-modal-badge">${item.categoryLabel || item.category}</span>
                <h6 class="cg-modal-title">${item.title}</h6>
                <p class="cg-modal-desc">${item.fullDescription || item.description || item.shortDescription}</p>
                <div class="cg-modal-tags">
                  ${item.tags.map(t => `<span class="cg-tag-pill">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      this.modalGrid.querySelectorAll('.cg-modal-media').forEach(media => {
        media.addEventListener('click', () => {
          const idx = parseInt(media.getAttribute('data-idx'), 10);
          const modalEl = document.getElementById('workInActionModal');
          if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }
          setTimeout(() => {
            const allLightbox = GLightbox({
              elements: this.allData.map(item => ({
                href: item.image,
                type: 'image',
                title: item.title,
                description: `
                  <div class="cg-lb-content">
                    <p class="cg-lb-desc mb-2">${item.description}</p>
                    <div class="cg-lb-tags">
                      ${item.tags.map(t => `<span class="badge bg-secondary-subtle text-light-emphasis me-1 mb-1">${t}</span>`).join('')}
                    </div>
                  </div>
                `
              })),
              touchNavigation: true,
              loop: true,
              zoomable: true
            });
            allLightbox.openAt(idx);
          }, 300);
        });
      });
    }
  }

  // ── Auto-Initialize when DOM is ready ─────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CircularGallery());
  } else {
    new CircularGallery();
  }

})();
