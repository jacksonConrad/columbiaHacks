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

// var data = {
// 			nodes: [],
// 			edges: []
// 		};

module.exports = function(app, mongoose) {

	// Make recursive API calls to soundcloud
	// Create graph of connections according to users/:id/followings
	app.get('/api/user/:username/:depth', function(req, res) {

		getSCUser(req.params.username, clientID, function (err, rootUser){
			console.log('Root User:');
			console.log(rootUser); console.log('\n');

			// Breadth-first graph search
			exploreFromRoot(rootUser, req.params.depth, function(results) {
				console.log('exploreFromRoot executed');
				res.json(AsyncGraphNodeLib.Response);
				console.log(AsyncGraphNodeLib.Response);
			});
		});
	});
}

var AsyncGraphNodeLib = {
	Response: {
		nodes: [],
		edges: []
	},
	children: [],
	resetChildren:  function () {
		this.children = [];
	},
	appendNode: function(node) {
		this.Response.nodes.push(node);
	},
	appendEdge: function(edge) {
		this.Response.edges.push(edge);
	},
	appendChild: function(value) {
		this.children.push(value);
	},
	processNode: function(child, callback) {
		// now we can refer to AsyncGraphNodeLib inside async.parallel
		// using 'that'
		var that = this;
		async.parallel([
			function (cb) {
				queryUser(child, function(err, result) {
					// if(depth !== 0) {
					// 	// THIS IS TEMPORARY.
					// 	// I dont think this changes the node in the DB
					// 	// since its passing by value.
					// 	result.leaf = false;
					// }
					that.appendNode(result);
					console.log("IN QUERY USER");
					console.log(result);

					cb(null, '1');
				});
			},
			function (cb) {
				getSCFavorites(child.id, clientID, function (err, favorites) {
					console.log('This user has ' + favorites.length + ' favorites');
					_.each(favorites, function (f) {
						console.log("appending teh child!");
						that.appendChild(f);
						console.log(child);
						console.log(f);
					});
					// if (depth === 0) 
					cb(null);
				});
			}], function (err, results) {
				console.log('parallel processes finished');
				if (err) return callback(err);
				callback(null);
			}
		);
	},
	addNode: function(child, callback) {
		var that = this;
		queryUser(child, function(err, result) {
			that.appendNode(result);
			console.log("in addNode");
			console.log(result);
			callback(null);
		});
	}
};

function exploreFromRoot(node, depth, callback) {
	var level = depth;
	var children = [];
	var temp = [];
	children.push(node);
	async.whilst(
		// test condition
		function () {return depth--;},
		function (cb) {
			// arg 2:  with the help of bind we can attach a context to the iterator function
			// before passing it to async. Now the 'processNode' function will be executed in its
			// 'home' AsyncGraphNodeLib context so 'this.children' will be as expected 
			if( depth != 0) {
				async.each(children, AsyncGraphNodeLib.processNode.bind(AsyncGraphNodeLib), function (err, results) {
					console.log('async.each finished;');
					console.log('depth: ' + depth);
					console.log('temp');
					console.log(temp.length);
					children = AsyncGraphNodeLib.children;
					AsyncGraphNodeLib.resetChildren();
					console.log('should be zero: ' + AsyncGraphNodeLib.children.length);
					cb();
				});
			}
			else {
				async.each(children, AsyncGraphNodeLib.addNode.bind(AsyncGraphNodeLib), function (err, results) {
					console.log("ASYNC EACH FOR ADD NODE FINISHED");
					console.log('depth: ' + depth);
					cb();
				});
			}

			// console.log('temp:');
			// console.log(temp); console.log('\n');
			// children = temp;
			// temp = [];

			
		},
		// final callback of async.whilst
		function (err) {
			console.log('WHILST FINISHED!');
			callback();
		}
	);
}




/*function exploreFromRoot (node, depth, callback) {
	if (depth != 0) {
		node.leaf = false;
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
*/


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
		  	callback(null, user);
		  	// queryUser(user, function (err, result) {

		  	// 	callback(null, result);
		  	// });
		}
	});
}

function getSCFavorites (userID, clientID, callback) {
	request(baseURL + userID + '/favorites.json?client_id=ee6c012d3805b479acf430ce6e188fa5', 'json', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('in getSCFavorites');
		  	var favorites = JSON.parse(body);
		  	favorites = _.map(favorites, function (song) {return {user: song.user, id: song.id} });
		  	console.log("before callback in sc faves");
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
	console.log(scJSON);

	function Node (username, userID, permalink, songs, songID) {
		this.username = username;
		this.userID = userID; 
		this.permalink = permalink; 
		this.songs = songs || [];
		this.songID = songID || null;
	}

	var node = {};
	// There are two types of data that can be given
	// to this function:
	// 1. a user object from the soundcloud API
	// 2. a "track" object from the sounccloud API
	
	if("user" in scJSON)  {
		user = scJSON.user;
		node = new Node(user.username, user.id, user.permalink, [], scJSON.id);
	}
	else {
		user = scJSON;
		node = new Node(user.username, user.id, user.permalink, [], null);
		
	
	}

	ArtistNode.findOne({'id': user.id}, {id: 1, username: 1, song: 1}, function (err, result) {
		console.log('have we seen you before? -->')
		if (result == null) {
			// create user for DB and return user
			console.log('new user created');
			createArtistNode(user, function (err, newNode) {
				console.log('newNode');
				//console.log(newNode);
				newNode.song = node.songID;
				console.log("NewNode: " + newNode);
				callback(null, newNode);
			});
			// var newNode = createArtistNode(user);
			// console.log('newNode');
			// console.log(newNode);
			// callback(null, newNode);
		}
		else {
			// return user
			if("user" in scJSON) {
				console.log("TRACK");
				result.song = scJSON.id;
			}
			
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
		leaf: true,
		songs: [],
		song: null
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
