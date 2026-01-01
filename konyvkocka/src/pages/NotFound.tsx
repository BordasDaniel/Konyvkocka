import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Az oldal nem található | KönyvKocka';
  }, []);

  return (
    <main className="d-flex align-items-center justify-content-center mt-5 pt-4" style={{ 
      minHeight: '80vh',
      background: 'transparent'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center p-4" style={{
              background: 'rgba(12, 10, 8, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(194, 157, 89, 0.15)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              {/* 404 Icon */}
              <div className="mb-3">
                <i className="bi bi-book" style={{ 
                  fontSize: '4.5rem', 
                  color: 'var(--secondary)'
                }}></i>
              </div>

              {/* 404 Number */}
              <h1 className="display-1 fw-bold mb-3" style={{
                fontSize: 'clamp(4rem, 12vw, 6rem)',
                color: 'var(--secondary)',
                letterSpacing: '0.1em'
              }}>
                404
              </h1>

              {/* Message */}
              <h2 className="h5 mb-3" style={{ color: 'var(--h1Text)' }}>Az oldal nem található</h2>
              <p className="mb-4" style={{ 
                color: 'rgba(224, 224, 224, 0.7)',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Úgy tűnik, eltévedtél a könyvek és filmek világában.<br />
                Az általad keresett oldal nem létezik vagy átköltözött.
              </p>

              {/* Action Button */}
              <div className="mb-4">
                <Link to="/" className="btn px-5 py-2" style={{
                  background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(194, 157, 89, 0.25)',
                  transition: 'all 0.3s ease'
                }}>
                  <i className="bi bi-house-door me-2"></i>
                  VISSZA A FŐOLDALRA
                </Link>
              </div>

              {/* Additional Help */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p className="small mb-2" style={{ color: 'rgba(224, 224, 224, 0.5)' }}>Segíthetünk?</p>
                <Link to="/tamogatas" className="text-decoration-none" style={{ 
                  color: 'var(--secondary)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}>
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