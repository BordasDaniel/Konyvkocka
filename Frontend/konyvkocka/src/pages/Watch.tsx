import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getContentDetail,
  parseContentKey,
  recordContentView,
  SESSION_STORAGE_KEY,
  type NormalizedContentType,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toEmbedVideoUrl } from '../utils/helpers';
import '../styles/watch.css';

interface WatchLocationState {
	contentId?: number;
	contentType?: NormalizedContentType;
}

const Watch: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('Videó lejátszása');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const embedVideoUrl = toEmbedVideoUrl(videoUrl);

  useEffect(() => {
    let isMounted = true;

    const loadWatchContent = async () => {
      if (isAuthLoading) return;
      if (!isAuthenticated) {
        if (isMounted) {
          setVideoUrl('');
          setTitle('Videó lejátszása');
          setDescription('');
          setTags([]);
          setError('A tartalom megtekinteshez be kell jelentkezned.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const urlParams = new URLSearchParams(location.search);
      const contentParam = urlParams.get('content');
      const state = (location.state as WatchLocationState | null) ?? null;

      const parsed = contentParam ? parseContentKey(contentParam) : null;
      const requestedType = parsed?.type ?? state?.contentType;
      const requestedId = parsed?.id ?? state?.contentId;

      try {
        if (requestedType && typeof requestedId === 'number') {
          const detail = await getContentDetail(requestedType, requestedId);
          if (!isMounted) return;

          const token = localStorage.getItem(SESSION_STORAGE_KEY);
          if (token && token.trim().length > 0) {
            void recordContentView({ contentType: requestedType, contentId: requestedId }).catch((trackError) => {
              console.warn('View tracking failed on watch page:', trackError);
            });
          }

          const resolvedVideoUrl = detail.watchUrl ?? detail.episodes?.[0]?.streamUrl ?? '';
          const resolvedEmbedUrl = toEmbedVideoUrl(resolvedVideoUrl);
          setVideoUrl(resolvedVideoUrl);
          setTitle(detail.title || 'Video lejatszas');
          setDescription(detail.description || '');
          setTags(detail.tags ?? []);
          document.title = `${detail.title || 'Video'} - KonyvKocka`;

          if (!resolvedVideoUrl) {
            setError('A kivalasztott tartalomhoz nincs lejatszhato video URL.');
          } else if (!resolvedEmbedUrl) {
            setError('A kivalasztott tartalomhoz nincs beagyazhato video link.');
          }
        } else {
          setVideoUrl('');
          setTitle('Videó lejátszása');
          setDescription('');
          setTags([]);
          document.title = 'Videó lejátszása - KonyvKocka';
          setError('Nincs megadott tartalom ehhez az oldalhoz.');
        }
      } catch (loadError) {
        if (!isMounted) return;
        console.error('Video fetch error:', loadError);
        setVideoUrl('');
        setError('A video adatok betoltese sikertelen.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadWatchContent();

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
            <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Tartalom megtekintesehez jelentkezz be a fiokodba.</p>
            <Link to="/belepes" className="btn btn-primary">
              Bejelentkezes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="mt-5">
      <div className="container py-5">
        <h1 className="mb-4 text-center display-6 fw-bold text-decoration-underline">{title}</h1>
        <div className="row gx-5">
          <div className="col-md-12">
            <div className="about-panel">
              {/* Video player */}
              <div className="video-player-wrapper">
                <div id="videoPlayerContainer" className="video-player">
                  {loading ? (
                    <div className="loading-state">
                      <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Betöltés...</span>
                      </div>
                      <p className="mt-3">Videó betöltése...</p>
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <i className="bi bi-exclamation-triangle"></i>
                      <p>{error}</p>
                    </div>
                  ) : embedVideoUrl ? (
                    <iframe
                    src={embedVideoUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      frameBorder="0"
                      scrolling="no"
                    ></iframe>
                  ) : (
                    <div className="error-state">
                      <i className="bi bi-exclamation-triangle"></i>
                      <p>Nincs elérhető videó.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video info */}
              <div className="video-info-card">
                <h2 id="videoTitle" className="video-title">{title}</h2>
                <div id="videoMeta" className="video-meta">
                  {tags.length > 0 && (
                    <div className="tags" id="videoTags">
                      {tags.map((tag, index) => (
                        <span key={index}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {description && (
                    <p id="videoDesc" className="video-description">{description}</p>
                  )}
                </div>
                {/* Episode-like quick action inside the info card */}
                {!error && embedVideoUrl && (
                  <div
                    className="episode-box"
                    id="episodeBox"
                    role="button"
                    tabIndex={0}
                    aria-label="Teljes film – oldal frissítése"
                    onClick={handleRefresh}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRefresh();
                      }
                    }}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Teljes film
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Watch;
