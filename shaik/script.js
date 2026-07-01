'use strict';

/* ══════════════════════════════════════════════════════════
   1. CONSTANTS & STATE
══════════════════════════════════════════════════════════ */

const STATE = {
  theme:        'dark',
  musicPlaying: false,
  giftOpened:   false,
  audioCtxUnlocked: false,
};

/* ══════════════════════════════════════════════════════════
   2. LOADER
══════════════════════════════════════════════════════════ */

function initLoader() {
  const loader   = document.getElementById('loader');
  const minDisplay = 2400;
  const start    = Date.now();

  window.addEventListener('load', () => {
    const elapsed   = Date.now() - start;
    const remaining = Math.max(0, minDisplay - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      startFloatingHearts();
    }, remaining);
  });
}

/* ══════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════════════════ */

function initCursor() {
  const glow = document.getElementById('cursor-glow');
  const dot  = document.getElementById('cursor-dot');
  if (!glow || !dot) return;

  let glowX = 0, glowY = 0, mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top  = `${mouseY}px`;
  });

  function animateCursor() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top  = `${glowY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(1.8)';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%,-50%) scale(1)';
  });
}

/* ══════════════════════════════════════════════════════════
   4. BACKGROUND CANVAS
══════════════════════════════════════════════════════════ */

function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Particles ── */
  const PARTICLE_COUNT = 110;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 10;
      this.size = Math.random() * 2.8 + 0.5;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.speedX =  (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.7 + 0.2;
      const purpleShades = [
        `rgba(180, 79, 255, ${this.opacity})`,
        `rgba(200, 100, 255, ${this.opacity})`,
        `rgba(150, 50, 230, ${this.opacity})`,
        `rgba(220, 120, 255, ${this.opacity})`,
        `rgba(160, 70, 255, ${this.opacity})`,
      ];
      this.hue  = purpleShades[Math.floor(Math.random() * purpleShades.length)];
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
    }
    update() {
      this.x     += this.speedX;
      this.y     += this.speedY;
      this.pulse += this.pulseSpeed;
      if (this.y < -10) this.reset();
    }
    draw() {
      const glow = Math.sin(this.pulse) * 0.4 + 0.6;
      ctx.save();
      ctx.globalAlpha = this.opacity * glow;
      ctx.shadowBlur  = 14 * glow;
      ctx.shadowColor = this.hue;
      ctx.fillStyle   = this.hue;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  /* ── Butterflies ── */
  const BUTTERFLY_EMOJIS = ['🦋', '💜', '✨', '🌸'];
  const BUTTERFLY_COUNT  = 8;
  const butterflies = [];

  class Butterfly {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 60;
      this.size = Math.random() * 18 + 14;
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.angle  = 0;
      this.angleSpeed = (Math.random() - 0.5) * 0.03;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.025 + 0.01;
      this.opacity = Math.random() * 0.5 + 0.35;
      this.emoji  = BUTTERFLY_EMOJIS[Math.floor(Math.random() * BUTTERFLY_EMOJIS.length)];
    }
    update() {
      this.wobble  += this.wobbleSpeed;
      this.x       += this.speedX + Math.sin(this.wobble) * 0.7;
      this.y       += this.speedY;
      this.angle   += this.angleSpeed;
      if (this.y < -80) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.font        = `${this.size}px serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline= 'middle';
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    }
  }

  for (let i = 0; i < BUTTERFLY_COUNT; i++) butterflies.push(new Butterfly());

  /* ── Shooting Stars ── */
  const shootingStars = [];

  function spawnShootingStar() {
    shootingStars.push({
      x:       Math.random() * W * 0.8,
      y:       Math.random() * H * 0.4,
      len:     Math.random() * 160 + 80,
      speed:   Math.random() * 14 + 9,
      angle:   Math.PI / 5 + (Math.random() - 0.5) * 0.3,
      opacity: 1,
      width:   Math.random() * 2.5 + 1,
    });
  }

  function scheduleShootingStar() {
    const delay = Math.random() * 3000 + 3500;
    setTimeout(() => { spawnShootingStar(); scheduleShootingStar(); }, delay);
  }
  scheduleShootingStar();

  /* ── Main Loop ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => { p.update(); p.draw(); });
    butterflies.forEach(b => { b.update(); b.draw(); });

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s  = shootingStars[i];
      const dx = Math.cos(s.angle) * s.len;
      const dy = Math.sin(s.angle) * s.len;

      const grad = ctx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
      grad.addColorStop(0,   `rgba(255, 255, 255, ${s.opacity})`);
      grad.addColorStop(0.3, `rgba(200, 100, 255, ${s.opacity * 0.8})`);
      grad.addColorStop(1,   `rgba(160, 50, 255, 0)`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = s.width;
      ctx.shadowBlur  = 14;
      ctx.shadowColor = 'rgba(180,79,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + dx, s.y + dy);
      ctx.stroke();
      ctx.restore();

      s.x       += s.speed * Math.cos(s.angle);
      s.y       += s.speed * Math.sin(s.angle);
      s.opacity -= 0.016;
      if (s.opacity <= 0) shootingStars.splice(i, 1);
    }

    requestAnimationFrame(loop);
  }

  loop();
}

/* ══════════════════════════════════════════════════════════
   5. SCROLL ANIMATIONS
══════════════════════════════════════════════════════════ */

