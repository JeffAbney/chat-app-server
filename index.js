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

io.on('connection', function (socket) {
  //          -- ON CONNECT --
  socket.on('user connected', function (username) {
    userArr.push(username);
    io.emit('user connected', userArr);
    console.log('server userArr', userArr);
    io.emit('chat message', `Welcome, ${username}!`);
  });
  //           -- ON RECEIVE MESSAGE --
  socket.on('chat message', function (msg) {
    socket.broadcast.emit('chat message', msg);
  });
  //           -- ON DISCONNECT --
  socket.on('disconnect', function () {
    io.emit('chat message', "Goodbye, friend!");
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
