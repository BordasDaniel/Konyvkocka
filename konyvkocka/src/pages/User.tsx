import React from 'react';
import '../styles/user.css';

const User: React.FC = () => {
	return (
		<div className="container py-5 user-page">
			<div className="card bg-dark text-light p-4">
				<h2 className="mb-3">Felhasználói profil (teszt placeholder)</h2>
				<p className="text-muted">Ideiglenes nézet a teszteléshez. Később dinamikus adatokkal és szerkesztéssel frissítjük.</p>
				<ul className="list-unstyled small">
					<li><strong>Név:</strong> Teszt Elek</li>
					<li><strong>Email:</strong> teszt@example.com</li>
					<li><strong>Státusz:</strong> Prémium (demo)</li>
				</ul>
				<button className="btn btn-outline-light mt-3" type="button">Kijelentkezés (demo)</button>
			</div>
		</div>
	);
};

export default User;
