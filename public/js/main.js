var app = angular.module('app', []);

app.controller('aboutController', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
  $http({
    method: 'GET',
    url: '/api/about-data/'
  }).then( function(res) {
    $scope.lead_1 = $sce.trustAsHtml(res.data[0].lead_1);
    $scope.lead_2 = $sce.trustAsHtml(res.data[0].lead_2);
    $scope.has_call_to_action = res.data[0].call_to_action;

    if( $scope.has_call_to_action ) {
      $scope.call_to_action_text = $sce.trustAsHtml(res.data[0].call_to_action_text);
      $scope.call_to_action_url = res.data[0].call_to_action_destination;
    }

    $scope.address = $sce.trustAsHtml(res.data[0].address);
    $scope.hours = $sce.trustAsHtml(res.data[0].hours);

    var googleMapApiKey = res.data[0].google_maps_api;
    var googleMapApiUriString = 'https://maps.googleapis.com/maps/api/js?key=' + googleMapApiKey + '&callback=ac.initMap';
    
    // WE ARE USING AN IFRAME FOR THE MAP FOR NOW
    // TODO IS TO USE THE API
    // $scope.initMap(googleMapApiUriString);
  }, function(error) {
    console.log('connection error', error);
  });

  $scope.initMap = function(url) {
    console.log('ok page set - getting map');

    $http({
      method: 'GET',
      url: url,
      crossDomain: true
    }).then( function(res) {
      var location = {lat: -25.363, lng: 131.044};
      
      var map = new google.maps.Map( $('#map'), {
        zoom: 4,
        center: location
      });

      var marker = new google.maps.Marker({
        position: location,
        map: map
      });
    });
  }
}]);

app.controller('appointmentController', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $http({
    method: 'GET',
    url: '/api/service-data/'
  }).then( function(res) {
    $scope.services = res.data;

    $scope.form = {
      booked: false
    };

    buildServiceList();
    buildCalander();
  });

  function buildServiceList() {
    var serviceCount = $scope.services.length;
    var i = 0;
    var serviceList = [];

    angular.forEach( $scope.services, function(service,key) {
      serviceList.push({
        name: service.name,
        duration: service.duration
      });
    });

    $scope.selectTypeParams = {
      availableOptions: serviceList,
      selectedAppointment: null
    };
  }

  function buildCalander() {
    $scope.startTime = moment().startOf('month');
    $scope.today = moment().format('DMMYY');

    updateMonth();
  }

  function updateMonth() {
    $scope.endTime = $scope.startTime.clone().add(1, 'month').startOf('month');
    $scope.numberOfDaysInMonth = $scope.endTime.diff($scope.startTime, 'days');
    $scope.daysInMonthList = [];
    var i = 0;

    for( i; i < $scope.numberOfDaysInMonth; i++ ) {
      var newDay = i != 0 ? $scope.startTime.add(1, 'day') : $scope.startTime;

      $scope.daysInMonthList.push({
        name: newDay.format('Do'),
        nthOfMonth: newDay.format('DMMYY'),
        date: newDay.format('M-D-YY')
      });
    }

    $scope.month = newDay.format('MMMM/YYYY');
  }

  $scope.getToday = function() {
    buildCalander();
  }

  $scope.getNextMonth = function() {
    $scope.startTime.add(1, 'month').startOf('month');
    
    updateMonth();
  }

  $scope.getPrevMonth = function() {
    $scope.startTime.subtract(1, 'month').startOf('month');

    updateMonth();
  }

  $scope.selectDay = function(day) {
    $('.calendar .day').removeClass('active');
    $scope.form.date = day.date;
    $scope.form.duration = $scope.selectTypeParams.selectedAppointment.duration;


    day.daySelected = true;

    findAvailableTimeSlots();
  }

  function findAvailableTimeSlots() {
    $http({
      method: 'GET',
      url: '/api/appointments/' + $scope.form.date + '/'
    }).then(function(res) {
      // console.log('\n\ndisplaying available time slots\n\n');
      var appointments = res.data;
      $scope.appointmentTimes = [];

      appointments.forEach(function(appointment) {
        $scope.appointmentTimes.push({ time: appointment.time, duration: appointment.duration});
      });

      buildDayHours();
    });
  }

  function buildDayHours() {
    var startTime = moment().startOf('day').hour(10).minute(30);
    var endTime = moment().startOf('day').hour(18).minute(00);
    $scope.availableTimeSlots = [];

    while( startTime <= endTime ) {
      $scope.availableTimeSlots.push( startTime.format('H:mm') );
      startTime.add(30, 'minutes');
    }

   checkForAppointmentsAndRemoveTimeslot();
  }

  function checkForAppointmentsAndRemoveTimeslot() {
    var appointmentTimesCount = $scope.appointmentTimes.length;

    $scope.availableTimeSlots.forEach(function(timeslot) {
      var i = 0;

      for( i; i < appointmentTimesCount; i++ ) {
        if( timeslot === $scope.appointmentTimes[i].time ) {
          var index = $scope.availableTimeSlots.indexOf(timeslot);

          $scope.availableTimeSlots.splice(index, $scope.appointmentTimes[i].duration );
        }
      }
    });

    displayTimeslots();
  }

  function displayTimeslots() {
    var duration = $scope.form.duration * 30;
    $scope.availableTimes = [];
    var availableTimesCount = $scope.availableTimeSlots.length;
    var a = 0;

    for( a; a < availableTimesCount; a++ ) {
      var startTime = moment( $scope.availableTimeSlots[a], 'H:mm');
      var endTime = startTime.clone().add(duration, 'minutes');
      var index = $scope.availableTimeSlots.indexOf(endTime.format('H:mm'));
      
      if( index != -1 ) {
        $scope.availableTimes.push({ 'start': startTime.format('h:mm a'), 'end': endTime.format('h:mm a')  });
      }
    }
  }

  $scope.saveAppointmentTime = function(data) {
    $scope.form.time = moment( data.start, 'h:mm a').format('H:mm');
    $scope.form.end = moment( data.end, 'h:mm a').format('H:mm');

    console.log( $scope.form.time, $scope.form.end );
  }

  $scope.bookAppointment = function() {
    if( $scope.appointmentform.$valid ) {
      $scope.form.apptointmentKind = $scope.selectTypeParams.selectedAppointment.name;
      
      $scope.services.filter(function(value) {
        if(value.name === $scope.form.apptointmentKind) {
          $scope.form.duration = value.duration;
        }
      });

      $http({
        method: 'POST',
        url: '/api/book-appointment/',
        data: $scope.form
      }).then( function(res) {
        if( res.status === 200 ) {
          $scope.form.booked = true;
        } else {
          $scope.form.booked = false;
        }
      });
    }
  }

  $scope.showCalendar = function() {
    $('.calendar').toggleClass('hidden');
  }
}]);