function initScrollAnimations() {
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          sectionObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10 }
  );

  document.querySelectorAll('.fade-in-section').forEach(el => sectionObs.observe(el));

  const cardObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, delay);
          cardObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll('.awesome-card, .best-card').forEach(el => cardObs.observe(el));
}

/* ══════════════════════════════════════════════════════════
   6. FLOATING DOM HEARTS
══════════════════════════════════════════════════════════ */

const HEARTS = ['💜', '🌸', '✨', '💫', '🦋', '🌟', '💎', '👑'];

function spawnHeart() {
  const container = document.getElementById('floating-hearts');
  if (!container) return;

  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

  const x        = Math.random() * 100;
  const duration = Math.random() * 6 + 7;
  const size     = Math.random() * 0.8 + 0.7;

  heart.style.cssText = `
    left: ${x}%;
    font-size: ${size}rem;
    animation-duration: ${duration}s;
    animation-delay: 0s;
  `;

  container.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

function startFloatingHearts() {
  spawnHeart();
  setInterval(spawnHeart, 1200);
}

/* ══════════════════════════════════════════════════════════
   7. THEME TOGGLE
══════════════════════════════════════════════════════════ */

function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn) return;

  btn.addEventListener('click', () => {
    STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', STATE.theme);
    icon.textContent = STATE.theme === 'dark' ? '🌙' : '☀️';
  });
}

/* ══════════════════════════════════════════════════════════
   8. MUSIC TOGGLE  ← FIXED
══════════════════════════════════════════════════════════ */

function initMusicToggle() {
  const btn   = document.getElementById('music-toggle');
  const icon  = document.getElementById('music-icon');
  const audio = document.getElementById('bg-music');

  if (!btn || !audio) return;

  // Check if audio source is actually set
  function hasSource() {
    return audio.querySelector('source') !== null ||
           (audio.src && audio.src !== window.location.href);
  }

  btn.addEventListener('click', () => {
    if (!hasSource()) {
      showMusicToast('🎵 Make sure music/background.mp3 exists in your folder');
      return;
    }

    if (STATE.musicPlaying) {
      audio.pause();
      STATE.musicPlaying = false;
      icon.textContent   = '🎵';
    } else {
      // audio.load() ensures the browser picks up the src
      audio.load();
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            STATE.musicPlaying = true;
            icon.textContent   = '🔇';
          })
          .catch((err) => {
            console.warn('Music play failed:', err);
            showMusicToast('🎵 Tap again — browser needs a gesture to start audio');
          });
      }
    }
  });

  // Volume fade-in for a smooth start
  audio.volume = 0;
  audio.addEventListener('playing', () => {
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.03, 0.75);
      audio.volume = vol;
      if (vol >= 0.75) clearInterval(fade);
    }, 80);
  }, { once: true });
}

