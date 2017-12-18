var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var modelSchema = new Schema({
  display_order: Number,
  module_name: String,
  show_in_nav: Boolean,
  active: Boolean
});

var ModulesModels = mongoose.model('modules', modelSchema);

module.exports = ModulesModels;