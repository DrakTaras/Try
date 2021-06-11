const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const {addUser, removeUser, getUser, getUsersInRoom, addTypingUser, getTypingUsersInRoom, removeTypingUser} = require('./utils/users')
const {generateMessage, generateLocationMessage} = require('./utils/messages')

app.use(express.static(__dirname + `/../public`))

io.on("connection", (socket) => {
    console.log("новый пользователь присоединился");
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, username: options.username, room: options.room});
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        io.to(user.room).emit('roomData', getUsersInRoom(user.room));
        socket.emit('message', generateMessage('Admin', `Привет, ${user.username}`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} присоединился`));
        callback()
    });
    socket.on('sendMessage', (message) => {
        let user = getUser(socket.id);
        io.to(user.room).emit('sendMessage', generateMessage(user.username, message, user.bgClass));
    });

    socket.on('sendPrivateMessage', (message, to) => {
        let user = getUser(socket.id);
        console.log(message, to)
        io.to(user.room).emit('sendPrivateMessage', generateLocationMessage(user.username, message, to, 'alert-danger'));
    });

    socket.on('typing', (data) => {
        if(data.typing)
            addTypingUser(socket.id);
        else
            removeTypingUser(socket.id);
        io.to(data.room).emit('display', getTypingUsersInRoom(data.room));
    })

    socket.on('disconnect', () => {
        let user = getUser(socket.id);
        removeUser(socket.id);
        console.log('юзер вышел');
        if (user) {
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} вышел`));
            io.to(user.room).emit('roomData', getUsersInRoom(user.room));
        }
    });
});


server.listen(3000, function () {
    console.log('listening on 3000 port');
});

