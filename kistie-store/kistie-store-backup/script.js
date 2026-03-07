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
  reloadData();
  // ...implement your product rendering logic here if needed...
}
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