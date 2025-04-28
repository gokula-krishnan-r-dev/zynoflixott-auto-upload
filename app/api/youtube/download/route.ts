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
    const thumbnailFilename = `${videoId}.webp`;
    
    const videoPath = path.join(TEMP_DIR, videoFilename);
    const thumbnailPath = path.join(TEMP_DIR, thumbnailFilename);

    // Log the download operation
    console.log(`Starting download for YouTube video: ${videoId}`);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      // Download video
      await execPromise(`yt-dlp -f "best[height<=720]" "${videoUrl}" -o "${videoPath}"`);
      
      // Download thumbnail directly using yt-dlp thumbnail extraction feature
      // Instead of using --write-thumbnail with a separate command, download the thumbnail using ffmpeg
      const thumbCommand = `ffmpeg -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
      await execPromise(thumbCommand);
      
      // Verify thumbnail exists
      if (!fs.existsSync(thumbnailPath)) {
        console.log("Thumbnail wasn't created with ffmpeg, trying alternative method...");
        // Alternative method: download thumbnail directly with yt-dlp and rename it
        const tempThumbPath = path.join(TEMP_DIR, `thumb-${timestamp}.jpg`);
        await execPromise(`yt-dlp --write-thumbnail --skip-download --convert-thumbnails jpg "${videoUrl}" -o "${tempThumbPath}"`);
        
        // Find the downloaded thumbnail which might have a different extension
        const tempDir = fs.readdirSync(TEMP_DIR);
        const thumbFile = tempDir.find(file => 
          file.startsWith(`thumb-${timestamp}`) && 
          (file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
        );
        
        if (thumbFile) {
          // Copy the found thumbnail to the expected thumbnail path
          fs.copyFileSync(path.join(TEMP_DIR, thumbFile), thumbnailPath);
          // Delete the original thumbnail
          fs.unlinkSync(path.join(TEMP_DIR, thumbFile));
        } else {
          // If all else fails, create a simple black image as thumbnail
          await execPromise(`ffmpeg -f lavfi -i color=c=black:s=1280x720 -frames:v 1 "${thumbnailPath}"`);
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