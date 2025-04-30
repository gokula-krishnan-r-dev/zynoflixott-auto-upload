import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Temporary directory for downloaded files
const TEMP_DIR = path.join(process.cwd(), 'tmp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Generate unique filenames based on video ID and timestamp
    const timestamp = Date.now();
    const videoFilename = `${videoId}-${timestamp}.mp4`;
    const thumbnailFilename = `${videoId}-${timestamp}.webp`;
    
    const videoPath = path.join(TEMP_DIR, videoFilename);
    const thumbnailPath = path.join(TEMP_DIR, thumbnailFilename);

    // Log the download operation
    console.log(`Starting download for YouTube video: ${videoId}`);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      // Download video
      await execPromise(`sudo yt-dlp  --cookies /home/azureuser/youtube.com_cookies.txt -f "best[height<=720]" "${videoUrl}" -o "${videoPath}"`);
      
      // Try downloading the thumbnail directly with yt-dlp first (more reliable)
      console.log("Downloading thumbnail with yt-dlp...");
      const thumbBaseName = path.join(TEMP_DIR, `${videoId}-${timestamp}`);
      await execPromise(`yt-dlp --write-thumbnail --skip-download "${videoUrl}" -o "${thumbBaseName}"`);
      
      // Find the downloaded thumbnail which might have various extensions
      const tempDir = fs.readdirSync(TEMP_DIR);
      const thumbPattern = new RegExp(`${videoId}-${timestamp}\\.(jpg|webp|png)$`);
      const thumbFile = tempDir.find(file => thumbPattern.test(file));
      
      if (thumbFile) {
        // Found a thumbnail downloaded by yt-dlp
        const downloadedThumbPath = path.join(TEMP_DIR, thumbFile);
        fs.copyFileSync(downloadedThumbPath, thumbnailPath);
        console.log(`Thumbnail downloaded successfully with yt-dlp: ${thumbFile}`);
      } else {
        // Fallback: extract thumbnail from video using ffmpeg
        console.log("Thumbnail not found with yt-dlp, extracting from video with ffmpeg...");
        const thumbCommand = `ffmpeg -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
        await execPromise(thumbCommand);
        
        // Verify the ffmpeg extraction worked
        if (!fs.existsSync(thumbnailPath)) {
          console.log("Thumbnail extraction failed with ffmpeg, creating fallback thumbnail");
          // Last resort: create a simple colored thumbnail
          await execPromise(`ffmpeg -f lavfi -i color=c=blue:s=1280x720 -frames:v 1 "${thumbnailPath}"`);
        }
      }
      
      // Verify final thumbnail exists
      if (!fs.existsSync(thumbnailPath)) {
        throw new Error("Failed to create thumbnail by any method");
      }
      
      // Get video duration
      const { stdout: durationOutput } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`);
      const duration = parseFloat(durationOutput.trim());
      
      console.log(`Download completed for YouTube video: ${videoId}`);
      console.log(`Thumbnail saved at: ${thumbnailPath}`);
      
      return NextResponse.json({
        videoPath,
        thumbnailPath,
        duration: duration.toString(),
        message: 'Video downloaded successfully'
      });
    } catch (error) {
      console.error('Download error:', error);
      return NextResponse.json(
        { error: 'Failed to download video. Make sure youtube-dl/yt-dlp and ffmpeg are installed on the server.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in YouTube download API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 