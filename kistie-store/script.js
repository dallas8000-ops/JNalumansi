// ---------- SCRIPT.JS ----------
// Smooth scroll for internal links
window.products = JSON.parse(localStorage.getItem('products')||'[]');
window.cart = JSON.parse(localStorage.getItem('cart')||'[]');
window.coupons = JSON.parse(localStorage.getItem('coupons')||'[]');

function reloadData() {
  window.products = JSON.parse(localStorage.getItem('products')||'[]');
  window.cart = JSON.parse(localStorage.getItem('cart')||'[]');
  window.coupons = JSON.parse(localStorage.getItem('coupons')||'[]');
}

function renderProducts() {
  // Fetch products from backend API and render
  const table = document.getElementById('productTable');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  // Store idx for edit
  window._productIdxMap = {};
    fetch('http://localhost:3001/api/products', { credentials: 'include' })
    .then(res => res.json())
    .then(products => {
      window.products = products;
      if (!products || products.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'No products in inventory.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      products.forEach((product, idx) => {
        const tr = document.createElement('tr');
        // Name
        const tdName = document.createElement('td');
        tdName.textContent = product.name || '';
        tr.appendChild(tdName);
        // Price
        const tdPrice = document.createElement('td');
        tdPrice.textContent = product.price != null ? product.price : '';
        tr.appendChild(tdPrice);
        // Image
        const tdImg = document.createElement('td');
        if (product.image) {
          const img = document.createElement('img');
          img.src = product.image;
          img.alt = product.name || '';
          img.style.maxWidth = '60px';
          img.style.maxHeight = '60px';
          tdImg.appendChild(img);
        } else {
          tdImg.textContent = '-';
        }
        tr.appendChild(tdImg);
        // Action (Edit/Remove)
        const tdAction = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.background = '#2979ff';
        editBtn.style.color = '#fff';
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = '0.5rem';
        editBtn.style.padding = '0.3rem 1rem';
        editBtn.style.marginRight = '0.5rem';
        editBtn.onclick = function() { openEditModal(idx); };
        tdAction.appendChild(editBtn);
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.background = '#2979ff';
        removeBtn.style.color = '#fff';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '0.5rem';
        removeBtn.style.padding = '0.3rem 1rem';
        removeBtn.onclick = function() { removeProduct(idx); };
        tdAction.appendChild(removeBtn);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
        window._productIdxMap[idx] = product;
      });
    })
    .catch(() => {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.textContent = 'Failed to load products from server.';
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
}


// Edit product handler (modal-based)
function openEditModal(idx) {
  const product = window.products[idx];
  const modal = document.getElementById('editProductModal');
  const form = document.getElementById('editProductForm');
  document.getElementById('editProductName').value = product.name || '';
  document.getElementById('editProductPrice').value = product.price != null ? product.price : '';
  document.getElementById('editProductImage').value = product.image || '';
  modal.style.display = 'flex';
  // Remove previous listeners
  form.onsubmit = null;
  form.onsubmit = function(e) {
    e.preventDefault();
    const newName = document.getElementById('editProductName').value;
    const newPrice = document.getElementById('editProductPrice').value;
    const newImage = document.getElementById('editProductImage').value;
    if (newName.trim() === '' || isNaN(Number(newPrice))) {
      alert('Invalid input.');
      return;
    }
    fetch(`http://localhost:3001/api/products/${product.id || product._id || idx}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, price: Number(newPrice), image: newImage })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
      })
      .then(() => {
        modal.style.display = 'none';
        renderProducts();
      })
      .catch(err => alert('Error updating product: ' + err.message));
  };
  document.getElementById('cancelEditBtn').onclick = function() {
    modal.style.display = 'none';
  };
}

// Remove product handler
function removeProduct(idx) {
  if (!confirm('Remove this product?')) return;
  const product = window.products[idx];
    fetch(`http://localhost:3001/api/products/${product.id || product._id || idx}`, {
    method: 'DELETE',
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    })
    .then(() => renderProducts())
    .catch(err => alert('Error deleting product: ' + err.message));
}

// Add product handler (for admin add form)
document.addEventListener('DOMContentLoaded', function() {
  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.onsubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('productName').value;
      const price = document.getElementById('productPrice').value;
      const image = document.getElementById('productImage').value;
      if (!name.trim() || isNaN(Number(price))) {
        alert('Invalid input.');
        return;
      }
        fetch('http://localhost:3001/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price), image })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add product');
          return res.json();
        })
        .then(() => {
          addProductForm.reset();
          renderProducts();
        })
        .catch(err => alert('Error adding product: ' + err.message));
    };
  }
});
  // --- Admin Login Logic for inventory.html ---
  document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginMsg = document.getElementById('adminLoginMsg');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');

    // Simple session state
    function setAdminLoggedIn(isLoggedIn) {
      const productSection = document.getElementById('productManagementSection');
      // Fallback if loginMsg is missing
      const msg = loginMsg || document.getElementById('adminLoginMsg');
      if (isLoggedIn) {
        if (msg) {
          msg.style.color = 'green';
          msg.textContent = 'Logged in as admin.';
        }
        if (usernameInput) usernameInput.style.display = 'none';
        if (passwordInput) passwordInput.style.display = 'none';
        if (loginForm.querySelector('button[type="submit"]')) loginForm.querySelector('button[type="submit"]').style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = '';
        if (productSection) {
          productSection.style.display = '';
          renderProducts();
        }
      } else {
        if (msg) {
          msg.style.color = '#c00';
          msg.textContent = '';
        }
        if (usernameInput) usernameInput.style.display = '';
        if (passwordInput) passwordInput.style.display = '';
        if (loginForm.querySelector('button[type="submit"]')) loginForm.querySelector('button[type="submit"]').style.display = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (productSection) {
          productSection.style.display = 'none';
        }
      }
    }

    // Check session on load
    if (window.localStorage.getItem('isAdmin') === 'true') {
      setAdminLoggedIn(true);
    } else {
      setAdminLoggedIn(false);
    }

    if (loginForm) {
      loginForm.onsubmit = function(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (username === 'admin' && password === 'password123') {
          window.localStorage.setItem('isAdmin', 'true');
          setAdminLoggedIn(true);
        } else {
          loginMsg.style.color = '#c00';
          loginMsg.textContent = 'Invalid admin credentials.';
        }
      };
    }
    if (logoutBtn) {
      logoutBtn.onclick = function() {
        window.localStorage.removeItem('isAdmin');
        setAdminLoggedIn(false);
      };
    }
  });
  // --- End Admin Login Logic ---
