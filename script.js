/* ================================================================
   PORTFOLIO — Kevin Al Faridzi (@vnmrcyx)
   script.js v3.0 — API TIDAK DIUBAH + New UI System
================================================================ */
'use strict';

/* ----------------------------------------------------------------
   CONFIG — JANGAN UBAH
---------------------------------------------------------------- */
const CONFIG = {
  API_BASE_URL: 'https://residence-connections-cure-neil.trycloudflare.com/api',
  API_ENDPOINT: 'https://residence-connections-cure-neil.trycloudflare.com/api/projects',
  TYPING_TEXTS: [
    'building cool web apps...',
    'learning Laravel & Tailwind...',
    'crafting beautiful UI/UX...',
    'exploring Three.js...',
    'always learning and building...',
    'pushing boundaries in web dev...',
    'turning coffee into code...',
  ],
};

/* ================================================================
   GREETING DATA (Apple-style)
================================================================ */
const GREETINGS = [
  { word: 'Hello',    lang: 'English'    },
  { word: 'Halo',     lang: 'Indonesia'  },
  { word: 'Ciao',     lang: 'Italian'    },
  { word: 'Привет',   lang: 'Russian'    },
  { word: 'مرحبا',    lang: 'Arabic'     },
  { word: 'Hola',     lang: 'Spanish'    },
  { word: 'Bonjour',  lang: 'French'     },
  { word: 'こんにちは', lang: 'Japanese'   },
  { word: 'Olá',      lang: 'Portuguese' },
  { word: '안녕하세요', lang: 'Korean'    },
  { word: 'Hej',      lang: 'Swedish'    },
  { word: 'Merhaba',  lang: 'Turkish'    },
];

/* ================================================================
   1. PHASE MANAGER
================================================================ */
let openingSkipped = false;

(function initPhases() {
  const loadingEl  = document.getElementById('loading-screen');
  const openingEl  = document.getElementById('opening-screen');
  const mainEl     = document.getElementById('main-content');
  const loadingBar = document.getElementById('loading-bar');
  const loadingPct = document.getElementById('loading-percent');

  if (!loadingEl || !openingEl || !mainEl) return;

  // Lock scroll during phases
  document.body.style.overflow = 'hidden';

  /* ---- PHASE 1: LOADING ---- */
  let progress = 0;

  const loadInterval = setInterval(() => {
    // Non-linear progress — fast at first, slow near end
    const remaining = 100 - progress;
    const increment = Math.random() * (remaining * 0.15) + 1;
    progress = Math.min(progress + increment, 97);

    if (loadingBar) loadingBar.style.width = progress + '%';
    if (loadingPct) loadingPct.textContent = Math.floor(progress) + '%';
  }, 80);

  // Complete after minimum time
  setTimeout(() => {
    clearInterval(loadInterval);

    // Jump to 100%
    if (loadingBar) loadingBar.style.width = '100%';
    if (loadingPct) loadingPct.textContent = '100%';

    setTimeout(() => {
      // Fade out loading
      loadingEl.classList.add('fade-out');

      setTimeout(() => {
        loadingEl.style.display = 'none';
        // Start opening phase
        startOpeningPhase(openingEl, mainEl);
      }, 800);
    }, 300);
  }, 800);
})();

