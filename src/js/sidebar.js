// src/js/sidebar.js
import { showView } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.sidebar__nav-item[data-view]');
  navItems.forEach(item => {
    const view = item.dataset.view;
    item.addEventListener('click', e => {
      e.preventDefault();

      // Скидаємо active з усіх пунктів
      navItems.forEach(i => i.classList.remove('sidebar__nav-item--active'));
      item.classList.add('sidebar__nav-item--active');
      showView(view);
    });
  });

  // — DISPLAY USERNAME —
  const userNameSpan = document.querySelector('.sidebar__user-name');
  const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || 'null');
  userNameSpan.textContent = sessionUser?.username || 'Guest';

  // — USER MENU —
  const userBlock = document.querySelector('.sidebar__user');
  const toggleBtn = userBlock.querySelector('.sidebar__user-toggle');
  const menu = userBlock.querySelector('.sidebar__user-menu');
  const logoutBtn = menu.querySelector('.sidebar__user-logout');

  if (!sessionUser) {
    logoutBtn.style.display = 'none';
  }

  // Логіка Log Out
  logoutBtn.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('sessionUser');
    window.location.reload();
  });

  // Відкриття/закриття меню
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('visible');
  });
  document.addEventListener('click', () => {
    menu.classList.remove('visible');
  });
  menu.addEventListener('click', e => e.stopPropagation());

  showView('home');
});
