// make connection
const socket = io.connect();
 // for testing locally http://localhost:3000"
const chatapp = new Vue({
    el: '#chatapp',
    data: {
        msg: 'hello world',
        handle: '',
        message: '',
        handle_color: '#000000',
        log: [],
        log_limit: 10,
        users: [],
        users_typing: [],
    },
    methods: {
        emit_chat(){
            socket.emit('chat', {
                message: this.message,
                handle: this.handle,
            });
            this.message = '';
        },
        emit_typing(){
            socket.emit('typing', {handle: this.handle});
        },
        add_message(data){
            this.log.push({handle: data.handle, message: data.message});
            // this.$refs.scrollTop = this.$refs.scrollHeight;
        },
        add_user(data){
            this.users.push(data.handle);
        },
        add_initial_users(data){
            this.users = data.handle;
        },
        add_typing(data){
            if (!this.users_typing.includes(data.handle)){
                this.users_typing.push(data.handle);
            }
        },
        remove_typing(data){
            this.users_typing = this.users_typing.filter(h => h !== data.handle);
        },
    },
    computed: {
    },
    filters: {
        limit_chat(log){
            return log.slice(Math.min(0, log.length - this.log_limit));
        },
    },
    mounted(){
        this.handle = prompt('enter nickname: ');
        socket.emit('user_entry', {handle: this.handle});
    },
    updated(){
        document.getElementById('log').scrollTop = 9999999;
    },
});

// Listen for events
socket.on('users_initial', data => chatapp.add_initial_users(data));

socket.on("chat", data => chatapp.add_message(data));

socket.on('user_entry', data => chatapp.add_user(data));

socket.on('typing', data => chatapp.add_typing(data));
socket.on('remove_typing', data => chatapp.remove_typing(data));