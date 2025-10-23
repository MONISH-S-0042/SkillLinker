const { type } = require('express/lib/response');
const mongoose=require('mongoose');
const notificationSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    type:{
        type:String,
        enum:['application-confirmation'],
        default:'application-confirmation'
    },
    info:{
        type:String,
        required:true
    },
    created:{
        type:Date,
        default:Date.now
    },
    ref_job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    }
})
module.exports.Notification=mongoose.model('Notification',notificationSchema);