/* LES IGUANES v3 — motion */
(function () {
  var docEl = document.documentElement;
  docEl.classList.add('js');
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));

  function reveal(el) { el.classList.add('in'); }
  function revealInView() {
    var vh = window.innerHeight || 800;
    reveals.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) reveal(el);
    });
  }

  // ---- Scroll reveal (IntersectionObserver + robust fallbacks) ----
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }
  // Guarantee: reveal anything in view now + on scroll/resize/load, and a hard
  // safety timeout that reveals everything (covers throttled IO / hidden tabs).
  requestAnimationFrame(revealInView);
  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('resize', revealInView, { passive: true });
  window.addEventListener('load', revealInView);
  setTimeout(function () { reveals.forEach(reveal); docEl.classList.add('shown'); }, 2200);

  // ---- Nav scrolled state ----
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Burger ----
  var burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // ---- Stat counters ----
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  // ---- Hero parallax (subtle, rAF-throttled) ----
  var media = document.querySelector('.parallax');
  var ticking = false;
  if (media && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 1100);
          media.style.transform = 'translateY(' + (y * 0.05) + 'px) scale(1.06)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
