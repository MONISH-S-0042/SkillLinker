const { isPoster } = require("../middleware");
const express = require('express');
const posters=require('../controllers/posters');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

router.get('/addJob',isPoster,posters.newJobForm);
router.post('/addJob',isPoster,catchAsync(posters.newJobPost));
router.get('/myJobs',isPoster,catchAsync(posters.viewMyJobs));
router.get('/:jobId/deleteJob',isPoster,catchAsync(posters.deleteJob));
router.get('/:jobId/applications',isPoster,catchAsync(posters.viewJobApplications));
module.exports = router;