// A still photograph is the poster and fallback. Motion starts only after load
// and only when requested by the visitor's motion preference.
(() => {
  const hero = document.querySelector('.hero-cinematic');
  const photo = hero?.querySelector('.hero-image');
  const button = document.getElementById('motion-toggle');
  if (!hero || !photo || !button) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  const update = () => {
    const active = !reduced.matches && photo.complete && photo.naturalWidth > 0;
    hero.dataset.motion = active ? 'enabled' : 'disabled';
    hero.dataset.paused = String(paused);
    button.hidden = !active;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume image motion' : 'Pause image motion';
  };
  button.addEventListener('click', () => { paused = !paused; update(); });
  photo.addEventListener('load', update);
  photo.addEventListener('error', update);
  reduced.addEventListener('change', update);
  update();
})();
