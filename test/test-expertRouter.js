// For test syntax
const chai = require('chai'); 

// For mock HTTP requests for our tests
const chaiHttp = require('chai-http');

// To use with comparisons in testing
chai.use(require('chai-shallow-deep-equal'));

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
		    location: "New York"
      },
      {
        type: "Financial",
		    name: "IB Inc.",
		    contact: {
			   firstName: "Billy",
			   lastName: "Banker",
			   email: "billy@banker.com"
		    },
		    location: "New York"
      },
      {
        type: "Financial",
		    name: "Big Bank Inc.",
		    contact: {
			   firstName: "Brandon",
			   lastName: "Banks",
			   email: "brandon@bigbank.com"
		    },
		    location: "New York"
      },
      {
        type: "Legal",
    		name: "Business Law Inc.",
    		contact: {
    			firstName: "Jerry",
    			lastName: "Juris",
    			email: "jerry@bl.com"
		    },
		    location: "Boston"
      }
    ]
  

  return Expert.create(seededExpertCompanies);
         
}

describe('Serving expert assets', function() {
	
  this.timeout(15000); // **** Added to deal with timeout error

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

  	this.timeout(10000); // **** Added to deal with timeout error

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
          .get('/experts/Legal/Boston')          
          .then(function(_res) {            
            // so subsequent .then blocks can access response object
            res = _res;            
            expect(res).to.have.status(200);                      
            expect(res.body.companies).to.have.lengthOf.at.least(1);  // otherwise our db seeding didn't work
          })  
  	});

  	it('should return experts with the correct fields', function() {
  		
  		// Strategy: Get back experts, and ensure they have expected keys

        let resExpert;
        return chai.request(app)
          .get('/experts/Legal/Boston')
          .then(function(res) {            
            expect(res).to.have.status(200);
            expect(res).to.be.json;            
            expect(res.body.companies).to.be.a('array');
            expect(res.body.companies).to.have.lengthOf.at.least(1);

            res.body.companies.forEach(function(expertCompany) {
              expect(expertCompany).to.be.a('object');
              expect(expertCompany).to.include.keys(
                'type',
                'name',
                'contact', 
                'location'
              );
            }); 
            
            resExpert = res.body.companies[0];            
            return Expert.findById(resExpert.id); 
           })
          .then(function(expertComp) {
            
            expect(resExpert.type).to.equal(expertComp.type);
            expect(resExpert.name).to.equal(expertComp.name);
            expect(resExpert.contact.firstName).to.shallowDeepEqual(expertComp.contact.firstName);
            expect(resExpert.contact.lastName).to.shallowDeepEqual(expertComp.contact.lastName);
            expect(resExpert.contact.email).to.shallowDeepEqual(expertComp.contact.email);            
            // expect(resExpert.location.city).to.shallowDeepEqual(expertComp.location.city);
            // expect(resExpert.location.state).to.shallowDeepEqual(expertComp.location.state);
            // expect(resExpert.location.country).to.shallowDeepEqual(expertComp.location.country);
            expect(resExpert.location).to.shallowDeepEqual(expertComp.location);
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
        location: "sampleCity"
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
          expect(res.body.contact.firstName).to.shallowDeepEqual(newExpert.contact.firstName);
          expect(res.body.contact.lastName).to.shallowDeepEqual(newExpert.contact.lastName);
          expect(res.body.contact.email).to.shallowDeepEqual(newExpert.contact.email);
          // expect(res.body.location.city).to.shallowDeepEqual(newExpert.location.city);
          // expect(res.body.location.state).to.shallowDeepEqual(newExpert.location.state);
          // expect(res.body.location.country).to.shallowDeepEqual(newExpert.location.country);
          expect(res.body.location).to.shallowDeepEqual(newExpert.location);

          return Expert.findById(res.body.id);                       
        })
        .then(function(expert) {            
            expect(expert.type).to.equal(newExpert.type);
            expect(expert.name).to.equal(newExpert.name);
            expect(expert.contact.firstName).to.shallowDeepEqual(newExpert.contact.firstName);
            expect(expert.contact.lastName).to.shallowDeepEqual(newExpert.contact.lastName);
            expect(expert.contact.email).to.shallowDeepEqual(newExpert.contact.email);         
            // expect(expert.location.city).to.shallowDeepEqual(newExpert.location.city);
            // expect(expert.location.state).to.shallowDeepEqual(newExpert.location.state);
            // expect(expert.location.country).to.shallowDeepEqual(newExpert.location.country);
            expect(expert.location).to.shallowDeepEqual(newExpert.location);
        });
      });
  });


  // Test the PUT request for the '/expert' endpoint
  describe('the PUT endpoint', function() {
    
    this.timeout(10000); // **** Added to deal with timeout error

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
        location: "updatedCity"
      };

      return Expert
        .findOne()
        .then(function(expert) {
          console.log('****epxert is ', expert); 
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
          expect(expert.contact.firstName).to.shallowDeepEqual(updateData.contact.firstName);
          expect(expert.contact.lastName).to.shallowDeepEqual(updateData.contact.lastName);
          expect(expert.contact.email).to.shallowDeepEqual(updateData.contact.email);
          // expect(expert.location.city).to.shallowDeepEqual(updateData.location.city);
          // expect(expert.location.state).to.shallowDeepEqual(updateData.location.state);
          // expect(expert.location.country).to.shallowDeepEqual(updateData.location.country);
          expect(expert.location).to.shallowDeepEqual(updateData.location);
        });
    })
  });


  // Test the DELETE request for the '/expert' endpoint
  describe('the DELETE endpoint', function() {
    
    this.timeout(10000); // **** Added to deal with timeout error

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
          console.log('currentExpert is', currentExpert);
          return chai.request(app).delete(`/experts/${currentExpert.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Expert.findById(currentExpert.id);
        })
        .then(function(_currentExpert) {
          expect(_currentExpert).to.be.null;
        })
        .catch( function(err){
            console.log(err);
        });
    });
  });
});