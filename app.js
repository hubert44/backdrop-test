const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const graphqlSchema = require('./controllers/graphql/schema');
const graphqlResolver = require('./controllers/graphql/resolver');
const {graphqlHTTP} = require('express-graphql');

const noRoute = require("./controllers/errors/404");
const genError = require("./controllers/errors/errorHandler");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use('/backdrop/api', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        return {Error: err.originalError.message, Status: err.originalError.statusCode};
    }
}));


//404 error handler
app.use(noRoute);

//thrown error handler
app.use(genError);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_NET}/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(result => {
    app.listen(process.env.PORT || 3000);
    console.log("connected");
})
.catch(err => console.log(err));