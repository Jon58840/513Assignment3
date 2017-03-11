// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
	
    $('form').submit(function() {
	    socket.emit('chat', $('#m').val());
	    $('#m').val('');
	    return false;
    });
	
    socket.on('chat', function(msg){
	    $('#messages').append($('<li>').html(msg));
    });
    
    socket.on('selfChat', function(msg){
	    $('#messages').append($('<li>').html('<b>' + msg + '</b>'));
    });
    
    socket.on('system', function(msg){
	    $('#messages').append($('<li>').html(msg));
    });
    
    socket.on('nameChange', function(username){
	    $('#usernameHeader').html(username);
    });
    
    socket.on('history', function(messageHistoryArray){
	    $('#messages').empty();
      for (var i = 0; i < messageHistoryArray.length; i++)
      {
        $('#messages').append($('<li>').html(messageHistoryArray[i]));
      }
    });
    
    socket.on('userUpdate', function(userArray){
	    $('#userList').empty();
      for (var i = 0; i < userArray.length; i++)
      {
        $('#userList').append($('<li>').text(userArray[i]));
      }
    });
});