var express = require('express');
var router = express.Router();
var session = require('express-session');

var firebase = require("firebase/app");
require("firebase/auth");

//firestore
const admin = require('firebase-admin');
var serviceAccount = require("../firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();
var usersRef = db.collection("users");

//新規登録画面
router.get('/register', function(req, res){
  res.render('register');
});

//ユーザー登録
router.use(require('express').urlencoded({extended:false}));
router.post('/create', function(req, res, next){
  var user_name = req.body.user_name
  var mailAddress = req.body.mailAddress;
  var password = req.body.password;

firebase.auth().createUserWithEmailAndPassword(mailAddress, password)
  .then(function(userData){
    var setData = usersRef.doc(userData.user.uid).set({
        user_name: user_name,
        mail: mailAddress,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    res.redirect('/users/login');
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      console.log("error");
      res.render('register');
      // ...
  });

});

//ユーザーログイン
router.get('/login', function(req, res){
    res.render('login');
  });

router.post('/login', function(req, res){
  var mailAddress = req.body.mailAddress;
  var password = req.body.password;
  var userId;
  firebase.auth().signInWithEmailAndPassword(mailAddress, password)
    .then(function(userData) {
      userId = userData.user.uid;
      getUserData = usersRef.doc(userId).get()
      .then(function(userSnapshot){

        })
        .catch(function(error){
          console.log(error);
        });

      res.redirect('../rooms/index');

    })
    .catch(function(error) {
      // Handle Errors here.

      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      console.log("error");
      res.render('login');
      // ...
      });

    });

module.exports = router;
