import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Path to yt-dlp executable (determined by 'which yt-dlp')
const YT_DLP_PATH = '/opt/homebrew/bin/yt-dlp';

// Temporary directory for downloaded files
const TEMP_DIR = path.join(process.cwd(), 'tmp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Quality format strings for yt-dlp with improved format selection for high quality
const QUALITY_FORMATS = {
  '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]',
  '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]',
  '540p': 'bestvideo[height<=540][ext=mp4]+bestaudio[ext=m4a]/best[height<=540][ext=mp4]/best[height<=540]',
  '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]',
  '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]',
  // '1440p': 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440][ext=mp4]/best[height<=1440]',
  // '2160p': 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160][ext=mp4]/best[height<=2160]', // 4K
  // 'highest': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' // Best available quality
};

// Verify yt-dlp is working
async function checkYtDlp() {
  try {
    const { stdout } = await execPromise(`${YT_DLP_PATH} --version`);
    console.log(`yt-dlp version: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.error('yt-dlp not found or not working:', error);
    return false;
  }
}

// Function to get available formats for a video
async function getAvailableFormats(videoUrl: string) {
  try {
    const { stdout } = await execPromise(`${YT_DLP_PATH} -F "${videoUrl}"`);
    console.log('Available formats:', stdout);

    // Parse the format information
    const formats = stdout.split('\n')
      .filter(line => line.match(/^\d+\s+/)) // Only lines starting with numbers
      .map(line => {
        const match = line.match(/^(\d+)\s+(\w+)\s+(\d+x\d+|\d+p)\s+(.+)$/);
        if (match) {
          const [_, formatId, extension, resolution, description] = match;
          return { formatId, extension, resolution, description };
        }
        return null;
      })
      .filter(Boolean);

    return formats;
  } catch (error) {
    console.error('Error getting available formats:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, quality = '1080p' } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Check if yt-dlp is available
    const ytDlpAvailable = await checkYtDlp();
    if (!ytDlpAvailable) {
      return NextResponse.json(
        { error: 'yt-dlp is not available on the server. Please install it first.' },
        { status: 500 }
      );
    }

    // Use the requested quality format or default to 1080p
    const formatString = QUALITY_FORMATS[quality as keyof typeof QUALITY_FORMATS] || QUALITY_FORMATS['1080p'];

    // Generate unique filenames based on video ID and timestamp
    const timestamp = Date.now();
    const videoFilename = `${videoId}-${timestamp}.mp4`;
    const thumbnailFilename = `${videoId}-${timestamp}.webp`;

    const videoPath = path.join(TEMP_DIR, videoFilename);
    const thumbnailPath = path.join(TEMP_DIR, thumbnailFilename);

    // Log the download operation
    console.log(`Starting download for YouTube video: ${videoId} at quality: ${quality}`);
    console.log(`Using format string: ${formatString}`);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Get available formats (for logging/debugging)
    console.log('Checking available formats for the video...');
    await getAvailableFormats(videoUrl);

    try {
      // Use absolute paths and optimize for high quality downloads
      const downloadCommand = `${YT_DLP_PATH} -f "${formatString}" "${videoUrl}" -o "${videoPath}" --merge-output-format mp4 --no-playlist --restrict-filenames`;
      console.log(`Command: ${downloadCommand}`);

      const { stdout, stderr } = await execPromise(downloadCommand);

      console.log("yt-dlp stdout:", stdout);
      if (stderr) {
        console.error("yt-dlp stderr:", stderr);
      }

      // Verify the video file exists and has size
      if (!fs.existsSync(videoPath)) {
        console.error(`Video file not found at expected path: ${videoPath}`);
        console.error(`Directory content: ${fs.readdirSync(TEMP_DIR).join(', ')}`);
        throw new Error(`Video file not created at expected path: ${videoPath}`);
      }

      const fileStats = fs.statSync(videoPath);
      if (fileStats.size === 0) {
        throw new Error(`Video file was created but has zero size: ${videoPath}`);
      }

      console.log(`Video file downloaded successfully: ${videoPath} (${fileStats.size} bytes)`);

      // Try downloading the thumbnail directly with yt-dlp first (more reliable)
      console.log("Downloading thumbnail with yt-dlp...");
      const thumbBaseName = path.join(TEMP_DIR, `${videoId}-${timestamp}`);
      await execPromise(`${YT_DLP_PATH} --write-thumbnail --skip-download "${videoUrl}" -o "${thumbBaseName}"`);

      // Find the downloaded thumbnail which might have various extensions
      const tempDir = fs.readdirSync(TEMP_DIR);
      const thumbPattern = new RegExp(`${videoId}-${timestamp}\\.(jpg|webp|png)$`);
      const thumbFile = tempDir.find(file => thumbPattern.test(file));

      if (thumbFile) {
        // Found a thumbnail downloaded by yt-dlp
        const downloadedThumbPath = path.join(TEMP_DIR, thumbFile);
        if (downloadedThumbPath !== thumbnailPath) {
          fs.copyFileSync(downloadedThumbPath, thumbnailPath);
        } else {
          console.log("Skipping copy: source and destination are the same.");
        }

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
      console.log(`Getting video duration for: ${videoPath}`);
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file disappeared before getting duration: ${videoPath}`);
      }

      const { stdout: durationOutput } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`);
      const duration = parseFloat(durationOutput.trim());

      // Get video resolution
      const { stdout: resolutionOutput } = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`);
      const [width, height] = resolutionOutput.trim().split('x').map(Number);
      const actualQuality = `${height}p`;

      // Get video bitrate and other quality data
      const { stdout: bitrateOutput } = await execPromise(`ffprobe -v error -select_streams v:0 -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`);
      const bitrate = parseInt(bitrateOutput.trim()) || 0;
      const bitrateInMbps = (bitrate / 1024 / 1024).toFixed(2);

      console.log(`Download completed for YouTube video: ${videoId} (${actualQuality} @ ${bitrateInMbps} Mbps)`);
      console.log(`Thumbnail saved at: ${thumbnailPath}`);

      return NextResponse.json({
        videoPath,
        thumbnailPath,
        duration: duration.toString(),
        resolution: {
          width,
          height,
          quality: actualQuality,
          bitrate: bitrateInMbps + ' Mbps'
        },
        message: 'Video downloaded successfully'
      });
    } catch (error) {
      console.error('Download error:', error);

      // Attempt to clean up any partial files
      try {
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log(`Cleaned up partial video file: ${videoPath}`);
        }
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
          console.log(`Cleaned up partial thumbnail file: ${thumbnailPath}`);
        }
      } catch (cleanupError) {
        console.error('Error during file cleanup:', cleanupError);
      }

      return NextResponse.json(
        {
          error: 'Failed to download video. Please make sure the video exists and is not private.',
          details: error instanceof Error ? error.message : String(error)
        },
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