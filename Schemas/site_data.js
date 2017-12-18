var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siteDataSchema = new Schema({
    site_name: String,
    site_title: String,
    site_tagline: String,
    site_description: String,
    social_link_facebook: String,
    social_link_instagram: String,
    social_link_twitter: String
});

var SiteDataModel = mongoose.model('site_data', siteDataSchema);

module.exports = SiteDataModel;