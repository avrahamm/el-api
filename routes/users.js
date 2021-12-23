const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.get('/', authMiddleware.isLoggedIn, (req, res) => {
    if( req.user ) {
        res.json( {
            user: req.user
        });
    } else {
        res.status(401).json({"message": "not logged in"});
    }
});

router.get('/profile', authMiddleware.isLoggedIn, (req, res) => {
    console.log(req.user);
    if( req.user ) {
        res.json( {
            user: req.user
        });
    } else {
        res.status(401).json({"message": "not logged in"});
    }

})

router.post('/register', authController.register );

router.post('/login', authController.login );

router.get('/logout', authController.logout );

module.exports = router;