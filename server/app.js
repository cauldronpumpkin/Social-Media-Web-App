const express     = require('express');
const graphqlHTTP = require('express-graphql');
const schema      = require('./schema/schema')
const mongoose    = require('mongoose');
const auth        = require('./middlewares/auth');
const bodyParser  = require('body-parser');
const http = require('http')
const { subscribe, execute } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws');
const expressPlayground = require('graphql-playground-middleware-express')
  .default

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

app.get('/playground', expressPlayground({ endpoint: '/graphql', subscriptionsEndpoint: 'ws://localhost:4000/subscriptions' }))

const server = http.createServer(app);
// Server
server.listen(4000, () => {
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema: schema,
      },
      {
        server: server,
        path: '/subscriptions',
      },
    );
    console.log("Listenting")
})
