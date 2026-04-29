// RYSN — site-wide custom JS.
// All custom JavaScript for the Webflow storefront lives here.
// Organize by section comments as features are added.

// --- Navbar scroll state ----------------------------------------------------
// Adds `is-scrolled` to `.navbar_container` once the page has scrolled past a
// small threshold, so the nav can swap from transparent/white-text to
// solid/black-text. Styling is owned by Webflow (combo class on .navbar_container).
//
// Pages without a hero image can opt out of the transparent state by setting
// `data-nav="scrolled"` on any element (typically the page/body wrapper). The
// nav then stays in its scrolled state regardless of scroll position.
(() => {
  const nav = document.querySelector('.navbar_container');
  if (!nav) return;

  if (document.querySelector('[data-nav="scrolled"]')) {
    nav.classList.add('is-scrolled');
    return;
  }

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

// --- Swiper slider (Osmo Supply) --------------------------------------------
// Initializes any [data-swiper-group] container into a Swiper slider.
// Requires the Swiper bundle to be loaded BEFORE this script in Webflow
// Site Settings (head/body custom code).
//
// Per-slider overrides (read from either the group or the wrap element):
//   data-show-mobile   slidesPerView at  <  768px  (default 1.1)
//   data-show-tablet   slidesPerView at >= 768px  (default 2.25)
//   data-show-desktop  slidesPerView at >= 992px  (default 3)
// Values are parsed as floats so peeks like "3.25" work.
function initSwiperSlider() {
  const DEFAULTS = { mobile: 1.1, tablet: 2.25, desktop: 3 };

  const readShow = (group, wrap, key) => {
    const raw = group.getAttribute(`data-show-${key}`) ?? wrap.getAttribute(`data-show-${key}`);
    const parsed = raw == null ? NaN : parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULTS[key];
  };

  const swiperSliderGroups = document.querySelectorAll("[data-swiper-group]");

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector("[data-swiper-wrap]");
    if(!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: readShow(swiperGroup, swiperSliderWrap, 'mobile'),
      speed: 600,
      mousewheel: false,
      grabCursor: true,
      breakpoints: {
        768: {
          slidesPerView: readShow(swiperGroup, swiperSliderWrap, 'tablet'),
        },
        992: {
          slidesPerView: readShow(swiperGroup, swiperSliderWrap, 'desktop'),
        }
      },
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
    });

  });
}

// Initialize Swiper Slider Setup
document.addEventListener('DOMContentLoaded', () => {
  initSwiperSlider();
});

// --- Accordion (CSS-based) --------------------------------------------------
// Toggles `data-accordion-status` between "active" and "not-active" on the
// nearest accordion container when a `[data-accordion-toggle]` is clicked.
// If the parent accordion has `data-accordion-close-siblings="true"`, opening
// one closes the others.
function initAccordionCSS() {
  document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return; // Exit if the clicked element is not a toggle

      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return; // Exit if no accordion container is found

      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');

      // When [data-accordion-close-siblings="true"]
      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });
}

// Initialize Accordion CSS
document.addEventListener('DOMContentLoaded', () => {
  initAccordionCSS();
});

// --- Before/After Split Slider (Osmo Supply) --------------------------------
// Drag the [data-splitter="handle"] inside a [data-splitter="wrap"] to reveal
// more or less of the [data-splitter="after"] image via animated clip-path.
// Optional `data-splitter-initial` (0–100) sets the starting position; defaults
// to 50.
//
// Requires GSAP and the Draggable plugin to be loaded BEFORE this script in
// Webflow Site Settings (head/body custom code).
function initBeforeAfterSplitSlider() {
  if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') return;
  gsap.registerPlugin(Draggable);

  const splitters = document.querySelectorAll('[data-splitter="wrap"]');

  const setupSplitter = (splitter) => {
    const handle = splitter.querySelector('[data-splitter="handle"]');
    const after = splitter.querySelector('[data-splitter="after"]');

    let bounds = splitter.getBoundingClientRect();
    let currentPercent = parseFloat(splitter.getAttribute('data-splitter-initial')) || 50;

    const setPositions = (percent) => {
      bounds = splitter.getBoundingClientRect();
      const positionX = (percent / 100) * bounds.width;
      gsap.set(handle, { x: positionX, left: 'unset' });
      gsap.set(after, { clipPath: `inset(0 0 0 ${percent}%)` });
    };

    setPositions(currentPercent);

    Draggable.create(handle, {
      type: 'x',
      bounds: splitter,
      cursor: 'ew-resize',
      activeCursor: 'grabbing',
      onDrag() {
        currentPercent = (this.x / bounds.width) * 100;
        gsap.set(after, { clipPath: `inset(0 0 0 ${currentPercent}%)` });
      },
    });

    window.addEventListener('resize', () => setPositions(currentPercent));
  };

  splitters.forEach(setupSplitter);
}

