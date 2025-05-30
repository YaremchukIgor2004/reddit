// src/js/header.js
import { showView } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.header__tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const view = tab.dataset.view;

      tabs.forEach(t => t.classList.remove('header__tab--active'));
      tab.classList.add('header__tab--active');

      showView(view);
    });
  });

  const initial = document.querySelector('.header__tab--active');
  if (initial) showView(initial.dataset.view);
});