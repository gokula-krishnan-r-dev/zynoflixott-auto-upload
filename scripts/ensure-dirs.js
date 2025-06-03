const fs = require('fs');
const path = require('path');

// Define required directories
const REQUIRED_DIRS = [
    'tmp', // For temporary files
];

// Get the root directory
const ROOT_DIR = process.cwd();

// Create each directory if it doesn't exist
for (const dir of REQUIRED_DIRS) {
    const dirPath = path.join(ROOT_DIR, dir);

    if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dirPath}`);
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created directory: ${dirPath}`);
        } catch (err) {
            console.error(`❌ Failed to create directory ${dirPath}:`, err);
        }
    } else {
        console.log(`✅ Directory already exists: ${dirPath}`);
    }
}

// Ensure the tmp directory is writable
const TMP_DIR = path.join(ROOT_DIR, 'tmp');
try {
    const testFile = path.join(TMP_DIR, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Temporary directory is writable');
} catch (err) {
    console.error('❌ Temporary directory is not writable:', err);
    console.error('Please check the permissions of the tmp directory');
}

console.log('Directory check complete'); 