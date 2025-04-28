export interface VideoItem {
  id: {
    videoId: string;
    kind: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
  };
  statistics?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  selected?: boolean;
}

export interface UploadedVideo {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  preview_video: string;
  original_video: string;
  language: string[];
  views: number;
  likes: number;
  duration: string;
  category: string[];
  certification: string;
} 