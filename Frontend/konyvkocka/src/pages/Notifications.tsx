import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
	ApiHttpError,
	deleteNotification,
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
	type NotificationItemResponse,
} from '../services/api';
import '../styles/notifications.css';

type UiFilter = 'all' | 'unread' | 'challenge' | 'friend' | 'system' | 'purchase';
type UiNotificationType = 'challenge' | 'friend' | 'system' | 'purchase' | 'all';

interface Notification {
	id: number;
	type: UiNotificationType;
	title: string;
	message: string;
	timestamp: string;
	isRead: boolean;
	icon: string;
}

const toRelativeTime = (value: string | null): string => {
	if (!value) return 'ismeretlen idopont';
	const then = new Date(value);
	if (Number.isNaN(then.getTime())) return 'ismeretlen idopont';

	const diffMs = Date.now() - then.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinutes < 1) return 'most';
	if (diffMinutes < 60) return `${diffMinutes} perce`;
	if (diffHours < 24) return `${diffHours} oraja`;
	if (diffDays < 7) return `${diffDays} napja`;
	return then.toLocaleDateString('hu-HU');
};

const mapType = (type: string): UiNotificationType => {
	const normalized = type.toUpperCase();
	if (normalized === 'CHALLENGE') return 'challenge';
	if (normalized === 'FRIEND') return 'friend';
	if (normalized === 'SYSTEM') return 'system';
	if (normalized === 'PURCHASE') return 'purchase';
	return 'all';
};

const getTypeIcon = (type: UiNotificationType): string => {
	switch (type) {
		case 'challenge': return 'bi-trophy-fill';
		case 'friend': return 'bi-person-check-fill';
		case 'system': return 'bi-gear-fill';
		case 'purchase': return 'bi-cart-fill';
		default: return 'bi-info-circle-fill';
	}
};

const mapNotification = (item: NotificationItemResponse): Notification => ({
	id: item.id,
	type: mapType(item.type),
	title: item.subject,
	message: item.message,
	timestamp: toRelativeTime(item.createdAt),
	isRead: item.isRead,
	icon: getTypeIcon(mapType(item.type)),
});

