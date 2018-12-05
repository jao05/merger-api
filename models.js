const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


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
  	firstName: { type: String, required: true },
  	lastName: { type: String, required: true },
  	email: { type: String, required: true }
  },
  description: { type: String, required: true },
  openToMerger: { type: Boolean, required: true },
  openToAcquisition: { type: Boolean, required: true },
  openToSell: { type: Boolean, required: true },
  password: { type: String, required: true }

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
    description: this.description,
    openToMerger: this.openToMerger,
    openToAcquisition: this.openToAcquisition,
    openToSell: this.openToSell
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

// Serialize the expert model
expertSchema.methods.serialize = function() {
  return {
    id: this._id,
    type: this.type,
    name: this.name,
    contact: this.contact,
    location: this.location
  };
};

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Expert = mongoose.model("Expert", expertSchema);
const UserCompany = mongoose.model("UserCompany", userCompanySchema);

module.exports = { Expert, UserCompany };