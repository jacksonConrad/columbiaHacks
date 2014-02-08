//The API of your application

var request = require('request'),
_           = require('underscore'),
ArtistNode = require('./models/ArtistNode'),
Edge = require('./models/Edge');

var baseURL = 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/';
var clientID = '&client_id=ee6c012d3805b479acf430ce6e188fa5';

module.exports = function(app, mongoose) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:username/:levels', function(req, res) {

		request(baseURL + req.params.username + clientID, 'json', function (error, response, body) {
			if (!error && response.statusCode == 200) {
			  	var user = JSON.parse(body);

			    res.json(user); // Print the google web page
			    console.log(user.id);
			    ArtistNode.findOne({'id': user.id}, 'id username', function (err, result) {
			    	if (result == null) {
			    		ArtistNode.create({
			    			id: user.id,
			    			username: user.username
			    		}, function (err, results) {
			    			if (err) {
			    				console.log('ERR: unable to create user');
			    			}
			    			else {


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
