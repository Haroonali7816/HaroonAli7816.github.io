/* ==========================================================================
   1. LOADER — fast eased fill from 0% to 100%, then fades out
   ========================================================================== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const percentText = document.getElementById('loader-percent');
  const fill = document.getElementById('loader-fill');
  const duration = 350; // ms — quick and smooth
  const start = performance.now();

  // Quick, dim build-log flicker behind the percentage — a fast nod to a
  // real compile, not a decorative loop. Skipped for reduced-motion.
  const logEl = document.getElementById('loader-log');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let logInterval = null;
  if (logEl && !prefersReducedMotion) {
    const logLines = ['resolving dependencies…', 'compiling modules…', 'linking objects…', 'optimizing build…'];
    let li = 0;
    logInterval = setInterval(() => {
      logEl.textContent = logLines[li % logLines.length];
      logEl.classList.remove('flicker');
      void logEl.offsetWidth; // restart the animation
      logEl.classList.add('flicker');
      li++;
    }, 90);
  }

  function tick(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic, feels snappy
    const pct = Math.round(eased * 100);
    percentText.textContent = pct + '%';
    fill.style.width = (eased * 100) + '%';

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      if (logInterval) clearInterval(logInterval);
      setTimeout(() => loader.classList.add('hidden'), 200);
    }
  }
  requestAnimationFrame(tick);
});

/* ==========================================================================
   2. THEME TOGGLE (light / dark)
   ========================================================================== */
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyEl = document.body;

// Load saved preference, default to dark
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  bodyEl.classList.add('light');
  themeToggleBtn.textContent = '☀';
} else {
  themeToggleBtn.textContent = '🌙';
}

themeToggleBtn.addEventListener('click', () => {
  bodyEl.classList.toggle('light');
  const isLight = bodyEl.classList.contains('light');
  themeToggleBtn.textContent = isLight ? '☀' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

/* ==========================================================================
   3. SKILLS MARQUEE — duplicate track content for a seamless infinite loop
   ========================================================================== */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.innerHTML += marqueeTrack.innerHTML; // duplicate once
}

/* ==========================================================================
   4. ANIMATED STAT COUNTERS — count up when hero scrolls into view
   ========================================================================== */
const statNumbers = document.querySelectorAll('.stat-number');

const animateCounter = (el) => {
  const target = parseInt(el.getAttribute('data-target'), 10);
  let current = 0;
  const duration = 1200; // ms
  const stepTime = 30;
  const steps = duration / stepTime;
  const increment = target / steps;

  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(counter);
    } else {
      el.textContent = Math.floor(current);
    }
  }, stepTime);
};

const statsObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      statNumbers.forEach(animateCounter);
      observer.disconnect(); // only run once
    }
  });
}, { threshold: 0.4 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ==========================================================================
   5. SCROLL REVEAL ANIMATIONS
   Automatically tags key elements with .reveal, then fades them in
   as they enter the viewport using IntersectionObserver.
   ========================================================================== */
const revealSelectors = [
  '.section-label',
  'section h2',
  '#about .about-text',
  '.timeline-item',
  '.project-card',
  '.skills-grid span',
  '#contact p',
  '.contact-entry',
  '.hero-stats .stat'
];

const revealElements = document.querySelectorAll(revealSelectors.join(','));
revealElements.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 6) * 30}ms`; // subtle cascade within groups
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // animate once
    }
  });
}, { threshold: 0.15 });

revealElements.forEach((el) => revealObserver.observe(el));


/* ==========================================================================
   8. SITE SEARCH — lightweight in-page navigation search
   ========================================================================== */
const searchIndex = [
  { label: 'About',                          id: 'about',           keywords: 'about summary bio who is haroon' },
  { label: 'Technical Skills',                id: 'about',           keywords: 'skills java python c c++ html css javascript git ocaml sql linux' },
  { label: 'Skills',                          id: 'skills-panel',    keywords: 'skills toolkit languages frameworks tools github stats' },
  { label: 'Education: Saarland University',  id: 'education',       keywords: 'education university saarland bsc computer science degree study' },
  { label: 'Experience: Teaching Assistant',   id: 'experience',      keywords: 'experience work job teaching assistant statistics' },
  { label: 'Projects',                        id: 'projects',        keywords: 'projects portfolio work code repos' },
  { label: 'Incident Triage Copilot',         id: 'project-triage',  keywords: 'incident triage copilot fastapi langchain gemini rag chromadb sqlalchemy ai llm agent' },
  { label: 'German Energy Market Analytics',  id: 'project-energy',  keywords: 'german energy market analytics smard sql sqlalchemy power bi dax pandas data engineering' },
  { label: 'TinyC Compiler & Verification',   id: 'project-tinyc',   keywords: 'tinyc compiler verification java riscv static analysis junit' },
  { label: 'Ultimate Tic-Tac-Toe Engine',     id: 'project-uttt',    keywords: 'tic tac toe uttt java oop mvc game' },
  { label: 'RayCast',                         id: 'project-raycast', keywords: 'raycast graphics c engine 2.5d systems' },
  { label: '2048 Game',                       id: 'project-2048',    keywords: '2048 riscv assembly game low-level' },
  { label: 'Wordle (Trie-Based)',             id: 'project-wordle',  keywords: 'wordle trie word game algorithms c' },
  { label: 'Titanic Survival Prediction',     id: 'project-titanic', keywords: 'titanic machine learning python scikit-learn pandas ml' },
  { label: 'Contact',                         id: 'contact',         keywords: 'contact email linkedin github reach out message' },
];

const searchInput = document.getElementById('site-search');
const searchResultsEl = document.getElementById('search-results');

if (searchInput && searchResultsEl) {
  let activeIndex = -1;

  const renderResults = (matches) => {
    searchResultsEl.innerHTML = '';
    if (matches.length === 0) {
      searchResultsEl.innerHTML = '<div class="no-results">No matches found</div>';
    } else {
      matches.forEach((match) => {
        const link = document.createElement('a');
        link.href = `#${match.id}`;
        link.textContent = match.label;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          goToResult(match.id);
        });
        searchResultsEl.appendChild(link);
      });
    }
    activeIndex = -1;
    searchResultsEl.classList.add('visible');
  };

  const goToResult = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    searchResultsEl.classList.remove('visible');
    navSearchWrap.classList.remove('expanded');
    searchInput.value = '';
    searchInput.blur();
  };

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResultsEl.classList.remove('visible');
      return;
    }
    const matches = searchIndex.filter((item) =>
      item.label.toLowerCase().includes(query) || item.keywords.includes(query)
    );
    renderResults(matches);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) searchResultsEl.classList.add('visible');
  });

  searchInput.addEventListener('keydown', (e) => {
    const links = Array.from(searchResultsEl.querySelectorAll('a'));
    if (links.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % links.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + links.length) % links.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = links[activeIndex] || links[0];
      chosen.click();
      return;
    } else if (e.key === 'Escape') {
      searchResultsEl.classList.remove('visible');
      navSearchWrap.classList.remove('expanded');
      searchInput.value = '';
      searchInput.blur();
      return;
    } else {
      return;
    }

    links.forEach((l) => l.classList.remove('active-result'));
    links[activeIndex].classList.add('active-result');
  });
}

const searchToggleBtn = document.getElementById('search-toggle');
const navSearchWrap = document.getElementById('nav-search');

if (searchToggleBtn && navSearchWrap && searchInput) {
  searchToggleBtn.addEventListener('click', () => {
    navSearchWrap.classList.toggle('expanded');
    if (navSearchWrap.classList.contains('expanded')) {
      searchInput.focus();
    } else {
      searchInput.value = '';
      searchResultsEl.classList.remove('visible');
    }
  });
}

document.addEventListener('click', (e) => {
  if (!navSearchWrap.contains(e.target)) {
    searchResultsEl.classList.remove('visible');
    if (!searchInput.value.trim()) {
      navSearchWrap.classList.remove('expanded');
    }
  }
});

/* ==========================================================================
   10. HERO ROTATING WORD — cycles the highlighted word for a curiosity hook
   ========================================================================== */
const rotatingWordEl = document.getElementById('rotating-word');
if (rotatingWordEl) {
  const words = ['language models', 'data pipelines', 'systems', 'compilers', 'machines'];
  let wordIndex = 0;

  setInterval(() => {
    rotatingWordEl.classList.add('swap');
    setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotatingWordEl.textContent = words[wordIndex];
      rotatingWordEl.classList.remove('swap');
    }, 250);
  }, 2200);
}

/* ==========================================================================
   11. NAVBAR — subtle shadow/background boost on scroll (optional polish)
   ========================================================================== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});


/* ==========================================================================
   12. MOBILE MENU — hamburger toggle for the slide-down drawer
   ========================================================================== */
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuToggle && mobileMenu) {
  const closeMobileMenu = () => {
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
  };

  mobileMenuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenuToggle.classList.toggle('active', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });
}

/* ==========================================================================
   14. AMBIENT BACKGROUND — a sparse field of circuit-trace / syntax-tree
   paths: each one a short Manhattan-routed line (like a PCB trace or an
   AST branch) ending in a small pad, with a faint pulse of "signal"
   travelling along it on a loop. Deliberately sparse and quiet (one muted
   color, slow pulses) so it reads as a purposeful technical motif rather
   than a decorative particle template.
   ========================================================================== */
