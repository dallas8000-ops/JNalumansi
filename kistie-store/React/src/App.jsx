
import './App.css';

function App() {
  return (
    <>
      <header>
        <div className="header-content" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
          <h1 style={{fontSize:'2.2rem',fontWeight:700,marginBottom:'0.7rem',letterSpacing:'0.08em'}}>Kistie Store</h1>
          <nav style={{display:'flex',gap:'1.2rem',justifyContent:'center',marginBottom:'0.5rem'}}>
            <a href="/" className="nav-link">Home</a>
            <a href="/about.html" className="nav-link">About</a>
            <a href="/catalog-pro.html" className="nav-link">Catalog</a>
            <a href="/inventory.html" className="nav-link">Inventory</a>
            <button className="toggle-dark" id="themeToggle" title="Toggle dark mode" style={{fontSize:'1.3rem',padding:'0.2rem 0.7rem',borderRadius:'1.2rem',border:'none',background:'var(--nalumansi-toggle-bg)',color:'var(--nalumansi-toggle-text)',cursor:'pointer'}}>🌓</button>
          </nav>
        </div>
        {/* Hero Banner Image */}
        <div style={{width:'100%',maxHeight:'350px',overflow:'hidden',marginBottom:'1.5rem'}}>
          <img src="/images/blog.png" alt="Kistie Store Banner" style={{width:'100%',height:'350px',objectFit:'contain',background:'#222',display:'block',margin:'0 auto'}} />
        </div>
      </header>
      <main>
        <div className="container">
          {/* Product Gallery Section */}
          <section className="gallery" style={{margin:'2rem 0'}}>
            <h2 style={{textAlign:'center',fontSize:'1.5rem',fontWeight:600,marginBottom:'1.2rem'}}>Featured Products</h2>
            <div style={{display:'flex',flexWrap:'wrap',gap:'2rem',justifyContent:'center'}}>
              <div className="gallery-item" style={{maxWidth:'220px',textAlign:'center'}}>
                <img src="/images/Maroon Dress 1.jpg" alt="Maroon Dress" style={{width:'100%',borderRadius:'1rem',boxShadow:'0 2px 8px rgba(44,62,80,0.08)'}} />
                <p style={{marginTop:'0.5rem',fontWeight:500}}>Maroon Dress</p>
              </div>
              <div className="gallery-item" style={{maxWidth:'220px',textAlign:'center'}}>
                <img src="/images/Yellow Dress.jpg" alt="Yellow Dress" style={{width:'100%',borderRadius:'1rem',boxShadow:'0 2px 8px rgba(44,62,80,0.08)'}} />
                <p style={{marginTop:'0.5rem',fontWeight:500}}>Yellow Dress</p>
              </div>
              <div className="gallery-item" style={{maxWidth:'220px',textAlign:'center'}}>
                <img src="/images/Creambeige suit.jpeg" alt="Cream Beige Suit" style={{width:'100%',borderRadius:'1rem',boxShadow:'0 2px 8px rgba(44,62,80,0.08)'}} />
                <p style={{marginTop:'0.5rem',fontWeight:500}}>Cream Beige Suit</p>
              </div>
            </div>
          </section>
          <section className="hero" style={{marginTop:'2rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
            <div className="hero-content" style={{maxWidth:'600px',margin:'0 auto'}}>
              <h2 style={{fontSize:'1.7rem',fontWeight:600,marginBottom:'0.7rem'}}>Fashionably Sorted</h2>
              <p style={{fontSize:'1.1rem',marginBottom:'1.2rem'}}>Discover the latest trends and timeless styles at Kistie Store.</p>
              <a href="/catalog-pro.html" className="btn" style={{background:'var(--nalumansi-primary-accent)',color:'#fff',padding:'0.7rem 2rem',borderRadius:'2rem',fontWeight:600,textDecoration:'none',transition:'background 0.2s',boxShadow:'0 2px 8px rgba(44,62,80,0.08)'}}>View Catalog</a>
            </div>
          </section>
          <section className="highlights">
            <div className="highlight-card">
              <h3>Premium Quality</h3>
              <p>Handpicked fashion products for every occasion.</p>
            </div>
            <div className="highlight-card">
              <h3>Worldwide Delivery</h3>
              <p>Fast and reliable shipping to USA, UK, Uganda, Kenya, and more.</p>
            </div>
            <div className="highlight-card">
              <h3>Secure Payments</h3>
              <p>Pay with Card, Mobile Money (UG/Kenya), and more.</p>
            </div>
          </section>
          <section className="contact-section" id="contact">
            <h2>Contact Information</h2>
            <div className="contact-details">
              <p><strong>Business Name:</strong> Kistie Store</p>
              <p><strong>Tagline:</strong> Fashionably Sorted</p>
              <p><strong>Location:</strong> Prime Complex Building, Wilson Street, Kampala, Uganda</p>
              <p><strong>Phone:</strong> <a href="tel:+256704757198" style={{color:'var(--nalumansi-primary-accent)',textDecoration:'none'}}>+256 704 757198</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/256704757198" target="_blank" rel="noopener noreferrer" style={{color:'var(--nalumansi-primary-accent)',textDecoration:'none'}}>+256 704 757198</a></p>
            </div>
            <div className="social-links">
              <a href="#" title="Instagram"><span>Instagram</span></a>
              <a href="#" title="Facebook"><span>Facebook</span></a>
              <a href="#" title="Twitter"><span>Twitter</span></a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
