import React, { useState, useEffect } from 'react';
import '../styles/watch.css';

const Watch: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('Videó lejátszása');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Alap videó URL amíg nincs adatbázis
  const defaultVideoUrl = 'https://ds2play.com/e/t4st85of3gj1';
  const defaultTitle = 'Interstellar';

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video') || '';
    const titleParam = urlParams.get('title') || defaultTitle;
    const tagsParam = urlParams.get('tags') || '';
    const descParam = urlParams.get('desc') || '';

    // Set video URL - use param or fetch from API or use default
    const finalVideoUrl = (videoParam && videoParam.trim()) ? videoParam : defaultVideoUrl;
    
    setVideoUrl(finalVideoUrl);
    setTitle(titleParam);
    setDescription(descParam);
    
    // Parse tags
    if (tagsParam) {
      const tagArray = tagsParam.split(',').map(t => t.trim()).filter(t => t);
      setTags(tagArray);
    }

    // Update page title
    document.title = titleParam + ' - KönyvKocka';
    
    // Simulate loading
    setTimeout(() => setLoading(false), 500);

    // TODO: Itt fog majd a valódi API végpontból fetchelni
    // fetchVideoFromAPI();
  }, []);

  // const fetchVideoFromAPI = async () => {
  //   try {
  //     // Példa: const response = await fetch('/api/videos/current');
  //     // const data = await response.json();
  //     // setVideoUrl(data.videoUrl);
  //     // setTitle(data.title);
  //     // setTags(data.tags);
  //     // setDescription(data.description);
  //   } catch (err) {
  //     console.error('Video fetch error:', err);
  //   }
  // };

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
                  ) : videoUrl ? (
                    <iframe
                      src={videoUrl}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Watch;
