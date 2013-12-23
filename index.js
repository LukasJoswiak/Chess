var express = require('express'),
	app		= express(),
	port	= 4000;

app.get("/", function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public')).listen(port);