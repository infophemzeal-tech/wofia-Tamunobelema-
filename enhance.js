/* enhance.js — scroll reveals, header/progress, and RSVP -> WhatsApp (Patience Planner).
   Loaded BEFORE app.js so the RSVP handler below takes over the form submit. */
(function () {
  var PLANNER_NUMBER = '2347057370591'; // +234 705 737 0591 (Patience Planner)
  var wa = function (text) { return 'https://wa.me/' + PLANNER_NUMBER + '?text=' + encodeURIComponent(text); };

  /* ---- Scroll reveals ---- */
  var targets = document.querySelectorAll(
    '.venue-section > *, .section-intro, .detail-item, .planner-card, .note-card, .story-copy, .story-photo, ' +
    '.memory-strip, .forever-copy, .people-section > p, .people-section > h2, .person, .quote-band, ' +
    '.moments-section > p, .moments-section > h2, .gallery-image, .rsvp-heading, .rsvp-form, .thank-you > *');
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    if (el.matches('.story-photo, .gallery-image, .memory-strip')) el.classList.add('reveal-zoom');
    var sibling = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sibling % 4, 3) * 0.08 + 's');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else { targets.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- Header shadow + scroll progress ---- */
  var header = document.querySelector('.header');
  var bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(h.scrollTop / max, 1) : 0) + ')';
      if (header) header.classList.toggle('scrolled', h.scrollTop > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- RSVP -> WhatsApp to Patience Planner ---- */
  var form = document.getElementById('rsvp-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation(); // replaces any older handler in app.js
      var f = form.elements;
      var reply = form.querySelector('input[name="attendance"]:checked');
      var lines = [
        'Hello Patience, this is my RSVP for Wofai & Tamunobelema\u2019s wedding (30 Dec 2026, Marina Resort, Calabar).',
        '',
        'Name: ' + f.name.value.trim(),
        'Email: ' + f.email.value.trim(),
        'Reply: ' + (reply ? reply.value : ''),
        'Guests: ' + f.guests.value,
        'Dietary: ' + (f.dietary.value.trim() || 'None'),
        'Needs accommodation help: ' + (f.accommodation && f.accommodation.checked ? 'Yes' : 'No')
      ];
      var url = wa(lines.join('\n'));
      var status = document.getElementById('form-status');
      if (status) {
        status.textContent = 'Opening WhatsApp \u2014 tap Send there to complete your RSVP. ';
        var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Not opening? Tap here.'; status.appendChild(a);
      }
      window.location.href = url;
    }, true);
  }
})();