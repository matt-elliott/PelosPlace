var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var rsvp =require('rsvp');
var Schema = mongoose.Schema;
var SiteDataModel = require('../Schemas/site_data.js');
var ModulesModel = require('../Schemas/modules.js');
var aboutModel = require('../Schemas/about.js');
var serviceModel = require('../Schemas/service.js');
var appointmentModel = require('../Schemas/appointment.js');

mongoose.set('debug',false);

function Routes(app) {
  app.use('/', express.static('./public/'));
  app.use(bodyparser.urlencoded({ extended: false }));
  app.use(bodyparser.json());

  mongoose.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASS + '@ds044699.mlab.com:44699/pelosplace', {useMongoClient: true}, function(error, res) {
      if(error) console.log(error);
      console.log('connected to db');
    });

  app.get('/', function(req,res) {
    var cleanData = {
      siteData: {},
      socialNetworkLinks: {},
      modules: []
    }

    var modulesPromise = new rsvp.Promise( function(resolve,reject) {
      ModulesModel.find({active: true}).sort('display_order').exec(function(error,data) {
        if(error) {
          console.log(error);
          reject(error);
        }

        resolve(data);
      }).then(function(data) {
        data.forEach(function(item) {
          cleanData.modules.push(item.module_name);
        });
      }).then(function(data) {

        var siteDataPromise = new rsvp.Promise( function(resolve,reject) {
          SiteDataModel.find(function(error,data) {
            if(error) {
              console.log(error);
              reject(error);
            }
            
            resolve(data[0].toJSON());
          });
        }).then(function(data) {
          for( var key in data ) {
            if( key.indexOf('social') != -1 ) {
              cleanData.socialNetworkLinks[key] = data[key];
            } else {
              cleanData.siteData[key] = data[key];
            }
          }

          res.render('index', {data: cleanData});
        }).catch(function(error) {
          console.log(error);
          throw error;
        });
      });
    });
  });

  app.post('/api/book-appointment/', function(req,res) {
    var newAppointment = new appointmentModel({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      email: req.body.email,
      date: req.body.date,
      apptointmentKind: req.body.appointmentKind,
      duration: req.body.duration,
      time: req.body.time,
      end: req.body.end
    });

    appointmentModel.find({ 'email' : req.body.email }, function(error,product) {
      if( error ) console.log(error);
      
      if( product.length === 0 ) {
        saveAppointment();
      } else {
        console.log('Updating Appointment\n\n', product);
        
        appointmentModel.deleteOne({ email: req.body.email }, function(error,res) {
          if(error) console.log(error);
          console.log('Deleted old record and saving new data');
          saveAppointment();
        });
      }
    });

    function saveAppointment() {
      newAppointment.save(function(error) {
        if( error ) {
          console.log('Error saving appointment : ', error);
          res.status(500);
        } else {
          console.log('Saved appontment');
          res.send();
        }
      });
    }
  });

  app.get('/api/appointments/:date/', function(req,res) {
    var appointmentDate = req.params.date;
    
    var appointmentPromise = new rsvp.Promise(function(resolve,reject) {
      appointmentModel.find({date: appointmentDate}, function(error,data) {
        if(error) {
          console.log(error);
          reject(error);
        }

        resolve(data);
      });
    }).then(function(data) {
      res.send(data);
    });
  });

  app.get('/api/about-data/', function(req,res) {
    var aboutPromise = new rsvp.Promise(function(resolve,reject) {
      aboutModel.find(function(error, data) {
        if(error) {
          console.log('connection error:', error);
          reject(error);
        }

        resolve(data[0].toJSON());

      }).then(function(data) {
        res.send(data);
      });
    });
  });

  app.get('/api/service-data/', function(req,res) {
    var servicePromise = new rsvp.Promise(function(resolve,reject) {
      serviceModel.find().sort('display_order').exec(function(error,data) {
        if(error) console.log(error);

        resolve(data);
      }).then(function(data) {
        res.send(data);
      });
    });
  });

