const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, path.join(__dirname, "../uploads"))  
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname

        cb(null, uniqueName)

    }

})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".xls", ".xlsx"];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Jenis file tidak diizinkan"));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB limit
    }
})

module.exports = upload