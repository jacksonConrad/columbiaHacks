'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
	factory('tweetService', function($resource) {
		return $resource('/api/getlast/:number', {}, {
			// Use this method for getting a list of tweets
			
			query: { method: 'GET', params: { number: '20' }, isArray: true }
		})
	}).
	factory('socketService', function($rootScope) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
		};
	// Service to load the d3 library onto the page without having it in index.html directly
	})