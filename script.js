// ===== VIRUS WEB (background layer) =====
const webCanvas = document.createElement('canvas');
webCanvas.id = 'virusweb';
webCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
document.body.insertBefore(webCanvas, document.body.firstChild);
const wctx = webCanvas.getContext('2d');

webCanvas.width = window.innerWidth;
webCanvas.height = window.innerHeight;

const NODE_COUNT = 42;
const nodes = Array.from({ length: NODE_COUNT }, () => ({
  x: Math.random() * webCanvas.width,
  y: Math.random() * webCanvas.height,
  vx: (Math.random() - 0.5) * 0.3,
  vy: (Math.random() - 0.5) * 0.3,
  r: Math.random() * 2.5 + 1,
  pulse: Math.random() * Math.PI * 2,
}));

const LINK_DIST = 200;

function drawWeb() {
  wctx.clearRect(0, 0, webCanvas.width, webCanvas.height);

  // Update node positions
  for (const n of nodes) {
    n.pulse += 0.02;
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > webCanvas.width)  n.vx *= -1;
    if (n.y < 0 || n.y > webCanvas.height) n.vy *= -1;
  }

  // Draw edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINK_DIST) {
        const alpha = (1 - dist / LINK_DIST) * 0.12;
        wctx.beginPath();
        wctx.moveTo(nodes[i].x, nodes[i].y);
        wctx.lineTo(nodes[j].x, nodes[j].y);
        wctx.strokeStyle = `rgba(200,0,0,${alpha})`;
        wctx.lineWidth = 0.6;
        wctx.stroke();
      }
    }
  }

  // Draw nodes
  for (const n of nodes) {
    const glow = (Math.sin(n.pulse) + 1) / 2; // 0–1
    const alpha = 0.08 + glow * 0.18;
    const radius = n.r + glow * 1.5;

    // Outer glow ring
    const grad = wctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 5);
    grad.addColorStop(0, `rgba(255,0,0,${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    wctx.beginPath();
    wctx.arc(n.x, n.y, radius * 5, 0, Math.PI * 2);
    wctx.fillStyle = grad;
    wctx.fill();

    // Node dot
    wctx.beginPath();
    wctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
    wctx.fillStyle = `rgba(255,60,60,${0.2 + glow * 0.3})`;
    wctx.fill();
  }

  requestAnimationFrame(drawWeb);
}

drawWeb();

// ===== MATRIX RAIN =====
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cols = Math.floor(canvas.width / 16);
const drops = Array(cols).fill(1);
const chars = 'VIRUS01☠⚠INFECTED<>/\\|{}[]!?#%@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function drawMatrix() {
  ctx.fillStyle = 'rgba(5, 0, 5, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '14px Courier New';

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillStyle = Math.random() > 0.95 ? '#ff6666' : 'rgba(180,0,0,0.8)';
    ctx.fillText(char, i * 16, drops[i] * 16);
    if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}

setInterval(drawMatrix, 60);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  webCanvas.width = window.innerWidth;
  webCanvas.height = window.innerHeight;
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      if (target >= 1000000000) {
        el.textContent = (current / 1000000000).toFixed(1) + 'B+';
      } else if (target >= 1000) {
        el.textContent = Math.floor(current).toLocaleString() + '+';
      } else {
        el.textContent = Math.floor(current) + '+';
      }
    }, 16);
  });
}

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

// ===== NAV LOGO FLICKER =====
const logo = document.querySelector('.nav-logo');
if (logo) {
  setInterval(() => {
    if (Math.random() > 0.97) {
      logo.style.opacity = '0.2';
      setTimeout(() => { logo.style.opacity = '1'; }, 80);
    }
  }, 200);
}

// ===== PAGE LOAD RED FLASH =====
const flashEl = document.createElement('div');
flashEl.style.cssText = 'position:fixed;inset:0;background:rgba(255,0,0,0.15);z-index:9998;pointer-events:none;';
document.body.appendChild(flashEl);
const flashStyle = document.createElement('style');
flashStyle.textContent = '@keyframes flash-out { from { opacity:1; } to { opacity:0; } }';
flashEl.style.animation = 'flash-out 0.6s ease forwards';
document.head.appendChild(flashStyle);
setTimeout(() => flashEl.remove(), 700);

// ===== LIVE INFECTION COUNTERS (per card) =====
function startCardCounters() {
  const counters = document.querySelectorAll('.ic-num[data-base][data-rate]');
  counters.forEach(el => {
    let val = parseFloat(el.dataset.base);
    const rate = parseFloat(el.dataset.rate); // infections per second

    function fmt(n) {
      return Math.floor(n).toLocaleString('en-US');
    }

    el.textContent = fmt(val);

    // tick every ~100ms so numbers visibly climb but don't flash too fast
    const tickMs = 100;
    const increment = rate * (tickMs / 1000);

    setInterval(() => {
      val += increment;
      el.textContent = fmt(val);
    }, tickMs);
  });
}

startCardCounters();

// ===== GLOBAL COUNTER (index.html only) =====
const gcEl = document.getElementById('globalCounter');
const gcFill = document.getElementById('gcFill');

if (gcEl) {
  // ~1 billion infections per year = 31.69/sec
  const RATE_PER_SEC = 31.69;

  // Estimate infections so far this year up to today (May 26 = day 146)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const secondsElapsed = (now - startOfYear) / 1000;
  let gcVal = Math.floor(secondsElapsed * RATE_PER_SEC);

  function fmtBig(n) {
    return Math.floor(n).toLocaleString('en-US');
  }

  gcEl.textContent = fmtBig(gcVal);

  // Update every 100ms for visible live feel
  const gcTickMs = 100;
  const gcIncrement = RATE_PER_SEC * (gcTickMs / 1000);

  // Progress bar: out of 1 billion
  const YEARLY_TARGET = 1_000_000_000;
  function updateBar() {
    const pct = Math.min((gcVal / YEARLY_TARGET) * 100, 100);
    if (gcFill) gcFill.style.width = pct + '%';
  }

  updateBar();

  setInterval(() => {
    gcVal += gcIncrement;
    gcEl.textContent = fmtBig(gcVal);
    updateBar();
  }, gcTickMs);
}
