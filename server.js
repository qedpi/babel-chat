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
    console.log('translating', data.message);
    translate(data.message, {from: 'en', to: 'fr'}).then(res => {
        console.log('translated to:', res.text);
        io.sockets.emit("chat", {handle: data.handle, message: res.text});
    }).catch(err => {});
}

io.on("connection", socket => {
    console.log("made socket connection to", socket.id);
    io.sockets.emit('users_initial', {handle: [...users_online]});

    socket.on('user_entry', data => {
        console.log('user entered', data.handle);
        users_online.add(data.handle);
        uid_to_handle.set(socket.id, data.handle);
        console.log(uid_to_handle);
        io.sockets.emit('user_entry', data);
    });

    socket.on('chat', data => {
        io.sockets.emit('remove_typing', data);
        wait_translate(data);
        // io.sockets.emit("chat", {handle: data.handle, message: translation});
        // console.log('result', {handle: data.handle, message: to_french(data.message)});
    });

    socket.on('typing', data => {
        io.sockets.emit('typing', data);
    });

    socket.on('disconnect', () => {
        users_online.delete(uid_to_handle.get(socket.id));
        io.sockets.emit('user_exit', {handle: uid_to_handle.get(socket.id)});
        io.sockets.emit('users_initial', {handle: [...users_online]});
        console.log('disconnected', uid_to_handle.get(socket.id), socket.id);
        uid_to_handle.delete(socket.id);
    });
});

