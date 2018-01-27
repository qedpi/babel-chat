// Imports
const express = require('express');
const socket = require('socket.io');
const translate = require('google-translate-api');

// App setup
const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log('listening', port)
});

// Static files
app.use(express.static('public'));

// Socket Setup
const io = socket(server);

// Users
const users_online = new Set();
const uid_to_handle = new Map();

function wait_translate(data){
    console.log('translating', data.message, 'to', data.lang_to, ':');

    translate(data.message, {from: '', to: data.lang_to}).then(res => {
        console.log(res.text);
        io.emit("chat", {handle: data.handle, message: res.text, lang_to: data.lang_to});
    }).catch(err => {});
}

io.on("connection", socket => {
    console.log("made socket connection to", socket.id);
    //    socket.on('user_entry_attempt', () => {
    socket.emit('users_initial', {handle: [...users_online]});

    socket.on('user_entry', data => {
        console.log('user entered', data.handle);
        users_online.add(data.handle);
        uid_to_handle.set(socket.id, data.handle);
        console.log(uid_to_handle);
        socket.broadcast.emit('user_entry', data);
    });

    socket.on('chat', data => {
        socket.broadcast.emit('remove_typing', data);

        if (data.lang_to === 'none'){
            socket.broadcast.emit('chat', data);
            console.log('no translation', data.message);
        } else {
            wait_translate(data);
        }
    });

    socket.on('typing', data => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        users_online.delete(uid_to_handle.get(socket.id));
        socket.broadcast.emit('user_exit', {handle: uid_to_handle.get(socket.id)});
        socket.broadcast.emit('users_update', {handle: [...users_online]});
        console.log('disconnected', uid_to_handle.get(socket.id), socket.id);
        uid_to_handle.delete(socket.id);
    });
});

