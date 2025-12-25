import React from 'react';
import '../styles/login.css';

const ResetPassword: React.FC = () => {
	return (
		<div className="auth-page container py-5">
			<div className="row justify-content-center">
				<div className="col-md-6">
					<div className="card p-4 bg-dark text-light">
						<h2 className="mb-3">Jelszó visszaállítás (teszt placeholder)</h2>
						<p className="text-muted">Teszt űrlap, később élesítjük a valódi reset folyamattal.</p>
						<form>
							<div className="mb-3">
								<label className="form-label">Email</label>
								<input type="email" className="form-control" placeholder="pelda@domain.hu" />
							</div>
							<button type="button" className="btn btn-primary w-100">Reset link küldése (demo)</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
