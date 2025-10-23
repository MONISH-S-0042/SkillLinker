const express = require('express');
const seekers=require('../controllers/seekers');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isSeeker } = require('../middleware');

router.get('/getJobs',isSeeker,catchAsync(seekers.getJobList));
router.get('/:id/jobDesc',isSeeker,catchAsync(seekers.getJobDetails));
router.post('/:id/applyJob',isSeeker,catchAsync(seekers.applyJob));
module.exports=router;