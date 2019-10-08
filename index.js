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

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

let userArr = [];
var connectedUsers = {};

io.on('connection', function (socket) {
  //          -- ON CONNECT --
  socket.on('user connected', function (username) {
    connectedUsers[socket.id] = socket;
    connectedUsers[socket.id].username = username;
    userArr.push(username);
    io.emit('users changed', userArr);
    io.emit('chat message', `Welcome, ${username}!`);
  });
  //           -- ON RECEIVE MESSAGE FROM CLIENT --
  socket.on('chat message', function (msg) {
    socket.broadcast.emit('chat message', msg);
  });
  //           -- ON RECEIVE PRIVATE MESSAGE FROM CLIENT --
  socket.on('private message', function (msg, username) {
    let recepient = connectedUsers.filter((socket) => socket.username === username);
    io.to(connectedUsers[recepient]).emit('private message', `${username}: ${msg}`);
  });

  //           -- ON DISCONNECT --
  socket.on('disconnect', function () {
    userArr.splice(userArr.indexOf(connectedUsers[socket.id].username), 1);
    io.emit('chat message', `Goodbye, ${connectedUsers[socket.id].username}!`);
    delete connectedUsers[socket.id];
    io.emit('users changed', userArr);
  });
  //      -- ON FOCUS --
  socket.on('focus on', function (username) {
    socket.broadcast.emit('focus on', username)
  })
  //     --  ON FOCUSOUT --
  socket.on('focus out', function () {
    socket.broadcast.emit('focus out')
  })
});

http.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000');
});
