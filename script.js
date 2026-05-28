/* ── WealthOS Landing Page ──────────────────────────────────── */

/* ─── Navbar scroll effect ──────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Mobile hamburger ──────────────────────────────────────── */
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ─── Scroll reveal ─────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-up').forEach(el => {
  revealObserver.observe(el);
});

/* ─── Animated number counters ──────────────────────────────── */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ─── Mock dashboard value ticker ───────────────────────────── */
const mockValue = document.getElementById('mock-value');
if (mockValue) {
  const base = 4823190;
  const values = [
    '$4,823,190', '$4,831,440', '$4,818,720', '$4,842,580',
    '$4,851,210', '$4,838,900', '$4,860,050', '$4,847,330'
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % values.length;
    mockValue.textContent = values[idx];
  }, 2800);
}

/* ─── Particle canvas background ───────────────────────────── */
const canvas  = document.getElementById('hero-canvas');
const ctx     = canvas.getContext('2d');
let particles = [];
let animId;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  const bvx = (Math.random() - 0.5) * 0.18;
  const bvy = (Math.random() - 0.5) * 0.18;
  return {
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.2 + 0.3,
    vx:    bvx,
    vy:    bvy,
    baseVx: bvx,
    baseVy: bvy,
    alpha:  Math.random() * 0.35 + 0.08,
    twinkle:      Math.random() * Math.PI * 2,
    twinkleSpeed: 0.008 + Math.random() * 0.018,
    color: Math.random() > 0.6 ? '99,102,241' : '139,92,246',
  };
}

function initParticles() {
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 90);
  particles = Array.from({ length: count }, createParticle);
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mdx = (mouseX - canvas.width  / 2) / canvas.width;
  const mdy = (mouseY - canvas.height / 2) / canvas.height;

  particles.forEach(p => {
    /* Twinkle */
    p.twinkle += p.twinkleSpeed;
    const a = p.alpha * (0.55 + 0.45 * Math.sin(p.twinkle));

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color},${a})`;
    ctx.fill();

    /* Mouse parallax — smoothly nudge velocity toward cursor-offset target */
    const tvx = p.baseVx + mdx * 0.22;
    const tvy = p.baseVy + mdy * 0.22;
    p.vx += (tvx - p.vx) * 0.025;
    p.vy += (tvy - p.vy) * 0.025;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -5)              p.x = canvas.width + 5;
    if (p.x > canvas.width + 5)  p.x = -5;
    if (p.y < -5)              p.y = canvas.height + 5;
    if (p.y > canvas.height + 5) p.y = -5;
  });

  /* Subtle connecting lines between close particles */
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(99,102,241,${0.07 * (1 - dist / 90)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  animId = requestAnimationFrame(drawParticles);
}

resize();
initParticles();
drawParticles();

window.addEventListener('resize', () => {
  cancelAnimationFrame(animId);
  resize();
  initParticles();
  drawParticles();
}, { passive: true });

/* Pause particles when tab is not visible to save battery */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animId);
  } else {
    drawParticles();
  }
});

/* ─── Smooth scroll for anchor links ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── Tilt effect on mockup ─────────────────────────────────── */
const mockup = document.querySelector('.mockup');
if (mockup && window.innerWidth > 768) {
  const wrapper = document.querySelector('.hero__mockup');
  wrapper.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rx   = -dy * 4;
    const ry   = dx * 4 - 4;
    mockup.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  wrapper.addEventListener('mouseleave', () => {
    mockup.style.transform = 'perspective(1200px) rotateY(-4deg) rotateX(2deg)';
  });
}
