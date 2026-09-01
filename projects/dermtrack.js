import Lenis from 'lenis';

// Initialize Lenis Smooth Scroll on DermTrack Case Study Page
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

  document.querySelectorAll('.glass-card, .case-hero-block, .arch-node, .metric-card').forEach((el) => {
    revealObserver.observe(el);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
});