function renderCart() {
  reloadData();
  const cartTable = document.getElementById('cartSummaryTable');
  const cartTotalDiv = document.getElementById('cartSummaryTotal');
  if (!cartTable || !cartTotalDiv) return;
  const tbody = cartTable.querySelector('tbody');
  tbody.innerHTML = '';
  // Show each item's price and total in its own currency
  const symbols = { USD: '$', UGX: 'USh', KES: 'KSh', EUR: '€' };
  if (!window.cart || window.cart.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'Your cart is empty.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    cartTotalDiv.textContent = '';
    return;
  }
  // Group totals by currency
  const totalsByCurrency = {};
  window.cart.forEach(item => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = item.name || '';
    tr.appendChild(tdName);
    const tdQty = document.createElement('td');
    tdQty.textContent = item.quantity || 1;
    tr.appendChild(tdQty);
    const tdPrice = document.createElement('td');
    tdPrice.textContent = (symbols[item.currency] || '') + (item.price != null ? item.price.toLocaleString() : '');
    tr.appendChild(tdPrice);
    const tdTotal = document.createElement('td');
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    tdTotal.textContent = (symbols[item.currency] || '') + itemTotal.toLocaleString();
    tr.appendChild(tdTotal);
    // Sum totals by currency
    if (!totalsByCurrency[item.currency]) totalsByCurrency[item.currency] = 0;
    totalsByCurrency[item.currency] += itemTotal;
    tbody.appendChild(tr);
  });
  // Show all totals by currency
  cartTotalDiv.textContent = 'Cart Total: ' + Object.entries(totalsByCurrency).map(([cur, val]) => (symbols[cur] || cur) + val.toLocaleString() + ' ' + cur).join(' | ');
// End of renderCart
}
function renderCoupons() {
  reloadData();
  // ...implement your coupon rendering logic here if needed...
}

window.addEventListener('storage', function(e) {
  if (["products","cart","coupons"].includes(e.key)) {
    reloadData();
    renderProducts && renderProducts();
    renderCart && renderCart();
    renderCoupons && renderCoupons();
  }
});

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');

    const style = document.createElement('style');
    style.textContent = `
        .card {
            opacity: 0;
            transform: translateY(12px);
            transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .card.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);// Inject reveal animation styles
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = 70;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    // Reveal-on-scroll animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.card').forEach((el) => observer.observe(el));

    // Render cart summary on page load
    renderCart();

    // Order submission logic for inventory.html
    const orderForm = document.getElementById('orderForm');
    const orderFormMsg = document.getElementById('orderFormMsg');
    if (orderForm) {
      orderForm.onsubmit = async function(e) {
        e.preventDefault();
        orderFormMsg.textContent = '';
        // Collect form data
        const name = document.getElementById('orderName').value.trim();
        const email = document.getElementById('orderEmail').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        const currency = document.getElementById('orderCurrency').value;
        // Optionally validate fields here
        if (!name || !email || !phone || !currency) {
          orderFormMsg.textContent = 'Please fill in all fields.';
          orderFormMsg.style.color = '#c00';
          return;
        }
        // Send order to backend
        try {
          const res = await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currency })
          });
          const data = await res.json();
          if (res.ok && data.order_id) {
            orderFormMsg.textContent = 'Order completed! Your order ID is ' + data.order_id;
            orderFormMsg.style.color = 'green';
            // Optionally clear cart and form
            window.cart = [];
            localStorage.setItem('cart', '[]');
            renderCart();
            orderForm.reset();
          } else {
            orderFormMsg.textContent = data.error || 'Order failed.';
            orderFormMsg.style.color = '#c00';
          }
        } catch (err) {
          orderFormMsg.textContent = 'Order failed: ' + err.message;
          orderFormMsg.style.color = '#c00';
        }
      };
    }
});