import React, { useState } from 'react';
import '../styles/notifications.css';

interface Notification {
  id: number;
  type: 'challenge' | 'friend' | 'content' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon?: string;
}

// Mock notifications - később API-ból jönnek
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'challenge',
    title: 'Új kihívás elérhető!',
    message: 'A "30 napos olvasási maraton" kihívás most kezdődik. Csatlakozz most!',
    timestamp: '5 perce',
    isRead: false,
    icon: 'bi-trophy-fill'
  },
  {
    id: 2,
    type: 'friend',
    title: 'Barátod aktivitása',
    message: 'JohnDoe befejezett egy könyvet: "1984" - 5 csillag',
    timestamp: '2 órája',
    isRead: false,
    icon: 'bi-person-check-fill'
  },
  {
    id: 3,
    type: 'content',
    title: 'Új tartalom!',
    message: 'Megérkezett az "Interstellar" - most nézd meg!',
    timestamp: '1 napja',
    isRead: true,
    icon: 'bi-star-fill'
  },
  {
    id: 4,
    type: 'system',
    title: 'Előfizetés lejárat',
    message: 'Az előfizetésed 7 nap múlva lejár. Hosszabbítsd meg most!',
    timestamp: '2 napja',
    isRead: true,
    icon: 'bi-exclamation-triangle-fill'
  }
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.isRead)
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'challenge': return 'var(--secondary)';
      case 'friend': return '#4a9eff';
      case 'content': return '#ff9d4a';
      case 'system': return '#ff4a4a';
      default: return 'var(--text)';
    }
  };

  return (
    <div className="notifications-page">
      <section className="notifications-hero py-5">
        <div className="container p-5">
          {/* Header */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-10 col-md-12">
              <div className="text-center mb-4">
                <h1 className="text-uppercase fw-bold mb-2" style={{ color: 'var(--h1Text)' }}>
                  <i className="bi bi-bell-fill me-3" style={{ color: 'var(--secondary)' }}></i>
                  Értesítések
                  {unreadCount > 0 && (
                    <span className="badge bg-danger ms-3" style={{ fontSize: '0.6em', verticalAlign: 'super' }}>
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-light mb-0">
                  Tartsd szemmel az új kihívásokat, barátaid aktivitását és a friss tartalmakat.
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="notifications-filters">
                <button
                  className={`btn btn-action ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <i className="bi bi-list-ul me-2"></i>Összes ({notifications.length})
                </button>
                <button
                  className={`btn btn-action ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilter('unread')}
                >
                  <i className="bi bi-envelope-fill me-2"></i>Olvasatlan ({unreadCount})
                </button>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-action"
                    onClick={markAllAsRead}
                  >
                    <i className="bi bi-check2-all me-2"></i>Mind olvasása
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-md-12">
              {filteredNotifications.length === 0 ? (
                <div className="empty-state text-center">
                  <div>
                    <i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
                    <p className="empty-title mb-2">
                      {filter === 'unread' ? 'Nincsenek olvasatlan értesítések.' : 'Nincsenek értesítések.'}
                    </p>
                    <p className="empty-subtitle mb-0">
                      {filter === 'unread' 
                        ? 'Minden értesítést elolvastál. Remek munka!' 
                        : 'Amint érkezik új értesítés, itt fog megjelenni.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="notifications-list">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    >
                      <div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
                        <i className={`bi ${notification.icon || 'bi-info-circle-fill'}`}></i>
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
                          <button
                            className="btn btn-sm btn-icon"
                            onClick={() => markAsRead(notification.id)}
                            title="Olvasottnak jelöl"
                          >
                            <i className="bi bi-check2"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-icon text-danger"
                          onClick={() => deleteNotification(notification.id)}
                          title="Törlés"
                        >
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
