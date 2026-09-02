import Lenis from 'lenis';

const TOTAL_FRAMES = 300;
const frames = [];
let loadedCount = 0;

const canvas = document.getElementById('sequence-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');

let targetFrame = 0;
let currentFrame = 0;
let lastDrawnFrame = -1;

// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.5,
});

// Lenis RAF animation loop
function lenisRaf(time) {
  lenis.raf(time);
  requestAnimationFrame(lenisRaf);
}
requestAnimationFrame(lenisRaf);

let currentLoadedFolderIsMobile = null;

// Viewport-aware frame URL generator (/mobile frames/ezgif-frame-001.jpg vs /frames/ezgif-frame-001.jpg)
function getFrameUrl(index, isMobile) {
  const paddedIndex = String(index).padStart(3, '0');
  const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : (import.meta.env.BASE_URL + '/');
  const folder = isMobile ? 'mobile%20frames' : 'frames';
  return `${baseUrl}${folder}/ezgif-frame-${paddedIndex}.jpg`;
}

// Preload frames into memory array
function preloadFrames() {
  const isMobile = window.innerWidth <= 640;
  if (currentLoadedFolderIsMobile === isMobile && frames.length === TOTAL_FRAMES) return;

  currentLoadedFolderIsMobile = isMobile;
  frames.length = 0;
  loadedCount = 0;

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameUrl(i, isMobile);

    img.onload = () => {
      loadedCount++;
      const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
      if (progressText) progressText.textContent = `${percent}%`;
      if (progressFill) progressFill.style.width = `${percent}%`;

      // Render initial frame as soon as frame 1 finishes loading
      if (i === 1 && lastDrawnFrame === -1) {
        render();
      }

      if (loadedCount === TOTAL_FRAMES) {
        onAllLoaded();
      }
    };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        onAllLoaded();
      }
    };

    frames.push(img);
  }
}

function onAllLoaded() {
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 250);
  }
}

// Handle Canvas Resize & DevicePixelRatio (Mobile-aware rendering)
function resizeCanvas() {
  const isMobile = window.innerWidth <= 640;
  const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = isMobile ? 'medium' : 'high';
  
  if (currentLoadedFolderIsMobile !== null && currentLoadedFolderIsMobile !== isMobile) {
    preloadFrames();
  } else {
    render(true); // force redraw on resize
  }
}

window.addEventListener('resize', resizeCanvas);
preloadFrames();
resizeCanvas();

// Draw Image maintaining aspect ratio & calculate dynamic overlay position
function drawImageContain(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  const isMobile = window.innerWidth <= 640;

  let scale, drawWidth, drawHeight, x, y;

  if (isMobile) {
    // Dedicated mobile 9:16 portrait frame composition: full hero portrait visual anchor
    scale = Math.max(canvasWidth / imgWidth, (canvasHeight / imgHeight) * 0.70);
    drawWidth = imgWidth * scale;
    drawHeight = imgHeight * scale;
    x = (canvasWidth - drawWidth) / 2;
    y = 0; // Starts right underneath fixed top header
  } else {
    // Desktop contain fit using desktop 300-frame artwork
    scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    drawWidth = imgWidth * scale;
    drawHeight = imgHeight * scale;
    x = (canvasWidth - drawWidth) / 2;
    y = (canvasHeight - drawHeight) / 2;
  }

  // Fill canvas background with seamless gradient
  const sideGrad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  sideGrad.addColorStop(0, '#030a17');
  sideGrad.addColorStop(0.25, '#06152e');
  sideGrad.addColorStop(0.5, '#050b18');
  sideGrad.addColorStop(0.75, '#1a0822');
  sideGrad.addColorStop(1, '#26092d');

  ctx.fillStyle = sideGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.drawImage(img, x, y, drawWidth, drawHeight);

  if (isMobile) {
    // Soft bottom gradient feathering so suit jacket fades seamlessly into deep dark background
    const featherHeight = drawHeight * 0.32;
    const bottomFeather = ctx.createLinearGradient(0, y + drawHeight - featherHeight, 0, y + drawHeight);
    bottomFeather.addColorStop(0, 'rgba(5, 11, 24, 0)');
    bottomFeather.addColorStop(0.6, 'rgba(5, 11, 24, 0.85)');
    bottomFeather.addColorStop(1, '#050b18');
    ctx.fillStyle = bottomFeather;
    ctx.fillRect(x - 2, y + drawHeight - featherHeight, drawWidth + 4, featherHeight + 10);
  } else if (x > 2) {
    // Soft edge feathering on left & right borders for desktop
    const featherWidth = Math.min(60 * scale, x);
    
    // Left edge feathering (blends into deep navy)
    const leftFeather = ctx.createLinearGradient(x, 0, x + featherWidth, 0);
    leftFeather.addColorStop(0, 'rgba(6, 21, 46, 0.7)');
    leftFeather.addColorStop(1, 'rgba(6, 21, 46, 0)');
    ctx.fillStyle = leftFeather;
    ctx.fillRect(x, y, featherWidth, drawHeight);

    // Right edge feathering (blends into deep magenta)
    const rightFeather = ctx.createLinearGradient(x + drawWidth - featherWidth, 0, x + drawWidth, 0);
    rightFeather.addColorStop(0, 'rgba(38, 9, 45, 0)');
    rightFeather.addColorStop(1, 'rgba(38, 9, 45, 0.7)');
    ctx.fillStyle = rightFeather;
    ctx.fillRect(x + drawWidth - featherWidth, y, featherWidth, drawHeight);
  }

  // Position SCROLL TO EXPLORE overlay
  positionScrollOverlay(x, y, drawWidth, drawHeight);
}

