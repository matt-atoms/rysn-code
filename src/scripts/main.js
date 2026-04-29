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
