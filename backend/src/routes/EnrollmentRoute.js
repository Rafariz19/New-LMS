const express = require('express');
const router = express.Router();

const EnrollmentController = require('../controllers/EnrollmentController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

router.post('/enroll',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    EnrollmentController.enroll
)

router.delete('/unenroll/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    EnrollmentController.unenroll
)
router.get('/list/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student", "teacher"),
    EnrollmentController.listStudents
)

module.exports = router;
