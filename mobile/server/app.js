
var Server = require('./Server'),
    dotenv = require('dotenv'),
    server,
    opts;

dotenv.load();

opts = {
    requestor: process.env.NODE_ENV === 'development'? 
               'Test' :
               'Google',
    port: this._port = process.env.PORT || 3700,
    apiKey: process.env.GOOGLE_PLACES_API_KEY 
};

server = new Server(opts);
server.start();

