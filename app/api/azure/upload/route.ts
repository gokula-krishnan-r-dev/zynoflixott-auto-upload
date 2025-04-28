import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Get Azure Storage connection string from environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'zynoflix-ott';

// Function to get a block blob client
function getBlockBlobClient(blobName: string): BlockBlobClient {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient.getBlockBlobClient(blobName);
}

// Function to compress video
async function compressVideo(inputPath: string): Promise<string> {
  try {
    // Verify input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input video file not found: ${inputPath}`);
    }
    
    const outputFilename = `compressed-${path.basename(inputPath)}`;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);
    
    // Using ffmpeg to compress video
    await execPromise(`ffmpeg -i "${inputPath}" -vcodec h264 -acodec aac -strict -2 -crf 28 "${outputPath}"`);
    
    // Verify output file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error('Compression failed: Output file was not created');
    }
    
    return outputPath;
  } catch (error) {
    console.error('Video compression error:', error);
    throw error;
  }
}

// Safely read a file, with error handling
function safeReadFile(filePath: string): Buffer {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoPath, thumbnailPath, videoDetails } = await request.json();

    if (!videoPath || !thumbnailPath) {
      return NextResponse.json(
        { error: 'Video path and thumbnail path are required' },
        { status: 400 }
      );
    }

    // Verify files exist
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { error: `Video file not found: ${videoPath}` },
        { status: 404 }
      );
    }

    if (!fs.existsSync(thumbnailPath)) {
      return NextResponse.json(
        { error: `Thumbnail file not found: ${thumbnailPath}` },
        { status: 404 }
      );
    }

    if (!connectionString || !containerName) {
      console.error('Azure Storage is not configured');
      return NextResponse.json(
        { error: 'Azure Storage is not configured' },
        { status: 500 }
      );
    }

    // Generate unique blob names
    const timestamp = Date.now();
    const sanitizedTitle = videoDetails.title.replace(/[^\w\s]/gi, '').substring(0, 50);
    const originalBlobName = `${timestamp}-${sanitizedTitle}-original.mp4`;
    const previewBlobName = `${timestamp}-${sanitizedTitle}-preview.mp4`;
    const thumbnailBlobName = `${timestamp}-thumbnail.jpg`;

    console.log(`Starting upload to Azure Blob Storage for video: ${sanitizedTitle}`);
    console.log(`Processing video: ${videoPath}`);
    console.log(`Processing thumbnail: ${thumbnailPath}`);

    // Create a preview (compressed) version of the video
    const compressedVideoPath = await compressVideo(videoPath);
    
    // Upload original video
    const originalBlobClient = getBlockBlobClient(originalBlobName);
    const originalVideoBuffer = safeReadFile(videoPath);
    await originalBlobClient.upload(originalVideoBuffer, originalVideoBuffer.length);
    
    // Upload compressed video
    const previewBlobClient = getBlockBlobClient(previewBlobName);
    const compressedVideoBuffer = safeReadFile(compressedVideoPath);
    await previewBlobClient.upload(compressedVideoBuffer, compressedVideoBuffer.length);
    
    // Upload thumbnail
    const thumbnailBlobClient = getBlockBlobClient(thumbnailBlobName);
    const thumbnailBuffer = safeReadFile(thumbnailPath);
    await thumbnailBlobClient.upload(thumbnailBuffer, thumbnailBuffer.length);

    console.log(`Upload completed to Azure Blob Storage for video: ${sanitizedTitle}`);

    // Clean up temporary files
    try {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(compressedVideoPath)) fs.unlinkSync(compressedVideoPath);
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }

    return NextResponse.json({
      originalVideoUrl: originalBlobClient.url,
      previewVideoUrl: previewBlobClient.url,
      thumbnailUrl: thumbnailBlobClient.url,
      message: 'Files uploaded to Azure Blob Storage successfully'
    });
  } catch (error) {
    console.error('Error in Azure upload API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 