import multer from 'multer';

// Use memory storage so StorageProvider can process buffers (local disk, cloud, etc.)
const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});
