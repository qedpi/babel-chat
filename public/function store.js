filters: {
    limit_chat(log){
        return log.slice(Math.min(0, log.length - this.log_limit));
    },
},