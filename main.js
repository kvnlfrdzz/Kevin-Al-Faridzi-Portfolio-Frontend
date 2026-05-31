'use strict';

/* ================================================================
   CONFIG
================================================================ */
const CONFIG = {
  API_BASE_URL: 'https://kevin-al-faridzi-portfolio-backend.onrender.com/api',
  API_ENDPOINT: 'https://kevin-al-faridzi-portfolio-backend.onrender.com/api/projects',
  TYPING_TEXTS: [
    'building cool web apps…',
    'learning Laravel & Tailwind…',
    'crafting beautiful UI/UX…',
    'exploring Three.js…',
    'always learning and building…',
    'pushing boundaries in web dev…',
    'turning coffee into code…',
  ],
};

const GREETINGS = [
  { word: 'Hello',    lang: 'English'    },
  { word: 'Halo',     lang: 'Indonesia'  },
  { word: 'Ciao',     lang: 'Italian'    },
  { word: 'Привет',   lang: 'Russian'    },
  { word: 'مرحبا',    lang: 'Arabic'     },
  { word: 'Hola',     lang: 'Spanish'    },
  { word: 'Bonjour',  lang: 'French'     },
  { word: 'こんにちは', lang: 'Japanese'  },
  { word: 'Olá',      lang: 'Portuguese' },
  { word: '안녕하세요', lang: 'Korean'    },
  { word: 'Hej',      lang: 'Swedish'    },
  { word: 'Merhaba',  lang: 'Turkish'    },
];

/* ================================================================
   STATE
================================================================ */
let allProjects = [], projectsLoaded = false;