/* ================================================================
   2. OPENING PHASE — Apple-style greeting
================================================================ */
function startOpeningPhase(openingEl, mainEl) {
  openingEl.classList.add('visible');

  const wordEl   = document.getElementById('greeting-word');
  const langEl   = document.getElementById('greeting-lang');
  const dotsEl   = document.getElementById('opening-dots');
  const skipHint = document.getElementById('opening-skip-hint');

  if (!wordEl || !langEl) return;

  // Build progress dots
  if (dotsEl) {
    dotsEl.innerHTML = GREETINGS.map((_, i) =>
      `<div class="opening-dot${i === 0 ? ' active' : ''}" data-dot="${i}"></div>`
    ).join('');
  }

  let currentIndex = 0;
  let isRunning    = true;
  let greetingTimer;

  // Dynamic font size for long characters
  function setGreetingFontSize(word) {
    const len = word.length;
    let size;
    if      (len <= 4)  size = 'clamp(5rem, 18vw, 16rem)';
    else if (len <= 6)  size = 'clamp(4rem, 14vw, 12rem)';
    else if (len <= 8)  size = 'clamp(3rem, 11vw, 9rem)';
    else                size = 'clamp(2.5rem, 8vw, 7rem)';
    wordEl.style.fontSize = size;
  }

  function showGreeting(index, callback) {
    if (!isRunning) return;
    const g = GREETINGS[index];

    setGreetingFontSize(g.word);

    // Update dots
    document.querySelectorAll('.opening-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Animate in
    wordEl.textContent = g.word;
    langEl.textContent = g.lang;

    wordEl.classList.remove('greeting-anim-out');
    langEl.style.opacity = '0';
    langEl.style.transition = 'opacity 0.3s ease';

    void wordEl.offsetWidth; // force reflow
    wordEl.classList.add('greeting-anim-in');

    setTimeout(() => { langEl.style.opacity = '1'; }, 200);

    // Duration each greeting
    const DURATION = index === 0 ? 700 : 500; // first word holds a bit longer

    greetingTimer = setTimeout(() => {
      if (!isRunning) return;

      // Animate out
      wordEl.classList.remove('greeting-anim-in');
      wordEl.classList.add('greeting-anim-out');
      langEl.style.opacity = '0';

      setTimeout(() => {
        if (callback) callback();
      }, 350);
    }, DURATION);
  }

  function nextGreeting() {
    if (!isRunning) return;

    currentIndex++;

    if (currentIndex >= GREETINGS.length) {
      // All done — end opening
      endOpening();
      return;
    }

    showGreeting(currentIndex, nextGreeting);
  }

  function endOpening() {
    if (!isRunning) return;
    isRunning = false;
    clearTimeout(greetingTimer);

    // Fade out opening
    openingEl.classList.add('fade-out');

    setTimeout(() => {
      openingEl.style.display = 'none';
      document.body.style.overflow = '';

      // Show main content
      mainEl.classList.add('visible');

      // Trigger hero anims
      triggerHeroAnimations();
    }, 800);
  }

  // Skip on click/tap
  function handleSkip() {
    if (!isRunning) return;
    isRunning = false;
    clearTimeout(greetingTimer);
    openingSkipped = true;
    endOpening();
  }

  openingEl.addEventListener('click', handleSkip, { once: true });
  if (skipHint) skipHint.addEventListener('click', handleSkip, { once: true });

  // Start first greeting
  showGreeting(0, nextGreeting);
}

/* ================================================================
   3. CUSTOM CURSOR
================================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if ('ontouchstart' in window) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mousedown', () => {
    dot.classList.add('is-clicking');
    ring.classList.add('is-clicking');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('is-clicking');
    ring.classList.remove('is-clicking');
  });

  const HOVER_SEL = 'a,button,[data-cursor-hover],input,select,textarea,.project-card,.contact-card,.skill-card,.id-card-el';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_SEL)) {
      dot.classList.add('is-hovering');
      ring.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER_SEL)) {
      dot.classList.remove('is-hovering');
      ring.classList.remove('is-hovering');
    }
  });

  function lerp(a, b, f) { return a + (b - a) * f; }
  (function loop() {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ================================================================
   4. NAVBAR
================================================================ */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu= document.getElementById('mobile-menu');
  const navLinks  = document.querySelectorAll('.nav-link');
  const hamLines  = document.querySelectorAll('.hamburger-line');
  let isMobOpen   = false;
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;

    // Scrolled class
    navbar.classList.toggle('scrolled', sy > 60);

    // Hide on scroll down (desktop only)
    if (window.innerWidth > 768) {
      if (sy > lastScrollY + 8 && sy > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else if (sy < lastScrollY - 5) {
        navbar.style.transform = 'translateY(0)';
      }
    }

    lastScrollY = sy;
    updateActiveLink();
  }, { passive: true });

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 130 && r.bottom >= 130) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.dataset.section === current);
    });
  }

  mobileBtn?.addEventListener('click', () => {
    isMobOpen = !isMobOpen;
    mobileMenu.classList.toggle('open', isMobOpen);
    if (isMobOpen) {
      hamLines[0].style.transform = 'rotate(45deg) translate(4px,4px)';
      hamLines[1].style.opacity   = '0';
      hamLines[2].style.transform = 'rotate(-45deg) translate(3px,-3px)';
      hamLines[2].style.width     = '20px';
    } else {
      hamLines[0].style.transform = '';
      hamLines[1].style.opacity   = '';
      hamLines[2].style.transform = '';
      hamLines[2].style.width     = '';
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
})();

function closeMobileMenu() {
  const m  = document.getElementById('mobile-menu');
  const hl = document.querySelectorAll('.hamburger-line');
  if (m) {
    m.classList.remove('open');
    hl[0].style.transform = '';
    hl[1].style.opacity   = '';
    hl[2].style.transform = '';
    hl[2].style.width     = '';
  }
}

/* ================================================================
   5. THREE.JS — HERO BACKGROUND
================================================================ */
(function initThreeJS() {
  function waitForThree(cb) {
    if (typeof THREE !== 'undefined') cb();
    else setTimeout(() => waitForThree(cb), 100);
  }

  waitForThree(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particles
    const COUNT = window.innerWidth < 768 ? 1200 : 2800;
    const pos   = new Float32Array(COUNT * 3);
    const col   = new Float32Array(COUNT * 3);

    const COLORS = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#0ea5e9'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#22d3ee'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const r  = Math.random() * 80 + 10;
      const ph = Math.acos(-1 + (2 * i) / COUNT);
      const th = Math.sqrt(COUNT * Math.PI) * ph;

      pos[i3]   = r * Math.sin(ph) * Math.cos(th) + (Math.random() - 0.5) * 30;
      pos[i3+1] = r * Math.sin(ph) * Math.sin(th) + (Math.random() - 0.5) * 20;
      pos[i3+2] = r * Math.cos(ph)                + (Math.random() - 0.5) * 20;

      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      col[i3] = c.r; col[i3+1] = c.g; col[i3+2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Geometric wireframes
    const geos = [];
    function addGeo(geometry, color, x, y, z, scale, speeds) {
      const m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        wireframe: true,
        transparent: true,
        opacity: 0.05,
      });
      const mesh = new THREE.Mesh(geometry, m);
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      geos.push({ mesh, ...speeds, baseY: y });
      return mesh;
    }

    addGeo(new THREE.IcosahedronGeometry(6, 1), '#0ea5e9',  14, -6, -5,  1.2, { sx: 0.003, sy: 0.005, sz: 0.002, floats: true });
    addGeo(new THREE.OctahedronGeometry(4, 0),  '#8b5cf6', -18,  8, -8,  1.0, { sx: 0.005, sy: 0.003, sz: 0.004, floats: false });
    addGeo(new THREE.TorusGeometry(4,1.2,12,40),'#22d3ee',  18,  2, -10, 0.8, { sx: 0.004, sy: 0.006, sz: 0.003, floats: false });

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const pl1 = new THREE.PointLight(0x0ea5e9, 1.5, 60); pl1.position.set(20, 10, 10); scene.add(pl1);
    const pl2 = new THREE.PointLight(0x8b5cf6, 1.0, 50); pl2.position.set(-20, -5, 5); scene.add(pl2);

    // Mouse parallax
    let tmx = 0, tmy = 0, cmx = 0, cmy = 0;
    document.addEventListener('mousemove', e => {
      tmx = (e.clientX / window.innerWidth  - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma && e.beta) { tmx = e.gamma / 45; tmy = e.beta / 45 - 0.5; }
      });
    }

    // Scroll fade
    let scrollProg = 0;
    window.addEventListener('scroll', () => {
      const hero = document.getElementById('hero');
      if (hero) scrollProg = Math.min(window.scrollY / hero.offsetHeight, 1);
    }, { passive: true });

    const clock = new THREE.Clock();

    // Loop
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      cmx += (tmx - cmx) * 0.04;
      cmy += (tmy - cmy) * 0.04;

      particles.rotation.y = t * 0.025 + cmx * 0.07;
      particles.rotation.x = t * 0.012 + cmy * 0.035;

      camera.position.x += (cmx * 3 - camera.position.x) * 0.03;
      camera.position.y += (-cmy * 2 - camera.position.y) * 0.03;
      camera.position.z = 30 - scrollProg * 10;
      camera.lookAt(scene.position);

      geos.forEach(obj => {
        obj.mesh.rotation.x += obj.sx;
        obj.mesh.rotation.y += obj.sy;
        obj.mesh.rotation.z += obj.sz;
        if (obj.floats) {
          obj.mesh.position.y = obj.baseY + Math.sin(t * 0.7) * 2;
        }
      });

      pl1.position.x = Math.sin(t * 0.5) * 20;
      pl1.position.y = Math.cos(t * 0.3) * 10;
      pl2.position.x = Math.cos(t * 0.4) * 18;

      canvas.style.opacity = Math.max(0, 1 - scrollProg * 1.4).toString();
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
   6. HERO ANIMATIONS
================================================================ */
function triggerHeroAnimations() {
  const animEls = document.querySelectorAll('.hero-anim-el');
  animEls.forEach((el, i) => {
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)';
    setTimeout(() => el.classList.add('revealed'), 100 + i * 180);
  });

  setTimeout(initTypingEffect,  600);
  setTimeout(initScrollReveal,  200);
  setTimeout(() => animateCounter('counter-projects', 0, 10, 1400), 900);
}

/* ================================================================
   7. TYPING EFFECT
================================================================ */
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const texts = CONFIG.TYPING_TEXTS;
  let ti = 0, ci = 0, deleting = false;

  function type() {
    const txt = texts[ti];
    el.textContent = deleting
      ? txt.substring(0, ci - 1)
      : txt.substring(0, ci + 1);

    if (!deleting) {
      ci++;
      if (ci === txt.length) {
        setTimeout(() => { deleting = true; setTimeout(type, 55); }, 1800);
        return;
      }
    } else {
      ci--;
      if (ci === 0) {
        deleting = false;
        ti = (ti + 1) % texts.length;
        setTimeout(type, 250);
        return;
      }
    }

    setTimeout(type, deleting ? 30 : 60);
  }

  type();
}

