
function getCart() {
  return JSON.parse(localStorage.getItem('cafehaven_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cafehaven_cart', JSON.stringify(cart));
}
function getFavourites() {
  return JSON.parse(localStorage.getItem('cafehaven_favs') || '[]');
}
function saveFavourites(favs) {
  localStorage.setItem('cafehaven_favs', JSON.stringify(favs));
}

function updateBadges() {
  const cart = getCart();
  const favs = getFavourites();
  const cartTotal = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = cartTotal);
  document.querySelectorAll('#fav-count').forEach(el => el.textContent = favs.length);
}

function addToCart(btn) {
  const card = btn.closest('[data-name]');
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const img = card.dataset.img;

  let cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }
  saveCart(cart);
  updateBadges();
  updateCartPanel();

  btn.classList.add('added');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Added!';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.classList.remove('added');
  }, 1200);

  openCartPanel();
}

function toggleFavourite(btn) {
  const card = btn.closest('[data-name]');
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const img = card.dataset.img;

  let favs = getFavourites();
  const idx = favs.findIndex(i => i.name === name);
  if (idx > -1) {
    favs.splice(idx, 1);
    btn.innerHTML = '<i class="far fa-heart"></i>';
    btn.classList.remove('fav-active');
  } else {
    favs.push({ name, price, img });
    btn.innerHTML = '<i class="fas fa-heart"></i>';
    btn.classList.add('fav-active');
  }
  saveFavourites(favs);
  updateBadges();
}

function syncFavButtons() {
  const favs = getFavourites();
  document.querySelectorAll('[data-name]').forEach(card => {
    const name = card.dataset.name;
    const btn = card.querySelector('.add-fav-btn');
    if (!btn) return;
    if (favs.find(i => i.name === name)) {
      btn.innerHTML = '<i class="fas fa-heart"></i>';
      btn.classList.add('fav-active');
    }
  });
}

