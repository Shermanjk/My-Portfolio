/**
 * Sherwen Mortis — Portfolio Scripts
 * Custom interactions, animations, theme transitions, and validations.
 */

(function() {
  "use strict";

  /**
   * Left Sidebar Navigation (fixed on desktop, off-canvas drawer on small screens)
   */
  const sidebar      = document.getElementById('sidebar');
  const sideToggle   = document.getElementById('side-toggle');
  const sideBackdrop = document.getElementById('side-backdrop');

  function setSidebarOpen(isOpen) {
    if (!sidebar) return;
    sidebar.classList.toggle('open', isOpen);
    document.body.classList.toggle('side-open', isOpen);
    if (sideToggle) {
      sideToggle.setAttribute('aria-expanded', String(isOpen));
      sideToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      const icon = sideToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-list', !isOpen);
        icon.classList.toggle('bi-x', isOpen);
      }
    }
  }

  function closeSidebar() {
    if (sidebar && sidebar.classList.contains('open')) setSidebarOpen(false);
  }

  if (sideToggle && sidebar) {
    sideToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setSidebarOpen(!sidebar.classList.contains('open'));
    });
  }
  if (sideBackdrop) sideBackdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
  // Reset drawer state when resizing up to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1200) closeSidebar();
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
  const scrollTop = document.querySelector('.scroll-top');
  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }

  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll (AOS)
   */
  function aosInit() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }
  window.addEventListener('load', aosInit);

  /**
   * Optional Typed.js Initialization
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped && typeof Typed !== 'undefined') {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    if (typed_strings) {
      typed_strings = typed_strings.split(',');
      new Typed('.typed', {
        strings: typed_strings,
        loop: true,
        typeSpeed: 90,
        backSpeed: 45,
        backDelay: 2000
      });
    }
  }

  /**
   * Initiate GLightbox (Project screenshots, media, and certificates)
   */
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      zoomable: true
    });
  }

  /**
   * Section Router & Clean URL Navigation (HTML5 History API, no '#' in URLs)
   * Supports:
   *  - Clean pathnames: /gallery, /about, /skills, /services, /experience, /portfolio, /certificates, /contact, /
   *  - Legacy hash redirects: /#gallery seamlessly rewrites to /gallery
   *  - Smooth scrolling with fixed header offset (64px)
   *  - Scrollspy with synchronized, non-flickering URL bar updates
   *  - Full browser back/forward (popstate) navigation support
   */
  const routeSectionMap = {
    '/': 'hero',
    '/hero': 'hero',
    '/about': 'about',
    '/skills': 'skills',
    '/services': 'services',
    '/process': 'process',
    '/experience': 'experience',
    '/portfolio': 'portfolio',
    '/projects': 'portfolio',
    '/certificates': 'about',
    '/certs': 'about',
    '/credentials': 'about',
    '/creative': 'about',
    '/gallery': 'gallery',
    '/work-in-action': 'gallery',
    '/contact': 'contact'
  };

  const trackedSections = [
    { id: 'hero', path: '/' },
    { id: 'about', path: '/about' },
    { id: 'skills', path: '/skills' },
    { id: 'services', path: '/services' },
    { id: 'process', path: '/process' },
    { id: 'experience', path: '/experience' },
    { id: 'portfolio', path: '/portfolio' },
    { id: 'gallery', path: '/gallery' },
    { id: 'contact', path: '/contact' }
  ];

  const groupParentMap = {
    '/about': 'about',
    '/certificates': 'about',
    '/certs': 'about',
    '/credentials': 'about',
    '/skills': 'about',
    '/services': 'about',
    '/process': 'about',
    '/portfolio': 'work',
    '/projects': 'work',
    '/gallery': 'work'
  };

  const HEADER_OFFSET = 0; // No top bar — navigation lives in the left sidebar
  let isProgrammaticScroll = false;
  let scrollTimeout = null;
  let currentRoutePath = null;

  function getPathForSection(sectionId) {
    if (!sectionId || sectionId === 'hero') return '/';
    return '/' + sectionId;
  }

  /**
   * Desktop Dropdown Navigation Controllers (Hover intent + Click toggle + Keyboard)
   */
  const dropdownItems = document.querySelectorAll('.nav-item-dropdown');
  let dropdownCloseTimer = null;

  function closeAllDropdowns() {
    clearTimeout(dropdownCloseTimer);
    dropdownItems.forEach(item => {
      item.classList.remove('open');
      const trigger = item.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function openDropdown(item) {
    clearTimeout(dropdownCloseTimer);
    dropdownItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        const trigger = other.querySelector('.nav-dropdown-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.add('open');
    const trigger = item.querySelector('.nav-dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  dropdownItems.forEach(item => {
    const trigger = item.querySelector('.nav-dropdown-trigger');
    const dropdown = item.querySelector('.nav-dropdown');

    // Hover intent (150ms delay)
    item.addEventListener('mouseenter', () => {
      openDropdown(item);
    });

    item.addEventListener('mouseleave', () => {
      dropdownCloseTimer = setTimeout(() => {
        item.classList.remove('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }, 150);
    });

    // Click / tap toggle
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.classList.contains('open')) {
          item.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          openDropdown(item);
        }
      });

      // Keyboard support on trigger
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDropdown(item);
          const firstLink = dropdown ? dropdown.querySelector('.dropdown-item') : null;
          if (firstLink) firstLink.focus();
        } else if (e.key === 'Escape') {
          closeAllDropdowns();
        }
      });
    }

    // Keyboard navigation within dropdown items
    if (dropdown) {
      const dropLinks = Array.from(dropdown.querySelectorAll('.dropdown-item'));
      dropLinks.forEach((link, idx) => {
        link.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = dropLinks[idx + 1] || dropLinks[0];
            next.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (idx === 0) {
              if (trigger) trigger.focus();
            } else {
              dropLinks[idx - 1].focus();
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            closeAllDropdowns();
            if (trigger) trigger.focus();
          }
        });
      });
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
      closeAllDropdowns();
    }
  });

  // Close on Escape anywhere
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  function setActiveNav(path) {
    // Clear all previous active states
    document.querySelectorAll('.side-link, .side-group-label').forEach(el => {
      el.classList.remove('active');
    });

    const activeGroup = groupParentMap[path];

    // Highlight parent top-level dropdown trigger
    if (activeGroup === 'about') {
      const triggerAbout = document.getElementById('trigger-about');
      if (triggerAbout) triggerAbout.classList.add('active');
      const mobileAboutToggle = document.querySelector('.mobile-nav-group[data-group="about"] .mobile-group-toggle');
      if (mobileAboutToggle) mobileAboutToggle.classList.add('active');
    } else if (activeGroup === 'work') {
      const triggerWork = document.getElementById('trigger-work');
      if (triggerWork) triggerWork.classList.add('active');
      const mobileWorkToggle = document.querySelector('.mobile-nav-group[data-group="work"] .mobile-group-toggle');
      if (mobileWorkToggle) mobileWorkToggle.classList.add('active');
    }

    // Highlight matching link or dropdown item
    const allLinks = document.querySelectorAll('#sidebar .side-link');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      const dataPath = link.getAttribute('data-path');
      const normalizedHref = href ? href.replace(/\/+$/, '') || '/' : '';
      const isMatch = normalizedHref === path || dataPath === path || (path === '/' && (normalizedHref === '/' || normalizedHref === '/hero'));
      if (isMatch) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Discrete Section Viewer
   * Switches visible section when tapping/clicking sidebar or in-page links.
   * Completely eliminates continuous multi-section page scrolling.
   */
  function showSection(sectionId, updateUrl = true, pushHistory = true) {
    const allSections = document.querySelectorAll('.main > section');
    const targetSection = (sectionId === 'hero') 
      ? document.getElementById('hero') 
      : document.getElementById(sectionId);

    if (!targetSection) return;

    // 1. Activate target section and hide all other sections
    allSections.forEach(sec => {
      if (sec === targetSection) {
        sec.classList.add('section-active');
        sec.removeAttribute('aria-hidden');
      } else {
        sec.classList.remove('section-active');
        sec.setAttribute('aria-hidden', 'true');
      }
    });

    // 2. Body class for hero styling & footer visibility
    const isHero = (sectionId === 'hero');
    document.body.classList.toggle('on-hero', isHero);

    // 3. Reset scroll position immediately to top (or smooth scroll to credentials if targeting /certificates)
    const isCertRequest = (currentRoutePath === '/certificates' || (updateUrl && window.location.pathname === '/certificates'));
    if (isCertRequest) {
      setTimeout(() => {
        const credEl = document.getElementById('about-credentials');
        if (credEl) {
          credEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }

    // 4. Synchronize URL pathname and active nav link
    const targetPath = getPathForSection(sectionId);
    currentRoutePath = targetPath;
    setActiveNav(targetPath);

    if (updateUrl) {
      if (pushHistory) {
        if (window.location.pathname !== targetPath) {
          history.pushState({ sectionId }, '', targetPath);
        }
      } else {
        if (window.location.pathname !== targetPath) {
          history.replaceState({ sectionId }, '', targetPath);
        }
      }
    }

    // 5. Close sidebar on mobile devices
    closeSidebar();

    // 6. Refresh animations and 3D layout calculations
    if (typeof AOS !== 'undefined') {
      try { AOS.refresh(); } catch (_) {}
    }
    window.dispatchEvent(new Event('resize'));
  }

  // Intercept in-page and sidebar section navigation links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    if (link.target === '_blank') return;
    if (link.hasAttribute('download')) return;
    if (link.classList.contains('glightbox')) return;

    let targetSection = null;

    // Check if link is a hash link (#portfolio)
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (id && document.getElementById(id) && id !== 'footer') {
        targetSection = id;
      }
    } else {
      // Check if path matches routeSectionMap
      try {
        const url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin) {
          const path = url.pathname.replace(/\/+$/, '') || '/';
          if (routeSectionMap[path]) {
            targetSection = routeSectionMap[path];
          }
        }
      } catch (_) {}
    }

    if (targetSection) {
      e.preventDefault();
      closeAllDropdowns();
      showSection(targetSection, true, true);
    }
  });

  // Browser Back/Forward navigation
  window.addEventListener('popstate', function() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const sectionId = routeSectionMap[path] || 'hero';
    showSection(sectionId, false, false);
  });

  // Initial Route Dispatcher on page load
  function dispatchInitialRoute() {
    let targetSection = 'hero';
    let targetPath = '/';

    // 1. Check legacy hash (e.g. #gallery -> rewrite to /gallery)
    if (window.location.hash) {
      const hashId = window.location.hash.replace('#', '').toLowerCase();
      if (document.getElementById(hashId)) {
        targetSection = hashId;
        targetPath = getPathForSection(hashId);
      }
    }

    // 2. Check path (e.g. /gallery)
    if (targetSection === 'hero') {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (routeSectionMap[path]) {
        targetSection = routeSectionMap[path];
        targetPath = (targetSection === 'hero') ? '/' : path;
      }
    }

    // Strip any '#' hash if present
    if (window.location.hash) {
      history.replaceState({ sectionId: targetSection }, '', targetPath);
    }

    showSection(targetSection, false, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dispatchInitialRoute);
  } else {
    dispatchInitialRoute();
  }
  window.addEventListener('load', dispatchInitialRoute);

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
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    if (!toast) return;
    toast.classList.remove('show');
  }

  if (toastClose) {
    toastClose.addEventListener('click', hideToast);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn.innerHTML;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending…';

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
        const errorEl = document.createElement('p');
        errorEl.className = 'contact-form-error text-danger mt-2';
        errorEl.textContent = 'Something went wrong. Please try again or email directly.';
        form.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
      }
    } catch {
      const errorEl = document.createElement('p');
      errorEl.className = 'contact-form-error text-danger mt-2';
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
  if (!hero) return;

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
  const STAR_COUNT   = 70;
  const REPEL_RADIUS = 120;  // px — how far cursor pushes stars
  const REPEL_FORCE  = 180;  // strength of push

  const stars = Array.from({ length: STAR_COUNT }, () => {
    const bx = Math.random() * 1;
    const by = Math.random() * 0.62;
    return {
      bx, by,
      ox: 0, oy: 0,
      vx: 0, vy: 0,
      r:  Math.random() * 1.4 + 0.5,
      twinkleSpeed: Math.random() * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.00005,
    };
  });

  // ---------- Fog repulsion ----------
  const fogLayers = Array.from(hero.querySelectorAll('.fog-layer'));
  const fogDepth = [1.0, 0.7, 0.45, 0.3, 0.18];
  let fogOffset = 0;
  let fogOffsetTarget = 0;

  // ---------- Render loop with IntersectionObserver Optimization ----------
  let last = 0;
  let isHeroVisible = true;
  let animFrameId = null;

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && !animFrameId) {
          last = performance.now();
          animFrameId = requestAnimationFrame(draw);
        } else if (!isHeroVisible && animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
      });
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  function draw(ts) {
    if (!isHeroVisible) {
      animFrameId = null;
      return;
    }

    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // --- Star physics ---
    stars.forEach((s) => {
      s.bx += s.drift;
      if (s.bx < 0) s.bx = 1;
      if (s.bx > 1) s.bx = 0;

      const bpx = s.bx * W;
      const bpy = s.by * H;

      const wx = bpx + s.ox;
      const wy = bpy + s.oy;

      const dx = wx - mouse.x;
      const dy = wy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
        const angle = Math.atan2(dy, dx);
        s.vx += Math.cos(angle) * force * REPEL_FORCE * dt;
        s.vy += Math.sin(angle) * force * REPEL_FORCE * dt;
      }

      s.vx += -s.ox * 6 * dt;
      s.vy += -s.oy * 6 * dt;

      s.vx *= 0.88;
      s.vy *= 0.88;

      s.ox += s.vx * dt;
      s.oy += s.vy * dt;

      const sx = bpx + s.ox;
      const sy = bpy + s.oy;

      const brightness = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ts * 0.001 * s.twinkleSpeed * 600 + s.phase));

      if (brightness > 0.55) {
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
        glow.addColorStop(0, `rgba(255,220,100,${brightness * 0.35})`);
        glow.addColorStop(1, 'rgba(255,220,100,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, s.r * brightness, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,235,180,${brightness})`;
      ctx.fill();
    });

    // --- Fog repulsion ---
    if (mouse.x > 0 && mouse.x < W) {
      const cx = (mouse.x / W - 0.5);
      fogOffsetTarget = cx * 80;
    } else {
      fogOffsetTarget = 0;
    }

    fogOffset += (fogOffsetTarget - fogOffset) * 0.06;

    fogLayers.forEach((layer, i) => {
      const depth = fogDepth[i] ?? 0.15;
      layer.style.setProperty('--fog-push', `${fogOffset * depth}px`);
    });

    animFrameId = requestAnimationFrame(draw);
  }

  animFrameId = requestAnimationFrame(draw);
})();