app.controller('serviceController', ['$scope', '$http', function($scope, $http) {
  $http({
    method: 'GET',
    url: '/api/service-data/',
  }).then( function(res) {
    $scope.services = res.data;
  })
}]);

app.controller('reviewController', ['$scope', '$http', function( $scope, $http) {
  function getYelpData() { 
    $http({
      method: 'GET',
      url: 'https://api.yelp.com/v3/businesses/pelos-place-hair-salon-hollywood-2',
      headers: '{ Authorization: Bearer ktigyrLk8IGtOoqqF4SB07jfVpMdNXYUuxDVfAKW_O5dAb4fa7megmQRsMeggxdnbc7Vma5Cx8qGcBLlZ0PFKLDKKz6xZX3GyZAijIWhmAn9tNeeHh3XAUYDQ_03WnYx'
    }).then( function(res) {
      console.log(res);
    });
  }

  function getInstagramData() { 
    $http({
      method: 'GET',
      url: 'https://api.yelp.com/v3/businesses/pelos-place-hair-salon-hollywood-2',
      headers: '{ Authorization: Bearer ktigyrLk8IGtOoqqF4SB07jfVpMdNXYUuxDVfAKW_O5dAb4fa7megmQRsMeggxdnbc7Vma5Cx8qGcBLlZ0PFKLDKKz6xZX3GyZAijIWhmAn9tNeeHh3XAUYDQ_03WnYx'
    }).then( function(res) {
      console.log(res);
    });
  }

  getYelpData();
  getInstagramData();
}]);

app.directive('about', function() {
  return {
    restrict: 'E',
    templateUrl: './module_templates/about.html'
  }
});

app.directive('services', function() {
  return {
    restrict: 'E',
    templateUrl: './module_templates/services.html'
  }
});

app.directive('appointments', function() {
  return {
    restrict: 'E',
    templateUrl: './module_templates/appointments.html'
  }
});

app.directive('reviews', function() {
  return {
    restrict: 'E',
    templateUrl: './module_templates/reviews.html'
  }
});