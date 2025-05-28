// signup.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const errorBox = document.getElementById('signup-error');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (data.password !== data.confirm) {
      errorBox.textContent = 'Паролі не співпадають.';
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password
        })
      });
      const user = await res.json();
      if (!res.ok) throw new Error(user.error || 'Signup failed');

      localStorage.setItem('sessionUser', JSON.stringify(user));
      window.location.href = './index.html';
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });
});
