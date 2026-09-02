const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hs9vvez4',
  api_key: process.env.CLOUDINARY_API_KEY || '673671639866368',
  api_secret: process.env.CLOUDINARY_API_SECRET || '6TaUH0i771MIddZs1kxjiofmiG0',
});

// Configure Multer to keep files in memory buffer before sending to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB maximum file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, JPG) are allowed'), false);
    }
  },
});

/**
 * Upload buffer directly to Cloudinary stream
 * Automatically applies quality compression, WebP conversion, and responsive sizing
 */
const uploadToCloudinary = (fileBuffer, folder = 'laroche_cafe/menu_items') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

module.exports = { cloudinary, upload, uploadToCloudinary };
