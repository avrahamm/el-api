const express = require('express');
const authController = require('../controllers/auth');
const usersController = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.get('/profile', authMiddleware.isLoggedIn, usersController.getUser);

router.post('/profile', authMiddleware.isLoggedIn, usersController.updateUser)

router.post('/register/step1', authController.registerStep1 );
router.post('/register/step2', authController.registerStep2 );

router.post('/login', authController.login );

router.get('/logout', authController.logout );

module.exports = router;