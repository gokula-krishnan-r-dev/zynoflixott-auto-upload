const fs = require('fs');
const path = require('path');

// Temporary directory path
const TEMP_DIR = path.join(process.cwd(), 'tmp');

// Time threshold in milliseconds (24 hours = 86400000 ms)
const TIME_THRESHOLD = 24 * 60 * 60 * 1000;
const now = Date.now();

console.log(`Cleaning up temporary files in: ${TEMP_DIR}`);

// Skip if tmp directory doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
    console.log('Temporary directory does not exist, nothing to clean up.');
    process.exit(0);
}

// Get all files in the tmp directory
try {
    const files = fs.readdirSync(TEMP_DIR);

    if (files.length === 0) {
        console.log('No files found in temporary directory.');
        process.exit(0);
    }

    console.log(`Found ${files.length} files in temporary directory.`);

    let deletedCount = 0;
    let totalSize = 0;

    // Check each file's age
    for (const file of files) {
        const filePath = path.join(TEMP_DIR, file);

        try {
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtimeMs;

            // If file is older than threshold, delete it
            if (fileAge > TIME_THRESHOLD) {
                const fileSize = stats.size;
                totalSize += fileSize;

                fs.unlinkSync(filePath);
                deletedCount++;

                console.log(`Deleted: ${file} (${(fileSize / 1024 / 1024).toFixed(2)} MB, ${(fileAge / 3600000).toFixed(1)} hours old)`);
            }
        } catch (err) {
            console.error(`Error processing file ${file}:`, err);
        }
    }

    console.log(`Cleanup complete! Deleted ${deletedCount} files (${(totalSize / 1024 / 1024).toFixed(2)} MB total)`);
} catch (err) {
    console.error('Error reading temporary directory:', err);
    process.exit(1);
} 