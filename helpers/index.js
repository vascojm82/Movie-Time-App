const firebase = require('../db/firebase.js');
let ref = firebase.db.database.ref('movieApp');

//Find a single user based on profileID(May not be unique)
let findOne = (profileID) => {
  console.log(`findOne -- profileId: ${profileID}`);
  return new Promise((resolve, reject) => {
    let usersArryLen = firebase.usersArray.length;
    firebase.usersArray.forEach((user, index) => {
      if(user.profileID === profileID){
        console.log("ProfileID MATCH!");
        resolve(user);
      }
      if(usersArryLen === (index+1)){
        reject();
      }
    });

    if(usersArryLen === 0)
      reject();

  }).catch((error) => {
      console.log("NO MATCH");
    });
}

//Create New User
let createNewUser = (profile) => {
  console.log("Creating New User");

  return new Promise((resolve, reject) => {
    ref.push({
      profileID:  profile.id,
      fullName:   profile.displayName,
      profilePic: profile.photos[0].value || '',
      favorites: ''
    }).then((snap) => {
       console.log("snap.key: " + snap.key);

       resolve({
         uniqueId:   snap.key,
         profileID:  profile.id,
         fullName:   profile.displayName,
         profilePic: profile.photos[0].value || '',
         favorites: ''
       });
    }).catch((error) => {
      console.log("Error Inserting record in DB");
      reject();
    });
  }).catch((error) => {
      console.log("Could Not Create New User");
  });
}

//Find User by Firebase Unique ID
let findById = (id) => {
  console.log(`findById -- UniqueId: ${id}`);
  return new Promise(async (resolve, reject) => {
    await firebase.usersArray.forEach(function(user, index){
      // console.log(`findById > user: ${JSON.stringify(firebase.usersArray)} > id: ${id}`);
      console.log(`index: ${index}`);
      console.log(``)
      console.log(`findById > user: ${JSON.stringify(JSON.stringify(user))} > id: ${id}`);

      if(user.uniqueId === id){
        console.log("UNIQUE ID MATCH!");
        return resolve(user);
      }
    });
    reject();
  }).catch((error) => {
      console.log("NO MATCH");
  });
}

let addFavorites = (uniqueId, movieId, sessionId) => {
  return new Promise((resolve, reject) => {
    let searchRef    = ref;      //'myApp'
    let newSearchRef = searchRef.child(uniqueId);
    let updateRef    = newSearchRef.child('favorites');

    updateRef.push({ movieId: movieId }).then((data) => {
      console.log("success adding favorite movie");
      resolve(data);
    }).catch((error) => {
      console.log("failed adding favorite movie");
      reject();
    });
  });
}

let getFavorites = (uniqueId) => {
  return new Promise( async(resolve, reject) => {
    let newMovieArray = new Array();
    let movieArray = new Array();
    let found = false;

    await firebase.usersArray.forEach(function(user, index){
      if(user.uniqueId === uniqueId){                          //FIREBASE IS RETARDED !!!
        console.log(`processFavoriteMovies - user.favorites: ${JSON.stringify(user.favorites)}`);  //Array of key: movieId object pairs. ie: 'SomeIdUsedAsKey': {movieId: 33432}

        newMovieArray = [];
        movieArray = Object.values(user.favorites);   //Array of just movieId Objects. ie: {movieId: 33432}

        movieArray.forEach(function(movie, index){
          console.log(`MovieID: ${movie.movieId}`);
          newMovieArray.push(movie.movieId);              //Array of just movie ids
        });
        console.log(`newMovieArray: ${newMovieArray}`);

        found = true;
      }
    });
    if(found){
      resolve(newMovieArray);
    }else{
      console.log("ERROR: Could Not Get Favorite Movies Data");
      reject();
    }
 });
}

//middleware to check if the user is authenticated & logged in
let isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()){ //This method is provided to us by passport, returns true || false
    next();
  }else{
    res.redirect('/login');
  }
}

module.exports = {
  findOne,
  findById,
  createNewUser,
  addFavorites,
  getFavorites,
  isAuthenticated
}
