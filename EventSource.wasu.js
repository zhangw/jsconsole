;(function (global) {

if ("EventSource" in window) return;

var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

var EventSource = function (url) {
  var eventsource = this,  
      interval = 500, // polling interval  
      lastEventId = null,
      cache = '';

  if (!url || typeof url != 'string') {
    throw new SyntaxError('Not enough arguments');
  }

  this.URL = url;
  this.readyState = this.CONNECTING;
  this._pollTimer = null;
  this._xhr = null;
  
  function pollAgain() {
    eventsource._pollTimer = setTimeout(function () {
      poll.call(eventsource);
    }, interval);
  }
  
  function poll() {
    try { // force hiding of the error message... insane?
      if (eventsource.readyState == eventsource.CLOSED) return;
      
      var xhr = new XMLHttpRequest();
      xhr.open('GET', eventsource.URL, true);
      xhr.setRequestHeader('Accept', 'text/event-stream');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
    
      // we must make use of this on the server side if we're working with Android - because they don't trigger 
      // readychange until the server connection is closed
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if (lastEventId != null) xhr.setRequestHeader('Last-Event-ID', lastEventId);
      cache = '';
    
      xhr.timeout = 50000;
      xhr.onreadystatechange = function () {
        if ((xhr.readyState == 3 || xhr.readyState == 4) && xhr.status == 200) {
          // on success
          if (eventsource.readyState == eventsource.CONNECTING) {
            eventsource.readyState = eventsource.OPEN;
            eventsource.dispatchEvent('open', { type: 'open' });
          }
        
          // process this.responseText
          var parts = xhr.responseText.substr(cache.length).split("\n"),
              data = [],
              i = 0,
              line = '';
          cache = xhr.responseText;
        
          // TODO handle 'event' (for buffer name), retry
          for (; i < parts.length; i++) {
            line = parts[i].replace(reTrim, '');
            if (line.indexOf('data') == 0) {
              data.push(line.replace(/data:?\s*/, ''));
            } else if (line.indexOf('id:') == 0) {
              lastEventId = line.replace(/id:?\s*/, '');
            } else if (line.indexOf('id') == 0) { // this resets the id
              lastEventId = null;
            } else if (line == '') {
              if (data.length) {
                var event = new MessageEvent(data.join('\n'), eventsource.url, lastEventId);
                eventsource.dispatchEvent('message', event);
                data = [];
              }
            }
          }
          if (xhr.readyState == 4) {
            pollAgain();
          }
          // don't need to poll again, because we're long-loading
        } else if (eventsource.readyState !== eventsource.CLOSED) {
          if (xhr.readyState == 4) { // and some other status
            eventsource.readyState = eventsource.CONNECTING;
            pollAgain(); 
          }else if (xhr.readyState == 0){
            xhr.abort();
            pollAgain();
          }
        }
      };
    
      xhr.send();
      setTimeout(function () {
        if (xhr.readyState == 3) {
            xhr.abort();
            pollAgain();
        }
      }, xhr.timeout);
      
      eventsource._xhr = xhr;
    
    } catch (e) { // in an attempt to silence the errors
      alert(e);
      eventsource.dispatchEvent('error', { type: 'error', data: e.message }); // ???
    } 
  };
  
  poll(); // init now
};

EventSource.prototype = {
  close: function () {
    // closes the connection - disabling the polling
    this.readyState = this.CLOSED;
    clearInterval(this._pollTimer);
    this._xhr.abort();
    this._xhr = null;
  },
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
  dispatchEvent: function (type, event) {
    var handlers = this['_' + type + 'Handlers'];
    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers.call(this, event);
      }      
    }
    
    if (this['on' + type]) {
      this['on' + type].call(this, event);
    }
  },
  addEventListener: function (type, handler) {
    if (!this['_' + type + 'Handlers']) {
      this['_' + type + 'Handlers'] = [];
    }
    
    this['_' + type + 'Handlers'].push(handler);
  },
  removeEventListener: function () {
    // TODO
  },
  onerror: null,
  onmessage: null,
  onopen: null,
  readyState: 0,
  URL: ''
};

var MessageEvent = function (data, origin, lastEventId) {
  this.data = data;
  this.origin = origin;
  this.lastEventId = lastEventId || '';
};

MessageEvent.prototype = {
  data: null,
  type: 'message',
  lastEventId: '',
  origin: ''
};

if ('module' in global) module.exports = EventSource;
global.EventSource = EventSource;
 
})(this);
