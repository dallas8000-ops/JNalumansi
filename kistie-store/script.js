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
      if (isLoggedIn) {
        loginMsg.style.color = 'green';
        loginMsg.textContent = 'Logged in as admin.';
        usernameInput.style.display = 'none';
        passwordInput.style.display = 'none';
        loginForm.querySelector('button[type="submit"]').style.display = 'none';
        logoutBtn.style.display = '';
        if (productSection) {
          productSection.style.display = '';
          renderProducts();
        }
      } else {
        loginMsg.style.color = '#c00';
        loginMsg.textContent = '';
        usernameInput.style.display = '';
        passwordInput.style.display = '';
        loginForm.querySelector('button[type="submit"]').style.display = '';
        logoutBtn.style.display = 'none';
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
  let totalUSD = 0;
  // Default to USD if not set
  let selectedCurrency = 'USD';
  const currencySelect = document.getElementById('orderCurrency');
  if (currencySelect) {
    selectedCurrency = currencySelect.value;
  }
  // Conversion rates (update as needed)
  // Live rates (default fallback)
  let rates = { USD: 1, UGX: 3695, KES: 129, EUR: 0.85 };
  if (window.liveRates) {
    rates = window.liveRates;
  }
  // Fetch live currency rates and update window.liveRates
  async function fetchLiveRates() {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=USD,UGX,KES,EUR');
      const data = await res.json();
      if (data && data.rates) {
        window.liveRates = data.rates;
        window.liveRates.USD = 1; // Ensure USD is always 1
        // Re-render cart with new rates
        renderCart();
      }
    } catch (e) {
      // Ignore errors, fallback to static rates
    }
  }
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
  window.cart.forEach(item => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = item.name || '';
    tr.appendChild(tdName);
    const tdQty = document.createElement('td');
    tdQty.textContent = item.quantity || 1;
    tr.appendChild(tdQty);
    const tdPrice = document.createElement('td');
    // Always show price in USD for base, convert for display
    tdPrice.textContent = symbols[selectedCurrency] + ((item.price || 0) * rates[selectedCurrency]).toLocaleString();
    tr.appendChild(tdPrice);
    const tdTotal = document.createElement('td');
    const itemTotalUSD = (item.price || 0) * (item.quantity || 1);
    tdTotal.textContent = symbols[selectedCurrency] + (itemTotalUSD * rates[selectedCurrency]).toLocaleString();
    tr.appendChild(tdTotal);
    totalUSD += itemTotalUSD;
    tbody.appendChild(tr);
  });
  cartTotalDiv.textContent = 'Cart Total: ' + symbols[selectedCurrency] + (totalUSD * rates[selectedCurrency]).toLocaleString();
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

    // Fetch live currency rates on page load
    fetchLiveRates();
});