var oauth = module.exports;
var Hmac = require('./hmac');
var Client = require('./client');

oauth.createHmac = function (consumer, token) {
  token = token || { token: '', tokenSecret: '' };
  return new Hmac(consumer, token);
};

oauth.createClient = function (signer, entrypoint) {
  var client = new Client(signer, entrypoint);
  return client;
};