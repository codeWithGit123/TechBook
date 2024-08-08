const mongoose = require('mongoose')


let aSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
    ans: {
        type: String,
        required: true
    }
}, { timestamps: true });
module.exports = mongoose.model('Answer',aSchema);