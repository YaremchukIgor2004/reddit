// src/js/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  // — NAVIGATION ITEMS (Home, Notifications, My posts, My subreddits) —
  const navItems = document.querySelectorAll('.sidebar__nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.sidebar__nav-link');
    link.addEventListener('click', e => {
      e.preventDefault();
      const isDropdown = item.classList.contains('sidebar__nav-dropdown');

      // Скидаємо active зі всіх пунктів
      navItems.forEach(i => i.classList.remove('sidebar__nav-item--active'));

      if (isDropdown) {
        // Тільки для My subreddits — переключаємо active
        item.classList.toggle('sidebar__nav-item--active');
      } else {
        // Для інших пунктів — ставимо active
        item.classList.add('sidebar__nav-item--active');
      }
    });
  });

  // — DISPLAY USERNAME IN ASIDE —
  const userNameSpan = document.querySelector('.sidebar__user-name');
  const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || 'null');
  if (sessionUser && sessionUser.username) {
    userNameSpan.textContent = sessionUser.username;
  } else {
    userNameSpan.textContent = 'Guest';
  }

  // — USER MENU (Sign In / Sign Up / Log Out) —
  const userBlock = document.querySelector('.sidebar__user');
  const toggleBtn = userBlock.querySelector('.sidebar__user-toggle');
  const menu = userBlock.querySelector('.sidebar__user-menu');
  const logoutBtn = menu.querySelector('.sidebar__user-logout');

  // Якщо користувач не залогінений — ховаємо Log Out
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

  // Клік поза меню — ховаємо його
  document.addEventListener('click', () => {
    menu.classList.remove('visible');
  });

  // Клік всередині меню не закриває його
  menu.addEventListener('click', e => e.stopPropagation());
});
