import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ApiHttpError,
  getSubscriptionInfo,
  getSubscriptionPurchases,
  type PurchaseItemResponse,
} from '../services/api';
import '../styles/subscription.css';

// ========================
// TÍPUSOK
// ========================

interface SubscriptionInfo {
  type: 'free' | 'premium';
  name: string;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean | null;
  price: string;
}

interface PurchaseItem {
  id: number;
  purchaseDate: string | null;
  tier: string;
  purchaseStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  price: number;
  transactionId: string;
}

const mapPurchase = (item: PurchaseItemResponse): PurchaseItem => ({
  id: item.id,
  purchaseDate: item.purchaseDate,
  tier: item.tier,
  purchaseStatus: (item.purchaseStatus ?? 'PENDING') as PurchaseItem['purchaseStatus'],
  price: item.price ?? 0,
  transactionId: `TRX-${item.id}`,
});

const formatHuf = (value: number): string => `${value.toLocaleString('hu-HU')} Ft`;

// ========================
// KOMPONENS
// ========================

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Adatok betöltése
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [subData, purchaseData] = await Promise.all([
          getSubscriptionInfo(),
          getSubscriptionPurchases({ page: 1, pageSize: 200 }),
        ]);

        if (!isMounted) return;

        const successfulPurchases = purchaseData.purchases
          .filter((item) => item.purchaseStatus === 'SUCCESS')
          .sort((a, b) => (new Date(b.purchaseDate ?? 0).getTime() - new Date(a.purchaseDate ?? 0).getTime()));

        setSubscription({
          type: subData.type,
          name: subData.name,
          startDate: successfulPurchases[0]?.purchaseDate ?? null,
          endDate: subData.expiresAt,
          autoRenew: null,
          price: 'Nincs adat',
        });
        setPurchases(purchaseData.purchases.map(mapPurchase));
      } catch (error) {
        if (!isMounted) return;
        console.error('Hiba az adatok betöltésekor:', error);
        if (error instanceof ApiHttpError && error.status === 401) {
          setError('Az elofizetes adatok megtekintesehez be kell jelentkezned.');
        } else {
          setError('Az elofizetes adatok betoltese sikertelen.');
        }
        setSubscription(null);
        setPurchases([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Hátralévő napok számítása
  const daysRemaining = useMemo(() => {
    if (!subscription?.endDate) return 0;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  // Szűrt vásárlások
  const filteredPurchases = useMemo(() => {
    if (activeFilter === 'all') return purchases;
    return purchases.filter(p => p.purchaseStatus === activeFilter);
  }, [purchases, activeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / pageSize));

  const pagedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginationRange = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }, [currentPage, totalPages]);

  const jumpToTopNow = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const scrollingRoot = document.scrollingElement as HTMLElement | null;
    if (scrollingRoot) scrollingRoot.scrollTop = 0;
  };

  const changePage = (page: number) => {
    jumpToTopNow();
    setCurrentPage(Math.min(totalPages, Math.max(1, page)));
  };

  // Összes költés
  const totalSpent = useMemo(() => {
    const total = purchases.reduce((sum, p) => {
      if (p.purchaseStatus !== 'SUCCESS') return sum;
      return sum + p.price;
    }, 0);
    return formatHuf(total);
  }, [purchases]);

  const successfulPurchases = useMemo(() => purchases.filter((p) => p.purchaseStatus === 'SUCCESS').length, [purchases]);

  // Csomag badge (purchase.Tier)
  const getTierBadge = (tier: PurchaseItem['tier']) => {
    switch (tier?.toUpperCase()) {
      case 'ONE_M':
        return <span className="badge bg-info text-dark">1 hónap</span>;
      case 'QUARTER_Y':
        return <span className="badge bg-primary">3 hónap</span>;
      case 'FULL_Y':
        return <span className="badge bg-warning text-dark">12 hónap</span>;
      default:
        return <span className="badge bg-secondary">Egyeb</span>;
    }
  };

  // Státusz badge (purchase.PurchaseStatus)
  const getStatusBadge = (status: PurchaseItem['purchaseStatus']) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="badge bg-success">Sikeres</span>;
      case 'PENDING':
        return <span className="badge bg-warning text-dark">Függőben</span>;
      case 'FAILED':
        return <span className="badge bg-danger">Sikertelen</span>;
      case 'REFUNDED':
        return <span className="badge bg-secondary">Visszatérítve</span>;
      default:
        return <span className="badge bg-secondary">Ismeretlen</span>;
    }
  };

  // Előfizetés típus infó
  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    switch (subscription.type) {
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
  const subscriptionExpired = subscription?.type !== 'free' && daysRemaining <= 0;

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
            {error && (
              <div className="alert alert-warning mb-3" role="alert">
                {error}
              </div>
            )}
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
                <div className={`status-days ${subscriptionExpired ? 'expired' : ''}`}>
                  <span className="days-number">{subscriptionExpired ? 'Lejárt' : daysRemaining}</span>
                  <span className="days-label">{subscriptionExpired ? 'előfizetés' : 'nap van hátra'}</span>
                </div>
              )}
            </div>

            <div className="status-details">
              <div className="detail-item">
                <i className="bi bi-calendar-check"></i>
                <div>
                  <span className="detail-label">Kezdés dátuma</span>
                  <span className="detail-value">
                    {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('hu-HU') : 'Nincs adat'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <i className="bi bi-calendar-x"></i>
                <div>
                  <span className="detail-label">Lejárat</span>
                  <span className="detail-value">
                    {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('hu-HU') : 'Nincs adat'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <i className="bi bi-arrow-repeat"></i>
                <div>
                  <span className="detail-label">Automatikus megújítás</span>
                  <span className={`detail-value ${subscription?.autoRenew ? 'text-success' : 'text-danger'}`}>
                    {subscription?.autoRenew === null ? 'Nincs adat' : subscription?.autoRenew ? 'Bekapcsolva' : 'Kikapcsolva'}
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
                <button className="btn-cancel" onClick={() => navigate('/tamogatas')}>
                  <i className="bi bi-life-preserver"></i>
                  Lemondas ugyfelszolgalaton
                </button>
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
                  { key: 'SUCCESS', label: 'Sikeres', icon: 'bi-check2-circle' },
                  { key: 'PENDING', label: 'Függőben', icon: 'bi-hourglass-split' },
                  { key: 'FAILED', label: 'Sikertelen', icon: 'bi-x-circle' },
                  { key: 'REFUNDED', label: 'Visszatérítve', icon: 'bi-arrow-counterclockwise' },
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
                    <th>Csomag</th>
                    <th>Ár</th>
                    <th>Státusz</th>
                    <th>Tranzakció</th>
                    <th>Számla</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                        <p className="mt-2 mb-0">Nincs megjeleníthető vásárlás</p>
                      </td>
                    </tr>
                  ) : (
                    pagedPurchases.map(purchase => (
                      <tr key={purchase.id}>
                        <td>{purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('hu-HU') : 'Nincs adat'}</td>
                        <td>
                          <div className="product-cell">
                            <span>Premium előfizetés</span>
                          </div>
                        </td>
                        <td>{getTierBadge(purchase.tier)}</td>
                        <td>{formatHuf(purchase.price)}</td>
                        <td>{getStatusBadge(purchase.purchaseStatus)}</td>
                        <td><code>{purchase.transactionId}</code></td>
                        <td>
                          <button className="btn-invoice" title="Szamla endpoint nincs bekotve" disabled>
                            <i className="bi bi-dash-circle"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredPurchases.length > 0 && totalPages > 1 && (
              <nav className="kk-pagination-wrap subscription-pagination-wrap" aria-label="Vásárlási előzmények lapozása">
                <ul className="pagination kk-pagination justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => changePage(currentPage - 1)}>Előző</button>
                  </li>

                  {paginationRange.map((page) => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => changePage(page)}>{page}</button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => changePage(currentPage + 1)}>Következő</button>
                  </li>
                </ul>
              </nav>
            )}

            <div className="purchase-footer">
              <div className="purchase-summary">
                <span>Sikeres előfizetések:</span>
                <strong>{successfulPurchases} db</strong>
                <span className="mx-2">•</span>
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
                Kupon beváltas endpoint jelenleg nem erheto el.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Subscription;
