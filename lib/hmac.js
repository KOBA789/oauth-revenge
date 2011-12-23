"use strict";

var crypto = require('crypto');
var querystring = require('querystring');
var uuid = require('uuid');
var RequestObject = require('./request_object');
var SortableHash = (function () {
  function SortableHash (object) {
    var result = [];
    for (var key in object) {
      result.push([ key, object[key] ]);
    }
    return result;
  }

  SortableHash.toObject = function (sortableHash) {
    var result = {};
    sortableHash.forEach(function (value) {
      result[ value[0] ] = value[1];
    });
    return result;
  };

  return SortableHash;
})();

String.prototype.quote = function (str) {
  return str + this + str;
};

String.prototype.replaceAll = function (src, dst) {
  return this.split(src).join(dst);
};

module.exports = (function () {
  function Hmac(consumer, token) {
    this.consumer = consumer;
    this.token = token || { token: '', tokenSecret: '' };
  }

  Hmac.prototype._genNonce = function () {
    return uuid.generate().replaceAll('-', '');
  };

  Hmac.prototype._genTimestamp = function () {
    return String((new Date().getTime() / 1000) | 0);
  };

  Hmac.prototype._normalize = function (_query) {
    var query = _query.slice();
    query.sort(function (a, b) {
      if (a[0] < b[0]) { return -1; }
      if (a[0] > b[0]) { return +1; }
      return 0;
    });
    
    return query.map(function (value) {
      return value.map(this._escape).join('=');
    }.bind(this)).join('&');
  };

  Hmac.prototype._escape = function (str) {
    return encodeURIComponent(str)
      .replaceAll('!', '%21')
      .replaceAll('*', '%2A')
      .replaceAll("'", '%27')
      .replaceAll('(', '%28')
      .replaceAll(')', '%29');
  };

  Hmac.prototype._merge = function (first, second) {
    var newObj = {}, key;

    for (key in first) {
      newObj[key] = first[key];
    }

    for (key in second) {
      newObj[key] = second[key];
    }
    
    return newObj;
  };

  Hmac.prototype.setRequestObject = function (reqObj) {
    this._reqObj = reqObj;
  };

  Hmac.prototype._genSignBaseQuery = function () {
    var requestQuery = new SortableHash(this._reqObj.query);
    var oauthQueryHash = {
      oauth_consumer_key: this.consumer.key,
      oauth_nonce: this._genNonce(),
      oauth_timestamp: this._genTimestamp(),
      oauth_version: '1.0',
      oauth_signature_method: 'HMAC-SHA1'
    };
    if (this.token.token.length > 0) {
      oauthQueryHash['oauth_token'] = this.token.token;
    }
    var oauthQuery = new SortableHash(oauthQueryHash);
    var signBaseQuery = requestQuery.concat(oauthQuery);
    return signBaseQuery.sort(function (a, b) {
      if (a[0] < b[0]) { return -1; }
      if (a[0] > b[0]) { return +1; }
      return 0;
    });    
  };

  Hmac.prototype._genSignBase = function (signBaseQuery) {
    var normalizedQuery = this._normalize(signBaseQuery);
    
    var signBaseString = [
      this._reqObj.method,
      this._reqObj.url,
      normalizedQuery
    ].map(this._escape).join('&');
    return signBaseString;
  };

  Hmac.prototype._genSignature = function (signBaseString) {
    var key = [this._escape(this.consumer.secret), 
	       this._escape(this.token.tokenSecret)].join('&');
    var hmac = crypto.createHmac('sha1', key);
    hmac.update(signBaseString);
    var signature = hmac.digest('base64');
    return signature;
  };

  Hmac.prototype.sign = function () {
    var signBaseQuery = this._genSignBaseQuery();
    var signBaseString = this._genSignBase(signBaseQuery);
    var signature = this._genSignature(signBaseString);
    var authHeader = {
      'Authorization': [
	'OAuth',
	signBaseQuery.filter(function (value) {
	  return value[0].indexOf('oauth_') === 0;
	}).concat([
	  ['oauth_signature', signature]
	]).map(function (value) {
	  return [
	    value[0],
	    this._escape(value[1]).quote('"')
	  ].join('=');
	}.bind(this)).join(',')
      ].join(' ')
    };
    
    var header = this._merge(this._reqObj.header, authHeader);

    var query = SortableHash.toObject(
      signBaseQuery.filter(function (value) {
	return value[0].indexOf('oauth_') !== 0;
      })
    );

    return new RequestObject(
      this._reqObj.method,
      this._reqObj.url,
      query,
      header
    );
  };

  return Hmac;
})();