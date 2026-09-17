/**
 * Parabolic fly-to-cart micro-interaction.
 * Spawns an animated image ghost from the clicked product card
 * that flies smoothly down into the floating bottom cart pill (thumbnail stack)
 * with a landing bounce.
 */
export const triggerFlyToCart = (sourceElement) => {
  if (!sourceElement || typeof window === 'undefined') return;

  const startRect = sourceElement.getBoundingClientRect();
  if (startRect.width === 0 || startRect.height === 0) return;

  // 1. Target the floating bottom cart pill thumbnail stack first
  const floatingThumbnails = document.querySelector('#floating-cart-thumbnails');
  const floatingPill = document.querySelector('#floating-cart-pill');
  const navCart = document.querySelector('[data-cart-target]') || document.querySelector('[data-mobile-cart]');

  let targetElement = floatingThumbnails || floatingPill || navCart;
  let endX;
  let endY;

  if (targetElement) {
    const targetRect = targetElement.getBoundingClientRect();
    endX = targetRect.left + (floatingThumbnails ? targetRect.width / 2 : 28);
    endY = targetRect.top + targetRect.height / 2;
  } else {
    // If floating bar hasn't rendered yet (transitioning from 0 to 1 item),
    // land at the expected bottom-center location where the pill pops up!
    endX = window.innerWidth / 2 - 80;
    endY = window.innerHeight - 45;
  }

  // 2. Create high-fidelity ghost image clone
  const flyer = document.createElement('img');
  flyer.src = sourceElement.src || '/placeholder-food.png';
  flyer.className = 'fly-to-cart-ghost';

  Object.assign(flyer.style, {
    position: 'fixed',
    zIndex: '999999',
    left: `${startRect.left}px`,
    top: `${startRect.top}px`,
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    borderRadius: '16px',
    objectFit: 'cover',
    pointerEvents: 'none',
    boxShadow: '0 16px 32px rgba(34, 28, 25, 0.4)',
    transition: 'all 0.68s cubic-bezier(0.2, 0.85, 0.25, 1.1)',
    transformOrigin: 'center center',
  });

  document.body.appendChild(flyer);

  // 3. Animate gracefully into the bottom floating cart thumbnail stack
  requestAnimationFrame(() => {
    Object.assign(flyer.style, {
      left: `${endX - 16}px`,
      top: `${endY - 16}px`,
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      opacity: '0.85',
      transform: 'scale(0.8) rotate(12deg)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    });
  });

  // 4. Trigger landing bounce on floating cart bar upon arrival
  setTimeout(() => {
    if (flyer.parentNode) {
      flyer.parentNode.removeChild(flyer);
    }
    const pill = document.querySelector('#floating-cart-pill');
    if (pill) {
      pill.classList.add('cart-pill-bounce');
      setTimeout(() => {
        pill.classList.remove('cart-pill-bounce');
      }, 450);
    }
    if (targetElement && targetElement !== pill) {
      targetElement.classList.add('cart-bounce-pop');
      setTimeout(() => {
        targetElement.classList.remove('cart-bounce-pop');
      }, 450);
    }
  }, 680);
};
