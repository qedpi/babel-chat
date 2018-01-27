// make connection
const socket = io.connect();
 // for testing locally http://localhost:3000"

const masterapp = new Vue({

});

const chatapp = new Vue({
    data: {
        msg: 'hello world',
        handle: '',
        message: '',
        handle_color: '#000000',
        log: [],
        log_limit: 10,
        users: [],
        users_typing: [],
        lang_to: 'none',
        tts_langs: ['no', 'en', 'fr', 'sp', 'po', 'ge', 'it'],
        use_tts: false,
    },
    methods: {
        emit_chat(){
            if (this.lang_to === 'none'){
                this.add_message({message: this.message, handle: this.handle, lang_to: this.lang_to});
                // responsiveVoice.speak(this.message);
            }
            socket.emit('chat', {
                message: this.message,
                handle: this.handle,
                lang_to: this.lang_to,
            });
            this.message = '';

        },
        emit_typing(){
            socket.emit('typing', {handle: this.handle});
        },
        add_message(data){
            this.log.push({handle: data.handle, message: data.message, type: 'log-msg'});
            // this.$refs.scrollTop = this.$refs.scrollHeight;
            // alert(data.lang_to + ' ' + data.lang_to.substring(0, 3));
            if (data.handle !== this.handle && this.use_tts && this.tts_langs.includes(data.lang_to.substring(0, 2))){
                responsiveVoice.speak(data.handle + ' says ' + data.message);
            }
        },
        add_user(data){
             if (true || !this.users.includes(data.handle)){
                this.users.push(data.handle);
            }
            this.log.push({handle: data.handle, message: 'has joined!', type: 'log-users'});
        },
        remove_user(data){
            this.log.push({handle: data.handle, message: 'has left!', type: 'log-users'});
        },
        add_initial_users(data){
            this.users = data.handle;
        },
        add_typing(data){
            if (!this.users_typing.includes(data.handle)){
                this.users_typing.push(data.handle);
                setTimeout(() => this.remove_typing(data), 5000);
            }
        },
        remove_typing(data){
            this.users_typing = this.users_typing.filter(h => h !== data.handle);
        },
    },
    beforeMount(){
        let response = '';
        while (response === '' || this.users.includes(response)){
            if (response === ''){
                response = prompt('enter nickname: ');
            } else {
                response = prompt('nickname already used, enter another nickname: ');
            }
        }
        this.users.push(this.handle = response);

        socket.emit('user_entry', {handle: this.handle});
    },
    updated(){
        document.getElementById('log').scrollTop = 9999999;
    },
});

// Load initial users
socket.on('users_initial', data => {
    chatapp.add_initial_users(data);
    chatapp.$mount('#chatapp');
});

socket.on("chat", data => chatapp.add_message(data));

socket.on('user_entry', data => chatapp.add_user(data));
socket.on('user_exit', data => chatapp.remove_user(data));
socket.on('users_update', data => chatapp.add_initial_users(data));

socket.on('typing', data => chatapp.add_typing(data));
socket.on('remove_typing', data => chatapp.remove_typing(data));