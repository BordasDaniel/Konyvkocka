import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

type FormType = 'login' | 'register' | 'forgot';

const Login: React.FC = () => {
  const [formType, setFormType] = useState<FormType>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  // Ha már be van jelentkezve, irányítsuk át a profil oldalra
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user');
    }
  }, [isAuthenticated, navigate]);

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
    // Render reCAPTCHA when form changes
    const timer = setTimeout(() => {
      if (typeof window.grecaptcha !== 'undefined') {
        const containerId = formType === 'register' ? 'recaptcha-container-register' : 'recaptcha-container';
        const container = document.getElementById(containerId);
        if (container && container.childElementCount === 0) {
          try {
            window.grecaptcha.render(containerId, {
              'sitekey': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Test key
            });
          } catch (e) {
            // Already rendered
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [formType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // reCAPTCHA validation
    if (typeof window.grecaptcha !== 'undefined') {
      const recaptchaResponse = window.grecaptcha.getResponse();
      if (recaptchaResponse.length === 0) {
        alert('Kérlek, erősítsd meg, hogy nem vagy robot!');
        return;
      }
    }

    // Login logic
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (email && password) {
      setIsSubmitting(true);
      const success = await login(email, password);
      setIsSubmitting(false);
      
      if (success) {
        navigate('/user');
      } else {
        alert('Sikertelen bejelentkezés! Ellenőrizd az adataidat.');
      }
    } else {
      alert('Kérlek, töltsd ki az összes mezőt!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // reCAPTCHA validation
    if (typeof window.grecaptcha !== 'undefined') {
      const recaptchaResponse = window.grecaptcha.getResponse(1);
      if (recaptchaResponse.length === 0) {
        alert('Kérlek, erősítsd meg, hogy nem vagy robot!');
        return;
      }
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
      const success = await register(username, email, password);
      setIsSubmitting(false);
      
      if (success) {
        navigate('/user');
      } else {
        alert('Sikertelen regisztráció! Próbáld újra.');
      }
    } else {
      alert('Kérlek, töltsd ki az összes mezőt!');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (email) {
      alert('Jelszó visszaállítási link elküldve!');
    } else {
      alert('Kérlek, add meg az email címed!');
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
                        <div id="recaptcha-container"></div>
                      </div>
                      <button type="submit" className="btn btn-primary w-100 text-white">Bejelentkezés</button>
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
                        <div id="recaptcha-container-register"></div>
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
                      <button type="submit" className="btn btn-primary w-100 text-white">Jelszó visszaállítása</button>
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
    </section>
  );
};

export default Login;
