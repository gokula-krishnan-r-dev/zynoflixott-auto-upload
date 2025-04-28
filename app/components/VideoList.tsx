'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {videos.length} videos found
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={selectAll}
            disabled={isLoading || videos.length === 0}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Select All
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={deselectAll}
            disabled={isLoading || selectedVideos.length === 0}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Deselect All
          </motion.button>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id.videoId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className={`border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
              isSelected(video)
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
            }`}
            onClick={() => toggleSelectVideo(video)}
          >
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 left-3 flex items-center text-white text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Click to select</span>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isSelected(video) ? 1 : 0.8,
                    opacity: isSelected(video) ? 1 : 0.9
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isSelected(video)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected(video) && (
                    <motion.svg 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                </motion.div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                {video.snippet.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {video.snippet.channelTitle}
              </p>
              <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                {video.statistics?.viewCount && (
                  <span className="flex items-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {Number(video.statistics.viewCount).toLocaleString()}
                  </span>
                )}
                {video.statistics?.likeCount && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {Number(video.statistics.likeCount).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleProcessVideos}
          disabled={isLoading || selectedVideos.length === 0}
          className={`rounded-md px-6 py-2.5 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
            isLoading || selectedVideos.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'
          }`}
        >
          {isLoading
            ? 'Processing...'
            : `Process ${selectedVideos.length} Selected Video${selectedVideos.length !== 1 ? 's' : ''}`}
        </motion.button>
      </motion.div>
    </div>
  );
} 