// Listing checkout: sends only the listing id; the server prices it and returns a Stripe Checkout URL.
document.querySelectorAll('[data-checkout]').forEach((button) => {
  const status = button.parentElement.querySelector('[data-checkout-status]');
  button.addEventListener('click', async () => {
    button.disabled = true;
    if (status) status.textContent = 'Opening secure checkout…';
    try {
      const res = await fetch('/api/checkout', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({rfp: button.dataset.checkout})});
      const body = await res.json().catch(() => ({}));
      if (res.ok && typeof body.url === 'string' && body.url.startsWith('https://')) { window.location.assign(body.url); return; }
      if (status) status.textContent = body.error || 'Payment could not be started. No charge was made.';
    } catch {
      if (status) status.textContent = 'Payment could not be started. No charge was made.';
    }
    button.disabled = false;
  });
});
