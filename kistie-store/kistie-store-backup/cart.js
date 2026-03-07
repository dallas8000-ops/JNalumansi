// cart and purchase logic extracted from inventory.html
// This will allow cart features to be reused on other pages

// ---------- GLOBAL DATA STORE ----------
// Only declare these once, on window for global access
window.products = JSON.parse(localStorage.getItem('products')||'[]');
window.cart = JSON.parse(localStorage.getItem('cart')||'[]');
window.coupons = JSON.parse(localStorage.getItem('coupons')||'[]');

function reloadData() {
  window.products = JSON.parse(localStorage.getItem('products')||'[]');
  window.cart = JSON.parse(localStorage.getItem('cart')||'[]');
  window.coupons = JSON.parse(localStorage.getItem('coupons')||'[]');
}
const rates = { USD: 1, UGX: 3800, KES: 160, GBP: 0.8 };
const symbols = { USD: '$', UGX: 'USh', KES: 'KSh', GBP: '£' };

function saveAll() {
  localStorage.setItem('products', JSON.stringify(products));
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('coupons', JSON.stringify(coupons));
}

function renderProducts() {
  reloadData();
  // Fetch products from backend if needed, or use window.products
  fetch('http://localhost:3000/api/products')
    .then(res => res.json())
    .then(products => {
      window.products = products;
      const tbody = document.querySelector('#productTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      products.forEach((p) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.name}</td>
          <td>$${(+p.price).toFixed(2)}</td>
          <td>${p.image ? `<img src='${p.image}' alt='' style='width:40px;height:40px;object-fit:cover;border-radius:4px;'>` : ''}</td>
          <td><button onclick="deleteProduct(${p.id})">Delete</button></td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function renderCart() {
  reloadData();
  const tbody = document.getElementById('cartItems');
  const emptyDiv = document.getElementById('cartEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';
  let total = 0;
  if (!cart || cart.length === 0) {
    if (emptyDiv) emptyDiv.style.display = '';
    return;
  } else {
    if (emptyDiv) emptyDiv.style.display = 'none';
  }
  cart.forEach((item, i) => {
    // item: {id, name, image, size, currency, quantity, price}
    let price = item.price;
    let symbol = symbols[item.currency] || item.currency;
    let rowTotal = price * item.quantity;
    total += rowTotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="display:flex;align-items:center;gap:10px;">
        <img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">
        <div>
          <div style="font-weight:600;">${item.name}</div>
          <div style="font-size:0.95em;color:#888;">Size: ${item.size}</div>
        </div>
      </td>
      <td>${symbol}${price.toLocaleString()}<br><span style="font-size:0.9em;color:#888;">${item.currency}</span></td>
      <td style="display:flex;align-items:center;gap:6px;">
        <button onclick="decrementQty(${i})" style="width:28px;height:28px;">-</button>
        <span style="min-width:24px;display:inline-block;text-align:center;">${item.quantity}</span>
        <button onclick="incrementQty(${i})" style="width:28px;height:28px;">+</button>
      </td>
      <td><button onclick="editCartItem(${i})">Edit</button></td>
    `;
    tbody.appendChild(tr);
  });
  // Optionally, show total somewhere
  // document.getElementById('cartTotal')?.textContent = 'Total: ' + total;
}

window.updateCartQty = function(idx, val) {
  let qty = parseInt(val);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > 10) qty = 10;
  cart[idx].quantity = qty;
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

window.editCartItem = function(idx) {
  alert('To edit item details, please remove and re-add the item from the catalog.');
}


window.incrementQty = function(idx) {
  if (cart[idx].quantity < 10) {
    cart[idx].quantity++;
    saveAll();
    renderCart();
  }
}

window.decrementQty = function(idx) {
  if (cart[idx].quantity > 1) {
    cart[idx].quantity--;
    saveAll();
    renderCart();
  }
}

function renderCoupons() {
  reloadData();
  const ul = document.getElementById('couponList');
  if (!ul) return;
  ul.innerHTML = '';
  coupons.forEach((c,i) => {
    const li = document.createElement('li');
    li.textContent = `${c.code} - ${c.discount}% off `;
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.onclick = () => { coupons.splice(i,1); saveAll(); renderCoupons(); };
    li.appendChild(btn);
    ul.appendChild(li);
  });
// Listen for localStorage changes from other tabs/windows
window.addEventListener('storage', function(e) {
  if (["products","cart","coupons"].includes(e.key)) {
    reloadData();
    renderProducts && renderProducts();
    renderCart && renderCart();
    renderCoupons && renderCoupons();
    renderCartTable && renderCartTable();
  }
});
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  const res = await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.deleted) {
    alert('Product deleted!');
    // Re-fetch and re-render product list
    renderProducts && renderProducts();
  } else {
    alert('Failed to delete product.');
  }
}

window.addToCart = function(i) {
  let idx = cart.findIndex(item=>item.productIndex===i);
  if(idx>-1) cart[idx].qty++;
  else cart.push({productIndex:i,qty:1});
  saveAll(); renderCart(); };
window.removeFromCart = function(i) {
  cart.splice(i,1); saveAll(); renderCart(); };

// Render cart for inventory.html cartTable
function renderCartTable() {
  reloadData();
  const tbody = document.getElementById('cartTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  // Removed cart debug info display
  window.cart.forEach((item, i) => {
    const name = item.name || 'Unnamed';
    const price = item.price !== undefined ? `$${item.price}` : '';
    const qty = item.quantity !== undefined ? item.quantity : 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name}<br><span style='font-size:0.9em;color:#888;'>Size: ${item.size || ''}</span></td>
      <td>${price}<br><span style='font-size:0.9em;color:#888;'>${item.currency || ''}</span></td>
      <td>${qty}</td>
      <td><button onclick="removeFromCartTable(${i})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
}

window.removeFromCartTable = function(idx) {
  cart.splice(idx, 1);
  saveAll();
  renderCartTable();
}

document.addEventListener('DOMContentLoaded', function() {
  renderCart();
  renderCartTable();
  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear the entire cart?')) {
        cart.length = 0;
        saveAll();
        renderCart();
        renderCartTable();
      }
    });
  }
});
