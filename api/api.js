//The API of your application

var request = require('request'),
_           = require('underscore'),
async       = require('async'),
ArtistNode  = require('./models/ArtistNode'),
Edge        = require('./models/Edge');

var userURL  = 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/';
var clientID = '&client_id=ee6c012d3805b479acf430ce6e188fa5';
var baseURL = 'http://api.soundcloud.com/users/';

module.exports = function(app, mongoose) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:username/:depth', function(req, res) {

		var root = {};

		async.series([
			function () {
				var root = getSCUser(req.params.username, clientID);
			},
			function () {
				var node = findByID(root.id);
			},
			function () {
				if ( countOutgoingEdges(node.id) ) {
					// don't process (for now)
				}
				else {
					// process favorites
					getSCFavorites(node.id, clientID function (children) {
						data.nodes = children;
						createEdges(node, favorites, function () {
							data.edges = findOutgoingEdges(node.id);
						}
					});
				}
			},
			function () {
				// aggregate data to send to front end
				data.nodes.push(node);
				// data =
				// 		{
				// 			nodes: {
				// 				{}, 
				// 				{}
				// 			},
				// 		
				// 			edge: {
				// 				{}, 
				// 				{}
				// 			}
				// 		}
				res.json(data);
			}]
		);
	});
}

function getSCFavorites (userID, clientID, callback) {
	request(baseURL + userID + '/favorites.json?client_id=ee6c012d3805b479acf430ce6e188fa5', 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  	var favorites = JSON.parse(body);
		  	// create edges

		  	return favorites;
		}
	});
}

function getSCUser (permalink, clientID, callback) {
	request(userURL + permalink + clientID, 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  	var user = JSON.parse(body);
		  	return user;
		}
	});
}



function findByID (id, callback) {
	ArtistNode.findOne({'id': id}, 'id username', function (err, result) {
		if (result == null) {
			// create user for DB and return user
			return createArtistNode(id);
		}
		else {
			// return user
			return result;
		}
			console.log('artist already in DB');
		
	});
}

function createArtistNode(id, callback) {
	ArtistNode.create({
		id: user.id,
		username: user.username
	}, function (err, result) {
		return result;
	});
}

// Find all the edges coming out of a node
function findOutgoingEdges (id, callback) {
	Edge.find({'nodeA': id}, 'nodeA nodeB weight', function (err, result) {
		return result;
	});
}



// Count all the edges coming out of a node
function countOutgoingEdges (id, callback) {
	Edge.count({'nodeA': id}, function (err, count) {
		console.log(count);
		return count;
	});
}

// find edge
function findEdge (parent, child) {
	Edge.findOne({'nodeA': parent.id, 'nodeB': child.id}, function (err, results) {
		if (results == null) { return 0; }
		else { return 1; }
	});
}

// create a single edge
function addEdge (parent, child, callback) {
	// if we find an edge, don't create another
	if ( findEdge(parent, child) )
		return;
	// otherwise, create new edge between the parent and child
	else {
		Edge.create({
			nodeA: parent,
			nodeB: child
		}, function (err, edge) {
			return edge;
		});
	}
}

// creates edges between a parent and its children
function createEdges (parent, children, callback) {
	_.each(children, function (child) {
		addEdge(parent, child);
	});
	callback();
}

function depthSearch (user, callback) {
	//findByID	

}


