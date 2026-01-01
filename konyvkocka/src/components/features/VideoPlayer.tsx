import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  return (
    <div className="video-player-container">
      {title && <h2>{title}</h2>}
      <div className="video-wrapper">
        <iframe
          src={videoUrl}
          title={title || "Video Player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-iframe"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;