/* ================================================================
   SMOOTH SCROLL HELPER
   — Pengganti scroll-behavior:smooth bawaan browser
   — Lebih presisi, bisa custom durasi & easing
================================================================ */
function smoothScrollTo(targetY, duration = 700) {
  // Hormati prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY    = window.scrollY;
  const distance  = targetY - startY;
  const startTime = performance.now();

  // Easing: cubic ease in-out
  function ease(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ================================================================
   PHASE MANAGER
================================================================ */
(function initPhases() {
  const loadEl = document.getElementById('loading-screen');
  const openEl = document.getElementById('opening-screen');
  const mainEl = document.getElementById('main-content');
  const barEl  = document.getElementById('loading-bar');
  const pctEl  = document.getElementById('loading-percent');
  if (!loadEl || !openEl || !mainEl) return;

  document.body.style.overflow = 'hidden';

  let progress = 0;
  const iv = setInterval(() => {
    const rem = 100 - progress;
    progress  = Math.min(progress + Math.random() * rem * 0.15 + 1, 97);
    if (barEl) barEl.style.width = progress + '%';
    if (pctEl) pctEl.textContent = Math.floor(progress) + '%';
  }, 80);

  setTimeout(() => {
    clearInterval(iv);
    if (barEl) barEl.style.width = '100%';
    if (pctEl) pctEl.textContent = '100%';
    setTimeout(() => {
      loadEl.classList.add('fade-out');
      setTimeout(() => {
        loadEl.style.display = 'none';
        startOpening(openEl, mainEl);
      }, 900);
    }, 300);
  }, 900);
})();

/* ================================================================
   OPENING PHASE
================================================================ */
function startOpening(openEl, mainEl) {
  openEl.classList.add('visible');
  const wordEl = document.getElementById('greeting-word');
  const langEl = document.getElementById('greeting-lang');
  const dotsEl = document.getElementById('opening-dots');
  if (!wordEl || !langEl) { endOpening(openEl, mainEl); return; }

  if (dotsEl) {
    dotsEl.innerHTML = GREETINGS.map((_, i) =>
      `<div class="opening-dot${i === 0 ? ' active' : ''}"></div>`
    ).join('');
  }

  let idx = 0, running = true, timer;

  function setFontSize(w) {
    const l = w.length;
    wordEl.style.fontSize = l <= 4 ? 'clamp(5rem,18vw,15rem)'
      : l <= 6 ? 'clamp(4rem,14vw,11rem)'
      : l <= 8 ? 'clamp(3rem,11vw,9rem)'
      : 'clamp(2.5rem,8vw,7rem)';
  }

  function showWord(index, cb) {
    if (!running) return;
    const g = GREETINGS[index];
    setFontSize(g.word);
    dotsEl?.querySelectorAll('.opening-dot').forEach((d, i) =>
      d.classList.toggle('active', i === index)
    );
    wordEl.textContent = g.word;
    langEl.textContent = g.lang;
    wordEl.classList.remove('greeting-anim-out');
    langEl.style.opacity    = '0';
    langEl.style.transition = 'opacity 0.35s ease';
    void wordEl.offsetWidth;
    wordEl.classList.add('greeting-anim-in');
    setTimeout(() => { langEl.style.opacity = '1'; }, 220);
    const dur = index === 0 ? 800 : 560;
    timer = setTimeout(() => {
      if (!running) return;
      wordEl.classList.remove('greeting-anim-in');
      wordEl.classList.add('greeting-anim-out');
      langEl.style.opacity = '0';
      setTimeout(() => { if (cb) cb(); }, 420);
    }, dur);
  }

  function next() {
    if (!running) return;
    idx++;
    if (idx >= GREETINGS.length) { endOpening(openEl, mainEl); return; }
    showWord(idx, next);
  }

  function skip() {
    if (!running) return;
    running = false;
    clearTimeout(timer);
    endOpening(openEl, mainEl);
  }

  openEl.addEventListener('click',      skip, { once: true });
  openEl.addEventListener('touchstart', skip, { once: true, passive: true });
  showWord(0, next);
}

function endOpening(openEl, mainEl) {
  openEl.classList.add('fade-out');
  setTimeout(() => {
    openEl.style.display = 'none';
    document.body.style.overflow = '';
    mainEl.classList.add('visible');
    triggerHeroAnimations();
  }, 900);
}

/* ================================================================
   CUSTOM CURSOR
================================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if ('ontouchstart' in window || window.matchMedia('(pointer:coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  document.addEventListener('mousedown', () => {
    dot.classList.add('is-clicking'); ring.classList.add('is-clicking');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('is-clicking'); ring.classList.remove('is-clicking');
  });

  const HOVER = 'a,button,[data-cursor-hover],input,select,textarea,.project-card,.contact-card,.skill-card,.lanyard-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER)) { dot.classList.add('is-hovering'); ring.classList.add('is-hovering'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER)) { dot.classList.remove('is-hovering'); ring.classList.remove('is-hovering'); }
  });

  const lerp = (a, b, f) => a + (b - a) * f;
  (function loop() {
    rx = lerp(rx, mx, 0.1); ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ================================================================
   NAVBAR — AUTO HIDE (scroll bawah) / SHOW (scroll atas)
================================================================ */
(function initNav() {
  const navbar     = document.getElementById('navbar');
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks   = document.querySelectorAll('.nav-link');
  const hlines     = document.querySelectorAll('.hline');
  let   mobOpen    = false;

  // ── Scroll: auto-hide / show navbar ──
  let lastScrollY = window.scrollY;
  let ticking     = false;
  let navHidden   = false;

  const HIDE_THRESHOLD = 80;
  const SCROLL_DELTA   = 6;

  function handleNavScroll() {
    const currentY = window.scrollY;
    const delta    = currentY - lastScrollY;

    if (currentY <= HIDE_THRESHOLD) {
      if (navHidden) {
        navbar.classList.remove('nav-hidden');
        navbar.classList.add('nav-visible');
        navHidden = false;
      }
      navbar.classList.toggle('scrolled', currentY > 30);
    } else if (delta > SCROLL_DELTA && !navHidden) {
      navbar.classList.add('nav-hidden');
      navbar.classList.remove('nav-visible', 'scrolled');
      navHidden = true;
      if (mobOpen) closeMobileMenu();
    } else if (delta < -SCROLL_DELTA && navHidden) {
      navbar.classList.remove('nav-hidden');
      navbar.classList.add('nav-visible', 'scrolled');
      navHidden = false;
    }

    lastScrollY = currentY;
    updateActive();
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleNavScroll);
      ticking = true;
    }
  }, { passive: true });

  // ── Active link highlight ──
  function updateActive() {
    const secs = document.querySelectorAll('section[id]');
    let cur = '';
    secs.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.top <= 140 && r.bottom >= 140) cur = s.id;
    });
    navLinks.forEach(l =>
      l.classList.toggle('active-link', l.dataset.section === cur)
    );
  }

  // ── Mobile hamburger ──
  mobileBtn?.addEventListener('click', () => {
    mobOpen = !mobOpen;
    mobileMenu.classList.toggle('open', mobOpen);
    mobileBtn.setAttribute('aria-expanded', mobOpen);
    mobileMenu.setAttribute('aria-hidden', !mobOpen);
    hlines[0].style.transform = mobOpen ? 'rotate(45deg) translate(4.5px,4.5px)' : '';
    hlines[1].style.opacity   = mobOpen ? '0' : '';
    hlines[2].style.transform = mobOpen ? 'rotate(-45deg) translate(3px,-3px)' : '';
    hlines[2].style.width     = mobOpen ? '22px' : '';
  });

  // ── Smooth scroll: LANGSUNG mulai, tanpa delay ──
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href   = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    // Hitung posisi target dengan offset navbar
    const navH      = navbar.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navH - 4;

    // Native smooth scroll — LANGSUNG mulai tanpa delay apapun
    window.scrollTo({
      top:      Math.max(0, targetTop),
      behavior: 'smooth'
    });

    // Tutup mobile menu jika terbuka
    if (mobOpen) closeMobileMenu();
  });
})();

function closeMobileMenu() {
  const m   = document.getElementById('mobile-menu');
  const hl  = document.querySelectorAll('.hline');
  const btn = document.getElementById('mobile-menu-btn');
  if (m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    btn?.setAttribute('aria-expanded', 'false');
    hl.forEach(h => { h.style.transform = ''; h.style.opacity = ''; h.style.width = ''; });
  }
}

