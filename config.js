"use strict";

// For CORS capability
exports.CLIENT_ORIGIN = 'https://guarded-anchorage-26538.herokuapp.com';
//exports.CLIENT_ORIGIN = 'localhost????????';


// Use production database url
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/Merger";


// Use development database url
exports.TEST_DATABASE_URL =  
  process.env.TEST_DATABASE_URL || "mongodb://localhost/Merger-test";  

exports.PORT = process.env.PORT || 8000;