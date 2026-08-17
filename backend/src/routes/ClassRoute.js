const express = require('express');
const router = express.Router();

const ClassController = require('../controllers/ClassController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const teacherApproved = require('../middlewares/TeacherMiddleware')

router.post('/create', 
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    ClassController.store
)
router.get('/list',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student", "teacher", "admin"),
    ClassController.index
)
router.get('/myclasses',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    ClassController.show
)
router.patch('/:classId',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    ClassController.update
)
router.delete('/:classId',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    ClassController.destroy
)

module.exports = router;
