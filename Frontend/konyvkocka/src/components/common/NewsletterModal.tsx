import { useState, useEffect } from 'react';
import '../../styles/newsletter.css';

const COOKIE_NAME = 'newsletter_dismissed';
const COOKIE_DAYS = 90; // 90 napig ne jelenjen meg újra

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function NewsletterModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Ha nincs cookie, kis késleltetéssel jelenjen meg
    if (!getCookie(COOKIE_NAME)) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Body scroll lock – overflow:hidden html+body-n, position:fixed nélkül
  useEffect(() => {
    if (visible) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      };
    }
  }, [visible]);

  // ESC billentyű
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Kérjük, add meg az e-mail címed!');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Kérjük, adj meg egy érvényes e-mail címet!');
      return;
    }

    setError('A hírlevél-feliratkozás jelenleg nem érhető el. Kérjük, próbáld meg később.');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('newsletter-overlay')) {
      handleClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="newsletter-overlay" onClick={handleBackdropClick}>
      <div className="newsletter-modal">
        {/* Bezárás gomb */}
        <button className="newsletter-close" onClick={handleClose} aria-label="Bezárás">
          <i className="bi bi-x-lg"></i>
        </button>

        <>
            {/* Ikon */}
            <div className="newsletter-icon">
              <i className="bi bi-envelope-paper-heart-fill"></i>
            </div>

            {/* Cím */}
            <h2 className="newsletter-title">Iratkozz fel a hírlevelünkre!</h2>

            {/* Leírás */}
            <p className="newsletter-desc">
              Légy az elsők között, akik értesülnek a legújabb könyvekről, filmekről és sorozatokról!
              Exkluzív ajánlatok, kedvezmények és különleges tartalmak várnak rád.
            </p>

            {/* Features */}
            <ul className="newsletter-perks">
              <li>
                <i className="bi bi-bell-fill"></i>
                Értesítés új megjelenésekről
              </li>
              <li>
                <i className="bi bi-gift-fill"></i>
                Exkluzív kedvezmények és akciók
              </li>
              <li>
                <i className="bi bi-star-fill"></i>
                Személyre szabott ajánlások
              </li>
            </ul>

            {/* Form */}
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Add meg az e-mail címed..."
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoFocus
                />
                <button type="submit" className="newsletter-submit">
                  <i className="bi bi-send-fill me-1"></i>
                  Feliratkozás
                </button>
              </div>
              {error && <p className="newsletter-error">{error}</p>}
            </form>

            {/* Apróbetűs */}
            <p className="newsletter-hint">
              <i className="bi bi-shield-lock-fill me-1"></i>
              Bármikor leiratkozhatsz. Adataidat bizalmasan kezeljük.
            </p>
        </>
      </div>
    </div>
  );
}
