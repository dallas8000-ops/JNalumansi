

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';



import Catalog from './components/Catalog';
import Inventory from './components/Inventory';
import { CartProvider } from './context/CartContext';
import Cart from './components/Cart';
function Home() {
  return (
    <div className="container py-4">
      <header className="mb-4">
        <div className="text-center">
          <h1 className="display-4 fw-bold mb-3">Kistie Store</h1>
          <img src="/images/blog.png" alt="Kistie Store Banner" className="img-fluid rounded mb-3" style={{maxHeight:'350px',objectFit:'contain',background:'#222',margin:'0 auto'}} />
        </div>
      </header>
      <section className="gallery mb-5">
        <h2 className="text-center mb-4">Featured Products</h2>
        <div className="row justify-content-center g-4">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="gallery-item text-center">
              <img src="/images/Maroon Dress 1.jpg" alt="Maroon Dress" className="img-fluid rounded shadow-sm mb-2" />
              <p className="fw-semibold">Maroon Dress</p>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="gallery-item text-center">
              <img src="/images/Yellow Dress.jpg" alt="Yellow Dress" className="img-fluid rounded shadow-sm mb-2" />
              <p className="fw-semibold">Yellow Dress</p>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="gallery-item text-center">
              <img src="/images/Creambeige suit.jpeg" alt="Cream Beige Suit" className="img-fluid rounded shadow-sm mb-2" />
              <p className="fw-semibold">Cream Beige Suit</p>
            </div>
          </div>
        </div>
      </section>
      <section className="hero text-center mb-5">
        <div className="mx-auto" style={{maxWidth:'600px'}}>
          <h2 className="fw-bold mb-3">Fashionably Sorted</h2>
          <p className="mb-4">Discover the latest trends and timeless styles at Kistie Store.</p>
          <Link to="/catalog" className="btn btn-primary btn-lg px-4">View Catalog</Link>
        </div>
      </section>
      <section className="row text-center mb-5">
        <div className="col-md-4 mb-3">
          <div className="p-3 bg-light rounded shadow-sm h-100">
            <h3 className="h5 fw-bold">Premium Quality</h3>
            <p>Handpicked fashion products for every occasion.</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="p-3 bg-light rounded shadow-sm h-100">
            <h3 className="h5 fw-bold">Worldwide Delivery</h3>
            <p>Fast and reliable shipping to USA, UK, Uganda, Kenya, and more.</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="p-3 bg-light rounded shadow-sm h-100">
            <h3 className="h5 fw-bold">Secure Payments</h3>
            <p>Pay with Card, Mobile Money (UG/Kenya), and more.</p>
          </div>
        </div>
      </section>
      <section className="contact-section text-center">
        <h2 className="mb-3">Contact Information</h2>
        <div className="mb-2"><strong>Business Name:</strong> Kistie Store</div>
        <div className="mb-2"><strong>Tagline:</strong> Fashionably Sorted</div>
        <div className="mb-2"><strong>Location:</strong> Prime Complex Building, Wilson Street, Kampala, Uganda</div>
        <div className="mb-2"><strong>Phone:</strong> <a href="tel:+256704757198" className="text-primary text-decoration-none">+256 704 757198</a></div>
        <div className="mb-2"><strong>WhatsApp:</strong> <a href="https://wa.me/256704757198" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">+256 704 757198</a></div>
        <div className="mt-3">
          <a href="#" className="me-3">Instagram</a>
          <a href="#" className="me-3">Facebook</a>
          <a href="#">Twitter</a>
        </div>
      </section>
    </div>
  );
}

function About() {
  return (
    <div className="container py-5" style={{maxWidth:'700px'}}>
      <h2 className="mb-4 text-center">About Kistie Store</h2>
      <p className="lead text-center mb-4">
        <strong>Kistie Store</strong> is your destination for handpicked, high-quality fashion products for every occasion. We believe in empowering our customers with the latest trends and timeless styles, offering a curated selection of clothing and accessories that combine elegance, comfort, and affordability.
      </p>
      <div className="mb-4">
        <h4 className="fw-bold">Our Mission</h4>
        <p>
          To inspire confidence and self-expression by providing fashionable, premium-quality products and exceptional customer service. We are committed to making style accessible to everyone, everywhere.
        </p>
      </div>
      <div className="mb-4">
        <h4 className="fw-bold">Contact Information</h4>
        <ul className="list-unstyled mb-0">
          <li><strong>Business Name:</strong> Kistie Store</li>
          <li><strong>Tagline:</strong> Fashionably Sorted</li>
          <li><strong>Location:</strong> Prime Complex Building, Wilson Street, Kampala, Uganda</li>
          <li><strong>Phone:</strong> <a href="tel:+256704757198" className="text-primary text-decoration-none">+256 704 757198</a></li>
          <li><strong>WhatsApp:</strong> <a href="https://wa.me/256704757198" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">+256 704 757198</a></li>
        </ul>
      </div>
      <div className="text-center">
        <a href="#" className="me-3">Instagram</a>
        <a href="#" className="me-3">Facebook</a>
        <a href="#">Twitter</a>
      </div>
    </div>
  );
}


function Layout({ children }) {
  return (
    <>
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 py-3">
        <div className="container justify-content-center">
          <div className="w-100 d-flex flex-column align-items-center">
            <Link className="navbar-brand fw-bold text-center mb-2" to="/" style={{fontSize:'2.2rem', letterSpacing: '0.04em', lineHeight: 1}}>Kistie Store</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
              <ul className="navbar-nav d-flex flex-row justify-content-center align-items-center gap-3" style={{fontSize:'1.15rem', fontWeight:500}}>
                <li className="nav-item"><Link className="nav-link px-3" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/about">About</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/catalog">Catalog</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/inventory">Inventory</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/cart">Cart</Link></li>
                <li className="nav-item"><Link className="nav-link px-3" to="/inventory">Admin DB</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow-1">
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-dark text-light text-center py-3 mt-5">
        <div>Kistie Store &copy; {new Date().getFullYear()} &mdash; Fashionably Sorted</div>
      </footer>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Navigate to="/inventory" replace />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
