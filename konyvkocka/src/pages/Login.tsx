import React from 'react';
import '../styles/login.css';

const Login: React.FC = () => {
	return (
		<div className="auth-page container py-5">
			<div className="row justify-content-center">
				<div className="col-md-6">
					<div className="card p-4 bg-dark text-light">
						<h2 className="mb-3">Bejelentkezés (teszt placeholder)</h2>
						<p className="text-muted">Ideiglenes tartalom a funkcionális teszteléshez. Később cseréljük éles űrlapra.</p>
						<form>
							<div className="mb-3">
								<label className="form-label">Email</label>
								<input type="email" className="form-control" placeholder="pelda@domain.hu" />
							</div>
							<div className="mb-3">
								<label className="form-label">Jelszó</label>
								<input type="password" className="form-control" placeholder="••••••" />
							</div>
							<button type="button" className="btn btn-primary w-100">Belépés (demo)</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
