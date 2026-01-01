import React, { useState, useEffect, useRef } from 'react';
import '../styles/reader.css';

// PDF.js types
declare const pdfjsLib: any;

interface Bookmark {
  page: number;
  title: string;
  timestamp: string;
}

const Reader: React.FC = () => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pendingScrollRatio = useRef<number | null>(null);

  // Get PDF URL from query parameter or use default
  const urlParams = new URLSearchParams(window.location.search);
  const pdfUrl = urlParams.get('pdf') || '/assets/pdf/Antoine_de_Saint_Exupery_A_kis_herceg_1.pdf';

  useEffect(() => {
    // Load PDF.js library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPDF(pdfUrl);
      }
    };
    document.body.appendChild(script);

    // Load saved bookmarks
    const savedBookmarks = localStorage.getItem('kk_bookmarks_' + pdfUrl);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

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
      document.body.removeChild(script);
    };
  }, []);

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

    try {
      const loadingTask = pdfjsLib.getDocument({
        url,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        enableXfa: false
      });
      
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
      setError('A PDF fájl nem található vagy sérült.');
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
    const newBookmarks = bookmarks.filter((_, i) => i !== idx);
    setBookmarks(newBookmarks);
    localStorage.setItem('kk_bookmarks_' + pdfUrl, JSON.stringify(newBookmarks));
  };

  const downloadPdf = () => {
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
          <a href="/kereses" className="btn-action btn-outline">
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
              <a href="/kereses" className="btn btn-outline-light mt-3">
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
    </div>
  );
};

export default Reader;
