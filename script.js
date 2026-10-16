// Valora: меню на узком экране + движение по ходу страницы.
// Без JS страница видна целиком: всё скрытое прячется только под html.js.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- меню ----------
  var top = document.querySelector('.top');
  var burger = top && top.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = top.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? 'Закрыть' : 'Меню';
    });
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // ---------- заголовок: разбить на слова ----------
  $$('.hero h1, .doc h1').forEach(function (h) {
    var words = h.textContent.trim().split(/[ \t\r\n]+/); // неразрывные пробелы не трогаем
    h.innerHTML = words.map(function (w, i) {
      return '<span class="w" style="--i:' + i + '"><span>' + w + '</span></span>';
    }).join(' ');
    h.classList.add('split');
    h.setAttribute('aria-label', words.join(' '));
  });

  // линейки, которые прочерчиваются
  $$('.rows, .faq, .steps, .compare, .contacts, .stages, .dirs').forEach(function (el) { el.classList.add('draw'); });

  if (reduce) {
    // без движения — сразу конечное состояние каждой сцены
    $$('.split, .draw').forEach(function (el) { el.classList.add('is-in'); });
    document.body.classList.add('is-loaded');
    return;
  }

  // первый экран — одна сцена при загрузке
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('is-loaded');
      $$('.split').forEach(function (h) { h.classList.add('is-in'); });
    });
  });

  // ---------- появление по мере прокрутки ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.draw').forEach(function (el) { io.observe(el); });

  // ---------- сцены, привязанные к прокрутке ----------
  var scenes = [];
  // Шаги: линия пути тянется вдоль номеров.
  $$('.steps').forEach(function (box) {
    var steps = $$('.step', box);
    var track = document.createElement('div');
    track.className = 'steps__track';
    track.innerHTML = '<i class="steps__fill"></i>';
    box.insertBefore(track, box.firstChild);
    scenes.push(function () {
      var mid = window.innerHeight * .55;
      var r = track.getBoundingClientRect();
      var p = clamp((mid - r.top) / r.height);
      track.style.setProperty('--p', p.toFixed(4));
      steps.forEach(function (s) {
        s.classList.toggle('is-on', s.getBoundingClientRect().top + 40 < mid);
      });
    });
  });

  if (!scenes.length) return;
  var ticking = false;
  function frame() { ticking = false; scenes.forEach(function (f) { f(); }); }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  frame();
})();