function showMusicToast(msg) {
  const existing = document.getElementById('music-toast');
  if (existing) return;

  const toast = document.createElement('div');
  toast.id = 'music-toast';
  toast.style.cssText = `
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%);
    background: rgba(140,50,255,0.18);
    border: 1px solid rgba(180,79,255,0.4);
    backdrop-filter: blur(12px);
    color: #e0c8ff; padding: 14px 28px;
    border-radius: 100px; font-size: 0.9rem;
    font-family: 'Inter', sans-serif;
    z-index: 5000; opacity: 0;
    transition: opacity 0.4s; pointer-events: none;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3800);
}

/* ══════════════════════════════════════════════════════════
   9. GIFT BOX
══════════════════════════════════════════════════════════ */

function initGiftBox() {
  const box     = document.getElementById('gift-box');
  const message = document.getElementById('gift-message');
  if (!box || !message) return;

  function openGift() {
    if (STATE.giftOpened) return;
    STATE.giftOpened = true;

    box.classList.add('opened');
    playSparkleSounds();
    spawnConfetti(160);

    for (let i = 0; i < 24; i++) {
      setTimeout(spawnHeart, i * 70);
    }

    setTimeout(() => {
      message.classList.add('visible');
      message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 700);
  }

  box.addEventListener('click', openGift);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openGift();
  });
}

/* ══════════════════════════════════════════════════════════
   10. CONFETTI
══════════════════════════════════════════════════════════ */

const CONFETTI_COLORS = [
  '#b44fff', '#c87aff', '#d084ff',
  '#9b30e0', '#e040fb', '#a855f7',
  '#7c3aed', '#c084fc', '#a78bfa',
  '#8b5cf6', '#ddd6fe',
];

function spawnConfetti(count = 80) {
  const layer = document.getElementById('confetti-layer');
  if (!layer) return;

  for (let i = 0; i < count; i++) {
    const piece    = document.createElement('div');
    piece.className = 'confetti-piece';

    const color    = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const left     = Math.random() * 100;
    const duration = Math.random() * 2.5 + 2;
    const delay    = Math.random() * 1.2;
    const size     = Math.random() * 10 + 6;
    const shape    = Math.random() < 0.5 ? '50%' : '2px';

    piece.style.cssText = `
      left: ${left}%;
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: ${shape};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 6px ${color};
    `;

    layer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

/* ══════════════════════════════════════════════════════════
   11. SOUND EFFECTS
══════════════════════════════════════════════════════════ */

function playSparkleSounds() {
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047, 1319, 1568]; // C5 E5 G5 C6 E6 G6

    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.6, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.20, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }, i * 100);
    });

    const popOsc  = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.connect(popGain);
    popGain.connect(ctx.destination);
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(360, ctx.currentTime);
    popOsc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
    popGain.gain.setValueAtTime(0.28, ctx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    popOsc.start(ctx.currentTime);
    popOsc.stop(ctx.currentTime + 0.25);

  } catch (e) { /* silently skip */ }
}

/* ══════════════════════════════════════════════════════════
   12. REPLAY BUTTON
══════════════════════════════════════════════════════════ */

function initReplay() {
  const btn = document.getElementById('replay-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      const box     = document.getElementById('gift-box');
      const message = document.getElementById('gift-message');
      if (box)     box.classList.remove('opened');
      if (message) message.classList.remove('visible');
      STATE.giftOpened = false;
      spawnConfetti(80);
    }, 950);
  });
}

/* ══════════════════════════════════════════════════════════
   13. INIT
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initCanvas();
  initScrollAnimations();
  initThemeToggle();
  initMusicToggle();
  initGiftBox();
  initReplay();
});
