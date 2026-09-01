import Lenis from 'lenis';

// Initialize Lenis Smooth Scroll on Projects Page
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

// Centralized Projects Data Architecture
const caseStudies = [
  {
    id: "dermtrack",
    title: "DERMTRACK",
    subtitle: "AI Skin Health Monitoring",
    category: "AI / ML • COMPUTER VISION",
    sysTag: "SYS_PREVIEW // PROJECT_01",
    arch: "CNN + LSTM / RNN",
    status: "CASE STUDY AVAILABLE",
    caseStudyRoute: "/projects/dermtrack.html",
    accent: "cyan",
    gradientClass: "dermtrack-gradient",
    flowHtml: `
      <div class="flow-pill">IMAGE</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">MOBILENETV2</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">FEATURES</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">LSTM / RNN</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill cyan-glow">PROGRESSION</div>
    `
  },
  {
    id: "solarpro",
    title: "SOLARPRO",
    subtitle: "Smart Solar Tracking",
    category: "HARDWARE • IOT • WEB MONITORING",
    sysTag: "SYS_PREVIEW // PROJECT_02",
    arch: "Arduino + LDR + Servo",
    status: "CASE STUDY AVAILABLE",
    caseStudyRoute: "/projects/solarpro.html",
    accent: "amber",
    gradientClass: "solarpro-gradient",
    flowHtml: `
      <div class="flow-pill amber-glow">SUN</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">LDR</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">ARDUINO</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">SERVO</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">SOLAR PANEL</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill amber-glow">ENERGY DATA</div>
    `
  },
  {
    id: "crisis-response",
    title: "CRISIS RESPONSE",
    subtitle: "Disaster Response Management",
    category: "WEB DEV • FULL-STACK • SYSTEM DESIGN",
    sysTag: "SYS_PREVIEW // PROJECT_03",
    arch: "HTML5 / CSS3 Portal",
    status: "CASE STUDY AVAILABLE",
    caseStudyRoute: "/projects/crisis-response.html",
    accent: "red",
    gradientClass: "disaster-gradient",
    flowHtml: `
      <div class="flow-pill red-glow">REPORT + VOLUNTEER + EMERGENCY + INFO</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill red-glow">CRISIS RESPONSE</div>
    `
  },
  {
    id: "sdn-engine",
    title: "SDN ENGINE",
    subtitle: "Software-Defined Traffic Control",
    category: "NETWORKING • SYSTEMS ENGINEERING",
    sysTag: "SYS_PREVIEW // PROJECT_04",
    arch: "Ryu + OpenFlow + Mininet",
    status: "BENCHMARKED PROTOTYPE",
    caseStudyRoute: "/projects.html",
    accent: "purple",
    gradientClass: "sdn-gradient",
    flowHtml: `
      <div class="flow-pill">INGRESS PACKET</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">RYU CONTROLLER</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill">OPENFLOW</div>
      <span class="flow-arr">➔</span>
      <div class="flow-pill purple-glow">DYNAMIC REROUTE</div>
    `
  }
];

let activeProjectIndex = 0;
let isMouseHoveringAnyRow = false;
let transitionTimeout = null;

