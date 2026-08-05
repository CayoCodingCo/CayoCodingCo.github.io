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
