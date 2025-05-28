// src/js/posts.js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.post-card').forEach(card => {
    const upBtn = card.querySelector('.post-card__vote-up');
    const downBtn = card.querySelector('.post-card__vote-down');
    const diffEl = card.querySelector('.post-card__vote-diff');

    // Поточний стан голосу: 1 = up, -1 = down, 0 = none
    let state = 0;
    // Початкове значення різниці (без плюсика)
    let diff = parseInt(diffEl.textContent.replace('+', ''), 10) || 0;

    const render = () => {
      // Оновлюємо число (плюса попереду нема)
      diffEl.textContent = diff.toString();
      // Візуально позначаємо активну кнопку
      upBtn.classList.toggle('active', state === 1);
      downBtn.classList.toggle('active', state === -1);
    };

    upBtn.addEventListener('click', () => {
      // Якщо вже стоїть up, приберемо голос
      const newState = state === 1 ? 0 : 1;
      // diff += (newState - oldState)
      diff += newState - state;
      state = newState;
      render();
    });

    downBtn.addEventListener('click', () => {
      const newState = state === -1 ? 0 : -1;
      diff += newState - state;
      state = newState;
      render();
    });

    render();
  });
});