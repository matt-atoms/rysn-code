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
      slidesPerView: 1.25,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      breakpoints: {
        // when window width is >= 480px
        480: {
          slidesPerView: 1.8,
        },
        // when window width is >= 992px
        992: {
          slidesPerView: 3.5,
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