(function initBgGraph() {
  const canvas = document.getElementById('bg-graph');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, traces = [];
  let rgb = [232, 163, 61]; // fallback amber, replaced below from the live theme
  let isLight = false;
  // Same numeric alpha reads far more intense on a light background than a
  // dark one, so line/pad/pulse opacity is scaled down per theme.
  let alphaScale = 1;

  function readTheme() {
    isLight = document.body.classList.contains('light');
    alphaScale = isLight ? 0.8 : 1;
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const m = hex.replace('#', '').match(/.{1,2}/g);
    if (m && m.length === 3) rgb = m.map((x) => parseInt(x, 16));
  }
  readTheme();

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // Build one Manhattan-routed path (1-2 right-angle bends) starting near
  // (x, y): a trunk segment, then a branch, mimicking a PCB trace or a
  // branching AST edge rather than an arbitrary line. `dir` biases the
  // horizontal direction (-1 or 1) so traces confined to a margin keep
  // routing toward the viewport edge instead of drifting back over content.
  function buildTrace(x, y, dir, maxLen) {
    const points = [{ x, y }];
    const bends = 1 + Math.round(Math.random());
    let cx = x, cy = y;
    let horizontal = true;
    for (let i = 0; i < bends; i++) {
      const len = Math.min(50 + Math.random() * 140, maxLen);
      if (horizontal) cx += len * dir; else cy += len * (Math.random() < 0.5 ? -1 : 1);
      points.push({ x: cx, y: cy });
      horizontal = !horizontal;
    }
    const segLengths = [];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      segLengths.push(d);
      total += d;
    }
    return {
      points,
      segLengths,
      total,
      duration: 4000 + Math.random() * 4000,
      delay: Math.random() * 6000,
    };
  }

  // Traces are confined to the empty margins outside the page's text column
  // (--max-width) so they never run behind paragraphs or cards, at any
  // scroll position — only decorate genuinely empty space either side.
  function seedTraces() {
    const maxContentWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--max-width')) || 1100;
    const margin = (w - maxContentWidth) / 2 - 16; // leave a small gap from the content edge too
    traces = [];
    if (margin < 30) return; // only truly narrow/mobile viewports have no safe margin at all

    // Segment length scales with the available margin (via buildTrace's
    // maxLen clamp) so this still looks right on a merely-tight margin,
    // not just a generous one — no hard cliff at common laptop widths.
    const zones = [
      { from: 0, to: margin, dir: -1 },
      { from: w - margin, to: w, dir: 1 },
    ];
    const perZone = Math.max(7, Math.min(18, Math.round((h * margin) / 26000)));
    zones.forEach((zone) => {
      for (let i = 0; i < perZone; i++) {
        const x = zone.dir === -1 ? zone.to - Math.random() * margin * 0.85 : zone.from + Math.random() * margin * 0.85;
        const y = Math.random() * h;
        traces.push(buildTrace(x, y, zone.dir, margin * 0.9));
      }
    });
  }

  resize();
  seedTraces();
  window.addEventListener('resize', () => { resize(); seedTraces(); });

  // Re-read the theme when it's toggled (amber in dark, bronze in light).
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => setTimeout(readTheme, 0));

  // Position of the traveling "signal" pulse at fraction t (0-1) along a trace.
  function pointAt(trace, t) {
    let dist = t * trace.total;
    for (let i = 0; i < trace.segLengths.length; i++) {
      const segLen = trace.segLengths[i];
      if (dist <= segLen || i === trace.segLengths.length - 1) {
        const p0 = trace.points[i];
        const p1 = trace.points[i + 1];
        const f = segLen > 0 ? Math.min(dist / segLen, 1) : 0;
        return { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f };
      }
      dist -= segLen;
    }
    return trace.points[trace.points.length - 1];
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, w, h);
    const [cr, cg, cb] = rgb;

    traces.forEach((trace) => {
      // The static trace path.
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.32 * alphaScale})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(trace.points[0].x, trace.points[0].y);
      for (let i = 1; i < trace.points.length; i++) ctx.lineTo(trace.points[i].x, trace.points[i].y);
      ctx.stroke();

      // A small pad at each end, like a solder pad / AST leaf node.
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.55 * alphaScale})`;
      [trace.points[0], trace.points[trace.points.length - 1]].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        // A faint pulse travels the trace on a loop, reading as a signal
        // moving through a circuit rather than a randomly drifting particle.
        const t = ((now + trace.delay) % trace.duration) / trace.duration;
        const p = pointAt(trace, t);
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${0.9 * alphaScale})`;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.85 * alphaScale})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    if (!prefersReducedMotion) requestAnimationFrame(drawFrame);
  }

  drawFrame(0);
})();