const Notifications: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [filter, setFilter] = useState<UiFilter>('all');
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		window.dispatchEvent(new CustomEvent('kk_notifications_unread_changed', {
			detail: { unreadCount },
		}));
	}, [unreadCount]);

	useEffect(() => {
		let isMounted = true;

		const loadNotifications = async () => {
			if (!isAuthenticated) {
				setNotifications([]);
				setUnreadCount(0);
				setError('Az ertesitesek megtekintesehez be kell jelentkezned.');
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await getNotifications({
					type:
						filter === 'all' || filter === 'unread'
							? undefined
							: (filter.toUpperCase() as 'CHALLENGE' | 'FRIEND' | 'SYSTEM' | 'PURCHASE'),
					unread: filter === 'unread' ? true : undefined,
					page: 1,
					pageSize: 100,
				});

				if (!isMounted) return;
				setNotifications(response.notifications.map(mapNotification));
				setUnreadCount(response.unreadCount);
			} catch (loadError) {
				if (!isMounted) return;
				if (loadError instanceof ApiHttpError && loadError.status === 401) {
					setError('Az ertesitesek megtekintesehez be kell jelentkezned.');
				} else {
					setError('Az ertesitesek betoltese sikertelen.');
				}
				setNotifications([]);
				setUnreadCount(0);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		void loadNotifications();

		return () => {
			isMounted = false;
		};
	}, [filter, isAuthenticated]);

	const filteredNotifications = useMemo(() => {
		if (filter === 'all') return notifications;
		if (filter === 'unread') return notifications.filter((n) => !n.isRead);
		return notifications.filter((n) => n.type === filter);
	}, [filter, notifications]);

	const markAsRead = async (id: number) => {
		try {
			await markNotificationAsRead(id);
			setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
			setUnreadCount(prev => Math.max(0, prev - 1));
		} catch (actionError) {
			console.error('Mark as read failed:', actionError);
		}
	};

	const markAllAsRead = async () => {
		try {
			await markAllNotificationsAsRead();
			setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
			setUnreadCount(0);
		} catch (actionError) {
			console.error('Mark all as read failed:', actionError);
		}
	};

	const handleDeleteNotification = async (id: number) => {
		const deletedItem = notifications.find((n) => n.id === id);
		try {
			await deleteNotification(id);
			setNotifications(prev => prev.filter(n => n.id !== id));
			if (deletedItem && !deletedItem.isRead) {
				setUnreadCount(prev => Math.max(0, prev - 1));
			}
		} catch (actionError) {
			console.error('Delete notification failed:', actionError);
		}
	};

	const getTypeColor = (type: Notification['type']) => {
		switch (type) {
			case 'challenge': return 'var(--secondary)';
			case 'friend': return '#4a9eff';
			case 'purchase': return '#2ecc71';
			case 'system': return '#ff4a4a';
			default: return 'var(--text)';
		}
	};

	return (
		<div className="notifications-page">
			<section className="notifications-hero py-5">
				<div className="container-fluid p-3 p-lg-5 px-4 px-lg-5">
					<div className="row mb-4">
						<div className="col-12">
							<div className="text-center mb-4 pt-5">
								<h1 className="text-uppercase fw-bold mb-2" style={{ color: 'var(--h1Text)' }}>
									<i className="bi bi-bell-fill me-3" style={{ color: 'var(--secondary)' }}></i>
									Ertesitesek
									{unreadCount > 0 && (
										<span className="badge bg-danger ms-3" style={{ fontSize: '0.6em', verticalAlign: 'super' }}>
											{unreadCount}
										</span>
									)}
								</h1>
								<p className="text-light mb-0">Tartsd szemmel az uj esemenyeket es rendszeruzeneteket.</p>
							</div>

							<div className="notifications-filters">
								<button className={`btn btn-action ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
									<i className="bi bi-grid-fill me-2"></i>Minden ({notifications.length})
								</button>
								<button className={`btn btn-action ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
									<i className="bi bi-envelope-fill me-2"></i>Olvasatlan ({unreadCount})
								</button>
								<button className={`btn btn-action ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>
									<i className="bi bi-gear-fill me-2"></i>Rendszer
								</button>
								<button className={`btn btn-action ${filter === 'challenge' ? 'active' : ''}`} onClick={() => setFilter('challenge')}>
									<i className="bi bi-trophy-fill me-2"></i>Kihivas
								</button>
								<button className={`btn btn-action ${filter === 'friend' ? 'active' : ''}`} onClick={() => setFilter('friend')}>
									<i className="bi bi-people-fill me-2"></i>Barat
								</button>
								<button className={`btn btn-action ${filter === 'purchase' ? 'active' : ''}`} onClick={() => setFilter('purchase')}>
									<i className="bi bi-cart-fill me-2"></i>Vasarlas
								</button>
								{unreadCount > 0 && (
									<button className="btn btn-action" onClick={() => void markAllAsRead()}>
										<i className="bi bi-check2-all me-2"></i>Mind olvasva
									</button>
								)}
							</div>
						</div>
					</div>

					<div className="row">
						<div className="col-12">
							{isLoading ? (
								<div className="empty-state text-center">
									<div className="spinner-border text-light" role="status">
										<span className="visually-hidden">Betoltes...</span>
									</div>
								</div>
							) : error ? (
								<div className="empty-state text-center">
									<div>
										<i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
										<p className="empty-title mb-2">{error}</p>
									</div>
								</div>
							) : filteredNotifications.length === 0 ? (
								<div className="empty-state text-center">
									<div>
										<i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
										<p className="empty-title mb-2">
											{filter === 'unread' ? 'Nincsenek olvasatlan ertesitesek.' : 'Nincsenek ertesitesek.'}
										</p>
									</div>
								</div>
							) : (
								<div className="notifications-list">
									{filteredNotifications.map(notification => (
										<div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
											<div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
												<i className={`bi ${notification.icon}`}></i>
											</div>
											<div className="notification-content">
												<div className="notification-header">
													<h5 className="notification-title mb-1">{notification.title}</h5>
													<small className="notification-time text-muted">{notification.timestamp}</small>
												</div>
												<p className="notification-message mb-0">{notification.message}</p>
											</div>
											<div className="notification-actions">
												{!notification.isRead && (
													<button className="btn btn-sm btn-icon" onClick={() => void markAsRead(notification.id)} title="Olvasottnak jelol">
														<i className="bi bi-check2"></i>
													</button>
												)}
												<button className="btn btn-sm btn-icon text-danger" onClick={() => void handleDeleteNotification(notification.id)} title="Torles">
													<i className="bi bi-trash"></i>
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Notifications;
