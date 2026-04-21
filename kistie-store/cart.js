// Show/hide loading indicator
function showLoading(show) {
  const loadingDiv = document.getElementById('loading');
  if (loadingDiv) loadingDiv.style.display = show ? '' : 'none';
}

// Show feedback message (success or error)
function showFeedback(msg, isError) {
  const feedbackDiv = document.getElementById('feedback');
  if (!feedbackDiv) return;
  feedbackDiv.textContent = msg;
  feedbackDiv.style.display = 'block';
  feedbackDiv.style.background = isError ? '#f8d7da' : '#d4edda';
  feedbackDiv.style.color = isError ? '#721c24' : '#155724';
  feedbackDiv.style.border = isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
  setTimeout(() => { feedbackDiv.style.display = 'none'; }, 2500);
}
// cart and purchase logic extracted from inventory.html
// This will allow cart features to be reused on other pages


// ---------- GLOBAL DATA STORE (API-based) ----------
let products = [];
let cart = [];
const rates = { USD: 1, UGX: 3800, KES: 160, GBP: 0.8 };
const symbols = { USD: '$', UGX: 'USh', KES: 'KSh', GBP: '£' };

async function fetchProducts() {
  const res = await fetch('http://localhost:3000/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  products = await res.json();
}

async function fetchCart() {
  const res = await fetch('http://localhost:3000/api/cart', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch cart');
  cart = await res.json();
}

async function updateCartOnServer() {
  try {
    await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(cart)
    });
    showFeedback('Cart updated!', false);
  } catch (err) {
    showFeedback('Failed to update cart.', true);
  }
}

async function renderProducts() {
  await fetchProducts();
  const tbody = document.querySelector('#productTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  products.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>$${(+p.price).toFixed(2)}</td>
      <td>${p.image ? `<img src='${productImageUrl(p.image)}' alt='' style='width:40px;height:40px;object-fit:cover;border-radius:4px;'>` : ''}</td>
      <td><button onclick="deleteProduct(${p.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function renderCart() {
  showLoading(true);
  try {
    await fetchCart();
  } catch (err) {
    showFeedback('Could not load cart. Please try again.', true);
    showLoading(false);
    return;
  }
  showLoading(false);
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
    let price = item.price;
    let symbol = symbols[item.currency] || item.currency;
    let rowTotal = price * item.quantity;
    total += rowTotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="display:flex;align-items:center;gap:10px;">
        <img src="${productImageUrl(item.image)}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">
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


window.updateCartQty = async function(idx, val) {
  let qty = parseInt(val);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > 10) qty = 10;
  cart[idx].quantity = qty;
  await updateCartOnServer();
  renderCart();
}

window.editCartItem = function(idx) {
  alert('To edit item details, please remove and re-add the item from the catalog.');
}



window.incrementQty = async function(idx) {
  if (cart[idx].quantity < 10) {
    cart[idx].quantity++;
    await updateCartOnServer();
    renderCart();
  }
}

window.decrementQty = async function(idx) {
  if (cart[idx].quantity > 1) {
    cart[idx].quantity--;
    await updateCartOnServer();
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
  const res = await fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' });
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
  saveAll(); renderCart();
};

// Buy Now logic: after confirmation, redirect to inventory.html
window.buyNow = function(product) {
  // Redirect to checkout section for shipping/payment
  window.location.href = 'inventory.html#checkout';
};
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

document.addEventListener('DOMContentLoaded', async function() {
  await renderCart();
  await renderProducts();
  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async function() {
      if (confirm('Are you sure you want to clear the entire cart?')) {
        cart.length = 0;
        await updateCartOnServer();
        renderCart();
        renderCartTable();
      }
    });
  }
});
