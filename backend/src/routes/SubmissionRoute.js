const express = require('express');
const router = express.Router();

const SubmissionController = require('../controllers/SubmissionController')
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const teacherApproved = require('../middlewares/TeacherMiddleware')
const upload = require('../middlewares/UploadMiddlewares')

router.post('/student/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    upload.single("file_url"),
    SubmissionController.store
)
router.get('/student/list/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    SubmissionController.listForAssignment
)
router.get('/teacher/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    SubmissionController.show
)
router.patch('/teacher/grade/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    SubmissionController.grade
)
router.get('/mysubmissions',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    SubmissionController.mySubmissions
)


module.exports = router;
