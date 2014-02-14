var mongoose = require('mongoose'),
Schema       = mongoose.Schema;

var artistNodeSchema = new Schema({
	id: Number,
	username: String,
	permalink: String,
	songURL: String,
	leaf: boolean
	// following: [{type: Schema.Types.ObjectId, ref: 'ArtistNode'}]
});

// initialize the model and expose it to our app
var ArtistNode = mongoose.model('ArtistNode', artistNodeSchema);

module.exports = ArtistNode;