/* ================================================================
   8. COUNTER ANIMATION
================================================================ */
function animateCounter(id, from, to, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  (function upd(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(2, -10 * p);
    el.textContent = Math.round(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(upd);
  })(start);
}

/* ================================================================
   9. SCROLL REVEAL
================================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Skill bars
          entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
            const w = bar.getAttribute('data-width');
            if (w) setTimeout(() => { bar.style.width = w + '%'; }, 200);
          });
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '-40px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

  // Scroll hint reveal
  const scrollHint = document.querySelector('.scroll-hint-el');
  if (scrollHint) {
    setTimeout(() => scrollHint.classList.add('revealed'), 2000);
  }
}

/* ================================================================
   10. DRAGGABLE ID CARD (Physics-based)
================================================================ */
(function initDraggableCard() {
  const card = document.getElementById('id-card');
  if (!card) return;

  let isDragging  = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let velX = 0, velY = 0;
  let lastX = 0, lastY = 0;
  let animFrame;
  let rotX = 0, rotY = 0; // tilt angles

  // Physics constants
  const DAMPING  = 0.88;
  const BOUNCE   = 0.3;
  const RETURN_SPRING = 0.08;
  const MAX_TILT = 20;

  function getEventPos(e) {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onDragStart(e) {
    if (e.type === 'mousedown') e.preventDefault();

    isDragging = true;
    card.classList.add('is-dragging');
    card.classList.remove('is-returning');

    const pos = getEventPos(e);
    startX = pos.x - currentX;
    startY = pos.y - currentY;
    lastX  = pos.x;
    lastY  = pos.y;
    velX = velY = 0;

    cancelAnimationFrame(animFrame);

    // Hide drag hint after first drag
    const hint = document.getElementById('id-card-drag-hint');
    if (hint) hint.style.opacity = '0';
  }

  function onDragMove(e) {
    if (!isDragging) return;
    if (e.type === 'mousemove') e.preventDefault();

    const pos = getEventPos(e);

    velX = pos.x - lastX;
    velY = pos.y - lastY;
    lastX = pos.x;
    lastY = pos.y;

    currentX = pos.x - startX;
    currentY = pos.y - startY;

    // Tilt based on velocity
    rotY =  velX * 2;
    rotX = -velY * 2;
    rotX = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotX));
    rotY = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotY));

    applyTransform();

    // Shine based on position
    updateShine(pos.x, pos.y);
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('is-dragging');

    // Physics release — momentum
    physicsLoop();
  }

  function physicsLoop() {
    if (isDragging) return;

    // Apply velocity
    currentX += velX;
    currentY += velY;

    // Damping
    velX *= DAMPING;
    velY *= DAMPING;

    // Spring return to center
    const returnForce = Math.abs(currentX) > 5 || Math.abs(currentY) > 5;

    if (!returnForce && Math.abs(velX) < 0.2 && Math.abs(velY) < 0.2) {
      // Snap back
      card.classList.add('is-returning');
      currentX = 0; currentY = 0;
      rotX = 0; rotY = 0;
      applyTransform();
      setTimeout(() => {
        card.classList.remove('is-returning');
        // Resume idle animation
        card.style.animation = '';
        card.style.transform = '';
      }, 600);
      return;
    }

    // Spring toward center
    currentX += (0 - currentX) * RETURN_SPRING;
    currentY += (0 - currentY) * RETURN_SPRING;

    // Tilt decay
    rotX *= 0.85;
    rotY *= 0.85;

    applyTransform();
    animFrame = requestAnimationFrame(physicsLoop);
  }

  function applyTransform() {
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    card.style.animation = 'none';
  }

  function updateShine(pageX, pageY) {
    const shine = document.getElementById('id-card-shine');
    if (!shine) return;
    const rect = card.getBoundingClientRect();
    const rx = (pageX - rect.left) / rect.width;
    const ry = (pageY - rect.top)  / rect.height;
    const angle = Math.atan2(ry - 0.5, rx - 0.5) * (180 / Math.PI);
    shine.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 80%)`;
    shine.style.opacity = '1';
  }

  // Events — mouse
  card.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  // Events — touch
  card.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('touchend', onDragEnd);
})();

/* ================================================================
   11. API FETCH — PROJECTS (TIDAK DIUBAH)
================================================================ */
let allProjects    = [];
let projectsLoaded = false;

function updateApiStatus(status, message) {
  const dot  = document.getElementById('api-status-dot');
  const text = document.getElementById('api-status-text');
  const bar  = document.getElementById('api-status');

  if (!dot || !text || !bar) return;
  bar.style.opacity = '1';

  const map = {
    loading: { bg: 'rgba(251,191,36,0.8)',  pulse: true  },
    success: { bg: 'rgba(74,222,128,0.8)',  pulse: false },
    error:   { bg: 'rgba(248,113,113,0.8)', pulse: false },
    empty:   { bg: 'rgba(100,116,139,0.8)', pulse: false },
  };

  const s = map[status] || map.loading;
  dot.style.background = s.bg;
  dot.style.animation  = s.pulse ? 'status-pulse 1.5s ease infinite' : 'none';
  text.textContent     = message;
  text.style.color     = s.bg;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
}

function truncateText(text, max) {
  if (!text) return '';
  return text.length <= max ? text : text.substring(0, max).trim() + '...';
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(text));
  return d.innerHTML;
}

function createProjectCard(project, cls) {
  const isLarge = cls === 'proj-bento-large';

  let techArr = [];
  if (Array.isArray(project.tech_stack)) techArr = project.tech_stack;
  else if (typeof project.tech_stack === 'string') {
    try { techArr = JSON.parse(project.tech_stack); }
    catch { techArr = project.tech_stack.split(',').map(s => s.trim()).filter(Boolean); }
  }

  const shown = techArr.slice(0, isLarge ? 6 : 4);
  const extra = techArr.length - shown.length;
  const imgH  = isLarge ? '260px' : '160px';

  const tags = shown.map(t => `<span class="proj-tag">${escapeHtml(t)}</span>`).join('')
    + (extra > 0 ? `<span class="proj-tag">+${extra}</span>` : '');

  const imgSrc = project.image_url || project.image_or_placeholder
    || `https://placehold.co/800x450/0a0a0a/1a1a1a?text=${encodeURIComponent(project.title || 'Project')}`;

  const demoLink = project.demo_link ? `
    <a href="${escapeHtml(project.demo_link)}" target="_blank" rel="noopener noreferrer"
       class="proj-link-demo" onclick="event.stopPropagation()">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
      </svg>Demo
    </a>` : '';

  const repoLink = project.repo_link ? `
    <a href="${escapeHtml(project.repo_link)}" target="_blank" rel="noopener noreferrer"
       class="proj-link-repo" onclick="event.stopPropagation()">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>Repo
    </a>` : '';

  const featured = project.is_featured ? `
    <span class="proj-featured-badge">
      <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>Featured
    </span>` : '';

  return `
    <div class="project-card ${cls}" onclick="openProjectModal(${project.id})">
      ${featured}
      <div class="relative overflow-hidden" style="height:${imgH}">
        <img src="${imgSrc}" alt="${escapeHtml(project.title)}"
             class="proj-img" style="height:${imgH}" loading="lazy"/>
        <div class="proj-img-gradient" style="height:${imgH}"></div>
        <div class="proj-hover" style="height:${imgH}">
          <div class="proj-hover-pill">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Lihat Detail
          </div>
        </div>
      </div>
      <div class="proj-body">
        <h3 class="proj-title ${isLarge ? 'text-xl' : 'text-base'}">${escapeHtml(project.title)}</h3>
        <p class="proj-desc">${escapeHtml(isLarge ? truncateText(project.description, 180) : truncateText(project.description, 90))}</p>
        <div class="proj-tags">${tags}</div>
        <div class="proj-links">
          <div class="flex items-center gap-2">${demoLink}${repoLink}</div>
          <span style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:rgba(255,255,255,0.25)">${formatDate(project.created_at)}</span>
        </div>
      </div>
    </div>`;
}

