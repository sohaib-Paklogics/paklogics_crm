// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    // allow any; or restrict by mimetype if needed
    cb(null, true);
  },
});
