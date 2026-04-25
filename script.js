/* ============================================
   SAVANNAH PACKS — SCRIPT.JS
   Full E-Commerce Logic with Admin Dashboard
============================================ */

'use strict';

// ===== STATE =====
let cart = [];
let products = [];
let orders = [];
let feedbacks = [];
let subscribers = [];
let discountApplied = null;
let adminLoggedIn = false;
let editingProductId = null;

// ===== DISCOUNT CODES =====
const DISCOUNT_CODES = {
  'SAVANNAH10': 0.10,
  'ECO20':      0.20,
  'NAIROBI15':  0.15,
  'WOOD5':      0.05
};

// ===== DEFAULT PRODUCTS =====
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Classic Savannah Box',
    price: 2800,
    category: 'medium',
    description: 'Our signature medium wooden lunch box, handcrafted from sustainably sourced acacia wood. Features a smooth bamboo clasp, natural food-safe finish, and spacious interior with removable divider.',
    emoji: '🪵',
    stock: 12,
    badge: 'Bestseller',
    features: ['Acacia wood', 'Food-safe finish', 'Removable divider', 'Bamboo clasp']
  },
  {
    id: 'p2',
    name: 'The Explorer – Large',
    price: 3800,
    category: 'large',
    description: 'For the big appetite and bigger adventures. Our large wooden lunch box offers generous capacity with two compartments, ideal for full meals with sides.',
    emoji: '🌳',
    stock: 7,
    badge: 'New',
    features: ['Olive wood', 'Double compartment', 'Leak-resistant seal', 'Carry strap']
  },
  {
    id: 'p3',
    name: 'Mini Wanderer',
    price: 1800,
    category: 'small',
    description: 'Perfectly compact for snacks, fruits, or a small lunch. Lightweight, durable, and beautifully finished with a natural oil coat.',
    emoji: '🍃',
    stock: 20,
    badge: '',
    features: ['Mahogany wood', 'Compact design', 'Oil-coated finish', 'Clip closure']
  },
  {
    id: 'p4',
    name: 'Savannah Gift Set',
    price: 6500,
    category: 'gift',
    description: 'The perfect gift for eco-conscious loved ones. Includes a Classic box, wooden cutlery set, linen napkin, and a personalized engraving option.',
    emoji: '🎁',
    stock: 4,
    badge: 'Limited',
    features: ['Box + cutlery set', 'Linen napkin', 'Gift packaging', 'Custom engraving']
  },
  {
    id: 'p5',
    name: 'Engraved Edition',
    price: 3500,
    category: 'medium',
    description: 'The Classic Savannah Box with a premium custom laser engraving of your name, initials, or a short message. Makes every meal feel personal.',
    emoji: '✨',
    stock: 8,
    badge: 'Custom',
    features: ['Custom engraving', 'Premium finish', 'Gift-ready box', 'Signature clasp']
  },
  {
    id: 'p6',
    name: 'The Daily Carry – Small',
    price: 2200,
    category: 'small',
    description: 'Slim and elegant, this small box fits snugly into any bag. Perfect for office lunches, school days, or city commutes.',
    emoji: '🌿',
    stock: 15,
    badge: '',
    features: ['Eucalyptus wood', 'Slim profile', 'Secure latch', 'Eco packaging']
  }
];

// ===== DEFAULT FEEDBACK =====
const DEFAULT_FEEDBACKS = [
  { id: 'f1', name: 'Amara K.', rating: 5, comment: 'Absolutely gorgeous box. I get compliments every day at work. The wood grain is stunning and it feels so premium!', date: '2024-03-10' },
  { id: 'f2', name: 'Jayden M.', rating: 5, comment: 'Ordered the gift set for my wife and she loved every piece. The packaging was beautiful and arrived quickly. Will buy again!', date: '2024-03-22' },
  { id: 'f3', name: 'Zuri W.', rating: 4, comment: 'Great quality and very eco-friendly. Love that it\'s made in Nairobi. The only reason for 4 stars is I wish it came in more sizes.', date: '2024-04-01' }
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderNavbar();
  renderFeaturedProducts();
  renderShopGrid();
  renderTestimonials();
  initStarRating();
  initScrollEffects();
  initFilters();
  initSortSelect();

  // Close modals when clicking the dark overlay backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) closeModal(this.id);
    });
  });
});

