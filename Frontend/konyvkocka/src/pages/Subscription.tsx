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
  purchaseDate: string;
  tier: 'ONE_M' | 'QUARTER_Y' | 'FULL_Y';
  purchaseStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  price: number;
  transactionId: string;
}

// ========================
// MOCK ADATOK
// ========================

const fetchSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
  // TODO: API hívásra cserélni
  return {
    type: 'premium',
    name: 'Premium előfizetés',
    startDate: '2026-02-15',
    endDate: '2026-05-15',
    autoRenew: true,
    price: '2.990 Ft/hó',
  };
};

const fetchPurchaseHistory = async (): Promise<PurchaseItem[]> => {
  // TODO: API hívásra cserélni
  return [
    { id: 1, purchaseDate: '2026-03-12', tier: 'ONE_M', purchaseStatus: 'SUCCESS', price: 2990, transactionId: 'TX-20260312-A1H4K2' },
    { id: 2, purchaseDate: '2026-02-15', tier: 'ONE_M', purchaseStatus: 'SUCCESS', price: 2990, transactionId: 'TX-20260215-Z8M1P9' },
    { id: 3, purchaseDate: '2026-01-15', tier: 'ONE_M', purchaseStatus: 'SUCCESS', price: 2990, transactionId: 'TX-20260115-X2N7Q5' },
    { id: 4, purchaseDate: '2025-12-20', tier: 'QUARTER_Y', purchaseStatus: 'SUCCESS', price: 7490, transactionId: 'TX-20251220-L4S9B3' },
    { id: 5, purchaseDate: '2025-11-18', tier: 'ONE_M', purchaseStatus: 'FAILED', price: 2990, transactionId: 'TX-20251118-R5V2D8' },
    { id: 6, purchaseDate: '2025-10-15', tier: 'ONE_M', purchaseStatus: 'REFUNDED', price: 2990, transactionId: 'TX-20251015-J7W3T1' },
    { id: 7, purchaseDate: '2025-09-03', tier: 'FULL_Y', purchaseStatus: 'SUCCESS', price: 24990, transactionId: 'TX-20250903-K9C2M4' },
    { id: 8, purchaseDate: '2025-08-11', tier: 'ONE_M', purchaseStatus: 'PENDING', price: 2990, transactionId: 'TX-20250811-N6F3H7' },
    { id: 9, purchaseDate: '2025-07-14', tier: 'QUARTER_Y', purchaseStatus: 'SUCCESS', price: 7490, transactionId: 'TX-20250714-U2G8Y4' },
    { id: 10, purchaseDate: '2025-06-10', tier: 'ONE_M', purchaseStatus: 'SUCCESS', price: 2990, transactionId: 'TX-20250610-P4E6L2' },
    { id: 11, purchaseDate: '2025-05-16', tier: 'ONE_M', purchaseStatus: 'FAILED', price: 2990, transactionId: 'TX-20250516-Q8A1R6' },
    { id: 12, purchaseDate: '2025-04-09', tier: 'FULL_Y', purchaseStatus: 'SUCCESS', price: 24990, transactionId: 'TX-20250409-H3D7N5' },
  ];
};

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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
    switch (tier) {
      case 'ONE_M':
        return <span className="badge bg-info text-dark">1 hónap</span>;
      case 'QUARTER_Y':
        return <span className="badge bg-primary">3 hónap</span>;
      case 'FULL_Y':
        return <span className="badge bg-warning text-dark">12 hónap</span>;
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
    }
  };

  // Számla letöltése
  const handleDownloadInvoice = (purchase: PurchaseItem) => {
    // TODO: Valódi API hívás a számlához: const response = await fetch(`/api/invoices/${purchase.id}`);
    // Dummy számla generálás szöveges fájlként
    const invoiceContent = `
KÖNYVKOCKA - SZÁMLA

Számlaszám: INV-${purchase.id}-${new Date(purchase.purchaseDate).getFullYear()}
Dátum: ${new Date(purchase.purchaseDate).toLocaleDateString('hu-HU')}

Termék: Premium előfizetés
Csomag (Tier): ${purchase.tier}
Ár: ${formatHuf(purchase.price)}
Státusz: ${purchase.purchaseStatus}
Tranzakció azonosító: ${purchase.transactionId}

Köszönjük a vásárlást!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `szamla-${purchase.id}-${new Date(purchase.purchaseDate).getTime()}.txt`;
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
                        <td>{new Date(purchase.purchaseDate).toLocaleDateString('hu-HU')}</td>
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
