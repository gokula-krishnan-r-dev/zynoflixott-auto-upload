import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

interface Resolution {
    name: string;
    width: number;
    height: number;
    bitrate: string;
}

// Available resolution presets
export const RESOLUTIONS: Resolution[] = [
    { name: '4K', width: 3840, height: 2160, bitrate: '8000k' },
    { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
    { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
    { name: '480p', width: 854, height: 480, bitrate: '1000k' },
    { name: '360p', width: 640, height: 360, bitrate: '700k' },
];

export interface TranscodingResult {
    resolutions: {
        [key: string]: string; // Resolution name -> file path
    };
    manifestPath: string;
}

export async function generateHLSVariants(
    inputPath: string,
    outputDir: string = path.dirname(inputPath),
    targetResolutions: Resolution[] = RESOLUTIONS
): Promise<TranscodingResult> {
    try {
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input video file not found: ${inputPath}`);
        }

        // Create unique directory for this video's HLS files
        const videoId = path.basename(inputPath, path.extname(inputPath));
        const hlsDir = path.join(outputDir, `hls-${videoId}`);

        if (!fs.existsSync(hlsDir)) {
            fs.mkdirSync(hlsDir, { recursive: true });
        }

        // Base command for FFmpeg
        const manifestPath = path.join(hlsDir, 'master.m3u8');

        // Build FFmpeg command for HLS with multiple resolutions
        let ffmpegCmd = `ffmpeg -i "${inputPath}" `;

        // Add each resolution as a separate output
        const variantCommands = targetResolutions.map((res) => {
            const variantName = `${res.height}p`;
            const variantPath = path.join(hlsDir, `${variantName}.m3u8`);

            return `-vf "scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease,pad=${res.width}:${res.height}:(ow-iw)/2:(oh-ih)/2" ` +
                `-c:v h264 -b:v ${res.bitrate} -c:a aac -b:a 128k ` +
                `-hls_time 6 -hls_playlist_type vod -hls_segment_filename "${hlsDir}/${variantName}_%03d.ts" "${variantPath}"`;
        }).join(' ');

        ffmpegCmd += variantCommands;

        // Execute the FFmpeg command
        console.log('Starting HLS transcoding...');
        await execPromise(ffmpegCmd);

        // Generate master playlist
        let masterContent = '#EXTM3U\n#EXT-X-VERSION:3\n';

        targetResolutions.forEach((res) => {
            const variantName = `${res.height}p`;
            masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate) * 1000},RESOLUTION=${res.width}x${res.height}\n`;
            masterContent += `${variantName}.m3u8\n`;
        });

        fs.writeFileSync(manifestPath, masterContent);

        // Create result object with paths to all generated files
        const result: TranscodingResult = {
            resolutions: {},
            manifestPath
        };

        targetResolutions.forEach((res) => {
            const variantName = `${res.height}p`;
            result.resolutions[variantName] = path.join(hlsDir, `${variantName}.m3u8`);
        });

        console.log('HLS transcoding completed successfully.');
        return result;
    } catch (error) {
        console.error('Transcoding error:', error);
        throw error;
    }
}

// Helper function to check if a video is suitable for a specific resolution
export async function analyzeVideoResolution(inputPath: string): Promise<{ width: number, height: number }> {
    try {
        const { stdout } = await execPromise(
            `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${inputPath}"`
        );

        const [width, height] = stdout.trim().split('x').map(Number);
        return { width, height };
    } catch (error) {
        console.error('Error analyzing video:', error);
        throw error;
    }
}

// Get appropriate resolutions based on source video
export async function getAppropriateResolutions(inputPath: string): Promise<Resolution[]> {
    const { width, height } = await analyzeVideoResolution(inputPath);
    return RESOLUTIONS.filter(res => res.height <= height).sort((a, b) => b.height - a.height);
} 