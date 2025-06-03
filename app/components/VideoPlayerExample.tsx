import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface VideoPlayerExampleProps {
  videoData: {
    title: string;
    description: string;
    streaming: {
      hls: string;
      variants: Record<string, string>;
      resolutions: string[];
    };
    sourceResolution?: string;
    resolution?: {
      width: number;
      height: number;
      quality: string;
      bitrate: string;
    };
    thumbnail: string;
  };
}

const VideoPlayerExample: React.FC<VideoPlayerExampleProps> = ({ videoData }) => {
  const [error, setError] = useState<string | null>(null);

  const handlePlayerError = (err: any) => {
    console.error('Player error:', err);
    setError(`Error playing video: ${err.message || 'Unknown error'}`);
  };

  return (
    <div className="video-player-example">
      <h1>{videoData.title}</h1>

      <div className="player-container">
        <VideoPlayer
          hlsUrl={videoData.streaming.hls}
          poster={videoData.thumbnail}
          width="100%"
          height="auto"
          controls={true}
          autoPlay={false}
          onError={handlePlayerError}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="video-info">
        <h2>Video Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Source Resolution:</span>
            <span className="info-value quality-badge">
              {videoData.sourceResolution || 'Unknown'}
              {videoData.resolution?.bitrate && ` @ ${videoData.resolution.bitrate}`}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Video Dimensions:</span>
            <span className="info-value">
              {videoData.resolution ? `${videoData.resolution.width}×${videoData.resolution.height}` : 'Unknown'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Available Streaming Qualities:</span>
            <ul className="resolution-list">
              {videoData.streaming.resolutions.map(resolution => (
                <li key={resolution} className="resolution-item">
                  {resolution}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h2>Description</h2>
        <p>{videoData.description}</p>
      </div>

      <style jsx>{`
        .video-player-example {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .player-container {
          margin: 20px 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .error-message {
          background-color: #ffdddd;
          color: #ff0000;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .video-info {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .info-item {
          margin-bottom: 12px;
        }
        .info-label {
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }
        .quality-badge {
          display: inline-block;
          background-color: #4ade80;
          color: #064e3b;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
        }
        .resolution-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 8px 0 0 0;
        }
        .resolution-item {
          background-color: #e0e0e0;
          color: #333;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 16px;
        }
        h2 {
          font-size: 18px;
          margin: 16px 0 8px;
        }
        p {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayerExample; 