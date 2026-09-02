import Lenis from 'lenis';

// Initialize Lenis Smooth Scroll on About Page
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

// Elements
const idCardWrapper = document.getElementById('id-card-wrapper');
const interactiveIdCard = document.getElementById('interactive-id-card');
const lanyardAssembly = document.getElementById('lanyard-assembly');
const cardReflection = document.getElementById('card-reflection');
const expandedDrawer = document.getElementById('id-expanded-drawer');
const pullHintBadge = document.getElementById('pull-hint-badge');
const lanyardStrap = document.querySelector('.lanyard-strap');

// Parallax Variables
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let targetRotateX = 0;
let targetRotateY = 0;
let currentRotateX = 0;
let currentRotateY = 0;

let targetSwayX = 0;
let targetSwayY = 0;
let currentSwayX = 0;
let currentSwayY = 0;

let targetReflectionX = 50;
let targetReflectionY = 50;
let currentReflectionX = 50;
let currentReflectionY = 50;

// Entrance Pendulum Physics State
let isEntranceActive = true;
let entranceTime = 0;

// 2D Free-Direction Elastic Drag State
let isPressed = false;
let isDragging = false;
let startPointerX = 0;
let startPointerY = 0;
let activePointerId = null;

let targetElasticX = 0;
let currentElasticX = 0;

let targetElasticY = 0;
let currentElasticY = 0;

let targetRotation = 0;
let currentRotation = 0;

let springVelocityX = 0;
let springVelocityY = 0;
let springVelocityRot = 0;

let hasUserInteracted = false;

const DRAG_THRESHOLD_PX = 8;
const MAX_PULL_RADIUS = 220; // Maximum radial pull distance in px
const RESISTANCE_K = 180;    // Radial rubber-band resistance constant

// Parallax Effect
function onMouseMove(e) {
  if (isDragging || isPressed) return;
  mouseX = e.clientX;
  mouseY = e.clientY;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const normX = (mouseX - centerX) / centerX;
  const normY = (mouseY - centerY) / centerY;

  targetRotateY = normX * 12;
  targetRotateX = -normY * 10;

  targetSwayX = normX * 14;
  targetSwayY = Math.max(-5, normY * 6);

  targetReflectionX = (normX + 1) * 50;
  targetReflectionY = (normY + 1) * 50;
}

function onMouseLeave() {
  if (isDragging || isPressed) return;
  targetRotateX = 0;
  targetRotateY = 0;
  targetSwayX = 0;
  targetSwayY = 0;
  targetReflectionX = 50;
  targetReflectionY = 50;
}

window.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseleave', onMouseLeave);

