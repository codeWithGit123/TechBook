const mongoose = require('mongoose')

let qSchema = new mongoose.Schema({
    topic:{
        type:String
    },
    question:{
        type:String,
       required:true
    },
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uname: String
},{timestamps:true})

module.exports = mongoose.model('Question',qSchema);