/* ================================================================
   THREE.JS HERO BACKGROUND
================================================================ */
(function initThree() {
  function waitForThree(cb) {
    if (typeof THREE !== 'undefined') cb();
    else setTimeout(() => waitForThree(cb), 100);
  }

  waitForThree(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const COUNT  = window.innerWidth < 768 ? 800 : 2000;
    const pos    = new Float32Array(COUNT * 3);
    const col    = new Float32Array(COUNT * 3);
    const COLORS = [
      new THREE.Color('#38bdf8'), new THREE.Color('#0ea5e9'),
      new THREE.Color('#a78bfa'), new THREE.Color('#22d3ee'), new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const r  = Math.random() * 80 + 10;
      const ph = Math.acos(-1 + (2 * i) / COUNT);
      const th = Math.sqrt(COUNT * Math.PI) * ph;
      pos[i3]     = r * Math.sin(ph) * Math.cos(th) + (Math.random() - .5) * 30;
      pos[i3 + 1] = r * Math.sin(ph) * Math.sin(th) + (Math.random() - .5) * 20;
      pos[i3 + 2] = r * Math.cos(ph) + (Math.random() - .5) * 20;
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.22, vertexColors: true, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    let tmx = 0, tmy = 0, cmx = 0, cmy = 0, scrollProg = 0;

    document.addEventListener('mousemove', e => {
      tmx = (e.clientX / window.innerWidth  - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma && e.beta) { tmx = e.gamma / 45; tmy = e.beta / 45 - .5; }
      });
    }
    window.addEventListener('scroll', () => {
      const h = document.getElementById('hero');
      if (h) scrollProg = Math.min(window.scrollY / h.offsetHeight, 1);
    }, { passive: true });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      cmx += (tmx - cmx) * 0.03; cmy += (tmy - cmy) * 0.03;
      particles.rotation.y = t * 0.018 + cmx * 0.05;
      particles.rotation.x = t * 0.008 + cmy * 0.025;
      camera.position.x += (cmx * 3  - camera.position.x) * 0.025;
      camera.position.y += (-cmy * 2  - camera.position.y) * 0.025;
      camera.position.z  = 30 - scrollProg * 8;
      camera.lookAt(scene.position);
      canvas.style.opacity = Math.max(0, 1 - scrollProg * 1.5).toString();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  });
})();

/* ================================================================
   HERO ANIMATIONS
================================================================ */
function triggerHeroAnimations() {
  document.querySelectorAll('.hero-anim-el').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 120 + i * 180);
  });
  setTimeout(initTypingEffect, 700);
  setTimeout(initScrollReveal,  250);
  setTimeout(() => animCounter('counter-projects', 0, 10, 1500), 1000);
}

/* ================================================================
   TYPING EFFECT
================================================================ */
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const texts = CONFIG.TYPING_TEXTS;
  let ti = 0, ci = 0, del = false;

  function type() {
    const txt  = texts[ti];
    el.textContent = del ? txt.slice(0, ci - 1) : txt.slice(0, ci + 1);
    if (!del) {
      ci++;
      if (ci === txt.length) {
        setTimeout(() => { del = true; setTimeout(type, 60); }, 2000);
        return;
      }
    } else {
      ci--;
      if (ci === 0) {
        del = false; ti = (ti + 1) % texts.length;
        setTimeout(type, 280); return;
      }
    }
    setTimeout(type, del ? 32 : 65);
  }
  type();
}

/* ================================================================
   COUNTER
================================================================ */
function animCounter(id, from, to, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  (function upd(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(2, -10 * p)));
    if (p < 1) requestAnimationFrame(upd);
  })(start);
}

