// make connection
const socket = io.connect("http://localhost:3000");

// Query DOM
const message = document.getElementById("message");
const handle = document.getElementById("handle");
const btn = document.getElementById("sendbutton");
const output = document.getElementById("output");

// Emit events
btn.addEventListener('click', () => {
    socket.emit("chat", {
        message: message.value,
        handle: handle.value,
    })
});

// Listen for events
socket.on("chat", data => {
    output.innerHTML += '<p>' + data.handle + ': ' + data.message + '</p>'
});