function renderProjectsBentoGrid(projects) { 
  const grid = document.getElementById('projects-grid'); 
  if (!grid) return;

  if (projects.length === 0) { 
    grid.classList.add('hidden'); 
    document.getElementById('projects-empty')?.classList.remove('hidden'); 
    return; 
  }

  let html = ''; 
  projects.forEach((p, i) => { 
    let cls; 
    const cycle = i % 7; 
    if (cycle === 0) cls = 'proj-bento-large'; 
    else if (cycle === 3) cls = 'proj-bento-wide'; 
    else cls = 'proj-bento-med'; 
    if (p.is_featured && i < 2) cls = 'proj-bento-large'; 
    html += createProjectCard(p, cls); 
  });

  grid.innerHTML = html; 
  grid.classList.remove('hidden');

  // Add bento classes — CEK LEBAR LAYAR DULU
  const isMobile = window.innerWidth <= 640;
  const isTablet = window.innerWidth <= 1024;
  
  grid.querySelectorAll('.proj-bento-large').forEach(el => { 
    if (!isMobile) {
      el.style.gridColumn = 'span 2'; 
      el.style.gridRow = 'span 2';
    } else {
      el.style.gridColumn = '';
      el.style.gridRow = '';
    }
  }); 
  
  grid.querySelectorAll('.proj-bento-wide').forEach(el => { 
    if (!isMobile && !isTablet) {
      el.style.gridColumn = 'span 3';
    } else if (!isMobile) {
      el.style.gridColumn = 'span 2';
    } else {
      el.style.gridColumn = '';
    }
  });

  // Handle resize — update grid spans
  const handleResize = () => {
    const mob = window.innerWidth <= 640;
    const tab = window.innerWidth <= 1024;
    
    grid.querySelectorAll('.proj-bento-large').forEach(el => {
      el.style.gridColumn = mob ? '' : 'span 2';
      el.style.gridRow = mob ? '' : 'span 2';
    });
    grid.querySelectorAll('.proj-bento-wide').forEach(el => {
      if (mob) el.style.gridColumn = '';
      else if (tab) el.style.gridColumn = 'span 2';
      else el.style.gridColumn = 'span 3';
    });
  };
  
  window.addEventListener('resize', handleResize, { passive: true });

  // Stagger reveal
  grid.querySelectorAll('.project-card').forEach((card, i) => { 
    card.style.opacity = '0'; 
    card.style.transform = 'translateY(16px)'; 
    setTimeout(() => { 
      card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease'; 
      card.style.opacity = '1'; 
      card.style.transform = 'translateY(0)'; 
    }, i * 65); 
  }); 
}

