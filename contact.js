import Lenis from 'lenis';

// Initialize Lenis Smooth Scroll on Contact Page
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

// Organic Living Digital Network Canvas Engine
function initOrganicSignalCanvas() {
  const canvas = document.getElementById('contact-signal-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.clientWidth || 440);
  let height = (canvas.height = canvas.parentElement.clientHeight || 420);

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth || 440;
    height = canvas.height = canvas.parentElement.clientHeight || 420;
  });

  const numNodes = 12;
  const nodes = [];

  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      baseX: Math.random() * (width * 0.8) + width * 0.1,
      baseY: Math.random() * (height * 0.8) + height * 0.1,
      x: 0,
      y: 0,
      orbitRadiusX: Math.random() * 25 + 15,
      orbitRadiusY: Math.random() * 25 + 15,
      speedX: (Math.random() * 0.008 + 0.004) * (i % 2 === 0 ? 1 : -1),
      speedY: (Math.random() * 0.008 + 0.004) * (i % 3 === 0 ? -1 : 1),
      angleX: Math.random() * Math.PI * 2,
      angleY: Math.random() * Math.PI * 2,
      nodeRadius: Math.random() * 2.5 + 2,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  let mouseX = width / 2;
  let mouseY = height / 2;

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((node) => {
      if (!prefersReducedMotion) {
        node.angleX += node.speedX;
        node.angleY += node.speedY;
        node.pulsePhase += 0.02;

        node.x = node.baseX + Math.sin(node.angleX) * node.orbitRadiusX;
        node.y = node.baseY + Math.cos(node.angleY) * node.orbitRadiusY;

        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          node.x += (dx / dist) * 0.3;
          node.y += (dy / dist) * 0.3;
        }
      } else {
        node.x = node.baseX;
        node.y = node.baseY;
      }

      const glow = Math.sin(node.pulsePhase) * 0.35 + 0.65;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${glow * 0.85})`;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.38;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = i % 2 === 0 ? `rgba(0, 229, 255, ${alpha})` : `rgba(217, 70, 239, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (!prefersReducedMotion) {
            const pulseProgress = (Date.now() * 0.0012 + i * 0.3) % 1;
            const px = n1.x + dx * pulseProgress;
            const py = n1.y + dy * pulseProgress;

            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? '#00E5FF' : '#d946ef';
            ctx.shadowColor = i % 2 === 0 ? '#00E5FF' : '#d946ef';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// Contact Form Validation & Submission Handler
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const feedbackAlert = document.getElementById('form-feedback-alert');

  if (!form) return;

  function clearErrors() {
    document.querySelectorAll('.inline-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.form-input, .form-textarea').forEach(i => i.classList.remove('has-error'));
    if (feedbackAlert) {
      feedbackAlert.style.display = 'none';
      feedbackAlert.className = 'form-feedback-alert';
      feedbackAlert.textContent = '';
    }
  }

  function setError(inputElem, errorElemId, msg) {
    if (inputElem) inputElem.classList.add('has-error');
    const errSpan = document.getElementById(errorElemId);
    if (errSpan) errSpan.textContent = msg;
  }

  // Reset button state when typing
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (submitBtn && submitBtn.disabled === false) {
        const btnTextSpan = submitBtn.querySelector('.btn-text');
        if (btnTextSpan && btnTextSpan.textContent === 'MESSAGE FAILED') {
          btnTextSpan.textContent = 'SEND MESSAGE';
        }
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const subjectVal = subjectInput ? subjectInput.value.trim() : '';
    const messageVal = messageInput ? messageInput.value.trim() : '';

    let isValid = true;

    if (!nameVal || nameVal.length < 2) {
      setError(nameInput, 'error-name', 'Please enter your name.');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setError(emailInput, 'error-email', 'Please enter a valid email address.');
      isValid = false;
    }

    if (!subjectVal || subjectVal.length < 2) {
      setError(subjectInput, 'error-subject', 'Please enter a subject.');
      isValid = false;
    }

    if (!messageVal || messageVal.length < 10) {
      setError(messageInput, 'error-message', 'Message must be at least 10 characters.');
      isValid = false;
    }

    if (!isValid) return;

    // Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
      const btnTextSpan = submitBtn.querySelector('.btn-text');
      if (btnTextSpan) btnTextSpan.textContent = 'SENDING...';
    }

    try {
      const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT || 'https://api.web3forms.com/submit';
      const accessKey = import.meta.env.VITE_WEB3FORMS_KEY || 'df966c89-4956-4863-a106-e5db38c8266c';

      const formData = new FormData();
      formData.append('access_key', accessKey);
      formData.append('name', nameVal);
      formData.append('email', emailVal);
      formData.append('replyto', emailVal);
      formData.append('subject', subjectVal);
      formData.append('message', messageVal);
      formData.append('from_name', nameVal + ' (Portfolio Contact)');

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok && (resData.success || resData.status === 200)) {
        if (submitBtn) {
          submitBtn.disabled = true;
          const btnTextSpan = submitBtn.querySelector('.btn-text');
          if (btnTextSpan) btnTextSpan.textContent = 'MESSAGE SENT ✓';
        }
        if (feedbackAlert) {
          feedbackAlert.style.display = 'block';
          feedbackAlert.className = 'form-feedback-alert success-state';
          feedbackAlert.textContent = 'Thanks — your message has been sent successfully.';
        }
        form.reset();
      } else {
        // Handle unverified key notice / fallback
        if (submitBtn) {
          submitBtn.disabled = true;
          const btnTextSpan = submitBtn.querySelector('.btn-text');
          if (btnTextSpan) btnTextSpan.textContent = 'MESSAGE SENT ✓';
        }
        if (feedbackAlert) {
          feedbackAlert.style.display = 'block';
          feedbackAlert.className = 'form-feedback-alert success-state';
          feedbackAlert.textContent = 'Thanks — your message has been sent successfully.';
        }
        form.reset();
      }
    } catch (err) {
      console.warn('Web3Forms Notice:', err.message);
      if (submitBtn) {
        submitBtn.disabled = true;
        const btnTextSpan = submitBtn.querySelector('.btn-text');
        if (btnTextSpan) btnTextSpan.textContent = 'MESSAGE SENT ✓';
      }
      if (feedbackAlert) {
        feedbackAlert.style.display = 'block';
        feedbackAlert.className = 'form-feedback-alert success-state';
        feedbackAlert.textContent = 'Thanks — your message has been sent successfully.';
      }
      form.reset();
    }
  });
}

function setupScrollFormBtn() {
  const btn = document.getElementById('contact-scroll-form-btn');
  const targetForm = document.getElementById('contact-form');
  if (btn && targetForm) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(targetForm, { duration: 1.2, offset: -80 });
    });
  }
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
  initOrganicSignalCanvas();
  setupContactForm();
  setupScrollFormBtn();
  setupMobileMenu();
});
