let express = require('express');
let router = express.Router();
const request = require('request');   //'request' module, not the same as the 'req' object
const apiKey = require('../env/imdbKeys.js');
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
const helper = require('../helpers');
const passport = require('passport');

/*Additional processor function*/
//Fetch all Favorite Movies from IMDB API
let fetchFavoriteIMDB = (data) => {
  return new Promise((resolve, reject) => {
    const movieUrl = `${apiBaseUrl}/movie/`;
    let favoriteMovies = {results: new Array()};

    data.forEach(function(favoriteMovieId, index){
      console.log("Favorite Movie ID: " + favoriteMovieId);

      requestApi(movieUrl, favoriteMovieId)
        .then((movie) => {
          favoriteMovies.results.push(movie);
          if(favoriteMovies.results.length >= data.length){
            resolve(favoriteMovies);
          }
        })
        .catch((error) => {
          console.log("ERROR LOADING FAVORITE MOVIE RECORD TO ARRAY");
          return reject();
        });
    });
  });
}

//Promesified request to API
let requestApi = (movieUrl, favoriteMovieId) => {
  return new Promise((resolve, reject) => {
    request.get(movieUrl + `${favoriteMovieId}?api_key=${apiKey}`, function(error, response, data){
      if(error){
        console.log("REQUEST UNSUCCESSFULL");
        reject(error);
        return;
      }

      resolve(data);
    });
  });
}
/*************************/

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();   //DON'T FORGET 'next()' OR THE REQUEST CYCLE ENDS AND IT DOESN"T CONTINUE TO THE NEXT ROUTE
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("Session1: " + req.session.id);
  const sessionId =  req.session.id;

  if(typeof sessionId === 'undefined'){
    sessionId = '';
  }

  console.log(`sessionId: ${sessionId}`);

  request.get(nowPlayingUrl, function(error, response, data){
    console.log("data: " + JSON.stringify(JSON.parse(data).results));

    res.render('index', {
      jsonData: JSON.parse(data).results,
      user: req.user,
      sessionId: sessionId
    });
  });
});

/* GET individual movie page. */
router.get('/movie/:id', function(req, res, next) {
  const movieId = req.params.id;
  const thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;

  request.get(thisMovieUrl, function(error, response, data) {
    res.render('single-movie', {
      movieData: JSON.parse(data),
      user: req.user
    });
  });
});

router.post('/search', function(req, res, next) {
    const userSearchTerm = encodeURI(req.body.movieSearch);
    const category = req.body.cat;    //'req.body.cat' will return the CHOSEN option from the dropdown box, either 'movie' or 'person'
    console.log(category);            //so no need for if statements to determine which one was chosen.
    const movieUrl = `${apiBaseUrl}/search/${category}?query=${userSearchTerm}&api_key=${apiKey}`;
    const sessionId =  req.session.id;

    if(typeof sessionId === 'undefined'){
      sessionId = '';
    }

    request.get(movieUrl, function(error, response, data){
      let parsedData = JSON.parse(data);

      if(category === "person")
        parsedData.results = parsedData.results[0].known_for;

      res.render('index', {
        jsonData: parsedData.results,
        user: req.user,
        sessionId: sessionId
      });
    });
});

router.get('/favorites',[helper.isAuthenticated, function(req, res, next) {
  const uniqueId  = req.user.uniqueId;
  const sessionId =  req.session.id;

  if(typeof sessionId === 'undefined'){
    sessionId = '';
  }

  console.log(`GETTING FAVORITES!`);
  console.log(`/favorites - uniqueId: ${uniqueId}`);
  console.log(`/favorites - sessionId: ${sessionId}`);
  helper.getFavorites(uniqueId)
    .then((data) => {
      console.log("SUCCESS GETTING FAVORITES: " + data);
      fetchFavoriteIMDB(data)
        .then((data) => {
          let buffer = `[${data.results}]`;   //I had made an array of JSON objs and was not complaint with the format until I did this. ARGGGG!
          res.render('index', {
            jsonData: JSON.parse(buffer),     //Then JSON parsed it and it finally freaking works
            user: req.user,
            sessionId: sessionId
          });
        }).catch((error) => {
          console.log('Error Fetching Favorite Movie Data FROM IMDB API');
        });
    }).catch((error) => {
      console.log("ERROR GETTING FAVORITES");
    });
}]);

router.post('/favorites/:movieId', function(req, res, next) {
  const movieId   = req.params.movieId;
  const uniqueId  = req.user.uniqueId || '';
  const sessionId = req.session.id;

  helper.addFavorites(uniqueId, movieId, sessionId).then((data) => {
    console.log("Added to Favorites");
    res.json({success: "Added to Favorites"});
  }).catch((error) => {
    console.log("Failed Adding to Favorites");
    res.json({error: error});
  });
});

router.get('/login', function(req, res, next){
  res.render('login');
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }), function(req, res, next){console.log("Twitter Auth Callback ran !");});

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }), function(req, res, next){console.log("GitHub Auth Callback ran !");});


router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

// 404 for all other requests
router.get('*', function (req, res, next){
  res.render('404');
});

module.exports = router;