// ===== DATA PERSISTENCE =====
function loadData() {
  products = JSON.parse(localStorage.getItem('sp_products') || 'null') || DEFAULT_PRODUCTS;
  orders = JSON.parse(localStorage.getItem('sp_orders') || '[]');
  feedbacks = JSON.parse(localStorage.getItem('sp_feedbacks') || 'null') || DEFAULT_FEEDBACKS;
  subscribers = JSON.parse(localStorage.getItem('sp_subscribers') || '[]');
  cart = JSON.parse(localStorage.getItem('sp_cart') || '[]');
  updateCartUI();
}

function saveProducts() { localStorage.setItem('sp_products', JSON.stringify(products)); }
function saveOrders() { localStorage.setItem('sp_orders', JSON.stringify(orders)); }
function saveFeedbacks() { localStorage.setItem('sp_feedbacks', JSON.stringify(feedbacks)); }
function saveSubscribers() { localStorage.setItem('sp_subscribers', JSON.stringify(subscribers)); }
function saveCart() { localStorage.setItem('sp_cart', JSON.stringify(cart)); }

// ===== PAGE ROUTING =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const pageMap = {
    home: 'homePage',
    shop: 'shopPage',
    about: 'aboutPage',
    contact: 'contactPage',
    admin: 'adminPage'
  };

  const el = document.getElementById(pageMap[page]);
  if (el) { el.classList.add('active'); }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');

  if (page === 'shop') renderShopGrid();
  if (page === 'admin') renderAdminDashboard();
  if (page === 'home') {
    renderFeaturedProducts();
    renderTestimonials();
  }
}

// ===== NAVBAR =====
function renderNavbar() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 30);
  });
}

function toggleMenu() {
  const links = document.getElementById('navLinks');
  links.classList.toggle('open');
}

// ===== PRODUCT RENDERING =====
function renderFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = products.slice(0, 3);
  grid.innerHTML = featured.map(p => productCardHTML(p)).join('');
}

function renderShopGrid(filterCat = 'all', sortBy = 'default') {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  let filtered = filterCat === 'all' ? [...products] : products.filter(p => p.category === filterCat);

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products in this category yet.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const stockClass = p.stock === 0 ? 'out-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock';
  const stockLabel = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In Stock';

  const imgContent = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block"/>`
    : `<div class="no-img-placeholder"><i class="fas fa-image"></i><span>No image</span></div>`;

  return `
    <article class="product-card" onclick="openQuickView('${p.id}')">
      <div class="product-img" style="padding:0;overflow:hidden">
        ${imgContent}
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <span class="stock-badge ${stockClass}">${stockLabel}</span>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-footer">
          <span class="product-price">KSh ${p.price.toLocaleString()}</span>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p.id}')" ${p.stock === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

// ===== QUICK VIEW =====
function openQuickView(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;

  const stockClass = p.stock === 0 ? 'out-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock';
  const stockLabel = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In Stock';

  const imgContent = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)"/>`
    : `<div class="no-img-placeholder large"><i class="fas fa-image"></i><span>No image</span></div>`;

  document.getElementById('quickViewContent').innerHTML = `
    <div class="product-detail-img" style="padding:0;overflow:hidden">
      ${imgContent}
    </div>
    <div class="product-detail-info">
      <span class="section-label">${p.category.toUpperCase()}</span>
      <h2>${p.name}</h2>
      <div class="product-detail-price">KSh ${p.price.toLocaleString()}</div>
      <p class="product-detail-desc">${p.description}</p>
      <div class="product-detail-meta">
        ${(p.features || []).map(f => `<div><i class="fas fa-check-circle"></i> ${f}</div>`).join('')}
      </div>
      <div style="margin-bottom:16px">
        <span class="stock-badge ${stockClass}" style="display:inline-block">${stockLabel}</span>
      </div>
      <div class="variant-select">
        <label>Size Variant</label>
        <select id="variantSelect">
          <option>Standard</option>
          <option>With Engraving (+KSh 500)</option>
          <option>Gift Wrapped (+KSh 300)</option>
        </select>
      </div>
      <button class="btn-primary full-width" onclick="addToCart('${p.id}'); closeModal('quickViewModal')" ${p.stock === 0 ? 'disabled' : ''}>
        <i class="fas fa-shopping-bag"></i> Add to Bag
      </button>
    </div>
  `;

  openModal('quickViewModal');
}

