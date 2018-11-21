const session = require('express-session');
const config = require('../config');
const firebase = require('../db/firebase.js');

/*if(process.env.NODE_ENV === 'production'){
  module.exports = session({
    secret: "topSecret",
    resave: false,
    saveUninitialized: true,
    store: firebase.db
  });
}else{*/
  module.exports = session({
    secret: "topSecret",
    resave: false,
    saveUninitialized: true,
    store: firebase.db
  });
//}
