document.addEventListener('DOMContentLoaded', () => { document.title = 'Hakyhm | Official Website'; });
document.title = 'Hakyhm | Official Website';
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const grid = document.getElementById('music-grid');
  const ARTIST_ID = '1599546425';
  const artistName = 'hakyhm';

  const EXCLUDED_RELEASES = [
    'second chance', '2nd chance', 'time machine', 'cold as you',
    'better life', 'adding up', 'sum 2 prove', 'made it here'
  ];

  function normalizeReleaseTitle(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function isExcludedRelease(title) {
    const key = normalizeReleaseTitle(title);
    return EXCLUDED_RELEASES.some(name => {
      const excluded = normalizeReleaseTitle(name);
      return key === excluded || key.includes(excluded);
    });
  }

  function searchUrl(platform, title) {
    const q = encodeURIComponent(`${artistName} ${title}`);
    return {
      spotify: `https://open.spotify.com/search/${q}`,
      apple: `https://music.apple.com/us/search?term=${q}`,
      youtube: `https://music.youtube.com/search?q=${q}`,
      deezer: `https://www.deezer.com/search/${q}`,
      tidal: `https://listen.tidal.com/search?q=${q}`,
      pandora: `https://www.pandora.com/search/${q}/all`
    }[platform];
  }

  function card(release) {
    const title = release.collectionName || release.title;
    const art = (release.artworkUrl100 || '')
      .replace('100x100bb', '600x600bb')
      .replace('100x100-75', '600x600-75');
    const links = {
      apple: release.collectionViewUrl || searchUrl('apple', title),
      spotify: searchUrl('spotify', title),
      youtube: searchUrl('youtube', title),
      deezer: searchUrl('deezer', title),
      tidal: searchUrl('tidal', title),
      pandora: searchUrl('pandora', title)
    };
    return `<article class="music-card">
      <div class="music-cover tilt-card"><img src="${art}" alt="${title} cover art" loading="lazy"></div>
      <details class="music-listen"><summary>LISTEN NOW <i class="fa-solid fa-chevron-down"></i></summary>
        <div class="platform-links">
          <a href="${links.apple}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-apple"></i>Apple Music</a>
          <a href="${links.spotify}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-spotify"></i>Spotify</a>
          <a href="${links.youtube}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube"></i>YouTube Music</a>
          <a href="${links.deezer}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-music"></i>Deezer</a>
          <a href="${links.tidal}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-wave-square"></i>TIDAL</a>
          <a href="${links.pandora}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-radio"></i>Pandora</a>
        </div>
      </details>
    </article>`;
  }

  function attachTilt() {
    document.querySelectorAll('.tilt-card').forEach(el => {
      if (el.dataset.tiltReady) return;
      el.dataset.tiltReady = '1';
      const reset = () => { el.style.removeProperty('transform'); };
      el.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch' || window.matchMedia('(max-width: 900px)').matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', reset);
    });
  }

  attachTilt();

  function loadCatalog() {
    if (!grid) return;
    const cb = '__hakyhmCatalog';
    window[cb] = data => {
      if (data && data.results) {
        const seen = new Set();
        const albums = data.results
          .filter(x => x.wrapperType === 'collection' && x.collectionName && x.artworkUrl100)
          .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
          .filter(x => {
            const key = normalizeReleaseTitle(x.collectionName);
            if (isExcludedRelease(x.collectionName) || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        grid.insertAdjacentHTML('beforeend', albums.map(card).join(''));
        attachTilt();
      }
      cleanup();
    };

    const script = document.createElement('script');
    script.src = `https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=album&limit=200&country=US&callback=${cb}`;
    script.onerror = cleanup;
    script.id = 'hakyhm-catalog-api';
    document.body.appendChild(script);

    function cleanup() {
      setTimeout(() => {
        const el = document.getElementById('hakyhm-catalog-api');
        if (el) el.remove();
        try { delete window[cb]; } catch (_) {}
      }, 1000);
    }
  }

  loadCatalog();
});

/* MOBILE BUTTONS
   Three lines = navigation only.
   Share-looking icon = social icons only.
   Desktop remains unchanged. */
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');

  const socialButton = document.querySelector('.mobile-share');
  const socialDrawer = document.querySelector('.social-drawer');
  const socialClose = document.querySelector('.social-drawer-close');

  function closeNavigation() {
    if (!menuButton || !navLinks) return;
    navLinks.classList.remove('mobile-open');
    document.body.classList.remove('menu-is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');

    const icon = menuButton.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  }

  function openNavigation() {
    if (!menuButton || !navLinks) return;
    closeSocialMenu(false);
    navLinks.classList.add('mobile-open');
    document.body.classList.add('menu-is-open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close navigation menu');

    const icon = menuButton.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    }
  }

  function closeSocialMenu(restoreFocus = true) {
    if (!socialButton || !socialDrawer) return;
    socialDrawer.classList.remove('is-open');
    socialDrawer.setAttribute('aria-hidden', 'true');
    socialButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('social-drawer-open');

    if (restoreFocus) socialButton.focus();
  }

  function openSocialMenu() {
    if (!socialButton || !socialDrawer) return;
    closeNavigation();
    socialDrawer.classList.add('is-open');
    socialDrawer.setAttribute('aria-hidden', 'false');
    socialButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('social-drawer-open');

    if (socialClose) socialClose.focus();
  }

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('mobile-open');
      if (isOpen) closeNavigation();
      else openNavigation();
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNavigation);
    });
  }

  if (socialButton && socialDrawer) {
    socialButton.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = socialDrawer.classList.contains('is-open');
      if (isOpen) closeSocialMenu();
      else openSocialMenu();
    });
  }

  if (socialClose) {
    socialClose.addEventListener('click', () => closeSocialMenu());
  }

  if (socialDrawer) {
    socialDrawer.addEventListener('click', (event) => {
      if (event.target === socialDrawer) closeSocialMenu();
    });

    socialDrawer.querySelectorAll('.social-drawer-links a').forEach((link) => {
      link.addEventListener('click', () => closeSocialMenu(false));
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (socialDrawer && socialDrawer.classList.contains('is-open')) {
      closeSocialMenu();
      return;
    }

    if (navLinks && navLinks.classList.contains('mobile-open')) {
      closeNavigation();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeNavigation();
      closeSocialMenu(false);
    }
  });
});

