document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.mobile-toggle');
  if (nav && btn) {
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
});


/* ================================================ */

(function initServicesCarouselArrows(){
  const mq = window.matchMedia('(max-width: 560px)');
  const track = document.querySelector('#services .cards');
  const prevBtn = document.getElementById('srvPrev');
  const nextBtn = document.getElementById('srvNext');
  if (!track || !prevBtn || !nextBtn) return;

  function metrics(){
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || '12');
    const padL = parseFloat(style.paddingLeft || '0');
    const card = track.querySelector('.card');
    const cardW = card ? card.getBoundingClientRect().width : Math.floor(track.clientWidth * 0.85);
    const step = cardW + gap;
    return { gap, padL, cardW, step };
  }

  function indexNow(){
    const { padL, step } = metrics();
    return Math.round((track.scrollLeft - padL) / step);
  }

  function atStart(){
    return track.scrollLeft <= 2;
  }
  function atEnd(){
    const max = track.scrollWidth - track.clientWidth - 2;
    return track.scrollLeft >= max;
  }

  function updateButtons(){
    const mobile = mq.matches;
    prevBtn.style.display = mobile ? '' : 'none';
    nextBtn.style.display = mobile ? '' : 'none';
    if (!mobile) return;
    prevBtn.disabled = atStart();
    nextBtn.disabled = atEnd();
  }

  function scrollToIndex(i){
    const { padL, step } = metrics();
    const x = padL + i * step;
    track.scrollTo({ left: x, behavior: 'smooth' });
  }

  function scrollByStep(dir){
    const i = indexNow() + dir;
    scrollToIndex(i);
  }

  prevBtn.addEventListener('click', () => scrollByStep(-1));
  nextBtn.addEventListener('click', () => scrollByStep(1));
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  (mq.addEventListener ? mq : mq.addListener).addEventListener?.('change', updateButtons) || mq.addListener(updateButtons);

  updateButtons();
})();


// ===== Fleet toggle (SPEEDBOATS / LICENCE-FREE) =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle      = document.getElementById('fleetToggle');
  const speedPanel  = document.getElementById('panel-speed');
  const licfreePanel= document.getElementById('panel-licfree');
  const fleetToggle = document.getElementById('fleet-toggle');
  const optionLeft  = fleetToggle?.querySelector('.option-left');
  const optionRight = fleetToggle?.querySelector('.option-right');

  if (!toggle || !speedPanel || !licfreePanel) return;

  function applyFleetState(showLicenceFree){
    if (showLicenceFree) {
      // LICENCE-FREE BOATS
      speedPanel.classList.add('hidden');
      licfreePanel.classList.remove('hidden');
      optionLeft?.classList.remove('active');
      optionRight?.classList.add('active');
    } else {
      // SPEEDBOATS
      licfreePanel.classList.add('hidden');
      speedPanel.classList.remove('hidden');
      optionRight?.classList.remove('active');
      optionLeft?.classList.add('active');
    }
  }

  // deep-link από hash: #speedboats / #licence-free
  function syncFromHash(){
    const h = location.hash.replace('#','');
    if (h === 'licence-free') {
      toggle.checked = true;
      applyFleetState(true);
    } else if (h === 'speedboats') {
      toggle.checked = false;
      applyFleetState(false);
    } else {
      // αν δεν υπάρχει σχετικό hash, σεβόμαστε την τωρινή τιμή του toggle
      applyFleetState(toggle.checked);
    }
  }

  // αρχικό state με βάση το hash ή το toggle
  syncFromHash();

  // αλλαγή από το switch
  toggle.addEventListener('change', () => {
    applyFleetState(toggle.checked);
  });

  // αλλαγή hash από links στο page
  window.addEventListener('hashchange', syncFromHash);
});



  /* ===== Inline carousels μέσα στις κάρτες ===== */
  (function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));


  /* ===== Inline carousels μέσα στις κάρτες ===== */
  function initCardCarousels(){
    $$('.card .img').forEach(imgWrap => {
    if (imgWrap.dataset.carouselInit === "1") return;

    const imgs = $$('img', imgWrap);
    if (imgs.length === 0) return;

    // IMPORTANT: δείξε πάντα την πρώτη (αλλιώς στο fleet.html μπορεί να μείνει αόρατη)
    imgs.forEach(im => im.classList.remove('is-active'));
    imgs[0].classList.add('is-active');

    // If only 1 image no need to make a carousel
    if (imgs.length === 1) {
      imgWrap.dataset.carouselInit = "1";
      return;
    }

    imgWrap.dataset.carouselInit = "1";

    // state
    let i = 0;


      // dots
      const dots = document.createElement('div');
      dots.className = 'dots';
      imgs.forEach((_, idx) => {
        const d = document.createElement('div');
        d.className = 'dot' + (idx===0 ? ' is-active' : '');
        dots.appendChild(d);
      });
      imgWrap.appendChild(dots);

      const update = (nextIdx) => {
        imgs[i].classList.remove('is-active');
        dots.children[i].classList.remove('is-active');
        i = (nextIdx + imgs.length) % imgs.length;
        imgs[i].classList.add('is-active');
        dots.children[i].classList.add('is-active');
      };

      // auto-rotate (pause on hover)
      const interval = parseInt(imgWrap.getAttribute('data-interval') || '4200', 10);
      let timer = setInterval(() => update(i+1), interval);
      imgWrap.addEventListener('mouseenter', () => { clearInterval(timer); });
      imgWrap.addEventListener('mouseleave', () => { timer = setInterval(() => update(i+1), interval); });

      // Swipe (mobile)
      let startX = null;
      imgWrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
      imgWrap.addEventListener('touchend', e => {
        if(startX == null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) update(i + (dx < 0 ? 1 : -1));
        startX = null;
      });

      // Click → Lightbox
      imgWrap.style.cursor = 'zoom-in';
      imgWrap.addEventListener('click', () => openLightbox(imgs.map(im => ({
        src: im.currentSrc || im.src,
        alt: im.alt || ''
      })), i));
    });
  }

  window.Nireus = window.Nireus || {};
  window.Nireus.initCardCarousels = initCardCarousels;
