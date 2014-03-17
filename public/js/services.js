'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
	factory('scService', function() {
		
	return {
		// initialize client with app credentials
		init: function () {
			console.log('initializing soundcloud')
			SC.initialize({
			  client_id: 'e2e194f256c97b3b526c2ba93db1d19d',
			  redirect_uri: "http://localhost:3000/callback.html"
			});
		},

		// Create playlist based on backend data results
		createPlaylist: function(data, name, callback) {
			console.log('creatingPlaylist');

			//var tracks = [];
			//
			//console.log("tracks: " + tracks);

			SC.connect(function () {
				console.log("CONNECTED");
				var user;
				//Dummy tracks
				var tracks = data.nodes.map(function(node) { return  {id: node.songID} } );
				console.log("tracks: ");
				console.dir(tracks);
				SC.get('/me', function (me) {
					console.dir(me);
					user = me.permalink;
					SC.post('/playlists', {
						playlist: { title: name, tracks: tracks }
						}, function() {
							callback(null, "https://www.soundcloud.com/" + user + "/sets/" + name);
						}
					);
				});
			});	  
		},
		
		// Creates dummy widget - should feed in set name here
		openWidget: function(playlist_url) {       
            SC.oEmbed(playlist_url, { auto_play: false }, document.getElementById("soundcloud-widget"));
		}
	}
	});

//EXAMPLE
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