// Dynamic Preview Monitor Update with Smooth Crossfade
function activateProjectPreview(index, targetRow) {
  if (index === activeProjectIndex && targetRow && targetRow.classList.contains('active-row')) return;
  activeProjectIndex = index;
  const data = caseStudies[index];
  if (!data) return;

  const projectRows = document.querySelectorAll('.editorial-row-card');
  projectRows.forEach(r => r.classList.remove('active-row'));
  if (targetRow) targetRow.classList.add('active-row');

  const wrapper = document.getElementById('preview-content-wrapper');
  const card = document.getElementById('preview-monitor-card');

  if (wrapper) wrapper.classList.add('transitioning');

  if (transitionTimeout) clearTimeout(transitionTimeout);

  transitionTimeout = setTimeout(() => {
    const sysTag = document.getElementById('monitor-sys-tag');
    const category = document.getElementById('preview-category');
    const title = document.getElementById('preview-title');
    const subtitle = document.getElementById('preview-subtitle');
    const flowContainer = document.getElementById('visual-flow-container');
    const arch = document.getElementById('spec-arch');
    const status = document.getElementById('spec-status');
    const caseBtn = document.getElementById('preview-case-btn');

    if (sysTag) sysTag.textContent = data.sysTag;
    if (category) category.textContent = data.category;
    if (title) title.textContent = data.title;
    if (subtitle) subtitle.textContent = data.subtitle;
    if (flowContainer) flowContainer.innerHTML = data.flowHtml;
    if (arch) arch.textContent = data.arch;
    if (status) status.textContent = data.status;
    if (caseBtn) caseBtn.setAttribute('href', data.caseStudyRoute);

    if (card) {
      card.className = `preview-monitor-card glass-card ${data.accent}-border`;
    }

    if (wrapper) wrapper.classList.remove('transitioning');
  }, 140);
}

// Automatic Viewport-Center IntersectionObserver on Scroll
function updateActiveRowFromScroll() {
  if (isMouseHoveringAnyRow) return;

  const projectRows = Array.from(document.querySelectorAll('.editorial-row-card'))
    .filter(row => row.style.display !== 'none');

  if (projectRows.length === 0) return;

  const viewportCenterY = window.innerHeight * 0.45;
  let closestRow = null;
  let minDistance = Infinity;

  projectRows.forEach(row => {
    const rect = row.getBoundingClientRect();
    const rowCenterY = rect.top + rect.height / 2;
    const distance = Math.abs(rowCenterY - viewportCenterY);

    if (distance < minDistance) {
      minDistance = distance;
      closestRow = row;
    }
  });

  if (closestRow) {
    const index = parseInt(closestRow.getAttribute('data-index'), 10);
    if (index !== activeProjectIndex) {
      activateProjectPreview(index, closestRow);
    }
  }
}

// Category Filtering Engine
function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-pill');
  const projectRows = document.querySelectorAll('.editorial-row-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      projectRows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (filterCategory === 'all' || rowCategory === filterCategory) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });

      // Recalculate scroll center active row after filter change
      setTimeout(updateActiveRowFromScroll, 50);
    });
  });
}

// Interactive Row Mouse, Keyboard & Touch Events
function setupRowEvents() {
  const listContainer = document.getElementById('editorial-rows-list');
  const projectRows = document.querySelectorAll('.editorial-row-card');

  if (listContainer) {
    listContainer.addEventListener('mouseenter', () => {
      isMouseHoveringAnyRow = true;
    });
    listContainer.addEventListener('mouseleave', () => {
      isMouseHoveringAnyRow = false;
      updateActiveRowFromScroll();
    });
  }

  projectRows.forEach((row) => {
    // Hover
    row.addEventListener('mouseenter', () => {
      isMouseHoveringAnyRow = true;
      const index = parseInt(row.getAttribute('data-index'), 10);
      activateProjectPreview(index, row);
    });

    // Keyboard Focus
    row.addEventListener('focusin', () => {
      const index = parseInt(row.getAttribute('data-index'), 10);
      activateProjectPreview(index, row);
    });

    // Touch / Mobile Tap
    row.addEventListener('click', (e) => {
      if (e.target.closest('.row-case-btn')) return;
      const index = parseInt(row.getAttribute('data-index'), 10);
      activateProjectPreview(index, row);
    });
  });

  // Attach window & Lenis scroll observers
  window.addEventListener('scroll', updateActiveRowFromScroll, { passive: true });
  lenis.on('scroll', updateActiveRowFromScroll);

  // Initial check
  updateActiveRowFromScroll();
}

window.addEventListener('DOMContentLoaded', () => {
  setupCategoryFilters();
  setupRowEvents();
});