/* ================================================================
   SCROLL REVEAL
================================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      // Stagger jika ada banyak children
      e.target.classList.add('revealed');
      e.target.querySelectorAll('.sk-bar-fill').forEach((b, i) => {
        const w = b.dataset.width;
        if (w) setTimeout(() => { b.style.width = w + '%'; }, 250 + i * 80);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '-40px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

  const apiBar = document.getElementById('api-status');
  if (apiBar) {
    new IntersectionObserver(e => {
      if (e[0].isIntersecting) apiBar.style.opacity = '1';
    }, { threshold: 0.1 }).observe(apiBar);
  }
}

/* ================================================================
   LANYARD CARD — DRAGGABLE (Physics)
================================================================ */
(function initLanyard() {
  const card = document.getElementById('lanyard-card');
  if (!card) return;

  let dragging = false, sx = 0, sy = 0, cx = 0, cy = 0;
  let vx = 0, vy = 0, lx = 0, ly = 0, rX = 0, rY = 0, raf;
  const DAMP = 0.88, SPRING = 0.07, TILT = 22;
  const pos = e => e.touches
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX,           y: e.clientY };

  function onStart(e) {
    if (e.type === 'mousedown') e.preventDefault();
    dragging = true;
    card.classList.add('is-dragging');
    card.classList.remove('is-returning');
    const p = pos(e);
    sx = p.x - cx; sy = p.y - cy;
    lx = p.x; ly = p.y; vx = vy = 0;
    cancelAnimationFrame(raf);
    const hint = document.getElementById('lcard-drag-hint');
    if (hint) hint.style.opacity = '0';
  }

  function onMove(e) {
    if (!dragging) return;
    if (e.type === 'mousemove') e.preventDefault();
    const p = pos(e);
    vx = p.x - lx; vy = p.y - ly;
    lx = p.x; ly = p.y;
    cx = p.x - sx; cy = p.y - sy;
    rY = Math.max(-TILT, Math.min(TILT, vx * 2.5));
    rX = Math.max(-TILT, Math.min(TILT, -vy * 2.5));
    applyTransform(); updateStraps(cx, cy); updateShine(p.x, p.y);
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('is-dragging');
    physics();
  }

  function physics() {
    if (dragging) return;
    cx += vx; cy += vy; vx *= DAMP; vy *= DAMP;
    const close = Math.abs(cx) < 2 && Math.abs(cy) < 2 && Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1;
    if (close) {
      card.classList.add('is-returning');
      cx = cy = rX = rY = 0;
      applyTransform(); updateStraps(0, 0);
      setTimeout(() => {
        card.classList.remove('is-returning');
        card.style.animation = ''; card.style.transform = '';
      }, 700);
      return;
    }
    cx += (0 - cx) * SPRING; cy += (0 - cy) * SPRING;
    rX *= 0.82; rY *= 0.82;
    applyTransform(); updateStraps(cx, cy);
    raf = requestAnimationFrame(physics);
  }

  function applyTransform() {
    card.style.transform = `translate(${cx}px,${cy}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
    card.style.animation = 'none';
  }

  function updateStraps(dx, dy) {
    const sl  = document.getElementById('strap-left');
    const sr  = document.getElementById('strap-right');
    const slt = document.getElementById('strap-left-text-path');
    const srt = document.getElementById('strap-right-text-path');
    const mc  = document.getElementById('metal-clip');
    if (!sl || !sr) return;
    const ox    = dx * 0.35;
    const oy    = Math.max(-20, Math.min(80, dy * 0.3));
    const lEnd  = { x: 108 + ox, y: 200 + oy };
    const rEnd  = { x: 112 + ox, y: 200 + oy };
    const lCtrl = { x: 80  + ox * 0.5, y: 80 + oy * 0.4 };
    const rCtrl = { x: 140 + ox * 0.5, y: 80 + oy * 0.4 };
    const ld = `M85,16 Q${lCtrl.x},${lCtrl.y} ${lEnd.x},${lEnd.y}`;
    const rd = `M135,16 Q${rCtrl.x},${rCtrl.y} ${rEnd.x},${rEnd.y}`;
    sl.setAttribute('d', ld); sr.setAttribute('d', rd);
    if (slt) slt.setAttribute('d', ld);
    if (srt) srt.setAttribute('d', rd);
    if (mc)  mc.setAttribute('transform', `translate(${ox * 0.9},${oy * 0.9})`);
  }

  function updateShine(px, py) {
    const shine = document.getElementById('lcard-shine');
    if (!shine) return;
    const r     = card.getBoundingClientRect();
    const rx    = (px - r.left) / r.width;
    const ry    = (py - r.top)  / r.height;
    const angle = Math.atan2(ry - .5, rx - .5) * (180 / Math.PI);
    shine.style.background = `linear-gradient(${angle}deg,rgba(255,255,255,0) 20%,rgba(255,255,255,0.22) 50%,rgba(255,255,255,0) 80%)`;
    shine.style.opacity = '1';
  }

  card.addEventListener('mousedown',  onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onEnd);
  card.addEventListener('touchstart',  onStart, { passive: true });
  window.addEventListener('touchmove', onMove,  { passive: true });
  window.addEventListener('touchend',  onEnd);
})();

/* ================================================================
   API — FETCH PROJECTS
================================================================ */
function updateApiStatus(status, msg) {
  const dot  = document.getElementById('api-status-dot');
  const text = document.getElementById('api-status-text');
  const bar  = document.getElementById('api-status');
  if (!dot || !text || !bar) return;
  bar.style.opacity = '1';
  const MAP = {
    loading: { bg: 'rgba(251,191,36,0.85)',  pulse: true  },
    success: { bg: 'rgba(74,222,128,0.85)',  pulse: false },
    error:   { bg: 'rgba(248,113,113,0.85)', pulse: false },
    empty:   { bg: 'rgba(100,116,139,0.85)', pulse: false },
  };
  const s = MAP[status] || MAP.loading;
  dot.style.background = s.bg;
  dot.style.animation  = s.pulse ? 'sdp 1.5s ease infinite' : 'none';
  text.textContent     = msg;
  text.style.color     = s.bg;
}

const fmt   = iso => iso ? new Date(iso).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
const trunc = (t, m) => !t ? '' : (t.length <= m ? t : t.slice(0, m).trim() + '…');

function escHtml(t) {
  if (!t) return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(t));
  return d.innerHTML;
}

function getTechArr(p) {
  let t = [];
  if (Array.isArray(p.tech_stack)) t = p.tech_stack;
  else if (typeof p.tech_stack === 'string') {
    try { t = JSON.parse(p.tech_stack); }
    catch { t = p.tech_stack.split(',').map(s => s.trim()).filter(Boolean); }
  }
  return t;
}

function createProjectCard(p, cls) {
  const isLg  = cls === 'proj-bento-large';
  const ta    = getTechArr(p);
  const shown = ta.slice(0, isLg ? 6 : 4);
  const extra = ta.length - shown.length;
  const imgH  = isLg ? '260px' : '160px';
  const tags  = shown.map(t => `<span class="proj-tag">${escHtml(t)}</span>`).join('')
              + (extra > 0 ? `<span class="proj-tag">+${extra}</span>` : '');
  const img   = p.image_url || p.image_or_placeholder
              || `https://placehold.co/800x450/0a0a0a/1a1a1a?text=${encodeURIComponent(p.title || 'Project')}`;
  const demo  = p.demo_link
    ? `<a href="${escHtml(p.demo_link)}" target="_blank" rel="noopener" class="proj-link-demo" onclick="event.stopPropagation()">
         <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>Demo</a>` : '';
  const repo  = p.repo_link
    ? `<a href="${escHtml(p.repo_link)}" target="_blank" rel="noopener" class="proj-link-repo" onclick="event.stopPropagation()">
         <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>Repo</a>` : '';
  const feat  = p.is_featured ? `<span class="proj-featured-badge">⭐ Featured</span>` : '';

  return `
    <div class="project-card ${cls}" onclick="openProjectModal(${p.id})">
      ${feat}
      <div style="position:relative;overflow:hidden;height:${imgH}">
        <img src="${escHtml(img)}" alt="${escHtml(p.title)}" class="proj-img" style="height:${imgH}" loading="lazy"/>
        <div class="proj-img-gradient" style="height:${imgH}"></div>
        <div class="proj-hover" style="height:${imgH}">
          <div class="proj-hover-pill">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Lihat Detail
          </div>
        </div>
      </div>
      <div class="proj-body">
        <h3 class="proj-title">${escHtml(p.title)}</h3>
        <p class="proj-desc">${escHtml(isLg ? trunc(p.description, 180) : trunc(p.description, 90))}</p>
        <div class="proj-tags">${tags}</div>
        <div class="proj-links">
          <div style="display:flex;align-items:center;gap:6px">${demo}${repo}</div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:0.58rem;color:rgba(255,255,255,0.22)">${fmt(p.created_at)}</span>
        </div>
      </div>
    </div>`;
}

function renderGrid(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  if (!projects.length) {
    grid.classList.add('hidden');
    document.getElementById('projects-empty')?.classList.remove('hidden');
    return;
  }

  let html = '';
  projects.forEach((p, i) => {
    const cycle = i % 7;
    let cls = cycle === 0 ? 'proj-bento-large' : cycle === 3 ? 'proj-bento-wide' : 'proj-bento-med';
    if (p.is_featured && i < 2) cls = 'proj-bento-large';
    html += createProjectCard(p, cls);
  });
  grid.innerHTML = html;
  grid.classList.remove('hidden');

  const mob = () => window.innerWidth <= 640;
  const tab = () => window.innerWidth <= 1024;

  function applySpans() {
    grid.querySelectorAll('.proj-bento-large').forEach(el => {
      el.style.gridColumn = mob() ? '' : 'span 2';
      el.style.gridRow    = mob() ? '' : 'span 2';
    });
    grid.querySelectorAll('.proj-bento-wide').forEach(el => {
      el.style.gridColumn = mob() ? '' : tab() ? 'span 2' : 'span 3';
    });
  }
  applySpans();
  window.addEventListener('resize', applySpans, { passive: true });

  // Stagger reveal cards dengan transisi smooth
  grid.querySelectorAll('.project-card').forEach((c, i) => {
    c.style.opacity   = '0';
    c.style.transform = 'translateY(20px)';
    setTimeout(() => {
      c.style.transition = 'opacity 550ms cubic-bezier(0.16,1,0.3,1), transform 550ms cubic-bezier(0.16,1,0.3,1), border-color 300ms ease, box-shadow 300ms ease';
      c.style.opacity    = '1';
      c.style.transform  = 'translateY(0)';
    }, 60 + i * 60);
  });
}

/* ================================================================
   COLD START LOADER — CONTROLLER
   Mengatur tampilan, countdown timer, dan step indicator
   ================================================================ */

let _coldStartTimerInterval = null;  // interval countdown
let _coldStartProgressInterval = null; // interval progress bar
let _coldStartElapsedSeconds = 0;
const COLD_START_TIMEOUT_MS = 90000; // 90 detik total timeout

/**
 * Tampilkan Cold Start Loader dan mulai semua animasinya.
 */
function showColdStartLoader() {
  const loader = document.getElementById('projects-cold-start-loader');
  const skeleton = document.getElementById('projects-skeleton');
  if (!loader) return;

  // Tampilkan loader
  loader.style.display = 'flex';

  // Tampilkan skeleton di bawah loader
  if (skeleton) skeleton.style.display = 'grid';

  // Reset state
  _coldStartElapsedSeconds = 0;
  _resetSteps();
  _setStepActive(1);

  // Mulai countdown timer
  _startCountdown();

  // Mulai progress bar animasi
  _startProgressBar();
}

/**
 * Sembunyikan Cold Start Loader dan hentikan semua animasinya.
 */
function hideColdStartLoader() {
  const loader = document.getElementById('projects-cold-start-loader');
  const skeleton = document.getElementById('projects-skeleton');

  _stopCountdown();
  _stopProgressBar();

  if (loader) {
    // Animasi fade-out sebelum benar-benar disembunyikan
    loader.style.transition = 'opacity 500ms ease, transform 500ms ease';
    loader.style.opacity = '0';
    loader.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      loader.style.display = 'none';
      loader.style.opacity = '';
      loader.style.transform = '';
      loader.style.transition = '';
    }, 520);
  }

  if (skeleton) {
    skeleton.style.transition = 'opacity 400ms ease';
    skeleton.style.opacity = '0';
    setTimeout(() => {
      skeleton.style.display = 'none';
      skeleton.style.opacity = '';
      skeleton.style.transition = '';
    }, 420);
  }
}

