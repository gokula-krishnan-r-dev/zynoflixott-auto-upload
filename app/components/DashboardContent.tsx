'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoList from './VideoList';
import SearchForm from './SearchForm';
import StatusIndicator from './StatusIndicator';
import { VideoItem } from '../types/video';

export default function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<VideoItem[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'search' | 'uploaded'>('search');

  // Load any previously uploaded videos from localStorage on initial load
  useEffect(() => {
    const savedVideos = localStorage.getItem('uploadedVideos');
    if (savedVideos) {
      try {
        const parsedVideos = JSON.parse(savedVideos);
        setUploadedVideos(parsedVideos);
        if (parsedVideos.length > 0) {
          setActiveTab('uploaded');
        }
      } catch (e) {
        console.error('Failed to parse saved videos');
      }
    }
  }, []);

  // Save uploaded videos to localStorage when they change
  useEffect(() => {
    if (uploadedVideos.length > 0) {
      localStorage.setItem('uploadedVideos', JSON.stringify(uploadedVideos));
    }
  }, [uploadedVideos]);

  const handleSearch = async (query: string, videoLimit: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentStatus('Searching YouTube for videos...');
      
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&limit=${videoLimit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos from YouTube');
      }
      
      const data = await response.json();
      setVideos(data.items);
      setCurrentStatus('Search completed. Select videos to download.');
      setActiveTab('search');
    } catch (err) {
      setError((err as Error).message || 'An error occurred while searching videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAndUpload = async (selectedVideos: VideoItem[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      for (let i = 0; i < selectedVideos.length; i++) {
        const video = selectedVideos[i];
        setCurrentStatus(`Processing video ${i+1}/${selectedVideos.length}: ${video.snippet.title}`);
        
        // Step 1: Download video
        const downloadResponse = await fetch('/api/youtube/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: video.id.videoId }),
        });
        
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download video: ${video.snippet.title}`);
        }
        
        const downloadData = await downloadResponse.json();
        
        // Step 2: Upload to Azure Blob Storage
        setCurrentStatus(`Uploading video to Azure: ${video.snippet.title}`);
        const uploadResponse = await fetch('/api/azure/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            videoPath: downloadData.videoPath,
            thumbnailPath: downloadData.thumbnailPath,
            videoDetails: {
              title: video.snippet.title,
              description: video.snippet.description,
              viewCount: video.statistics?.viewCount || 0,
              likeCount: video.statistics?.likeCount || 0,
            }
          }),
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload video to Azure: ${video.snippet.title}`);
        }
        
        const uploadData = await uploadResponse.json();
        
        // Step 3: Save to MongoDB
        setCurrentStatus(`Saving video details to database: ${video.snippet.title}`);
        const saveResponse = await fetch('/api/db/save-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: uploadData.thumbnailUrl,
            preview_video: uploadData.previewVideoUrl,
            original_video: uploadData.originalVideoUrl,
            language: ["english"], // Default, can be updated later
            views: video.statistics?.viewCount || 0,
            likes: video.statistics?.likeCount || 0,
            duration: downloadData.duration,
            category: ["general"], // Default, can be updated later
            certification: "U", // Default, can be updated later
          }),
        });
        
        if (!saveResponse.ok) {
          throw new Error(`Failed to save video details: ${video.snippet.title}`);
        }
        
        const savedVideo = await saveResponse.json();
        setUploadedVideos(prev => [...prev, savedVideo]);
      }
      
      setCurrentStatus('All videos processed successfully!');
      setActiveTab('uploaded');
    } catch (err) {
      setError((err as Error).message || 'An error occurred during processing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          YouTube Video Automation
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SearchForm 
            onSearch={handleSearch} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            limit={limit}
            setLimit={setLimit}
            isLoading={isLoading}
          />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="status"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StatusIndicator status={currentStatus} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {(videos.length > 0 || uploadedVideos.length > 0) && (
        <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors duration-300 relative ${
                activeTab === 'search' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('search')}
              disabled={videos.length === 0}
            >
              Search Results {videos.length > 0 && `(${videos.length})`}
              {activeTab === 'search' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" 
                />
              )}
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors duration-300 relative ${
                activeTab === 'uploaded' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('uploaded')}
              disabled={uploadedVideos.length === 0}
            >
              Uploaded Videos {uploadedVideos.length > 0 && `(${uploadedVideos.length})`}
              {activeTab === 'uploaded' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" 
                />
              )}
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'search' && videos.length > 0 && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VideoList 
                  videos={videos} 
                  onProcessVideos={handleDownloadAndUpload}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            
            {activeTab === 'uploaded' && uploadedVideos.length > 0 && (
              <motion.div
                key="uploaded-videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadedVideos.map((video, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-3 left-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-white font-medium">{video.views.toLocaleString()}</span>
                            
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white ml-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            <span className="text-xs text-white font-medium">{video.likes.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {video.title}
                        </h3>
                        <div className="flex items-center mt-2 text-xs">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                            {video.certification}
                          </span>
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            {Math.floor(parseInt(video.duration) / 60)}:{(parseInt(video.duration) % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
} 