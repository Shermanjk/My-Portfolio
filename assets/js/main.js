/**
 * Sherwen Mortis — Portfolio Scripts
 * Custom interactions, animations, theme transitions, and validations.
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
   * Hide mobile nav on same-page/hash links from desktop menu
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (mobileNav && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
      }
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
   * Initiate GLightbox (Project screenshots and creative posters)
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
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function() {
    if (window.location.hash) {
      const section = document.querySelector(window.location.hash);
      if (section) {
        setTimeout(() => {
          const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop || 0),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  const navmenulinks = document.querySelectorAll('.navmenu a, .mobile-nav a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      const section = document.querySelector(navmenulink.hash);
      if (!section) return;
      const position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active, .mobile-nav a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
        document.querySelectorAll(`.navmenu a[href="${navmenulink.hash}"], .mobile-nav a[href="${navmenulink.hash}"]`).forEach(l => l.classList.add('active'));
      } else {
        navmenulink.classList.remove('active');
      }
    });
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
 * Navbar — hide on scroll down, reveal on scroll up
 */
(function () {
  const header = document.getElementById('header');
  if (!header) return;

  let lastY    = window.scrollY;
  let ticking  = false;
  const THRESHOLD = 60;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastY;

        if (currentY <= THRESHOLD) {
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