/** Reset semua step ke kondisi awal (inactive) */
function _resetSteps() {
  [1, 2, 3].forEach(n => {
    const step = document.getElementById(`csl-step-${n}`);
    if (!step) return;
    step.classList.remove('csl-step-active-state', 'csl-step-done-state');
  });
}

/** Tandai step ke-n sebagai AKTIF, step sebelumnya sebagai DONE */
function _setStepActive(n) {
  _resetSteps();
  for (let i = 1; i < n; i++) {
    const prev = document.getElementById(`csl-step-${i}`);
    if (prev) prev.classList.add('csl-step-done-state');
  }
  const current = document.getElementById(`csl-step-${n}`);
  if (current) current.classList.add('csl-step-active-state');
}

/** Mulai countdown timer dan update teks setiap detik */
function _startCountdown() {
  _stopCountdown(); // pastikan tidak ada interval ganda
  const countdownEl = document.getElementById('csl-countdown-text');
  _coldStartElapsedSeconds = 0;

  _coldStartTimerInterval = setInterval(() => {
    _coldStartElapsedSeconds++;
    const elapsed = _coldStartElapsedSeconds;
    const remaining = Math.max(0, Math.ceil(COLD_START_TIMEOUT_MS / 1000) - elapsed);

    if (!countdownEl) return;

    if (elapsed <= 5) {
      countdownEl.textContent = '⏱ Mengirim request ke server…';
      _setStepActive(1);
    } else if (elapsed <= 15) {
      countdownEl.textContent = `⏱ Server sedang aktif… (${elapsed}s)`;
      _setStepActive(2);
    } else if (elapsed <= 45) {
      countdownEl.textContent = `⏱ Hampir selesai… mohon tunggu (${elapsed}s)`;
      _setStepActive(2);
    } else if (elapsed <= 60) {
      countdownEl.textContent = `⏱ Masih loading… (${elapsed}s) — hampir pasti berhasil!`;
      _setStepActive(3);
    } else {
      countdownEl.textContent = `⏱ Sudah ${elapsed}s — server sedang diaktifkan dari tidur…`;
      _setStepActive(3);
    }
  }, 1000);
}