async function fetchProjects() {
  const skeleton = document.getElementById('projects-skeleton');
  const grid     = document.getElementById('projects-grid');
  const error    = document.getElementById('projects-error');
  const empty    = document.getElementById('projects-empty');
  const footer   = document.getElementById('projects-footer');

  if (skeleton) skeleton.style.display = 'grid';
  if (grid)     grid.classList.add('hidden');
  if (error)    error.classList.add('hidden');
  if (empty)    empty.classList.add('hidden');
  if (footer)   footer.classList.add('hidden');

  updateApiStatus('loading', 'Menghubungkan ke API backend...');

  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 10000);

    const res = await fetch(CONFIG.API_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      signal: ctrl.signal,
    });

    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();
    if (!data || typeof data !== 'object') throw new Error('Format response tidak valid.');

    let projects = [];
    if (Array.isArray(data))                              projects = data;
    else if (data.data && Array.isArray(data.data))       projects = data.data;
    else if (data.projects && Array.isArray(data.projects)) projects = data.projects;
    else if (data.data?.data && Array.isArray(data.data.data)) projects = data.data.data;
    else throw new Error('Struktur data tidak dikenali.');

    allProjects    = projects;
    projectsLoaded = true;

    if (skeleton) skeleton.style.display = 'none';

    if (projects.length === 0) {
      updateApiStatus('empty', 'API berhasil. Belum ada project yang dipublikasikan.');
      empty?.classList.remove('hidden');
      return;
    }

    renderProjectsBentoGrid(projects);

    const ct = document.getElementById('projects-count-text');
    if (ct) ct.textContent = `Menampilkan ${projects.length} project`;
    footer?.classList.remove('hidden');

    updateApiStatus('success', `API terhubung — ${projects.length} project berhasil dimuat`);
    animateCounter('counter-projects', 0, Math.max(projects.length, 10), 1200);

  } catch (err) {
    console.error('[Portfolio] Gagal fetch:', err);
    if (skeleton) skeleton.style.display = 'none';
    grid?.classList.add('hidden');
    error?.classList.remove('hidden');

    let msg = 'Tidak dapat terhubung ke API backend.';
    if (err.name === 'AbortError')              msg = 'Request timeout. Backend mungkin tidak aktif.';
    else if (err.message.includes('Failed to fetch')) msg = `Pastikan backend berjalan di: ${CONFIG.API_BASE_URL}`;
    else if (err.message.includes('HTTP 404'))  msg = 'Endpoint API tidak ditemukan.';
    else if (err.message.includes('HTTP 5'))    msg = 'Server backend error. Cek log Laravel.';
    else                                        msg = err.message || 'Error tidak diketahui.';

    const em = document.getElementById('error-message');
    if (em) em.textContent = msg;
    updateApiStatus('error', `Gagal — ${msg}`);
  }
}

