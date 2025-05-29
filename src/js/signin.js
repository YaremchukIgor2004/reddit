// signin.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signin-form');
  const errorBox = document.getElementById('signin-error');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Невірний email або пароль.');

      localStorage.setItem('sessionUser', JSON.stringify(user));
      window.location.href = './index.html';
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });
});