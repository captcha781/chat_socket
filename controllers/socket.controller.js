const { Server } = require('socket.io')

let socket
exports.initializeSocket = (server) => {
    var io = new Server(server, { cors: { origin: "*" } })
    socket = io

    io.on('connection', (socket) => {
        console.log('Connected');
        socket.on('joinroom', (data)=> {
            socket.join(data)
        })

        socket.on('updateMessage', (data) => {
            updateViaSocket(data)
        })
    })
    
}

exports.socketEmitOne = (roomId, message,) => {
    socket.in(roomId).emit('chatMessage', message)
}
