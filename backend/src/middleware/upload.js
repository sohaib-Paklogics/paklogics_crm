import multer from "multer";

const storage = multer.memoryStorage(); // stream to Cloudinary
export const upload = multer({ storage });