// ===== CART =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  if (product.stock === 0) { showToast('This item is out of stock.', 'error'); return; }

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    if (existing.qty >= product.stock) { showToast('Max stock reached.', 'error'); return; }
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  updateCartUI();
  // Only re-render cart list if sidebar is open
  if (document.getElementById('cartSidebar').classList.contains('open')) {
    renderCartItems();
  }
  showToast(`${product.name} added to your bag! 🛍️`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  const product = products.find(p => p.id === productId);
  item.qty = Math.max(1, Math.min(item.qty + delta, product ? product.stock : 99));
  if (item.qty === 0) removeFromCart(productId);
  else {
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = document.getElementById('cartCount');
  countEl.textContent = total;
  countEl.classList.toggle('visible', total > 0);
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  container.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    const thumbContent = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/>`
      : `<div style="width:100%;height:100%;background:var(--beige);border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fas fa-image" style="color:var(--text-muted);font-size:1.2rem"></i></div>`;
    return `
      <div class="cart-item">
        <div class="cart-item-icon" style="font-size:0;width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0">${thumbContent}</div>
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <p class="cart-item-price">KSh ${(p.price * item.qty).toLocaleString()}</p>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart('${p.id}')">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateTotals();
}

function updateTotals() {
  const subtotal = cart.reduce((s, i) => {
    const p = products.find(x => x.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  let discount = 0;
  if (discountApplied) {
    discount = Math.round(subtotal * discountApplied.rate);
    document.getElementById('discountDisplay').style.display = 'flex';
    document.getElementById('discountAmount').textContent = `-KSh ${discount.toLocaleString()}`;
  } else {
    document.getElementById('discountDisplay').style.display = 'none';
  }

  const total = subtotal - discount;
  document.getElementById('cartSubtotal').textContent = `KSh ${subtotal.toLocaleString()}`;
  document.getElementById('cartTotal').textContent = `KSh ${total.toLocaleString()}`;
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = sidebar.classList.contains('open');

  if (!isOpen) renderCartItems();
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function applyDiscount() {
  const code = document.getElementById('discountInput').value.trim().toUpperCase();
  if (!code) return;

  if (DISCOUNT_CODES[code]) {
    discountApplied = { code, rate: DISCOUNT_CODES[code] };
    showToast(`Discount code "${code}" applied! ${(DISCOUNT_CODES[code] * 100)}% off 🎉`, 'success');
    updateTotals();
  } else {
    showToast('Invalid discount code.', 'error');
  }
}

// ===== ORDER REQUEST =====
function openOrderForm() {
  const products_summary = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    return p ? `${p.name} × ${item.qty} = KSh ${(p.price * item.qty).toLocaleString()}` : '';
  }).filter(Boolean).join('\n');

  const totalEl = document.getElementById('cartTotal');
  document.getElementById('orderProducts').value = products_summary + '\n\nTotal: ' + (totalEl ? totalEl.textContent : '');

  openModal('orderModal');
}

function submitOrder(e) {
  e.preventDefault();
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  if (!name || !phone) { showToast('Please fill in all required fields.', 'error'); return; }

  const totalText = document.getElementById('cartTotal').textContent;

  const order = {
    id: 'ORD-' + Date.now(),
    name,
    phone,
    notes,
    items: [...cart],
    itemsSummary: document.getElementById('orderProducts').value,
    total: totalText,
    status: 'Pending',
    date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: Date.now()
  };

  orders.unshift(order);
  saveOrders();

  // Clear cart
  cart = [];
  discountApplied = null;
  saveCart();
  updateCartUI();

  closeModal('orderModal');
  const cartSidebar = document.getElementById('cartSidebar');
  if (cartSidebar.classList.contains('open')) toggleCart();

  document.getElementById('orderForm').reset();
  showToast('Order request submitted! We\'ll contact you soon. 🌿', 'success');
}

// ===== FEEDBACK =====
function openFeedbackModal() { openModal('feedbackModal'); }

function initStarRating() {
  const stars = document.querySelectorAll('#starRating span');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      document.getElementById('fbRating').value = val;
      stars.forEach((s, i) => s.classList.toggle('active', i < val));
    });
    star.addEventListener('mouseover', () => {
      const val = parseInt(star.dataset.val);
      stars.forEach((s, i) => s.classList.toggle('active', i < val));
    });
    star.addEventListener('mouseout', () => {
      const rating = parseInt(document.getElementById('fbRating').value) || 0;
      stars.forEach((s, i) => s.classList.toggle('active', i < rating));
    });
  });
}

