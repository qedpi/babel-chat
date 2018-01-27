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

function wait_translate(data){
    console.log('translating', data.message);
    translate(data.message, {from: 'en', to: 'fr'}).then(res => {
        console.log('translated to:', res.text);
        io.sockets.emit("chat", {handle: data.handle, message: res.text});
    }).catch(err => {});
}

io.on("connection", socket => {
    console.log("made socket connection to", socket.id);

    socket.on('user_entry', data => {
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
});

