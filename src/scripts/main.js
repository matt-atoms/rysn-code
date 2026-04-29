// RYSN — site-wide custom JS.
// All custom JavaScript for the Webflow storefront lives here.
// Organize by section comments as features are added.

// --- Navbar scroll state ----------------------------------------------------
// Adds `is-scrolled` to `.navbar_container` once the page has scrolled past a
// small threshold, so the nav can swap from transparent/white-text to
// solid/black-text. Styling is owned by Webflow (combo class on .navbar_container).
(() => {
  const nav = document.querySelector('.navbar_container');
  if (!nav) return;

  const THRESHOLD = 50;
  let scheduled = false;

  const update = () => {
    scheduled = false;
    nav.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  };

  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
