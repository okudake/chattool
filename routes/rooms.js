var express = require('express');
var app = express();
var firebase = require("firebase/app");
require("firebase/firestore");

//firestore
const admin = require('firebase-admin');
var serviceAccount = require("../firebase-adminsdk.json");


var db = admin.firestore();
var usersRef = db.collection("users");


var http = require('http').Server(app);
var router = express.Router();

//index
router.get('/index',(req,res)=>{
  const user = firebase.auth().currentUser;
  const user_id = user.uid;
  var rooms_data = [];
  usersRef.doc(user.uid).collection("rooms").get()
  .then(function(snapshot){

    snapshot.forEach(doc => {
      rooms_data.push({
        "id":doc.id,
        "user_name": doc.data().user_name
      })

    })
    res.render('index',{
      user_id: user_id,
      rooms_data: rooms_data
    });
  })

});


//create rooms
router.post('/create',(req,res)=>{
  const user = firebase.auth().currentUser;
  var roommate_id = req.body.roomMateId;
  const user_id = user.uid;

  const roomRef = db.collection("rooms").doc();
  roomRef.set({
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    name: "room",
    owner: user_id
  })
  .catch(function(error){
    console.log(error);
  });;

  roomRef.collection("users").doc(user.uid);
  roomRef.collection("users").doc(roommate_id);


  //add user
  roomRef.collection("users").doc(user.uid);
  roomRef.collection("users").doc(roommate_id);

  //add roomData to user info

  usersRef.doc(user.uid).get()
  .then(function(userSnapshot){
      var owner_name = userSnapshot.data().user_name;
      usersRef.doc(roommate_id).collection("rooms").doc(roomRef.id).set({
        user_name : owner_name
      });
    })
    .catch(function(error){
      console.log(error);
    });

  usersRef.doc(roommate_id).get()
  .then(function(userSnapshot){
      var guest_name = userSnapshot.data().user_name;
      usersRef.doc(user.uid).collection("rooms").doc(roomRef.id).set({
        user_name : guest_name
      });
    })
    .catch(function(error){
      console.log(error);
    });




  res.redirect('/rooms/'+roomRef.id)
  });


router.get('/:id', function(req, res){

  const user = firebase.auth().currentUser;
  const room_id = req.params.id;
  if(user){
    usersRef.doc(user.uid).get()
    .then(function(userSnapshot){
        var user_name = userSnapshot.data().user_name;
        console.log(user_name);
        res.render('room', {
          user_name: user_name,
          room_id: room_id
        })
      })
      .catch(function(error){
        console.log(error);
      });

  }else{
    res.redirect('../users/login')
  };



});

module.exports = router;
