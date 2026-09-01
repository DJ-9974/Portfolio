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

// Zero-padded frame URL generator (/frames/ezgif-frame-001.jpg ... /frames/ezgif-frame-300.jpg)
function getFrameUrl(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `/frames/ezgif-frame-${paddedIndex}.jpg`;
}

// Preload frames into memory array
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);

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

// Handle Canvas Resize & DevicePixelRatio
function resizeCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  render(true); // force redraw on resize
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw Image maintaining aspect ratio ("contain") & calculate dynamic overlay position over Gemini sparkle
function drawImageContain(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Contain fit scale factor
  const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);

  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;

  const x = (canvasWidth - drawWidth) / 2;
  const y = (canvasHeight - drawHeight) / 2;

  // Fill canvas background with seamless left-navy to right-magenta linear gradient
  const sideGrad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
  sideGrad.addColorStop(0, '#030a17');
  sideGrad.addColorStop(0.25, '#06152e');
  sideGrad.addColorStop(0.5, '#050b18');
  sideGrad.addColorStop(0.75, '#1a0822');
  sideGrad.addColorStop(1, '#26092d');

  ctx.fillStyle = sideGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.drawImage(img, x, y, drawWidth, drawHeight);

  // Soft edge feathering on left & right borders of the rendered frame image to eliminate hard boundaries
  if (x > 2) {
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

  // Position SCROLL TO EXPLORE overlay precisely over the bottom-right Gemini sparkle icon
  positionScrollOverlay(x, y, drawWidth, drawHeight);
}

// Dynamically align #scroll-explore over the embedded Gemini sparkle icon in the rendered frame
function positionScrollOverlay(x, y, drawWidth, drawHeight) {
  const scrollExploreElem = document.getElementById('scroll-explore');
  if (!scrollExploreElem) return;

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
      isActive = (href === '/' || href === '/index.html' || target === '#hero');
    } else if (currentActiveId === 'about') {
      isActive = (target === '#about');
    } else if (currentActiveId === 'projects-teaser' || currentActiveId === 'projects') {
      isActive = (href === '/projects.html' || target === '#projects-teaser' || target === '#projects');
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
}

// Start image preloading, events, & rendering loop
preloadFrames();
setupNavEvents();
requestAnimationFrame(renderLoop);
