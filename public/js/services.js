'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
	factory('scService', function() {
		
	
	return {
		// initialize client with app credentials
		/*init: function () {
			console.log('initializing soundcloud')
			SC.initialize({
			  client_id: 'e2e194f256c97b3b526c2ba93db1d19d',
			  // Only needed for authentication
			  //redirect_uri: 'REDIRECT_URL'
			});
		},*/
		// Create playlist based on backend data results
		createPlaylist: function(data, name, callback) {
			console.log('creatingPlaylist');

			SC.initialize({
			  client_id: 'e2e194f256c97b3b526c2ba93db1d19d',
			  redirect_uri: "http://connect.soundcloud.com/examples/callback.html"
			  // Only needed for authentication
			  //redirect_uri: 'REDIRECT_URL'
			});
			
			var tracks = [];



			tracks = data.nodes.map(function(node) { return  {id: node.id} } );
			console.dir(tracks);
			SC.connect(function () {
				console.log("CONNECTED");
				SC.post('/playlists', {
					    playlist: { title: name, tracks: tracks }
					}, function(err) {

					if (err) {console.dir(err)}
					var playlistURL = 'www.soundcloud.com/discoversc/sets/' + name;
			  		console.log("playlistURL: " + playlistURL);
			  		callback(null, playlistURL);
			  	});
			});
			  
			  

		}
	}
	});
	/*factory('tweetService', function($resource) {
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
	});*/