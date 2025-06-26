const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define storage for uploaded files
// Files will be stored in 'neelosewa-backend/uploads/images'
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp-original_extension
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    },
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    }
});

// @route   POST /api/upload/profile-image
// @desc    Upload a single profile image
// The field name 'profileImage' must match the formData.append('profileImage', newAvatarFile) on the frontend
router.post('/profile-image', upload.single('profileImage'), (req, res) => {
    if (req.file) {
        // Return the relative path where the file is accessible from the root of your public folder
        const filePath = `/uploads/images/${req.file.filename}`;
        res.json({ filePath });
    } else {
        res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }
});

module.exports = router;
