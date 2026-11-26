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

  /* ---- RSVP -> Supabase (saved) + optional WhatsApp ping to Patience Planner ---- */
  // 1) Paste your values from Supabase > Project Settings > API
  var SUPABASE_URL = 'https://pndwlxjkzfofomeqihvl.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_IErLPwKCt6OrNc4wQUMKNQ_J16yTQBS'; // the "anon / public" key only. NEVER the service_role key.
  var configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) && SUPABASE_URL.indexOf('YOUR-') === -1 && SUPABASE_ANON_KEY.indexOf('YOUR-') === -1;

  var form = document.getElementById('rsvp-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation(); // replaces any older handler in app.js
      var f = form.elements;
      var reply = form.querySelector('input[name="attendance"]:checked');
      var data = {
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        attendance: reply ? reply.value : '',
        guests: parseInt(f.guests.value, 10) || 1,
        dietary: f.dietary.value.trim() || null,
        needs_accommodation: !!(f.accommodation && f.accommodation.checked)
      };
      var lines = [
        'Hello Patience, this is my RSVP for Wofai & Tamunobelema\u2019s wedding (30 Dec 2026, Marina Resort, Calabar).',
        '', 'Name: ' + data.name, 'Email: ' + data.email, 'Reply: ' + data.attendance,
        'Guests: ' + data.guests, 'Dietary: ' + (data.dietary || 'None'),
        'Needs accommodation help: ' + (data.needs_accommodation ? 'Yes' : 'No')
      ];
      var waUrl = wa(lines.join('\n'));
      var status = document.getElementById('form-status');
      var btn = form.querySelector('.submit-button');

      function say(text, linkText, href) {
        if (!status) return;
        status.textContent = text + ' ';
        if (linkText) {
          var a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener';
          a.className = 'wa-link'; a.textContent = linkText; status.appendChild(document.createElement('br')); status.appendChild(a);
        }
      }
      function viaWhatsApp() { say('Opening WhatsApp \u2014 tap Send there to complete your RSVP.', 'Not opening? Tap here', waUrl); window.location.href = waUrl; }

      if (!configured) { viaWhatsApp(); return; } // site still works before Supabase is set up

      if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
      say('Saving your RSVP\u2026');
      fetch(SUPABASE_URL + '/rest/v1/rsvps', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        say('Thank you, ' + data.name.split(' ')[0] + '! Your RSVP has been saved. \u2764',
            'Also let Patience know on WhatsApp', waUrl);
      }).catch(function () {
        say('We couldn\u2019t save that just now, so we\u2019ll send it by WhatsApp instead.');
        viaWhatsApp();
      }).then(function () { if (btn) { btn.disabled = false; btn.style.opacity = ''; } });
    }, true);
  }
})();