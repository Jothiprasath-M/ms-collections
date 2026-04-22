// ── HELPER: Load JSON ─────────────────────────────────
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch(e) {
    console.error('Error loading', path, e);
    return [];
  }
}

// ── HELPER: Product Card HTML ─────────────────────────
function productCard(p) {
  const emoji = { Kurtis:'👗', Sarees:'🥻', Suits:'✨', Sets:'👚', Tops:'👕' };
  return `
    <a href="product-detail.html?id=${p.id}" class="product-card">
      <div class="product-img">
        ${p.image && !p.image.includes('placeholder') && !p.image.includes('meesho.com/images/products/placeholder')
          ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='${emoji[p.category]||'👗'}'">`
          : (emoji[p.category] || '👗')}
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.your_price}</div>
        <button class="add-cart-btn" onclick="event.preventDefault();window.location.href='product-detail.html?id=${p.id}'">View & Buy</button>
      </div>
    </a>
  `;
}

// ── HELPER: Blog Card HTML ────────────────────────────
function blogCard(b) {
  const date = new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  return `
    <a href="blog-post.html?id=${b.id}" class="blog-card">
      <img src="${b.thumbnail}" alt="${b.title}" onerror="this.style.background='#f3ede6';this.style.height='180px'">
      <div class="blog-info">
        <div class="blog-cat">${b.category}</div>
        <div class="blog-title">${b.title}</div>
        <div class="blog-excerpt">${b.excerpt}</div>
        <div class="blog-date">${date}</div>
      </div>
    </a>
  `;
}

// ── HOME PAGE ─────────────────────────────────────────
const featuredEl = document.getElementById('featured-products');
if (featuredEl) {
  loadJSON('data/products.json').then(products => {
    featuredEl.innerHTML = products.slice(0, 8).map(productCard).join('');
  });
}

const featuredBlogsEl = document.getElementById('featured-blogs');
if (featuredBlogsEl) {
  loadJSON('data/blogs.json').then(blogs => {
    featuredBlogsEl.innerHTML = blogs.slice(0, 3).map(blogCard).join('');
  });
}

// ── PRODUCTS PAGE ─────────────────────────────────────
let allProducts = [];
const allProductsEl = document.getElementById('all-products');

if (allProductsEl) {
  loadJSON('data/products.json').then(products => {
    allProducts = products;
    renderProducts(products);
  });
}

function renderProducts(products) {
  const el = document.getElementById('all-products');
  const countEl = document.getElementById('product-count');
  if (!el) return;
  if (countEl) countEl.textContent = `Showing ${products.length} products`;
  if (products.length === 0) {
    el.innerHTML = '<div style="padding:40px;text-align:center;color:#a89080;grid-column:1/-1">No products in this category yet. Check back soon!</div>';
    return;
  }
  el.innerHTML = products.map(productCard).join('');
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat);
  renderProducts(filtered);
}

function sortProducts(val) {
  let sorted = [...allProducts];
  const activeCat = document.querySelector('.cat-btn.active')?.textContent;
  if (activeCat && activeCat !== 'All') sorted = sorted.filter(p => p.category === activeCat);
  if (val === 'price-low') sorted.sort((a, b) => a.your_price - b.your_price);
  else if (val === 'price-high') sorted.sort((a, b) => b.your_price - a.your_price);
  else if (val === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  renderProducts(sorted);
}

// ── PRODUCT DETAIL PAGE ───────────────────────────────
const detailEl = document.getElementById('product-detail');
if (detailEl) {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  loadJSON('data/products.json').then(products => {
    const p = products.find(x => x.id === id);
    if (!p) { detailEl.innerHTML = '<p>Product not found.</p>'; return; }

    document.title = `${p.name} — MS Collections`;
    document.getElementById('breadcrumb-name').textContent = p.name;

    const emoji = { Kurtis:'👗', Sarees:'🥻', Suits:'✨', Sets:'👚', Tops:'👕' };
    const allImages = [p.image, ...(p.images || [])].filter(Boolean);
const imgHtml = allImages.length > 0 ? `
  <div style="width:100%;height:100%">
    <img id="main-img" src="${allImages[0]}" style="width:100%;height:500px;object-fit:cover;border-radius:8px">
    <div style="display:flex;gap:8px;margin-top:8px;overflow-x:auto">
      ${allImages.map((img,i) => `
        <img src="${img}" onclick="document.getElementById('main-img').src='${img}'"
        style="width:100px;height:100px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid ${i===0?'#c4622d':'#e8ddd4'}">
      `).join('')}
    </div>
  </div>` : `<span style="font-size:80px">${emoji[p.category]||'👗'}</span>`;

    const sizeBtns = p.sizes.map((s, i) =>
      `<button class="size-btn${i===0?' selected':''}" onclick="selectSize('${s}',this)">${s}</button>`
    ).join('');

    const colorMap = { Red:'#e53e3e', Blue:'#3182ce', Green:'#38a169', Yellow:'#ecc94b', Pink:'#ed64a6', Purple:'#805ad5', White:'#f7fafc', Black:'#2d3748', Navy:'#2c5282', Orange:'#ed8936', Teal:'#319795', Maroon:'#822727' };
    const colorBtns = p.colors.map((c, i) =>
      `<button class="color-btn${i===0?' selected':''}" style="background:${colorMap[c]||'#888'}" onclick="selectColor('${c}',this)" title="${c}"></button>`
    ).join('');

    detailEl.innerHTML = `
      <div class="product-detail-img">${imgHtml}</div>
      <div>
        <div class="product-category">${p.category}</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;margin:8px 0;line-height:1.3;color:#2d1b0e">${p.name}</h1>
        <div style="font-size:28px;font-weight:700;color:#c4622d;margin-bottom:16px">₹${p.your_price}</div>
        <span class="badge badge-success">In Stock</span>
        <span class="badge badge-info" style="margin-left:8px">Pan India Delivery</span>

        <div style="margin-top:20px">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px">Select Size</div>
          <div class="size-btns">${sizeBtns}</div>
        </div>

        <div style="margin-top:16px">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px">Select Color</div>
          <div class="color-btns">${colorBtns}</div>
        </div>

        <div style="margin-top:20px;font-size:14px;color:#7a6658;line-height:1.7">${p.description}</div>

        <button class="buy-now-btn" onclick="buyNow(${JSON.stringify(p).replace(/"/g,'&quot;')})">
          Buy Now — ₹${p.your_price}
        </button>

        <div style="margin-top:16px;background:#f9f5f0;border-radius:8px;padding:14px;font-size:13px;color:#7a6658">
          <strong style="color:#2d1b0e">How to order:</strong> Click Buy Now → Pay via UPI → Fill your address → We confirm and ship in 5-7 days.
        </div>
      </div>
    `;

    // Similar products
    const simEl = document.getElementById('similar-products');
    if (simEl) {
      const similar = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
      simEl.innerHTML = similar.map(productCard).join('');
    }
  });
}

// ── BLOG LISTING PAGE ─────────────────────────────────
const allBlogsEl = document.getElementById('all-blogs');
if (allBlogsEl) {
  loadJSON('data/blogs.json').then(blogs => {
    allBlogsEl.innerHTML = blogs.map(blogCard).join('');
  });
}

// ── BLOG POST PAGE ────────────────────────────────────
const articleEl = document.getElementById('article-content');
if (articleEl) {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  loadJSON('data/blogs.json').then(blogs => {
    const b = blogs.find(x => x.id === id);
    if (!b) { articleEl.innerHTML = '<p>Article not found.</p>'; return; }

    document.title = `${b.title} — MS Collections`;
    document.getElementById('breadcrumb-title').textContent = b.title;
    const date = new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

    articleEl.innerHTML = `
      <img src="${b.thumbnail}" alt="${b.title}" style="width:100%;height:240px;object-fit:cover;border-radius:12px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#c4622d;margin-bottom:8px">${b.category}</div>
      <h1 style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#2d1b0e;margin-bottom:12px;line-height:1.3">${b.title}</h1>
      <div style="font-size:13px;color:#a89080;margin-bottom:28px">${date}</div>

      <!-- ADSENSE TOP -->
      <div class="ad-slot ad-slot-banner" style="margin-bottom:28px">Advertisement</div>

      <div class="article-body">${b.content}</div>

      <!-- ADSENSE MIDDLE -->
      <div class="ad-slot ad-slot-banner" style="margin-top:28px">Advertisement</div>
    `;

    // Recent posts in sidebar
    const recentEl = document.getElementById('recent-posts');
    if (recentEl) {
      const others = blogs.filter(x => x.id !== id).slice(0, 4);
      recentEl.innerHTML = others.map(x => `
        <a href="blog-post.html?id=${x.id}" style="display:block;text-decoration:none;padding:10px 0;border-bottom:1px solid #f0e8e0">
          <div style="font-size:13px;font-weight:600;color:#2d1b0e;margin-bottom:2px;line-height:1.4">${x.title}</div>
          <div style="font-size:11px;color:#a89080">${x.category}</div>
        </a>
      `).join('');
    }
  });
}
