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

// PUT or UPDATE

// DELETE

module.exports = router;