// Dynamically align #scroll-explore over the embedded Gemini sparkle icon in the rendered frame
function positionScrollOverlay(x, y, drawWidth, drawHeight) {
  const scrollExploreElem = document.getElementById('scroll-explore');
  if (!scrollExploreElem) return;

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    scrollExploreElem.style.right = '';
    scrollExploreElem.style.bottom = '';
    return;
  }

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate actual rendered canvas image bounds in CSS pixels
  const cssDrawRight = (x + drawWidth) / dpr;
  const cssDrawBottom = (y + drawHeight) / dpr;

  const offsetRight = Math.max(20, viewportWidth - cssDrawRight + 24);
  const offsetBottom = Math.max(20, viewportHeight - cssDrawBottom + 24);

  scrollExploreElem.style.right = `${Math.round(offsetRight)}px`;
  scrollExploreElem.style.bottom = `${Math.round(offsetBottom)}px`;
}

// Compute scroll target frame based on window.scrollY independent of Lenis events
function updateTargetFrameFromScroll() {
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));
  targetFrame = scrollProgress * (TOTAL_FRAMES - 1);
}

// Render function: draws target frame if changed or forced
function render(force = false) {
  const frameToDraw = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrame)));
  if (force || frameToDraw !== lastDrawnFrame) {
    const img = frames[frameToDraw];
    if (img && img.complete && img.naturalWidth > 0) {
      drawImageContain(img);
      lastDrawnFrame = frameToDraw;
    }
  }
}

// Section visibility & Floating Nav active pill update
function updateSectionVisibility() {
  const sections = document.querySelectorAll('.content-section');
  const navPills = document.querySelectorAll('.nav-pill');
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

  // 1. Reveal visible sections as user scrolls down
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
    if (isVisible) {
      section.classList.add('visible');
    }
  });

  // 2. Determine active section based on scroll position & viewport bounds
  let currentActiveId = 'hero';

  // If near the top of the page (or within hero viewport), force 'hero' (HOME)
  if (scrollTop <= 150) {
    currentActiveId = 'hero';
  } else {
    // Check which section is occupying the middle of the viewport
    const viewportMiddle = window.innerHeight * 0.45;
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
        currentActiveId = section.id;
      }
    });
  }

  // 3. Update active state on navigation pills
  navPills.forEach((pill) => {
    const target = pill.getAttribute('data-target');
    const href = pill.getAttribute('href');

    let isActive = false;

    if (currentActiveId === 'hero' || currentActiveId === 'what-i-build') {
      isActive = (href === '/' || href === '/index.html' || href === './' || href === 'index.html' || target === '#hero');
    } else if (currentActiveId === 'about') {
      isActive = (target === '#about');
    } else if (currentActiveId === 'projects-teaser' || currentActiveId === 'projects') {
      isActive = (href === '/projects.html' || href === 'projects.html' || href === './projects.html' || target === '#projects-teaser' || target === '#projects');
    } else if (currentActiveId === 'contact') {
      isActive = (target === '#contact');
    }

    if (isActive) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Toggle Scroll Explore Indicator overlay fade out on scroll
  const scrollExploreElem = document.getElementById('scroll-explore');
  if (scrollExploreElem) {
    if (scrollTop > 80) {
      scrollExploreElem.classList.add('scrolled');
    } else {
      scrollExploreElem.classList.remove('scrolled');
    }
  }
}

// Smooth canvas rendering loop with lerp and continuous window scroll tracking
function renderLoop() {
  updateTargetFrameFromScroll();

  // Lerp towards target frame for fluid smooth momentum
  const diff = targetFrame - currentFrame;
  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * 0.15;
  } else {
    currentFrame = targetFrame;
  }

  render();
  updateSectionVisibility();

  requestAnimationFrame(renderLoop);
}

// Setup Interactive Navigation Button Listeners
function setupNavEvents() {
  const scrollButtons = document.querySelectorAll('[data-target]');
  scrollButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSelector = btn.getAttribute('data-target');
      const targetElem = document.querySelector(targetSelector);
      if (targetElem) {
        lenis.scrollTo(targetElem, { duration: 1.5 });
      }
    });
  });
  // Mobile Menu Toggle Event Binding
  setupMobileMenu();
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('nav-open')) {
      closeMenu();
    }
  });

  navMenu.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      closeMenu();
    });
  });
}

// Start image preloading, events, & rendering loop
preloadFrames();
setupNavEvents();
requestAnimationFrame(renderLoop);