/*
  app.get('/api/setup/service-data/', function(req,res) {
    var initServiceData = [
      {
        display_oder: 1,
        service: 'Children',
        price: '14',
        active: true,
      },
      {
        display_oder: 2,
        service: 'Men\'s Hair Cut',
        price: '20',
        active: true,
      },
      {
        display_oder: 3,
        service: 'Women\'s Hair Cut',
        price: '35',
        active: true,
      },
      {
        display_oder: 4,
        service: 'Touch Up Color',
        price: '50+',
        active: true,
      },
      {
        display_oder: 5,
        service: 'Color',
        price: '65',
        active: true,
      },
      {
        display_oder: 6,
        service: 'Lowlights (medium hair)',
        price: '75',
        active: true,
      },
      {
        display_oder: 7,
        service: 'Highlights (medium hair)',
        price: '75',
        active: true,
      },
      {
        display_oder: 8,
        service: 'Blow Dry and Shampoo',
        price: '30',
        active: true,
      },
      {
        display_oder: 9,
        service: 'Flat Iron and Shampoo',
        price: '75',
        active: true,
      },
      {
        display_oder: 10,
        service: 'Perms (short hair)',
        price: '75',
        active: true,
      },
      {
        display_oder: 11,
        service: 'Brazzillan Blow Out',
        price: '200',
        active: true,
      },
      {
        display_oder: 12,
        service: 'Eyebrow Wax',
        price: '200',
        active: true,
      },
    ];

    serviceModel.create( initServiceData, function(error, data) {
      if(error) console.log(error);

      res.send(data);
      console.log('Saved About Data \n', data);
    });
  });

  app.get('/api/setup/about-data/', function(req,res) {
      var initAboutData = [
        {
          intro_text: 'Guillermo Garcia, owner of Pelos Place, has over 25 years of experience pushing the boundries of styling.<br /><br />His fast and friendly service will leave you wondering how your hair survied without him for so long!',
          call_to_action: true,
          call_to_action_text: 'Book An Appointment Today And See What\'s Possible',
          call_to_action_destination: '#appointments',
          address: 'Pelos Place is located at:<br />6370 Sunset Blvd, Ste 304<br />Hollywood, CA 90028',
          hours: 'Hours: Tu-Sun 10am - 8pm',
          goole_maps_api: "AIzaSyAmdf60uNRJvhMAQBSxpBsX0GXodz9V6qA"
        }
      ];

      aboutModel.create( initAboutData, function(error,data) {
        if(error) console.log(error);

        res.send(data);
        console.log('Saved About Data \n', data);
      });
  });

  app.get('/api/setup/moduledata/', function(req,res) {
    var initModulesData = [
      {
        display_order: 1,
        module_name: "about",
        show_in_nav: true,
        active: true
      },
      {
        display_order: 2,
        module_name: "services",
        show_in_nav: true,
        active: true
      },
      {
        display_order: 3,
        module_name: "appointments",
        show_in_nav: true,
        active: true
      },
      {
        display_order: 4,
        module_name: "reviews",
        show_in_nav: true,
        active: true
      }
    ];

    ModulesModel.create( initModulesData, function(error,data) {
      if(error) console.log(error);
        res.send(data);
        console.log('Made Entry');
    });
  });

  app.get('/api/setup/sitedata', function(req,res) {
    var initSiteData = [
      {
        site_name: "Pelos Place",
        site_title: "Pelos Place | Professional Salon, Unprofessional Prices",
        site_tagline: "Professional Salon, Unprofessional Prices",
        site_description: "Pelos Place | Professional Hair Salon Unprofessional Prices based in Los Angeles",
        social_link_facebook: "#",
        social_link_instagram: "#",
        social_link_twitter: "#"
      }
    ];

    

    SiteDataModel.create( initSiteData, function(error,data) {
      if(error) console.log(error);
      res.send(data);
      console.log('Made Entry')
    });
  });
*/
}

module.exports = Routes;