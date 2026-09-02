import Lenis from 'lenis';

// Initialize Lenis Smooth Scroll on Crisis Response Case Study Page
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function lenisRaf(time) {
  lenis.raf(time);
  requestAnimationFrame(lenisRaf);
}
requestAnimationFrame(lenisRaf);

// Scroll-Driven Sequential Node Illumination & Card Reveals
function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.15,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.glass-card, .case-hero-block, .arch-node, .pipeline-node').forEach((el) => {
    revealObserver.observe(el);
  });
}

function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('floating-nav');
  if (!toggleBtn || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('nav-open');
    toggleBtn.classList.add('open');
    document.body.classList.add('menu-open-scroll-lock');
  }

  function closeMenu() {
    navMenu.classList.remove('nav-open');
    toggleBtn.classList.remove('open');
    document.body.classList.remove('menu-open-scroll-lock');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navMenu.classList.contains('nav-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  navMenu.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      closeMenu();
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  setupMobileMenu();
});
