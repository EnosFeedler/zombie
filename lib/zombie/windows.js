// Generated by CoffeeScript 1.3.3
var Console, EventSource, Events, File, HTML, History, JSDOM, Screen, URL, WebSocket, Windows;

Console = require("./console");

History = require("./history");

JSDOM = require("jsdom");

HTML = JSDOM.dom.level3.html;

URL = require("url");

EventSource = require("eventsource");

WebSocket = require("ws");

Events = JSDOM.dom.level3.events;

Windows = (function() {

  function Windows(browser) {
    this._browser = browser;
    this._named = {};
    this._stack = [];
    this.open({});
  }

  Windows.prototype.open = function(options) {
    var name, window, _base;
    if (options == null) {
      options = {};
    }
    name = options.name || this._browser.name || "";
    if (options.parent) {
      window = this._create(name, options);
    } else {
      if (name === "_blank") {
        window = this._create(name, options);
      } else {
        window = (_base = this._named)[name] || (_base[name] = this._create(name, options));
      }
      this._stack.push(window);
    }
    if (options.url) {
      window.location = options.url;
    } else if (!window.document) {
      window.location = "about:blank";
    }
    if (!options.parent) {
      this.select(window);
    }
    return window;
  };

  Windows.prototype.get = function(name_or_index) {
    return this._named[name_or_index] || this._stack[name_or_index];
  };

  Windows.prototype.all = function() {
    return this._stack.slice();
  };

  Windows.prototype.__defineGetter__("count", function() {
    return this._stack.length;
  });

  Windows.prototype.close = function(window) {
    var index;
    window = this._named[window] || this._stack[window] || window || this._current;
    index = this._stack.indexOf(window);
    if (!(index >= 0)) {
      return;
    }
    window.closed = true;
    delete this._named[window.name];
    this._stack.splice(index, 1);
    if (window === this._current) {
      if (index > 0) {
        this.select(this._stack[index - 1]);
      } else {
        this.select(this._stack[0]);
      }
    }
  };

  Windows.prototype.select = function(window) {
    var onblur, onfocus, previous, _ref;
    window = this._named[window] || this._stack[window] || window;
    if (!~this._stack.indexOf(window)) {
      return;
    }
    _ref = [this._current, window], previous = _ref[0], this._current = _ref[1];
    if (previous !== window) {
      onfocus = window.document.createEvent("HTMLEvents");
      onfocus.initEvent("focus", false, false);
      process.nextTick(function() {
        return window.dispatchEvent(onfocus);
      });
      if (previous) {
        onblur = window.document.createEvent("HTMLEvents");
        onblur.initEvent("blur", false, false);
        process.nextTick(function() {
          return previous.dispatchEvent(onblur);
        });
      }
    }
  };

  Windows.prototype.__defineGetter__("current", function() {
    return this._current;
  });

  Windows.prototype._create = function(name, _arg) {
    var eventloop, global, opener, parent, window,
      _this = this;
    parent = _arg.parent, opener = _arg.opener;
    window = JSDOM.createWindow(HTML);
    global = window.getGlobal();
    Object.defineProperty(window, "browser", {
      value: this._browser
    });
    eventloop = this._browser._eventloop;
    eventloop.apply(window);
    Object.defineProperty(window, "name", {
      value: name || ""
    });
    if (parent) {
      Object.defineProperty(window, "parent", {
        value: parent.getGlobal()
      });
      Object.defineProperty(window, "top", {
        value: parent.top.getGlobal()
      });
    } else {
      Object.defineProperty(window, "parent", {
        value: window.getGlobal()
      });
      Object.defineProperty(window, "top", {
        value: window.getGlobal()
      });
    }
    Object.defineProperty(window, "history", {
      value: new History(window)
    });
    Object.defineProperty(window, "opener", {
      value: opener != null ? opener.getGlobal() : void 0
    });
    Object.defineProperty(window, "title", {
      get: function() {
        return this.document.title;
      },
      set: function(title) {
        return this.document.title = title;
      }
    });
    window.closed = false;
    Object.defineProperties(window.navigator, {
      cookieEnabled: {
        value: true
      },
      javaEnabled: {
        value: function() {
          return false;
        }
      },
      plugins: {
        value: []
      },
      vendor: {
        value: "Zombie Industries"
      }
    });
    this._browser._cookies.extend(window);
    this._browser._storages.extend(window);
    this._browser._interact.extend(window);
    this._browser._xhr.extend(window);
    Object.defineProperties(window, {
      File: {
        value: File
      },
      Event: {
        value: Events.Event
      },
      screen: {
        value: new Screen()
      },
      JSON: {
        value: JSON
      },
      MouseEvent: {
        value: Events.MouseEvent
      },
      MutationEvent: {
        value: Events.MutationEvent
      },
      UIEvent: {
        value: Events.UIEvent
      }
    });
    window.atob = function(string) {
      return new Buffer(string, "base64").toString("utf8");
    };
    window.btoa = function(string) {
      return new Buffer(string, "utf8").toString("base64");
    };
    window.WebKitPoint = function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    };
    window.webkitConvertPointFromNodeToPage = function(node, point) {
      return point;
    };
    window.webkitConvertPointFromPageToNode = function(node, point) {
      return point;
    };
    window.EventSource = function(url) {
      url = URL.resolve(window.location, url);
      window.setInterval((function() {}), 100);
      return new EventSource(url);
    };
    window.WebSocket = function(url, protocol) {
      var origin;
      origin = "" + window.location.protocol + "//" + window.location.host;
      return new WebSocket(url, {
        origin: origin,
        protocol: protocol
      });
    };
    window.Image = function(width, height) {
      var img;
      img = new HTML.HTMLImageElement(window.document);
      img.width = width;
      img.height = height;
      return img;
    };
    window.console = new Console(this._browser.silent);
    window.postMessage = function(data, targetOrigin) {
      var document, event, origin;
      document = window.document;
      if (!document) {
        return;
      }
      event = document.createEvent("MessageEvent");
      event.initEvent("message", false, false);
      event.data = data;
      event.source = Windows.inContext;
      origin = event.source.location;
      event.origin = URL.format({
        protocol: origin.protocol,
        host: origin.host
      });
      return process.nextTick(function() {
        return eventloop.dispatch(window, event);
      });
    };
    window.addEventListener("focus", function(event) {
      var onfocus;
      if (window.document.activeElement) {
        onfocus = window.document.createEvent("HTMLEvents");
        onfocus.initEvent("focus", false, false);
        return window.document.activeElement.dispatchEvent(onfocus);
      }
    });
    window.addEventListener("blur", function(event) {
      var onblur;
      if (window.document.activeElement) {
        onblur = window.document.createEvent("HTMLEvents");
        onblur.initEvent("blur", false, false);
        return window.document.activeElement.dispatchEvent(onblur);
      }
    });
    window._evaluate = function(code, filename) {
      try {
        Windows.inContext = window;
        if (typeof code === "string" || code instanceof String) {
          return global.run(code, filename);
        } else {
          return code.call(global);
        }
      } finally {
        Windows.inContext = null;
      }
    };
    window.onerror = function(event) {
      var error;
      error = event.error || new Error("Error loading script");
      return _this._browser.emit("error", error);
    };
    window.open = function(url, name, features) {
      if (url) {
        url = URL.resolve(window.location, url);
      }
      return _this.open({
        url: url,
        name: name,
        opener: window
      });
    };
    window.close = function() {
      if (opener) {
        _this.close(window);
      } else {
        _this._browser.log("Scripts may not close windows that were not opened by script");
      }
    };
    return window;
  };

  return Windows;

})();

Screen = (function() {

  function Screen() {
    this.width = 1280;
    this.height = 800;
    this.left = 0;
    this.top = 0;
  }

  Screen.prototype.__defineGetter__("availLeft", function() {
    return 0;
  });

  Screen.prototype.__defineGetter__("availTop", function() {
    return 0;
  });

  Screen.prototype.__defineGetter__("availWidth", function() {
    return this.width;
  });

  Screen.prototype.__defineGetter__("availHeight", function() {
    return this.height;
  });

  Screen.prototype.__defineGetter__("colorDepth", function() {
    return 24;
  });

  Screen.prototype.__defineGetter__("pixelDepth", function() {
    return 24;
  });

  return Screen;

})();

File = (function() {

  function File() {}

  return File;

})();

module.exports = Windows;
