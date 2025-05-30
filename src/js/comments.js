// src/js/comments.js
import { escapeHtml, relativeTime } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Клік по кнопці “Comments” у будь-якому пості
  document.body.addEventListener('click', async e => {
    if (!e.target.matches('.post-card__comments')) return;
    e.preventDefault();

    const postCard = e.target.closest('.post-card');
    const postId   = postCard.dataset.postId;
    let commentsEl = postCard.querySelector('.comments');

    // Якщо секція вже відкрита — закриваємо тумбочку
    if (commentsEl) {
      commentsEl.remove();
      return;
    }

    // Інакше — створюємо нову секцію та підвантажуємо коменти
    commentsEl = document.createElement('section');
    commentsEl.className = 'comments';
    commentsEl.innerHTML = `
      <h3 class="comments__title">Comments</h3>
      <ul class="comments__list"></ul>
      <form class="comments__form">
        <textarea
          class="comments__textarea"
          placeholder="Add a comment…"
          rows="3"
          required
        ></textarea>
        <button type="submit" class="comments__submit">Comment</button>
      </form>
    `;
    postCard.append(commentsEl);

    const listEl = commentsEl.querySelector('.comments__list');
    const formEl = commentsEl.querySelector('.comments__form');

    await loadComments(postId, listEl);
    attachFormHandler(postId, formEl, listEl);
  });
});

// Завантажуємо і рендеримо всі коментарі для postId
async function loadComments(postId, listEl) {
  listEl.innerHTML = '';
  try {
    const res = await fetch(`/api/comments?post_id=${postId}`);
    const comments = await res.json();
    const tree = buildTree(comments);
    renderTree(tree, listEl);
  } catch (err) {
    console.error('loadComments error:', err);
  }
}

// Будуємо дерево коментарів за parent_id
function buildTree(comments) {
  const map = {};
  comments.forEach(c => { c.children = []; map[c.id] = c; });
  const roots = [];
  comments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

// Рендеримо коментарі у <ul>
function renderTree(nodes, container, nested = false) {
  nodes.forEach(c => {
    const li = document.createElement('li');
    li.className = 'comment' + (nested ? ' comment--nested' : '');
    li.dataset.commentId = c.id;
    li.innerHTML = `
      <div class="comment__votes">
        <button class="comment__vote-up">▲</button>
        <span class="comment__vote-diff">${c.upvotes - c.downvotes}</span>
        <button class="comment__vote-down">▼</button>
      </div>
      <div class="comment__content">
        <div class="comment__info">
          ${escapeHtml(c.username)} • ${relativeTime(c.created_at)}
        </div>
        <p class="comment__body">${escapeHtml(c.body)}</p>
        <div class="comment__actions">
          <button class="comment__reply">Reply</button>
        </div>
      </div>
    `;
    container.append(li);

    if (c.children.length) {
      renderTree(c.children, container, true);
    }

    attachCommentHandlers(li, c.id, container);
  });
}

// “Add a comment…”
function attachFormHandler(postId, formEl, listEl) {
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const body = formEl.querySelector('textarea').value.trim();
    if (!body) return;

    const user = JSON.parse(localStorage.getItem('sessionUser') || 'null');
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id:   postId,
          parent_id: null,
          user_id:   user.id,
          body
        })
      });
      const newComment = await res.json();
      if (!res.ok) throw new Error(newComment.error || 'Cannot post comment');

      formEl.reset();
      await loadComments(postId, listEl);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
}

// Прикріпка голосування та Reply для кожного чела
function attachCommentHandlers(liEl, commentId, listEl) {
  const upBtn    = liEl.querySelector('.comment__vote-up');
  const downBtn  = liEl.querySelector('.comment__vote-down');
  const replyBtn = liEl.querySelector('.comment__reply');
  const postId   = liEl.closest('.post-card').dataset.postId;

  upBtn.addEventListener('click', () => voteComment(commentId,  1, postId, listEl));
  downBtn.addEventListener('click', () => voteComment(commentId, -1, postId, listEl));

  replyBtn.addEventListener('click', () => {
    if (liEl.querySelector('.comments__form')) return;

    const replyForm = document.createElement('form');
    replyForm.className = 'comments__form';
    replyForm.innerHTML = `
      <textarea class="comments__textarea" rows="2" required></textarea>
      <button type="submit" class="comments__submit">Reply</button>
    `;
    liEl.append(replyForm);

    replyForm.addEventListener('submit', async e => {
      e.preventDefault();
      const body = replyForm.querySelector('textarea').value.trim();
      const user = JSON.parse(localStorage.getItem('sessionUser') || 'null');
      if (!user) {
        alert('Please sign in to reply');
        return;
      }
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_id:   postId,
            parent_id: commentId,
            user_id:   user.id,
            body
          })
        });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error || 'Cannot reply');
        await loadComments(postId, listEl);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  });
}

// Голосувалка за коментар
async function voteComment(commentId, vote, postId, listEl) {
  const user = JSON.parse(localStorage.getItem('sessionUser') || 'null');
  if (!user) {
    alert('Please sign in to vote');
    return;
  }

  try {
    const res = await fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, vote })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to vote');

    // Перезавантаження коментарів
    await loadComments(postId, listEl);
  } catch (err) {
    console.error(err);
    alert(err.message || 'Failed to vote');
  }
}