/**
 * Credentials Dossier Controller (Interactive Split Credential Console)
 * Controls workshop credential switching, active state indicators,
 * live inspector panel updates, and GLightbox synchronization.
 */

(function () {
  'use strict';

  const WORKSHOP_DATA = [
    {
      src: 'assets/img/certificates/cert-iot-automation.jpg',
      badge: 'IoT & Embedded Systems',
      date: 'March 28–29, 2026',
      title: 'Automation Systems: An Embedded and IoT Interfacing & Programming Workshop',
      desc: 'Intensive hands-on training on microcontroller architectures, hardware sensor interfacing, embedded C/C++ programming logic, and automated IoT communications.',
      venue: 'JHCSC Pagadian — IT Building Conference Room',
      speaker: 'Jaafar J. Omar, MSCA',
      skills: ['Embedded Systems', 'IoT Interfacing', 'Microcontrollers', 'Hardware Programming']
    },
    {
      src: 'assets/img/certificates/cert-ux-design.jpg',
      badge: 'UI/UX & Design Thinking',
      date: 'November 15–16, 2025',
      title: 'User Experience Design: Discovering Design Thinking Framework',
      desc: 'In-depth seminar exploring user-centered design methodologies, customer journey mapping, empathy-driven ideation, interactive prototyping, and usability validation.',
      venue: 'JHCSC Pagadian — Campus Library',
      speaker: 'Mark Lester P. Catungal, MIT',
      skills: ['Design Thinking', 'User Experience', 'Wireframing', 'Usability Testing']
    },
    {
      src: 'assets/img/certificates/cert-graphic-design.jpg',
      badge: 'Graphic & Visual Design',
      date: 'October 25–26, 2025',
      title: 'Pixel Perfect: A Beginner’s Journey to Graphic Design',
      desc: 'Foundational workshop focused on visual hierarchy, color psychology, modern typography principles, digital layout composition, and branding materials.',
      venue: 'JHCSC Pagadian — IT Building Conference Room',
      speaker: 'Christian Frix J. Dechavez',
      skills: ['Visual Hierarchy', 'Typography', 'Brand Identity', 'Digital Composition']
    },
    {
      src: 'assets/img/certificates/cert-android-studio.jpg',
      badge: 'Mobile Development & Java',
      date: 'October 19, 2025',
      title: 'Introduction to Android Studio: A Hands-On Java Project for Game Logic',
      desc: 'Hands-on practical development workshop building mobile logic in Android Studio using Java, implementing state management, responsive UI, and game loop architecture.',
      venue: 'JHCSC Pagadian — IT Building Conference Room',
      speaker: 'Rosito D. Orquesta, MSIT',
      skills: ['Android Studio', 'Java', 'Mobile Architecture', 'Game Logic']
    }
  ];

  let activeLightbox = null;

  function refreshLightbox() {
    if (typeof GLightbox !== 'undefined') {
      try {
        if (activeLightbox && typeof activeLightbox.destroy === 'function') {
          activeLightbox.destroy();
        }
        activeLightbox = GLightbox({
          selector: '.glightbox',
          touchNavigation: true,
          loop: true,
          zoomable: true
        });
      } catch (_) {}
    }
  }

  function initCredentialConsole() {
    const ledgerItems = document.querySelectorAll('.ledger-item');
    const inspector = document.getElementById('credential-inspector');
    if (!ledgerItems.length || !inspector) return;

    const imgEl = document.getElementById('inspector-img');
    const zoomLink = document.getElementById('inspector-lightbox-link');
    const badgeEl = document.getElementById('inspector-badge');
    const dateEl = document.getElementById('inspector-date');
    const titleEl = document.getElementById('inspector-title');
    const descEl = document.getElementById('inspector-desc');
    const venueEl = document.getElementById('inspector-venue');
    const speakerEl = document.getElementById('inspector-speaker');
    const skillsEl = document.getElementById('inspector-skills');

    // Click handler for switching active workshop credential
    ledgerItems.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (btn.classList.contains('active')) return;

        const idx = parseInt(btn.dataset.index, 10);
        const data = WORKSHOP_DATA[idx];
        if (!data) return;

        // Update active ledger states
        ledgerItems.forEach((item) => {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Smooth fade animation on inspector
        inspector.classList.add('is-animating');
        setTimeout(() => {
          if (imgEl) {
            imgEl.src = data.src;
            imgEl.alt = data.title;
          }
          if (zoomLink) {
            zoomLink.href = data.src;
            zoomLink.setAttribute('data-title', data.title);
          }
          if (badgeEl) badgeEl.textContent = data.badge;
          if (dateEl) dateEl.innerHTML = `<i class="bi bi-calendar3 me-1"></i>${data.date}`;
          if (titleEl) titleEl.textContent = data.title;
          if (descEl) descEl.textContent = data.desc;
          if (venueEl) venueEl.textContent = data.venue;
          if (speakerEl) speakerEl.textContent = data.speaker;

          if (skillsEl) {
            skillsEl.innerHTML = '';
            data.skills.forEach((skill) => {
              const span = document.createElement('span');
              span.className = 'inspector-skill-pill';
              span.textContent = skill;
              skillsEl.appendChild(span);
            });
          }

          inspector.classList.remove('is-animating');
          refreshLightbox();
        }, 130);
      });
    });

    // Initial lightbox refresh
    refreshLightbox();
  }

  // Intercept any click linking to /certificates to smoothly scroll to credentials
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="/certificates"], a[data-path="/certificates"]');
    if (!link) return;

    setTimeout(() => {
      const credEl = document.getElementById('about-credentials');
      if (credEl) {
        credEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 140);
  });

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCredentialConsole);
  } else {
    initCredentialConsole();
  }
})();
