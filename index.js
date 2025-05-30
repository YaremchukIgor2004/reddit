import"./assets/styles-DO4INUUM.js";function u(e){document.querySelectorAll(".view").forEach(t=>{t.classList.toggle("view--active",t.id===`view-${e}`)})}document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelectorAll(".sidebar__nav-item[data-view]");e.forEach(c=>{const i=c.dataset.view;c.addEventListener("click",d=>{d.preventDefault(),e.forEach(p=>p.classList.remove("sidebar__nav-item--active")),c.classList.add("sidebar__nav-item--active"),u(i)})});const t=document.querySelector(".sidebar__user-name"),s=JSON.parse(localStorage.getItem("sessionUser")||"null");t.textContent=(s==null?void 0:s.username)||"Guest";const o=document.querySelector(".sidebar__user"),n=o.querySelector(".sidebar__user-toggle"),r=o.querySelector(".sidebar__user-menu"),a=r.querySelector(".sidebar__user-logout");s||(a.style.display="none"),a.addEventListener("click",c=>{c.preventDefault(),localStorage.removeItem("sessionUser"),window.location.reload()}),n.addEventListener("click",c=>{c.stopPropagation(),r.classList.toggle("visible")}),document.addEventListener("click",()=>{r.classList.remove("visible")}),r.addEventListener("click",c=>c.stopPropagation()),u("home")});document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelectorAll(".header__tab");e.forEach(s=>{s.addEventListener("click",o=>{o.preventDefault();const n=s.dataset.view;e.forEach(r=>r.classList.remove("header__tab--active")),s.classList.add("header__tab--active"),u(n)})});const t=document.querySelector(".header__tab--active");t&&u(t.dataset.view)});function h(e){const t=Date.now()-new Date(e).getTime(),s=Math.floor(t/1e3);if(s<60)return`${s}s ago`;const o=Math.floor(s/60);if(o<60)return`${o}m ago`;const n=Math.floor(o/60);return n<24?`${n}h ago`:`${Math.floor(n/24)}d ago`}function m(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}document.addEventListener("DOMContentLoaded",()=>{S()});async function S(){const e=document.getElementById("posts-list");if(e){e.innerHTML="";try{(await(await fetch("/api/posts?view=all")).json()).forEach(o=>e.append(L(o)))}catch(t){console.error(t),e.innerHTML="<p>Не вдалося завантажити пости.</p>"}}}function L(e){const t=document.createElement("article");t.className="post-card",t.dataset.postId=e.id,t.innerHTML=`
    <div class="post-card__media">
      ${e.image_url?`<img src="${e.image_url}" alt="">`:""}
    </div>
    <div class="post-card__body">
      <h2 class="post-card__title">${m(e.title)}</h2>
      <p class="post-card__info">
        ${h(e.created_at)} by ${m(e.username)}
      </p>
      ${e.body?`<p class="post-card__text">${m(e.body)}</p>`:""}
    </div>
    <div class="post-card__footer">
      <div class="post-card__votes">
        <button class="post-card__vote-up">▲</button>
        <span class="post-card__vote-diff">${e.vote_diff??0}</span>
        <button class="post-card__vote-down">▼</button>
      </div>
      <button class="post-card__comments">💬 ${e.comment_count??0}</button>
    </div>
  `;const s=t.querySelector(".post-card__vote-up"),o=t.querySelector(".post-card__vote-down"),n=t.querySelector(".post-card__vote-diff");return s.addEventListener("click",()=>y(e.id,1,s,o,n)),o.addEventListener("click",()=>y(e.id,-1,o,s,n)),t}async function y(e,t,s,o,n){const r=JSON.parse(localStorage.getItem("sessionUser")||"null");if(!r)return alert("Увійдіть, будь ласка.");try{const a=await fetch(`/api/posts/${e}/vote`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:r.id,vote:t})}),c=await a.json();if(!a.ok)throw new Error(c.error||"Failed to vote");let i;if(typeof c.vote_diff=="number")i=c.vote_diff;else{const d=parseInt(n.textContent)||0;i=s.classList.contains("active")?d-t:d+t}n.textContent=i,s.classList.contains("active")?s.classList.remove("active"):(s.classList.add("active"),o.classList.remove("active"))}catch(a){console.error(a),alert(a.message)}}document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("create-post-form"),t=document.getElementById("myposts-list");E(),e.addEventListener("submit",async s=>{s.preventDefault();const o=JSON.parse(localStorage.getItem("sessionUser")||"null");if(!o)return alert("Будь ласка, увійдіть, щоб створювати пости.");const n=Object.fromEntries(new FormData(e));n.user_id=o.id;try{const r=await fetch("/api/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),a=await r.json();if(!r.ok)throw new Error(a.error||"Не вдалося створити пост");const c=f(a);t.prepend(c),e.reset();const i=document.querySelector("#view-home .posts");i&&i.prepend(f(a)),document.querySelectorAll(".sidebar__nav-item").forEach(d=>d.classList.toggle("sidebar__nav-item--active",d.dataset.view==="myposts")),u("myposts")}catch(r){alert(r.message)}})});async function E(){const e=document.getElementById("myposts-list");e.innerHTML="";const t=JSON.parse(localStorage.getItem("sessionUser")||"null");if(!t){e.innerHTML="<p>Будь ласка, увійдіть, щоб побачити свої пости.</p>";return}try{(await(await fetch(`/api/posts?view=user&user_id=${encodeURIComponent(t.id)}`)).json()).forEach(n=>{e.append(f(n))})}catch(s){console.error("Failed to load my posts:",s),e.innerHTML="<p>Не вдалося завантажити ваші пости.</p>"}}function f(e){const t=document.createElement("article");return t.className="post-card",t.dataset.postId=e.id,t.innerHTML=`
    <div class="post-card__media">
      ${e.image_url?`<img src="${e.image_url}" alt="">`:""}
    </div>
    <div class="post-card__body">
      <h2 class="post-card__title">${v(e.title)}</h2>
      <p class="post-card__info">
        ${$(e.created_at)} by ${v(e.username)}
      </p>
      ${e.body?`<p class="post-card__text">${v(e.body)}</p>`:""}
    </div>
    <div class="post-card__footer">
      <div class="post-card__votes">
        <button class="post-card__vote-up">▲</button>
        <span class="post-card__vote-diff">${e.vote_diff??0}</span>
        <button class="post-card__vote-down">▼</button>
      </div>
      <button class="post-card__comments">💬 ${e.comment_count??0}</button>
    </div>
  `,t}function $(e){const t=Date.now()-new Date(e).getTime(),s=Math.floor(t/1e3);if(s<60)return`${s}s ago`;const o=Math.floor(s/60);if(o<60)return`${o}m ago`;const n=Math.floor(o/60);return n<24?`${n}h ago`:`${Math.floor(n/24)}d ago`}function v(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}document.addEventListener("DOMContentLoaded",()=>{document.body.addEventListener("click",async e=>{if(!e.target.matches(".post-card__comments"))return;e.preventDefault();const t=e.target.closest(".post-card"),s=t.dataset.postId;let o=t.querySelector(".comments");if(o){o.remove();return}o=document.createElement("section"),o.className="comments",o.innerHTML=`
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
    `,t.append(o);const n=o.querySelector(".comments__list"),r=o.querySelector(".comments__form");await _(s,n),T(s,r,n)})});async function _(e,t){t.innerHTML="";try{const o=await(await fetch(`/api/comments?post_id=${e}`)).json(),n=q(o);b(n,t)}catch(s){console.error("loadComments error:",s)}}function q(e){const t={};e.forEach(o=>{o.children=[],t[o.id]=o});const s=[];return e.forEach(o=>{o.parent_id&&t[o.parent_id]?t[o.parent_id].children.push(o):s.push(o)}),s}function b(e,t,s=!1){e.forEach(o=>{const n=document.createElement("li");n.className="comment"+(s?" comment--nested":""),n.dataset.commentId=o.id,n.innerHTML=`
      <div class="comment__votes">
        <button class="comment__vote-up">▲</button>
        <span class="comment__vote-diff">${o.upvotes-o.downvotes}</span>
        <button class="comment__vote-down">▼</button>
      </div>
      <div class="comment__content">
        <div class="comment__info">
          ${m(o.username)} • ${h(o.created_at)}
        </div>
        <p class="comment__body">${m(o.body)}</p>
        <div class="comment__actions">
          <button class="comment__reply">Reply</button>
        </div>
      </div>
    `,t.append(n),o.children.length&&b(o.children,t,!0),C(n,o.id,t)})}function T(e,t,s){t.addEventListener("submit",async o=>{o.preventDefault();const n=t.querySelector("textarea").value.trim();if(!n)return;const r=JSON.parse(localStorage.getItem("sessionUser")||"null");if(!r){alert("Please sign in to comment");return}try{const a=await fetch("/api/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({post_id:e,parent_id:null,user_id:r.id,body:n})}),c=await a.json();if(!a.ok)throw new Error(c.error||"Cannot post comment");t.reset(),await _(e,s)}catch(a){console.error(a),alert(a.message)}})}function C(e,t,s){const o=e.querySelector(".comment__vote-up"),n=e.querySelector(".comment__vote-down"),r=e.querySelector(".comment__reply"),a=e.closest(".post-card").dataset.postId;o.addEventListener("click",()=>g(t,1,a,s)),n.addEventListener("click",()=>g(t,-1,a,s)),r.addEventListener("click",()=>{if(e.querySelector(".comments__form"))return;const c=document.createElement("form");c.className="comments__form",c.innerHTML=`
      <textarea class="comments__textarea" rows="2" required></textarea>
      <button type="submit" class="comments__submit">Reply</button>
    `,e.append(c),c.addEventListener("submit",async i=>{i.preventDefault();const d=c.querySelector("textarea").value.trim(),p=JSON.parse(localStorage.getItem("sessionUser")||"null");if(!p){alert("Please sign in to reply");return}try{const l=await fetch("/api/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({post_id:a,parent_id:t,user_id:p.id,body:d})}),w=await l.json();if(!l.ok)throw new Error(w.error||"Cannot reply");await _(a,s)}catch(l){console.error(l),alert(l.message)}})})}async function g(e,t,s,o){const n=JSON.parse(localStorage.getItem("sessionUser")||"null");if(!n){alert("Please sign in to vote");return}try{const r=await fetch(`/api/comments/${e}/vote`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:n.id,vote:t})}),a=await r.json();if(!r.ok)throw new Error(a.error||"Failed to vote");await _(s,o)}catch(r){console.error(r),alert(r.message||"Failed to vote")}}
//# sourceMappingURL=index.js.map
