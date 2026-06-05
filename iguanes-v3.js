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

  // ---- Hero slideshow — Ken Burns + dots ----
  var slides = document.querySelectorAll('.hero__slide');
  var dotsContainer = document.getElementById('hero-dots');
  if (slides.length > 1 && dotsContainer) {
    var cur = 0;
    var timer;
    var INTERVAL = 5500;

    // Créer les dots
    var dots = [];
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'hero__dot' + (i === 0 ? ' hero__dot--active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', function () { goTo(i); resetTimer(); });
      dotsContainer.appendChild(d);
      dots.push(d);
    });

    var heroSection = document.getElementById('hero');
    function updateTextPos() {
      var isLeft = slides[cur].classList.contains('hero__slide--text-left');
      heroSection.classList.toggle('hero--text-left', isLeft);
    }

    function goTo(idx) {
      slides[cur].classList.remove('hero__slide--active');
      dots[cur].classList.remove('hero__dot--active');
      cur = (idx + slides.length) % slides.length;
      slides[cur].classList.add('hero__slide--active');
      dots[cur].classList.add('hero__dot--active');
      updateTextPos();
      // Précharger le suivant
      var next = (cur + 1) % slides.length;
      var img = slides[next].querySelector('img');
      if (img && img.loading === 'lazy') img.loading = 'eager';
    }

    updateTextPos();

    function advance() { goTo(cur + 1); }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(advance, INTERVAL);
    }

    resetTimer();

    // Pause si tab cachée
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer);
      else resetTimer();
    });

    // Swipe mobile
    var touchStartX = 0;
    document.querySelector('.hero__bg').addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    document.querySelector('.hero__bg').addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? cur + 1 : cur - 1); resetTimer(); }
    }, { passive: true });
  }

  // ---- Inject "Agrandir" hints on media-launch elements ----
  document.querySelectorAll('.media-launch').forEach(function (el) {
    var hint = document.createElement('span');
    hint.className = 'media-launch__hint';
    hint.textContent = 'Agrandir';
    hint.setAttribute('aria-hidden', 'true');
    el.appendChild(hint);
  });

  // ---- Custom cursor (desktop only) ----
  var cursor = document.getElementById('cursor');
  var ring = document.getElementById('cursor-ring');
  if (cursor && ring && !('ontouchstart' in window)) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    (function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a,button,.gcell,.history__card,.pl').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hov'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hov'); });
    });
    document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { cursor.style.opacity = ''; ring.style.opacity = ''; });
  } else {
    document.body.classList.add('no-cursor');
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

    // ---- Roster history accordéon ----
    document.querySelectorAll('.rh-season__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var body = btn.nextElementSibling;
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        body.hidden = expanded;
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

// Contact form — Cloudflare Worker + Resend
(function () {
  var WORKER_URL = 'https://api.iguanes.club/contact';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('contact-status');
  var btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var prenom = form.querySelector('[name="prenom"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var message = form.querySelector('[name="message"]').value.trim();

    btn.disabled = true;
    status.textContent = 'Envoi en cours…';
    status.style.color = '';

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prenom: prenom, email: email, message: message }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (r) {
        if (r.ok) {
          status.textContent = 'Message envoyé ! On te répond bientôt.';
          status.style.color = '#4caf50';
          form.reset();
        } else {
          status.textContent = r.data.error || 'Erreur lors de l\'envoi. Réessaie.';
          status.style.color = '#e53935';
        }
      })
      .catch(function () {
        status.textContent = 'Impossible de joindre le serveur. Réessaie plus tard.';
        status.style.color = '#e53935';
      })
      .finally(function () {
        btn.disabled = false;
      });
  });
})();