document.addEventListener('DOMContentLoaded', () => {
  initBeforeAfterSplitSlider();
});

// --- iOS viewport height fix -----------------------------------------------
// Sets `--viewport-height` on :root to the visualViewport height (or
// innerHeight fallback), and updates it when iOS toolbars expand/collapse.
// Use `var(--viewport-height)` instead of `100vh` to avoid the iOS jump.
function setViewportHeight() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--viewport-height', vh + 'px');
}
setViewportHeight();
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setViewportHeight);
}

// --- Smootify analytics (consent-gated) ------------------------------------
// On production, only enables analytics once the visitor has granted consent
// via Shopify's customerPrivacy API. Re-checks on every consent update.
// On staging where customerPrivacy isn't loaded, enables analytics directly.
document.addEventListener('smootify:loaded', function () {
  if (window.Shopify && window.Shopify.customerPrivacy) {
    var privacy = window.Shopify.customerPrivacy;

    if (privacy.analyticsProcessingAllowed()) {
      Smootify.enableAnalytics(true);
    }

    document.addEventListener('visitorConsentCollected', function () {
      if (privacy.analyticsProcessingAllowed()) {
        Smootify.enableAnalytics(true);
      }
    });
  } else {
    Smootify.enableAnalytics(true);
  }
});

// --- Auto-open cart on add-to-cart -----------------------------------------
document.addEventListener('smootify:added_to_cart', function () {
  var cartTrigger = document.querySelector('[data-trigger="open"].navbar14_link.is-cart');
  if (cartTrigger) cartTrigger.click();
});

// --- Empty-cart close button fallback --------------------------------------
// The empty-state close button doesn't natively close the cart; route its
// click through the overlay click instead. Attach once per element.
document.addEventListener('smootify:cart_updated', function () {
  var emptyClose = document.querySelector('.sm-wf-cart_empty-container [data-trigger="close"]');
  if (!emptyClose || emptyClose.dataset.fixApplied) return;
  emptyClose.dataset.fixApplied = 'true';
  emptyClose.addEventListener('click', function () {
    var overlay = document.querySelector('.sm-ix-cart_overlay');
    if (overlay) overlay.click();
  });
});

// --- Lock body scroll while cart drawer is open ----------------------------
// Watches the cart container's inline display style and freezes the body at
// the current scroll position when the drawer opens, restoring on close.
(function () {
  var scrollPosition = 0;
  var cartContainer = document.querySelector('.sm-ix-cart_interaction-container');
  if (!cartContainer) return;

  new MutationObserver(function () {
    var isOpen = cartContainer.style.display === 'flex';
    if (isOpen) {
      scrollPosition = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollPosition + 'px';
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition);
    }
  }).observe(cartContainer, { attributes: true, attributeFilter: ['style'] });
})();

// --- Canteen deposit refresh on cart update --------------------------------
// If the Canteen (statiegeld) integration is loaded, re-evaluate deposits
// whenever the Smootify cart changes. No-ops if Canteen isn't on the page.
document.addEventListener('smootify:cart_updated', function () {
  if (window.Canteen && typeof window.Canteen.refresh === 'function') {
    window.Canteen.refresh();
  }
});
