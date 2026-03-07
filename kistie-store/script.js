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
  fetch('http://127.0.0.1:3000/api/products', { credentials: 'include' })
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
        editBtn.onclick = function() { editProduct(idx); };
        tdAction.appendChild(editBtn);
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '0.5rem';
        removeBtn.onclick = function() { removeProduct(idx); };
        tdAction.appendChild(removeBtn);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
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

// Edit product handler (simple prompt-based for now)
function editProduct(idx) {
  const product = window.products[idx];
  const newName = prompt('Edit product name:', product.name);
  if (newName === null) return;
  const newPrice = prompt('Edit product price:', product.price);
  if (newPrice === null) return;
  const newImage = prompt('Edit image URL:', product.image || '');
  if (newName.trim() === '' || isNaN(Number(newPrice))) {
    alert('Invalid input.');
    return;
  }
  // Update product via backend API
  fetch(`http://127.0.0.1:3000/api/products/${product.id || product._id || idx}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName, price: Number(newPrice), image: newImage })
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    })
    .then(() => renderProducts())
    .catch(err => alert('Error updating product: ' + err.message));
}

// Remove product handler
function removeProduct(idx) {
  if (!confirm('Remove this product?')) return;
  const product = window.products[idx];
  fetch(`http://127.0.0.1:3000/api/products/${product.id || product._id || idx}`, {
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
      fetch('http://127.0.0.1:3000/api/products', {
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
function renderCart() {
  reloadData();
  // ...implement your cart rendering logic here if needed...
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
});