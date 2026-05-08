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

// --- Cart drawer (GSAP) ----------------------------------------------------
// Drives the Smootify cart drawer with GSAP instead of Webflow IX2 (which
// doesn't fire on programmatic clicks). Backdrop fade in/out only — panel
// snaps to its resting position. Open via:
//   - clicking [data-trigger="open"].navbar14_link.is-cart
//   - smootify:added_to_cart event
//   - window.RYSNCart.open()
// Close via any [data-trigger="close"] inside the drawer (backdrop or close
// button), Escape, or window.RYSNCart.close(). Locks body scroll while open.
(function () {
  if (typeof gsap === 'undefined') return;

  const container = document.querySelector('.sm-ix-cart_interaction-container');
  if (!container) return;
  const backdrop = container.querySelector('.sm-ix-cart_backdrop');
  const panel = container.querySelector('.sm-ix-cart_relative-container');
  if (!backdrop || !panel) return;

  const openTrigger = document.querySelector('[data-trigger="open"].navbar14_link.is-cart');
  const DURATION = 0.5;
  const EASE = 'power3.out';
  const EASE_OUT = 'power3.in';

  let isOpen = false;
  let scrollPosition = 0;

  gsap.set(container, { display: 'none' });
  gsap.set(backdrop, { autoAlpha: 0 });
  gsap.set(panel, { xPercent: 100, force3D: true });

  const lockScroll = () => {
    scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollPosition + 'px';
    document.body.style.width = '100%';
  };

  const unlockScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
  };

  const openCart = () => {
    if (isOpen) return;
    isOpen = true;
    lockScroll();
    gsap.timeline()
      .set(container, { display: 'flex' })
      .to(backdrop, { autoAlpha: 1, duration: DURATION, ease: EASE }, 0)
      .to(panel, { xPercent: 0, duration: DURATION, ease: EASE }, 0);
  };

  const closeCart = () => {
    if (!isOpen) return;
    isOpen = false;
    gsap.timeline({
      onComplete: () => {
        gsap.set(container, { display: 'none' });
        unlockScroll();
      },
    })
      .to(backdrop, { autoAlpha: 0, duration: DURATION, ease: EASE_OUT }, 0)
      .to(panel, { xPercent: 100, duration: DURATION, ease: EASE_OUT }, 0);
  };

  // Capture-phase short-circuits any leftover IX2 binding on the trigger.
  openTrigger?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    openCart();
  }, true);

  container.addEventListener('click', (e) => {
    if (e.target.closest('[data-trigger="close"]')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeCart();
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeCart();
  });

  document.addEventListener('smootify:added_to_cart', openCart);

  window.RYSNCart = { open: openCart, close: closeCart };
})();

// --- Canteen deposit refresh on cart update --------------------------------
// If the Canteen (statiegeld) integration is loaded, re-evaluate deposits
// whenever the Smootify cart changes. No-ops if Canteen isn't on the page.
document.addEventListener('smootify:cart_updated', function () {
  if (window.Canteen && typeof window.Canteen.refresh === 'function') {
    window.Canteen.refresh();
  }
});

// --- Elements Reveal on Scroll (Osmo Supply) -------------------------------
// GSAP + ScrollTrigger reveal system. Wrap content in [data-reveal-group] to
// stagger-fade direct children into view. Nested groups via
// [data-reveal-group-nested] get their own sequence. Defaults: 100ms stagger,
// 2em distance, "top 80%" trigger. Override per-group via data-stagger,
// data-distance, data-start. Use data-ignore="true"/"false" to skip/include
// elements. GSAP + ScrollTrigger must be loaded in Webflow Custom Code.
gsap.registerPlugin(ScrollTrigger);

