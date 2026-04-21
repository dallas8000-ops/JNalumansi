// run-productGrid-count.js
// This script will print the number of product cards in the catalog grid when run in the browser console
(function() {
  const grid = document.getElementById('productGrid');
  if (!grid) {
    console.log('No product grid found.');
    return;
  }
  console.log('Catalog items on page:', grid.children.length);
})();