/**
 * Light / Dark mode toggle with Circular Wave Transition
 * Persists preference to localStorage. Applies before paint to avoid flash.
 */
(function () {
  const STORAGE_KEY = 'sm-theme';
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light') {
    html.setAttribute('data-theme', 'light');
  }

  if (!btn) return;

  btn.addEventListener('click', async () => {
    const isCurrentlyLight = html.getAttribute('data-theme') === 'light';
    const nextTheme = isCurrentlyLight ? 'dark' : 'light';

    const rect = btn.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    const endRadius = Math.ceil(Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )) + 30;

    btn.classList.remove('wave-in-dark', 'wave-out-light');
    void btn.offsetWidth;
    btn.classList.add(nextTheme === 'dark' ? 'wave-in-dark' : 'wave-out-light');

    setTimeout(() => {
      btn.classList.remove('wave-in-dark', 'wave-out-light');
    }, 700);

    const switchTheme = () => {
      if (nextTheme === 'dark') {
        html.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEY, 'dark');
      } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem(STORAGE_KEY, 'light');
      }
    };

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      switchTheme();
      return;
    }

    html.classList.remove('theme-wave-to-dark', 'theme-wave-to-light');
    html.classList.add(nextTheme === 'dark' ? 'theme-wave-to-dark' : 'theme-wave-to-light');

    const transition = document.startViewTransition(() => {
      switchTheme();
    });

    try {
      await transition.ready;

      if (nextTheme === 'light') {
        await document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.25, 1, 0.35, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        ).finished;
      } else {
        await document.documentElement.animate(
          {
            clipPath: [
              `circle(${endRadius}px at ${x}px ${y}px)`,
              `circle(0px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.25, 1, 0.35, 1)',
            pseudoElement: '::view-transition-old(root)'
          }
        ).finished;
      }
    } catch {
      // Fallback if animation rejected
    } finally {
      html.classList.remove('theme-wave-to-dark', 'theme-wave-to-light');
    }
  });
})();




/**
 * Scroll progress bar
 */
(function () {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/**
 * Stats count-up animation — triggers when section scrolls into view
 * Preserves semantic values in HTML while rolling smoothly up from 0
 */
(function () {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  function countUp(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10) || parseInt(el.textContent, 10) || 0;
    const duration = 1400;
    const start    = performance.now();

    el.classList.add('counting');
    el.textContent = '0'; // start visual roll from 0

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3); // cubic ease-out
    }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
        el.classList.remove('counting');
        el.classList.add('done');
      }
    }

    requestAnimationFrame(update);
  }

  const statItems = document.querySelectorAll('.stat-item');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item   = entry.target;
          const numEl  = item.querySelector('.stat-number');

          item.classList.add('stat-visible');

          if (numEl) {
            const delay = parseFloat(getComputedStyle(item).transitionDelay) * 1000 || 0;
            setTimeout(() => countUp(numEl), delay + 300);
          }

          observer.unobserve(item);
        }
      });
    }, { threshold: 0.4 });

    statItems.forEach(el => observer.observe(el));
  } else {
    statItems.forEach(item => {
      const numEl = item.querySelector('.stat-number');
      if (numEl) countUp(numEl);
    });
  }
})();

/**
 * Work in Action — Split Pop-Out Modal Controller
 * Displays Enlarged Photo on Left and Rich Details on Right
 * Supports Previous/Next cycling, Esc close, Arrow navigation, and Focus trapping
 */
(function () {
  const galleryItemsData = [
    {
      img: 'assets/img/photos/cenro-deployment.jpg',
      badge: 'Client Work',
      title: 'CENRO System Walkthrough & Training',
      desc: 'Conducting a hands-on system walkthrough with CENRO personnel while validating driver routing, municipal waste collection logging, and dispatch coordination in live operations.',
      location: 'CENRO Municipal Operations HQ',
      role: 'System Lead & Deployer',
      tags: ['Client Training', 'System Validation', 'Field Deployment', 'Operations QA']
    },
    {
      img: 'assets/img/photos/field-deployment.jpg',
      badge: 'Deployment',
      title: 'On-Site Client Deployment',
      desc: 'Deploying and validating POS terminals in the client retail environment, testing cash drawer sync, ESC/POS receipt printing, and local database network sync before opening day.',
      location: 'Retail Storefront / Client Site',
      role: 'Deployment Engineer',
      tags: ['Client Deployment', 'POS Testing', 'Production Setup', 'Hardware Sync']
    },
    {
      img: 'assets/img/photos/hardware-servicing.jpg',
      badge: 'Hardware Servicing',
      title: 'Precision Component Servicing & Thermal Management',
      desc: 'Detailed motherboard component-level maintenance, micro-ribbon cable seating, trackpad and I/O bus realignment, thermal compound application, and precision reassembly on enterprise laptops.',
      location: 'EMCOR — Technical Support & Service Center',
      role: 'Technical Support & Hardware Specialist',
      tags: ['Component Repair', 'Thermal Management', 'Ribbon Bus Assembly', 'Hardware Servicing']
    },
    {
      img: 'assets/img/photos/dev-battlestation.jpg',
      badge: 'Development',
      title: 'Development & System Engineering',
      desc: 'Active full-stack engineering session refining relational database schemas, RESTful API endpoints, and responsive UI state across multi-display setups.',
      location: 'Development Lab / Workstation',
      role: 'Full-Stack Developer',
      tags: ['Full-Stack Dev', 'Database Design', 'System Architecture', 'REST APIs']
    },
    {
      img: 'assets/img/photos/build-staging.jpg',
      badge: 'Hardware',
      title: 'Build Staging & Hardware Testing',
      desc: 'Bench-testing and pre-configuring client workstations, thermal receipt printers, handheld barcode scanners, and network peripherals prior to deployment.',
      location: 'Staging & Integration Area',
      role: 'Systems Integrator',
      tags: ['Staging', 'Hardware Testing', 'Peripheral Setup', 'POS Integration']
    },
    {
      img: 'assets/img/photos/late-night-coding.jpg',
      badge: 'Development',
      title: 'Focused Development Session',
      desc: 'Late-night implementation sprint addressing core business logic, query optimization, rigorous code reviews, and test coverage before releasing to staging.',
      location: 'Engineering Desk',
      role: 'Backend & System Engineer',
      tags: ['Backend Dev', 'Code Auditing', 'Optimization', 'Performance QA']
    },
    {
      img: 'assets/img/photos/laptop-motherboard-servicing.jpg',
      badge: 'Enterprise Hardware',
      title: 'Laptop Teardown & Bench Diagnostics',
      desc: 'Hands-on enterprise laptop disassembly, component-level inspection, dual cooling fan maintenance, thermal paste re-application, battery replacement, and motherboard power delivery line validation.',
      location: 'EMCOR — Technical Support & Systems Facility',
      role: 'Technical Support & Hardware Specialist',
      tags: ['Laptop Teardown', 'Cooling Overhaul', 'Motherboard Inspection', 'Enterprise Hardware']
    },
    {
      img: 'assets/img/photos/pc-hardware-bench-repair.jpg',
      badge: 'Bench Diagnostics',
      title: 'Workstation Teardown & Storage Diagnostics',
      desc: 'In-depth workstation teardown, diagnosing mechanical hard drive and SATA/NVMe SSD storage failures, memory module testing, precision hardware assembly, and workstation stability validation.',
      location: 'EMCOR — Technical Support & Service Center',
      role: 'Technical Support & Hardware Specialist',
      tags: ['Storage Diagnostics', 'Workstation Teardown', 'Hardware Repair', 'Component Testing']
    }
  ];

  const modal = document.getElementById('gallery-split-modal');
  if (!modal) return;

  const modalImg         = document.getElementById('modal-img');
  const modalBadge       = document.getElementById('modal-badge');
  const modalTitle       = document.getElementById('modal-title');
  const modalDesc        = document.getElementById('modal-desc');
  const modalLocation    = document.getElementById('modal-meta-location');
  const modalRole        = document.getElementById('modal-meta-role');
  const modalTags        = document.getElementById('modal-tags');
  const modalCurrentIdx  = document.getElementById('modal-current-index');
  const modalTotalCount  = document.getElementById('modal-total-count');
  const modalCloseBtn    = document.getElementById('gallery-modal-close');
  const modalBackdrop    = document.getElementById('gallery-modal-backdrop');
  const modalPrevBtn     = document.getElementById('gallery-nav-prev');
  const modalNextBtn     = document.getElementById('gallery-nav-next');
  const galleryCards     = document.querySelectorAll('.gallery-card');

  let currentIndex = 0;
  let lastActiveTrigger = null;

  if (modalTotalCount) {
    modalTotalCount.textContent = String(galleryItemsData.length);
  }

  function renderModalItem(idx) {
    const item = galleryItemsData[idx];
    if (!item) return;

    if (modalImg) {
      modalImg.style.opacity = '0';
      setTimeout(() => {
        modalImg.src = item.img;
        modalImg.alt = item.title;
        modalImg.style.opacity = '1';
      }, 80);
    }
    if (modalBadge) modalBadge.textContent = item.badge;
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalDesc) modalDesc.textContent = item.desc;
    if (modalLocation) modalLocation.textContent = item.location;
    if (modalRole) modalRole.textContent = item.role;
    if (modalCurrentIdx) modalCurrentIdx.textContent = String(idx + 1);

    if (modalTags) {
      modalTags.innerHTML = '';
      item.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'gallery-modal-tag';
        span.textContent = tag;
        modalTags.appendChild(span);
      });
    }
  }

  function openModal(index, triggerEl) {
    currentIndex = (index >= 0 && index < galleryItemsData.length) ? index : 0;
    lastActiveTrigger = triggerEl || null;
    renderModalItem(currentIndex);
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-modal-open');
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  // Expose globally so dome-gallery.js can open the split modal
  window.openGalleryModal = openModal;

  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-modal-open');
    if (lastActiveTrigger) {
      lastActiveTrigger.focus();
      lastActiveTrigger = null;
    }
  }

  function prevItem() {
    currentIndex = (currentIndex - 1 + galleryItemsData.length) % galleryItemsData.length;
    renderModalItem(currentIndex);
  }

  function nextItem() {
    currentIndex = (currentIndex + 1) % galleryItemsData.length;
    renderModalItem(currentIndex);
  }

  // Card triggers
  galleryCards.forEach(card => {
    const trigger = card.querySelector('.gallery-card-trigger');
    const idxAttr = card.getAttribute('data-gallery-index');
    const idx = idxAttr ? parseInt(idxAttr, 10) : 0;

    if (trigger) {
      trigger.addEventListener('click', () => openModal(idx, trigger));
    } else {
      card.addEventListener('click', () => openModal(idx, card));
    }
  });

  // Modal Controls
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalPrevBtn) modalPrevBtn.addEventListener('click', prevItem);
  if (modalNextBtn) modalNextBtn.addEventListener('click', nextItem);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevItem();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextItem();
    }
  });

  // Mobile & tablet touch swipe gesture support for split modal
  let touchStartX = 0;
  let touchStartY = 0;
  modal.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length === 1) {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
        if (diffX < 0) {
          nextItem();
        } else {
          prevItem();
        }
      }
    }
  }, { passive: true });
})();


