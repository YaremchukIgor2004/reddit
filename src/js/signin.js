// Обробка Sign In форми
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signin-form');
  const errorBox = document.getElementById('signin-error');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const email = data.get('email').trim();
    const pass = data.get('password');

    // Перевіряємо, чи є зареєстрований користувач
    const stored = localStorage.getItem('user');
    if (!stored) {
      errorBox.textContent = 'No account found. Please sign up.';
      return;
    }
    const user = JSON.parse(stored);

    // Порівнюємо дані
    if (user.email !== email || user.password !== pass) {
      errorBox.textContent = 'Invalid email or password.';
      return;
    }

    // Створюємо сесію та переходимо на головну
    localStorage.setItem('session', JSON.stringify(user));
    window.location.href = './index.html';
  });
});