/** Hentikan countdown timer */
function _stopCountdown() {
  if (_coldStartTimerInterval) {
    clearInterval(_coldStartTimerInterval);
    _coldStartTimerInterval = null;
  }
}

/** Animasikan progress bar secara bertahap hingga ~92% */
function _startProgressBar() {
  _stopProgressBar();
  const bar = document.getElementById('csl-progress-bar');
  if (!bar) return;

  bar.style.width = '0%';
  let progress = 0;
  const totalMs = COLD_START_TIMEOUT_MS * 0.95; // capai 92% dalam 95% dari total timeout
  const intervalMs = 400;
  const maxProgress = 92;

  _coldStartProgressInterval = setInterval(() => {
    const remaining = maxProgress - progress;
    // Makin dekat ke atas, makin lambat naiknya (simulasi real loading)
    const increment = remaining * 0.04 + 0.3;
    progress = Math.min(progress + increment, maxProgress);
    if (bar) bar.style.width = progress + '%';

    if (progress >= maxProgress) {
      _stopProgressBar();
    }
  }, intervalMs);
}

/** Set progress bar ke 100% (saat berhasil) */
function _completeProgressBar() {
  _stopProgressBar();
  const bar = document.getElementById('csl-progress-bar');
  if (bar) {
    bar.style.transition = 'width 400ms ease';
    bar.style.width = '100%';
    // Ubah warna jadi hijau saat sukses
    bar.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
  }
}

/** Hentikan animasi progress bar */
function _stopProgressBar() {
  if (_coldStartProgressInterval) {
    clearInterval(_coldStartProgressInterval);
    _coldStartProgressInterval = null;
  }
}

