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

describe('Serving userCompany assets', function() {

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

  	this.timeout(10000); // **** Added to deal with timeout error

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
  		
  		// Strategy: Get back all negotiators, and ensure they have expected keys

        let resCompany;
        return chai.request(app)
          .get('/userCompany?industry=Health&openToMerger=true')
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;            
            expect(res.body.companies).to.be.a('array');
            expect(res.body.companies).to.have.lengthOf.at.least(1);

            res.body.companies.forEach(function(company) {
              expect(company).to.be.a('object');
              expect(company).to.include.keys(
                'id',
                'name', 
                'location', 
                'industry', 
                'contact',
                'description',
                'openToMerger',
                'openToAcquisition',
                'openToSell'
              );
            }); 
            
            resCompany = res.body.companies[0];
            return Negotiator.findById(resCompany.id);           
           })
          .then(function(comp) {
            
            expect(resCompany.name).to.equal(comp.name);
            expect(resCompany.location).to.equal(comp.location);
            expect(resCompany.industry).to.equal(comp.industry);
            expect(resCompany.contact).to.equal(comp.contact);
            expect(resCompany.description).to.equal(comp.description);
            expect(resCompany.openToMerger).to.equal(comp.openToMerger);
            expect(resCompany.openToAcquisition).to.equal(comp.openToAcquisition);
            expect(resCompany.openToSell).to.equal(comp.openToSell);            
          });
  	});	
  });

  // Test the POST request for the '/userCompany' endpoint
  describe('the POST endpoint', function() {
  	
    this.timeout(10000); // **** Added to deal with timeout error

    // strategy: make a POST request with data,
    // then prove that the company we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new user company', function() {

      const newUserCompany = {
        name: "sampleName",
        location: {  
          city: "sampleCity",
          state: "sampleState",
          country: "sampleCountry"
        },  
        industry: "sampleIndustry",
        contact: {
          firstName: "sampleFirstName",
          lastName: "sampleLastName",
          email: "sampleEmail"
        },
        description: "sampleDescription",
        openToMerger: true,
        openToAcquisition: true,
        openToSell: true,
        password: "password"
      }

      return chai.request(app)
        .post('/userCompany')
        .send(newUserCompany)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id',
            'name', 
            'location', 
            'industry', 
            'contact',
            'description',
            'openToMerger',
            'openToAcquisition',
            'openToSell'
          ); 
          
          expect(res.body.name).to.equal(newUserCompany.name);
          // because Mongo should have created id on insertion
          expect(res.body.id).to.not.be.null;
          expect(res.body.location).to.equal(newUserCompany.location);
          expect(res.body.industry).to.equal(newUserCompany.industry);
          expect(res.body.contact).to.equal(newUserCompany.contact);
          expect(res.body.description).to.equal(newUserCompany.description);
          expect(res.body.openToMerger).to.equal(newUserCompany.openToMerger);
          expect(res.body.openToAcquisition).to.equal(newUserCompany.openToAcquisition);
          expect(res.body.openToSell).to.equal(newUserCompany.openToSell);

          return UserCompany.findById(res.body.id);                   
        })
        .then(function(comp) {
          expect(comp.name).to.equal(newUserCompany.name);
          expect(comp.location).to.equal(newUserCompany.location);
          expect(comp.industry).to.equal(newUserCompany.industry);
          expect(comp.contact).to.equal(newUserCompany.contact);
          expect(comp.description).to.equal(newUserCompany.description);
          expect(comp.openToMerger).to.equal(newUserCompany.openToMerger);
          expect(comp.openToAcquisition).to.equal(newUserCompany.openToAcquisition);
          expect(comp.openToSell).to.equal(newUserCompany.openToSell);          
        });
      });
  });

  // Test the PUT request for the '/userCompany' endpoint
  describe('the PUT endpoint', function() {
  	
    this.timeout(10000); // **** Added to deal with timeout error

    // strategy:
    //  1. Get an existing company from db
    //  2. Make a PUT request to update that company
    //  3. Prove company returned by request contains data we sent
    //  4. Prove company in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        openToMerger: false,
        openToSell: true
      };

      return UserCompany
        .findOne()
        .then(function(comp) {
          updateData.id = comp.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/userCompany/${comp.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');

          return UserCompany.findById(updateData.id);
        })
        .then(function(comp) {
          expect(comp.openToMerger).to.equal(updateData.openToMerger);
          expect(comp.openToSell).to.equal(updateData.openToSell);
        });
    })
  });

  // Test the DELETE request for the '/userCompany' endpoint
  describe('the DELETE endpoint', function() {
  	
    this.timeout(10000); // **** Added to deal with timeout error

    // strategy:
    //  1. get a company
    //  2. make a DELETE request for that company's id
    //  3. assert that response has right status code
    //  4. prove that company with the id doesn't exist in db anymore
    it('delete a company by id', function() {

      let currentUserCompany;

      return UserCompany
        .findOne()
        .then(function(_currentUserCompany) {
          currentUserCompany = _currentUserCompany;
          return chai.request(app).delete(`/userCompany/${currentUserCompany.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return UserCompany.findById(currentUserCompany.id);
        })
        .then(function(_currentUserCompany) {
          expect(_currentUserCompany).to.be.null;
        });
    });
  });
});