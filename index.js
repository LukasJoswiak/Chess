var express = require('express'),
	app		= express(),
	port	= 4000;

app.get("/", function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

var io 		  = require('socket.io').listen(app.listen(port)),
	usernames = {};

io.sockets.on('connection', function(socket) {
	socket.on('add_user', function(username) {
		socket.username = username;
		usernames[username] = username;

		io.sockets.emit('update_players', usernames);
	});

	socket.on('update_user', function(data) {
		delete usernames[data.old];
		usernames[data.me] = data.me;
		socket.username = data.me;
		io.sockets.emit('update_players', usernames);
	});

	socket.on('send', function(data) {
		socket.broadcast.emit('update', data);
	});

	socket.on('reset', function() {
		socket.broadcast.emit('reset_game');
	});

	socket.on('disconnect', function() {
		delete usernames[socket.username];
		io.sockets.emit('update_players', usernames);
	});
});