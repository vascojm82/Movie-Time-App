'use strict';

// if(process.env.NODE_ENV === 'production'){
//   console.log("PROD Mode");
//   module.exports = {
//     host: process.env.host || "",
//     sessionSecret: process.env.sessionSecret,
//     fb: {
//       clientID: process.env.fbClientID,
//       clientSecret: process.env.fbClientSecret,
//       callbackURL: process.env.host + "/auth/facebook/callback",
//       profileFields: ['id', 'displayName', 'photos']
//     },
//     twitter: {
//       consumerKey: process.env.twConsumerKey,
//       consumerSecret: process.env.twConsumerSecret,
//       callbackURL: process.env.host + "/auth/twitter/callback",
//       profileFields: ['id', 'displayName', 'photos']
//     }
//   }
// }else{
  //Offer dev stage settings and data
  module.exports = require('./development.json');
//}