function initContentRevealScroll(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {

    document.querySelectorAll('[data-reveal-group]').forEach(groupEl => {
      // Config from attributes or defaults (group-level)
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000; // ms → sec
      const groupDistance = groupEl.getAttribute('data-distance') || '2em';
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      const animDuration = 0.8;
      const animEase = "power4.inOut";

      // Reduced motion: show immediately
      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
        return;
      }

      // If no direct children, animate the group element itself
      const directChildren = Array.from(groupEl.children).filter(el => el.nodeType === 1);
      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () => gsap.to(groupEl, {
            y: 0,
            autoAlpha: 1,
            duration: animDuration,
            ease: animEase,
            onComplete: () => gsap.set(groupEl, { clearProps: 'all' })
          })
        });
        return;
      }

      // Build animation slots: item or nested (deep layers allowed)
      const slots = [];
      directChildren.forEach(child => {
        const nestedGroup = child.matches('[data-reveal-group-nested]')
          ? child
          : child.querySelector(':scope [data-reveal-group-nested]');

        if (nestedGroup) {
          const includeParent =
            child.getAttribute('data-ignore') !== 'true' &&
            (
              child.getAttribute('data-ignore') === 'false' ||
              nestedGroup.getAttribute('data-ignore') === 'false'
            );

          const nestedChildren = Array.from(nestedGroup.children).filter(
            el => el.nodeType === 1 && el.getAttribute('data-ignore') !== 'true'
          );

          slots.push({
            type: 'nested',
            parentEl: child,
            nestedEl: nestedGroup,
            includeParent,
            nestedChildren
          });
        } else {
          if (child.getAttribute('data-ignore') === 'true') return;
          slots.push({ type: 'item', el: child });
        }
      });

      // Initial hidden state
      slots.forEach(slot => {
        if (slot.type === 'item') {
          // If the element itself is a nested group, force group distance (prevents it from using its own data-distance)
          const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
          const d = isNestedSelf ? groupDistance : (slot.el.getAttribute('data-distance') || groupDistance);
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          // Parent follows the group's distance when included, regardless of nested's data-distance
          if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          // Children use nested group's own distance (fallback to group distance)
          const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
          slot.nestedChildren.forEach(target => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
        }
      });

      // Extra safety: if a nested parent is included, re-assert its distance to the group's value
      slots.forEach(slot => {
        if (slot.type === 'nested' && slot.includeParent) {
          gsap.set(slot.parentEl, { y: groupDistance });
        }
      });

      // Reveal sequence
      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;

            if (slot.type === 'item') {
              tl.to(slot.el, {
                y: 0,
                autoAlpha: 1,
                duration: animDuration,
                ease: animEase,
                onComplete: () => gsap.set(slot.el, { clearProps: 'all' })
              }, slotTime);
            } else {
              // Optionally include the parent at the same slot time (parent uses group distance)
              if (slot.includeParent) {
                tl.to(slot.parentEl, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' })
                }, slotTime);
              }
              // Nested children use nested stagger (ms → sec); fallback to group stagger
              const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
              slot.nestedChildren.forEach((nestedChild, nestedIndex) => {
                tl.to(nestedChild, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(nestedChild, { clearProps: 'all' })
                }, slotTime + nestedIndex * nestedStaggerSec);
              });
            }
          });
        }
      });
    });

  });

  return () => ctx.revert();
}

// Initialize Elements Reveal on Scroll
document.addEventListener("DOMContentLoaded", () => {
  initContentRevealScroll();
});

// --- Scroll parallax (premium imagery) -------------------------------------
// Adds a vertical parallax drift to any element with [data-parallax]. As the
// element passes through the viewport it translates from -strength% to
// +strength% of its own height, tied to scroll position. The image appears
// to lag slightly behind the page — slower, grounded, editorial.
//
// A baseline scale of 1.2 is applied so the translated element always
// covers its container. The parent wrapper should use overflow:hidden so
// the scaled image doesn't bleed into surrounding sections.
//
// Usage in Webflow Designer (Element Settings → Custom Attributes):
//   data-parallax           → strength 10 (default — subtle)
//   data-parallax = "15"    → stronger drift
//   data-parallax = "5"     → barely-there drift
//
// Honors prefers-reduced-motion. ScrollTrigger is already registered by the
// reveal-on-scroll init above.
function initParallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.querySelectorAll('[data-parallax]').forEach(el => {
    const raw = parseFloat(el.getAttribute('data-parallax'));
    const strength = Number.isFinite(raw) ? raw : 10;

    gsap.set(el, { scale: 1.2 });

    gsap.fromTo(el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", initParallax);
