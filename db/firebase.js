const express = require('express');
const session = require('express-session');
const FirebaseStore = require('connect-session-firebase')(session);
const firebase = require('firebase-admin');
const serviceAccount = require("../env/firebaseServiceAccountKey.json");
let usersArray = [];
let snapshot = '';

// Initialize Firebase
const db_init = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://timesheet-6e4b2.firebaseio.com"
});

let db = new FirebaseStore({
  database: db_init.database()
});

let ref = db.database.ref('movieApp');

ref.on('child_changed', function(childSnapshot, prevChildKey) {    //Retrieve all JSON objects in the DB when the page loads, then do so only when a new JSON object is pushed to the DB
  snapshot = JSON.stringify(childSnapshot);
  console.log(`child_changed -snapshot(STRINGIFIED): ${snapshot}`);
  snapshot = JSON.parse(snapshot);


  let userRecord = {
    uniqueId:   childSnapshot.key,
    profileID:  snapshot.profileID,
    fullName:   snapshot.fullName,
    profilePic: snapshot.profilePic,
    favorites:  snapshot.favorites
  }

  usersArray.push(userRecord);
  console.log("child_changed - usersArray: " + JSON.stringify(usersArray));
});

ref.on('child_added', function(childSnapshot, prevChildKey) {    //Retrieve all JSON objects in the DB when the page loads, then do so only when a new JSON object is pushed to the DB
  snapshot = JSON.stringify(childSnapshot);
  console.log(`child_added - snapshot(STRINGIFIED): ${snapshot}`);
  snapshot = JSON.parse(snapshot);


  let userRecord = {
    uniqueId:   childSnapshot.key,
    profileID:  snapshot.profileID,
    fullName:   snapshot.fullName,
    profilePic: snapshot.profilePic,
    favorites:  snapshot.favorites
  }

  usersArray.push(userRecord);
  console.log("child_added - usersArray: " + JSON.stringify(usersArray));
});

module.exports = {
  db,
  usersArray
}