/* ================================================================
   FETCH PROJECTS — Versi baru dengan Cold Start handling
   ================================================================ */

/**
 * Fungsi utama fetch projects.
 * Dipanggil saat DOMContentLoaded dan bisa dipanggil ulang via retryFetchProjects().
 */
async function fetchProjects() {
  const grid    = document.getElementById('projects-grid');
  const errEl   = document.getElementById('projects-error');
  const emptyEl = document.getElementById('projects-empty');
  const footer  = document.getElementById('projects-footer');

  // ── 1. Reset semua state UI ke kondisi awal ──
  if (grid)    grid.classList.add('hidden');
  if (errEl)   errEl.classList.add('hidden');
  if (emptyEl) emptyEl.classList.add('hidden');
  if (footer)  footer.classList.add('hidden');

  // ── 2. Tampilkan Cold Start Loader ──
  showColdStartLoader();
  updateApiStatus('loading', 'Menghubungkan ke API backend… (cold start mungkin 30–50 detik)');

  try {
    // ── 3. Fetch dengan timeout 90 detik (mengakomodasi cold start) ──
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), COLD_START_TIMEOUT_MS);

    const res = await fetch(CONFIG.API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      signal: ctrl.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    // ── 4. Parse struktur data dari berbagai format respons Laravel ──
    let projects = [];
    if (Array.isArray(data))                          projects = data;
    else if (data.data && Array.isArray(data.data))   projects = data.data;
    else if (data.projects && Array.isArray(data.projects)) projects = data.projects;
    else if (data.data?.data && Array.isArray(data.data.data)) projects = data.data.data;
    else throw new Error('Struktur data tidak dikenali.');

    // ── 5. Simpan data ke state global ──
    allProjects    = projects;
    projectsLoaded = true;

    // ── 6. Selesaikan progress bar dengan animasi hijau ──
    _completeProgressBar();
    _setStepActive(4); // semua step done (step 4 tidak ada, otomatis semua jadi done)
    [1, 2, 3].forEach(n => {
      const s = document.getElementById(`csl-step-${n}`);
      if (s) {
        s.classList.remove('csl-step-active-state');
        s.classList.add('csl-step-done-state');
      }
    });

    // ── 7. Sembunyikan loader (dengan delay kecil agar animasi terlihat) ──
    await new Promise(resolve => setTimeout(resolve, 500));
    hideColdStartLoader();

    // ── 8. Handle empty data ──
    if (!projects.length) {
      updateApiStatus('empty', 'API berhasil. Belum ada project.');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    // ── 9. Render project cards ──
    renderGrid(projects);

    const countText = document.getElementById('projects-count-text');
    if (countText) countText.textContent = `Menampilkan ${projects.length} project`;

    if (footer) footer.classList.remove('hidden');

    updateApiStatus(
      'success',
      `API terhubung — ${projects.length} project dimuat`
    );

    // Update counter di hero section
    animCounter('counter-projects', 0, Math.max(projects.length, 10), 1400);

  } catch (err) {
    console.error('[Portfolio] fetchProjects error:', err);

    // ── 10. Hentikan semua animasi loader ──
    hideColdStartLoader();

    // ── 11. Sembunyikan grid, tampilkan error ──
    if (grid) grid.classList.add('hidden');
    if (errEl) errEl.classList.remove('hidden');

    // ── 12. Tentukan pesan error yang ramah ──
    let friendlyMsg = 'Tidak dapat terhubung ke API backend.';

    if (err.name === 'AbortError') {
      friendlyMsg =
        'Server backend tidak merespons setelah 90 detik. ' +
        'Kemungkinan server sedang down. Silakan refresh halaman atau coba lagi nanti.';
    } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      friendlyMsg = `Gagal terhubung ke: ${CONFIG.API_BASE_URL} — Pastikan koneksi internet Anda stabil.`;
    } else if (err.message.includes('HTTP 404')) {
      friendlyMsg = 'Endpoint API tidak ditemukan (404). Pastikan URL API sudah benar.';
    } else if (err.message.includes('HTTP 5')) {
      friendlyMsg = 'Server backend mengalami error internal. Silakan coba lagi nanti.';
    } else if (err.message.includes('Struktur data')) {
      friendlyMsg = 'Format respons API tidak sesuai yang diharapkan.';
    } else {
      friendlyMsg = err.message || 'Terjadi error yang tidak diketahui.';
    }

    // Set pesan ke elemen error
    const errorMsgEl = document.getElementById('error-message');
    if (errorMsgEl) errorMsgEl.textContent = friendlyMsg;

    updateApiStatus('error', `Gagal — ${friendlyMsg}`);
  }
}

/**
 * Fungsi retry — dipanggil oleh tombol "Coba Lagi" di error state.
 * Mereset UI lalu memanggil fetchProjects() ulang.
 */
function retryFetchProjects() {
  // Reset state global
  allProjects    = [];
  projectsLoaded = false;

  // Panggil ulang fetch
  fetchProjects();
}

