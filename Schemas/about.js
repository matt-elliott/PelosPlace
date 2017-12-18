var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var aboutSchema = new Schema ({
  intro_text: String,
  call_to_action: Boolean,
  call_to_action_text: String,
  call_to_action_destination: String,
  address: String,
  hours: String,
  google_maps_api: String,
});

var aboutModel = mongoose.model('about', aboutSchema );

module.exports = aboutModel;