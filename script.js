document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menu = document.querySelector('.menu-button');
  const links = document.querySelector('.nav-links');
  const shareButton = document.querySelector('.mobile-share');

  function closeMenu() {
    if (!menu || !links) return;
    links.classList.remove('mobile-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
    const icon = menu.querySelector('i');
    if (icon) {
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-xmark');
    }
    document.body.classList.remove('menu-is-open');
  }

  if (menu && links) {
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('mobile-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      const icon = menu.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-xmark', open);
      }
      document.body.classList.toggle('menu-is-open', open);
    });

    links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      const data = {
        title: 'HAKYHM — Official Website',
        text: 'Check out HAKYHM.',
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          shareButton.classList.add('shared');
          setTimeout(() => shareButton.classList.remove('shared'), 1200);
        }
      } catch (_) {}
    });
  }

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
