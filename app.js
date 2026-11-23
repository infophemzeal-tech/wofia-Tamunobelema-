const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open menu');
  });
});

const form = document.getElementById('rsvp-form');
const status = document.getElementById('form-status');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  const accepting = data.get('attendance') === 'Joyfully accepts';
  status.textContent = accepting ?
    `Thank you, ${name}! Your RSVP is noted. We look forward to celebrating with you.` :
    `Thank you for letting us know, ${name}. You will be missed.`;
  form.reset();
});

const galleryButtons = document.querySelectorAll('.gallery-image');
galleryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', image.alt);
    const enlarged = document.createElement('img');
    enlarged.src = image.src;
    enlarged.alt = image.alt;
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close image');
    close.textContent = '×';
    lightbox.append(enlarged, close);
    document.body.append(lightbox);
    close.focus();
    const dismiss = () => lightbox.remove();
    close.addEventListener('click', dismiss);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) dismiss();
    });
    document.addEventListener('keydown', function escape(event) {
      if (event.key === 'Escape') {
        dismiss();
        document.removeEventListener('keydown', escape);
      }
    }, {
      once: true
    });
  });
});