// gallery starts here
  function initGalleryLightbox(){
    $$('.gallery-grid[data-lightbox="gallery"]').forEach(grid => {
      if (grid.dataset.galleryInit === "1") return;

      const btns = $$('.g-item', grid);
      if (btns.length === 0) return;

      const imgs = btns
        .map(b => b.querySelector('img'))
        .filter(Boolean);

      const items = imgs.map(img => ({
        src: img.getAttribute('data-full') || img.currentSrc || img.src,
        alt: img.alt || ''
      }));

      btns.forEach((btn, idx) => {
        btn.addEventListener('click', () => openLightbox(items, idx));
      });

      grid.dataset.galleryInit = "1";
    });
  }

  window.Nireus.initGalleryLightbox = initGalleryLightbox;
// gallery end here


  /* ===== Lightbox (μία για όλη τη σελίδα) ===== */
  let lb, lbImg, lbPrev, lbNext, lbClose, curr = 0, list = [];
  function buildLightboxOnce(){
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lb-backdrop';
    lb.setAttribute('role','dialog');
    lb.setAttribute('aria-modal','true');
    lb.setAttribute('hidden','');

    lb.innerHTML = `
      <div class="lb-dialog">
        <div class="lb-figure">
          <img alt="">
          <button class="lb-prev" aria-label="Προηγούμενη">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15.5 3.5 7 12l8.5 8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button class="lb-next" aria-label="Επόμενη">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8.5 3.5 17 12l-8.5 8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button class="lb-close" aria-label="Κλείσιμο">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbPrev = lb.querySelector('.lb-prev');
    lbNext = lb.querySelector('.lb-next');
    lbClose = lb.querySelector('.lb-close');

    const show = () => {
      const it = list[curr];
      lbImg.src = it.src;
      lbImg.alt = it.alt || '';
    };

    const step = (dir) => {
      curr = (curr + dir + list.length) % list.length;
      show();
    };

    lbPrev.addEventListener('click', () => step(-1));
    lbNext.addEventListener('click', () => step(1));
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });

    // Basic focus trap: focus στο close
    lb.addEventListener('transitionend', () => lbClose.focus(), { once:true });

    // Helpers
    lb._show = () => {
      lb.removeAttribute('hidden');
      document.documentElement.style.overflow='hidden';
      const single = list.length <= 1;
      lbPrev.style.display = single ? 'none' : '';
      lbNext.style.display = single ? 'none' : '';
      show();
      lbClose.focus();
    };
    lb._hide = () => { lb.setAttribute('hidden',''); document.documentElement.style.overflow=''; lbImg.removeAttribute('src'); };
  }

  function openLightbox(items, startIndex=0){
    buildLightboxOnce();
    list = items;
    curr = Math.max(0, Math.min(startIndex, list.length-1));
    lb._show();
  }

  function closeLightbox(){ if (lb) lb._hide(); }

  window.Nireus.openLightbox = openLightbox;

  // init
function initAllMedia(){
  initCardCarousels();
  initGalleryLightbox();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initAllMedia, { once:true });
} else {
  initAllMedia();
}

})();
