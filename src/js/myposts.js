// src/js/myposts.js
import { showView } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-post-form');
  const list = document.getElementById('myposts-list');

  loadMyPosts();

  // Handle form submission
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Ensure user is signed in
    const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || 'null');
    if (!sessionUser) {
      return alert('Будь ласка, увійдіть, щоб створювати пости.');
    }

    // Collect form data and add user_id
    const data = Object.fromEntries(new FormData(form));
    data.user_id = sessionUser.id;

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const post = await res.json();
      if (!res.ok) throw new Error(post.error || 'Не вдалося створити пост');

      // Render the new post at the top of my posts
      const card = createPostElement(post);
      list.prepend(card);

      form.reset();

      // Also add it to Home view if that container exists
      const homeContainer = document.querySelector('#view-home .posts');
      if (homeContainer) {
        homeContainer.prepend(createPostElement(post));
      }

      // Switch to My Posts view
      document
        .querySelectorAll('.sidebar__nav-item')
        .forEach(i =>
          i.classList.toggle('sidebar__nav-item--active', i.dataset.view === 'myposts')
        );
      showView('myposts');
    } catch (err) {
      alert(err.message);
    }
  });
});

async function loadMyPosts() {
  const list = document.getElementById('myposts-list');
  list.innerHTML = '';

  const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || 'null');
  if (!sessionUser) {
    list.innerHTML = '<p>Будь ласка, увійдіть, щоб побачити свої пости.</p>';
    return;
  }

  try {
    const res = await fetch(
      `/api/posts?view=user&user_id=${encodeURIComponent(sessionUser.id)}`
    );
    const posts = await res.json();
    posts.forEach(post => {
      list.append(createPostElement(post));
    });
  } catch (err) {
    console.error('Failed to load my posts:', err);
    list.innerHTML = '<p>Не вдалося завантажити ваші пости.</p>';
  }
}

function createPostElement(post) {
  const article = document.createElement('article');
  article.className = 'post-card';
  article.dataset.postId = post.id;

  article.innerHTML = `
    <div class="post-card__media">
      ${post.image_url ? `<img src="${post.image_url}" alt="">` : ''}
    </div>
    <div class="post-card__body">
      <h2 class="post-card__title">${escapeHtml(post.title)}</h2>
      <p class="post-card__info">
        ${relativeTime(post.created_at)} by ${escapeHtml(post.username)}
      </p>
      ${post.body ? `<p class="post-card__text">${escapeHtml(post.body)}</p>` : ''}
    </div>
    <div class="post-card__footer">
      <div class="post-card__votes">
        <button class="post-card__vote-up">▲</button>
        <span class="post-card__vote-diff">${post.vote_diff ?? 0}</span>
        <button class="post-card__vote-down">▼</button>
      </div>
      <button class="post-card__comments">💬 ${post.comment_count ?? 0}</button>
    </div>
  `;
  return article;
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
