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

// --- Swiper slider (Osmo Supply) --------------------------------------------
// Initializes any [data-swiper-group] container into a Swiper slider.
// Requires the Swiper bundle to be loaded BEFORE this script in Webflow
// Site Settings (head/body custom code).
function initSwiperSlider() {
  const swiperSliderGroups = document.querySelectorAll("[data-swiper-group]");

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector("[data-swiper-wrap]");
    if(!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 1,
      speed: 600,
      mousewheel: false,
      grabCursor: true,
      breakpoints: {
        // tablet: >= 768px → 2 cards
        768: {
          slidesPerView: 2,
        },
        // desktop: >= 992px → 3 cards
        992: {
          slidesPerView: 3,
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
