const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    user_description: String,
    applicant:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approval_status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    applied: {
        type: Date,
        default: ()=>new Date(Date.now())
    },
    job_completed:{
        type:Boolean,
        default:false
    }
})
module.exports.Application = mongoose.model('Application', applicationSchema);