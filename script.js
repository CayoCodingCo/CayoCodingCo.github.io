// Contact form — submits to Web3Forms (https://web3forms.com).
// Replace the access_key hidden input value in index.html with your real key before going live.
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

// Helper to retrieve current active language ('en' or 'es')
function getLang() {
  return localStorage.getItem('preferredLang') || 'en';
}

// WhatsApp Dynamic Message Translation
const WHATSAPP_PHONE = '5016214804';
const whatsappMessages = {
  en: 'Hello! I would like to get a quote for a website project.',
  es: '¡Hola! Me gustaría solicitar una cotización para un proyecto web.'
};

function updateWhatsAppLinks(lang) {
  const currentLang = lang || getLang();
  const message = whatsappMessages[currentLang] || whatsappMessages.en;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  const navWhatsAppBtn = document.querySelector('.nav-cta');
  const contactWhatsAppBtn = document.querySelector('.contact-whatsapp');

  if (navWhatsAppBtn) {
    navWhatsAppBtn.setAttribute('href', whatsappUrl);
  }
  if (contactWhatsAppBtn) {
    contactWhatsAppBtn.setAttribute('href', whatsappUrl);
  }
}

// Initial call on page load
updateWhatsAppLinks();

// Contact Form Handler
form?.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  const lang = getLang();

  if (payload.access_key === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
    status.textContent = lang === 'es' 
      ? 'El formulario no está conectado aún — agregue su clave de acceso de Web3Forms en index.html.' 
      : 'Form is not connected yet — add your Web3Forms access key in index.html.';
    return;
  }

  status.textContent = lang === 'es' ? 'Enviando...' : 'Sending...';

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        status.textContent = lang === 'es' 
          ? '¡Mensaje enviado, gracias! Me pondré en contacto con usted pronto.' 
          : "Message sent, thanks! I'll get back to you soon.";
        form.reset();
      } else {
        status.textContent = lang === 'es' 
          ? 'Algo salió mal. Por favor intente por WhatsApp mientras tanto.' 
          : 'Something went wrong. Try WhatsApp instead for now.';
      }
    })
    .catch(() => {
      status.textContent = lang === 'es' 
        ? 'Algo salió mal. Por favor intente por WhatsApp mientras tanto.' 
        : 'Something went wrong. Try WhatsApp instead for now.';
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
    starter: {
      en: { name: 'Starter', price: 'BZ$600–800', features: ['Single-page site, up to 4 sections', 'Mobile responsive', 'WhatsApp + contact form', '1 round of revisions', '~1 week delivery'] },
      es: { name: 'Inicial', price: 'BZ$600–800', features: ['Sitio de una sola página, hasta 4 secciones', 'Diseño adaptable a teléfonos móviles', 'WhatsApp + formulario de contacto', '1 ronda de revisiones', 'Entrega en ~1 semana'] },
      low: 600, high: 800
    },
    standard: {
      en: { name: 'Standard', price: 'BZ$1,000–1,400', features: ['Up to 5 pages', 'Custom design matched to your brand', 'WhatsApp + contact form + email integration', 'Basic SEO setup', '2 rounds of revisions', '~2–3 week delivery'] },
      es: { name: 'Estándar', price: 'BZ$1,000–1,400', features: ['Hasta 5 páginas', 'Diseño personalizado alineado a su marca', 'WhatsApp + formulario + integración de correo', 'Optimización básica para buscadores (SEO)', '2 rondas de revisiones', 'Entrega en ~2–3 semanas'] },
      low: 1000, high: 1400
    },
    plus: {
      en: { name: 'Plus', price: 'BZ$1,800–2,400', features: ['Everything in Standard', 'Custom animation / interactive elements', 'Bilingual EN/ES version', 'Basic analytics setup', '3 rounds of revisions', '3 months of Hosting & Maintenance included', '~3–4 week delivery'] },
      es: { name: 'Plus', price: 'BZ$1,800–2,400', features: ['Todo lo incluido en Estándar', 'Animaciones y elementos interactivos', 'Versión bilingüe (Inglés/Español)', 'Configuración de analítica web', '3 rondas de revisiones', '3 meses de Alojamiento y Mantenimiento incluidos', 'Entrega en ~3–4 semanas'] },
      low: 1800, high: 2400
    }
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
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function updateProgress() {
    if (progressFill) progressFill.style.width = (currentStep / totalSteps * 100) + '%';
  }

  function goToStep(n) {
    const lang = getLang();
    steps.forEach(s => s.classList.remove('active'));
    const target = steps.find(s => Number(s.dataset.step) === n);
    if (!target) return;
    
    target.classList.add('active');
    currentStep = n;
    
    if (backBtn) {
      backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
      backBtn.textContent = lang === 'es' ? 'Atrás' : 'Back';
    }
    
    const q = target.querySelector('[data-question]').dataset.question;
    if (nextBtn) {
      nextBtn.disabled = !answers[q];
      nextBtn.textContent = n === totalSteps 
        ? (lang === 'es' ? 'Ver estimación' : 'See my estimate') 
        : (lang === 'es' ? 'Siguiente' : 'Next');
    }
    
    updateProgress();
  }

  backdrop.querySelectorAll('.qc-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const group = opt.parentElement;
      group.querySelectorAll('.qc-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[group.dataset.question] = opt.dataset.value;
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) goToStep(currentStep + 1);
      else showResult();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => { if (currentStep > 1) goToStep(currentStep - 1); });
  }

  function calculate() {
    const lang = getLang();
    let tierKey = answers.package;
    let rawTier = TIERS[tierKey];
    let tier = rawTier[lang];
    let low = rawTier.low;
    let high = rawTier.high;
    const addOns = [];
    let upgradeNote = '';

    // Additional Pages
    const pageMap = { none: [0,0], one: [180,180], two: [360,360] };
    if (answers.pages !== 'none') {
      const [lo, hi] = pageMap[answers.pages];
      low += lo; high += hi;
      const pageText = answers.pages === 'one' 
        ? (lang === 'es' ? '1 página adicional' : '1 additional page')
        : (lang === 'es' ? '2 páginas adicionales' : '2 additional pages');
      addOns.push(`${pageText}: BZ$${lo}${lo !== hi ? '–' + hi : ''}`);
    }

    // Bilingual Add-on
    if (answers.bilingual === 'yes' && tierKey !== 'plus') {
      low += 250; high += 400;
      addOns.push(lang === 'es' ? 'Versión bilingüe (EN/ES): BZ$250–400' : 'Bilingual EN/ES: BZ$250–400');
    }

    // Animation
    const anim = {
      none: [0, 0, ''],
      light: [80, 120, lang === 'es' ? 'Animaciones ligeras: BZ$80–120' : 'Light animation: BZ$80–120'],
      moderate: [150, 250, lang === 'es' ? 'Animaciones moderadas: BZ$150–250' : 'Moderate animation: BZ$150–250'],
      full: [300, 450, lang === 'es' ? 'Interactividad avanzada: BZ$300–450' : 'Full interactive animation: BZ$300–450']
    };
    if (tierKey !== 'plus' && answers.animation !== 'none') {
      const [lo, hi, label] = anim[answers.animation];
      low += lo; high += hi; addOns.push(label);
    }

    // Plus Upgrade Recommendation
    if (tierKey !== 'plus' && answers.bilingual === 'yes' && answers.animation !== 'none') {
      upgradeNote = lang === 'es'
        ? `Al seleccionar contenido bilingüe y animación ${answers.animation}, el paquete Plus puede ofrecer mejor valor ya que esas funciones ya están incluidas.`
        : `With bilingual content and ${answers.animation} animation selected, Plus may offer better value because those features are already included.`;
    }

    // Timeline
    let rushLow = low, rushHigh = high;
    if (answers.timeline === 'rush') {
      rushLow = Math.round(low * 1.25);
      rushHigh = Math.round(high * 1.30);
      addOns.push(lang === 'es' ? 'Entrega urgente: +25–30%' : 'Rush delivery: +25–30%');
    }

    // Online Ordering
    if (answers.ordering === 'yes') {
      addOns.push(lang === 'es' ? 'Pedidos / reservas en línea: cotizado por separado' : 'Online ordering / reservations: quoted separately');
    }

    // Hosting
    if (answers.hosting === 'yes') {
      if (tierKey === 'plus') {
        addOns.push(lang === 'es' ? 'Alojamiento y Mantenimiento: incluido por 3 meses, luego BZ$60/mes' : 'Hosting & Maintenance: included for 3 months, then BZ$60/month');
      } else {
        addOns.push(lang === 'es' ? 'Alojamiento y Mantenimiento: BZ$60/mes' : 'Hosting & Maintenance: BZ$60/month');
      }
    }

    return { tierKey, tier, low: rushLow, high: rushHigh, addOns, upgradeNote };
  }

  function showResult() {
    const lang = getLang();
    const result = calculate();
    const tier = result.tier;

    document.getElementById('qc-result-tier').textContent = tier.name;
    
    const priceLabel = lang === 'es' ? '(rango estimado del proyecto)' : '(estimated project range)';
    document.getElementById('qc-result-price').innerHTML =
      `BZ$${result.low.toLocaleString()}–${result.high.toLocaleString()} <span class="qc-price-label">${priceLabel}</span>`;

    document.getElementById('qc-result-features').innerHTML =
      tier.features.map(f => `<li><i class="ti ti-check" aria-hidden="true"></i>${f}</li>`).join('');

    const notes = [];
    const selectionsHeading = lang === 'es' ? 'Sus selecciones:' : 'Your selections:';
    if (result.addOns.length) {
      notes.push(`<p><strong>${selectionsHeading}</strong></p><ul class="qc-addon-list">${result.addOns.map(a => `<li>${a}</li>`).join('')}</ul>`);
    }
    if (result.upgradeNote) {
      notes.push(`<p class="qc-upgrade-note">${result.upgradeNote}</p>`);
    }

    const smallNote = lang === 'es'
      ? 'Esta es una estimación, no una cotización final. El precio final se confirmará por escrito después de revisar su proyecto.'
      : 'This is an estimate, not a final quote. Your final price will be confirmed in writing after we review your project.';
    notes.push(`<p class="qc-small-note">${smallNote}</p>`);

    const notesEl = document.getElementById('qc-result-notes');
    notesEl.style.display = 'block';
    notesEl.innerHTML = notes.join('');

    // Pre-filled WhatsApp CTA Link
    const summary = lang === 'es' ? [
      '¡Hola! Acabo de usar el estimador de presupuesto de Cayo Coding Co.',
      `Paquete: ${tier.name} (${tier.price})`,
      `Bilingüe: ${answers.bilingual === 'yes' ? 'Sí' : 'No'}`,
      `Páginas adicionales: ${answers.pages}`,
      `Animación: ${answers.animation}`,
      `Pedidos/reservas en línea: ${answers.ordering === 'yes' ? 'Sí' : 'No'}`,
      `Plazo de entrega: ${answers.timeline}`,
      `Alojamiento y Mantenimiento: ${answers.hosting === 'yes' ? 'Sí' : 'No'}`,
      `Rango estimado del proyecto: BZ$${result.low.toLocaleString()}–${result.high.toLocaleString()}`,
      '¿Podemos hablar sobre mi proyecto?'
    ].join('\n') : [
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

    const waBtn = document.getElementById('qc-whatsapp-cta');
    if (waBtn) {
      waBtn.href = 'https://wa.me/5016214804?text=' + encodeURIComponent(summary);
      const waBtnText = waBtn.querySelector('span');
      if (waBtnText) {
        waBtnText.textContent = lang === 'es' ? 'Consultar esta estimación por WhatsApp' : 'Discuss this estimate on WhatsApp';
      }
    }

    if (quizForm) quizForm.style.display = 'none';
    if (progressTrack) progressTrack.style.display = 'none';
    if (resultEl) resultEl.classList.add('active');
  }

  const restartLink = document.getElementById('qc-restart-link');
  if (restartLink) {
    restartLink.addEventListener('click', e => {
      e.preventDefault();
      if (resultEl) resultEl.classList.remove('active');
      if (quizForm) quizForm.style.display = 'block';
      if (progressTrack) progressTrack.style.display = 'block';
      backdrop.querySelectorAll('.qc-option.selected').forEach(o => o.classList.remove('selected'));
      Object.keys(answers).forEach(k => delete answers[k]);
      goToStep(1);
    });
  }

  // Language Switch Listener — updates step button labels & general WhatsApp links dynamically when language switches
  const btnEn = document.getElementById('btn-en');
  const btnEs = document.getElementById('btn-es');

  if (btnEn) {
    btnEn.addEventListener('click', () => {
      goToStep(currentStep);
      updateWhatsAppLinks('en');
    });
  }

  if (btnEs) {
    btnEs.addEventListener('click', () => {
      goToStep(currentStep);
      updateWhatsAppLinks('es');
    });
  }

  goToStep(1);
})();