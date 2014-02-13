/* hold our database connection settings */ 
module.exports = {
	// url looks like: 'mongodb://<host>/<db-name>'
    //'url' :'mongodb://heroku_app22028251:9bm7lj9u2k5aue7ale02j46fpe@ds027719.mongolab.com:27719/heroku_app22028251' // temporary local config
    'url' : process.env.MONGOLAB_URI || 'mongodb://localhost/soundcloudGraph'
};
