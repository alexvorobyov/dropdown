var http = require("http");
var testdata = require('fs').readFileSync('./testdata/dropdown.json');
var helpers = require('../js/helpers.js');
var url = require('url');

testdata = JSON.parse(testdata);

var filter = function(query) {
  var filteredData = [];
  query = (query || '').toLowerCase().replace(/^\s+|\s+$/gm, '');
  if (query) {
    var versions = helpers(query);
    for (var itemId in testdata) {
      var item = testdata[itemId];
      var itemName = item.name.toLowerCase().replace(/й/g, 'и').replace(/ё/g, 'е').replace(/ь/g, '').replace(/ъ/g, '').replace(/ь/g, '');

      for (var i = 0, len = versions.length; i < len; i++) {
        var version = versions[i];
        if (version && new RegExp(version.replace(/([^A-Za-zА-Яа-я])/, '\\$1')).exec(itemName)) {
          filteredData.push(item);
          break;
        }
      }
    }
  }
  return filteredData;
};

http.createServer(function(request, response) {
  var params = url.parse(request.url, true);
  var data = [];
  if (params.query.query) {
    data = filter(params.query.query);
  }
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.writeHead(200, {"Content-Type": "text/javascript"});
  response.write(JSON.stringify(data));
  response.end();

}).listen(8092, '127.0.0.1');
