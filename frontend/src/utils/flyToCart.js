/**
 * Parabolic fly-to-cart micro-interaction.
 * Spawns an animated image ghost from the clicked product card
 * that flies smoothly into the cart icon/pill with a landing bounce.
 */
export const triggerFlyToCart = (sourceElement) => {
  if (!sourceElement || typeof window === 'undefined') return;

  const startRect = sourceElement.getBoundingClientRect();
  if (startRect.width === 0 || startRect.height === 0) return;

  // Find visible cart target (desktop navbar, mobile navbar, or floating cart pill)
  const targets = [
    document.querySelector('[data-cart-target]'),
    document.querySelector('#floating-cart-pill'),
    document.querySelector('[data-mobile-cart]'),
  ].filter(Boolean);

  // Pick the first visible target
  let target = targets.find((el) => el.offsetParent !== null) || targets[0];

  let endX = window.innerWidth - 45;
  let endY = 30;

  if (target) {
    const targetRect = target.getBoundingClientRect();
    endX = targetRect.left + targetRect.width / 2;
    endY = targetRect.top + targetRect.height / 2;
  }

  // Create ghost image clone
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
    boxShadow: '0 12px 28px rgba(34, 28, 25, 0.35)',
    transition: 'all 0.65s cubic-bezier(0.18, 0.89, 0.32, 1.15)',
    transformOrigin: 'center center',
  });

  document.body.appendChild(flyer);

  // Animate to destination
  requestAnimationFrame(() => {
    Object.assign(flyer.style, {
      left: `${endX - 16}px`,
      top: `${endY - 16}px`,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      opacity: '0.2',
      transform: 'scale(0.4) rotate(15deg)',
    });
  });

  // Cleanup & trigger cart bounce upon landing
  setTimeout(() => {
    if (flyer.parentNode) {
      flyer.parentNode.removeChild(flyer);
    }
    if (target) {
      target.classList.add('cart-bounce-pop');
      setTimeout(() => {
        target.classList.remove('cart-bounce-pop');
      }, 450);
    }
  }, 650);
};
