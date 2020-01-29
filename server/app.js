const express     = require('express');
const graphqlHTTP = require('express-graphql');
const schema      = require('./schema/schema')
const mongoose    = require('mongoose');
const jwt         = require('jsonwebtoken');
const cloudinary  = require('cloudinary').v2;
const auth        = require('./middlewares/auth');
const bodyParser  = require('body-parser');

// Express App
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Middlewares
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:8080'
}
app.use(cors(corsOptions));
app.use(auth);

// Connecting to MongoDB database
mongoose.connect('mongodb+srv://ishu:mymellon@tryinggraphql-nz9uu.mongodb.net/test?retryWrites=true&w=majority');
mongoose.connection.once('open', () => {
    console.log("Connected To MongoDB.");
})

const imageApi    = require('./routes/imageUpload');
// GraphQL
app.use('/graphql', graphqlHTTP(({
    schema,
    graphiql: true,
})));

app.use('/image', imageApi);

// Server
app.listen(4000, () => {
    console.log("Listensing to port 4000");
})
