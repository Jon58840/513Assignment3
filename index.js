var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

const MAX_MESSAGE_HISTORY = 200;

var clientArray = [];
var messageHistoryArray = [];

// listen to 'chat' messages
io.on('connection', function(socket){
  var username = generateUsername();
  console.log('A user has connected. Designated: ', username);
  
  //Emit to client updates that need to be made
  socket.emit('nameChange', username);
  socket.emit('history', messageHistoryArray);
  io.emit('userUpdate', clientArray);
  
  socket.on('disconnect', function(msg){
    console.log('A user has disconnected. Designation: ', username);
    clientArray.splice(findUserIndex(username), 1);
    io.emit('userUpdate', clientArray);
  });
  
  socket.on('chat', function(msg){
    var timeStamp = getTimeStamp();
    var finalMessage = username + " " + timeStamp + ": " + msg;
    var command = false;
    
	  if (msg.match(/\/nick [a-zA-Z0-9]+/))
    {
      command = true;
      var newUsername = msg.split(" ")[1];
      var duplicate = false;
      var socketIndex = 0;
      
      for (var i = 0; i < clientArray.length; i++)
      {
        if (clientArray[i] == newUsername)
        {
          duplicate = true;
          var message = "SYSTEM " + timeStamp + ": Username \"" + newUsername + 
                          "\" is already in use.";
          socket.emit('system', message);
          console.log(message);
          break;
        }
        
        if (clientArray[i] == username)
        {//If we found the position of our current name, I want the index
          socketIndex = i;
        }
      }
    
      if (!duplicate)
      {
        //console.log('Message: ' + finalMessage);
        var message = "SYSTEM " + timeStamp + ": Username has been successfully changed from \"" +
                        username + "\" to \"" + newUsername + "\".";
        socket.emit('system', message);
        console.log(message);
        username = newUsername;
        clientArray[socketIndex] = newUsername;
        socket.emit('nameChange', newUsername);
        io.emit('userUpdate', clientArray);
      }
    }
    
    if (!command)
    {
      if (messageHistoryArray.length == MAX_MESSAGE_HISTORY)
      {
        messageHistoryArray.shift();
      }
      messageHistoryArray.push(finalMessage);
      
      console.log('Message: ' + finalMessage);
      io.emit('chat', finalMessage);
    }
  });
});

http.listen( port, function () {
    console.log('listening on port', port);
});

//Misc. Functions ---------

function getTimeStamp()
{
  var dateObject = new Date();
  var hours = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  
  //For minutes append a 0 if single digit
  //This prevents 3:07 from looking like 3:7 for example 
  if (minutes < 10)
  {
    minutes = "0" + minutes;
  }
  
  return "(" + hours + ":" + minutes + ")";
}

function generateUsername()
{
  var clientCount = clientArray.length + 1
  var username = "User#" + clientCount;
  clientArray.push(username);
  
  return username;
}

function findUserIndex(username)
{
  for (var i = 0; i < clientArray.length; i++)
  {
    if (clientArray[i] == username)
    {
      return i;
    }
  }
}








