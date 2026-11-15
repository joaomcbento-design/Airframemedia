/* ═══════════════════════════════════════════════════════════
   AIRFRAME MEDIA — Main JavaScript
   ═══════════════════════════════════════════════════════════ */

/* ── CUSTOM CURSOR ──────────────────────────────────────── */
const ring = document.getElementById('cRing');
const dot  = document.getElementById('cDot');

let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let rx = mx, ry = my;
let cursorActive = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  dot.style.transform = `translate(${mx - 2.5}px, ${my - 2.5}px)`;

  if (!cursorActive) {
    cursorActive = true;
    ring.classList.add('active');
    dot.classList.add('active');
  }
});

// Cursor ring lags slightly behind for a smooth feel
(function animateCursor() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.transform = `translate(${rx - 19}px, ${ry - 19}px)`;
  requestAnimationFrame(animateCursor);
})();

// Enlarge ring when hovering interactive elements
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
});


/* ── NAV: FROSTED GLASS ON SCROLL ──────────────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ── SCROLL REVEAL ──────────────────────────────────────── */
// Elements with class "reveal" fade + slide up when they enter the viewport
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ── DIVIDER LINE ANIMATION ─────────────────────────────── */
// The gold horizontal line grows from 0 to full width on scroll
const lineObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.5 });

document.querySelectorAll('.divider-line').forEach(el => lineObs.observe(el));


/* ── SCROLL ANIMATIONS ─────────────────────────────────── */
// All scroll effects live here. They are added from JS so every page
// gets them without changing the HTML. Users who ask their OS for
// reduced motion get the content straight away, with no movement.
(function scrollAnimations() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-anim');

  /* 0. Scroll-scrubbed pieces — they slide in from different sides,
        following the scroll in both directions.
        x = vw, y = px, r = degrees of rotation at the start. */
  const L = { x: -22 }, R = { x: 22 }, B = { y: 140 };
  const scrubRules = [
    // Home
    ['.services-head > div',  () => ({ x: -25 })],
    ['.services-sub',         () => ({ x: 25 })],
    ['.scard',                i => i % 2 ? { x: 18, y: 80, r: 4 } : { x: -18, y: 80, r: -4 }],
    ['.stat-item',            i => [L, B, R][i % 3]],
    ['.cta-left',             () => ({ x: -20 })],
    ['.cta-section > .btn',   () => ({ x: 20 })],
    // Services page: image and text come from opposite sides
    ['.service-block .service-img',     (i, el) => el.closest('.reverse') ? R : L],
    ['.service-block .service-content', (i, el) => el.closest('.reverse') ? L : R],
    // About page
    ['.bio-photo',            () => L],
    ['.bio-text',             () => R],
    ['.pillars-head',         () => ({ x: -15 })],
    ['.pillar',               i => [L, B, R][i % 3]],
    // Timelapse page
    ['.tl-spec',              i => [{ x: -18 }, { y: 160 }, { y: 160 }, { x: 18 }][i % 4]],
    ['.tl-features-head',     () => ({ x: -15 })],
    ['.tl-feature',           i => i % 2 ? { x: 15, r: 3 } : { x: -15, r: -3 }],
    ['.tl-step',              i => ({ y: 100 + i * 70 })],
    // Contact page
    ['.contact-info',         () => L],
    ['.contact-form-wrap',    () => R],
  ];

  const scrubEls = [];
  if (!reduceMotion) {
    scrubRules.forEach(([sel, from]) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el._from = { x: 0, y: 0, r: 0, ...from(i, el) };
        el.classList.add('scrub');
        el.classList.remove('reveal');
        const wrap = el.parentElement && el.parentElement.closest('.reveal');
        if (wrap) wrap.classList.add('in');   // let the piece itself do the moving
        scrubEls.push(el);
      });
    });
  }

  /* 1. Staggered grids — children appear one after another */
  const staggerSel = '.services-grid, .pillars-grid, .tl-features-grid, .tl-specs, .stats-section';
  document.querySelectorAll(staggerSel).forEach(grid => {
    grid.classList.remove('reveal');
    grid.style.transitionDelay = '';
    grid.classList.add('stagger');
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
      if (child.classList.contains('scrub') && !child.classList.contains('scard')) return;
      child.classList.add(child.classList.contains('scard') ? 'stagger-clip' : 'stagger-item');
    });
  });

  /* 2. Image curtain — images unveil from bottom to top */
  document.querySelectorAll('.service-img, .tl-video-wrap').forEach(el => el.classList.add('img-reveal'));

  /* 3. Portfolio — each photo fades in as it arrives */
  document.querySelectorAll('.portfolio-item').forEach((el, i) => {
    el.classList.add('pf-reveal');
    el.style.setProperty('--i', i % 3);
  });

  const inObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (entry.target._revealTargets || [entry.target]).forEach(t => t.classList.add('in'));
      inObs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.stagger, .pf-reveal').forEach(el => inObs.observe(el));
  // A fully clipped element never counts as visible, so watch its parent instead
  document.querySelectorAll('.img-reveal').forEach(el => {
    const parent = el.parentElement;
    (parent._revealTargets = parent._revealTargets || []).push(el);
    inObs.observe(parent);
  });

  /* 4. Number counters — "100+" counts up from 0 */
  const counters = document.querySelectorAll('.stat-num, .tl-spec-value');
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObs.unobserve(entry.target);
      const el = entry.target;
      const match = el.textContent.trim().match(/^(\d+)(\D*)$/);
      if (!match || +match[1] === 0) return;
      const target = +match[1], suffix = match[2], duration = 1800;
      const start = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.6 });

  if (!reduceMotion) counters.forEach(el => countObs.observe(el));

  if (reduceMotion) return;

  /* 5. Scroll-linked effects (progress bar, hero, parallax, quote) */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  const heroMedia   = document.querySelectorAll('.hero-video, .hero-bg');
  const heroContent = document.querySelector('.hero-content, .tl-hero-content');
  const hint        = document.querySelector('.scroll-hint');
  const parallaxImgs = document.querySelectorAll('.scard-img');
  const quote    = document.querySelector('.quote-section');
  const quoteMain = quote && quote.querySelector('.quote-main');
  const quoteSub  = quote && quote.querySelector('.quote-sub');

  // 0 when the element's top hits the bottom of the screen, 1 when its bottom leaves the top
  function progress(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
  }

  let ticking = false;
  let update = function () {
    ticking = false;
    const y  = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (y < vh * 1.2) {
      heroMedia.forEach(m => { m.style.translate = `0 ${y * 0.3}px`; });
      if (heroContent) {
        const f = Math.min(y / (vh * 0.7), 1);
        heroContent.style.translate = `0 ${y * -0.15}px`;
        heroContent.style.opacity = 1 - f;
      }
      if (hint) hint.style.opacity = y > 40 ? 0 : '';
    }

    parallaxImgs.forEach(img => {
      const p = progress(img.parentElement);
      if (p > 0 && p < 1) img.style.translate = `0 ${(p - 0.5) * -8}%`;
    });

    if (quote) {
      const p = progress(quote);
      const k = 1 - Math.min(p / 0.55, 1);           // 1 → 0 as the quote reaches mid-screen
      if (quoteMain) quoteMain.style.translate = `${k * -12}vw 0`;
      if (quoteSub) {
        quoteSub.style.translate = `${k * 12}vw 0`;
        quoteSub.style.letterSpacing = `${0.6 + k * 0.8}em`;
      }
    }
  }

  /* Scrubbed pieces: positions are measured without the motion applied,
     so moving an element never changes when it is considered "in view". */
  function measure() {
    scrubEls.forEach(el => { el.style.translate = 'none'; el.style.rotate = 'none'; });
    const sy = window.scrollY;
    scrubEls.forEach(el => { el._top = el.getBoundingClientRect().top + sy; });
    update();
  }

  function updateScrub() {
    const vh = window.innerHeight;
    const sy = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - vh;
    scrubEls.forEach(el => {
      // 0 when the piece's top touches the bottom of the screen,
      // 1 once it has climbed 60% of the screen height — or, near the
      // end of the page, once the page can't scroll any further
      const start = el._top - vh;
      const end = Math.min(el._top - vh * 0.4, maxScroll);
      const t = end <= start ? 1 : Math.min(Math.max((sy - start) / (end - start), 0), 1);
      const k = Math.pow(1 - t, 3);                 // remaining distance, eased
      const f = el._from;
      el.style.translate = `${f.x * k}vw ${f.y * k}px`;
      el.style.rotate = `${f.r * k}deg`;
      if (!el.classList.contains('scard')) el.style.opacity = Math.min(1, 0.1 + t * 1.3);
    });
  }

  const baseUpdate = update;
  update = function () { baseUpdate(); updateScrub(); };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  let measureQueued = false;
  const queueMeasure = () => {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => { measureQueued = false; measure(); });
  };
  window.addEventListener('resize', queueMeasure);
  window.addEventListener('load', queueMeasure);
  if ('ResizeObserver' in window) new ResizeObserver(queueMeasure).observe(document.body);
  measure();
})();


