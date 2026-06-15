/* ── WealthOS Landing Page ──────────────────────────────────── */

/* ─── Navbar scroll effect ──────────────────────────────────── */
const nav = document.getElementById('nav');
const navProgressBar = document.getElementById('nav-progress-bar');

function updateNavOnScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 20);

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  navProgressBar.style.width = progress + '%';
}

window.addEventListener('scroll', updateNavOnScroll, { passive: true });
updateNavOnScroll();

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
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.setProperty('--i', i);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible', 'is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal, .reveal-up').forEach(el => {
  revealObserver.observe(el);
});

/* ─── Asset module reveal (slide-in + chart draw, ladder effect) ─ */
(function initAssetModules() {
  const cards = document.querySelectorAll('.assets-stack .carousel-slide');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chartLengths = new Map();

  cards.forEach(card => {
    const polyline = card.querySelector('.slide__chart polyline');
    if (!polyline) return;
    const length = polyline.getTotalLength();
    chartLengths.set(polyline, length);
    polyline.style.strokeDasharray = length;
    polyline.style.strokeDashoffset = prefersReducedMotion ? 0 : length;
  });

  if (prefersReducedMotion) {
    cards.forEach(card => card.classList.add('is-visible'));
    return;
  }

  const assetObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target;
      const polyline = card.querySelector('.slide__chart polyline');

      if (entry.isIntersecting) {
        card.classList.add('is-visible');
        if (polyline) {
          requestAnimationFrame(() => { polyline.style.strokeDashoffset = '0'; });
        }
      } else {
        card.classList.remove('is-visible');
        if (polyline) {
          polyline.style.strokeDashoffset = chartLengths.get(polyline);
        }
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(card => assetObserver.observe(card));
})();

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

/* ─── Ticker Tunnel (scroll-pinned) ─────────────────────────── */
/**
 * Ticker shape: { symbol, category, price, changePct, direction }
 * - price:      pre-formatted display string (MXN price, FX rate or yield %)
 * - changePct:  unsigned percent change as a number
 * - direction:  'up' | 'down'
 *
 * Seed data for the tunnel columns. Swap this array for live values
 * from the Twelve Data + Banxico backend once it's wired up.
 */
const TUNNEL_TICKERS = [
  { symbol: 'FUNO11',    category: 'FIBRA',  price: '$38.42',     changePct: 1.24, direction: 'up' },
  { symbol: 'FIBRAMQ',   category: 'FIBRA',  price: '$29.18',     changePct: 0.76, direction: 'up' },
  { symbol: 'NAFTRAC',   category: 'ETF',    price: '$138.55',    changePct: 0.34, direction: 'down' },
  { symbol: 'AMXL',      category: 'ACCIÓN', price: '$17.85',     changePct: 0.62, direction: 'down' },
  { symbol: 'GFNORTE',   category: 'ACCIÓN', price: '$159.30',    changePct: 0.88, direction: 'up' },
  { symbol: 'WALMEX',    category: 'ACCIÓN', price: '$68.91',     changePct: 0.41, direction: 'up' },
  { symbol: 'CEMEXCPO',  category: 'ACCIÓN', price: '$14.62',     changePct: 1.02, direction: 'up' },
  { symbol: 'GMEXICOB',  category: 'ACCIÓN', price: '$82.17',     changePct: 0.29, direction: 'down' },
  { symbol: 'KIMBERA',   category: 'ACCIÓN', price: '$26.04',     changePct: 0.55, direction: 'up' },
  { symbol: 'CETES 28D', category: 'BONO',   price: '10.42%',     changePct: 0.03, direction: 'down' },
  { symbol: 'UDIBONO',   category: 'BONO',   price: '4.12%',      changePct: 0.05, direction: 'up' },
  { symbol: 'BONOS 10A', category: 'BONO',   price: '9.87%',      changePct: 0.02, direction: 'up' },
  { symbol: 'BTC',       category: 'CRIPTO', price: '$1,824,650', changePct: 2.15, direction: 'up' },
  { symbol: 'ETH',       category: 'CRIPTO', price: '$62,480',    changePct: 1.48, direction: 'down' },
  { symbol: 'AFORE PPR', category: 'FONDO',  price: '$7.94',      changePct: 0.33, direction: 'up' },
  { symbol: 'USD/MXN',   category: 'FX',     price: '$18.27',     changePct: 0.18, direction: 'down' },
];

function formatTunnelPrice(ticker) {
  return ticker.price;
}

function formatTunnelChange(ticker) {
  const arrow = ticker.direction === 'up' ? '▲' : '▼';
  return `${arrow} ${ticker.changePct.toFixed(2)}%`;
}

function renderTunnelCard(ticker) {
  return `
    <div class="tunnel-card">
      <div class="tunnel-card__top">
        <span class="tunnel-card__symbol">${ticker.symbol}</span>
      </div>
      <div class="tunnel-card__bottom">
        <span class="tunnel-card__price">${formatTunnelPrice(ticker)}</span>
        <span class="tunnel-card__change tunnel-card__change--${ticker.direction}">${formatTunnelChange(ticker)}</span>
      </div>
    </div>`;
}

/* Round-robin the ticker list across `count` columns */
function splitIntoColumns(tickers, count) {
  const columns = Array.from({ length: count }, () => []);
  tickers.forEach((ticker, i) => columns[i % count].push(ticker));
  return columns;
}

/* Fill a column with at least one full set, then repeat until it
   exceeds minHeight so the parallax travel never runs out of cards. */
function fillTunnelColumn(el, tickers, minHeight) {
  const set = tickers.map(renderTunnelCard).join('');
  el.innerHTML = set;
  let guard = 0;
  while (el.scrollHeight < minHeight && guard < 300) {
    el.insertAdjacentHTML('beforeend', set);
    guard++;
  }
}

/* Re-roll a card's % change to a fresh random up/down value */
function refreshTunnelChanges(columns) {
  columns.forEach(col => {
    col.querySelectorAll('.tunnel-card__change').forEach(el => {
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      const changePct = Math.random() * 2.5;
      el.textContent = formatTunnelChange({ direction, changePct });
      el.classList.remove('tunnel-card__change--up', 'tunnel-card__change--down');
      el.classList.add(`tunnel-card__change--${direction}`);
    });
  });
}

(function initTickerTunnel() {
  const section = document.querySelector('.ticker-tunnel');
  if (!section) return;

  const columnEls = Array.from(section.querySelectorAll('.ticker-tunnel__column'));

  /* Pin distance, expressed in viewport-heights — tune the "tunnel" length here */
  const PIN_DISTANCE_VH = 1.3;
  const PIN_DISTANCE_VH_MOBILE = 1.0;
  const COLUMN_SPEEDS = [1.0, 1.35, 0.8, 1.5, 1.1];

  if (!window.gsap || !window.ScrollTrigger) {
    const groups = splitIntoColumns(TUNNEL_TICKERS, columnEls.length);
    columnEls.forEach((col, i) => {
      fillTunnelColumn(col.querySelector('.ticker-tunnel__column-inner'), groups[i], 0);
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function setupTunnel(columnCount, pinDistanceVh) {
    section.classList.remove('ticker-tunnel--static');

    const groups = splitIntoColumns(TUNNEL_TICKERS, columnCount);
    const pinDistance = window.innerHeight * pinDistanceVh;

    columnEls.forEach((col, i) => {
      col.style.display = i < columnCount ? '' : 'none';
    });

    const activeColumns = columnEls.slice(0, columnCount);

    /* Re-roll % change values a few times per tunnel traversal, in both
       scroll directions, so the figures feel "live" while pinned. */
    const STEPS_PER_TRAVERSAL = 24;
    let lastStep = -1;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * pinDistanceVh),
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const step = Math.floor(self.progress * STEPS_PER_TRAVERSAL);
          if (step !== lastStep) {
            lastStep = step;
            refreshTunnelChanges(activeColumns);
          }
        },
      },
    });

    activeColumns.forEach((col, i) => {
      const inner = col.querySelector('.ticker-tunnel__column-inner');
      const speed = COLUMN_SPEEDS[i % COLUMN_SPEEDS.length];
      fillTunnelColumn(inner, groups[i], window.innerHeight + pinDistance * speed + 200);
      gsap.set(inner, { y: 0 });
      tl.to(inner, { y: -(pinDistance * speed), ease: 'none', duration: 1 }, 0);
    });

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      activeColumns.forEach(col => {
        gsap.set(col.querySelector('.ticker-tunnel__column-inner'), { clearProps: 'transform' });
      });
    };
  }

  function setupStatic() {
    section.classList.add('ticker-tunnel--static');
    const groups = splitIntoColumns(TUNNEL_TICKERS, columnEls.length);
    columnEls.forEach((col, i) => {
      col.style.display = '';
      const inner = col.querySelector('.ticker-tunnel__column-inner');
      gsap.set(inner, { clearProps: 'transform' });
      fillTunnelColumn(inner, groups[i], 0);
    });

    return () => section.classList.remove('ticker-tunnel--static');
  }

  ScrollTrigger.matchMedia({
    '(prefers-reduced-motion: reduce)': setupStatic,
    '(prefers-reduced-motion: no-preference) and (min-width: 768px)':
      () => setupTunnel(5, PIN_DISTANCE_VH),
    '(prefers-reduced-motion: no-preference) and (max-width: 767px)':
      () => setupTunnel(3, PIN_DISTANCE_VH_MOBILE),
  });
})();

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
