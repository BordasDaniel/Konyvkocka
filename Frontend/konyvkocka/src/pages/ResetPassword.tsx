import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiHttpError, confirmPasswordReset } from '../services/api';
import '../styles/login.css';

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const ResetPassword: React.FC = () => {
  const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim();
  const recaptchaWidgetId = useRef<number | null>(null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger'>('danger');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userIdParam = searchParams.get('userId');
  const token = (searchParams.get('token') ?? '').trim();
  const userId = userIdParam ? Number(userIdParam) : NaN;
  const hasValidLinkParams = Number.isInteger(userId) && userId > 0 && token.length > 0;

  // Get email from query params (display only)
  const emailFromQuery = searchParams.get('email') || '';

  useEffect(() => {
    if (!hasValidLinkParams) {
      setMessage('A jelszó-visszaállító link hiányos vagy érvénytelen. Kérj új linket a bejelentkezési oldalon.');
      setMessageType('danger');
    }
  }, [hasValidLinkParams]);

  useEffect(() => {
    if (!recaptchaSiteKey) return;

    // Load reCAPTCHA script
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    
    const loadRecaptcha = () => {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      
      // OnLoad callback to ensure grecaptcha is available
      (window as any).onRecaptchaLoad = () => {
        console.log('reCAPTCHA loaded');
      };
      
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };
    
    if (!existingScript) {
      return loadRecaptcha();
    }
  }, [recaptchaSiteKey]);

  useEffect(() => {
    if (!recaptchaSiteKey) return;

    // Render reCAPTCHA with retry logic
    let retryCount = 0;
    const maxRetries = 10;
    
    const tryRenderCaptcha = () => {
      if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.render) {
        const container = document.getElementById('recaptcha-container-register');
        
        if (container && container.childElementCount === 0) {
          try {
            const widgetId = window.grecaptcha.render('recaptcha-container-register', {
              'sitekey': recaptchaSiteKey
            });
            recaptchaWidgetId.current = widgetId;
            console.log('reCAPTCHA rendered');
          } catch (e) {
            console.log('reCAPTCHA render error:', e);
          }
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryRenderCaptcha, 200);
      }
    };
    
    const timer = setTimeout(tryRenderCaptcha, 100);
    return () => clearTimeout(timer);
  }, [recaptchaSiteKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!hasValidLinkParams) {
      setMessage('A jelszó-visszaállító link hiányos vagy érvénytelen. Kérj új linket a bejelentkezési oldalon.');
      setMessageType('danger');
      return;
    }

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

    // reCAPTCHA validation (optional)
    if (recaptchaSiteKey) {
      if (typeof window.grecaptcha === 'undefined') {
        setMessage('A robotvédelem még nem töltődött be. Próbáld meg újra pár másodperc múlva.');
        setMessageType('danger');
        return;
      }

      const widgetId = recaptchaWidgetId.current;
      const recaptchaResponse = widgetId !== null ? window.grecaptcha.getResponse(widgetId) : '';
      if (recaptchaResponse.length === 0) {
        setMessage('Kérlek, erősítsd meg, hogy nem vagy robot!');
        setMessageType('danger');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await confirmPasswordReset({
        userId: Number(userId),
        token,
        plainPassword: newPassword,
      });

      setMessage(response.message || 'A jelszó sikeresen megváltozott. Most bejelentkezhetsz az új jelszóval.');
      setMessageType('success');

      if (
        typeof window.grecaptcha !== 'undefined' &&
        typeof window.grecaptcha.reset === 'function' &&
        recaptchaWidgetId.current !== null
      ) {
        try {
          window.grecaptcha.reset(recaptchaWidgetId.current);
        } catch {
          // noop
        }
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/belepes');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof ApiHttpError && typeof error.message === 'string' && error.message.trim().length > 0
          ? error.message
          : 'A jelszó módosítása nem sikerült. Kérlek, kérj új visszaállító linket.';

      setMessage(errorMessage);
      setMessageType('danger');
    } finally {
      setIsSubmitting(false);
    }

    // Reset captcha after submit attempt
    if (
      recaptchaSiteKey &&
      typeof window.grecaptcha !== 'undefined' &&
      typeof window.grecaptcha.reset === 'function' &&
      recaptchaWidgetId.current !== null
    ) {
      try {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      } catch {
        // noop
      }
    }
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
                      value={emailFromQuery || 'nincs megadva'}
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
                    {recaptchaSiteKey ? (
                      <div id="recaptcha-container-register"></div>
                    ) : (
                      <small className="text-warning">A reCAPTCHA nincs konfigurálva (VITE_RECAPTCHA_SITE_KEY).</small>
                    )}
                  </div>

                  {message && (
                    <div id="messageBox" className="mb-3" aria-live="polite">
                      <div className={`alert alert-${messageType}`}>{message}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-kk w-100 text-white"
                    disabled={isSubmitting || !hasValidLinkParams}
                  >
                    {isSubmitting ? 'Mentés...' : 'Jelszó mentése'}
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
