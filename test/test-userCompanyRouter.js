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

describe('Serving userCompany assets', function {

  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  
  beforeEach(function() {
    return seedUserCompanyData();
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


  // Test the GET request for the '/userCompany' endpoint
  describe('the GET endpoint', function() {

  	it('should return companies that meet specific criteria', function() {

  		// strategy:
        //    1. get back all companies returned by GET request to `/userCompany`
        //    2. prove the res has the right status & data type
        //    3. prove the number of companies we got back is equal to number
        //       in db.
        //
        // We need to have access to mutate and access `res` across
        // `.then()` calls below, so declare it here so we can modify in place
        let res;

        return chai.request(app)
          .get('/userCompany?industry=Health&openToMerger=true')          
          .then(function(_res) {
            // so subsequent .then blocks can access response object
            res = _res;
            expect(res).to.have.status(200);                      
            expect(res.body.companies).to.have.lengthOf.at.least(1);  // otherwise our db seeding didn't work
          })  
  	});


  	it('should return companies with the correct fields', function() {
  		
  	});
  });

  // Test the POST request for the '/userCompany' endpoint
  describe('the POST endpoint', function() {
  	
  });

  // Test the PUT request for the '/userCompany' endpoint
  describe('the PUT endpoint', function() {
  	
  });

  // Test the DELETE request for the '/userCompany' endpoint
  describe('the DELETE endpoint', function() {
  	
  });
});