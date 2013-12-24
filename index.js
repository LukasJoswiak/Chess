var express = require('express'),
	app		= express(),
	port	= 4000;

app.get("/", function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function(socket) {
	socket.on('send', function(data) {
		socket.broadcast.emit('update', data);
	});

	socket.on('reset', function() {
		socket.broadcast.emit('reset_game');
	});

	socket.on('disconnect', function() {
		console.log(socket.id + ' disconnected');
	});
});