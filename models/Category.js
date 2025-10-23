const mongoose=require('mongoose');
const categorySchema=new mongoose.Schema({
    category:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    jobs:[String]
});
module.exports.Category=mongoose.model('Category',categorySchema);