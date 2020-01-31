const express     = require('express');
const graphqlHTTP = require('express-graphql');
const schema      = require('./schema/schema')
const mongoose    = require('mongoose');
const auth        = require('./middlewares/auth');
const bodyParser  = require('body-parser');
const http = require('http')
const { subscribe, execute } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

// Express App
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Middlewares
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:8081'
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

// Server
const server = http.createServer(app);
server.listen(4000, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: '/subscriptions',
      },
    );
})
