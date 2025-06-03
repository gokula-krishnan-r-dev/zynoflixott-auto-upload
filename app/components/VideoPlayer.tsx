import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
    hlsUrl: string;
    poster?: string;
    width?: string | number;
    height?: string | number;
    autoPlay?: boolean;
    controls?: boolean;
    onError?: (error: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    hlsUrl,
    poster,
    width = '100%',
    height = 'auto',
    autoPlay = false,
    controls = true,
    onError
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentQuality, setCurrentQuality] = useState<string>('auto');
    const [availableQualities, setAvailableQualities] = useState<string[]>([]);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Clean up existing hls instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Function to handle errors
        const handleHlsError = (event: any, data: any) => {
            const errorMsg = `HLS Error: ${data.type} - ${data.details}`;
            console.error(errorMsg, data);
            setError(errorMsg);
            if (onError) onError(data);
        };

        // If HLS is supported natively, use it
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl;
            video.addEventListener('error', (e) => {
                const errorMsg = `Video Error: ${video.error?.message || 'Unknown error'}`;
                console.error(errorMsg, e);
                setError(errorMsg);
                if (onError) onError(e);
            });
        }
        // Otherwise use hls.js if it's supported by the browser
        else if (Hls.isSupported()) {
            const hls = new Hls({
                capLevelToPlayerSize: true,
                startLevel: -1, // Start with auto quality
            });

            hls.loadSource(hlsUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                // Extract available qualities from manifest
                const qualities = data.levels.map((level: any) => {
                    if (level.height) {
                        return `${level.height}p`;
                    }
                    return 'Unknown';
                });

                setAvailableQualities(['auto', ...qualities]);
                console.log('Available qualities:', qualities);

                if (autoPlay) {
                    video.play().catch(e => console.warn('Autoplay was prevented', e));
                }
            });

            hls.on(Hls.Events.ERROR, handleHlsError);

            hlsRef.current = hls;
        } else {
            setError('Your browser does not support HLS streaming');
            if (onError) onError(new Error('HLS not supported'));
        }

        // Cleanup on unmount
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [hlsUrl, autoPlay, onError]);

    // Function to change quality
    const changeQuality = (quality: string) => {
        if (!hlsRef.current) return;

        const hls = hlsRef.current;
        const currentTime = videoRef.current?.currentTime || 0;

        if (quality === 'auto') {
            hls.currentLevel = -1; // Auto quality
        } else {
            // Find the level index matching the requested quality
            const qualityHeight = parseInt(quality);
            const levelIndex = hls.levels.findIndex(level => level.height === qualityHeight);
            if (levelIndex !== -1) {
                hls.currentLevel = levelIndex;
            }
        }

        setCurrentQuality(quality);
    };

    return (
        <div className="video-player-container">
            <video
                ref={videoRef}
                poster={poster}
                controls={controls}
                style={{ width, height }}
                playsInline
            />

            {availableQualities.length > 0 && (
                <div className="quality-selector">
                    <select
                        value={currentQuality}
                        onChange={(e) => changeQuality(e.target.value)}
                        className="quality-dropdown"
                    >
                        {availableQualities.map(quality => (
                            <option key={quality} value={quality}>{quality}</option>
                        ))}
                    </select>
                </div>
            )}

            {error && (
                <div className="video-error">
                    {error}
                </div>
            )}

            <style jsx>{`
        .video-player-container {
          position: relative;
          width: ${typeof width === 'number' ? `${width}px` : width};
        }
        .quality-selector {
          position: absolute;
          bottom: 50px;
          right: 10px;
          z-index: 1;
        }
        .quality-dropdown {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 4px;
          font-size: 12px;
        }
        .video-error {
          background: rgba(255, 0, 0, 0.7);
          color: white;
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
        }
      `}</style>
        </div>
    );
};

export default VideoPlayer; 