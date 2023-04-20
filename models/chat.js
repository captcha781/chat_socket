const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    users: {
        type: [mongoose.Types.ObjectId]
    },
    lastMessage: {
        type: String,
        default: ''
    }
}, { timestamps: true })

module.exports = mongoose.model('chats', ChatSchema, 'chats')