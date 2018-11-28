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

// POST WITH AUTHENTICATION
/************************************************
router.post("/login", localAuth, (req, res) => {
    console.log('login works....');
    res.status(200).json(req.user.serialize());
});
**************************************************/

// POST
// POST requests to '/userCompany' endpoint
router.post("/", jsonParser, (req, res) => {
  const requiredFields = [
    "name",
    "location",
    "industry",
    "contact",
    "description",
    "openToMerger",
    "openToAcquisition",
    "openToSell"
  ];
  
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }  

  // To hash the password for security
  /********************************************
  return User.hashPassword(req.body.password)    
    .then(hash => {
      return User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hash        
      });
    })  
    .then(user => {
      res.status(201).json(user.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
    ****************************************************/
});


// PUT or UPDATE
router.put("/", jsonParser, (req, res) => {  

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = [
    "openToMerger", 
    "openToAcquisition", 
    "openToSell", 
    "contact"
  ];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
});

// DELETE
router.delete("/userCompany/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then(comp => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;