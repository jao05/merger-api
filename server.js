const express = require('express');
const mongoose = require('mongoose');
const app = express();
const {PORT, DATABASE_URL} = require('./config');

const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');

// Import the router files
const userCompanyRouter = require('./userCompanyRouter');
const expertRouter = require('./expertRouter');

const localStrategy = require('./strategies');

// Import passport
const passport = require('passport');
passport.use(localStrategy);
app.use(passport.initialize()); 
app.use(passport.session());

// when requests come into `/userCompanyRouter`
// we'll route them to the express
// router instance we've imported. Remember,
// this router instance acts as a modular, mini-express app.
app.use("/userCompany", userCompanyRouter);


// when requests come into `/expertRouter`
// we'll route them to the express
// router instance we've imported. Remember,
// this router instance acts as a modular, mini-express app.
app.use("/experts", expertRouter);


// Use CORS
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);


app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in runServer
let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };