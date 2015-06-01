var console;
var dropdown;

if (!console) {
  console = {
    log : function() {},
    error : function() {}
  };
}

if (!dropdown) {
  dropdown = {};
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(context) {
    var bindArgs = [].slice.call(arguments, 2);
    var func = this;
    return function() {
      var args = [].slice.call(arguments);
      return func.apply(context, bindArgs.concat(args));
    };
  }
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(o, from) {
    var len = this.length;
    from = from || 0;
    from += (from < 0) ? len : 0;
    for (; from < len; ++from) {
      if (this[from] === o) {
        return from;
      }
    }
    return -1;
  }
}

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

dropdown.helpers = {

  addEventListener : function(elem, event, func) {
    if (elem.addEventListener) {
      elem.addEventListener(event, func, false);
      return true;
    }
    else if (elem.attachEvent) {
      return elem.attachEvent('on' + event, func);
    }
  },

  removeEventListener : function(elem, event, handler) {
    if (elem.removeEventListener) {
      elem.removeEventListener(event, handler, false);
    }
    else if (elem.detachEvent) {
      elem.detachEvent('on' + event, handler);
    }
  },

  textVersions : (function() {
    var cyrillic = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЬЫЪЭЮЯабвгдеёжзийклмнопрстуфхцчшщьыъэюя';
    var keyboard = 'F<DULT~:PBQRKVYJGHCNEA{WXIOMS}">Zf,dult`;pbqrkvyjghcnea[wxioms]\'.z';
    var translitDictionary = {
      'а': 'a',
      'б': 'b',
      'в': 'v',
      'г': 'g',
      'д': 'd',
      'е': 'e',
      'ё': 'e',
      'ж': 'zh',
      'з': 'z',
      'и': 'i',
      'й': 'i',
      'к': 'k',
      'л': 'l',
      'м': 'm',
      'н': 'n',
      'о': 'o',
      'п': 'p',
      'р': 'r',
      'с': 's',
      'т': 't',
      'у': 'u',
      'ф': 'f',
      'х': 'kh',
      'ц': 'tc',
      'ч': 'ch',
      'ш': 'sh',
      'щ': 'shch',
      'ъ': '',
      'ы': 'y',
      'ь': '',
      'э': 'e',
      'ю': 'iu',
      'я': 'ya'
    };

    var cyrillicKeyboard = {};
    var cyrillicKeyboardInverted = {};
    var translitDictionaryInverted = {};

    for (var i = 0, len = cyrillic.length; i < len; i++) {
      cyrillicKeyboard[cyrillic[i]] = keyboard[i];
      cyrillicKeyboardInverted[keyboard[i]] = cyrillic[i];
    }

    for (var letter in translitDictionary) {
      if (!translitDictionaryInverted[translitDictionary[letter]]) {
        translitDictionaryInverted[translitDictionary[letter]] = letter;
      }
    }

    return function convert(str, secondTime) {
      var versions = ['', '', '', ''];
      var ret = [str];

      for (var i = 0, len = str.length; i < len; i++) {
        var char = str[i];
        var add = '';
        if (char == ' ') add = ' ';

        var translitAddon1 = char + (str[i + 1] || '') + (str[i + 2] || '') + (str[i + 3] || '');
        var translitAddon2 = char + (str[i + 1] || '');
        if (translitDictionaryInverted[translitAddon1] && translitAddon1.length == 4) {
          versions[0] += translitDictionaryInverted[translitAddon1];
          i += 3;
        }
        else if (translitDictionaryInverted[translitAddon2]) {
          versions[0] += translitDictionaryInverted[translitAddon2];
          i++;
        }
        else {
          versions[0] += (translitDictionaryInverted[char] || add);
        }
        versions[1] += (translitDictionary[char] || add);
        if (!secondTime) {
          versions[2] += (cyrillicKeyboardInverted[char] || add);
          versions[3] += (cyrillicKeyboard[char] || add);
        }
      }

      if (!secondTime) {
        if (versions[2].length == str.length) {
          versions = versions.concat(convert(versions[2], true));
        }
        else if (versions[3].length == str.length) {
          versions = versions.concat(convert(versions[3], true));
        }
      }

      for (var i = 0, len = versions.length; i < len; i++) {
        var version = versions[i].replace(/^\s+|\s+$/gm, '');
        if (version && !~ret.indexOf(version)) ret.push(version.toLowerCase());
      }

      return ret;
    }
  })()

};

var module;
if (module) {
  module.exports = dropdown.helpers.textVersions;
}