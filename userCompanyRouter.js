const express = require('express');
const router = express.Router();

const passport = require('passport');
const localAuth = passport.authenticate('local', {session: false});

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {UserCompany, Expert} = require('./models');

router.use(jsonParser);

// on GET requests to root
router.get("/:industry/:location/merger", (req, res) => {
  console.log(req.params.industry, req.params.location); // ************************
  let openToMerger = false;
  let openToAcquisition = false;
  let openToSell = false;

  if (req.params.type == 'merger') {

    let openToMerger = true;
  }

  if (req.params.type == 'acquistion') {

    let openToAcquisition = true;
  }

  if (req.params.type == 'sell') {

    let openToSell = true;
  }

  UserCompany.find({"industry": req.params.industry, "location": req.params.location})

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
// ************** This is a user login after they have already signed up (initial POST)?*********************
router.post("/login", async (req, res) => {
    console.log('login works....'); //********************************
    try {
      const company = await UserCompany.findOne({
        name: req.body.name,
      });
      const success = await company.validatePassword(req.body.password);
      console.log('success is', success); //************************************
      if(success) {
        console.log('100'); //********************************
        res.status(200).json(company.serialize());        
      }
      else {
        console.log('Not 100'); //********************************
        res.status(401).send('Incorrect login credentials');
      }
    }
    catch(e) {
      console.log(e); // ************************************************
      res.status(400).send(e.message);
    }    
});





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
    "openToSell",
    "password"
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
  
  return UserCompany.hashPassword(req.body.password)    
    .then(hash => {
      return UserCompany.create({
        name: req.body.name,
        location: req.body.location,
        industry: req.body.industry,
        contact: req.body.contact,
        description: req.body.description,
        openToMerger: req.body.openToMerger,
        openToAcquisition: req.body.openToAcquisition,
        openToSell: req.body.openToSell,
        password: hash        
      });
    })  
    .then(comp => {
      res.status(201).json(comp.serialize());
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
    
});





// PUT or UPDATE
router.put("/:id", jsonParser, (req, res) => {  

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = [
    "openToMerger", 
    "openToAcquisition", 
    "openToSell",
    "name",
    "location",
    "industry"    
  ];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  UserCompany
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, toUpdate, {new: true})
    .then(comp => res.status(201).json(comp.serialize()))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// DELETE
router.delete("/:id", (req, res) => {
  UserCompany.findByIdAndRemove(req.params.id)
    .then(comp => res.status(201).json({message: 'Account was deleted.'})
    .catch(err => res.status(500).json({ message: "Internal server error" })));
});

module.exports = router;