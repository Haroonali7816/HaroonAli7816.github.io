/* ==========================================================================
   1. LOADER — fast eased fill from 0% to 100%, then fades out
   ========================================================================== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const percentText = document.getElementById('loader-percent');
  const fill = document.getElementById('loader-fill');
  const duration = 650; // ms — quick and smooth
  const start = performance.now();

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
  '.skill-card',
  '.timeline-item',
  '.project-card',
  '.skills-grid span',
  '#contact p',
  '.contact-links a',
  '.hero-stats .stat'
];

const revealElements = document.querySelectorAll(revealSelectors.join(','));
revealElements.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 6) * 70}ms`; // subtle cascade within groups
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
   6.5. CUSTOM CURSOR
   ========================================================================== */
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX + 'px';
    const y = e.clientY + 'px';
    cursorDot.style.left = x;
    cursorDot.style.top = y;
    cursorRing.style.left = x;
    cursorRing.style.top = y;
  });

  const interactiveSelectors = 'a, button, .project-card, .skill-card, .stat, input, textarea';
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });
}

/* ==========================================================================
   8. SITE SEARCH — lightweight in-page navigation search
   ========================================================================== */
const searchIndex = [
  { label: 'About',                          id: 'about',           keywords: 'about summary bio who is haroon' },
  { label: 'Technical Skills',                id: 'about',           keywords: 'skills java python c c++ html css javascript git ocaml sql linux' },
  { label: 'Education — Saarland University', id: 'education',       keywords: 'education university saarland bsc computer science degree study' },
  { label: 'Experience — Teaching Assistant', id: 'experience',      keywords: 'experience work job teaching assistant statistics' },
  { label: 'Projects',                        id: 'projects',        keywords: 'projects portfolio work code repos' },
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
  const words = ['systems', 'compilers', 'algorithms', 'neural networks', 'machines'];
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