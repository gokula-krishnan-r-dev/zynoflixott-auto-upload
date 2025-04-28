import { NextRequest, NextResponse } from 'next/server';

// Get your API key from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    // Get search query and limit from the URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Validate inputs
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured');
      return NextResponse.json(
        { error: 'YouTube API is not configured' },
        { status: 500 }
      );
    }

    // Fetch videos from YouTube API
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&maxResults=${limit}&type=video&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch videos from YouTube' },
        { status: response.status }
      );
    }

    // Get video statistics for each video
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      console.error('YouTube API statistics error:', statsData);
      // Continue without statistics if there's an error
    } else {
      // Merge statistics with video data
      data.items = data.items.map((item: any) => {
        const stats = statsData.items.find((stat: any) => stat.id === item.id.videoId);
        if (stats) {
          return {
            ...item,
            statistics: stats.statistics
          };
        }
        return item;
      });
    }

    // Log the search operation
    console.log(`YouTube search for "${query}" returned ${data.items.length} results`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in YouTube search API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 