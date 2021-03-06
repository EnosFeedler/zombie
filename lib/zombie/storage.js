// Generated by CoffeeScript 1.3.3
var Event, HTML, Storage, StorageArea, StorageEvent, Storages;

HTML = require("jsdom").dom.level3.html;

Event = require("jsdom").dom.level3.events.Event;

StorageArea = (function() {

  function StorageArea() {
    this._items = [];
    this._storages = [];
  }

  StorageArea.prototype._fire = function(source, key, oldValue, newValue) {
    var event, storage, window, _i, _len, _ref, _ref1, _results;
    _ref = this._storages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], storage = _ref1[0], window = _ref1[1];
      if (storage === source) {
        continue;
      }
      event = new StorageEvent(storage, window.location.href, key, oldValue, newValue);
      _results.push(window.browser.dispatchEvent(window, event));
    }
    return _results;
  };

  StorageArea.prototype.__defineGetter__("length", function() {
    var i, k;
    i = 0;
    for (k in this._items) {
      ++i;
    }
    return i;
  });

  StorageArea.prototype.key = function(index) {
    var i, k;
    i = 0;
    for (k in this._items) {
      if (i === index) {
        return k;
      }
      ++i;
    }
  };

  StorageArea.prototype.get = function(key) {
    return this._items[key];
  };

  StorageArea.prototype.set = function(source, key, value) {
    var oldValue;
    oldValue = this._items[key];
    this._items[key] = value;
    return this._fire(source, key, oldValue, value);
  };

  StorageArea.prototype.remove = function(source, key) {
    var oldValue;
    oldValue = this._items[key];
    delete this._items[key];
    return this._fire(source, key, oldValue);
  };

  StorageArea.prototype.clear = function(source) {
    this._items = [];
    return this._fire(source);
  };

  StorageArea.prototype.associate = function(storage, window) {
    return this._storages.push([storage, window]);
  };

  StorageArea.prototype.__defineGetter__("pairs", function() {
    var k, v;
    return (function() {
      var _ref, _results;
      _ref = this._items;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push([k, v]);
      }
      return _results;
    }).call(this);
  });

  StorageArea.prototype.toString = function() {
    var k, v;
    return ((function() {
      var _ref, _results;
      _ref = this._items;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push("" + k + " = " + v);
      }
      return _results;
    }).call(this)).join("\n");
  };

  return StorageArea;

})();

Storage = (function() {

  function Storage(_area) {
    this._area = _area;
  }

  Storage.prototype.__defineGetter__("length", function() {
    return this._area.length;
  });

  Storage.prototype.key = function(index) {
    return this._area.key(index);
  };

  Storage.prototype.getItem = function(key) {
    return this._area.get(key.toString());
  };

  Storage.prototype.setItem = function(key, value) {
    return this._area.set(this, key.toString(), value);
  };

  Storage.prototype.removeItem = function(key) {
    return this._area.remove(this, key.toString());
  };

  Storage.prototype.clear = function() {
    return this._area.clear(this);
  };

  Storage.prototype.dump = function() {
    return this._area.dump();
  };

  return Storage;

})();

StorageEvent = function(storage, url, key, oldValue, newValue) {
  Event.call(this, "storage");
  this.__defineGetter__("url", function() {
    return url;
  });
  this.__defineGetter__("storageArea", function() {
    return storage;
  });
  this.__defineGetter__("key", function() {
    return key;
  });
  this.__defineGetter__("oldValue", function() {
    return oldValue;
  });
  return this.__defineGetter__("newValue", function() {
    return newValue;
  });
};

StorageEvent.prototype.__proto__ = Event.prototype;

HTML.SECURITY_ERR = 18;

