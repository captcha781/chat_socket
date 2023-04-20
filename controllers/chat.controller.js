const User = require("../models/User")
const jwt = require('jsonwebtoken')
const Chat = require("../models/chat")
const mongoose = require('mongoose')
const Message = require("../models/Message")
const { socketEmitOne } = require("./socket.controller")

const ObjectId = mongoose.Types.ObjectId

exports.signup = async (req, res) => {
    try {

        const { email, name, password, confirmPassword } = req.body

        let checkUser = await User.findOne({ email })

        if (checkUser) {
            return res.status(400).json({ success: false, message: 'User already exists' })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords mismatch' })
        }

        let userDoc = { name, email, password }
        let newUser = new User(userDoc)
        await newUser.save()

        return res.json({ success: true, message: 'New user created successfully' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body

        let userData = await User.findOne({ email })

        if (!userData) {
            return res.status(400).json({ success: false, message: 'No user found with this email' })
        }

        if (password !== userData.password) {
            return res.status(400).json({ success: false, message: 'Incorrect password' })
        }

        let token = `Bearer ${jwt.sign({ userId: userData._id }, process.env.JWT_SECRET)}`
        userData.password = ""

        return res.json({ success: true, token, user: userData })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}

exports.getUsers = async (req, res) => {
    try {

        let users = await User.find({ _id: { $ne: req.user._id } }, { password: 0 })

        

        return res.json({ success: true, data: users })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}

exports.getChatRoom = async (req, res) => {
    try {

        const { receiverId } = req.body

        let roomCheck = await Chat.findOne({ users: { $eq: [new ObjectId(req.user._id), new ObjectId(receiverId)] } })
        if (roomCheck) {
            let messages = await Message.find({ chatId: new ObjectId(roomCheck._id) }).sort({ createdAt: 1 })
            let msgIds = messages.map(item => new ObjectId(item._id))

            await Message.updateMany({ _id: { $in: msgIds }, to: req.user._id }, { $set: { readStatus: true } })

            return res.json({ success: true, chatRoom: roomCheck, messages })
        }

        let chatRoom = new Chat({
            users: [new ObjectId(req.user._id), new ObjectId(receiverId)]
        })

        await chatRoom.save()

        return res.json({ success: true, chatRoom })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}

exports.makeMessage = async (req, res) => {
    try {

        const { roomId, message, receiverId } = req.body

        let newMsg = new Message({
            from: new ObjectId(req.body._id),
            to: new ObjectId(receiverId),
            message: message,
            chatId: roomId,
        })

        await newMsg.save()
        await Chat.findByIdAndUpdate(new ObjectId(roomId), { $set: { lastMessage: message } })
        socketEmitOne(roomId, newMsg)
        return res.json({ success: true, message: "Message sent successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}

exports.updateViaSocket = async (data) => {
    try {

        let { roomId, messageId } = data

        let msgData = await Message.findById(messageId)

        msgData.readStatus = true

        await msgData.save()

        socketEmitOne(roomId, msgData)

    } catch (error) {
        console.log(error);
    }
}

exports.getAfterParticular = async (req, res) => {
    try {

        let { lastMessage } = req.query

        let lmsg = await Message.findById(lastMessage)

        let msgs = await Message.find({ createdAt: { $gte: lmsg.createdAt }, chatId: lmsg.chatId })

        let ids = msgs.map(item => ObjectId(item._id))

        await Message.updateMany({ _id: { $in: ids }, to: req.user._id }, { $set: { readStatus: true } })

        return res.json({ success: true, messages: msgs })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Something went wrong' })
    }
}