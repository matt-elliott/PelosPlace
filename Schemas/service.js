var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var serviceSchema = new Schema ({
  display_oder: Number,
  name: String,
  price: String,
  duration: Number,
  active: Boolean,
});

var serviceModel = mongoose.model('service', serviceSchema );

module.exports = serviceModel;