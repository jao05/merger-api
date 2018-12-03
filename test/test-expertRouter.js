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

describe('Serving expert assets', function() {
	
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


  // Test the GET request for the '/expert' endpoint
  describe('the GET endpoint', function(){

  	it('should return experts that meet specific criteria', function() {

  		// strategy:
        //    1. get back all experts returned by GET request to `/userCompany`
        //    2. prove the res has the right status & data type
        //    3. prove the number of experts we got back is equal to number
        //       in db.
        //
        // We need to have access to mutate and access `res` across
        // `.then()` calls below, so declare it here so we can modify in place
        let res;

        return chai.request(app)
          .get('/expert?type=Legal')          
          .then(function(_res) {
            // so subsequent .then blocks can access response object
            res = _res;
            expect(res).to.have.status(200);                      
            expect(res.body.expertCompanies).to.have.lengthOf.at.least(1);  // otherwise our db seeding didn't work
          })  
  	});

  	it('should return experts with the correct fields', function() {
  		
  		// Strategy: Get back all experts, and ensure they have expected keys

        let resExpert;
        return chai.request(app)
          .get('/expert?type=Legal')
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;            
            expect(res.body.expertCompanies).to.be.a('array');
            expect(res.body.expertCompanies).to.have.lengthOf.at.least(1);

            res.body.expertCompanies.forEach(function(expertCompany) {
              expect(expertCompany).to.be.a('object');
              expect(expertCompany).to.include.keys(
                'type',
                'name',
                'contact', 
                'location'
              );
            }); 
            
            resExpert = res.body.expertCompanies[0];
            return Negotiator.findById(resExpert.id);           
           })
          .then(function(expertComp) {
            
            expect(resExpert.type).to.equal(expertComp.type);
            expect(resExpert.name).to.equal(expertComp.name);
            expect(resExpert.contact).to.equal(expertComp.contact);            
            expect(resExpert.location).to.equal(expertComp.location);           
          });
    });	
  });

  


  // Test the POST request for the '/expert' endpoint


  // Test the PUT request for the '/expert' endpoint


  // Test the DELETE request for the '/expert' endpoint
});