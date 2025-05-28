// src/js/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  // — NAVIGATION ITEMS (Home, Notifications, My posts, My subreddits) —
  const navItems = document.querySelectorAll('.sidebar__nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.sidebar__nav-link');
    link.addEventListener('click', e => {
      e.preventDefault();
      const isDropdown = item.classList.contains('sidebar__nav-dropdown');

      // Скидаємо active з усіх
      navItems.forEach(i => i.classList.remove('sidebar__nav-item--active'));

      if (isDropdown) {
        // Toggle only My subreddits
        item.classList.toggle('sidebar__nav-item--active');
      } else {
        // Активуємо поточний пункт
        item.classList.add('sidebar__nav-item--active');
      }
    });
  });

  // — USER MENU (Sign In / Sign Up / Log Out) —
  const userBlock = document.querySelector('.sidebar__user');
  const toggleBtn = userBlock.querySelector('.sidebar__user-toggle');
  const menu = userBlock.querySelector('.sidebar__user-menu');
  const emailText = userBlock.querySelector('.sidebar__user-email').textContent.trim();

  // Якщо немає email → гість → ховаємо кнопку Log Out
  if (!emailText) {
    const logoutBtn = menu.querySelector('.sidebar__user-logout');
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  // Відкриваємо/закриваємо меню
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('visible');
  });

  // Клік поза меню → ховаємо
  document.addEventListener('click', () => {
    menu.classList.remove('visible');
  });
  // Клік всередині меню не закриває його
  menu.addEventListener('click', e => e.stopPropagation());
});
