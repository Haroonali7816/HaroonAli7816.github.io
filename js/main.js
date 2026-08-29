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
   14. PROJECTS — horizontal scroll/drag strip with dot pagination
   ========================================================================== */
(function initProjectScroll() {
  const scroller = document.getElementById('project-scroll');
  const dotsWrap = document.getElementById('project-dots');
  if (!scroller || !dotsWrap) return;

  const cards = Array.from(scroller.querySelectorAll('.project-card'));

  // Clone the set once and append it, so scrolling past the last real card
  // continues seamlessly into an identical-looking "01" instead of stopping.
  const clones = cards.map((card) => {
    const clone = card.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
    scroller.appendChild(clone);
    return clone;
  });

  // Build one dot per project; click scrolls that card into view.
  const dots = cards.map((card, i) => {
    const dot = document.createElement('button');
    dot.className = 'project-dot';
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => {
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });
  if (dots.length) dots[0].classList.add('active');

  // Map both the real cards and their clones back to the same dot index.
  const indexOfNode = new Map();
  cards.forEach((c, i) => indexOfNode.set(c, i));
  clones.forEach((c, i) => indexOfNode.set(c, i));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const i = indexOfNode.get(entry.target);
          if (i === undefined) return;
          dots.forEach((d) => d.classList.remove('active'));
          if (dots[i]) dots[i].classList.add('active');
        }
      });
    },
    { root: scroller, threshold: 0.6 }
  );
  cards.forEach((card) => activeObserver.observe(card));
  clones.forEach((clone) => activeObserver.observe(clone));

  // Once scrolling settles inside the cloned set, jump back by exactly one
  // set-width — the clone sits pixel-for-pixel where the real card would,
  // so the jump is invisible and scrolling just continues into "01".
  let loopWidth = 0;
  const computeLoopWidth = () => {
    if (clones.length && cards.length) {
      loopWidth = clones[0].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    }
  };
  computeLoopWidth();
  window.addEventListener('resize', computeLoopWidth);

  let scrollSettleTimer = null;
  scroller.addEventListener('scroll', () => {
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer = setTimeout(() => {
      if (loopWidth > 0 && scroller.scrollLeft >= loopWidth - 2) {
        scroller.scrollLeft -= loopWidth;
      }
    }, 120);
  });

  // Click-and-drag scrolling for desktop mice (touch/trackpad already
  // scroll natively via overflow-x + scroll-snap).
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startScroll = 0;

  scroller.addEventListener('mousedown', (e) => {
    isDown = true;
    dragged = false;
    scroller.classList.add('dragging');
    startX = e.pageX;
    startScroll = scroller.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const delta = e.pageX - startX;
    if (Math.abs(delta) > 5) dragged = true;
    scroller.scrollLeft = startScroll - delta;
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    scroller.classList.remove('dragging');
  });

  // Don't let a drag-release also fire the card's "View Code" link.
  scroller.addEventListener(
    'click',
    (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    },
    true
  );
})();

/* ==========================================================================
   15. AMBIENT BACKGROUND GRAPH — a sparse, slow-drifting node graph. Kept
   deliberately minimal (few nodes, slow motion, one muted color) so it
   reads as a quiet generative sketch rather than a dense particle template.
   ========================================================================== */
(function initBgGraph() {
  const canvas = document.getElementById('bg-graph');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, nodes = [];
  let rgb = [232, 163, 61]; // fallback amber, replaced below from the live theme

  function readAccentColor() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const m = hex.replace('#', '').match(/.{1,2}/g);
    if (m && m.length === 3) rgb = m.map((x) => parseInt(x, 16));
  }
  readAccentColor();

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function seedNodes() {
    const count = Math.max(26, Math.min(55, Math.round((w * h) / 32000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
    }));
  }

  resize();
  seedNodes();
  window.addEventListener('resize', () => { resize(); seedNodes(); });

  // Re-read the accent when the theme is toggled (amber in dark, bronze in light).
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => setTimeout(readAccentColor, 0));

  const LINK_DIST = 150;

  function drawFrame() {
    ctx.clearRect(0, 0, w, h);
    const [cr, cg, cb] = rgb;

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x <= 0 || n.x >= w) n.vx *= -1;
      if (n.y <= 0 || n.y >= h) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.2;
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.9)`;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.7)`;
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    if (!prefersReducedMotion) requestAnimationFrame(drawFrame);
  }

  drawFrame();
})();
