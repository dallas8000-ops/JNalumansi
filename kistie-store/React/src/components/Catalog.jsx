// src/components/Catalog.jsx
import React from 'react';
import products from '../data/products';

const Catalog = () => (
  <div className="container py-4">
    <h2 className="mb-4 text-center">Catalog</h2>
    <div className="row g-4 justify-content-center">
      {products.map(product => (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.id}>
          <div className="card h-100 shadow-sm">
            <img src={product.image} className="card-img-top" alt={product.name} style={{objectFit:'cover',height:'220px'}} />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text fw-bold mb-2">€{product.basePrice.toFixed(2)}</p>
              <button className="btn btn-primary mt-auto" disabled>View Details</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Catalog;
