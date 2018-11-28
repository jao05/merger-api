const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Expert} = require('./models');

router.use(jsonParser);

// GET
router.get("/", (req, res) => {
  
  Expert.find()

  	// Return all experts in the db
    .then(experts => {
      res.json({
        expertCompanies: experts
      });
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
}); 

// PUT or UPDATE

// DELETE

module.exports = router;