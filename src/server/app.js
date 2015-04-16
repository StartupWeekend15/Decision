
var Server = require('./Server'),
    opts = {
        port: this._port = process.env.PORT || 3700,
        apiKey: process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyDIw6RsLMhU2Z3WRNDpWlx3iOGJjfRFkj4'  // FIXME
    },
    server = new Server(opts);

server.start();

