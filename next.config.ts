import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    MONGODB_URI: process.env.MONGODB_URI,
    DEFAULT_USER_ID: process.env.DEFAULT_USER_ID,
  },
  experimental: {
    serverComponentsExternalPackages: ['ytdl-core', 'ffmpeg', 'ffprobe'],
  },
};

export default nextConfig;
