oauth = require '../lib'
RequestObject = require '../lib/request_object'

{consumer, token} = require './my_keys.json'

describe 'HMAC', ->
  exBaseStr = 'POST&https%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&oauth_consumer_key%3DIQoouY9VD7BPQPaMyWdeA%26oauth_nonce%3DwlcKN4QsCrz%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1324834057%26oauth_token%3D56680439-GIKrtcEfiEUDpk6a9e0Cb8R6sLs9Kkb9VPS9hPcfU%26oauth_version%3D1.0%26status%3D%25E6%2597%25A5%25E6%259C%25AC%25E8%25AA%259E%25E3%2583%2584%25E3%2582%25A4%25E3%2583%25BC%25E3%2583%2588'
  hmac = oauth.createHmac(consumer, token);
  hmac._genTimestamp = -> '1324834057'
  hmac._genNonce = -> 'wlcKN4QsCrz'
  reqObj = new RequestObject 'POST', 'https://api.twitter.com/1/statuses/update.json', status: '日本語ツイート'
  hmac.setRequestObject reqObj

  describe '#_genSignBase', ->
    baseQuery = hmac._genSignBaseQuery()
    baseStr = hmac._genSignBase baseQuery
    it 'should return a correct signature base string', ->
      baseStr.should.equal exBaseStr

  describe '#_genSignature', ->
    signature = hmac._genSignature exBaseStr
    it 'should return a correct signature', ->
      signature.should.equal 'yZaJxTVDhddgNFUzKItGBXrLkhk='