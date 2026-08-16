const express = require('express');
const router = express.Router();

const teacherApproved = require('../middlewares/TeacherMiddleware')
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const MaterialsController = require('../controllers/MaterialsController.js')
const upload = require('../middlewares/UploadMiddlewares')

router.post("/:id", 
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    upload.single("file"),
    MaterialsController.uploadMaterial
)
router.get("/class/:id",
    AuthMiddleware.verifyToken,
    MaterialsController.getMaterialsByClass
)
router.get("/download/:filename",
    AuthMiddleware.verifyToken,
    MaterialsController.downloadMaterial
)
module.exports = router;