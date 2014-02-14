//The API of your application

var request = require('request'),
_           = require('underscore'),
async       = require('async'),
ArtistNode  = require('./models/ArtistNode'),
Edge        = require('./models/Edge');


// Require our custom soundcloud and graph functions
//
// require(./graphAPI);
// require(./soundcloudAPI);

var userURL  = 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/';
var clientID = '&client_id=ee6c012d3805b479acf430ce6e188fa5';
var baseURL = 'http://api.soundcloud.com/users/';

var data = {
			nodes: [],
			edges: []
		};

module.exports = function(app, mongoose) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:username/:depth', function(req, res) {

		getSCUser(req.params.username, clientID, function (err, rootUser){
			console.log('Root User:');
			console.log(rootUser);

			async.series([
				// call recursive explore function to populate
				// data.nodes & data.edges
				exploreFromRoot(rootUser, req.params.depth)
				],
				// final callback
				function (error, result) {
					// send data
					res.json('1');
				}
			);
		});

			/*async.series([
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
					queryUser(root.id, function (err, result) {
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
			);*/
	});
}

function exploreFromRoot (node, depth, callback) {
	if (depth != 0) {
		
		// get array of JSON favorites
		getSCFavorites(node.id, clientID, function (err, favorites) {
			_.each(favorites, function (child) {
				async.series([
					// explore children of root
					// populate data.nodes array
					function (callback) {
						queryUser(child, function(err, result) {
							// append result to data.nodes to send to client
							data.nodes.push(result);
							if (result.leaf) {
								// if its a leaf, explore
								
								exploreFromRoot(result, depth - 1, function () {
									callback(null, 'leaf explored');
								});
							}
							else {
								callback(null, 'already explored');
							}
						});
					}], 
					// final callback
					// populate data.edges array
					function (err, results) {
						if (results[0] === 'leaf explored');
							createEdges(node, favorites, function () {
								console.log('edges created!');
							});
					}
				);
			});
			
		});
			
	}
	else {
		// if we don't explore it, mark as a leaf
		node.leaf = true;
	}	
}



// get user JSON object from soundcloud API
/**
 * get user JSON object from soundcloud API and return
 * as ArtistNode object							
 * @param  {String}   permalink [souncloud.com/<permalink>]
 * @param  {[String]}   clientID  [piece of url for soundcloud API call]
 * @param  {Function} callback  [returns an ArtistNode object as 2nd arg]
 */
function getSCUser (permalink, clientID, callback) {
	request(userURL + permalink + clientID, 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  	var user = JSON.parse(body);
		  	//console.log(user);

		  	queryUser(user, function (err, result) {
		  		callback(null, result);
		  	});
		}
	});
}

function getSCFavorites (userID, clientID, callback) {
	request(baseURL + userID + '/favorites.json?client_id=ee6c012d3805b479acf430ce6e188fa5', 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('in getSCFavorites');
		  	var favorites = JSON.parse(body);
		  	favorites = _.map(favorites, function (song) {return song.user; });
		  	callback(null, favorites);
		}
	});
}

/**
 * Checks if a node with param id is in the database.
 * If not, it creates one.
 * Returns the ArtistNode object as second arg in callback
 * @param  {JSON}   scJSON soundcloud user object
 * @param  {Function} callback takes error as 1st arg, result as second
 * @return {ArtistNode}
 */
function queryUser (scJSON, callback) {
	var user;
	console.log('in queryUser');
	// There are two types of data that can be given
	// to this function:
	// 1. a user object from the soundcloud API
	// 2. a "track" object from the sounccloud API
	
	if(scJSON.kind === "track")  {
		console.log('scJSON.kind = track');
		user = scJSON.user;
	}
	else {
		console.log('scJSON.kind = user');
		user = scJSON;
	}

	ArtistNode.findOne({'id': user.id}, {id: 1, username: 1}, function (err, result) {
		console.log('have we seen you before? -->')
		console.log(result);
		if (result == null) {
			// create user for DB and return user
			console.log('new user created');
			createArtistNode(user, function (err, newNode) {
				console.log('newNode');
				console.log(newNode);
				callback(null, newNode);
			});
			// var newNode = createArtistNode(user);
			// console.log('newNode');
			// console.log(newNode);
			// callback(null, newNode);
		}
		else {
			// return user
			console.log('artist already in DB');
			callback(null, result);
		}
	});
}


function createArtistNode(user, callback) {
	ArtistNode.create({
		id: user.id,
		username: user.username,
		permalink: user.permalink,
		leaf: true
	}, function (err, result) {
		callback(null, result);
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
		console.log('count: ' + count);
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
	//queryUser	

}


