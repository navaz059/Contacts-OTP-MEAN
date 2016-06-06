var contactApp = angular.module('contactApp', ['ngRoute']);


// To configure routes to different pages such as home, hsitory and message

contactApp.config([ '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'pages/home.html',
      controller: 'NameListCtrl'
     })
    .when('/message', {
      templateUrl: 'pages/message.html',
      controller: 'MessageCtrl'
     })
    .when('/history', {
      templateUrl: 'pages/history.html',
      controller: 'HistoryCtrl'
    })
    .otherwise({
      redirectTo: '/home'
     });
  }]);

//Controller for Home Page
contactApp.controller('NameListCtrl', function ($scope, $location, contactService,List) {

  $scope.contacts = List.getContacts();
//  alert("In get Contacts");
  $scope.showDetails = function(index) {
//    alert('Setting service');
    contactService.setCurrentContact($scope.contacts[index]);
//    alert('Setting service done');
    $location.path("/message");
  }
});

//Controller For Message Page
contactApp.controller('MessageCtrl', function ($scope, $location, contactService) {
  $scope.currentContact = contactService.getCurrentContact();
  console.log($scope.currentContact);

  function getOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  };


  $scope.sendMessage = function() {
    var message = "Hi. Your OTP is: " + getOTP();
    var from = '+16789740744';
    var to = $scope.currentContact.contact;
    message = prompt("Generated OTP", message);
    console.log(message);
    contactService.sendMessage(from, to, message);
    $scope.currentContact.OTP = getOTP();
    $scope.currentContact.time = new Date();
  }

});


//Controller For History Page
contactApp.controller('HistoryCtrl', function ($scope, $location, contactService,List) {
//  alert("In History");
  $scope.HistoryContacts = List.getContacts();
//  alert("HistoryContacts");
//  console.log($scope.currentContact);
});


contactApp.factory('contactService', function($http, Base64) {
  var currentContact = {}
  function setCurrentContact(contact) {
   currentContact = contact;
  }

  function getCurrentContact() {
    return currentContact;
  }

  function sendMessage(from, to, message) {
    var accountSid = 'ACaad43a67555197c55f44f45b865477d7';
    var authToken = 'f2104e5cd2b6cfa315df9acf3dfaa88a';

    var testEndpoint = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/SMS/Messages.json';
    var liveEndpoint = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';

    var data = {
      To: to,
      From: from,
      Body: message
    };
    // Creating Header for making request
    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode(accountSid+ ':' + authToken);

    //http request to twilio API for SMS
    $http({
      method: 'POST',
      url: liveEndpoint,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: data
    })
    .then(function (response) {
      var status = response.data.status.toLowerCase(),
      data = response.data;
      alert ('Message Sent Successfully');
      //push history list with OTP
    })
    .catch(function(err) {
      console.log('error');
      alert ('No Message Sent(Twillio Error)');
    });

  }

  return {
    setCurrentContact: setCurrentContact,
    getCurrentContact: getCurrentContact,
    sendMessage: sendMessage
  }
});

//List Of Messages
contactApp.factory('List', [function () {
  
  var factory = {}; 
  factory.getContacts = function () {
    return contactList;
  }

  // contact list, usually would be a separate database
  var contactList = 
  [
  {'_id':'1', 'name': 'Arya Stark', 'contact': '+919663088022', 'OTP':'','time':''},
  {'_id':'2', 'name': 'Jon Snow', 'contact': '+919663088022', 'OTP':''},
  {'_id':'3', 'name': 'Tyrion Lannister', 'contact': '+919663088022', 'OTP':'','time':''}];

  return factory;
}]);

//to convert in BASE64 for twilio API
contactApp.factory('Base64', function() {
  var keyStr = 'ABCDEFGHIJKLMNOP' +
    'QRSTUVWXYZabcdef' +
    'ghijklmnopqrstuv' +
    'wxyz0123456789+/' +
    '=';
  return {
    encode: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          keyStr.charAt(enc1) +
          keyStr.charAt(enc2) +
          keyStr.charAt(enc3) +
          keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
          "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
          "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };
});
