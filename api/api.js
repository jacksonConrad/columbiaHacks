//The API of your application

var request = require('request'),
_           = require('underscore'),
async       = require('async'),
ArtistNode  = require('./models/ArtistNode'),
Edge        = require('./models/Edge');

var baseURL  = 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/';
var clientID = '&client_id=ee6c012d3805b479acf430ce6e188fa5';
var followerURL = 'http://api.soundcloud.com/users/';

module.exports = function(app, mongoose) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:username/:levels', function(req, res) {

		// initial user ID request
		request(baseURL + req.params.username + clientID, 'json', function (error, response, body) {
			if (!error && response.statusCode == 200) {
			  	var user = JSON.parse(body);

			   // res.json(user); // Print the google web page
			    console.log(user.id);

			    // Checks if user ID already exists in database
			    ArtistNode.findOne({'id': user.id}, 'id username', function (err, result) {
			    	console.log(result);
			    	//console.log(err);
			    	if (result == null) {
			    		ArtistNode.create({
			    			id: user.id,
			    			username: user.username
			    		}, function (err, results) {
			    			if (err) {
			    				console.log('ERR: unable to create user');
			    			}
			    			else {
			    				console.log('niggabitch');

			    				// GET request for user's favorite tracks
			    				request(followerURL + user.id + '/favorites.json?client_id=ee6c012d3805b479acf430ce6e188fa5',
    								function (error, response, body) {



    								}
    							);

			    				// API call for user/:id/followings
			    				request(followerURL + user.id + '/followings.json?client_id=ee6c012d3805b479acf430ce6e188fa5',
			    					function (error, response, body) {
			    						
			    						

			    						request(followerURL + user.id + '/favorites.json?client_id=ee6c012d3805b479acf430ce6e188fa5',
		    								function (error, response, body) {
		    									var results = JSON.parse(body);
		    									res.json(results);
		    								}
			    						);

			    						_.each(results, function (user) {
			    							
			    						});
			    						







			    					}
			    				);

			    				console.log('USER CREATED BITCH');



			    			}
			    		});
			    	}
			    });
			}
		});


		// if user is in DB, retrieve

		

		// otherwise, get user JSON according to his ID
		// get list of users being followed
		// iterate through users.
		// if they have >10,000 followers:
		// check if they are in db.
		// if not, make them a node		
		// create an edge or iterate the edge value between child and parent node
		// if they have <10,000 followers 
		// if we aren't at the last level, recursion
	});
}


function findByID (id, callback) {
	ArtistNode.findOne({'id': id}, 'id username', function (err, result) {
		if (result == null) {
			// create user for DB
		}
		else {
			// Find associated edges, and child nodes associated with those edges
			// If leaf, go more deeper
			if (countOutgoingEdges(result.id) == 0) {
				// go deeper
			}
			else {
				// return edges & child nodes
				findOutgoingEdges (id, function (result) {

				});
			}
			
			
			console.log('artist already in DB');

		}
		callback(result);
	});
}

// Find all the edges coming out of a node
function findOutgoingEdges (id, callback) {
	Edge.find({'nodeA': id}, 'nodeA nodeB weight', function (err, result) {
		callback(result);
	});
}

// Count all the edges coming out of a node
function countOutgoingEdges (id, callback) {
	Edge.count({'nodeA': id}, function (err, count) {
		return count;
	});
}


