const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const {cloudinary} = require('../cloudinary/index')
const userSchema = new mongoose.Schema({
    FullName: String,//Full name and username are not same, in passport username and password are stored default
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['seeker', 'poster'],
        default: 'seeker'
    },
    skills: [String],
    resume: {
        url: {
            type: String
        },
        filename: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    DOB: {
        type: Date
    },
    profilePic: {
        url: {
            type: String,
            default: '/images/person-icon.jpeg'
        },
        filename: String,

    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    company_name: {
        type: String,
    },
    job_category:{
        type:String,
        required:function(){
            return this.role==='seeker';
        },
        default:function(){
            return this.role==='seeker'?'general':undefined;
        }
    }
})
userSchema.plugin(passportLocalMongoose);
module.exports.User = mongoose.model('User', userSchema);