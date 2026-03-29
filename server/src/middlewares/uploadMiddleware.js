import multer from "multer";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const maxSize = 5 * 1024 * 1024; // 5MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        if(!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Chỉ chấp nhận file JPG, PNG, PDF!"));
        }
        cb(null, true);
    }
});

export default upload;