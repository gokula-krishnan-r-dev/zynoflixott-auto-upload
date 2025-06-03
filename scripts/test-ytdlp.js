const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

// Path to yt-dlp executable
const YT_DLP_PATH = '/opt/homebrew/bin/yt-dlp';

// Test video ID (a short, public video)
const TEST_VIDEO_ID = 'jNQXAC9IVRw'; // "Me at the zoo" (first YouTube video)

// Test directory
const TEST_DIR = path.join(process.cwd(), 'tmp', 'test');

// Create test directory if it doesn't exist
if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function testYtDlp() {
    console.log('Testing yt-dlp functionality...');

    try {
        // Check yt-dlp version
        const { stdout: versionOutput } = await execPromise(`${YT_DLP_PATH} --version`);
        console.log(`yt-dlp version: ${versionOutput.trim()}`);

        // Test filename
        const testFileName = path.join(TEST_DIR, 'test-video.mp4');

        // Remove previous test file if exists
        if (fs.existsSync(testFileName)) {
            fs.unlinkSync(testFileName);
        }

        // Test video URL
        const videoUrl = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;

        console.log(`Attempting to download test video: ${videoUrl}`);
        console.log(`Output file: ${testFileName}`);

        // Execute download command
        const downloadCommand = `${YT_DLP_PATH} -f "best[height<=360]" "${videoUrl}" -o "${testFileName}" --no-playlist --no-warnings`;
        const { stdout, stderr } = await execPromise(downloadCommand);

        console.log('Download command output:', stdout);
        if (stderr) {
            console.error('Download command stderr:', stderr);
        }

        // Check if file exists
        if (fs.existsSync(testFileName)) {
            const stats = fs.statSync(testFileName);
            console.log(`✅ Success! Downloaded file: ${testFileName} (${stats.size} bytes)`);

            // Get video info
            const { stdout: infoOutput } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${testFileName}"`);
            console.log(`Video duration: ${infoOutput.trim()} seconds`);

            // Clean up test file
            fs.unlinkSync(testFileName);
            console.log('Test file cleaned up');
        } else {
            console.error('❌ Failed! Downloaded file does not exist');
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testYtDlp().then(() => {
    console.log('Test completed');
}); 