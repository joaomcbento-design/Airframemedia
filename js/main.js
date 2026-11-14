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

  /* 1. Staggered grids — children appear one after another */
  const staggerSel = '.services-grid, .pillars-grid, .tl-features-grid, .tl-specs, .stats-section';
  document.querySelectorAll(staggerSel).forEach(grid => {
    grid.classList.remove('reveal');
    grid.style.transitionDelay = '';
    grid.classList.add('stagger');
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
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
  function update() {
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

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
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
