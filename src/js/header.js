// src/js/header.js
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.header__tabs-item');

  tabs.forEach(tab => {
    const link = tab.querySelector('.header__tabs-link');
    link.addEventListener('click', e => {
      e.preventDefault();
      // знімаємо active з усіх
      tabs.forEach(t => t.classList.remove('header__tabs-item--active'));
      // ставимо на обраний
      tab.classList.add('header__tabs-item--active');
    });
  });
});