/* EPK: print / save the Electronic Press Kit */
document.addEventListener('DOMContentLoaded', () => {
  const printButton = document.querySelector('[data-print-epk]');
  if (printButton) {
    printButton.addEventListener('click', () => window.print());
  }
});


/* =========================================================
   HAKYHM SERVICES CART / CHECKOUT / ACCOUNT
   Add your live checkout URLs below before publishing.
   Apple Pay / Google Pay are normally supplied by a payment
   processor such as Stripe Checkout. Linktree Pay should use
   the exact Linktree payment/checkout URL for the service.
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Live Stripe Payment Links, in the same order as the services on the site.
  const STRIPE_LINKS = {
    'Hakyhm Services Song Mix': 'https://buy.stripe.com/28E4gy9r7dn77sq1Tl0kE01',
    'Hakyhm Recording Template': 'https://buy.stripe.com/5kQ14m9r7fvfbIG2Xp0kE02',
    'Hakyhm Feature': 'https://buy.stripe.com/00wdR80UBaaV286dC30kE03'
  };

  const CART_KEY = 'hakyhm_cart_v1';
  const ACCOUNT_KEY = 'hakyhm_account_v1';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (_) { cart = []; }

  const money = (n) => `$${Number(n).toFixed(2)}`;

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function total() {
    return cart.reduce((sum, item) => sum + Number(item.price), 0);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.hakyhm-modal.is-open')) document.body.style.overflow = '';
  }

  function renderCart() {
    const items = $('#cart-items');
    const empty = $('#cart-empty');
    const totalEl = $('#cart-total');
    const countEl = $('#cart-count');
    const checkoutBtn = $('#cart-checkout');
    if (!items || !empty || !totalEl) return;

    items.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${money(item.price)}</span>
        <button class="cart-remove" type="button" data-remove-item="${index}" aria-label="Remove ${item.name}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');

    empty.style.display = cart.length ? 'none' : 'block';
    totalEl.textContent = money(total());
    if (countEl) countEl.textContent = String(cart.length);
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    $$('[data-remove-item]').forEach((button) => {
      button.addEventListener('click', () => {
        cart.splice(Number(button.dataset.removeItem), 1);
        saveCart();
      });
    });
  }

  function renderCheckoutSummary() {
    const summary = $('#checkout-summary');
    if (!summary) return;
    summary.innerHTML = cart.length
      ? `${cart.map(item => `<div>${item.name} — <strong>${money(item.price)}</strong></div>`).join('')}
         <div style="margin-top:8px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px"><strong>TOTAL: ${money(total())}</strong></div>`
      : 'Your cart is empty.';
  }

  $$('.service-add').forEach((button) => {
    button.addEventListener('click', () => {
      cart.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: button.dataset.service,
        price: Number(button.dataset.price)
      });
      saveCart();
      openModal('cart-modal');
    });
  });

  $('#floating-cart')?.addEventListener('click', () => openModal('cart-modal'));

  $('#cart-checkout')?.addEventListener('click', () => {
    if (!cart.length) return;
    renderCheckoutSummary();
    closeModal($('#cart-modal'));
    openModal('checkout-modal');
  });

  $$('.hakyhm-modal [data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => closeModal(el.closest('.hakyhm-modal')));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const modal = document.querySelector('.hakyhm-modal.is-open');
      if (modal) closeModal(modal);
    }
  });

  // Stripe is the live processor. Stripe Checkout can present Apple Pay,
  // Google Pay, Link and card options when eligible for the customer.
  $$('[data-payment]').forEach((button) => {
    button.addEventListener('click', () => {
      const url = cart.length === 1 ? cart[0].checkout : '';
      if (url) {
        window.location.href = url;
        return;
      }
      if (cart.length > 1) {
        alert('Please check out one service at a time. Each HAKYHM service has its own secure Stripe checkout.');
      } else {
        alert('Your Stripe checkout is not connected yet.');
      }
    });
  });

  $$('[data-open-account]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.hakyhm-modal.is-open').forEach(closeModal);
      const form = $('#account-form');
      const status = $('#account-status');
      if (status) status.textContent = '';
      if (form) {
        try {
          const saved = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null');
          if (saved) {
            form.elements.name.value = saved.name || '';
            form.elements.email.value = saved.email || '';
            form.elements.updates.checked = saved.updates !== false;
          }
        } catch (_) {}
      }
      openModal('account-modal');
    });
  });

  $('#account-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Front-end demo persistence only. A real account/news mailing list
    // should be connected to your secure backend/email provider.
    const account = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      updates: data.get('updates') === 'on'
    };

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    const status = $('#account-status');
    if (status) {
      status.textContent = `Thanks, ${account.name || 'there'} — your HAKYHM account preferences are saved on this device.`;
    }
    form.reset();
    form.elements.updates.checked = true;
  });

  renderCart();
});
