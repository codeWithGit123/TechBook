const mongoose = require('mongoose')


let cSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
      },
    cmt: {
        type: String,
        required: true
    }
}, { timestamps: true });
module.exports = mongoose.model('Comment',cSchema);