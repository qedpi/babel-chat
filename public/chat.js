// import {Drawable, Point, Circle, Pair, Stroke} from 'Drawable.js';

// import {Pair} from "./Drawable";


// make connection
const socket = io.connect();
 // for testing locally http://localhost:3000"

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

        canvas: null,
        context: null,
        radius: .5,
        draw_stack: [],

        mouse: {
            x: 0,
            y: 0,
        },
        dragging: false,

        renderedStrokes: [],
        undoStrokes: [],
        strokeBuffer: [],           // list of points
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

        update_mouse(e){
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        },

        draw_path(e){
            this.update_mouse(e);
            if (this.dragging) {
                context.lineTo(this.mouse.x, this.mouse.y);
                context.stroke();

                context.beginPath(); // move to new point
                context.moveTo(this.mouse.x, this.mouse.y);

                this.strokeBuffer.push(new Pair(this.mouse.x, this.mouse.y));
            }
        },

        draw_circle(e){
            this.update_mouse(e);
            if (this.dragging){
                const rect = this.canvas.getBoundingClientRect();
                const circ = {x: e.offsetX, y: e.offsetY};

                this.context.beginPath();
                this.context.arc(circ.x, circ.y, this.radius * 10, 0, Math.PI * 2);
                this.context.arc(e.pageX, e.pageY, this.radius * 10, 0, Math.PI * 2);
                this.context.fill();

                this.draw_stack.push(circ);
                socket.emit('circle', circ);
            }
        },
        add_circle(circ){
            this.context.beginPath();
            this.context.arc(circ.x, circ.y, this.radius * 10, 0, Math.PI * 2);
            this.context.fill();
            this.draw_stack.push(circ);
        },
    },
    beforeMount(){
        let response = '';
        while (response === '' || response === null || this.users.includes(response)){
            if (response === ''){
                response = prompt('enter nickname: ');
            } else {
                response = prompt('nickname already used, enter another nickname: ');
            }
        }
        this.users.push(this.handle = response);
        this.log.push({handle: this.handle, message: ', welcome to babelchat!', type: 'log-users'});

        socket.emit('user_entry', {handle: this.handle});
    },
    mounted(){
        this.canvas = document.getElementById('canvas');
        // canvas.height = 250;// window.innerHeight;

        this.canvas.width = 500;
        this.canvas.height = 600;
        this.context = this.canvas.getContext('2d');
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


// server to client interactions
socket.on("chat", data => chatapp.add_message(data));

socket.on('user_entry', data => chatapp.add_user(data));
socket.on('user_exit', data => chatapp.remove_user(data));
socket.on('users_update', data => chatapp.add_initial_users(data));

socket.on('typing', data => chatapp.add_typing(data));
socket.on('remove_typing', data => chatapp.remove_typing(data));

socket.on('circle', data => chatapp.add_circle(data));