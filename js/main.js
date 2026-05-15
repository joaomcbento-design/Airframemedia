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


/* ── HERO PARALLAX ──────────────────────────────────────── */
// The hero background image moves slightly slower than the scroll
const heroBg = document.querySelector('.hero-bg');

if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `scale(1.02) translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}


// ── MOBILE HAMBURGER NAV ─────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close when a link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}