function submitFeedback(e) {
  e.preventDefault();
  const name = document.getElementById('fbName').value.trim() || 'Anonymous';
  const rating = parseInt(document.getElementById('fbRating').value);
  const comment = document.getElementById('fbComment').value.trim();

  if (!rating) { showToast('Please select a star rating.', 'error'); return; }
  if (!comment) { showToast('Please write a comment.', 'error'); return; }

  const fb = {
    id: 'fb-' + Date.now(),
    name,
    rating,
    comment,
    date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  feedbacks.unshift(fb);
  saveFeedbacks();
  renderTestimonials();

  closeModal('feedbackModal');
  document.getElementById('feedbackForm').reset();
  document.querySelectorAll('#starRating span').forEach(s => s.classList.remove('active'));
  document.getElementById('fbRating').value = 0;

  showToast('Thank you for your feedback! ⭐', 'success');
}

function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  if (feedbacks.length === 0) {
    track.innerHTML = '<div class="empty-state"><p>Be the first to leave a review!</p></div>';
    return;
  }

  track.innerHTML = feedbacks.slice(0, 6).map(f => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
      <p class="testimonial-text">"${f.comment}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">${f.name.charAt(0)}</div>
        <div class="author-info">
          <h5>${f.name}</h5>
          <span>${f.date}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== NEWSLETTER =====
function subscribeNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail').value.trim();
  if (!email) return;

  if (subscribers.includes(email)) {
    showToast('You\'re already subscribed!', 'success');
  } else {
    subscribers.push(email);
    saveSubscribers();
    showToast('Welcome to the Savannah community! 🌿', 'success');
  }

  document.getElementById('newsletterEmail').value = '';
}

// ===== CONTACT FORM =====
function submitContact(e) {
  e.preventDefault();
  showToast('Message sent! We\'ll get back to you soon. 📬', 'success');
  e.target.reset();
}

// ===== ADMIN =====
function openAdminLogin() {
  if (adminLoggedIn) { showPage('admin'); return; }
  openModal('adminLoginModal');
}

function adminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('adminError');

  if (user === 'Titch' && pass === '1234') {
    adminLoggedIn = true;
    closeModal('adminLoginModal');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    errEl.style.display = 'none';
    showPage('admin');
  } else {
    errEl.style.display = 'block';
    document.getElementById('adminPass').value = '';
  }
}

function adminLogout() {
  adminLoggedIn = false;
  showPage('home');
  showToast('Logged out successfully.', 'success');
}

function adminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));

  const tabMap = {
    orders: 'adminOrders',
    products: 'adminProducts',
    feedback: 'adminFeedback',
    newsletter: 'adminNewsletter'
  };

  const tabEl = document.getElementById(tabMap[tab]);
  if (tabEl) tabEl.classList.add('active');
  if (btn) btn.classList.add('active');
}

