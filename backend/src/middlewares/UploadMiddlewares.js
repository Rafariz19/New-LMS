const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null,  path.join(__dirname, "../uploads"))  // naik 2 folder dari src/middleware ke root project, lalu masuk ke folder uploads
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname

        cb(null, uniqueName)

    }

})

const upload = multer({
    storage
})

module.exports = upload