/* HAKYHM floating music player
   - Leave LOCAL_TRACKS empty: plays 30-second previews of your Apple Music catalog (no files needed).
   - Add entries to LOCAL_TRACKS: plays your full MP3s instead. */
(() => {
  const ARTIST_ID = '1599546425';

  const LOCAL_TRACKS = [
    // { title: 'Song name', album: 'Album name', src: 'music/song-name.mp3', cover: 'images/cover.jpg' },
  ];

  // Same releases hidden from the Music section in script.js
  const EXCLUDED = [
    'second chance', '2nd chance', 'time machine', 'cold as you',
    'better life', 'adding up', 'sum 2 prove', 'made it here'
  ];

  const norm = v => String(v || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
  const isExcluded = t => { const k = norm(t); return !!k && EXCLUDED.some(n => k.includes(norm(n))); };

  function loadPreviews() {
    return new Promise(resolve => {
      const cb = '__hakyhmPlayerCatalog';
      const s = document.createElement('script');
      const done = tracks => { s.remove(); window[cb] = undefined; resolve(tracks); };
      window[cb] = data => {
        const seen = new Set();
        done(((data && data.results) || [])
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
          })));
      };
      s.src = `https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=song&limit=200&country=US&callback=${cb}`;
      s.onerror = () => done([]);
      document.body.appendChild(s);
    });
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
    const list = LOCAL_TRACKS.length ? LOCAL_TRACKS : await loadPreviews();
    if (list.length) build(list);
  });
})();
