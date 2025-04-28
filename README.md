# ZynoFlix Admin Dashboard

This admin dashboard allows you to automate the process of finding, downloading, and uploading YouTube videos to your ZynoFlix OTT platform.

## Features

- Search YouTube videos using YouTube API v3
- Download selected videos in high quality
- Compress videos for preview
- Upload videos to Azure Blob Storage
- Save video metadata to MongoDB
- Batch process multiple videos at once

## Prerequisites

You need to have the following installed:

- Node.js (v16+)
- FFmpeg and FFprobe for video processing
- yt-dlp/youtube-dl for downloading videos

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # YouTube API
   YOUTUBE_API_KEY=your_youtube_api_key_here

   # Azure Storage
   AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string_here
   AZURE_STORAGE_CONTAINER_NAME=zynoflix-ott

   # MongoDB
   MONGODB_URI=mongodb+srv://gokula2323:wqSbxeNfSxVd1eyw@cluster0.vd91zsm.mongodb.net/ott?retryWrites=true&w=majority
   DEFAULT_USER_ID=66cb15b1fbbbaed0d6f22e53
   ```

4. Install youtube-dl or yt-dlp:
   ```bash
   # On macOS
   brew install yt-dlp

   # On Linux
   sudo apt-get install yt-dlp

   # Or with Python
   pip install yt-dlp
   ```

5. Install FFmpeg:
   ```bash
   # On macOS
   brew install ffmpeg

   # On Linux
   sudo apt-get install ffmpeg
   ```

## Development

```bash
npm run dev
```

## Building for Production

```bash
npm run build
npm start
```

## Usage

1. Enter a search query and set the limit for the number of videos to search
2. Select videos from the search results
3. Click "Process Selected Videos" to start the automation
4. Monitor the progress in the status indicator
5. Once completed, the uploaded videos will appear in the "Recently Uploaded Videos" section

## Troubleshooting

- Ensure your YouTube API key has proper permissions for search and video info
- Make sure Azure Storage connection string is valid and the container exists
- Verify that MongoDB connection string has proper authentication credentials
- Check that FFmpeg and yt-dlp are installed and accessible in your PATH
