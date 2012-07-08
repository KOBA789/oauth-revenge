var oauth = module.exports,
    Hmac = require('./hmac'),
    Client = require('./client');

oauth.Client = Client;
oauth.Hmac = Hmac;

oauth.createHmac = function (consumer, token) {
  token = token || { token: '', tokenSecret: '' };
  return new Hmac(consumer, token);
};

oauth.createClient = function (signer, entrypoint) {
  var client = new Client(signer, entrypoint);
  return client;
};