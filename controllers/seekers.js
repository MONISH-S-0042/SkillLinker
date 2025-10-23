const { Job } = require('../models/Job');
const { Application } = require('../models/Application');

module.exports.getJobList = async (req, res) => {
    res.render('seeker/jobs');
};
module.exports.getJobDetails = async (req, res) => {
    const job = await Job.findById(req.params.id).populate('owner');
    if (!job) {
        req.flash('error', 'Job Does Not Exist');
        return res.redirect('/seeker/getJobs');
    }
    const application = await Application.findOne({ job: job._id, applicant: req.user._id });
    res.render('seeker/showJob', { job, application });
}
module.exports.applyJob = async (req, res) => {
    const { acceptTerms, user_description } = req.body;
    if (!acceptTerms) {
        req.flash('error', 'Agree to terms and conditions');
    }
    const job = await Job.findById(req.params.id).populate('owner');
    // const userApprovedApplications = await Application.find({ approval_status: 'approved' }).populate('job');

    // //added overlapping
    // const isOverlapping = userApprovedApplications?.some(approvedJob => {
    //     const newStart = new Date(job.duration.durationFrom);
    //     const newEnd = new Date(job.duration.durationTo);
    //     const approvedStart = new Date(approvedJob.job.duration.durationFrom);
    //     const approvedEnd = new Date(approvedJob.job.duration.durationTo);

    //     return newStart < approvedEnd && newEnd > approvedStart
    //         && approvedJob.job.req_skills.length == 1 && approvedJob.job.req_skills[0].toLowerCase() == 'none';
    // })
    // if (isOverlapping) {
    //     req.flash('error', 'You already have a job approved in this duration');
    //     return res.redirect(`/seeker/${job._id}/jobDesc`);
    // }


    if (job.app_status === 'closed') {
        req.flash('error', 'Applications are no longer accepted');
        return res.redirect(`/seeker/${job._id}/jobDesc`);
    }
    const applicationData = {
        job,
        applicant: req.user,
    }
    if (user_description) {
        applicationData.user_description = user_description;
    }
    const application = new Application(applicationData);
    await application.save();
    const applications = await Application.find({ job: job._id });
    if (applications.length >= job.max_applicants) {
        await Job.findByIdAndUpdate(job._id, { app_status: 'closed' });
    }
    req.flash('success', 'Successfully Applied');
    res.redirect(`/seeker/${job._id}/jobDesc`);
};