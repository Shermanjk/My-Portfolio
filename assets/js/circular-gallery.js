/**
 * CircularGallery — Interactive 3D Curved Showcase
 * Inspired by React Bits CircularGallery architecture.
 * Features:
 *  - Real-time 3D cylindrical projection (bend & depth arc)
 *  - Distance-based continuous center item enlargement
 *  - Pointer drag, mouse wheel, trackpad horizontal swipe & mobile touch
 *  - Spring snapping & momentum damping
 *  - Category filtering with safe state reset
 *  - Single synchronized details view with animated transitions
 *  - Integrated full-screen GLightbox for active centered item
 *  - "View All Photos" thumbnail grid modal
 *  - Scalable data model supporting arbitrary number of items
 */

(function() {
  "use strict";

  // ── Work Items Dataset ──────────────────────────────────────
  const workItems = [
    {
      id: "cenro-training",
      image: "assets/img/photos/cenro-deployment.jpg",
      title: "CENRO System Walkthrough & Training",
      description: "Guiding operational personnel through the CENRO Waste Tracker workflow, demonstrating the driver mobile application and administrative tools while validating how the system performs in an actual working environment.",
      category: "client-work",
      categoryLabel: "Client Work",
      tags: ["Client Training", "System Validation", "Field Deployment"],
      alt: "Guiding operational personnel through CENRO Waste Tracker workflow and driver mobile app validation"
    },
    {
      id: "client-deployment",
      image: "assets/img/photos/field-deployment.jpg",
      title: "On-Site Client Deployment",
      description: "Deploying and validating the POS system in the client's actual store environment, testing cashier workflows, receipt printing, peripheral integration, and production configuration before daily operation.",
      category: "deployment",
      categoryLabel: "Deployment",
      tags: ["Client Deployment", "POS Testing", "Production Setup"],
      alt: "Deploying and validating the POS system in the client's actual store environment with receipt printing and peripheral integration"
    },
    {
      id: "hardware-diagnostics",
      image: "assets/img/photos/hardware-servicing.jpg",
      title: "Hardware Diagnostics & Maintenance",
      description: "Performing hands-on hardware diagnostics and maintenance to identify component issues, restore reliable operation, and understand the physical systems supporting software environments.",
      category: "hardware",
      categoryLabel: "Hardware",
      tags: ["Diagnostics", "Maintenance", "Hardware Support"],
      alt: "Performing hands-on hardware diagnostics and maintenance to identify component issues and restore reliable operation"
    },
    {
      id: "system-engineering",
      image: "assets/img/photos/dev-battlestation.jpg",
      title: "Development & System Engineering",
      description: "Working through active software development, database design, debugging, and system integration as projects move from initial implementation toward a stable, production-ready solution.",
      category: "development",
      categoryLabel: "Development",
      tags: ["Full-Stack Development", "Database Design", "System Integration"],
      alt: "Working through active software development, database design, debugging, and system integration"
    },
    {
      id: "build-staging",
      image: "assets/img/photos/build-staging.jpg",
      title: "Build Staging & Hardware Testing",
      description: "Preparing and testing a POS deployment before installation, including production builds, terminal configuration, receipt printing, barcode equipment, and hardware integration.",
      category: "deployment",
      categoryLabel: "Deployment",
      tags: ["POS Integration", "Deployment Testing", "Production Preparation"],
      alt: "Preparing and testing a POS deployment before installation including production builds and barcode hardware integration"
    },
    {
      id: "focused-development",
      image: "assets/img/photos/late-night-coding.jpg",
      title: "Focused Development Session",
      description: "Continuing application development through implementation, debugging, backend integration, database work, and code refinement while preparing features for testing and deployment.",
      category: "development",
      categoryLabel: "Development",
      tags: ["Backend Development", "Debugging", "Feature Implementation"],
      alt: "Focused development session implementing and debugging backend features using Antigravity"
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

      // Gallery Configuration (matching React Bits starting defaults)
      this.allData = workItems;
      this.filteredData = [...this.allData];
      this.currentCategory = 'all';

      this.bend = options.bend ?? 1.5;
      this.scrollSpeed = options.scrollSpeed ?? 1.3;
      this.scrollEase = options.scrollEase ?? 0.08;
      this.snapStrength = 0.12;

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

      // Slot Configuration
      this.slotWidth = 360;
      this.slotCount = 8;
      this.cardNodes = [];
      this.lightbox = null;

      // Accessibility & reduced motion
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
        this.slotWidth = 380;
        this.activeScale = 1.16;
        this.minScale = 0.86;
        this.bendFactor = this.prefersReducedMotion ? 0 : 1.5;
      } else if (w >= 992) {
        this.slotWidth = 330;
        this.activeScale = 1.14;
        this.minScale = 0.88;
        this.bendFactor = this.prefersReducedMotion ? 0 : 1.4;
      } else if (w >= 768) {
        this.slotWidth = 290;
        this.activeScale = 1.10;
        this.minScale = 0.90;
        this.bendFactor = this.prefersReducedMotion ? 0 : 1.25;
      } else if (w >= 480) {
        this.slotWidth = 240;
        this.activeScale = 1.07;
        this.minScale = 0.92;
        this.bendFactor = this.prefersReducedMotion ? 0 : 1.1;
      } else {
        this.slotWidth = 210;
        this.activeScale = 1.06;
        this.minScale = 0.93;
        this.bendFactor = this.prefersReducedMotion ? 0 : 0.9;
      }
    }

    buildTrack() {
      if (!this.track) return;
      this.track.innerHTML = '';
      this.cardNodes = [];

      const n = this.filteredData.length;
      if (n === 0) return;

      // Create enough virtual slots to wrap continuously around viewport
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

        card.innerHTML = `
          <div class="cg-card-inner">
            <span class="cg-card-badge">${item.categoryLabel || item.category}</span>
            <img src="${item.image}" alt="${item.alt}" class="cg-card-img" loading="lazy" />
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
      const maxDistance = viewportWidth * 0.55;

      const R = Math.max(viewportWidth * 1.1, 750) / (this.bendFactor || 1);

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
        const normDist = Math.min(distance / maxDistance, 1.0);

        // Distance-based Scale & Opacity
        const scale = this.activeScale - normDist * (this.activeScale - this.minScale);
        const opacity = 1.0 - normDist * 0.48;

        // Cylindrical Curvature (Bend)
        let X = dx;
        let Z = 0;
        let rotY = 0;

        if (this.bendFactor > 0) {
          const theta = dx / R;
          X = R * Math.sin(theta);
          Z = -R * (1 - Math.cos(theta)) * 0.55 - distance * 0.08;
          rotY = -theta * (180 / Math.PI) * 0.65;
        }

        // Apply 3D transform & opacity
        card.style.transform = `translate3d(calc(${X}px - 50%), -50%, ${Z}px) rotateY(${rotY}deg) scale(${scale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = Math.round((1 - normDist) * 100);

        // Track the slot nearest the center
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

      // Update text details only when normalized active item changes
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
        // Find distance of the closest slot
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

      // Check if settled to put RAF loop to sleep (battery/CPU friendly)
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
        if (this.descEl) this.descEl.textContent = item.description;
        if (this.tagsEl) {
          this.tagsEl.innerHTML = item.tags
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
      // Ignore click if it was part of a drag movement
      if (this.dragMovedDistance > 8) return;

      this.dismissHint();

      // If clicked item is NOT the active centered item -> snap it to center
      if (slotIndex !== this.activeSlotIndex) {
        const clickedNode = this.cardNodes.find(n => n.slotIndex === slotIndex);
        if (clickedNode && typeof clickedNode.dx === 'number') {
          this.targetX += clickedNode.dx;
          this.wakeLoop();
        }
        return;
      }

      // If already active and centered -> open full-size lightbox!
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

      // Pointer / Drag / Touch Events on the Stage
      const stage = this.stage;

      stage.addEventListener('pointerdown', (e) => {
        // Only react to primary mouse button or touch
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
        // Support horizontal swipe or vertical scroll with shift or trackpad
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);

        if (absX > absY || e.shiftKey) {
          // Horizontal scrolling: capture fully
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
          // Gentle vertical wheel step
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
      if (!this.filterBtns) return;

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

      // Reset animation state cleanly
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
            <p class="cg-lb-desc mb-2">${item.description}</p>
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

      this.modalGrid.innerHTML = this.allData.map((item, idx) => `
        <div class="cg-modal-item" data-category="${item.category}">
          <div class="cg-modal-card">
            <div class="cg-modal-media" data-idx="${idx}">
              <img src="${item.image}" alt="${item.alt}" loading="lazy" />
              <div class="cg-modal-overlay">
                <span class="cg-zoom-btn"><i class="bi bi-arrows-angle-expand"></i></span>
              </div>
            </div>
            <div class="cg-modal-info">
              <span class="cg-modal-badge">${item.categoryLabel || item.category}</span>
              <h6 class="cg-modal-title">${item.title}</h6>
              <p class="cg-modal-desc">${item.description}</p>
              <div class="cg-modal-tags">
                ${item.tags.map(t => `<span class="cg-tag-pill">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `).join('');

      // Clicking any photo thumbnail in the modal opens it in the lightbox!
      this.modalGrid.querySelectorAll('.cg-modal-media').forEach(media => {
        media.addEventListener('click', () => {
          const idx = parseInt(media.getAttribute('data-idx'), 10);
          // Close modal
          const modalEl = document.getElementById('workInActionModal');
          if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }
          // Open lightbox with all photos
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
