//The API of your application

var request = require('request'),
_           = require('underscore'),
async       = require('async'),
ArtistNode  = require('./models/ArtistNode'),
Edge        = require('./models/Edge');

// Require our custom soundcloud and graph functions
// require(./graphAPI);
// require(./soundcloudAPI);

var userURL  = 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/';
var clientID = '&client_id=ee6c012d3805b479acf430ce6e188fa5';
var baseURL = 'http://api.soundcloud.com/users/';

module.exports = function(app, mongoose) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:username/:depth', function(req, res) {

		var root;
		var node = {};
		var data = {
			nodes: [],
			edges: []
		};
		var x = 0;

		async.series([
			function (callback) {
				getSCUser(req.params.username, clientID, function (err, result) {
					console.log('root node: ');
					root = result;
					console.log(root);
					callback(null, root);					
				});
			},
			function (callback) {
				console.log('root id: ');
				console.log(root.id);
				findByID(root.id, function (err, result) {
					node = result;
					console.log(node);
					callback(null, node);
				});
			},
			function (callback) {
				callback(null, 'third');
			}
			],
			function (callback, results) {
				// aggregate data to send to front end
				console.log('results');
				_.each(results, function (thing) {
					console.log(thing);
				});

				if ( countOutgoingEdges(results[1].id) ) {
					// don't process (for now)
					console.log('outgoing edges exist! dont process');
				}
				else {
					// process favorites
					console.log('process this users favorite artists');
					
					getSCFavorites(node.id, clientID, function (err, children) {
						data.nodes = children;
						createEdges(node, children, function () {
							data.edges = findOutgoingEdges(node.id);
							console.log('get or create the edges');
						});
					});
				}

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
			}
		);
	});
}

function getSCUser (permalink, clientID, callback) {
	request(userURL + permalink + clientID, 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  	var user = JSON.parse(body);
		  	callback(null, user);
		}
	});
}

function getSCFavorites (userID, clientID, callback) {
	request(baseURL + userID + '/favorites.json?client_id=ee6c012d3805b479acf430ce6e188fa5', 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  	var favorites = JSON.parse(body);
		  	// create edges

		  	callback(null, favorites);
		}
	});
}

function findByID (id, callback) {
	var result = ArtistNode.findOne({'id': id}, {id: 1, username: 1});
	if(result) {

	}
	/*ArtistNode.findOne({'id': id}, {id: 1, username: 1}, function (err, result) {
		console.log(results);
		if (result == null) {
			// create user for DB and return user
			var newNode = createArtistNode(id);
			callback(null, newNode);
		}
		else {
			// return user
			console.log('artist already in DB');
			callback(null, result);
		}
	});*/
}

function createArtistNode(userId, userUsername, callback) {
	ArtistNode.create({
		id: userId,
		username: userUsername
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
		console.log('count' + count);
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


