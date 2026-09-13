const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const upload = require('../middlewares/UploadMiddlewares');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100
});

router.post('/register', AuthController.register, limiter);
router.post('/login', AuthController.login, limiter);
router.get('/me', AuthMiddleware.verifyToken, AuthController.me);
router.patch('/avatar', AuthMiddleware.verifyToken, upload.single('avatar'), AuthController.updateAvatar);

module.exports = router;
