var dropdown;
if (!dropdown) {
  dropdown = {};
}

dropdown.xhr = {

  xhrFactoryToUse : null,

  xhr : function(url, postData, callback) {
    var req = this.createXHR();

    if (!req) return;

    var method = (postData) ? 'POST' : 'GET';
    req.open(method,url,true);
    if (postData) {
      req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    req.onreadystatechange = function () {
      if (req.readyState != 4) return;
      if (req.status != 200 && req.status != 304) {
        console.log('HTTP error ' + req.status);
        return;
      }
      if (req.responseText) {
        var response = null;
        var error = false;
        try {
          response = JSON.parse(req.responseText);
        }
        catch (e) {
          console.log('response is not proper JSON');
          error = true;
        }
        callback(error, response);
      }

    };
    if (req.readyState == 4) return;
    req.send(postData);
  },

  XMLHttpFactories : [
    function () {return new XMLHttpRequest()},
    function () {return new ActiveXObject('Msxml2.XMLHTTP')},
    function () {return new ActiveXObject('Msxml3.XMLHTTP')},
    function () {return new ActiveXObject('Microsoft.XMLHTTP')}
  ],

  createXHR : function() {
    if (this.xhrFactoryToUse) {
      return this.xhrFactoryToUse();
    }
    var xhr = null;
    for (var i = 0; i < this.XMLHttpFactories.length; i++) {
      try {
        xhr = this.XMLHttpFactories[i]();
      }
      catch (e) {
        continue;
      }
      break;
    }
    this.xhrFactoryToUse = this.XMLHttpFactories[i];
    return xhr;
  }

}