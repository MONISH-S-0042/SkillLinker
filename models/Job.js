const mongoose = require('mongoose');
const { Application } = require('./Application');
const { duration } = require('moment');
const { type } = require('express/lib/response');
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
    ,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pay: {
        type: Number,
        required: true,
        min: 0
    },
    req_skills: {
        type: [{
            type: String,
            lowercase: true,
            trim: true
        }],
        default: ['None']
    },
    category: {
        type: String,
        default: 'general'
    },
    mode: {
        type: {
            type: String,
            required: true
        },
        address: String
    },
    created: {
        type: Date,
        default: () => new Date(Date.now())
    },
    duration: {
        durationFrom: {
            type: Date,
            required: true
        },
        durationTo: {
            type: Date,
            required: true
        }
    },
    app_status: {
        type: String,
        default: 'open',
        enum: ['open', 'closed']
    },
    max_applicants: {
        type: Number,
        default: 100
    },
    deadline: {
        type: Date,
        required: true
    }
})
module.exports.Job = mongoose.model('Job', jobSchema);