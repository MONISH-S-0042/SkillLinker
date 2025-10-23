const express = require('express');
const users=require('../controllers/users');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
const passport = require('passport');
const multer = require('multer');
const { storage} = require('../cloudinary/index');
const upload = multer({ storage });

router.get('/:id/profile',isLoggedIn,catchAsync(users.profilePage));
router.get('/removeProfilePicture',isLoggedIn,catchAsync(users.deleteProfilePicture));
router.get('/editProfile',isLoggedIn,catchAsync(users.editProfilePageForm));
router.post('/editProfile',isLoggedIn,
    upload.fields([
        { name: 'profilePic', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    catchAsync(users.editProfilePage));

router.get('/register',users.registerForm);
router.post('/register',catchAsync(users.registerUser));
router.get('/login',users.loginForm);
router.post('/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),
    catchAsync(users.loginUser)
)
router.get('/logout',catchAsync(users.logout));
router.get('/notification',isLoggedIn,catchAsync(users.notification));
router.get('/deleteNotification/:notifyId',isLoggedIn,catchAsync(users.deleteNotification));
module.exports=router;