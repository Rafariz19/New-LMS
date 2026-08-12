const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');


router.get('/teachers', 
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("admin"),
    AdminController.listTeachers
)

router.patch('/teachers/:userId/approve', 
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("admin"),
    AdminController.approveTeacher
)

router.patch('/teachers/:userId/reject',
    AuthMiddleware.verifyToken,
    AuthMiddleware.checkRole("admin"), 
    AdminController.rejectTeacher
)

module.exports = router;
