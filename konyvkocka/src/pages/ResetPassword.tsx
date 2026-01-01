import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/login.css';

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const ResetPassword: React.FC = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger'>('danger');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Render reCAPTCHA
    const timer = setTimeout(() => {
      if (typeof window.grecaptcha !== 'undefined') {
        const container = document.getElementById('recaptcha-container-register');
        if (container && container.childElementCount === 0) {
          try {
            window.grecaptcha.render('recaptcha-container-register', {
              'sitekey': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Test key
            });
          } catch (e) {
            // Already rendered
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Get email from query params
  const emailFromQuery = searchParams.get('email') || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const emailHidden = (document.getElementById('emailHidden') as HTMLInputElement)?.value.trim();
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;

    if (!newPassword || !confirmPassword) {
      setMessage('Kérlek töltsd ki mindkét jelszó mezőt.');
      setMessageType('danger');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('A jelszónak legalább 8 karakter hosszúnak kell lennie.');
      setMessageType('danger');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('A két jelszó nem egyezik.');
      setMessageType('danger');
      return;
    }

    // reCAPTCHA validation
    if (typeof window.grecaptcha !== 'undefined') {
      const recaptchaResponse = window.grecaptcha.getResponse();
      if (recaptchaResponse.length === 0) {
        setMessage('Kérlek, erősítsd meg, hogy nem vagy robot!');
        setMessageType('danger');
        return;
      }
    }

    // Simulated success
    setMessage('A jelszó sikeresen megváltozott. Most bejelentkezhetsz az új jelszóval.');
    setMessageType('success');

    // Reset captcha
    if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.reset === 'function') {
      try {
        window.grecaptcha.reset();
      } catch (e) {
        // noop
      }
    }

    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/belepes');
    }, 2000);
  };

  const togglePassword = (field: 'newPassword' | 'confirmPassword') => {
    if (field === 'newPassword') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
    // Remove focus from button after click
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <section className="my-5 pt-3">
      <div className="container mt-5 pt-5 login-container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-light login-card">
              <div className="card-body about-panel">
                <h3 className="card-title text-center mb-4 fw-bold text-decoration-underline">
                  Új jelszó megadása
                </h3>
                <form onSubmit={handleSubmit}>
                  <p className="text-center mb-2">
                    A következő e-mail címhez állítod be az új jelszót. A mező csak tájékoztató jellegű és le van tiltva.
                  </p>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">Email cím</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="email@domain.hu"
                      value={emailFromQuery || 'ismeretlen@pelda.hu'}
                      disabled
                    />
                    <input
                      type="hidden"
                      id="emailHidden"
                      name="email"
                      value={emailFromQuery}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-bold">Új jelszó</label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control"
                        id="newPassword"
                        placeholder="Írd be az új jelszavad"
                        minLength={8}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        aria-label="Jelszó megjelenítése"
                        onClick={() => togglePassword('newPassword')}
                      >
                        <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-bold">
                      Jelszó megerősítése
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Írd be újra az új jelszavad"
                        minLength={8}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        aria-label="Jelszó megerősítése megjelenítése"
                        onClick={() => togglePassword('confirmPassword')}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 d-flex justify-content-center">
                    <div id="recaptcha-container-register"></div>
                  </div>

                  {message && (
                    <div id="messageBox" className="mb-3" aria-live="polite">
                      <div className={`alert alert-${messageType}`}>{message}</div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-kk w-100 text-white">
                    Jelszó mentése
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
