(function () {
  const app = document.getElementById('app');
  const cfg = window.HAKYHM_SUPABASE || {};
  if (!cfg.url || cfg.url.includes('YOUR-PROJECT')) {
    app.innerHTML = '<p class="q-err">Add your Supabase URL and key to supabase-config.js first.</p>';
    return;
  }
  const db = supabase.createClient(cfg.url, cfg.anonKey);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => /^https?:\/\//i.test(u) ? u : '#';
  let filter = 'queued';

  function loginView(msg) {
    app.innerHTML = `<form class="q-login" id="login"><h1>QUEUE LOGIN</h1>
      <input type="email" id="em" placeholder="Email" required autocomplete="username">
      <input type="password" id="pw" placeholder="Password" required autocomplete="current-password">
      <button class="q-btn red" type="submit">SIGN IN</button><div class="q-err" style="padding:0">${esc(msg || '')}</div></form>`;
    document.getElementById('login').addEventListener('submit', async e => {
      e.preventDefault();
      const { error } = await db.auth.signInWithPassword({ email: em.value, password: pw.value });
      if (error) loginView(error.message); else load();
    });
  }

  async function setStatus(id, status) {
    await db.from('submissions').update({ status }).eq('id', id);
    load();
  }
  async function remove(id) {
    if (!confirm('Delete this submission permanently?')) return;
    const { data: row } = await db.from('submissions').select('file_path').eq('id', id).single();
    if (row && row.file_path) await db.storage.from('submissions').remove([row.file_path]);
    await db.from('submissions').delete().eq('id', id);
    load();
  }

  async function load() {
    const { data: sess } = await db.auth.getSession();
    if (!sess.session) return loginView();
    const { data, error } = await db.from('submissions').select('*').order('created_at', { ascending: true });
    if (error) { app.innerHTML = `<p class="q-err">${esc(error.message)}</p>`; return; }
    await Promise.all(data.map(async r => {
      if (r.file_path) {
        const { data: s } = await db.storage.from('submissions').createSignedUrl(r.file_path, 3600);
        r.audio_url = s && s.signedUrl;
      }
    }));
    const counts = {};
    data.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
    const tabs = ['queued', 'listening', 'played', 'skipped'];
    const rows = data.filter(r => r.status === filter);
    app.innerHTML = `<div class="q-top"><h1>SUBMISSION QUEUE</h1><button class="q-btn ghost" id="out">SIGN OUT</button></div>
      <div class="q-tabs">${tabs.map(t => `<button data-t="${t}" class="${t === filter ? 'active' : ''}">${t.toUpperCase()} (${counts[t] || 0})</button>`).join('')}</div>
      ${rows.length ? rows.map(r => `<article class="q-item">
        <h3>${esc(r.artist)} &mdash; ${esc(r.title)}</h3>
        <div class="q-meta">${esc(r.genre || '')} &middot; <a href="mailto:${esc(r.email)}">${esc(r.email)}</a> &middot; ${new Date(r.created_at).toLocaleString()}<br>
          ${r.link ? `<a href="${esc(safeUrl(r.link))}" target="_blank" rel="noopener noreferrer">${esc(r.link)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}</div>
        ${r.audio_url ? `<audio controls preload="none" src="${esc(r.audio_url)}" style="width:100%"></audio><div class="q-meta"><a href="${esc(r.audio_url)}" download="${esc(r.artist + ' - ' + r.title)}.mp3">Download MP3</a></div>` : ''}
        ${r.message ? `<div class="q-msg">${esc(r.message)}</div>` : ''}
        <div class="q-actions">
          ${r.link ? `<a class="q-btn red" style="text-decoration:none" href="${esc(safeUrl(r.link))}" target="_blank" rel="noopener noreferrer">OPEN LINK</a>` : ''}
          ${r.status !== 'listening' ? `<button class="q-btn ghost" data-a="listening" data-id="${r.id}">NOW LISTENING</button>` : ''}
          ${r.status !== 'played' ? `<button class="q-btn" data-a="played" data-id="${r.id}">PLAYED</button>` : ''}
          ${r.status !== 'skipped' ? `<button class="q-btn ghost" data-a="skipped" data-id="${r.id}">SKIP</button>` : ''}
          ${r.status !== 'queued' ? `<button class="q-btn ghost" data-a="queued" data-id="${r.id}">BACK TO QUEUE</button>` : ''}
          <button class="q-btn ghost" data-a="delete" data-id="${r.id}">DELETE</button>
        </div></article>`).join('') : '<p class="q-empty">Nothing here.</p>'}`;
    document.getElementById('out').onclick = async () => { await db.auth.signOut(); loginView(); };
    app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { filter = b.dataset.t; load(); });
    app.querySelectorAll('[data-a]').forEach(b => b.onclick = () => b.dataset.a === 'delete' ? remove(b.dataset.id) : setStatus(b.dataset.id, b.dataset.a));
  }
  load();
})();
