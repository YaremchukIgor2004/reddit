// src/js/router.js

/**
 * .view ховаємо,
 * container/main залишаємо view--active.
 */
export function showView(name) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('view--active', v.id === `view-${name}`);
  });
}