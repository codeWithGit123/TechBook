const mongoose = require('mongoose')

let qSchema = new mongoose.Schema({
    topic:{
        type:String
    },
    question:{
        type:String,
       required:true
    }
},{timestamps:true})

module.exports = mongoose.model('Question',qSchema);