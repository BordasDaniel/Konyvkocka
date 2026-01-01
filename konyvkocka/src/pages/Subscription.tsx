import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/subscription.css';

// ========================
// TÍPUSOK
// ========================

interface SubscriptionInfo {
  type: 'free' | 'premium' | 'premium-plus';
  name: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: string;
}

interface PurchaseItem {
  id: number;
  date: string;
  product: string;
  type: 'subscription' | 'ebook' | 'audiobook';
  price: string;
  status: 'active' | 'completed' | 'expired';
  cover?: string;
}

// ========================
// MOCK ADATOK
// ========================

const fetchSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
  // TODO: API hívásra cserélni
  return {
    type: 'premium',
    name: 'Premium előfizetés',
    startDate: '2025-11-15',
    endDate: '2026-01-15',
    autoRenew: true,
    price: '2.990 Ft/hó',
  };
};

const fetchPurchaseHistory = async (): Promise<PurchaseItem[]> => {
  // TODO: API hívásra cserélni
  return [
    { id: 1, date: '2025-11-15', product: 'Premium előfizetés (1 hónap)', type: 'subscription', price: '2.990 Ft', status: 'active', cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400' },
    { id: 2, date: '2025-10-20', product: 'A szél árnyéka - eBook', type: 'ebook', price: '1.490 Ft', status: 'completed', cover: 'https://moly.hu/system/covers/big/covers_582574.jpg' },
    { id: 3, date: '2025-09-05', product: 'Film csomag (3 hónap)', type: 'subscription', price: '7.990 Ft', status: 'expired', cover: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400' },
    { id: 4, date: '2025-08-12', product: 'Az éjszaka titkai - Audiobook', type: 'audiobook', price: '2.290 Ft', status: 'completed', cover: 'https://s01.static.libri.hu/cover/56/3/828911_4.jpg' },
    { id: 5, date: '2025-07-01', product: 'Premium előfizetés (1 hónap)', type: 'subscription', price: '2.990 Ft', status: 'expired', cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400' },
    { id: 6, date: '2025-06-15', product: 'Dűne - eBook', type: 'ebook', price: '1.990 Ft', status: 'completed', cover: 'https://marvin.bline.hu/product_images/920/ID250-141842.JPG' },
  ];
};

// ========================
// KOMPONENS
// ========================

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'subscription' | 'ebook' | 'audiobook'>('all');

  // Adatok betöltése
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [subData, purchaseData] = await Promise.all([
          fetchSubscriptionInfo(),
          fetchPurchaseHistory(),
        ]);
        setSubscription(subData);
        setPurchases(purchaseData);
      } catch (error) {
        console.error('Hiba az adatok betöltésekor:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Hátralévő napok számítása
  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  // Szűrt vásárlások
  const filteredPurchases = useMemo(() => {
    if (activeFilter === 'all') return purchases;
    return purchases.filter(p => p.type === activeFilter);
  }, [purchases, activeFilter]);

  // Összes költés
  const totalSpent = useMemo(() => {
    const total = purchases.reduce((sum, p) => {
      const price = parseInt(p.price.replace(/[^\d]/g, ''));
      return sum + price;
    }, 0);
    return total.toLocaleString('hu-HU') + ' Ft';
  }, [purchases]);

  // Típus badge
  const getTypeBadge = (type: PurchaseItem['type']) => {
    switch (type) {
      case 'subscription':
        return <span className="badge bg-warning text-dark">Előfizetés</span>;
      case 'ebook':
        return <span className="badge bg-info">eBook</span>;
      case 'audiobook':
        return <span className="badge bg-primary">Audiobook</span>;
    }
  };

  // Státusz badge
  const getStatusBadge = (status: PurchaseItem['status']) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Aktív</span>;
      case 'completed':
        return <span className="badge bg-success">Teljesítve</span>;
      case 'expired':
        return <span className="badge bg-secondary">Lejárt</span>;
    }
  };

  // Számla letöltése
  const handleDownloadInvoice = (purchase: PurchaseItem) => {
    // TODO: Valódi API hívás a számlához: const response = await fetch(`/api/invoices/${purchase.id}`);
    // Dummy számla generálás szöveges fájlként
    const invoiceContent = `
KÖNYVKOCKA - SZÁMLA

Számlaszám: INV-${purchase.id}-${new Date(purchase.date).getFullYear()}
Dátum: ${new Date(purchase.date).toLocaleDateString('hu-HU')}

Termék: ${purchase.product}
Típus: ${purchase.type}
Ár: ${purchase.price}
Státusz: ${purchase.status}

Köszönjük a vásárlást!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `szamla-${purchase.id}-${new Date(purchase.date).getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Előfizetés típus infó
  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    switch (subscription.type) {
      case 'premium-plus':
        return { color: '#FFD700', icon: 'bi-gem', label: 'Premium+' };
      case 'premium':
        return { color: 'var(--secondary)', icon: 'bi-star-fill', label: 'Premium' };
      default:
        return { color: '#6c757d', icon: 'bi-person', label: 'Ingyenes' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="subscription-page">
        <div className="container py-5 text-center">
          <i className="bi bi-lock" style={{ fontSize: '4rem', color: 'var(--secondary)' }}></i>
          <h2 className="mt-3">Bejelentkezés szükséges</h2>
          <p className="text-muted">Az előfizetés kezeléséhez be kell jelentkezned.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/belepes')}>
            Bejelentkezés
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="subscription-page">
        <div className="container py-5 text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Betöltés...</span>
          </div>
        </div>
      </div>
    );
  }

  const subBadge = getSubscriptionBadge();

  return (
    <div className="subscription-page">
      <section className="subscription-hero">
        <div className="container-fluid px-4 px-lg-5">
          <h1 className="mb-4 display-6 fw-bold text-decoration-underline">
            <i className="bi bi-bag-check me-2"></i>
            Vásárlások
          </h1>
        </div>
      </section>

      <section className="subscription-content">
        <div className="container-fluid px-4 px-lg-5">
          {/* Jelenlegi előfizetés státusz */}
          <div className="subscription-status-card">
            <div className="status-header">
              <div className="status-icon" style={{ backgroundColor: subBadge?.color }}>
                <i className={`bi ${subBadge?.icon}`}></i>
              </div>
              <div className="status-info">
                <h2>{subscription?.name}</h2>
                <p className="status-type" style={{ color: subBadge?.color }}>
                  {subBadge?.label} csomag
                </p>
              </div>
              {subscription?.type !== 'free' && (
                <div className="status-days">
                  <span className="days-number">{daysRemaining}</span>
                  <span className="days-label">nap van hátra</span>
                </div>
              )}
            </div>

            <div className="status-details">
              <div className="detail-item">
                <i className="bi bi-calendar-check"></i>
                <div>
                  <span className="detail-label">Kezdés dátuma</span>
                  <span className="detail-value">
                    {new Date(subscription?.startDate || '').toLocaleDateString('hu-HU')}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <i className="bi bi-calendar-x"></i>
                <div>
                  <span className="detail-label">Lejárat</span>
                  <span className="detail-value">
                    {new Date(subscription?.endDate || '').toLocaleDateString('hu-HU')}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <i className="bi bi-arrow-repeat"></i>
                <div>
                  <span className="detail-label">Automatikus megújítás</span>
                  <span className={`detail-value ${subscription?.autoRenew ? 'text-success' : 'text-danger'}`}>
                    {subscription?.autoRenew ? 'Bekapcsolva' : 'Kikapcsolva'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <i className="bi bi-cash"></i>
                <div>
                  <span className="detail-label">Ár</span>
                  <span className="detail-value">{subscription?.price}</span>
                </div>
              </div>
            </div>

            <div className="status-actions">
              {subscription?.type === 'free' ? (
                <button className="btn-upgrade" onClick={() => navigate('/fizetes')}>
                  <i className="bi bi-arrow-up-circle"></i>
                  Váltás Premiumra
                </button>
              ) : (
                <>
                  <button className="btn-upgrade" onClick={() => navigate('/fizetes')}>
                    <i className="bi bi-arrow-up-circle"></i>
                    Csomag váltás
                  </button>
                  {subscription?.autoRenew && (
                    <button 
                      className="btn-cancel"
                      onClick={() => setSubscription(prev => prev ? { ...prev, autoRenew: false } : null)}
                    >
                      <i className="bi bi-x-circle"></i>
                      Előfizetés lemondása
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Vásárlási előzmények */}
          <div className="purchase-history-card">
            <div className="purchase-header">
              <h3>
                <i className="bi bi-receipt me-2"></i>
                Vásárlási előzmények
              </h3>
              <div className="purchase-filters">
                {[
                  { key: 'all', label: 'Összes', icon: 'bi-grid-fill' },
                  { key: 'subscription', label: 'Előfizetés', icon: 'bi-star-fill' },
                  { key: 'ebook', label: 'eBook', icon: 'bi-book' },
                  { key: 'audiobook', label: 'Audiobook', icon: 'bi-headphones' },
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                  >
                    <i className={`bi ${filter.icon} me-1`}></i>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="purchase-table-wrapper">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>Dátum</th>
                    <th>Termék</th>
                    <th>Típus</th>
                    <th>Ár</th>
                    <th>Státusz</th>
                    <th>Számla</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                        <p className="mt-2 mb-0">Nincs megjeleníthető vásárlás</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map(purchase => (
                      <tr key={purchase.id}>
                        <td>{new Date(purchase.date).toLocaleDateString('hu-HU')}</td>
                        <td>
                          <div className="product-cell">
                            {purchase.cover && (
                              <img src={purchase.cover} alt={purchase.product} className="product-cover" />
                            )}
                            <span>{purchase.product}</span>
                          </div>
                        </td>
                        <td>{getTypeBadge(purchase.type)}</td>
                        <td>{purchase.price}</td>
                        <td>{getStatusBadge(purchase.status)}</td>
                        <td>
                          <button 
                            className="btn-invoice" 
                            title="Számla letöltése"
                            onClick={() => handleDownloadInvoice(purchase)}
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="purchase-footer">
              <div className="purchase-summary">
                <span>Összes költés:</span>
                <strong>{totalSpent}</strong>
              </div>
            </div>
          </div>

          {/* Kedvezmények / Kuponok */}
          <div className="coupon-card">
            <div className="coupon-header">
              <h3>
                <i className="bi bi-ticket-perforated me-2"></i>
                Kuponok és kedvezmények
              </h3>
            </div>
            <div className="coupon-content">
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Kuponkód beírása..."
                  className="coupon-input"
                />
                <button className="btn-apply-coupon">
                  Beváltás
                </button>
              </div>
              <p className="coupon-hint">
                <i className="bi bi-info-circle me-1"></i>
                A kuponok a következő vásárlásnál kerülnek felhasználásra.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Subscription;
