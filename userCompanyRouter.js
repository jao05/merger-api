const express = require('express');
const router = express.Router();

//const passport = require('passport'); ************
//const localAuth = passport.authenticate('local', {session: false}); *************

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {UserCompany, Expert} = require('./models');

router.use(jsonParser);

// on GET requests to root
router.get("/", (req, res) => {
  
  UserCompany.find()

  	// success callback: for each UserCompany we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.    
    .then(userComps => {
      res.json({
        companies: userComps.map(comp => comp.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });

});

// POST

// PUT or UPDATE

// DELETE

module.exports = router;