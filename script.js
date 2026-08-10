// Contact form — submits to Web3Forms (https://web3forms.com).
// Replace the access_key hidden input value in index.html with your real key before going live.
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form?.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);

  if (payload.access_key === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
    status.textContent = 'Form is not connected yet — add your Web3Forms access key in index.html.';
    return;
  }

  status.textContent = 'Sending...';

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        status.textContent = "Message sent, thanks! I'll get back to you soon.";
        form.reset();
      } else {
        status.textContent = 'Something went wrong. Try WhatsApp instead for now.';
      }
    })
    .catch(() => {
      status.textContent = 'Something went wrong. Try WhatsApp instead for now.';
    });
});

// Scroll reveal
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

// Back to top
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// Cursor-reactive mesh parallax
if (!prefersReducedMotion) {
  const parallaxZones = [
    { zone: document.querySelector('.hero'), mesh: document.querySelector('.mesh-hero') },
    { zone: document.querySelector('.about-section'), mesh: document.querySelector('.mesh-about') },
  ];
  parallaxZones.forEach(({ zone, mesh }) => {
    if (!zone || !mesh) return;
    zone.addEventListener('mousemove', (e) => {
      const rect = zone.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      mesh.style.transform = `translate(${px * 14}px, ${py * 14}px) rotate(${px * 1.5}deg)`;
    });
    zone.addEventListener('mouseleave', () => {
      mesh.style.transform = 'translate(0,0) rotate(0deg)';
    });
  });
}