/* ================================================================
   12. PROJECT MODAL
================================================================ */
function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  const modal   = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  let techArr = [];
  if (Array.isArray(project.tech_stack)) techArr = project.tech_stack;
  else if (typeof project.tech_stack === 'string') {
    try { techArr = JSON.parse(project.tech_stack); }
    catch { techArr = project.tech_stack.split(',').map(s => s.trim()).filter(Boolean); }
  }

  const imgSrc = project.image_url || project.image_or_placeholder
    || `https://placehold.co/800x450/0a0a0a/1a1a1a?text=${encodeURIComponent(project.title || 'Project')}`;

  content.innerHTML = `
    <div class="flex justify-center pt-3 pb-1 sm:hidden">
      <div class="w-10 h-1 rounded-full bg-white/10"></div>
    </div>

    <div class="relative overflow-hidden rounded-t-3xl sm:rounded-t-3xl" style="height:200px">
      <img src="${imgSrc}" alt="${escapeHtml(project.title)}"
           class="w-full h-full object-cover"/>
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] to-transparent"></div>
      ${project.is_featured ? `
        <span class="proj-featured-badge">
          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>Featured
        </span>` : ''}
      <button onclick="closeProjectModal()"
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              aria-label="Tutup">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="px-6 pb-8 pt-5 space-y-6">
      <div>
        <h2 class="font-display font-black text-white text-2xl sm:text-3xl leading-tight mb-1">
          ${escapeHtml(project.title)}
        </h2>
        ${project.slug ? `<p style="font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:rgba(255,255,255,0.2)">${escapeHtml(project.slug)}</p>` : ''}
      </div>

      <div>
        <p style="font-family:'JetBrains Mono',monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.25);margin-bottom:10px">Deskripsi</p>
        <p style="font-size:0.9rem;line-height:1.7;color:rgba(255,255,255,0.65)">${escapeHtml(project.description || 'Tidak ada deskripsi.')}</p>
      </div>

      ${techArr.length > 0 ? `
        <div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.25);margin-bottom:10px">Tech Stack</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${techArr.map(t => `
              <span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:9999px;font-family:'JetBrains Mono',monospace;font-size:0.7rem;font-weight:600;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.18);color:#38bdf8">
                ${escapeHtml(t)}
              </span>`).join('')}
          </div>
        </div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px">
        <div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:rgba(255,255,255,0.25);margin-bottom:4px">Dibuat</p>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.8)">${formatDate(project.created_at)}</p>
        </div>
        <div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:rgba(255,255,255,0.25);margin-bottom:4px">Diperbarui</p>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.8)">${formatDate(project.updated_at)}</p>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${project.demo_link ? `
          <a href="${escapeHtml(project.demo_link)}" target="_blank" rel="noopener noreferrer"
             class="btn-primary" style="flex:1;justify-content:center;min-width:120px">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>Buka Aplikasi
          </a>` : ''}
        ${project.repo_link ? `
          <a href="${escapeHtml(project.repo_link)}" target="_blank" rel="noopener noreferrer"
             class="btn-outline" style="flex:1;justify-content:center;min-width:120px">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>Kode Sumber
          </a>` : ''}
        <!-- <button onclick="closeProjectModal()"
                class="btn-outline" style="flex:1;justify-content:center;min-width:100px">
          Tutup
        </button> -->
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const closeBtn = content.querySelector('button[onclick="closeProjectModal()"]');
    if (closeBtn) closeBtn.focus();
  }, 300);
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProjectModal();
});

/* ================================================================
   13. FOOTER YEAR
================================================================ */
(function() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ================================================================
   14. INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();

  // API bar reveal observer
  const apiBar = document.getElementById('api-status');
  if (apiBar) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) apiBar.style.opacity = '1';
    }, { threshold: 0.1 }).observe(apiBar);
  }

  // Reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const c = document.getElementById('hero-canvas');
    if (c) c.style.display = 'none';
  }

  console.log('%c Kevin Al Faridzi — Portfolio v3.0 ',
    'background:#000;color:#fff;font-weight:bold;padding:8px 16px;border-radius:8px;font-family:monospace;font-size:13px;border:1px solid rgba(255,255,255,0.1)');
  console.log(`%c API: ${CONFIG.API_ENDPOINT}`,
    'color:rgba(56,189,248,0.7);font-family:monospace;font-size:11px');
});

/* ================================================================
   15. ERROR HANDLERS
================================================================ */
window.addEventListener('error', e => {
  if (e.filename?.includes('three')) return;
  console.warn('[Portfolio] Error:', e.message);
});
window.addEventListener('unhandledrejection', e => {
  console.warn('[Portfolio] Rejection:', e.reason);
  e.preventDefault();
});