/* ================================================================
   PROJECT MODAL — SMOOTH OPEN & CLOSE
   Hanya bisa ditutup dengan tombol X atau Escape
================================================================ */
function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  const modal   = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  const ta  = getTechArr(project);
  const img = project.image_url || project.image_or_placeholder
            || `https://placehold.co/800x450/0a0a0a/1a1a1a?text=${encodeURIComponent(project.title || 'Project')}`;

  const techHTML = ta.length ? `
    <div>
      <p style="font-family:'JetBrains Mono',monospace;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.28);margin-bottom:10px">Tech Stack</p>
      <div style="display:flex;flex-wrap:wrap;gap:7px">
        ${ta.map(t => `<span style="display:inline-flex;align-items:center;padding:5px 12px;border-radius:9999px;font-family:'JetBrains Mono',monospace;font-size:0.7rem;font-weight:600;background:rgba(14,165,233,0.09);border:1px solid rgba(14,165,233,0.2);color:#38bdf8">${escHtml(t)}</span>`).join('')}
      </div>
    </div>` : '';

  const linksHTML = (project.demo_link || project.repo_link) ? `
    <div style="display:flex;flex-wrap:wrap;gap:10px">
      ${project.demo_link ? `<a href="${escHtml(project.demo_link)}" target="_blank" rel="noopener" class="btn-primary" style="flex:1;justify-content:center;min-width:120px">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        Buka Aplikasi</a>` : ''}
      ${project.repo_link ? `<a href="${escHtml(project.repo_link)}" target="_blank" rel="noopener" class="btn-outline" style="flex:1;justify-content:center;min-width:120px">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        Kode Sumber</a>` : ''}
    </div>` : '';

  content.innerHTML = `
    <div style="display:flex;justify-content:center;padding:12px 0 0">
      <div style="width:36px;height:4px;background:rgba(255,255,255,0.12);border-radius:9999px"></div>
    </div>
    <div style="position:relative;height:200px;overflow:hidden;margin-top:10px">
      <img src="${escHtml(img)}" alt="${escHtml(project.title)}"
           style="width:100%;height:200px;object-fit:cover;transition:transform 600ms cubic-bezier(0.16,1,0.3,1)"
           loading="lazy"/>
      <div style="position:absolute;inset:0;background:linear-gradient(to top,#0d0d0d 0%,transparent 55%)"></div>
      ${project.is_featured ? `<span class="proj-featured-badge" style="position:absolute;top:12px;left:12px">⭐ Featured</span>` : ''}
      <button onclick="closeProjectModal()" class="modal-close-btn" type="button" aria-label="Tutup">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div style="padding:22px 24px 32px;display:flex;flex-direction:column;gap:20px">
      <div>
        <h2 style="font-family:'Space Grotesk',sans-serif;font-weight:900;color:#fff;font-size:clamp(1.4rem,4vw,1.9rem);line-height:1.15;margin-bottom:4px">${escHtml(project.title)}</h2>
        ${project.slug ? `<p style="font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:rgba(255,255,255,0.22)">${escHtml(project.slug)}</p>` : ''}
      </div>
      <div>
        <p style="font-family:'JetBrains Mono',monospace;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.28);margin-bottom:10px">Deskripsi</p>
        <p style="font-size:0.9rem;line-height:1.78;color:rgba(255,255,255,0.65)">${escHtml(project.description || 'Tidak ada deskripsi.')}</p>
      </div>
      ${techHTML}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px">
        <div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.58rem;color:rgba(255,255,255,0.25);margin-bottom:4px">Dibuat</p>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.8)">${fmt(project.created_at)}</p>
        </div>
        <div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.58rem;color:rgba(255,255,255,0.25);margin-bottom:4px">Diperbarui</p>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.8)">${fmt(project.updated_at)}</p>
        </div>
      </div>
      ${linksHTML}
    </div>`;

  // Tampilkan modal dengan animasi smooth
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.classList.remove('open');
  // Delay sedikit sebelum restore scroll, tunggu animasi selesai
  setTimeout(() => {
    document.body.style.overflow = '';
  }, 400);
}

/* ================================================================
   KEYBOARD
================================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProjectModal();
});

/* ================================================================
   FOOTER YEAR
================================================================ */
(function () {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const c = document.getElementById('hero-canvas');
    if (c) c.style.display = 'none';
  }

  console.log(
    '%c Kevin Al Faridzi — Portfolio v7.0',
    'background:#000;color:#fff;font-weight:bold;padding:8px 16px;border-radius:8px;font-family:monospace;font-size:13px;border:1px solid rgba(255,255,255,0.1)'
  );
  console.log(`%c API: ${CONFIG.API_ENDPOINT}`, 'color:rgba(56,189,248,0.7);font-family:monospace;font-size:11px');
});

/* ================================================================
   ERROR HANDLERS
================================================================ */
window.addEventListener('error', e => {
  if (e.filename?.includes('three')) return;
  console.warn('[Portfolio] Error:', e.message);
});
window.addEventListener('unhandledrejection', e => {
  console.warn('[Portfolio] Rejection:', e.reason);
  e.preventDefault();
});