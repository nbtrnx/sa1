// Home carousels: one dot per card, synced with horizontal scroll.
document.querySelectorAll('[data-carousel]').forEach((row) => {
  const dotsEl = document.querySelector(`[data-dots="${row.dataset.carousel}"]`);
  if (!dotsEl) return;

  const cards = [...row.children];
  const dots = cards.map((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.setAttribute('aria-label', `${i + 1} / ${cards.length}`);
    dot.addEventListener('click', () => {
      row.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
    });
    dotsEl.append(dot);
    return dot;
  });

  const setActive = () => {
    let index = 0;
    let best = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - row.scrollLeft);
      if (distance < best) { best = distance; index = i; }
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  row.addEventListener('scroll', () => requestAnimationFrame(setActive), { passive: true });
  setActive();
});
