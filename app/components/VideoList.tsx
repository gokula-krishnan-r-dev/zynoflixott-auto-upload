'use client';

import { useState } from 'react';
import { VideoItem } from '../types/video';

interface VideoListProps {
  videos: VideoItem[];
  onProcessVideos: (selectedVideos: VideoItem[]) => void;
  isLoading: boolean;
}

export default function VideoList({ videos, onProcessVideos, isLoading }: VideoListProps) {
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([]);

  const toggleSelectVideo = (video: VideoItem) => {
    if (selectedVideos.some(v => v.id.videoId === video.id.videoId)) {
      setSelectedVideos(selectedVideos.filter(v => v.id.videoId !== video.id.videoId));
    } else {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  const isSelected = (video: VideoItem) => {
    return selectedVideos.some(v => v.id.videoId === video.id.videoId);
  };

  const handleProcessVideos = () => {
    if (selectedVideos.length > 0) {
      onProcessVideos(selectedVideos);
    }
  };

  const selectAll = () => {
    setSelectedVideos([...videos]);
  };

  const deselectAll = () => {
    setSelectedVideos([]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {videos.length} videos found
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={isLoading || videos.length === 0}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Select All
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            onClick={deselectAll}
            disabled={isLoading || selectedVideos.length === 0}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Deselect All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            className={`border rounded-lg overflow-hidden transition-all ${
              isSelected(video)
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => toggleSelectVideo(video)}
          >
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isSelected(video)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected(video) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                {video.snippet.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {video.snippet.channelTitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {video.snippet.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleProcessVideos}
          disabled={isLoading || selectedVideos.length === 0}
          className={`rounded-md px-4 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isLoading || selectedVideos.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isLoading
            ? 'Processing...'
            : `Process ${selectedVideos.length} Selected Video${selectedVideos.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
} 