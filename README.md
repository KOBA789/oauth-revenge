OAuth-Revenge
=========================

An OAuth 1.0 Client Module for Node.js

Specs
-------------------------

* HTTPS Support
* Twitter Streaming API Support
* Following Node.js idioms

How to Use
-------------------------

    var oauth = require('oauth-revenge');

    var consumer = {
      key: 'YOUR CONSUMER KEY'
    , secret: 'YOUR CONSUMER SECRET'
    };

    var token = {
      token: 'YOUR ACCESS/REQUEST TOKEN'
    , tokenSecret: 'YOUR ACCESS/REQUEST TOKEN'
    };

    var signer = oauth.createHmac(consumer, token);
    var client = oauth.createClient(signer);

    var url = 'https://api.twitter.com/1/statuses/update.json';
    var query = {
      status: 'posting my status from oauth-revenge!'
    };
  
    client.POST(url, query, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log(chunk);
      });
      res.on('end', function () {
        console.log('<<END>>');
      });
    });

    var filterUrl = 'https://stream.twitter.com/1/statuses/filter.json';

    var trackQuery = {
      track: '#nodejs'    
    };

    client.POST(filterUrl, trackQuery, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var data = JSON.parse(chunk);
        console.log(data.text);
      });
    });