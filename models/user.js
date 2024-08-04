const mongoose = require('mongoose')

let uSchema = new mongoose.Schema({
    uname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true
    },
    pass:{
        type:String,
        required:true
    },
    toi:{
        type:String
    }
},{timestamps:true})

module.exports = mongoose.model('User',uSchema);