/* notes:

super helpful! https://scotch.io/tutorials/easy-node-authentication-setup-and-local
https://medium.com/@johnnyszeto/node-js-user-authentication-with-passport-local-strategy-37605fd99715
http://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/
https://www.sitepoint.com/local-authentication-using-passport-node-js/
https://www.raymondcamden.com/2016/06/23/some-quick-tips-for-passport/
*/

// set up server 
var express = 			require('express');
var app = 				express();
var http = 				require('http').Server(app);
var io = 				require('socket.io')(http);
var mongoose = 			require('mongoose');
var passport = 			require('passport');
var flash = 			require('connect-flash');

var cookieParser = 		require('cookie-parser');
var bodyParser = 		require('body-parser');
var session = 			require('express-session');
var assert =		    require('assert');

// './' is current directory 
var configDB = require('./config/database.js');
// need to connect the database with the server! 
mongoose.connect(configDB.url);
// link up passport as well
require('./config/passport.js')(passport);

// set up the stuff needed for logins/registering users/authentication 
app.use(cookieParser()); 		// read cookies, since that is needed for authentication
app.use(bodyParser()); 			// this gets information from html forms
app.set('view engine', 'ejs');	// set view engine to ejs - templates are definitely worth it for this kind of project. 

// this is required for passport
app.use(session({ secret: 'aweawesomeawesomeawesomesome' })); // read up on session secret 
app.use(passport.initialize());								  // start up passport
app.use(passport.session());								  // persistent login session (what does that mean?)
app.use(flash()); 											  // connect-flash is used for flash messages stored in session.

// pass app and passport to the routes 
require('./routes/routes.js')(app, passport);

// this stuff is for handling the chat functionality of the application.
io.on('connection', function(socket){
	
	socket.on('chat message', function(msg){
		// this is the server sending out the message to every client
		
		// get current date and time
		var timestamp = new Date().toLocaleString();
		
		// adding whitespace doesn't work because this message will be surrounded by <li> tags 
		// instead, you can use '\u00A0', the unicode for whitespace 
		// https://stackoverflow.com/questions/12882885/how-to-add-nbsp-using-d3-js-selection-text-method
		io.emit('chat message', msg + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 " + timestamp);
	});
	
	socket.on('image', function(imgData){
		// send all clients the imgData that was sent here (to this server)
		io.emit('image', imgData);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

