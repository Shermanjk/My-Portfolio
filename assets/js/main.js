/**
* Template Name: MyResume
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Mobile nav toggle (top navbar)
   */
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileNav    = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-list', !isOpen);
        icon.classList.toggle('bi-x',    isOpen);
      }
    });

    // Close mobile nav when a link is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('bi-list');
          icon.classList.remove('bi-x');
        }
      });
    });
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (mobileNav && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a, .mobile-nav a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active, .mobile-nav a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
        // sync the same href in the other nav
        document.querySelectorAll(`.navmenu a[href="${navmenulink.hash}"], .mobile-nav a[href="${navmenulink.hash}"]`).forEach(l => l.classList.add('active'));
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();


/**
 * Contact Form — AJAX submission via Formspree
 * Prevents page navigation, shows toast on success, clears inputs.
 */
(function () {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('contact-toast');
  const toastClose = document.getElementById('contact-toast-close');
  let toastTimer = null;

  if (!form) return;

  function showToast() {
    toast.classList.add('show');
    // Auto-dismiss after 5 seconds
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    toast.classList.remove('show');
  }

  toastClose.addEventListener('click', hideToast);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn.innerHTML;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending…';

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        showToast();
      } else {
        // Formspree returned an error — show a brief inline message
        const errorEl = document.createElement('p');
        errorEl.className = 'contact-form-error';
        errorEl.textContent = 'Something went wrong. Please try again or email directly.';
        form.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
      }
    } catch {
      const errorEl = document.createElement('p');
      errorEl.className = 'contact-form-error';
      errorEl.textContent = 'Network error. Please check your connection and try again.';
      form.appendChild(errorEl);
      setTimeout(() => errorEl.remove(), 5000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }
  });
})();


/**
 * Hero — Twinkling stars with cursor repulsion + fog distortion
 */
(function () {
  const canvas = document.getElementById('hero-stars');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');

  // ---------- Resize ----------
  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  // ---------- Mouse tracking (relative to hero) ----------
  let mouse = { x: -9999, y: -9999 };
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // ---------- Star generation ----------
  const STAR_COUNT  = 70;
  const REPEL_RADIUS = 120;  // px — how far cursor pushes stars
  const REPEL_FORCE  = 180;  // strength of push

  const stars = Array.from({ length: STAR_COUNT }, () => {
    const bx = Math.random() * 1; // base x (0-1)
    const by = Math.random() * 0.62;
    return {
      bx, by,          // base position (normalized)
      ox: 0, oy: 0,    // current offset from base (px)
      vx: 0, vy: 0,    // velocity
      r:  Math.random() * 1.4 + 0.5,
      twinkleSpeed: Math.random() * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.00005,
    };
  });

  // ---------- Fog repulsion ----------
  // We shift each fog layer's translateX based on cursor X position
  const fogLayers = Array.from(hero.querySelectorAll('.fog-layer'));
  // Each layer has a depth multiplier (closer = stronger push)
  const fogDepth = [1.0, 0.7, 0.45, 0.3, 0.18];
  let fogOffset = 0;        // current extra horizontal offset
  let fogOffsetTarget = 0;

  // ---------- Render loop ----------
  let last = 0;
  function draw(ts) {
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // --- Star physics ---
    stars.forEach((s) => {
      // Base position in px
      s.bx += s.drift;
      if (s.bx < 0) s.bx = 1;
      if (s.bx > 1) s.bx = 0;

      const bpx = s.bx * W;
      const bpy = s.by * H;

      // Current world position
      const wx = bpx + s.ox;
      const wy = bpy + s.oy;

      // Repulsion from cursor
      const dx = wx - mouse.x;
      const dy = wy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
        const angle = Math.atan2(dy, dx);
        s.vx += Math.cos(angle) * force * REPEL_FORCE * dt;
        s.vy += Math.sin(angle) * force * REPEL_FORCE * dt;
      }

      // Spring back to base position
      s.vx += -s.ox * 6 * dt;
      s.vy += -s.oy * 6 * dt;

      // Damping
      s.vx *= 0.88;
      s.vy *= 0.88;

      s.ox += s.vx * dt;
      s.oy += s.vy * dt;

      // Final draw position
      const sx = bpx + s.ox;
      const sy = bpy + s.oy;

      // Twinkle brightness
      const brightness = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ts * 0.001 * s.twinkleSpeed * 600 + s.phase));

      // Glow halo
      if (brightness > 0.55) {
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
        glow.addColorStop(0, `rgba(255,220,100,${brightness * 0.35})`);
        glow.addColorStop(1, 'rgba(255,220,100,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Star core
      ctx.beginPath();
      ctx.arc(sx, sy, s.r * brightness, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,235,180,${brightness})`;
      ctx.fill();
    });

    // --- Fog repulsion ---
    // Cursor position drives a horizontal push on each fog layer
    if (mouse.x > 0 && mouse.x < W) {
      const cx = (mouse.x / W - 0.5); // -0.5 to 0.5
      fogOffsetTarget = cx * 80;       // max ±80px push
    } else {
      fogOffsetTarget = 0;
    }

    // Smooth lerp
    fogOffset += (fogOffsetTarget - fogOffset) * 0.06;

    fogLayers.forEach((layer, i) => {
      const depth = fogDepth[i] ?? 0.15;
      // Drive via CSS custom property so it compounds with the drift animation
      layer.style.setProperty('--fog-push', `${fogOffset * depth}px`);
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();


/**
 * Light / Dark mode toggle
 * Persists preference to localStorage. Applies before paint to avoid flash.
 */
(function () {
  const STORAGE_KEY = 'sm-theme';
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  // Apply saved theme immediately (runs sync, before first paint)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light') {
    html.setAttribute('data-theme', 'light');
  }

  if (!btn) return;

  btn.addEventListener('click', () => {
    const isLight = html.getAttribute('data-theme') === 'light';
    if (isLight) {
      html.removeAttribute('data-theme');
      localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  });
})();


/**
 * Navbar — hide on scroll down, reveal on scroll up
 */
(function () {
  const header = document.getElementById('header');
  if (!header) return;

  let lastY    = window.scrollY;
  let ticking  = false;
  const THRESHOLD = 60; // px from top — don't hide until past this point

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastY;

        if (currentY <= THRESHOLD) {
          // Always show near the top
          header.classList.remove('nav-hidden');
        } else if (scrollingDown) {
          header.classList.add('nav-hidden');
        } else {
          header.classList.remove('nav-hidden');
        }

        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/**
 * Scroll progress bar
 */
(function () {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/**
 * Stats count-up animation — triggers when section scrolls into view
 */
(function () {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  function countUp(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200; // ms
    const steps    = 40;
    const stepTime = duration / steps;
    let current    = 0;

    const timer = setInterval(() => {
      current += Math.ceil(target / steps);
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, stepTime);
  }

  // Use IntersectionObserver so it fires when stats scroll into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
})();
