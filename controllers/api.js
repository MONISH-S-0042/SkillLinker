const { Application } = require('../models/Application');
const { Job } = require('../models/Job');
const { Category } = require('../models/Category');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');

// posterss
module.exports.updateAppStatus = async (req, res) => {
    const [action, id] = req.params.appid.split('-');
    if (!id) {
        return res.status(400).json({ success: false, message: 'Missing ID' });
    }
    if (action === 'close') {
        await Job.findByIdAndUpdate(id, { app_status: 'closed' });
        return res.json({
            query: 'Success'
        });
    }
    else if (action === 'rejectAll') {
        const allJobApplications = await Application.find({ job: id, approval_status: { $ne: 'approved' } });
        for (let app of allJobApplications) {
            app.approval_status = 'rejected';
            await app.save();
        }
        return res.json({
            query: 'Success'
        });
    }
    const application = await Application.findById(id).populate('job');
    if (action === 'dec') {
        if (application.approval_status !== 'approved') {
            application.approval_status = 'rejected';
            await application.save();
        }
    }
    else if (action === 'acc') {
        application.approval_status = 'approved';
        await application.save();
        const newNotification = new Notification({
            user: application.applicant,
            info: `You Application for the ${application.job.title} job has been approved`,
            ref_job: application.job
        })
        await newNotification.save();
        // const applicantApplications = await Application.find({ applicant: application.applicant, approval_status: 'pending' }).populate('job');
        // //added overlapping duration here
        // applicantApplications.forEach(async jobApplication => {
        //     const jobStart = new Date(jobApplication.job.duration.durationFrom);
        //     const jobEnd = new Date(jobApplication.job.duration.durationTo);
        //     const approvedStart = new Date(application.job.duration.durationFrom);
        //     const approvedEnd = new Date(application.job.duration.durationTo);
        //     const skills = application.job.req_skills;
        //     const isOverlapping = jobStart < approvedEnd && jobEnd > approvedStart && skills.length == 1 && skills[0].toLowerCase() == 'none';
        //     if (isOverlapping) {
        //         await Application.deleteOne({ _id: jobApplication._id });
        //     }
        // })

        res.json(
            {
                query: 'Success'
            }
        );
    }
}

//seekers
module.exports.allJobList = async (req, res) => {
    let jobs = await Job.find().sort({ created: -1 }).lean();
    const user = await User.findById(req.user._id);
    let { category } = req.query;
    let filteredJobs = [];
    for (let job of jobs) {
        const application = await Application.findOne({ job: job._id, applicant: req.user._id });
        if (application) {
            job.approval_status = application.approval_status;
        }
        else {
            job.approval_status = null;
        }
        filteredJobs.push(job);
    }
    filteredJobs = filteredJobs.filter(job => (job.app_status === 'open' || job.approval_status));
    let categoryJobs;
    if (category) {
        categoryJobs = filteredJobs.filter(job => (
            new RegExp(category, 'i').test(job.category) || new RegExp(category, 'i').test(job.title)
        ));
    }
    else {
        category = user.job_category;
        filteredJobs.forEach(job => {
            job.matchedSkills = 0;
            user.skills.forEach(skill => {
                if (job.req_skills.includes(skill)) {
                    job.matchedSkills++;
                }
            })
            if (user.skills[0].toLowerCase() === 'none') {
                job.matchedSkills++;
            }
        });
        categoryJobs = filteredJobs.filter(job => {
            return job.app_status === 'open' && job.matchedSkills > 0;
        });
    }
    res.json({
        jobs: filteredJobs,
        categoryJobs
    })
}

module.exports.jobCategory = async (req, res) => {
    const { title } = req.query;
    let category;
    if (title && title.length) {
        category = await Category.findOne({ jobs: { $regex: title, $options: 'i' } });
    }
    const allCategories = await Category.find().sort({ category: -1 });
    return res.json({
        category: category?.category || 'other',
        all_categories: allCategories
    });
}