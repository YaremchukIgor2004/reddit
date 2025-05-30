// src/js/posts.js
import { escapeHtml, relativeTime } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
});

export async function loadPosts() {
  const list = document.getElementById('posts-list');
  if (!list) return;
  list.innerHTML = '';
  try {
    const res = await fetch('/api/posts?view=all');
    const posts = await res.json();
    posts.forEach(post => list.append(createPostElement(post)));
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p>Не вдалося завантажити пости.</p>';
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

  const upBtn   = article.querySelector('.post-card__vote-up');
  const downBtn = article.querySelector('.post-card__vote-down');
  const diffEl  = article.querySelector('.post-card__vote-diff');

  upBtn.addEventListener('click', () => votePost(post.id,  1, upBtn, downBtn, diffEl));
  downBtn.addEventListener('click', () => votePost(post.id, -1, downBtn, upBtn, diffEl));

  return article;
}

async function votePost(postId, vote, thisBtn, otherBtn, diffEl) {
  const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || 'null');
  if (!sessionUser) {
    return alert('Увійдіть, будь ласка.');
  }

  try {
    const res = await fetch(`/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: sessionUser.id, vote })
    });
    // єдиний виклик res.json()
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to vote');
    }

    // якщо бекенд повернув vote_diff, використовуємо його,
    // інакше робимо local-fallback (old + vote)
    let newDiff;
    if (typeof data.vote_diff === 'number') {
      newDiff = data.vote_diff;
    } else {
      const old = parseInt(diffEl.textContent) || 0;
      // якщо ми вже були «active», то треба відняти саме цей голос
      newDiff = thisBtn.classList.contains('active') ? old - vote : old + vote;
    }

    diffEl.textContent = newDiff;

    if (thisBtn.classList.contains('active')) {
      thisBtn.classList.remove('active');
    } else {
      thisBtn.classList.add('active');
      otherBtn.classList.remove('active');
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}