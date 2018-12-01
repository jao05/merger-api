const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


// const bcrypt = require('bcryptjs');

// this is our schema to represent a user company
const userCompanySchema = mongoose.Schema({
  name: { type: String, required: true },
  location: {  
  	city: { type: String, required: true },
  	state: { type: String, required: true },
  	country: { type: String, required: true }
  },  
  industry: { type: String, required: true },
  contact: {
  	firstName: String,
  	lastName: String,
  	email: String
  },
  description: String,
  openToMerger: Boolean,
  openToAcquisition: Boolean,
  openToSell: Boolean,
  password: String

});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
userCompanySchema.methods.serialize = function() {
  return {
    id: this._id,
    location: this.location,
    industry: this.industry,
    contact: this.contact,
    description: this.description
  };
};

// To handle password authentication
userCompanySchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userCompanySchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};


// this is our schema to represent an expert
const expertSchema = mongoose.Schema({
  
	type: String,
	name: String,
	contact: {
		firstName: String,
		lastName: String,
		email: String
	},
	location: {

		city: String,
		state: String,
		country: String
	}
});

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Expert = mongoose.model("Expert", expertSchema);
const UserCompany = mongoose.model("UserCompany", userCompanySchema);

module.exports = { Expert, UserCompany };