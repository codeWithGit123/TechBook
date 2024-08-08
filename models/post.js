const mongoose = require('mongoose')

let pSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    img:{
        type:Buffer,
        default:'image.jpg'
    },
    desc:{
        type:String,
        required:true
    },
    contentType: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      uname:String
},{timestamps:true})

module.exports = mongoose.model('Post',pSchema);