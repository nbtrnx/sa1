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

// Member modal: tap a member card to see photo + name + team/role.
// Fill in real info by adding data-team="..." data-role="..." to a card button.
const modal = document.getElementById('member-modal');
if (modal) {
  const photoEl = modal.querySelector('.member-modal__photo');
  const nameEl = modal.querySelector('.member-modal__name');
  const teamEl = modal.querySelector('[data-field="team"]');
  const roleEl = modal.querySelector('[data-field="role"]');
  let lastFocused = null;

  const openModal = (card) => {
    const img = card.querySelector('img.member-photo');
    const name = (card.querySelector('.member-name')?.textContent || 'Name').trim();
    if (img) {
      photoEl.src = img.src;
      photoEl.alt = name;
    } else {
      photoEl.removeAttribute('src');
      photoEl.alt = '';
    }
    nameEl.textContent = name;
    // data attribute absent -> placeholder; set but empty (data-team="") -> row hidden
    teamEl.parentElement.hidden = card.dataset.team === '';
    roleEl.parentElement.hidden = card.dataset.role === '';
    teamEl.textContent = card.dataset.team || 'XXXXXXXXXX';
    roleEl.textContent = card.dataset.role || 'XXXXXXXXXXXXXXXXXXXX';
    lastFocused = card;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.member-modal__close').focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocused?.focus();
  };

  document.querySelectorAll('.card--member').forEach((card) => {
    card.addEventListener('click', () => openModal(card));
  });
  modal.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}
