import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ApiHttpError,
  getContentDetail,
  getHistoryItem,
  parseContentKey,
  recordContentView,
  SESSION_STORAGE_KEY,
  touchHistoryItem,
  updateHistory,
  type EpisodeResponse,
  type NormalizedContentType,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import NonPremiumAd from '../components/common/NonPremiumAd';
import { toEmbedVideoUrl } from '../utils/helpers';
import '../styles/watch.css';

interface WatchLocationState {
	contentId?: number;
	contentType?: NormalizedContentType;
}

const Watch: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('Videó lejátszása');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [availableEpisodes, setAvailableEpisodes] = useState<EpisodeResponse[]>([]);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [watchActionError, setWatchActionError] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState<number | null>(null);
  const [activeContentType, setActiveContentType] = useState<NormalizedContentType | null>(null);
  const [isCompletedLocked, setIsCompletedLocked] = useState<boolean>(false);
  const [movieProgressMinutes, setMovieProgressMinutes] = useState<number>(0);
  const [seriesProgress, setSeriesProgress] = useState<number>(1);
  const [totalUnits, setTotalUnits] = useState<number | null>(null);
  const [markCompleteLoading, setMarkCompleteLoading] = useState<boolean>(false);

  const progressReadyRef = useRef<boolean>(false);
  const lastSavedMovieProgressRef = useRef<number>(0);
  const lastSavedSeriesProgressRef = useRef<number>(0);
  const movieBaseProgressRef = useRef<number>(0);
  const movieStartMsRef = useRef<number | null>(null);

  const embedVideoUrl = toEmbedVideoUrl(videoUrl);

  const handleLoginRedirect = () => {
    window.location.href = '#/belepes';
  };

  useEffect(() => {
    let isMounted = true;

    const loadWatchContent = async () => {
      progressReadyRef.current = false;

      if (isAuthLoading) return;
      if (!isAuthenticated) {
        if (isMounted) {
          setVideoUrl('');
          setTitle('Videó lejátszása');
          setDescription('');
          setTags([]);
          setAvailableEpisodes([]);
          setSelectedEpisodeIndex(0);
          setActiveContentId(null);
          setActiveContentType(null);
          setIsCompletedLocked(false);
          setMovieProgressMinutes(0);
          setSeriesProgress(1);
          setTotalUnits(null);
          setWatchActionError(null);
          setError('A tartalom megtekinteshez be kell jelentkezned.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      setWatchActionError(null);

      const urlParams = new URLSearchParams(location.search);
      const contentParam = urlParams.get('content');
      const state = (location.state as WatchLocationState | null) ?? null;

      const parsed = contentParam ? parseContentKey(contentParam) : null;
      const requestedType = parsed?.type ?? state?.contentType;
      const requestedId = parsed?.id ?? state?.contentId;

      try {
        if (requestedType && typeof requestedId === 'number' && (requestedType === 'movie' || requestedType === 'series')) {
          const detail = await getContentDetail(requestedType, requestedId);
          if (!isMounted) return;

          setActiveContentType(requestedType);
          setActiveContentId(requestedId);
          setTitle(detail.title || 'Video lejatszas');
          setDescription(detail.description || '');
          setTags(detail.tags ?? []);

          const seriesEpisodes = detail.episodes ?? [];
          setAvailableEpisodes(seriesEpisodes);

          const loadHistorySnapshot = async () => {
            try {
              return await getHistoryItem(requestedType, requestedId);
            } catch (historyError) {
              if (historyError instanceof ApiHttpError && historyError.status === 404) {
                return null;
              }

              console.warn('Előzmény lekérése sikertelen a nézés oldalhoz:', historyError);
              return null;
            }
          };

          let historyItem = await loadHistorySnapshot();

          const token = localStorage.getItem(SESSION_STORAGE_KEY);
          if (!historyItem && token && token.trim().length > 0) {
            try {
              await recordContentView({ contentType: requestedType, contentId: requestedId });
              historyItem = await loadHistorySnapshot();
            } catch (trackError) {
              console.warn('View tracking failed on watch page:', trackError);
            }
          } else if (historyItem && token && token.trim().length > 0) {
            void touchHistoryItem({ contentType: requestedType, contentId: requestedId }).catch((touchError) => {
              console.warn('History touch failed on watch page:', touchError);
            });
          }

          const historyStatus = (historyItem?.status ?? '').toUpperCase();
          const completedLocked = historyStatus === 'COMPLETED';
          setIsCompletedLocked(completedLocked);

          const normalizedTotalUnits = typeof historyItem?.totalUnits === 'number' && historyItem.totalUnits > 0
            ? Math.floor(historyItem.totalUnits)
            : null;
          setTotalUnits(normalizedTotalUnits);

          const savedProgress = Math.max(0, Math.floor(historyItem?.progress ?? 0));

          if (requestedType === 'movie') {
            setSelectedEpisodeIndex(0);
            setSeriesProgress(1);
            lastSavedSeriesProgressRef.current = 1;

            const restoredMinutes = savedProgress;
            setMovieProgressMinutes(restoredMinutes);
            lastSavedMovieProgressRef.current = restoredMinutes;
            movieBaseProgressRef.current = restoredMinutes;
            movieStartMsRef.current = Date.now();

            const resolvedVideoUrl = detail.watchUrl ?? seriesEpisodes[0]?.streamUrl ?? '';
            const resolvedEmbedUrl = toEmbedVideoUrl(resolvedVideoUrl);
            setVideoUrl(resolvedVideoUrl);

            if (!resolvedVideoUrl) {
              setError('A kivalasztott tartalomhoz nincs lejatszhato video URL.');
            } else if (!resolvedEmbedUrl) {
              setError('A kivalasztott tartalomhoz nincs beagyazhato video link.');
            }
          } else {
            // series
            setMovieProgressMinutes(0);
            lastSavedMovieProgressRef.current = 0;
            movieBaseProgressRef.current = 0;
            movieStartMsRef.current = null;

            const fallbackEpisodeProgress = savedProgress > 0 ? savedProgress : 1;
            const safeEpisodeProgress = Math.max(1, Math.min(seriesEpisodes.length || 1, fallbackEpisodeProgress));
            const safeIndex = Math.max(0, Math.min(seriesEpisodes.length - 1, safeEpisodeProgress - 1));

            setSeriesProgress(safeEpisodeProgress);
            lastSavedSeriesProgressRef.current = safeEpisodeProgress;
            setSelectedEpisodeIndex(safeIndex);

            const resolvedVideoUrl = seriesEpisodes[safeIndex]?.streamUrl ?? detail.watchUrl ?? '';
            const resolvedEmbedUrl = toEmbedVideoUrl(resolvedVideoUrl);
            setVideoUrl(resolvedVideoUrl);

            if (!resolvedVideoUrl) {
              setError('A kivalasztott tartalomhoz nincs lejatszhato video URL.');
            } else if (!resolvedEmbedUrl) {
              setError('A kivalasztott tartalomhoz nincs beagyazhato video link.');
            }
          }

          progressReadyRef.current = true;

          document.title = `${detail.title || 'Video'} - KonyvKocka`;
        } else {
          setVideoUrl('');
          setTitle('Videó lejátszása');
          setDescription('');
          setTags([]);
          setAvailableEpisodes([]);
          setSelectedEpisodeIndex(0);
          setActiveContentId(null);
          setActiveContentType(null);
          setIsCompletedLocked(false);
          setMovieProgressMinutes(0);
          setSeriesProgress(1);
          setTotalUnits(null);
          setWatchActionError(null);
          document.title = 'Videó lejátszása - KonyvKocka';
          setError('Nincs megadott tartalom ehhez az oldalhoz.');
        }
      } catch (loadError) {
        if (!isMounted) return;
        console.error('Video fetch error:', loadError);
        setVideoUrl('');
        setAvailableEpisodes([]);
        setSelectedEpisodeIndex(0);
        setActiveContentId(null);
        setActiveContentType(null);
        setIsCompletedLocked(false);
        setMovieProgressMinutes(0);
        setSeriesProgress(1);
        setTotalUnits(null);
        setWatchActionError(null);
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

  useEffect(() => {
    if (!isAuthenticated || activeContentType !== 'movie' || !activeContentId || loading || !!error) return;
    if (!progressReadyRef.current || isCompletedLocked) return;

    if (!movieStartMsRef.current) {
      movieStartMsRef.current = Date.now();
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || isCompletedLocked) return;
      const startedAt = movieStartMsRef.current;
      if (!startedAt) return;

      const elapsedMinutes = Math.floor((Date.now() - startedAt) / 60000);
      const nextProgress = movieBaseProgressRef.current + elapsedMinutes;
      setMovieProgressMinutes((previous) => (nextProgress > previous ? nextProgress : previous));
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeContentId, activeContentType, error, isAuthenticated, isCompletedLocked, loading]);

  useEffect(() => {
    if (!isAuthenticated || activeContentType !== 'movie' || !activeContentId || loading || !!error) return;
    if (!progressReadyRef.current || isCompletedLocked) return;

    const normalizedProgress = Math.max(0, Math.floor(movieProgressMinutes));
    if (normalizedProgress <= lastSavedMovieProgressRef.current) return;

    const timer = window.setTimeout(async () => {
      try {
        await updateHistory({
          contentType: 'movie',
          contentId: activeContentId,
          progress: normalizedProgress,
          status: 'WATCHING',
        });
        lastSavedMovieProgressRef.current = normalizedProgress;
      } catch (saveError) {
        if (saveError instanceof ApiHttpError && saveError.status === 404) {
          try {
            await recordContentView({ contentType: 'movie', contentId: activeContentId });
            await updateHistory({
              contentType: 'movie',
              contentId: activeContentId,
              progress: normalizedProgress,
              status: 'WATCHING',
            });
            lastSavedMovieProgressRef.current = normalizedProgress;
          } catch (retryError) {
            console.warn('Filmes előrehaladás mentése sikertelen (retry):', retryError);
          }
          return;
        }

        console.warn('Filmes előrehaladás mentése sikertelen:', saveError);
      }
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeContentId, activeContentType, error, isAuthenticated, isCompletedLocked, loading, movieProgressMinutes]);

  useEffect(() => {
    if (!isAuthenticated || activeContentType !== 'series' || !activeContentId || loading || !!error) return;
    if (!progressReadyRef.current || isCompletedLocked) return;

    const normalizedProgress = Math.max(1, Math.floor(seriesProgress));
    if (normalizedProgress === lastSavedSeriesProgressRef.current) return;

    const timer = window.setTimeout(async () => {
      try {
        await updateHistory({
          contentType: 'series',
          contentId: activeContentId,
          progress: normalizedProgress,
          status: 'WATCHING',
        });
        lastSavedSeriesProgressRef.current = normalizedProgress;
      } catch (saveError) {
        if (saveError instanceof ApiHttpError && saveError.status === 404) {
          try {
            await recordContentView({ contentType: 'series', contentId: activeContentId });
            await updateHistory({
              contentType: 'series',
              contentId: activeContentId,
              progress: normalizedProgress,
              status: 'WATCHING',
            });
            lastSavedSeriesProgressRef.current = normalizedProgress;
          } catch (retryError) {
            console.warn('Sorozat előrehaladás mentése sikertelen (retry):', retryError);
          }
          return;
        }

        console.warn('Sorozat előrehaladás mentése sikertelen:', saveError);
      }
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeContentId, activeContentType, error, isAuthenticated, isCompletedLocked, loading, seriesProgress]);

  useEffect(() => {
    if (!isAuthenticated || !activeContentType || !activeContentId || loading || !!error) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      const sendWatchHeartbeat = async () => {
        try {
          await touchHistoryItem({ contentType: activeContentType, contentId: activeContentId });
        } catch (touchError) {
          if (touchError instanceof ApiHttpError && touchError.status === 404) {
            try {
              await recordContentView({ contentType: activeContentType, contentId: activeContentId });
              await touchHistoryItem({ contentType: activeContentType, contentId: activeContentId });
            } catch (retryError) {
              console.warn('Nézési heartbeat mentése sikertelen (retry):', retryError);
            }
            return;
          }

          console.warn('Nézési heartbeat mentése sikertelen:', touchError);
        }
      };

      void sendWatchHeartbeat();
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeContentId, activeContentType, error, isAuthenticated, loading]);

  const handleEpisodeSelect = (index: number) => {
    if (index < 0 || index >= availableEpisodes.length) return;

    setSelectedEpisodeIndex(index);
    setVideoUrl(availableEpisodes[index].streamUrl);

    if (activeContentType === 'series' && !isCompletedLocked) {
      setSeriesProgress(index + 1);
    }
  };

  const handleMarkCompleted = async () => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    if (!activeContentType || !activeContentId || markCompleteLoading || isCompletedLocked) {
      return;
    }

    setMarkCompleteLoading(true);
    setWatchActionError(null);

    const completeProgress = activeContentType === 'movie'
      ? Math.max(1, totalUnits ?? movieProgressMinutes)
      : Math.max(1, totalUnits ?? seriesProgress);

    try {
      await updateHistory({
        contentType: activeContentType,
        contentId: activeContentId,
        progress: completeProgress,
        status: 'COMPLETED',
      });

      if (activeContentType === 'movie') {
        setMovieProgressMinutes(completeProgress);
        lastSavedMovieProgressRef.current = completeProgress;
        movieBaseProgressRef.current = completeProgress;
      } else {
        setSeriesProgress(completeProgress);
        lastSavedSeriesProgressRef.current = completeProgress;
      }

      setIsCompletedLocked(true);
    } catch (completeError) {
      if (completeError instanceof ApiHttpError && completeError.status === 404) {
        try {
          await recordContentView({ contentType: activeContentType, contentId: activeContentId });
          await updateHistory({
            contentType: activeContentType,
            contentId: activeContentId,
            progress: completeProgress,
            status: 'COMPLETED',
          });

          if (activeContentType === 'movie') {
            setMovieProgressMinutes(completeProgress);
            lastSavedMovieProgressRef.current = completeProgress;
            movieBaseProgressRef.current = completeProgress;
          } else {
            setSeriesProgress(completeProgress);
            lastSavedSeriesProgressRef.current = completeProgress;
          }

          setIsCompletedLocked(true);
          return;
        } catch (retryError) {
          console.warn('Befejezés mentése sikertelen (retry):', retryError);
          setWatchActionError('A befejezett állapot mentése sikertelen.');
          return;
        }
      }

      console.warn('Befejezés mentése sikertelen:', completeError);
      if (completeError instanceof ApiHttpError && completeError.message) {
        setWatchActionError(completeError.message);
      } else {
        setWatchActionError('A befejezett állapot mentése sikertelen.');
      }
    } finally {
      setMarkCompleteLoading(false);
    }
  };

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
    <>
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
                <div className="watch-progress-row">
                  {activeContentType === 'movie' ? (
                    <span className="watch-progress-pill">Mentett előrehaladás: {Math.max(0, movieProgressMinutes)} perc</span>
                  ) : activeContentType === 'series' ? (
                    <span className="watch-progress-pill">Mentett előrehaladás: {Math.max(1, seriesProgress)}. epizód</span>
                  ) : null}
                  {isCompletedLocked && (
                    <span className="watch-lock-pill"><i className="bi bi-lock-fill me-1"></i>Befejezett (zárolt)</span>
                  )}
                </div>
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

                {!error && embedVideoUrl && activeContentType === 'series' && availableEpisodes.length > 0 && (
                  <div className="watch-episodes-grid" aria-label="Epizód választó">
                    {availableEpisodes.map((episode, index) => {
                      const isActive = selectedEpisodeIndex === index;
                      return (
                        <button
                          key={episode.id}
                          type="button"
                          className={`watch-episode-chip${isActive ? ' active' : ''}`}
                          onClick={() => handleEpisodeSelect(index)}
                        >
                          S{episode.seasonNum}E{episode.episodeNum} - {episode.title}
                        </button>
                      );
                    })}
                  </div>
                )}

                {watchActionError && (
                  <p className="watch-action-error mb-0">{watchActionError}</p>
                )}

                {!error && embedVideoUrl && (
                  <div className="watch-action-row">
                    <button
                      type="button"
                      className="watch-complete-btn"
                      onClick={handleMarkCompleted}
                      disabled={markCompleteLoading || isCompletedLocked}
                    >
                      {isCompletedLocked
                        ? 'Befejezett (zárolt)'
                        : markCompleteLoading
                          ? 'Mentés...'
                          : 'Befejezettnek jelölöm'}
                    </button>
                  </div>
                )}

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

      <NonPremiumAd enabled={Boolean(isAuthenticated && user && !user.isSubscriber)} surface="watch" />
    </>
  );
};

export default Watch;
