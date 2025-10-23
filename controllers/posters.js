const { Application } = require('../models/Application');
const { Job } = require('../models/Job');
const { User } = require('../models/User');
const { Category } = require('../models/Category');
const agenda = require('../agenda');
const { application } = require('express');
const { Notification } = require('../models/Notification');
module.exports.newJobForm = (req, res) => {
    res.render('poster/newJob');
}
module.exports.newJobPost = async (req, res) => {
    let { title, description, skills, pay, modeType, durationFrom, durationTo, deadline, category } = req.body;
    const deadlineDate = new Date(deadline);
    const date = new Date();
    durationFrom = new Date(durationFrom);
    durationTo = new Date(durationTo);
    if (durationFrom >= durationTo) {
        req.flash('error', 'Duration should not be less than one day');
        return res.redirect('/poster/addJob');
    }
    else if (durationFrom < date) {
        req.flash('error', 'Work duration should not be past date');
        return res.redirect('/poster/addJob');
    }
    if (new Date(deadline) < date) {
        req.flash('error', 'Deadline should not be past date');
        return res.redirect('/poster/addJob');
    }
    let duration = { durationFrom, durationTo };
    const updateData = { title, description, owner: req.user, pay, duration, deadline: deadlineDate, category };
    let skillArray = skills.split(',')
        .map(el => el.trim())
        .filter(el => el.length > 0);
    if (!skillArray.length) {
        skillArray = ['None'];
    }
    const mode = {
        type: modeType
    }
    if (req.body.address) {
        mode.address = req.body.address;
    }
    if (req.body.max_applicants) {
        updateData.max_applicants = req.body.max_applicants;
    }
    updateData.mode = mode;
    updateData.req_skills = skillArray;
    const newJob = new Job(updateData);
    await newJob.save();
    await agenda.schedule(deadlineDate, 'close job', { jobId: newJob._id.toString() });
    const isAvailable = await Category.find({ category: { $regex: category, $options: 'i' } });
    if (!isAvailable.length) {
        const newCat = new Category({ category: category.toLowerCase(), jobs: [title.toLowerCase()] });
        await newCat.save();
    }
    else {
        for (let el of isAvailable) {
            if (!el.jobs.includes(title.toLowerCase())) {
                el.jobs.push(title.toLowerCase());
                await el.save();
            }
        }
    }
    req.flash('success', 'Job Posted Successfully');
    res.redirect('/home');
}
module.exports.viewMyJobs = async (req, res) => {
    const jobs = await Job.find({ owner: req.user }).sort({ created: -1 });
    const posted = jobs.length > 0;
    for (let job of jobs) {
        const applications = await Application.find({ job: job._id, approval_status: { $ne: 'rejected' } });
        approvedLength = applications.filter(application => application.approval_status === 'approved').length;
        job.appLength = approvedLength;
        job.applicant = approvedLength ? 'approved' : 'pending';
        job.appCount = applications.length;
    }
    res.render('poster/myJobs', { jobs, posted });
}
module.exports.viewJobApplications = async (req, res) => {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
        req.flash('error', 'Job does not exist');
        return res.redirect('/poster/myJobs');
    }
    let applications = (await Application.find({ job: job._id }).populate('applicant')
        .sort({ approval_status: 1, applied: -1 }))
        .filter(app => app.approval_status !== 'rejected');
    let req_skills = job.req_skills;
    applications.forEach(application => {
        application.matchedSkills = 0;
        req_skills.forEach(skill => {
            application.matchedSkills += application.applicant?.skills.includes(skill) ? 1 : 0;
        })
    });
    applications.sort((a, b) => {
        if(a.approval_status!=b.approval_status)return a.approval_status-b.approval_status;
        return b.matchedSkills-a.matchedSkills;
    });
    const job_app_length = applications.filter(application => application.approval_status === 'approved').length;
    const pend_apps = applications.filter(application => application.approval_status === 'pending').length;
    const users = applications.map(application => application.applicant);
    res.render('poster/jobApplications', { job, applications, job_app_length, pend_apps, users });
}
module.exports.deleteJob = async (req, res) => {
    const job = await Job.findOne({ owner: req.user, _id: req.params.jobId });
    const applicant = await Application.findOne({ job: job._id, approval_status: 'approved' });
    await Notification.deleteMany({ ref_job: job._id });
    if (!job) {
        req.flash('error', 'Invalid Operation');
        return res.redirect('/poster/myJobs');
    }
    if (applicant) {
        req.flash('error', 'Job cannot be deleted since an application has been approved');
        return res.redirect('/poster/myJobs');
    }
    await Job.deleteOne(job);
    await Application.deleteMany({ job });
    req.flash('success', 'Job Deleted Successfully');
    res.redirect('/poster/myJobs');
}