var URL = require('url');

Object.defineProperty(
  Function.prototype,
  'build',
  {
    value: function (attrMap) {
      return Object.freeze( 
        Object.create(this.prototype, attrMap)
      );
    },
    writable : false,
    enumerable : false,
    configurable : false
  }
);

module.exports = (function () {
  function RequestObject (method, url, query, header) {
    var parsedUrl = URL.parse(url);
    var urlObj = {
      protocol: parsedUrl.protocol,
      host : parsedUrl.hostname,
      pathname: parsedUrl.pathname
    };
    if ((parsedUrl.protocol === 'http:'
	 && parsedUrl.port != 80)
	|| 
	(parsedUrl.protocol === 'https:'
	 && parsedUrl.port != 443)) {
      urlObj.port = parsedUrl.port;
    }
    var newUrl = URL.format(urlObj);

    return RequestObject.build({
      method: { value: method.toUpperCase(), enumerable: true },
      url   : { value: newUrl              , enumerable: true },
      query : { value: query  || {}        , enumerable: true },
      header: { value: header || {}        , enumerable: true }
    });
  }
  
  return RequestObject;
})();
