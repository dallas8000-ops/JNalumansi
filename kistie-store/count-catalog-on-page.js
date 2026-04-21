// count-catalog-on-page.js
// Run this in the browser console or inject into catalog.html for debugging
(function() {
  const grid = document.getElementById('productGrid');
  if (!grid) { console.log('No product grid found.'); return; }
  const count = grid.children.length;
  console.log('Catalog items on page:', count);
})();
