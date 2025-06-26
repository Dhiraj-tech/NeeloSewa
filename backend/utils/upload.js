// ===============================================
// Multer Configuration: upload.js
// This file sets up Multer for handling file uploads,
// specifying storage destination and file naming.
// ===============================================
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js File System module

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be stored in 'neelosewa-backend/uploads/images'
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and original extension
        // e.g., 1678886400000-mybus.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter for image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    }
});

module.exports = upload;
