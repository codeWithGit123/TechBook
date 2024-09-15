const mongoose = require('mongoose')

let pdfSchema = new mongoose.Schema({
    pdf:{
        type:Buffer,
    },
    contentType: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      uname:String
},{timestamps:true})

module.exports = mongoose.model('Pdf',pdfSchema);