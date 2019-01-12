const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Expert} = require('./models');

router.use(jsonParser);

// GET
router.get("/:type/:location", (req, res) => {
  
  Expert.find({"type": req.params.type, "location": req.params.location})

  	// Return all experts in the db
    .then(experts => {      
      res.json({
        companies: experts.map(expert => expert.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });

});


// GET by ID 
router.get("/:id", (req, res) => {  
  
  Expert.findById(req.query.id)
    
    // success callback: for expert we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.    
    .then(expert => {
      res.json(expert.serialize()) 
      })    
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});



// POST
router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["name", "type", "contact", "location"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Expert.create({
    name: req.body.name,
    type: req.body.type,
    contact: req.body.contact,
    location: req.body.location
  })
  .then(expert => {
    res.status(201).json(expert.serialize()); // **** try POST in postman
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });
}); 



// PUT or UPDATE
router.put("/:id", jsonParser, (req, res) => {  

  // We allow all fields to be updated in this case.
  // If the user sent over any of the updatableFields, we udpate those values
  // in document.
  const toUpdate = {};
  const updateableFields = [
    "name", 
    "type", 
    "contact", 
    "location"
  ];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Expert
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(expert => res.status(201).json(expert.serialize()))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});



// DELETE
router.delete("/:id", (req, res) => {
  Expert.findByIdAndRemove(req.params.id)
    .then(expert => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;