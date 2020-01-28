const cors = require('cors');

const corsOptions = {
    origin: 'http://127.0.0.1:8080'
}

module.exports = cors(corsOptions);