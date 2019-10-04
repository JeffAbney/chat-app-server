var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", '*');
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", 'Authorization, Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
	next();
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    io.emit('chat message', 'Welcome, new user!');
    socket.on('chat message', function(msg){
        socket.broadcast.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
        io.emit('chat message', "Goodbye, friend!");
      });
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
