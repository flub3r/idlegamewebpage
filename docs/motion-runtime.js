(() => {
  const motion = window.Motion;
  if (!motion || typeof motion.animate !== 'function') return;

  const animate = motion.animate;
  const stagger = typeof motion.stagger === 'function' ? motion.stagger : null;

  window.animateSafe = function (el, frames, options = {}) {
    if (!el) return null;
    try {
      const props = {};
      for (const frame of frames || []) {
        for (const [key, value] of Object.entries(frame)) {
          if (key === 'offset') continue;
          (props[key] ||= []).push(value);
        }
      }
      return animate(el, props, {
        duration: Math.max(.05, (options.duration || 300) / 1000),
        delay: Math.max(0, (options.delay || 0) / 1000),
        ease: 'easeOut'
      });
    } catch {
      if (typeof el.animate !== 'function') return null;
      try { return el.animate(frames, options); } catch { return null; }
    }
  };

  window.press = function (el, scale = .965) {
    if (!el) return null;
    try {
      return animate(el, { scale: [1, scale, 1] }, {
        type: 'spring', stiffness: 520, damping: 28, mass: .55
      });
    } catch {
      return window.animateSafe(el,
        [{ transform: 'scale(1)' }, { transform: `scale(${scale})` }, { transform: 'scale(1)' }],
        { duration: 260, easing: 'cubic-bezier(.2,.9,.2,1.35)' });
    }
  };

  window.staggerCards = function () {
    const els = Array.from(document.querySelectorAll(
      '.page.active .motion-card,.page.active .row,.page.active .upgrade,.page.active .pool,.page.active .contract'
    ));
    if (!els.length) return;
    try {
      return animate(els,
        { opacity: [0, 1], y: [12, 0], scale: [.985, 1] },
        {
          type: 'spring', stiffness: 260, damping: 24, mass: .7,
          delay: stagger ? stagger(.026) : 0
        });
    } catch {
      els.forEach((el, i) => window.animateSafe(el,
        [{ opacity: 0, transform: 'translateY(10px) scale(.985)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
        { duration: 360, delay: Math.min(i, 12) * 24, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }));
    }
  };

  window.spawnDelta = function (x, y, text, crit = false) {
    const el = document.createElement('div');
    el.className = 'delta' + (crit ? ' crit' : '');
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    try {
      const controls = animate(el,
        { opacity: [0, 1, 0], y: [0, -14, -66], scale: [.88, 1.08, .96] },
        { duration: .78, ease: 'easeOut' });
      if (controls && controls.finished) controls.finished.then(() => el.remove()).catch(() => el.remove());
      else setTimeout(() => el.remove(), 800);
    } catch {
      const fallback = window.animateSafe(el,
        [{ transform: 'translate(-50%,0) scale(.9)', opacity: 0 }, { transform: 'translate(-50%,-12px) scale(1.05)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-62px) scale(.96)', opacity: 0 }],
        { duration: 760, easing: 'cubic-bezier(.2,.8,.2,1)' });
      if (fallback) fallback.onfinish = () => el.remove(); else setTimeout(() => el.remove(), 760);
    }
  };
})();
