import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import {
  ApiHttpError,
  getContentDetail,
  getHistoryItem,
  parseContentKey,
  recordContentView,
  SESSION_STORAGE_KEY,
  touchHistoryItem,
  updateHistory,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import NonPremiumAd from '../components/common/NonPremiumAd';
import '../styles/reader.css';

interface Bookmark {
  page: number;
  title: string;
  timestamp: string;
}

interface ReaderLocationState {
  bookId?: number;
  contentId?: number;
  contentType?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5269').replace(/\/$/, '');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const toPdfLoadUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (trimmed.includes('/api/proxy/pdf?url=')) {
    return trimmed;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith('/')) {
      return `${API_BASE_URL}${trimmed}`;
    }

    return `${API_BASE_URL}/${trimmed}`;
  }

  return `${API_BASE_URL}/api/proxy/pdf?url=${encodeURIComponent(trimmed)}`;
};

const Reader: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [pageNumPending, setPageNumPending] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('Könyv címe');
  const [bookAuthor, setBookAuthor] = useState<string>('Szerző neve');
  const [bookCover, setBookCover] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarShow, setSidebarShow] = useState<boolean>(false);
  const [activeBookId, setActiveBookId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pendingScrollRatio = useRef<number | null>(null);
  const lastSavedPageRef = useRef<number>(0);
  const progressReadyRef = useRef<boolean>(false);
  const completedStatusLockedRef = useRef<boolean>(false);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'f') toggleFullscreen();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveReaderSource = async () => {
      if (isAuthLoading) return;
      if (!isAuthenticated) {
        if (isMounted) {
          setPdfUrl('');
          setPdfDoc(null);
          setActiveBookId(null);
          setLoading(false);
          setError('A tartalom olvasásához be kell jelentkezned.');
        }
        return;
      }

      setError(null);

      const params = new URLSearchParams(location.search);
      const contentParam = params.get('content');
      const directPdfParam = (params.get('pdf') ?? '').trim();
      const state = (location.state as ReaderLocationState | null) ?? null;

      const parsedFromQuery = contentParam ? parseContentKey(contentParam) : null;
      const fallbackBookId = typeof state?.bookId === 'number'
        ? state.bookId
        : typeof state?.contentId === 'number' && state?.contentType?.toLowerCase() === 'book'
          ? state.contentId
          : null;

      const resolvedType = parsedFromQuery?.type ?? (fallbackBookId != null ? 'book' : null);
      const resolvedId = parsedFromQuery?.id ?? fallbackBookId;

      if (resolvedType && typeof resolvedId === 'number') {
        if (resolvedType !== 'book') {
          if (isMounted) {
            setError('Az olvasó csak könyv típusú tartalomhoz használható.');
            setLoading(false);
          }
          return;
        }

        try {
          const detail = await getContentDetail('book', resolvedId);
          if (!isMounted) return;

          const token = localStorage.getItem(SESSION_STORAGE_KEY);
          if (token && token.trim().length > 0) {
            void recordContentView({ contentType: 'book', contentId: resolvedId }).catch((trackError) => {
              console.warn('View tracking failed on reader page:', trackError);
            });
          }

          const dbPdfUrl = (detail.watchUrl ?? '').trim();
          setBookTitle(detail.title || 'Könyv címe');
          setBookCover(detail.img || '');
          setBookAuthor('Szerző ismeretlen');
          setActiveBookId(resolvedId);

          if (dbPdfUrl) {
            setPdfUrl(dbPdfUrl);
            return;
          }

          setError('Ehhez a könyvhöz nincs PDF link beállítva az adatbázisban.');
          setLoading(false);
          return;
        } catch (loadError) {
          if (!isMounted) return;
          console.error('Reader content fetch error:', loadError);
          setError('A könyv adatainak betöltése sikertelen.');
          setLoading(false);
          return;
        }
      }

      if (directPdfParam) {
        if (isMounted) {
          setActiveBookId(null);
          setPdfUrl(directPdfParam);
        }
        return;
      }

      if (isMounted) {
        setError('Nincs megadott PDF link.');
        setLoading(false);
      }
    };

    void resolveReaderSource();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, location.search, location.state]);

  if (isAuthLoading) {
    return (
      <main className="mt-5">
        <div className="container py-5">
          <div className="about-panel text-center py-5">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Betöltés...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mt-5">
        <div className="container py-5">
          <div className="about-panel text-center py-5 px-3">
            <i className="bi bi-lock" style={{ fontSize: '3rem', color: 'var(--secondary)' }}></i>
            <h3 className="mt-3 mb-2">Bejelentkezes szukseges</h3>
            <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Olvasashoz jelentkezz be a fiokodba.</p>
            <Link to="/belepes" className="btn btn-primary">
              Bejelentkezes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  useEffect(() => {
    if (!isAuthenticated || !activeBookId) {
      progressReadyRef.current = false;
      lastSavedPageRef.current = 0;
      completedStatusLockedRef.current = false;
      return;
    }

    let cancelled = false;
    progressReadyRef.current = false;

    const loadSavedProgress = async () => {
      try {
        const item = await getHistoryItem('book', activeBookId);
        if (cancelled) return;

        const savedPage = Math.max(1, Number(item.progress ?? 1));
        setPageNum(savedPage);
        lastSavedPageRef.current = savedPage;
        completedStatusLockedRef.current = (item.status ?? '').toUpperCase() === 'COMPLETED';
      } catch (loadError) {
        if (cancelled) return;

        if (!(loadError instanceof ApiHttpError && loadError.status === 404)) {
          console.warn('Mentett olvasási előrehaladás lekérése sikertelen:', loadError);
        }

        setPageNum(1);
        lastSavedPageRef.current = 1;
        completedStatusLockedRef.current = false;
      } finally {
        if (!cancelled) {
          progressReadyRef.current = true;
        }
      }
    };

    void loadSavedProgress();

    return () => {
      cancelled = true;
    };
  }, [activeBookId, isAuthenticated]);

  useEffect(() => {
    if (!pdfUrl) {
      setBookmarks([]);
      return;
    }

    const savedBookmarks = localStorage.getItem('kk_bookmarks_' + pdfUrl);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    } else {
      setBookmarks([]);
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfUrl) return;
    setPdfDoc(null);
    setTotalPages(0);
    void loadPDF(toPdfLoadUrl(pdfUrl));
  }, [pdfUrl]);

  useEffect(() => {
    if (!isAuthenticated || !activeBookId || loading || !!error || totalPages <= 0) return;
    if (!progressReadyRef.current) return;

    const normalizedPage = Math.max(1, Math.min(totalPages, pageNum));
    if (lastSavedPageRef.current === normalizedPage) return;

    const timer = window.setTimeout(async () => {
      const status = completedStatusLockedRef.current || normalizedPage >= totalPages ? 'COMPLETED' : 'WATCHING';

      const persistProgress = async () => {
        await updateHistory({
          contentType: 'book',
          contentId: activeBookId,
          progress: normalizedPage,
          status,
        });
      };

      try {
        await persistProgress();
        lastSavedPageRef.current = normalizedPage;
        if (status === 'COMPLETED') {
          completedStatusLockedRef.current = true;
        }
      } catch (saveError) {
        if (saveError instanceof ApiHttpError && saveError.status === 404) {
          try {
            await recordContentView({ contentType: 'book', contentId: activeBookId });
            await persistProgress();
            lastSavedPageRef.current = normalizedPage;
            if (status === 'COMPLETED') {
              completedStatusLockedRef.current = true;
            }
          } catch (retryError) {
            console.warn('Olvasási előrehaladás mentése sikertelen (retry):', retryError);
          }
          return;
        }

        console.warn('Olvasási előrehaladás mentése sikertelen:', saveError);
      }
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeBookId, error, isAuthenticated, loading, pageNum, totalPages]);

  useEffect(() => {
    if (!isAuthenticated || !activeBookId || loading || !!error) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      const sendReaderHeartbeat = async () => {
        try {
          await touchHistoryItem({ contentType: 'book', contentId: activeBookId });
        } catch (touchError) {
          if (touchError instanceof ApiHttpError && touchError.status === 404) {
            try {
              await recordContentView({ contentType: 'book', contentId: activeBookId });
              await touchHistoryItem({ contentType: 'book', contentId: activeBookId });
            } catch (retryError) {
              console.warn('Olvasási heartbeat mentése sikertelen (retry):', retryError);
            }
            return;
          }

          console.warn('Olvasási heartbeat mentése sikertelen:', touchError);
        }
      };

      void sendReaderHeartbeat();
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeBookId, error, isAuthenticated, loading]);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, scale, rotation]);

  // Body scroll letiltása amikor a sidebar nyitva van mobilon
  useEffect(() => {
    if (window.innerWidth <= 768 && sidebarShow) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [sidebarShow]);

  const loadPDF = async (url: string) => {
    setLoading(true);
    setError(null);
    const isProxyUrl = url.includes('/api/proxy/pdf?url=');
    const isAbsoluteHttpUrl = /^https?:\/\//i.test(url);

    try {
      let loadingTask: any;

      try {
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
        if (contentType && !contentType.includes('pdf') && !contentType.includes('application/octet-stream')) {
          throw new Error('A megadott link nem PDF tartalmat ad vissza.');
        }

        const fileBuffer = await response.arrayBuffer();
        const byteView = new Uint8Array(fileBuffer);

        if (byteView.length < 5) {
          throw new Error('A fájl túl kicsi vagy sérült.');
        }

        const signature = String.fromCharCode(...byteView.slice(0, 5));
        if (signature !== '%PDF-') {
          throw new Error('A megadott link nem közvetlen PDF fájlra mutat.');
        }

        loadingTask = pdfjsLib.getDocument({
          data: byteView,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          enableXfa: false,
          disableRange: true,
          disableStream: true,
          disableAutoFetch: true,
        });
      } catch (binaryLoadError) {
        const errorMessage =
          binaryLoadError instanceof Error
            ? binaryLoadError.message
            : String(binaryLoadError);
        const isPdfValidationError =
          /nem közvetlen PDF|nem PDF tartalmat|túl kicsi|sérült/i.test(errorMessage);
        const isNetworkLikeError =
          /failed to fetch|networkerror|load failed|cors|http\s\d{3}/i.test(errorMessage);
        const canFallbackToUrlMode = !isProxyUrl && isAbsoluteHttpUrl && isNetworkLikeError && !isPdfValidationError;

        if (!canFallbackToUrlMode) {
          throw binaryLoadError;
        }

        console.warn('Binary PDF load failed, falling back to URL mode:', binaryLoadError);

        loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          enableXfa: false,
          disableRange: true,
          disableStream: true,
          disableAutoFetch: true,
        });
      }
      
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);

      // Load metadata
      const metadata = await pdf.getMetadata();
      if (metadata.info) {
        setBookTitle(metadata.info.Title || 'Ismeretlen cím');
        setBookAuthor(metadata.info.Author || 'Ismeretlen szerző');
      }
      
      // A borító URL-t a backend fog majd szolgáltatni
      // Egyelőre nincs borító, csak az ikon jelenik meg

      setLoading(false);
    } catch (err) {
      console.error('PDF loading error:', err);
      const errName = err instanceof Error ? err.name : '';
      const errMessage = err instanceof Error ? err.message : String(err);

      if (errName === 'InvalidPDFException') {
        setError('A megadott fájl nem érvényes PDF szerkezetű, vagy sérült. Adj meg egy közvetlen, működő PDF linket.');
      } else if (/nem közvetlen PDF|nem PDF tartalmat/i.test(errMessage)) {
        setError('A megadott link nem közvetlen PDF fájlra mutat.');
      } else {
        setError('A PDF betöltése sikertelen. Ellenőrizd, hogy a link közvetlenül PDF-re mutat és CORS szempontból elérhető.');
      }
      setLoading(false);
    }
  };

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    // Cancel previous render task if it exists
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setPageRendering(true);

    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: scale / 100, rotation });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) return;
      
      // Only resize if necessary to avoid flickering, but here we need it for zoom
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas and set white background to prevent artifacts
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        annotationMode: 0 // Disable annotations to prevent glitches
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      
      renderTaskRef.current = null;
      setPageRendering(false);

      // Restore scroll position after zoom
      if (pendingScrollRatio.current !== null && viewerRef.current) {
        const targetCenter = pendingScrollRatio.current * canvas.height;
        viewerRef.current.scrollTop = Math.max(0, targetCenter - viewerRef.current.clientHeight / 2);
        pendingScrollRatio.current = null;
      }

      if (pageNumPending !== null) {
        setPageNum(pageNumPending);
        setPageNumPending(null);
      }
    } catch (error: any) {
      if (error.name === 'RenderingCancelledException') {
        // Rendering cancelled, this is expected
        return;
      }
      console.error('Render error:', error);
      setPageRendering(false);
    }
  };

  const queueRenderPage = (num: number) => {
    if (pageRendering) {
      setPageNumPending(num);
    } else {
      setPageNum(num);
    }
  };

  const prevPage = () => {
    if (pageNum <= 1) return;
    queueRenderPage(pageNum - 1);
  };

  const nextPage = () => {
    if (pageNum >= totalPages) return;
    queueRenderPage(pageNum + 1);
  };

  const goToPage = (num: number) => {
    if (num < 1 || num > totalPages) return;
    queueRenderPage(num);
  };

  const updateZoom = (newScale: number) => {
    // Store scroll position
    if (viewerRef.current && canvasRef.current && canvasRef.current.height) {
      const center = viewerRef.current.scrollTop + viewerRef.current.clientHeight / 2;
      pendingScrollRatio.current = Math.max(0, Math.min(1, center / canvasRef.current.height));
    }
    setScale(newScale);
  };

  const zoomIn = () => {
    if (scale < 200) {
      updateZoom(scale + 10);
    }
  };

  const zoomOut = () => {
    if (scale > 50) {
      updateZoom(scale - 10);
    }
  };

  const rotateLeft = () => {
    setRotation((rotation - 90) % 360);
  };

  const rotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarShow(!sidebarShow);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarShow(false);
    } else {
      setSidebarCollapsed(true);
    }
  };

  const addBookmark = () => {
    if (!pdfUrl) return;

    const bookmark: Bookmark = {
      page: pageNum,
      title: 'Oldal ' + pageNum,
      timestamp: new Date().toLocaleString('hu-HU')
    };
    const newBookmarks = [...bookmarks, bookmark];
    setBookmarks(newBookmarks);
    localStorage.setItem('kk_bookmarks_' + pdfUrl, JSON.stringify(newBookmarks));
  };

  const removeBookmark = (idx: number) => {
    if (!pdfUrl) return;

    const newBookmarks = bookmarks.filter((_, i) => i !== idx);
    setBookmarks(newBookmarks);
    localStorage.setItem('kk_bookmarks_' + pdfUrl, JSON.stringify(newBookmarks));
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="reader-container">
      {/* Overlay mobilon amikor a sidebar nyitva van */}
      {sidebarShow && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      {/* Sidebar */}
      <aside className={`reader-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarShow ? 'show' : ''}`} id="readerSidebar">
        <div className="sidebar-header">
          <button className="btn-icon" onClick={closeSidebar} title="Bezárás">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="book-info">
          <div className="book-cover" id="bookCover">
            {bookCover ? (
              <img src={bookCover} alt="Könyv borító" />
            ) : (
              <i className="bi bi-book-fill"></i>
            )}
          </div>
          <h3 className="book-title">{bookTitle}</h3>
          <p className="book-author">{bookAuthor}</p>
        </div>

        <div className="reader-controls">
          <div className="control-group">
            <label className="control-label">Oldal navigáció</label>
            <div className="page-nav">
              <button className="btn-control" onClick={prevPage} title="Előző oldal">
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className="page-info">
                <input 
                  type="number" 
                  className="page-input" 
                  min="1" 
                  max={totalPages}
                  value={pageNum}
                  onChange={(e) => goToPage(parseInt(e.target.value))}
                />
                <span className="page-total">/ <span>{totalPages || '-'}</span></span>
              </div>
              <button className="btn-control" onClick={nextPage} title="Következő oldal">
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Zoom</label>
            <div className="zoom-controls">
              <button className="btn-control" onClick={zoomOut} title="Kicsinyítés">
                <i className="bi bi-dash-lg"></i>
              </button>
              <span className="zoom-level">{scale}%</span>
              <button className="btn-control" onClick={zoomIn} title="Nagyítás">
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
            <input 
              type="range" 
              className="zoom-slider" 
              min="50" 
              max="200" 
              value={scale} 
              step="10"
              onChange={(e) => updateZoom(parseInt(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label className="control-label">Könyvjelzők</label>
            <button className="btn-bookmark" onClick={addBookmark}>
              <i className="bi bi-bookmark-plus"></i> Könyvjelző hozzáadása
            </button>
            <div className="bookmarks-list">
              {bookmarks.length === 0 ? (
                <p className="text small">Még nincsenek könyvjelzők</p>
              ) : (
                bookmarks.map((bm, idx) => (
                  <div key={idx} className="bookmark-item">
                    <div className="bookmark-info" onClick={() => goToPage(bm.page)}>
                      <i className="bi bi-bookmark-fill me-2"></i>
                      <span>{bm.title}</span>
                    </div>
                    <button className="btn-remove" onClick={() => removeBookmark(idx)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="btn-action" onClick={downloadPdf}>
            <i className="bi bi-download me-2"></i> Letöltés
          </button>
          <a href="#/kereses" className="btn-action btn-outline">
            <i className="bi bi-arrow-left me-2"></i> Vissza
          </a>
        </div>
      </aside>

      {/* Main reader area */}
      <main className="reader-main">
        {/* Top toolbar */}
        <div className="reader-toolbar">
          <button className="btn-icon" onClick={toggleSidebar}>
            <i className="bi bi-list"></i>
          </button>
          <div className="toolbar-title">
            <span>{bookTitle}</span>
          </div>
          <div className="toolbar-actions">
            <button className="btn-icon" onClick={rotateLeft} title="Forgatás balra">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
            <button className="btn-icon" onClick={rotateRight} title="Forgatás jobbra">
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {/* PDF Canvas Container */}
        <div className="pdf-viewer" ref={viewerRef}>
          {loading && (
            <div className="loading-state">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Betöltés...</span>
              </div>
              <p className="mt-3">PDF betöltése folyamatban...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3">Hiba történt</h3>
              <p>{error}</p>
              <a href="#/kereses" className="btn btn-outline-light mt-3">
                <i className="bi bi-arrow-left me-2"></i> Vissza a kereséshez
              </a>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="pdf-canvas"
            style={{ display: loading || error ? 'none' : 'block' }}
          ></canvas>
        </div>

        {/* Bottom navigation bar */}
        <div className="reader-bottom-nav">
          <button className="btn-nav" onClick={prevPage}>
            <i className="bi bi-chevron-left"></i> Előző
          </button>
          <div className="page-indicator">
            <span>{pageNum}</span> / <span>{totalPages || '-'}</span>
          </div>
          <button className="btn-nav" onClick={nextPage}>
            Következő <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </main>

      <NonPremiumAd enabled={Boolean(isAuthenticated && user && !user.isSubscriber)} surface="reader" />
    </div>
  );
};

export default Reader;
