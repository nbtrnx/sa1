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
// Apply per-member crop settings: data-photo-pos (position), data-photo-zoom (scale)
const applyPhotoCrop = (img, card) => {
  const pos = card.dataset.photoPos || 'center';
  const zoom = parseFloat(card.dataset.photoZoom || '1');
  img.style.objectPosition = pos;
  img.style.transformOrigin = pos;
  img.style.transform = zoom !== 1 ? `scale(${zoom})` : '';
};

document.querySelectorAll('.card--member').forEach((card) => {
  const img = card.querySelector('.member-photo img');
  if (img) applyPhotoCrop(img, card);
});

const modal = document.getElementById('member-modal');
if (modal) {
  const photoEl = modal.querySelector('.member-modal__photo img');
  const nameEl = modal.querySelector('.member-modal__name');
  const teamEl = modal.querySelector('[data-field="team"]');
  const roleEl = modal.querySelector('[data-field="role"]');
  const majorEl = modal.querySelector('[data-field="major"]');
  let lastFocused = null;

  const openModal = (card) => {
    const img = card.querySelector('.member-photo img');
    const name = (card.querySelector('.member-name')?.textContent || 'Name').trim();
    if (img) {
      photoEl.src = img.src;
      photoEl.alt = name;
    } else {
      // transparent pixel keeps the gray placeholder box, no broken-image icon
      photoEl.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      photoEl.alt = '';
    }
    applyPhotoCrop(photoEl, card);
    nameEl.textContent = name;
    // data attribute absent -> placeholder; set but empty (data-team="") -> row hidden
    teamEl.parentElement.hidden = card.dataset.team === '';
    roleEl.parentElement.hidden = card.dataset.role === '';
    majorEl.parentElement.hidden = card.dataset.major === '';
    teamEl.textContent = card.dataset.team || 'XXXXXXXXXX';
    roleEl.textContent = card.dataset.role || 'XXXXXXXXXXXXXXXXXXXX';
    majorEl.textContent = card.dataset.major || 'XXXXXXXXXX';
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

// Work modals (works page): static modals opened via data-open-modal buttons.
// Pages show one at a time; arrows or ArrowLeft/ArrowRight flip pages.
document.querySelectorAll('.work-modal').forEach((m) => {
  const close = () => { m.hidden = true; document.body.classList.remove('modal-open'); };
  m.querySelectorAll('[data-modal-close]').forEach((el) => el.addEventListener('click', close));

  const pages = [...m.querySelectorAll('.work-modal__stage img')];
  const counter = m.querySelector('.work-modal__counter');
  let current = 0;
  const show = (i) => {
    current = (i + pages.length) % pages.length;
    pages.forEach((p, k) => p.classList.toggle('is-current', k === current));
    if (counter) counter.textContent = `${current + 1} / ${pages.length}`;
  };
  m.querySelector('.work-modal__nav--prev')?.addEventListener('click', () => show(current - 1));
  m.querySelector('.work-modal__nav--next')?.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', (e) => {
    if (m.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
});
document.querySelectorAll('[data-open-modal]').forEach((btn) => {
  const m = document.getElementById(btn.dataset.openModal);
  if (!m) return;
  btn.addEventListener('click', () => {
    m.hidden = false;
    document.body.classList.add('modal-open');
    m.querySelector('.work-modal__close')?.focus();
  });
});
