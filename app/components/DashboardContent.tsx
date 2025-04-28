'use client';

import { useState } from 'react';
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
    } catch (err) {
      setError((err as Error).message || 'An error occurred during processing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">YouTube Video Automation</h2>
        
        <SearchForm 
          onSearch={handleSearch} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          limit={limit}
          setLimit={setLimit}
          isLoading={isLoading}
        />
        
        {isLoading && (
          <StatusIndicator status={currentStatus} />
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      {videos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Search Results</h2>
          <VideoList 
            videos={videos} 
            onProcessVideos={handleDownloadAndUpload}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {uploadedVideos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recently Uploaded Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadedVideos.map((video, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {video.views.toLocaleString()} views · {video.likes.toLocaleString()} likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 