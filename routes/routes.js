const express = require('express')
const chatCtrl = require('../controllers/chat.controller')
const authCheck = require('../middleware/auth.middleware')
const router = express.Router()


router.route('/signup').post(chatCtrl.signup)
router.route('/signin').post(chatCtrl.signin)

router.route('/getUsers').get(authCheck, chatCtrl.getUsers)
router.route('/getChatRoom').post(authCheck, chatCtrl.getChatRoom)
router.route('/sendMessage').post(authCheck, chatCtrl.makeMessage)
router.route('/getAfterParticularMsg').get(authCheck, chatCtrl.getAfterParticular)



module.exports = router