// ── MOBILE HAMBURGER NAV ─────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    // Remove backdrop-filter when menu opens — it creates a containing
    // block that traps position:fixed children inside the nav bounds
    nav.style.backdropFilter        = isOpen ? 'none' : '';
    nav.style.webkitBackdropFilter  = isOpen ? 'none' : '';
    nav.style.background            = isOpen ? 'rgba(6,6,10,0.97)' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow  = '';
      nav.style.backdropFilter       = '';
      nav.style.webkitBackdropFilter = '';
      nav.style.background           = '';
    });
  });
}


// ── COOKIE BANNER ────────────────────────────────────────────
(function() {
  if (localStorage.getItem('cookieConsent')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <p class="cookie-banner-text">
      Este site utiliza cookies para melhorar a sua experiência e analisar o tráfego.
      Os vídeos incorporados utilizam o modo de privacidade do YouTube.
      Saiba mais na nossa <a href="cookies.html">Política de Cookies</a>.
    </p>
    <div class="cookie-banner-actions">
      <button class="cookie-btn cookie-btn-decline" id="cookieDecline">Recusar</button>
      <button class="cookie-btn cookie-btn-accept" id="cookieAccept">Aceitar</button>
    </div>
  `;

  document.body.appendChild(banner);

  function dismiss(choice) {
    localStorage.setItem('cookieConsent', choice);
    banner.classList.add('hidden');
    setTimeout(() => banner.remove(), 500);
  }

  document.getElementById('cookieAccept').addEventListener('click', () => dismiss('accepted'));
  document.getElementById('cookieDecline').addEventListener('click', () => dismiss('declined'));
})();
