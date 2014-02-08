//The API of your application

module.exports = function(app) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:id/:levels', function(req, res) {

		// if user is in DB, retrieve

		// otherwise, get user JSON according to his ID
		// get list of users being followed
		// iterate through users.
		// if they have >10,000 followers:
		// check if they are in db.
		// if not, make them a node		
		// create an edge between child and parent node
		// if they have <10,000 followers, make 




		res.json();
	});
}
