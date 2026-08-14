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

  const TIERS = {
    starter: { name: 'Starter', price: 'BZ$600–800', low: 600, high: 800,
      features: ['Single-page site, up to 4 sections', 'Mobile responsive', 'WhatsApp + contact form', '1 round of revisions', '~1 week delivery'] },
    standard: { name: 'Standard', price: 'BZ$1,000–1,400', low: 1000, high: 1400,
      features: ['Up to 5 pages', 'Custom design matched to your brand', 'WhatsApp + contact form + email integration', 'Basic SEO setup', '2 rounds of revisions', '~2–3 week delivery'] },
    plus: { name: 'Plus', price: 'BZ$1,800–2,400', low: 1800, high: 2400,
      features: ['Everything in Standard', 'Custom animation / interactive elements', 'Bilingual EN/ES version', 'Basic analytics setup', '3 rounds of revisions', '3 months of Hosting & Maintenance included', '~3–4 week delivery'] }
  };

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
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function updateProgress() {
    progressFill.style.width = (currentStep / totalSteps * 100) + '%';
  }

  function goToStep(n) {
    steps.forEach(s => s.classList.remove('active'));
    const target = steps.find(s => Number(s.dataset.step) === n);
    target.classList.add('active');
    currentStep = n;
    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
    const q = target.querySelector('[data-question]').dataset.question;
    nextBtn.disabled = !answers[q];
    nextBtn.textContent = n === totalSteps ? 'See my estimate' : 'Next';
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
    if (currentStep < totalSteps) goToStep(currentStep + 1);
    else showResult();
  });
  backBtn.addEventListener('click', () => { if (currentStep > 1) goToStep(currentStep - 1); });

  function addRange(low, high, amountLow, amountHigh) {
    return { low: low + amountLow, high: high + amountHigh };
  }

  function calculate() {
    let tierKey = answers.package;
    let tier = TIERS[tierKey];
    let low = tier.low;
    let high = tier.high;
    const addOns = [];
    let upgradeNote = '';

    const pageMap = { none: [0,0], one: [180,180], two: [360,360] };
    if (answers.pages !== 'none') {
      const [lo, hi] = pageMap[answers.pages];
      low += lo; high += hi;
      addOns.push(`${answers.pages === 'one' ? '1 additional page' : '2 additional pages'}: BZ$${lo}${lo !== hi ? '–' + hi : ''}`);
    }

    if (answers.bilingual === 'yes' && tierKey !== 'plus') {
      low += 250; high += 400;
      addOns.push('Bilingual EN/ES: BZ$250–400');
    }

    const anim = {
      none: [0,0,''],
      light: [80,120,'Light animation: BZ$80–120'],
      moderate: [150,250,'Moderate animation: BZ$150–250'],
      full: [300,450,'Full interactive animation: BZ$300–450']
    };
    if (tierKey !== 'plus' && answers.animation !== 'none') {
      const [lo, hi, label] = anim[answers.animation];
      low += lo; high += hi; addOns.push(label);
    }

    // Plus already includes bilingual + custom animation, so recommend it when
    // a Standard/Starter project needs both premium features.
    if (tierKey !== 'plus' &&
        answers.bilingual === 'yes' &&
        answers.animation !== 'none') {
      const plus = TIERS.plus;
      upgradeNote = `With bilingual content and ${answers.animation} animation selected, Plus may offer better value because those features are already included.`;
    }

    let rushLow = low, rushHigh = high;
    if (answers.timeline === 'rush') {
      rushLow = Math.round(low * 1.25);
      rushHigh = Math.round(high * 1.30);
      addOns.push('Rush delivery: +25–30%');
    }

    if (answers.ordering === 'yes') {
      addOns.push('Online ordering / reservations: quoted separately');
    }

    if (answers.hosting === 'yes') {
      if (tierKey === 'plus') {
        addOns.push('Hosting & Maintenance: included for 3 months, then BZ$60/month');
      } else {
        addOns.push('Hosting & Maintenance: BZ$60/month');
      }
    }

    return { tierKey, tier, low: rushLow, high: rushHigh, addOns, upgradeNote };
  }

  function showResult() {
    const result = calculate();
    const tier = result.tier;

    document.getElementById('qc-result-tier').textContent = tier.name;
    document.getElementById('qc-result-price').innerHTML =
      `BZ$${result.low.toLocaleString()}–${result.high.toLocaleString()} <span class="qc-price-label">(estimated project range)</span>`;

    document.getElementById('qc-result-features').innerHTML =
      tier.features.map(f => `<li><i class="ti ti-check" aria-hidden="true"></i>${f}</li>`).join('');

    const notes = [];
    if (result.addOns.length) notes.push(`<p><strong>Your selections:</strong></p><ul class="qc-addon-list">${result.addOns.map(a => `<li>${a}</li>`).join('')}</ul>`);
    if (result.upgradeNote) notes.push(`<p class="qc-upgrade-note">${result.upgradeNote}</p>`);
    notes.push(`<p class="qc-small-note">This is an estimate, not a final quote. Your final price will be confirmed in writing after we review your project.</p>`);

    const notesEl = document.getElementById('qc-result-notes');
    notesEl.style.display = 'block';
    notesEl.innerHTML = notes.join('');

    const summary = [
      'Hi! I just used the Cayo Coding Co. quote estimator.',
      `Package: ${tier.name} (${tier.price})`,
      `Bilingual: ${answers.bilingual}`,
      `Additional pages: ${answers.pages}`,
      `Animation: ${answers.animation}`,
      `Online ordering/booking: ${answers.ordering}`,
      `Timeline: ${answers.timeline}`,
      `Hosting & Maintenance: ${answers.hosting}`,
      `Estimated project range: BZ$${result.low.toLocaleString()}–${result.high.toLocaleString()}`,
      'Can we talk about my project?'
    ].join('\n');
    document.getElementById('qc-whatsapp-cta').href =
      'https://wa.me/5016214804?text=' + encodeURIComponent(summary);

    quizForm.style.display = 'none';
    progressTrack.style.display = 'none';
    resultEl.classList.add('active');
  }

  document.getElementById('qc-restart-link').addEventListener('click', e => {
    e.preventDefault();
    resultEl.classList.remove('active');
    quizForm.style.display = 'block';
    progressTrack.style.display = 'block';
    backdrop.querySelectorAll('.qc-option.selected').forEach(o => o.classList.remove('selected'));
    Object.keys(answers).forEach(k => delete answers[k]);
    goToStep(1);
  });

  goToStep(1);
})();
