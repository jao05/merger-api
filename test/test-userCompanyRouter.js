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
const {UserCompany} = require('../models');

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
function seedUserCompanyData(){
  const seededUserCompanies = [
      {
        name: "Dev Inc.",
  		location: {  
	  		city: "San Francisco",
	  		state: "CA",
	  		country: "United States"
	  	},  
	  	industry: "Technology",
	  	contact: {
	  		firstName: "Tim",
	  		lastName: "Tech",
	  		email: "tim@dev.com"
	  	},
	  	description: "Lorem ipsum....",
	  	openToMerger: true,
	  	openToAcquisition: true,
	  	openToSell: true,
	  	password: "password"
      },
      {
        name: "Money Inc.",
  		location: {  
	  		city: "New York",
	  		state: "NY",
	  		country: "United States"
	  	},  
	  	industry: "Financial",
	  	contact: {
	  		firstName: "Mitch",
	  		lastName: "Money",
	  		email: "mitch@money.com"
	  	},
	  	description: "Lorem ipsum....",
	  	openToMerger: true,
	  	openToAcquisition: true,
	  	openToSell: false,
	  	password: "password"
      },
      {
        name: "Barber Inc.",
  		location: {  
	  		city: "Atlanta",
	  		state: "GA",
	  		country: "United States"
	  	},  
	  	industry: "Beauty",
	  	contact: {
	  		firstName: "Billy",
	  		lastName: "Barber",
	  		email: "billy@barber.com"
	  	},
	  	description: "Lorem ipsum....",
	  	openToMerger: true,
	  	openToAcquisition: false,
	  	openToSell: true,
	  	password: "password"
      },
      {
        name: "Doctor Inc.",
  		location: {  
	  		city: "Memphis",
	  		state: "TN",
	  		country: "United States"
	  	},  
	  	industry: "Health",
	  	contact: {
	  		firstName: "Dylan",
	  		lastName: "Doctor",
	  		email: "dylan@doctor.com"
	  	},
	  	description: "Lorem ipsum....",
	  	openToMerger: true,
	  	openToAcquisition: false,
	  	openToSell: false,
	  	password: "password"
      }
    ]
  

  return UserCompany.create(seededUserCompanies);
}