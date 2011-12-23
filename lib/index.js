var oauth = module.exports;
var Hmac = require('./hmac');
var Client = require('./client');

oauth.createHmac = function (consumer, token) {
  return new Hmac(consumer, token);
};

oauth.createClient = function (signer) {
  client = new Client(signer);
  return client;
};