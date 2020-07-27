var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var firebase = require("firebase/app");
require("firebase/firestore");



firebase.initializeApp(firebaseConfig);

var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');
var roomsRouter = require('./routes/rooms');

const admin = require('firebase-admin');
var serviceAccount = require("./firebase-adminsdk.json");

var db = admin.firestore();
var usersRef = db.collection("users");

// 時間関連
var now = new Date();
var hour = now.getHours();
var minute = now.getMinutes();
var thisTime = (hour + ":" + minute);

app.use(express.urlencoded({ extended: false }));

app.use('/',indexRouter);
app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




//socket.io
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('joinRoom',function(room_id){
    console.log(room_id);
    socket.join(room_id);
  });

  socket.on('chat message', function(data){
    const user = firebase.auth().currentUser;
    var user_name;
    if(user){
      usersRef.doc(user.uid).get()
      .then(function(userSnapshot){
          user_name = userSnapshot.data().user_name;
          msgobj = {
            'user_name': user_name,
            'msg' : data,
            'thisTime' : thisTime
          }
          io.emit('chat message', msgobj);

      })
      .catch(function(error){
          console.log(error);
      });
    };
});


});


module.exports = app;


http.listen(3000, function(){
  console.log('listening on *:3000');
});
