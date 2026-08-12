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

// Quote Estimator Modal
(function() {
  const backdrop = document.getElementById('qc-backdrop');
  if (!backdrop) return;

  const openBtns = document.querySelectorAll('.open-estimator-btn');
  const closeBtn = document.getElementById('qc-close');
  const steps = Array.from(document.querySelectorAll('.qc-step'));
  const totalSteps = steps.length;
  let currentStep = 1;
  const answers = {};

  const quizForm = document.getElementById('qc-quiz');
  const resultEl = document.getElementById('qc-result');
  const nextBtn = document.getElementById('qc-next-btn');
  const backBtn = document.getElementById('qc-back-btn');
  const progressFill = document.getElementById('qc-progress-fill');
  const progressTrack = document.querySelector('.qc-progress-track');

  function openModal() {
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function updateProgress() { progressFill.style.width = (currentStep / totalSteps * 100) + '%'; }

  function goToStep(n) {
    steps.forEach(s => s.classList.remove('active'));
    const target = steps.find(s => Number(s.dataset.step) === n);
    target.classList.add('active');
    currentStep = n;
    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
    const q = target.querySelector('[data-question]').dataset.question;
    nextBtn.disabled = !answers[q];
    nextBtn.textContent = n === totalSteps ? 'See my recommendation' : 'Next';
    updateProgress();
  }

  backdrop.querySelectorAll('.qc-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const group = opt.parentElement;
      group.querySelectorAll('.qc-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[group.dataset.question] = opt.dataset.value;
      nextBtn.disabled = false;
    });
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps) goToStep(currentStep + 1); else showResult();
  });
  backBtn.addEventListener('click', () => { if (currentStep > 1) goToStep(currentStep - 1); });

  const QC_TIERS = {
    starter: { name: 'Starter', priceBzd: '$600–800', priceUsd: '≈USD $300–400', low: 600, high: 800,
      features: ['Single-page site, up to 4 sections', 'Mobile responsive', 'WhatsApp + contact form', '1 round of revisions', 'Delivery in ~1 week'] },
    standard: { name: 'Standard', priceBzd: '$1,000–1,400', priceUsd: '≈USD $500–700', low: 1000, high: 1400,
      features: ['Up to 5 pages, custom design', 'WhatsApp + contact form + email', 'Basic SEO setup', '2 rounds of revisions', 'Delivery in ~2-3 weeks'] },
    plus: { name: 'Plus', priceBzd: '$1,800–2,400', priceUsd: '≈USD $900–1,200', low: 1800, high: 2400,
      features: ['Everything in Standard', 'Custom animation / interactive elements', 'Bilingual EN/ES version', 'Basic analytics setup', '3 months of support included'] },
  };

  function recommendTier() {
    let tier = 'starter';
    if (answers.pages === '2-5' || answers.pages === 'unsure') tier = 'standard';
    if (answers.pages === '6+') tier = 'plus';
    if (answers.bilingual === 'yes') tier = 'plus';
    if (answers.animation === 'yes') tier = 'plus';
    return tier;
  }

  function showResult() {
    const tierKey = recommendTier();
    const tier = QC_TIERS[tierKey];

    document.getElementById('qc-result-tier').textContent = tier.name;
    let low = tier.low, high = tier.high;
    let rushNote = '';
    if (answers.timeline === 'rush') {
      rushNote = `Rush delivery adds roughly 25-30% to the total (BZD $${Math.round(low*1.25)}–${Math.round(high*1.3)} with rush included).`;
    }
    document.getElementById('qc-result-price').innerHTML = `BZD ${tier.priceBzd} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:500;">(${tier.priceUsd})</span>`;
    document.getElementById('qc-result-features').innerHTML = tier.features.map(f => `<li><i class="ti ti-check" aria-hidden="true" style="color:var(--violet);margin-right:6px;"></i>${f}</li>`).join('');

    let notes = '';
    if (answers.pages === '6+') notes += `<p>Sites with 6+ pages may include additional pages beyond the standard 5, billed at BZD $180 each.</p>`;
    if (answers.ordering === 'yes') notes += `<p>Online ordering / reservation systems are quoted separately based on what you need — not included in the range above.</p>`;
    if (rushNote) notes += `<p>${rushNote}</p>`;
    if (answers.hosting === 'yes') notes += `<p>Ongoing hosting & maintenance after launch: BZD $60/month, billed separately.</p>`;
    const notesEl = document.getElementById('qc-result-notes');
    notesEl.style.display = notes ? 'block' : 'none';
    notesEl.innerHTML = notes;

    const summary = [
      `Hi! I just used the quote tool on your site.`,
      `Pages: ${answers.pages}`,
      `Bilingual: ${answers.bilingual}`,
      `Animation/interactive: ${answers.animation}`,
      `Online ordering/booking: ${answers.ordering}`,
      `Timeline: ${answers.timeline}`,
      `Hosting add-on: ${answers.hosting}`,
      `Recommended: ${tier.name} (BZD ${tier.priceBzd})`,
      `Can we talk about my project?`
    ].join('\n');
    document.getElementById('qc-whatsapp-cta').href = 'https://wa.me/5016214804?text=' + encodeURIComponent(summary);

    quizForm.style.display = 'none';
    progressTrack.style.display = 'none';
    resultEl.classList.add('active');
  }

  document.getElementById('qc-restart-link').addEventListener('click', (e) => {
    e.preventDefault();
    resultEl.classList.remove('active');
    quizForm.style.display = 'block';
    progressTrack.style.display = 'block';
    backdrop.querySelectorAll('.qc-option.selected').forEach(o => o.classList.remove('selected'));
    Object.keys(answers).forEach(k => delete answers[k]);
    goToStep(1);
  });

  updateProgress();
})();
