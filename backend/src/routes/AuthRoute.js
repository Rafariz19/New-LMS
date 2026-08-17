const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100
});


router.post('/register', AuthController.register, limiter);
router.post('/login', AuthController.login, limiter);
router.get('/me', AuthMiddleware.verifyToken, AuthController.me);

module.exports = router;
