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

    navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        // Prevent a stale/early native hash jump while the fixed mobile menu closes.
        event.preventDefault();
        closeNavigation();

        if (window.location.hash !== `#${targetId}`) {
          history.replaceState(null, '', `#${targetId}`);
        }

        // Scroll to the exact section named by the clicked menu item.
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
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

/* GALLERY: filters + fullscreen viewer */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImage = document.getElementById('gallery-lightbox-image');
  const caption = document.getElementById('gallery-lightbox-caption');
  if (!grid || !lightbox || !lightboxImage) return;

  const items = Array.from(grid.querySelectorAll('.gallery-item'));
  const filters = Array.from(document.querySelectorAll('[data-gallery-filter]'));
  let visibleItems = items.slice();
  let currentIndex = 0;
  let lastTrigger = null;

  function applyFilter(filter) {
    visibleItems = items.filter(item => filter === 'all' || (item.dataset.galleryCategory || '').split(/\s+/).includes(filter));
    items.forEach(item => {
      const show = visibleItems.includes(item);
      item.classList.toggle('is-hidden', !show);
      item.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (!show) item.tabIndex = -1;
      else item.removeAttribute('tabindex');
    });
  }

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.galleryFilter || 'all';
      filters.forEach(btn => {
        const active = btn === button;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      applyFilter(filter);
    });
  });

  function showPhoto(index) {
    if (!visibleItems.length) return;
    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentIndex];
    lightboxImage.src = item.dataset.gallerySrc;
    lightboxImage.alt = item.dataset.galleryAlt || '';
    caption.textContent = item.dataset.galleryAlt || '';
  }

  function openLightbox(item) {
    lastTrigger = item;
    const index = visibleItems.indexOf(item);
    showPhoto(index < 0 ? 0 : index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-open');
    lightbox.querySelector('.gallery-lightbox-close')?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-open');
    lightboxImage.removeAttribute('src');
    if (lastTrigger) lastTrigger.focus();
  }

  items.forEach(item => item.addEventListener('click', () => openLightbox(item)));
  lightbox.querySelector('.gallery-lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox.querySelector('.gallery-lightbox-prev')?.addEventListener('click', () => showPhoto(currentIndex - 1));
  lightbox.querySelector('.gallery-lightbox-next')?.addEventListener('click', () => showPhoto(currentIndex + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showPhoto(currentIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(currentIndex + 1);
  });

  applyFilter('all');
});

/* HAKYHM floating music player (30-second previews from Apple Music) */
(() => {
  const ARTIST_ID = '1599546425';

  // Same releases hidden from the Music section in script.js
  const EXCLUDED = [
    'second chance', '2nd chance', 'time machine', 'cold as you',
    'better life', 'adding up', 'sum 2 prove', 'made it here'
  ];

  const norm = v => String(v || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
  const isExcluded = t => { const k = norm(t); return !!k && EXCLUDED.some(n => k.includes(norm(n))); };

  const LOOKUP = `https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=song&limit=200&country=US`;

  function parse(data) {
    const seen = new Set();
    return ((data && data.results) || [])
      .filter(x => x.wrapperType === 'track' && x.kind === 'song' && x.previewUrl)
      .filter(x => !isExcluded(x.collectionName) && !isExcluded(x.trackName))
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .filter(x => { const k = norm(x.trackName); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(x => ({
        title: x.trackName,
        album: x.collectionName,
        src: x.previewUrl,
        cover: (x.artworkUrl100 || '').replace('100x100bb', '200x200bb'),
        preview: true
      }));
  }

  // Attempt 1: script tag (same method your Music section uses)
  function viaScript() {
    return new Promise(resolve => {
      const cb = '__hakyhmPlayerCatalog';
      const s = document.createElement('script');
      let finished = false, timer;
      const done = tracks => {
        if (finished) return;
        finished = true; clearTimeout(timer); s.remove(); window[cb] = undefined;
        resolve(tracks);
      };
      timer = setTimeout(() => done([]), 8000);
      window[cb] = data => done(parse(data));
      s.src = `${LOOKUP}&callback=${cb}`;
      s.onerror = () => done([]);
      document.body.appendChild(s);
    });
  }

  // Attempt 2: normal request, in case the script tag is blocked
  async function viaFetch() {
    try {
      const r = await fetch(LOOKUP);
      return parse(await r.json());
    } catch (_) { return []; }
  }

  async function loadPreviews() {
    const first = await viaScript();
    return first.length ? first : viaFetch();
  }

  // Shown instead of hiding the player when the songs can't load
  function buildOffline() {
    const root = document.createElement('aside');
    root.className = 'hk-player hk-player-offline';
    root.setAttribute('aria-label', 'Music player');
    root.innerHTML = '<span>The player couldn’t load your songs.</span>' +
      '<a href="https://music.apple.com/us/artist/hakyhm/' + ARTIST_ID + '" target="_blank" rel="noopener noreferrer">Listen on Apple Music</a>';
    document.body.appendChild(root);
    document.body.classList.add('has-player');
  }

  function build(list) {
    const root = document.createElement('aside');
    root.className = 'hk-player';
    root.setAttribute('aria-label', 'Music player');
    root.innerHTML = `
      <button class="hk-player-toggle" type="button" aria-label="Minimize player" aria-expanded="true"><i class="fa-solid fa-chevron-down"></i></button>
      <img class="hk-player-cover" alt="" width="52" height="52">
      <div class="hk-player-meta"><strong class="hk-player-title"></strong><span class="hk-player-sub"></span></div>
      <div class="hk-player-controls">
        <button class="hk-btn hk-prev" type="button" aria-label="Previous song"><i class="fa-solid fa-backward-step"></i></button>
        <button class="hk-btn hk-play" type="button" aria-label="Play"><i class="fa-solid fa-play"></i></button>
        <button class="hk-btn hk-next" type="button" aria-label="Next song"><i class="fa-solid fa-forward-step"></i></button>
      </div>
      <input class="hk-player-seek" type="range" min="0" max="1000" value="0" aria-label="Seek">`;
    document.body.appendChild(root);
    document.body.classList.add('has-player');

    const $ = sel => root.querySelector(sel);
    const cover = $('.hk-player-cover'), title = $('.hk-player-title'), sub = $('.hk-player-sub');
    const playBtn = $('.hk-play'), seek = $('.hk-player-seek'), toggle = $('.hk-player-toggle');
    const audio = new Audio();
    audio.preload = 'none';
    let i = 0, errors = 0, dragging = false;

    function load(n, autoplay) {
      i = (n + list.length) % list.length;
      const t = list[i];
      audio.src = t.src;
      cover.src = t.cover || '';
      cover.style.visibility = t.cover ? 'visible' : 'hidden';
      title.textContent = t.title;
      sub.textContent = t.preview ? '30-second preview' : (t.album || '');
      seek.value = 0;
      seek.style.setProperty('--p', '0%');
      if ('mediaSession' in navigator && window.MediaMetadata) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: t.title, artist: 'HAKYHM', album: t.album || '',
          artwork: t.cover ? [{ src: t.cover }] : []
        });
      }
      if (autoplay) audio.play().catch(() => {});
    }

    const syncIcon = () => {
      const playing = !audio.paused;
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      playBtn.firstElementChild.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    };

    playBtn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
    $('.hk-prev').addEventListener('click', () => load(i - 1, true));
    $('.hk-next').addEventListener('click', () => load(i + 1, true));

    toggle.addEventListener('click', () => {
      const min = root.classList.toggle('is-min');
      toggle.setAttribute('aria-expanded', String(!min));
      toggle.setAttribute('aria-label', min ? 'Expand player' : 'Minimize player');
    });

    audio.addEventListener('play', syncIcon);
    audio.addEventListener('pause', syncIcon);
    audio.addEventListener('playing', () => { errors = 0; });
    audio.addEventListener('ended', () => load(i + 1, true));
    audio.addEventListener('error', () => {
      if (++errors < list.length) load(i + 1, true); // skip a broken track
    });
    audio.addEventListener('timeupdate', () => {
      if (dragging || !isFinite(audio.duration) || !audio.duration) return;
      const p = audio.currentTime / audio.duration;
      seek.value = Math.round(p * 1000);
      seek.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    });
    seek.addEventListener('input', () => {
      dragging = true;
      seek.style.setProperty('--p', (seek.value / 10) + '%');
    });
    seek.addEventListener('change', () => {
      if (isFinite(audio.duration)) audio.currentTime = (seek.value / 1000) * audio.duration;
      dragging = false;
    });

    // Music pauses when a video on the page starts (EPK live performances)
    document.addEventListener('play', e => { if (e.target.tagName === 'VIDEO') audio.pause(); }, true);

    if ('mediaSession' in navigator) {
      const h = (a, fn) => { try { navigator.mediaSession.setActionHandler(a, fn); } catch (_) {} };
      h('play', () => audio.play());
      h('pause', () => audio.pause());
      h('previoustrack', () => load(i - 1, true));
      h('nexttrack', () => load(i + 1, true));
    }

    load(0, false);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const list = await loadPreviews();
    if (list.length) build(list);
    else buildOffline();
  });
})();
