// For test syntax
const chai = require('chai'); 

// For mock HTTP requests for our tests
const chaiHttp = require('chai-http');

// To use mongo db capabilities
const mongoose = require('mongoose');

// Import server.js and use destructuring assignment to create variables for
// server.app, server.runServer, and server.closeServer
const {app, runServer, closeServer} = require('../server');

// Import test db url from config file
const {TEST_DATABASE_URL} = require('../config');

// Import model
const {Expert} = require('../models');

// declare an expect variable from chai import
const expect = chai.expect;

// For mock HTTP requests for our tests
chai.use(chaiHttp);

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

// Create some test data and add it to our test db
function seedExpertData(){
  const seededExpertCompanies = [
      {
        type: "Legal",
		name: "Lawyer Inc.",
		contact: {
			firstName: "Larry",
			lastName: "Law",
			email: "larry@law.com"
		},
		location: {

			city: "New York",
			state: "NY",
			country: "United States"
		}
      },
      {
        type: "Financial",
		name: "IB Inc.",
		contact: {
			firstName: "Billy",
			lastName: "Banker",
			email: "billy@banker.com"
		},
		location: {

			city: "New York",
			state: "NY",
			country: "United States"
		}
      },
      {
        type: "Financial",
		name: "Big Bank Inc.",
		contact: {
			firstName: "Brandon",
			lastName: "Banks",
			email: "brandon@bigbank.com"
		},
		location: {

			city: "New York",
			state: "NY",
			country: "United States"
		}
      },
      {
        type: "Legal",
		name: "Business Law Inc.",
		contact: {
			firstName: "Jerry",
			lastName: "Juris",
			email: "jerry@bl.com"
		},
		location: {

			city: "Boston",
			state: "MA",
			country: "United States"
		}
      }
    ]
  

  return Expert.create(seededExpertCompanies);
}

describe('Serving expert assets', function {
	
  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  
  beforeEach(function() {
    return seedExpertData();
  });
  

  afterEach(function() {
    return tearDownDb();
  });
  

  // Close server after these tests run in case
  // we have other test modules that need to 
  // call `runServer`. If server is already running,
  // `runServer` will error out.
  after(function() {
    return closeServer();
  });
});


// Test the GET request for the '/expert' endpoint


// Test the POST request for the '/expert' endpoint


// Test the PUT request for the '/expert' endpoint


// Test the DELETE request for the '/expert' endpoint