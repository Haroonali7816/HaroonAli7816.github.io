/* Theme toggle: cycles System -> Light -> Dark. "System" leaves the
   data-theme attribute off so the OS preference decides. */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const label = document.getElementById('theme-value');
  const order = ['system', 'light', 'dark'];
  const names = { system: 'System', light: 'Light', dark: 'Dark' };

  let current = 'system';
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') current = saved;
  } catch (e) {}

  function apply(mode) {
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    if (label) label.textContent = names[mode];
    try {
      if (mode === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', mode);
    } catch (e) {}
  }

  apply(current);
  if (btn) {
    btn.addEventListener('click', () => {
      current = order[(order.indexOf(current) + 1) % order.length];
      apply(current);
    });
  }
})();

/* Highlight the nav link for the section currently in view. */
(function () {
  const links = Array.from(document.querySelectorAll('.rail-nav a'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-35% 0px -60% 0px' }
  );
  sections.forEach((s) => observer.observe(s));
})();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Small toast for feedback ("Copied", etc.). */
const toast = (() => {
  const el = document.getElementById('toast');
  let timer;
  return (msg) => {
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('is-visible'), 1800);
  };
})();

/* Scroll to an element and briefly outline it. */
function jumpTo(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  if (el.matches('.project, .more li')) {
    el.classList.remove('is-flash');
    void el.offsetWidth;
    el.classList.add('is-flash');
  }
}

/* ---------- Run checks: each check goes pending, then passes in turn ---------- */
function runChecks(project) {
  const items = Array.from(project.querySelectorAll('.checks li'));
  const btn = project.querySelector('.run-btn');
  const status = project.querySelector('.run-status');
  if (!items.length || (btn && btn.disabled)) return;

  if (btn) btn.disabled = true;
  if (status) status.textContent = 'running…';
  items.forEach((li) => { li.classList.remove('is-pass'); li.classList.add('is-pending'); });

  const step = reduceMotion ? 0 : 420;
  const start = performance.now();
  items.forEach((li, i) => {
    setTimeout(() => {
      li.classList.remove('is-pending');
      li.classList.add('is-pass');
      if (i === items.length - 1) {
        const secs = ((performance.now() - start) / 1000).toFixed(1);
        if (status) status.textContent = `${items.length}/${items.length} passed · ${secs}s`;
        if (btn) { btn.disabled = false; btn.textContent = 'Run again'; }
      }
    }, step * (i + 1));
  });
}

document.querySelectorAll('.project').forEach((project) => {
  const btn = project.querySelector('.run-btn');
  if (btn) btn.addEventListener('click', () => runChecks(project));

  // Cursor spotlight
  project.addEventListener('pointermove', (e) => {
    const r = project.getBoundingClientRect();
    project.style.setProperty('--mx', `${e.clientX - r.left}px`);
    project.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Run each project's checks once, the first time it scrolls into view.
if ('IntersectionObserver' in window && !reduceMotion) {
  const seen = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runChecks(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.55 });
  document.querySelectorAll('.project').forEach((p) => seen.observe(p));
}

/* ---------- Project filters ---------- */
(function () {
  const buttons = Array.from(document.querySelectorAll('.filter'));
  const items = Array.from(document.querySelectorAll('.projects .project, .more li'));
  const moreTitle = document.querySelector('.more-title');
  const moreItems = Array.from(document.querySelectorAll('.more li'));

  const matches = (el, f) => f === 'all' || (el.dataset.cat || '').split(' ').includes(f);

  buttons.forEach((b) => {
    const count = items.filter((el) => matches(el, b.dataset.filter)).length;
    const slot = b.querySelector('.filter-count');
    if (slot) slot.textContent = count;
  });

  function apply(f) {
    buttons.forEach((b) => {
      const on = b.dataset.filter === f;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    items.forEach((el) => {
      const show = matches(el, f);
      const wasHidden = el.hidden;
      el.hidden = !show;
      if (show && wasHidden && !reduceMotion) {
        el.classList.remove('is-entering');
        void el.offsetWidth;
        el.classList.add('is-entering');
      }
    });
    if (moreTitle) moreTitle.hidden = moreItems.every((li) => li.hidden);
  }

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  window.__showAllProjects = () => apply('all');
})();

/* ---------- Skills: select one to see where it was used ---------- */
(function () {
  const chips = Array.from(document.querySelectorAll('.skill'));
  const readout = document.getElementById('skill-readout');
  if (!readout) return;

  const titleOf = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const t = el.querySelector('.project-title, .more-name');
    return t ? t.textContent.trim() : null;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const wasOn = chip.classList.contains('is-on');
      chips.forEach((c) => c.classList.remove('is-on'));
      readout.textContent = '';
      if (wasOn) return;
      chip.classList.add('is-on');

      const ids = (chip.dataset.used || '').split(' ').filter(Boolean);
      const name = chip.textContent.trim();
      if (!ids.length) {
        readout.textContent = `${name}: used in coursework and day-to-day work rather than a featured project.`;
        return;
      }
      readout.append(`${name} is used in `);
      ids.forEach((id, i) => {
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = titleOf(id) || id;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.__showAllProjects) window.__showAllProjects();
          jumpTo(document.getElementById(id));
        });
        readout.append(a);
        if (i < ids.length - 2) readout.append(', ');
        else if (i === ids.length - 2) readout.append(' and ');
      });
      readout.append('.');
    });
  });
})();

/* ---------- Copy email ---------- */
(function () {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    const fallback = () => {
      const email = document.querySelector('.contact-email a');
      const range = document.createRange();
      range.selectNodeContents(email);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      toast('Email selected. Press Ctrl+C to copy.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied';
        toast('Email copied');
        setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
      }).catch(fallback);
    } else {
      fallback();
    }
  });
})();

/* ---------- Command palette (press / or Ctrl+K) ---------- */
(function () {
  const dialog = document.getElementById('palette');
  const input = document.getElementById('palette-input');
  const list = document.getElementById('palette-list');
  const openBtn = document.getElementById('palette-open');
  if (!dialog || !input || !list || typeof dialog.showModal !== 'function') {
    if (openBtn) openBtn.hidden = true;
    return;
  }

  const items = [];
  document.querySelectorAll('.rail-nav a').forEach((a) => {
    items.push({ label: a.textContent.trim(), kind: 'Section', run: () => jumpTo(document.querySelector(a.getAttribute('href'))) });
  });
  document.querySelectorAll('.project, .more li').forEach((el) => {
    const t = el.querySelector('.project-title, .more-name');
    if (!t) return;
    items.push({
      label: t.textContent.trim(),
      kind: 'Project',
      keywords: el.textContent.toLowerCase(),
      run: () => { if (window.__showAllProjects) window.__showAllProjects(); jumpTo(el); },
    });
  });
  document.querySelectorAll('.entry').forEach((el) => {
    const t = el.querySelector('.entry-title span');
    if (!t) return;
    items.push({ label: t.textContent.trim(), kind: el.closest('#education') ? 'Education' : 'Experience', keywords: el.textContent.toLowerCase(), run: () => jumpTo(el) });
  });
  const link = (label, href) => ({ label, kind: 'Link', run: () => {
    const a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    document.body.append(a); a.click(); a.remove();
  } });
  items.push(link('Bureaucracy Navigator live demo', 'https://bureaucracy-navigator-gamma.vercel.app'));
  items.push(link('GitHub', 'https://github.com/HaroonAli7816'));
  items.push(link('LinkedIn', 'https://www.linkedin.com/in/muhammad-haroon-ali-1477a9286/?skipRedirect=true'));
  items.push(link('Résumé (PDF)', 'assests/documents/resume.pdf'));
  items.push({ label: 'Copy email address', kind: 'Action', run: () => document.getElementById('copy-email')?.click() });
  items.push({ label: 'Switch theme', kind: 'Action', run: () => document.getElementById('theme-toggle')?.click() });
  items.push({ label: 'Run all project checks', kind: 'Action', run: () => {
    if (window.__showAllProjects) window.__showAllProjects();
    jumpTo(document.getElementById('projects'));
    document.querySelectorAll('.project').forEach((p) => runChecks(p));
  } });

  let shown = [];
  let active = 0;

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = items.filter((it) => !q || it.label.toLowerCase().includes(q) || it.kind.toLowerCase().includes(q) || (it.keywords || '').includes(q));
    active = Math.min(active, Math.max(shown.length - 1, 0));
    list.innerHTML = '';
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'palette-empty';
      li.textContent = `Nothing matches "${input.value}".`;
      list.append(li);
      return;
    }
    shown.forEach((it, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === active ? 'true' : 'false');
      li.innerHTML = '<span class="p-label"></span><span class="p-kind"></span>';
      li.querySelector('.p-label').textContent = it.label;
      li.querySelector('.p-kind').textContent = it.kind;
      li.addEventListener('mousemove', () => { if (active !== i) { active = i; mark(); } });
      li.addEventListener('click', () => choose(i));
      list.append(li);
    });
  }
  function mark() {
    Array.from(list.children).forEach((li, i) => li.setAttribute('aria-selected', i === active ? 'true' : 'false'));
    const cur = list.children[active];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }
  function choose(i) {
    const it = shown[i];
    if (!it) return;
    dialog.close();
    it.run();
  }
  function open() {
    input.value = '';
    active = 0;
    render();
    dialog.showModal();
    input.focus();
  }

  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(shown.length, 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(shown.length, 1); mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  if (openBtn) openBtn.addEventListener('click', open);

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      if (dialog.open) return;
      e.preventDefault();
      open();
    }
  });
})();

/* ---------- Side column drifts down with the page ----------
   On wide screens the rail moves down in proportion to scroll progress:
   at the top of the page it sits at the top, and its bottom reaches the
   bottom of the content exactly when the page reaches its end. */
(function () {
  const rail = document.querySelector('.rail');
  const main = document.querySelector('.main');
  if (!rail || !main) return;
  const wide = window.matchMedia('(min-width: 1001px)');
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let ticking = false;

  function target() {
    if (!wide.matches) return 0;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const travel = Math.max(0, main.offsetHeight - rail.offsetHeight);
    const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
    return progress * travel;
  }

  function frame() {
    const goal = target();
    current = smooth ? current + (goal - current) * 0.18 : goal;
    if (Math.abs(goal - current) < 0.5) current = goal;
    rail.style.transform = current ? `translate3d(0, ${current.toFixed(1)}px, 0)` : '';
    if (current !== goal) requestAnimationFrame(frame);
    else ticking = false;
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if ('ResizeObserver' in window) new ResizeObserver(request).observe(main);
  request();
})();
