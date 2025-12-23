import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center p-5" style={{
              background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9), rgba(10, 10, 10, 0.7))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              {/* 404 Icon */}
              <div className="mb-4">
                <i className="bi bi-book" style={{ 
                  fontSize: '5rem', 
                  color: 'rgba(255, 167, 38, 0.8)',
                  filter: 'drop-shadow(0 0 20px rgba(255, 167, 38, 0.3))'
                }}></i>
              </div>

              {/* 404 Number */}
              <h1 className="display-1 fw-bold mb-3" style={{
                background: 'linear-gradient(135deg, #ffa726, #ff7043)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(255, 167, 38, 0.2)'
              }}>
                404
              </h1>

              {/* Message */}
              <h2 className="h4 mb-3 text-light">Az oldal nem található</h2>
              <p className="text-muted mb-4">
                Úgy tűnik, eltévedtél a könyvek és filmek világában. 
                Az általad keresett oldal nem létezik vagy átköltözött.
              </p>

              {/* Action Buttons */}
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/" className="btn btn-primary px-4 py-2">
                  <i className="bi bi-house-door me-2"></i>
                  Vissza a főoldalra
                </Link>
                <Link to="/search" className="btn btn-action px-4 py-2">
                  <i className="bi bi-search me-2"></i>
                  Keresés
                </Link>
              </div>

              {/* Additional Help */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p className="small text-muted mb-2">Segíthetünk?</p>
                <Link to="/support" className="text-decoration-none" style={{ color: 'rgba(255, 167, 38, 0.9)' }}>
                  <i className="bi bi-question-circle me-1"></i>
                  Támogatás
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}