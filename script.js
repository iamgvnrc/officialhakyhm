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

  )();
