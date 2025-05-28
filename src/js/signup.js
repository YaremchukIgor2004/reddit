// Обробка Sign Up форми
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const errorBox = document.getElementById('signup-error');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const username = data.get('username').trim();
    const email = data.get('email').trim();
    const pass = data.get('password');
    const conf = data.get('confirm');

    // Валідація
    if (!username || !email || !pass) {
      errorBox.textContent = 'Please fill in all fields.';
      return;
    }
    if (pass !== conf) {
      errorBox.textContent = 'Passwords do not match.';
      return;
    }

    // Зберігаємо користувача й сесію
    const user = { username, email, password: pass };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('session', JSON.stringify(user));

    // Переходимо на головну
    window.location.href = './index.html';
  });
});