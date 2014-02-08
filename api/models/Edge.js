var mongoose = require('mongoose'),
Schema       = mongoose.Schema;

var edgeSchema = new Schema({
	nodeA : {type: Schema.Types.ObjectId, ref: 'ArtistNode'},
	nodeB : {type: Schema.Types.ObjectId, ref: 'ArtistNode'},
	weight: Number
});

// initialize the model and expose it to our app
var Edge = mongoose.model('Edge', edgeSchema);
module.exports = Edge;