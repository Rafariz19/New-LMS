const express = require('express');
const router = express.Router();

const AssignmentController = require('../controllers/AssignmentController')
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const teacherApproved = require('../middlewares/TeacherMiddleware')

router.post('/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    AssignmentController.store
)
router.get('/student/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("student"),
    AssignmentController.index
)
router.get('/teacher/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    AssignmentController.show
)
router.patch('/update/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    AssignmentController.update
)
router.delete('/delete/:id',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("teacher"),
    teacherApproved,
    AssignmentController.destroy
)

module.exports = router;
