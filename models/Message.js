const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    readStatus: {
        type: Boolean,
        default: false
    },
    from: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    to: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    chatId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'chats'
    }
}, { timestamps: true })

module.exports = mongoose.model('messages', MessageSchema, 'messages')