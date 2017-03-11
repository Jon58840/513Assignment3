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
  var color = [0,0,0];
  
  //Emit to client updates that need to be made
  socket.emit('nameChange', username);
  socket.emit('history', messageHistoryArray);
  io.emit('userUpdate', clientArray);
  
  socket.on('disconnect', function(msg){
    //Removing a disconnected user from the list
    console.log('A user has disconnected. Designation: ', username);
    clientArray.splice(findUserIndex(username), 1);
    io.emit('userUpdate', clientArray);
  });
  
  socket.on('chat', function(msg){
    var timeStamp = getTimeStamp();
    var finalMessage = "<font color=rgb(" + color[0].toString() + "," + color[1].toString() + "," + color[2].toString() + ")>" +
                         username + "</font> " + timeStamp + ": " + msg;
    var command = false;
    
	  if (msg.match(/\/nick [a-zA-Z0-9]+/))
    {//Look for the /nick command
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
    
    if (msg.match(/\/nickcolor [A-F0-9]{6}/))
    {//Look for the /nickcolor command
      command = true;
      var hexColor = msg.split(" ")[1];
      var rgb = parseRGB(hexColor);
      
      
      //console.log('Message: ' + finalMessage);
      var message = "SYSTEM " + timeStamp + ": Color has been successfully changed.";
      socket.emit('system', message);
      console.log(message);
      color = rgb;
    }
    
    if (!command)
    {//If the entered text was not a command then we'll send it as a message
      if (messageHistoryArray.length == MAX_MESSAGE_HISTORY)
      {
        messageHistoryArray.shift();
      }
      messageHistoryArray.push(finalMessage);
      
      console.log('Message: ' + finalMessage);
      socket.emit('selfChat', finalMessage);        //Self message, to be bolded
      socket.broadcast.emit('chat', finalMessage);  //Message to all others
    }
  });
});

http.listen( port, function () {
    console.log('listening on port', port);
});

//Misc. Functions ---------

function getTimeStamp()
{//Create and format a time stamp
  var dateObject = new Date();
  var hours = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  var seconds = dateObject.getSeconds();
  
  //For minutes and seconds append a 0 if single digit
  //This prevents 3:07 from looking like 3:7 for example 
  if (minutes < 10)
  {
    minutes = "0" + minutes;
  }
  
  if (seconds < 10)
  {
    seconds = "0" + seconds;
  }
  
  return "(" + hours + ":" + minutes + ":" + seconds + ")";
}

function generateUsername()
{//Generates a unique username
  var unique = false;
  var username = "defaultUsername";
  
  while(!unique)
  {//Keep generating usernames until we get a unique one
    var identifier = Math.floor(Math.random() * 9998) + 1;  //Number from 1-9999
    username = "User#" + identifier;
    
    if (findUserIndex(username) == -1)
    {//Checking to see if the username already exists
      unique = true;
    }
  }
  
  clientArray.push(username);
  
  return username;
}

function findUserIndex(username)
{//Returns index number of a given username
  for (var i = 0; i < clientArray.length; i++)
  {
    if (clientArray[i] == username)
    {
      return i;
    }
  }
  
  return -1;  //No index found
}

function parseRGB(hexString)
{//Parse out RGB values from a hex string
  var digitValues = [];

  for (var i = 0; i < 6; i++)
  {//Turn everything into its ASCII value
    var value = hexString.charCodeAt(i);
    
    //Convert the ASCII to what it's worth as a hex digit
    if (value >= 48 && value <= 57)
    {
      value -= 47;
    }
    else if (value >= 65 && value <= 70)
    {
      value -= 55;
    }
    
    digitValues.push(value);
  }
  
  //Calculate each RGB value as an integer out of 255
  var red = (16 * digitValues[0]) + digitValues[1];
  var green = (16 * digitValues[2]) + digitValues[3];
  var blue = (16 * digitValues[4]) + digitValues[5];
  
  var rgb = [red, green, blue]
  
  return rgb;
}








