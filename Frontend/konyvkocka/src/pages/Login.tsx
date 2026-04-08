import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiHttpError, requestPasswordResetEmail } from '../services/api';
import '../styles/login.css';

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

type FormType = 'login' | 'register' | 'forgot';
type LoginFeedbackIcon = 'error' | 'email';

const Login: React.FC = () => {
  const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim();
  const loginRecaptchaWidgetId = useRef<number | null>(null);
  const registerRecaptchaWidgetId = useRef<number | null>(null);

  const [formType, setFormType] = useState<FormType>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginErrorModal, setLoginErrorModal] = useState<{ open: boolean; title: string; message: string; icon: LoginFeedbackIcon }>({
    open: false,
    title: '',
    message: '',
    icon: 'error',
  });
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  const openLoginErrorModal = (title: string, message: string) => {
    setLoginErrorModal({ open: true, title, message, icon: 'error' });
  };

  const openEmailInfoModal = (title: string, message: string) => {
    setLoginErrorModal({
      open: true,
      title,
      message,
      icon: 'email',
    });
  };

  const closeLoginErrorModal = () => {
    setLoginErrorModal({ open: false, title: '', message: '', icon: 'error' });
  };

  // Ha már be van jelentkezve, irányítsuk át a profil oldalra
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profil');
    }
  }, [isAuthenticated, navigate]);

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

    // Render reCAPTCHA when form changes with retry logic
    let retryCount = 0;
    const maxRetries = 10;
    
    const tryRenderCaptcha = () => {
      if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.render) {
        const containerId = formType === 'register' ? 'recaptcha-container-register' : 'recaptcha-container';
        const container = document.getElementById(containerId);
        
        if (container && container.childElementCount === 0) {
          try {
            const widgetId = window.grecaptcha.render(containerId, {
              'sitekey': recaptchaSiteKey
            });
            if (containerId === 'recaptcha-container-register') {
              registerRecaptchaWidgetId.current = widgetId;
            } else {
              loginRecaptchaWidgetId.current = widgetId;
            }
            console.log('reCAPTCHA rendered for', formType);
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
  }, [formType, recaptchaSiteKey]);

  useEffect(() => {
    if (!loginErrorModal.open) return;

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLoginErrorModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [loginErrorModal.open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaSiteKey) {
      openLoginErrorModal('Sikertelen bejelentkezés', 'A reCAPTCHA nincs beállítva. Kérlek, add meg a VITE_RECAPTCHA_SITE_KEY értékét.');
      return;
    }
    
    // reCAPTCHA validation
    if (typeof window.grecaptcha === 'undefined') {
      openLoginErrorModal('Sikertelen bejelentkezés', 'A robotvédelem még nem töltődött be. Próbáld meg újra pár másodperc múlva.');
      return;
    }

    const widgetId = loginRecaptchaWidgetId.current;
    const recaptchaResponse = widgetId !== null ? window.grecaptcha.getResponse(widgetId) : '';
    if (recaptchaResponse.length === 0) {
      openLoginErrorModal('Sikertelen bejelentkezés', 'Kérlek, erősítsd meg, hogy nem vagy robot.');
      return;
    }

    // Login logic
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (email && password) {
      setIsSubmitting(true);
      const result = await login(email, password);
      setIsSubmitting(false);
      
      if (result.success) {
        navigate('/profil');
      } else {
        if (result.reason === 'suspended') {
          openLoginErrorModal('Sikertelen bejelentkezés', 'A felhasználói fiókod fel van függesztve. Kérlek, vedd fel a kapcsolatot az ügyfélszolgálattal.');
        } else if (result.reason === 'unverified') {
          openLoginErrorModal('Fiók aktiválása szükséges', 'A belépéshez előbb aktiváld a fiókodat az emailben kapott megerősítő linkkel.');
        } else {
          openLoginErrorModal('Sikertelen bejelentkezés', result.message);
        }
      }
    } else {
      openLoginErrorModal('Sikertelen bejelentkezés', 'Kérlek, töltsd ki az összes mezőt.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaSiteKey) {
      alert('A reCAPTCHA nincs beállítva. Kérlek, add meg a VITE_RECAPTCHA_SITE_KEY értékét.');
      return;
    }

    // reCAPTCHA validation
    if (typeof window.grecaptcha === 'undefined') {
      alert('A robotvédelem még nem töltődött be. Próbáld meg újra pár másodperc múlva.');
      return;
    }

    const widgetId = registerRecaptchaWidgetId.current;
    const recaptchaResponse = widgetId !== null ? window.grecaptcha.getResponse(widgetId) : '';
    if (recaptchaResponse.length === 0) {
      alert('Kérlek, erősítsd meg, hogy nem vagy robot!');
      return;
    }

    // Registration logic
    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;

    if (password !== confirmPassword) {
      alert('A két jelszó nem egyezik!');
      return;
    }

    if (username && email && password && confirmPassword) {
      setIsSubmitting(true);
      const result = await register(username, email, password);
      setIsSubmitting(false);
      
      if (result.success) {
        setFormType('login');
        openEmailInfoModal('Erősítsd meg az email címed', result.message);
      } else {
        alert(result.message);
      }
    } else {
      alert('Kérlek, töltsd ki az összes mezőt!');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (!email || email.trim().length === 0) {
      openLoginErrorModal('Hiányzó email cím', 'Kérlek, add meg az email címed!');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestPasswordResetEmail(email.trim());
      setFormType('login');
      openEmailInfoModal('Jelszó-visszaállítás', response.message);
    } catch (error) {
      const message =
        error instanceof ApiHttpError && typeof error.message === 'string' && error.message.trim().length > 0
          ? error.message
          : 'A jelszó-visszaállítási kérés nem sikerült. Kérlek, próbáld újra.';

      openLoginErrorModal('Sikertelen kérés', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
    // Remove focus from button after click to prevent hover state persistence
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
              <div className="card-body">
                {formType === 'login' && (
                  <>
                    <h3 className="card-title text-center mb-4 fw-bold text-decoration-underline">Bejelentkezés</h3>
                    <form onSubmit={handleLogin}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-bold">Email cím</label>
                        <input type="email" className="form-control" id="email" placeholder="Írd be az email címed" required />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-bold">Jelszó</label>
                        <div className="input-group">
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            className="form-control" 
                            id="password" 
                            placeholder="Írd be a jelszavad" 
                            required 
                          />
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button" 
                            aria-label="Jelszó megjelenítése" 
                            onClick={() => togglePassword('password')}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">Emlékezz rám</label>
                      </div>
                      <div className="mb-3 d-flex justify-content-center">
                        {recaptchaSiteKey ? (
                          <div id="recaptcha-container"></div>
                        ) : (
                          <small className="text-warning">A reCAPTCHA nincs konfigurálva (VITE_RECAPTCHA_SITE_KEY).</small>
                        )}
                      </div>
                      <button type="submit" className="btn btn-primary w-100 text-white" disabled={isSubmitting}>
                        {isSubmitting ? 'Bejelentkezés...' : 'Bejelentkezés'}
                      </button>
                    </form>
                    <div className="text-center form-change-links mt-3">
                      <a href="#" onClick={(e) => { e.preventDefault(); setFormType('forgot'); }} className="text-light">Elfelejtetted a jelszavad?</a>
                      <br />
                      <a href="#" onClick={(e) => { e.preventDefault(); setFormType('register'); }} className="text-light">Nincs még fiókod? Regisztrálj!</a>
                    </div>
                  </>
                )}

                {formType === 'register' && (
                  <>
                    <h3 className="card-title text-center mb-4 fw-bold text-decoration-underline">Regisztráció</h3>
                    <form onSubmit={handleRegister}>
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label fw-bold">Felhasználónév</label>
                        <input type="text" className="form-control" id="username" placeholder="Írd be a felhasználóneved" required />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-bold">Email cím</label>
                        <input type="email" className="form-control" id="email" placeholder="Írd be az email címed" required />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-bold">Jelszó</label>
                        <div className="input-group">
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            className="form-control" 
                            id="password" 
                            placeholder="Írd be a jelszavad" 
                            required 
                          />
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button" 
                            aria-label="Jelszó megjelenítése" 
                            onClick={() => togglePassword('password')}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label fw-bold">Jelszó megerősítése</label>
                        <div className="input-group">
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            className="form-control" 
                            id="confirmPassword" 
                            placeholder="Írd be újra a jelszavad" 
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
                      <button type="submit" className="btn btn-primary w-100 text-white">Regisztráció</button>
                    </form>
                    <div className="text-center form-change-links mt-3">
                      <a href="#" onClick={(e) => { e.preventDefault(); setFormType('forgot'); }} className="text-light">Elfelejtetted a jelszavad?</a>
                      <br />
                      <a href="#" onClick={(e) => { e.preventDefault(); setFormType('login'); }} className="text-light">Már van fiókod? Jelentkezz be!</a>
                    </div>
                  </>
                )}

                {formType === 'forgot' && (
                  <>
                    <h3 className="card-title text-center mb-4 fw-bold text-decoration-underline">Jelszó visszaállítása</h3>
                    <form onSubmit={handleForgotPassword}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-bold">Email cím</label>
                        <input type="email" className="form-control" id="email" placeholder="Írd be az email címed" required />
                      </div>
                      <button type="submit" className="btn btn-primary w-100 text-white" disabled={isSubmitting}>
                        {isSubmitting ? 'Küldés...' : 'Jelszó visszaállítása'}
                      </button>
                    </form>
                    <div className="text-center form-change-links mt-3">
                      <a href="#" onClick={(e) => { e.preventDefault(); setFormType('register'); }} className="text-light">Még nincs fiókod? Regisztrálj!</a>
                      <br />
                      <a href="#" onClick={(e) => { e.preventDefault(); setFormType('login'); }} className="text-light">Már van fiókod? Jelentkezz be!</a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loginErrorModal.open && (
        <div className="login-error-modal-backdrop" onClick={closeLoginErrorModal}>
          <div
            className="login-error-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-feedback-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`login-error-modal-icon ${
                loginErrorModal.icon === 'email'
                  ? 'login-error-modal-icon--email'
                  : 'login-error-modal-icon--error'
              }`}
              aria-hidden="true"
            >
              <i className={`bi ${loginErrorModal.icon === 'email' ? 'bi-envelope-check-fill' : 'bi-x-circle'}`}></i>
            </div>
            <h4 id="login-feedback-title">{loginErrorModal.title}</h4>
            <p>{loginErrorModal.message}</p>
            <button type="button" className="btn btn-primary text-white" onClick={closeLoginErrorModal}>
              Rendben
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Login;
