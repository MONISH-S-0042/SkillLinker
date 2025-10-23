const { isPoster,isSeeker, isLoggedIn } = require("../middleware");
const express = require('express');
const api=require('../controllers/api');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

router.get('/poster/:appid/updateApplicationStatus',isPoster,catchAsync(api.updateAppStatus));
router.get('/seeker/getJobList',isSeeker,catchAsync(api.allJobList));
router.get('/getCategory',isLoggedIn,catchAsync(api.jobCategory));
module.exports = router;