function renderAdminDashboard() {
  renderAdminOrders();
  renderAdminProducts();
  renderAdminFeedback();
  renderAdminNewsletter();
}

// --- Admin Orders ---
function renderAdminOrders() {
  const container = document.getElementById('ordersList');
  const countEl = document.getElementById('orderCount');
  if (!container) return;

  countEl.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No orders yet.</p></div>';
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="order-card" id="order-${o.id}">
      <div class="order-info">
        <h4>${o.name} <span style="color:var(--text-muted);font-size:0.8rem;font-weight:400">${o.id}</span></h4>
        <p>📞 ${o.phone} · 📅 ${o.date}</p>
        <p style="margin-top:6px;font-size:0.8rem;color:var(--text-light);white-space:pre-line">${o.itemsSummary}</p>
        ${o.notes ? `<p style="margin-top:4px;font-size:0.8rem;color:var(--text-muted)">Note: ${o.notes}</p>` : ''}
      </div>
      <div class="order-actions">
        <span class="order-status-badge status-${o.status.toLowerCase()}">${o.status}</span>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
        <button class="btn-delete" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders();
    renderAdminOrders();
    showToast(`Order ${orderId} marked as ${newStatus}.`);
  }
}

function deleteOrder(orderId) {
  if (!confirm('Delete this order?')) return;
  orders = orders.filter(o => o.id !== orderId);
  saveOrders();
  renderAdminOrders();
  showToast('Order deleted.');
}

// --- Admin Products ---
function renderAdminProducts() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-tag"></i><p>No products yet.</p></div>';
    return;
  }

  container.innerHTML = products.map(p => {
    const thumb = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;display:block"/>`
      : `<div style="width:52px;height:52px;background:var(--beige);border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fas fa-image" style="color:var(--text-muted)"></i></div>`;
    return `
    <div class="admin-product-row">
      <div class="admin-product-icon" style="font-size:0">${thumb}</div>
      <div class="admin-product-info">
        <h4>${p.name} <span style="color:var(--text-muted);font-size:0.8rem">· ${p.category}</span></h4>
        <p>KSh ${p.price.toLocaleString()} · Stock: ${p.stock} · ${p.badge || 'No badge'}</p>
      </div>
      <div class="admin-product-actions">
        <button class="btn-edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `}).join('');
}

// ===== IMAGE UPLOAD HANDLER =====
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  // Warn if file is very large
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image is large. Consider using a smaller file for better performance.', '');
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    document.getElementById('pImage').value = base64;

    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const area = document.getElementById('imageUploadArea');

    preview.src = base64;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    area.classList.add('has-image');

    // Add "click to change" hint
    let hint = area.querySelector('.upload-change-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'upload-change-hint';
      hint.textContent = 'Click to change image';
      area.appendChild(hint);
    }
  };
  reader.readAsDataURL(file);
}

function resetImageUpload() {
  document.getElementById('pImage').value = '';
  document.getElementById('pImageFile').value = '';
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const area = document.getElementById('imageUploadArea');
  preview.src = '';
  preview.style.display = 'none';
  placeholder.style.display = 'block';
  area.classList.remove('has-image');
  const hint = area.querySelector('.upload-change-hint');
  if (hint) hint.remove();
}

function setImagePreviewFromSaved(src) {
  if (!src) { resetImageUpload(); return; }
  document.getElementById('pImage').value = src;
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const area = document.getElementById('imageUploadArea');
  preview.src = src;
  preview.style.display = 'block';
  placeholder.style.display = 'none';
  area.classList.add('has-image');
  let hint = area.querySelector('.upload-change-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'upload-change-hint';
    hint.textContent = 'Click to change image';
    area.appendChild(hint);
  }
}

function openProductForm() {
  editingProductId = null;
  document.getElementById('productFormTitle').textContent = 'Add New Product';
  document.getElementById('productId').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pCategory').value = 'medium';
  document.getElementById('pStock').value = '';
  document.getElementById('pDesc').value = '';
  resetImageUpload();
  document.getElementById('productFormPanel').style.display = 'block';
  document.getElementById('productFormPanel').scrollIntoView({ behavior: 'smooth' });
}

