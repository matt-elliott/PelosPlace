var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appointmentSchema = new Schema({
  firstname: String,
  lastname: String,
  phone: Number,
  email: String,
  date: String,
  appointmentKind: String,
  duration: Number,
  time: String,
  end: String
});

var appointmentModel = mongoose.model('appointment', appointmentSchema);
module.exports = appointmentModel;