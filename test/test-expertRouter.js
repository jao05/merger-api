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
          .get('/experts?type=Legal')          
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
          .get('/experts?type=Legal')
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
            console.log(resExpert);
            return Expert.findById(resExpert._id); // ***no serialize funtion so use mongoose id convention**          
           })
          .then(function(expertComp) {
            
            expect(resExpert.type).to.equal(expertComp.type); // ****expertComp is undefined****
            expect(resExpert.name).to.equal(expertComp.name);
            expect(resExpert.contact).to.equal(expertComp.contact);            
            expect(resExpert.location).to.equal(expertComp.location);           
          });
    });	
  });  


  // Test the POST request for the '/expert' endpoint
  describe('the POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the expert we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new expert', function() {

      const newExpert = {
        type: "sampleType",
        name: "sampleName",
        contact: {
          firstName: "sampleFirstName",
          lastName: "sampleLastName",
          email: "sampleEmail"
        },
        location: {

          city: "sampleCity",
          state: "sampleState",
          country: "sampleCountry"
        }
      }

      return chai.request(app)
        .post('/experts')
        .send(newExpert)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'type',
            'name', 
            'contact',
            'location'            
          ); 
          
          expect(res.body.type).to.equal(newExpert.type);
          expect(res.body.name).to.equal(newExpert.name);
          // because Mongo should have created id on insertion
          expect(res.body.id).to.not.be.null;
          expect(res.body.contact).to.equal(newExpert.contact);          
          expect(res.body.location).to.equal(newExpert.location);          

          return Expert.findById(res.body.id)
          .then(function(expert) {
            expect(expert.type).to.equal(newExpert.type);
            expect(expert.name).to.equal(newExpert.name);
            expect(expert.contact).to.equal(newExpert.contact);          
            expect(expert.location).to.equal(newExpert.location);          
          });             
        })        
      });
  });


  // Test the PUT request for the '/expert' endpoint
  describe('the PUT endpoint', function() {
    
    // strategy:
    //  1. Get an existing expert from db
    //  2. Make a PUT request to update that expert
    //  3. Prove expert returned by request contains data we sent
    //  4. Prove expert in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        name: "updatedName",
        type: "updatedType",
        contact: {
          firstName: "updatedFirstName",
          lastName: "updatedLastName",
          email: "updatedEmail"
        },
        location: {
          city: "updatedCity",
          state: "updatedState",
          country: "updatedCountry"
        }
      };

      return Expert
        .findOne()
        .then(function(expert) {
          updateData.id = expert.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/experts/${expert.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');

          return Expert.findById(updateData.id);
        })
        .then(function(expert) {
          expect(expert.name).to.equal(updateData.name);
          expect(expert.type).to.equal(updateData.type);
          expect(expert.contact).to.equal(updateData.contact);
          expect(expert.location).to.equal(updateData.location);
        });
    })
  });


  // Test the DELETE request for the '/expert' endpoint
  describe('the DELETE endpoint', function() {
    
    // strategy:
    //  1. get a expert
    //  2. make a DELETE request for that expert's id
    //  3. assert that response has right status code
    //  4. prove that expert with the id doesn't exist in db anymore
    it('delete a expert by id', function() {

      let currentExpert;

      return Expert
        .findOne()
        .then(function(_currentExpert) {
          currentExpert = _currentExpert;
          return chai.request(app).delete(`/experts/${currentExpert.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Expert.findById(currentExpert.id);
        })
        .then(function(_currentExpert) {
          expect(_currentExpert).to.be.null;
        });
    });
  });
});