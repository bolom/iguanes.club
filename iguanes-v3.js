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

  // ---- Responsive asset sources ----
  function toResponsiveSrc(src, bucket) {
    if (!src) return null;
    if (src.indexOf('assets-web/') === 0 && src.slice(-5).toLowerCase() === '.webp') {
      return src.replace(/^assets-web\//, bucket + '/');
    }
    return null;
  }

  document.querySelectorAll('img.media-img').forEach(function (img) {
    var src = img.getAttribute('src');
    var mobile = toResponsiveSrc(src, 'assets-mobile');
    var tablet = toResponsiveSrc(src, 'assets-tablet');
    var web = toResponsiveSrc(src, 'assets-web');
    if (!mobile || !tablet || !web) return;
    img.setAttribute('srcset', mobile + ' 720w, ' + tablet + ' 1200w, ' + web + ' 1800w');
    img.setAttribute('sizes', '(max-width: 720px) 100vw, (max-width: 1100px) 80vw, 50vw');
  });

  // ---- History / gallery lightbox ----
  var lightbox = document.getElementById('history-lightbox');
  if (lightbox) {
    var lightboxImg = lightbox.querySelector('.lightbox__img');
    var lightboxCaption = lightbox.querySelector('.lightbox__caption');
    var activeTrigger = null;

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.setAttribute('src', '');
      lightboxImg.setAttribute('alt', '');
      lightboxCaption.textContent = '';
      document.body.classList.remove('lightbox-open');
      if (activeTrigger) activeTrigger.focus();
      activeTrigger = null;
    }

    function openLightbox(trigger) {
      activeTrigger = trigger;
      lightboxImg.setAttribute('src', trigger.getAttribute('data-full') || '');
      lightboxImg.setAttribute('alt', trigger.querySelector('img') ? trigger.querySelector('img').getAttribute('alt') : '');
      lightboxCaption.textContent = trigger.getAttribute('data-caption') || '';
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    }

    document.querySelectorAll('.media-launch').forEach(function (trigger) {
      trigger.addEventListener('click', function () { openLightbox(trigger); });
    });

    // ---- Gallery tab filters ----
    var tabs = document.querySelectorAll('.gtab');
    var cells = document.querySelectorAll('.gallery-grid .gcell');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var filter = tab.getAttribute('data-tab');
        cells.forEach(function (cell) {
          if (filter === 'all' || cell.getAttribute('data-tab') === filter) {
            cell.style.display = '';
          } else {
            cell.style.display = 'none';
          }
        });
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (node) {
      node.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }
})();