function openCartPanel() {
  document.getElementById('cartPanel')?.classList.add('open');
  document.getElementById('panelOverlay')?.classList.add('show');
}
function toggleCartPanel() {
  const panel = document.getElementById('cartPanel');
  const overlay = document.getElementById('panelOverlay');
  if (!panel) return;
  panel.classList.toggle('open');
  overlay?.classList.toggle('show');
}
function updateCartPanel() {
  const container = document.getElementById('cartPanelItems');
  const totalEl = document.getElementById('cartPanelTotal');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    if (totalEl) totalEl.textContent = 'Rs. 0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    return `
      <div class="panel-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="panel-item-info">
          <span class="panel-item-name">${item.name}</span>
          <span class="panel-item-price">Rs. ${item.price} × ${item.qty}</span>
          <div class="panel-item-qty">
            <button onclick="changeQtyPanel('${item.name}', -1)"><i class="fas fa-minus"></i></button>
            <span>${item.qty}</span>
            <button onclick="changeQtyPanel('${item.name}', 1)"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <button class="panel-remove-btn" onclick="removeFromCartPanel('${item.name}')"><i class="fas fa-times"></i></button>
      </div>`;
  }).join('');

  if (totalEl) totalEl.textContent = 'Rs. ' + total;
}
function changeQtyPanel(name, delta) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
  saveCart(cart);
  updateBadges();
  updateCartPanel();
}
function removeFromCartPanel(name) {
  let cart = getCart().filter(i => i.name !== name);
  saveCart(cart);
  updateBadges();
  updateCartPanel();
}

function renderCartPage() {
  const container = document.getElementById('cartContent');
  const summary = document.getElementById('cartSummary');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-page-msg">Your cart is empty. <a href="menu.html" class="go-menu-link">Browse Menu</a></p>';
    if (summary) summary.style.display = 'none';
    return;
  }

  let subtotal = 0;
  container.innerHTML = `<div class="cart-page-list">` + cart.map(item => {
    subtotal += item.price * item.qty;
    return `
      <div class="cart-page-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-page-item-info">
          <h4>${item.name}</h4>
          <span>Rs. ${item.price} each</span>
        </div>
        <div class="cart-page-qty">
          <button onclick="changeQtyPage('${item.name}', -1)"><i class="fas fa-minus"></i></button>
          <span>${item.qty}</span>
          <button onclick="changeQtyPage('${item.name}', 1)"><i class="fas fa-plus"></i></button>
        </div>
        <span class="cart-item-line-total">Rs. ${item.price * item.qty}</span>
        <button class="remove-btn" onclick="removeCartPage('${item.name}')"><i class="fas fa-trash"></i></button>
      </div>`;
  }).join('') + `</div>`;

  document.getElementById('cartSubtotal').textContent = 'Rs. ' + subtotal;
  document.getElementById('cartTotal').textContent = 'Rs. ' + subtotal;
  if (summary) summary.style.display = 'block';
  updateBadges();
}
function changeQtyPage(name, delta) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
  saveCart(cart);
  renderCartPage();
}
function removeCartPage(name) {
  saveCart(getCart().filter(i => i.name !== name));
  renderCartPage();
}
function clearCart() {
  saveCart([]);
  renderCartPage();
}

function renderFavouritesPage() {
  const container = document.getElementById('favContent');
  if (!container) return;

  const favs = getFavourites();
  if (favs.length === 0) {
    container.innerHTML = '<p class="empty-page-msg">No favourites yet. <a href="menu.html" class="go-menu-link">Browse Menu</a></p>';
    return;
  }

  container.innerHTML = `<div class="fav-page-grid">` + favs.map(item => `
    <div class="fav-page-card">
      <img src="${item.img}" alt="${item.name}">
      <div class="fav-page-info">
        <h4>${item.name}</h4>
        <span class="price">Rs. ${item.price}</span>
      </div>
      <div class="fav-page-actions">
        <button class="add-cart-btn" onclick="addFavToCart('${item.name}', ${item.price}, '${item.img}')"><i class="fas fa-cart-plus"></i> Add to Cart</button>
        <button class="remove-fav-btn" onclick="removeFavPage('${item.name}')"><i class="fas fa-heart-broken"></i> Remove</button>
      </div>
    </div>`).join('') + `</div>`;
  updateBadges();
}
function removeFavPage(name) {
  saveFavourites(getFavourites().filter(i => i.name !== name));
  renderFavouritesPage();
  updateBadges();
}
function addFavToCart(name, price, img) {
  let cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else cart.push({ name, price, img, qty: 1 });
  saveCart(cart);
  updateBadges();
  alert(name + ' added to cart!');
}

function renderCheckoutPage() {
  const container = document.getElementById('checkoutItems');
  if (!container) return;

  const cart = getCart();
  let subtotal = 0;
  if (cart.length === 0) {
    container.innerHTML = '<p style="color:#888;">No items in cart.</p>';
  } else {
    container.innerHTML = cart.map(item => {
      subtotal += item.price * item.qty;
      return `<div class="checkout-item">
        <img src="${item.img}" alt="${item.name}">
        <span>${item.name} × ${item.qty}</span>
        <span>Rs. ${item.price * item.qty}</span>
      </div>`;
    }).join('');
  }
  document.getElementById('chkSubtotal').textContent = 'Rs. ' + subtotal;
  document.getElementById('chkTotal').textContent = 'Rs. ' + (subtotal + 150);
  updateBadges();

  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      const cf = document.getElementById('cardFields');
      if (cf) cf.style.display = r.value === 'card' ? 'block' : 'none';
    });
  });
}

function placeOrder() {
  const name = document.getElementById('chkName')?.value.trim();
  const email = document.getElementById('chkEmail')?.value.trim();
  const phone = document.getElementById('chkPhone')?.value.trim();
  const address = document.getElementById('chkAddress')?.value.trim();
  if (!name || !email || !phone || !address) {
    alert('Please fill in all required fields.');
    return;
  }
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  saveCart([]);
  updateBadges();
  document.getElementById('orderModal').classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  syncFavButtons();
  updateCartPanel();
});

function initSearch() {
  const searchBox = document.querySelector('.search-box');
  if (!searchBox) return;

  searchBox.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const allCards = document.querySelectorAll('[data-name]');
    let anyVisible = false;

    allCards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const match = name.includes(query) || desc.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    document.querySelectorAll('.search-no-result').forEach(el => el.remove());

    if (!anyVisible && query !== '') {
      const sections = document.querySelectorAll('.menu-grid, .food-grid, .products-grid');
      const target = sections[0]?.parentElement || document.querySelector('.menu-section') || document.body;
      const msg = document.createElement('p');
      msg.className = 'search-no-result';
      msg.textContent = '😔 No results found for "' + query + '"';
      target.appendChild(msg);
    }
  });
}

function openQuickView(name, price, img, desc) {
  document.getElementById('qv-img').src = img;
  document.getElementById('qv-name').textContent = name;
  document.getElementById('qv-price').textContent = 'Rs. ' + price;
  document.getElementById('qv-desc').textContent = desc;
  document.getElementById('qv-add-btn').onclick = function () {
   
    let cart = getCart();
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ name, price: parseInt(price), img, qty: 1 });
    saveCart(cart);
    updateBadges();
    updateCartPanel();
    openCartPanel();
    this.innerHTML = '<i class="fas fa-check"></i> Added!';
    this.style.background = 'linear-gradient(135deg,#2e7d32,#43a047)';
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
      this.style.background = '';
      closeQuickView();
    }, 1200);
  };
  document.getElementById('quickViewModal').classList.add('show');
  document.getElementById('qvOverlay').classList.add('show');
}
function closeQuickView() {
  document.getElementById('quickViewModal')?.classList.remove('show');
  document.getElementById('qvOverlay')?.classList.remove('show');
}

function injectQuickViewButtons() {
  document.querySelectorAll('[data-name]').forEach(card => {
    if (card.querySelector('.quick-view-btn')) return;
    const name = card.dataset.name;
    const price = card.dataset.price;
    const img = card.dataset.img;
    const desc = card.querySelector('p')?.textContent || '';
    const btn = document.createElement('button');
    btn.className = 'quick-view-btn';
    btn.innerHTML = '<i class="fas fa-eye"></i> Quick View';
    btn.onclick = () => openQuickView(name, price, img, desc);
    const imgEl = card.querySelector('img');
    if (imgEl) {
      const wrapper = document.createElement('div');
      wrapper.className = 'qv-img-wrapper';
      imgEl.parentNode.insertBefore(wrapper, imgEl);
      wrapper.appendChild(imgEl);
      wrapper.appendChild(btn);
    } else {
      card.prepend(btn);
    }
  });
}

function initFeedback() {
  const section = document.querySelector('.feedback-section');
  if (!section) return;

  renderReviews();

  section.querySelector('#submitReview')?.addEventListener('click', function () {
    const nameVal = document.getElementById('reviewName').value.trim();
    const msgVal = document.getElementById('reviewMsg').value.trim();
    const stars = document.querySelectorAll('.star-btn.active').length;

    if (!nameVal || !msgVal || stars === 0) {
      alert('Please fill your name, select a star rating, and write a review.');
      return;
    }

    const reviews = JSON.parse(localStorage.getItem('cafehaven_reviews') || '[]');
    reviews.unshift({ name: nameVal, msg: msgVal, stars, date: new Date().toLocaleDateString('en-GB') });
    localStorage.setItem('cafehaven_reviews', JSON.stringify(reviews));

    document.getElementById('reviewName').value = '';
    document.getElementById('reviewMsg').value = '';
    document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));

    renderReviews();
  });

  document.querySelectorAll('.star-btn').forEach((star, i, all) => {
    star.addEventListener('click', () => {
      all.forEach((s, j) => s.classList.toggle('active', j <= i));
    });
  });
}

function renderReviews() {
  const container = document.getElementById('reviewsList');
  if (!container) return;
  const reviews = JSON.parse(localStorage.getItem('cafehaven_reviews') || '[]');
  if (reviews.length === 0) {
    container.innerHTML = '<p class="no-reviews">Be the first to share your experience! ☕</p>';
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-avatar">${r.name.charAt(0).toUpperCase()}</span>
        <div>
          <strong>${r.name}</strong>
          <span class="review-date">${r.date}</span>
        </div>
        <span class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
      </div>
      <p class="review-msg">${r.msg}</p>
    </div>
  `).join('');
}

function initScrollToTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  injectQuickViewButtons();
  initFeedback();
  initScrollToTop();
});