// Free 2D Directional Pointer Drag Setup (Zero Click-to-Expand)
function setupPointerDragEvents() {
  if (!interactiveIdCard) return;

  interactiveIdCard.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    isPressed = true;
    isDragging = false;
    activePointerId = e.pointerId;
    startPointerX = e.clientX;
    startPointerY = e.clientY;

    springVelocityX = 0;
    springVelocityY = 0;
    springVelocityRot = 0;
  });

  interactiveIdCard.addEventListener('pointermove', (e) => {
    if (!isPressed || e.pointerId !== activePointerId) return;

    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;
    const dist = Math.hypot(dx, dy);

    // Threshold check (8px) before pointer capture
    if (!isDragging) {
      if (dist >= DRAG_THRESHOLD_PX) {
        isDragging = true;
        try {
          interactiveIdCard.setPointerCapture(e.pointerId);
        } catch (err) {
          // Fallback if capture is unsupported
        }

        if (!hasUserInteracted) {
          hasUserInteracted = true;
          if (pullHintBadge) pullHintBadge.style.opacity = '0';
        }
      }
    }

    if (isDragging) {
      // 2D Radial Elastic Resistance Formula
      const angle = Math.atan2(dy, dx);
      let effectiveRadius = 0;

      if (dy < -20) {
        // Dragging UP (Restrained vertical movement max 35px)
        const upwardFactor = Math.abs(dy);
        effectiveRadius = Math.min(35, upwardFactor * 0.25);
      } else {
        // Dragging DOWN / LEFT / RIGHT / DIAGONAL
        effectiveRadius = MAX_PULL_RADIUS * (1 - Math.exp(-dist / RESISTANCE_K));
      }

      // Decompose 2D Radial Displacement
      targetElasticX = effectiveRadius * Math.cos(angle);
      targetElasticY = effectiveRadius * Math.sin(angle);

      // Clamp horizontal & vertical displacement within sensible viewport boundaries for mobile stage
      const isMobile = window.innerWidth <= 768;
      const maxViewportX = isMobile ? Math.min(45, Math.max(15, (window.innerWidth - 275) / 2)) : 200;
      const maxViewportY = isMobile ? 45 : 180;

      targetElasticX = Math.max(-maxViewportX, Math.min(maxViewportX, targetElasticX));
      targetElasticY = Math.max(-25, Math.min(maxViewportY, targetElasticY));

      // Dynamic Directional Rotation (-8deg to +8deg)
      targetRotation = Math.max(-8, Math.min(8, targetElasticX * 0.08 + targetElasticY * 0.02));
    }
  });

  function onPointerEnd(e) {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;

    if (isDragging) {
      try {
        interactiveIdCard.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore if pointer capture lost
      }
    }

    // ALWAYS spring back to origin (0, 0) from ANY 2D direction (Zero click lock)
    isPressed = false;
    isDragging = false;
    activePointerId = null;

    targetElasticX = 0;
    targetElasticY = 0;
    targetRotation = 0;
  }

  interactiveIdCard.addEventListener('pointerup', onPointerEnd);
  interactiveIdCard.addEventListener('pointercancel', onPointerEnd);

  interactiveIdCard.addEventListener('contextmenu', (e) => {
    if (isDragging) e.preventDefault();
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

// 60FPS Render Loop with 2D Harmonic Spring Physics & Lanyard Pivoting
function physicsLoop() {
  // A. Entrance Pendulum Phase
  if (isEntranceActive) {
    entranceTime += 0.018;

    const decay = Math.exp(-2.2 * entranceTime);
    const pendulumAngle = 18 * decay * Math.cos(entranceTime * 9);
    const dropY = -120 * decay * Math.sin(entranceTime * 6);

    currentRotateY = pendulumAngle;
    currentSwayX = pendulumAngle * 1.5;
    currentSwayY = dropY;

    if (entranceTime > 1.8) {
      isEntranceActive = false;
    }
  } else {
    // Parallax Lerp
    currentRotateX += (targetRotateX - currentRotateX) * 0.07;
    currentRotateY += (targetRotateY - currentRotateY) * 0.07;
    currentSwayX += (targetSwayX - currentSwayX) * 0.06;
    currentSwayY += (targetSwayY - currentSwayY) * 0.06;
  }

  // B. Damped 2D Spring Physics Loop for Drag & Release Return
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isDragging) {
    currentElasticX += (targetElasticX - currentElasticX) * 0.3;
    currentElasticY += (targetElasticY - currentElasticY) * 0.3;
    currentRotation += (targetRotation - currentRotation) * 0.3;
  } else {
    if (isReducedMotion) {
      currentElasticX += (0 - currentElasticX) * 0.4;
      currentElasticY += (0 - currentElasticY) * 0.4;
      currentRotation += (0 - currentRotation) * 0.4;
    } else {
      // 2D Damped Harmonic Oscillation (Overshoot + Recoil + Settle)
      const k = 0.22;
      const damp = 0.68;

      const forceX = (0 - currentElasticX) * k;
      springVelocityX = springVelocityX * damp + forceX;
      currentElasticX += springVelocityX;

      const forceY = (0 - currentElasticY) * k;
      springVelocityY = springVelocityY * damp + forceY;
      currentElasticY += springVelocityY;

      const forceRot = (0 - currentRotation) * k;
      springVelocityRot = springVelocityRot * damp + forceRot;
      currentRotation += springVelocityRot;
    }
  }

  // C. Physical 2D Rubber Deformation Math
  const currentRadius = Math.hypot(currentElasticX, currentElasticY);
  const pullProgress = Math.max(0, Math.min(1, currentRadius / MAX_PULL_RADIUS));
  const scaleY = 1 + pullProgress * 0.05; // Radial stretch
  const scaleX = 1 - pullProgress * 0.025; // Radial compression

  const finalTranslateX = currentSwayX + currentElasticX;
  const finalTranslateY = currentSwayY + currentElasticY;
  const finalRotation = currentRotateY + currentRotation;
  const extraTiltX = currentElasticY * 0.05;

  // Apply 2D/3D Transform to ID Card Wrapper
  if (idCardWrapper) {
    idCardWrapper.style.transform = `translate3d(${finalTranslateX}px, ${finalTranslateY}px, 0) rotateX(${currentRotateX + extraTiltX}deg) rotateY(${finalRotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
  }

  // D. Lanyard Attachment Pivot & Stretch Integration (Follows Card Vector)
  const isMobile = window.innerWidth <= 768;
  const baseStrapHeight = isMobile ? 99 : 180;
  const effX = currentElasticX;
  const effY = baseStrapHeight + Math.max(-20, currentElasticY * 0.85);

  const lanyardStretchedLength = Math.hypot(effX, effY);
  const lanyardAngleDeg = Math.atan2(effX, effY) * (180 / Math.PI);

  if (lanyardAssembly) {
    const swayOffset = currentSwayX * 0.45 + (isMobile ? currentElasticX * 0.45 : 0);
    lanyardAssembly.style.transform = `translateX(calc(-50% + ${swayOffset}px)) rotate(${lanyardAngleDeg * 0.45 + finalRotation * 0.2}deg)`;
  }

  if (lanyardStrap) {
    lanyardStrap.style.height = `${lanyardStretchedLength}px`;
  }

  // E. Dynamic Bio Drawer Reveal During Vertical/Diagonal Pull
  if (expandedDrawer) {
    const expandProgress = Math.min(1, Math.max(0, currentElasticY / 90));
    expandedDrawer.style.maxHeight = `${expandProgress * 230}px`;
    expandedDrawer.style.opacity = `${expandProgress}`;
    expandedDrawer.style.marginTop = `${expandProgress * 12}px`;
  }

  // F. Dynamic Glare Reflection Update
  currentReflectionX += (targetReflectionX - currentReflectionX) * 0.08;
  currentReflectionY += (targetReflectionY - currentReflectionY) * 0.08;

  if (cardReflection) {
    cardReflection.style.background = `radial-gradient(circle at ${currentReflectionX}% ${currentReflectionY}%, rgba(255, 255, 255, ${0.28 + pullProgress * 0.15}) 0%, rgba(255, 255, 255, 0) 65%)`;
  }

  requestAnimationFrame(physicsLoop);
}

window.addEventListener('DOMContentLoaded', () => {
  setupPointerDragEvents();
  setupMobileMenu();
  requestAnimationFrame(physicsLoop);
});
