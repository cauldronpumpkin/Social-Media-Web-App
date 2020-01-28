const express     = require('express');
const graphqlHTTP = require('express-graphql');
const schema      = require('./schema/schema')
const mongoose    = require('mongoose');
const jwt         = require('jsonwebtoken');
const cloudinary  = require('cloudinary').v2;
const auth        = require('./middlewares/auth');
const cors        = require('./middlewares/cors');
const imageApi    = require('./routes/imageUpload');

// Express App
const app = express();

// Middlewares
app.use(cors);
app.use(auth);

// Connecting to MongoDB database
mongoose.connect('mongodb+srv://ishu:mymellon@tryinggraphql-nz9uu.mongodb.net/test?retryWrites=true&w=majority');
mongoose.connection.once('open', () => {
    console.log("Connected To MongoDB.");
})

// Routes 
app.use('/image', imageApi);

// GraphQL
app.use('/graphql', graphqlHTTP(({
    schema,
    graphiql: true,
})));

// Server
app.listen(4000, () => {
    console.log("Listensing to port 4000");
})