// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
	
    $('form').submit(function() {
	    socket.emit('chat', $('#m').val());
	    $('#m').val('');
	    return false;
    });
	
    //General messages
    socket.on('chat', function(msg){
	    $('#messages').append($('<li>').html(msg));
    });
    
    //Bold messages from self
    socket.on('selfChat', function(msg){
	    $('#messages').append($('<li>').html('<b>' + msg + '</b>'));
    });
    
    //Messages for system commands displayed only to self
    socket.on('system', function(msg){
	    $('#messages').append($('<li>').html(msg));
    });
    
    //Change the username header on page
    socket.on('nameChange', function(username){
	    $('#usernameHeader').html(username);
    });
    
    //Load all chat history
    socket.on('history', function(messageHistoryArray){
	    $('#messages').empty();
      for (var i = 0; i < messageHistoryArray.length; i++)
      {
        $('#messages').append($('<li>').html(messageHistoryArray[i]));
      }
    });
    
    //Update user list
    socket.on('userUpdate', function(userArray){
	    $('#userList').empty();
      for (var i = 0; i < userArray.length; i++)
      {
        $('#userList').append($('<li>').text(userArray[i]));
      }
    });
});