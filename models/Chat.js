const mongoose=require('mongoose');
const chatSchema=new mongoose.Schema({
    room:{
        type:String,
        required:true
    },
    messages:[
        {
            username:String,
            message:String,
            time:String
        }
    ]
})

module.exports.Chat=mongoose.model('Chat',chatSchema);