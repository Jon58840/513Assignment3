var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
  console.log('A user has connected.');
  
  socket.on('disconnect', function(msg){
    console.log('A user has disconnected.');
  });
  
  socket.on('chat', function(msg){
	console.log('Message: ' + msg);
    io.emit('chat', msg);
  });
});

http.listen( port, function () {
    console.log('listening on port', port);
});