function editProduct(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;
  editingProductId = productId;
  document.getElementById('productFormTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pDesc').value = p.description;
  setImagePreviewFromSaved(p.image || '');
  document.getElementById('productFormPanel').style.display = 'block';
  document.getElementById('productFormPanel').scrollIntoView({ behavior: 'smooth' });
}

function cancelProductForm() {
  document.getElementById('productFormPanel').style.display = 'none';
  editingProductId = null;
}

function saveProduct(e) {
  e.preventDefault();
  const name = document.getElementById('pName').value.trim();
  const price = parseInt(document.getElementById('pPrice').value);
  const category = document.getElementById('pCategory').value;
  const stock = parseInt(document.getElementById('pStock').value);
  const description = document.getElementById('pDesc').value.trim();
  const image = document.getElementById('pImage').value.trim();

  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], name, price, category, stock, description, image };
    }
    showToast('Product updated!', 'success');
  } else {
    const newProduct = {
      id: 'p' + Date.now(),
      name, price, category, stock, description, image,
      badge: '', features: []
    };
    products.push(newProduct);
    showToast('Product added!', 'success');
  }

  saveProducts();
  cancelProductForm();
  renderAdminProducts();
  renderShopGrid();
  renderFeaturedProducts();
}

function deleteProduct(productId) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  products = products.filter(p => p.id !== productId);
  saveProducts();
  renderAdminProducts();
  renderShopGrid();
  renderFeaturedProducts();
  showToast('Product deleted.');
}

// --- Admin Feedback ---
function renderAdminFeedback() {
  const container = document.getElementById('adminFeedbackList');
  if (!container) return;

  if (feedbacks.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>No feedback yet.</p></div>';
    return;
  }

  container.innerHTML = feedbacks.map(f => `
    <div class="feedback-card">
      <div class="stars">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
      <p>"${f.comment}"</p>
      <div class="feedback-meta">— ${f.name} · ${f.date}
        <button class="btn-delete" style="margin-left:12px;padding:4px 10px;font-size:0.75rem" onclick="deleteFeedback('${f.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteFeedback(id) {
  feedbacks = feedbacks.filter(f => f.id !== id);
  saveFeedbacks();
  renderAdminFeedback();
  renderTestimonials();
  showToast('Feedback removed.');
}

// --- Admin Newsletter ---
function renderAdminNewsletter() {
  const container = document.getElementById('adminNewsletterList');
  if (!container) return;

  if (subscribers.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>No subscribers yet.</p></div>';
    return;
  }

  container.innerHTML = subscribers.map((email, i) => `
    <div class="newsletter-item">
      <span><i class="fas fa-envelope" style="color:var(--brown);margin-right:8px"></i>${email}</span>
      <button class="btn-delete" style="padding:4px 10px;font-size:0.75rem" onclick="removeSubscriber(${i})">Remove</button>
    </div>
  `).join('');
}

function removeSubscriber(index) {
  subscribers.splice(index, 1);
  saveSubscribers();
  renderAdminNewsletter();
}

// ===== FILTERS & SORT =====
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderShopGrid(this.dataset.filter, document.getElementById('sortSelect').value);
    });
  });
}

function initSortSelect() {
  const sel = document.getElementById('sortSelect');
  if (sel) {
    sel.addEventListener('change', () => {
      const active = document.querySelector('.filter-btn.active');
      renderShopGrid(active ? active.dataset.filter : 'all', sel.value);
    });
  }
}

function sortProducts() { /* handled by initSortSelect */ }

// ===== MODAL UTILITIES =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// ===== TOAST =====
let toastTimeout;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  if (type) toast.classList.add(type);

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-up');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.value-item, .product-card, .testimonial-card').forEach(el => {
    observer.observe(el);
  });
}

// ===== SCROLL TO STORY =====
function scrollToStory() {
  document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
}