Storages = (function() {

  function Storages() {
    this._locals = {};
    this._sessions = {};
  }

  Storages.prototype.local = function(host) {
    var area, _base, _ref;
    area = (_ref = (_base = this._locals)[host]) != null ? _ref : _base[host] = new StorageArea();
    return new Storage(area);
  };

  Storages.prototype.session = function(host) {
    var area, _base, _ref;
    area = (_ref = (_base = this._sessions)[host]) != null ? _ref : _base[host] = new StorageArea();
    return new Storage(area);
  };

  Storages.prototype.extend = function(window) {
    var storages;
    storages = this;
    window.StorageEvent = StorageEvent;
    Object.defineProperty(window, "localStorage", {
      get: function() {
        var _ref;
        return (_ref = this.document) != null ? _ref._localStorage || (_ref._localStorage = storages.local(this.location.host)) : void 0;
      }
    });
    return Object.defineProperty(window, "sessionStorage", {
      get: function() {
        var _ref;
        return (_ref = this.document) != null ? _ref._sessionStorage || (_ref._sessionStorage = storages.session(this.location.host)) : void 0;
      }
    });
  };

  Storages.prototype.dump = function() {
    var area, domain, pair, pairs, serialized, _i, _j, _len, _len1, _ref, _ref1;
    serialized = [];
    _ref = this._locals;
    for (domain in _ref) {
      area = _ref[domain];
      pairs = area.pairs;
      serialized.push("" + domain + " local:");
      for (_i = 0, _len = pairs.length; _i < _len; _i++) {
        pair = pairs[_i];
        serialized.push("  " + pair[0] + " = " + pair[1]);
      }
    }
    _ref1 = this._sessions;
    for (domain in _ref1) {
      area = _ref1[domain];
      pairs = area.pairs;
      serialized.push("" + domain + " session:");
      for (_j = 0, _len1 = pairs.length; _j < _len1; _j++) {
        pair = pairs[_j];
        serialized.push("  " + pair[0] + " = " + pair[1]);
      }
    }
    return serialized;
  };

  Storages.prototype.save = function() {
    var area, domain, pair, pairs, serialized, _i, _j, _len, _len1, _ref, _ref1;
    serialized = ["# Saved on " + (new Date().toISOString())];
    _ref = this._locals;
    for (domain in _ref) {
      area = _ref[domain];
      pairs = area.pairs;
      if (pairs.length > 0) {
        serialized.push("" + domain + " local:");
        for (_i = 0, _len = pairs.length; _i < _len; _i++) {
          pair = pairs[_i];
          serialized.push("  " + (escape(pair[0])) + " = " + (escape(pair[1])));
        }
      }
    }
    _ref1 = this._sessions;
    for (domain in _ref1) {
      area = _ref1[domain];
      pairs = area.pairs;
      if (pairs.length > 0) {
        serialized.push("" + domain + " session:");
        for (_j = 0, _len1 = pairs.length; _j < _len1; _j++) {
          pair = pairs[_j];
          serialized.push("  " + (escape(pair[0])) + " = " + (escape(pair[1])));
        }
      }
    }
    return serialized.join("\n") + "\n";
  };

  Storages.prototype.load = function(serialized) {
    var domain, item, key, storage, type, value, _i, _len, _ref, _ref1, _ref2, _results;
    storage = null;
    _ref = serialized.split(/\n+/);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item[0] === "#" || item === "") {
        continue;
      }
      if (item[0] === " ") {
        _ref1 = item.split("="), key = _ref1[0], value = _ref1[1];
        if (storage) {
          _results.push(storage.setItem(unescape(key.trim()), unescape(value.trim())));
        } else {
          throw "Must specify storage type using local: or session:";
        }
      } else {
        _ref2 = item.split(" "), domain = _ref2[0], type = _ref2[1];
        if (type === "local:") {
          _results.push(storage = this.local(domain));
        } else if (type === "session:") {
          _results.push(storage = this.session(domain));
        } else {
          throw "Unkown storage type " + type;
        }
      }
    }
    return _results;
  };

  return Storages;

})();

module.exports = Storages;
