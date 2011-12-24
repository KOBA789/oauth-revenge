"use strict";

var querystring = require('querystring');
var URL = require('url');
var http = require('http');
var https = require('https');
var protocols = {
  'http:' : http ,
  'https:': https
};
var RequestObject = require('./request_object');

module.exports = (function () {
  function Client (signer) {
    this.signer = signer;
  }

  Client.prototype._normalRequest = function (method, url, query, _headers, callback) {
    var parsedUrl = URL.parse(url);
    var headers = {};
    for (var key in _headers) {
      headers[key] = _headers[key];
    }
    headers['Accept'] = '*/*';
    var queryStr = querystring.stringify(query);
    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      headers['Content-Length'] = Buffer(queryStr).length;
    }
    var path = parsedUrl.path;
    if (queryStr.length > 0 && method === 'GET' || method === 'DELETE') {
      path += '?' + queryStr;
    }
    var options = {
      host: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      method: method,
      headers: headers,
      path: path
    };
    
    var protocol = protocols[parsedUrl.protocol];
    var req = protocol.request(options, callback);
    req.write(queryStr);
    req.end();
    return req;
  };

  Client.prototype.request = function (method, url, query, callback) {
    if (typeof query === 'function') {
      callback = query;
      query = {};
    }
    if (!query) { query = {}; }
    var reqObj = new RequestObject(method, url, query);
    this.signer.setRequestObject(reqObj);
    var signedReqObj = this.signer.sign();
    return this._normalRequest(
      signedReqObj.method,
      signedReqObj.url,
      signedReqObj.query,
      signedReqObj.headers,
      callback
    );
  };

  Client.prototype.GET = function (url, query, callback) {
    return this.request('GET', url, query, callback);
  };

  Client.prototype.POST = function (url, query, callback) {
    return this.request('POST', url, query, callback);
  };

  Client.prototype.PUT = function (url, query, callback) {
    return this.request('PUT', url, query, callback);
  };

  Client.prototype.DELETE = function (url, query, callback) {
    return this.request('DELETE', url, query, callback);
  };

  return Client;
})();