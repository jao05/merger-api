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