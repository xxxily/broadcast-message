(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
/*!
 * @name         url.js
 * @description  用于对url进行解析的相关方法
 * @version      0.0.1
 * @author       Blaze
 * @date         27/03/2019 15:52
 * @github       https://github.com/xxxily
 */
function parseURL(url) {
  var a = document.createElement("a");
  a.href = url || window.location.href;
  return {
    source: url,
    protocol: a.protocol.replace(":", ""),
    host: a.hostname,
    port: a.port,
    origin: a.origin,
    search: a.search,
    query: a.search,
    file: (a.pathname.match(/\/([^/?#]+)$/i) || ["", ""])[1],
    hash: a.hash.replace("#", ""),
    path: a.pathname.replace(/^([^/])/, "/$1"),
    relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || ["", ""])[1],
    params: function() {
      var ret = {};
      var seg = [];
      var paramArr = a.search.replace(/^\?/, "").split("&");
      for (var i = 0; i < paramArr.length; i++) {
        var item = paramArr[i];
        if (item !== "" && item.indexOf("=")) {
          seg.push(item);
        }
      }
      for (var j = 0; j < seg.length; j++) {
        var param = seg[j];
        var idx = param.indexOf("=");
        var key = param.substring(0, idx);
        var val = param.substring(idx + 1);
        if (!key) {
          ret[val] = null;
        } else {
          ret[key] = val;
        }
      }
      return ret;
    }()
  };
}
function stringifyParams(params) {
  var strArr = [];
  if (!Object.prototype.toString.call(params) === "[object Object]") {
    return "";
  }
  for (var key in params) {
    if (Object.hasOwnProperty.call(params, key)) {
      var val = params[key];
      var valType = Object.prototype.toString.call(val);
      if (val === "" || valType === "[object Undefined]")
        continue;
      if (val === null) {
        strArr.push(key);
      } else if (valType === "[object Array]") {
        strArr.push(key + "=" + val.join(","));
      } else {
        val = (JSON.stringify(val) || "" + val).replace(/(^"|"$)/g, "");
        strArr.push(key + "=" + val);
      }
    }
  }
  return strArr.join("&");
}
function stringifyToUrl(urlObj) {
  var query = stringifyParams(urlObj.params) || "";
  if (query) {
    query = "?" + query;
  }
  var hash = urlObj.hash ? "#" + urlObj.hash : "";
  return urlObj.origin + urlObj.path + query + hash;
}
/*!
 * @name         BroadcastMessage.js
 * @description  基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/11/07 09:26
 * @github       https://github.com/xxxily
 */
class BroadcastMessage {
  constructor(opts = {}) {
    this.targetOrigin = opts.targetOrigin || location.origin;
    this.transportType = opts.transportType || "BroadcastChannel";
    this.inTrustedDomainPages = opts.inTrustedDomainPages || false;
    this.trustedDomainPages = opts.trustedDomainPages || "";
    this.allowLocalBroadcast = opts.allowLocalBroadcast || false;
    this.channelId = String(opts.channelId || "*");
    this.instanceId = this.channelId + "_" + (window.performance ? performance.now() : Date.now());
    this.debug = opts.debug || false;
    this.emitOriginalMessage = opts.emitOriginalMessage || false;
    this.messageWindow = window;
    this.readyTime = 0;
    this.init(opts);
  }
  init() {
    if (this.trustedDomainPages) {
      const urlInfo = parseURL(this.trustedDomainPages);
      urlInfo.params.channelId = this.channelId;
      urlInfo.params.instanceId = this.instanceId;
      this.trustedDomainPages = stringifyToUrl(urlInfo);
    }
    this.__registerMessageWindow__();
    if (this.inTrustedDomainPages && window !== top.window) {
      this.__registerPostMessageListener__();
      this.__registerStorageMessageListener__();
      this.__registerBroadcastChannelListener__();
      this.__sendMessageToParentWindow__("initReady");
    }
  }
  getTrustedDomain() {
    if (this.trustedDomainPages) {
      return parseURL(this.trustedDomainPages).origin;
    } else {
      return location.origin;
    }
  }
  __sendMessageToParentWindow__(msg) {
    if (window.parent === window || !msg) {
      return false;
    }
    const channelId = window.__broadcastMessageChannelId__ || this.channelId;
    const instanceId = window.__broadcastMessageInstanceId__ || this.instanceId;
    window.parent.postMessage({
      data: msg,
      channelId,
      instanceId,
      type: "Internal-BroadcastMessage"
    }, "*");
  }
  __registerMessageWindow__() {
    if (this.messageWindow !== window) {
      return false;
    }
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    iframe.src = this.trustedDomainPages;
    iframe.className = "broadcast-message-iframe";
    document.body.appendChild(iframe);
    this.messageWindow = iframe.contentWindow;
    if (!this.inTrustedDomainPages && !this.trustedDomainPages && this.messageWindow.document && this.messageWindow.document.write) {
      const document2 = this.messageWindow.document;
      if (!document2.body) {
        const body = document2.createElement("body");
        body.innerHTML = "<h1>Broadcast-Message-page</h1>";
        document2.documentElement.appendChild(body);
      }
      document2.open();
      document2.write(`
        <script>
        function ${this.__registerPostMessageListener__};
        function ${this.__registerStorageMessageListener__};
        function ${this.__registerBroadcastChannelListener__};
        function ${this.__sendMessageToParentWindow__};
        function init () {
          if (window.__hasInit__) { return false; }
          window.__broadcastMessageChannelId__ = "${this.channelId}";
          window.__broadcastMessageInstanceId__ = "${this.instanceId}";
          __registerPostMessageListener__();
          __registerStorageMessageListener__();
          __registerBroadcastChannelListener__();
          __sendMessageToParentWindow__('initReady');
          window.__hasInit__ = true ;
        }

        document.addEventListener("DOMContentLoaded", init);
        window.addEventListener("load", init)
        setTimeout(init, 100)
        <\/script>
      `);
      document2.close();
    }
  }
  __registerPostMessageListener__() {
    const self = this;
    if (self.__hasRegisterPostMessageListener__) {
      return false;
    }
    if (window.top === window) {
      return false;
    }
    window.__windowId__ = String((Date.now() - Math.random() * 1e5).toFixed(2));
    if (!window.__broadcastMessageChannelId__) {
      try {
        const urlInfo = parseURL(location.href);
        if (urlInfo.params.channelId && urlInfo.params.instanceId) {
          window.__broadcastMessageChannelId__ = urlInfo.params.channelId;
          window.__broadcastMessageInstanceId__ = urlInfo.params.instanceId;
        } else {
          throw new Error("URL\u7F3A\u5931\u76F8\u5173\u53C2\u6570");
        }
      } catch (e) {
        console.error(`[registerPostMessageListener][${location.origin}] \u83B7\u53D6broadcastMessageChannelId\u5931\u8D25`, e);
      }
    }
    function messageIframe() {
      let messageIframe2 = document.querySelector("#message-transport-iframe");
      if (messageIframe2) {
        return messageIframe2;
      }
      messageIframe2 = document.createElement("iframe");
      messageIframe2.id = "message-transport-iframe";
      messageIframe2.style.display = "none";
      messageIframe2.style.visibility = "hidden";
      document.body.appendChild(messageIframe2);
      return messageIframe2;
    }
    function transportMessage(event) {
      const message = event.data;
      message.windowId = window.__windowId__;
      message.debug && console.log(`[transportMessage][iframe][${location.origin}]`);
      const iframeWindow = messageIframe().contentWindow;
      const broadcastChannelUsable = iframeWindow.BroadcastChannel && iframeWindow.BroadcastChannel.prototype.postMessage;
      if (broadcastChannelUsable && message.transportType !== "localStorage") {
        const bcInstance = iframeWindow.__BroadcastChannelInstance__ || new iframeWindow.BroadcastChannel("__BroadcastChannelMessage__");
        iframeWindow.__BroadcastChannelInstance__ = iframeWindow.__BroadcastChannelInstance__ || bcInstance;
        bcInstance.postMessage(message);
      } else {
        iframeWindow.localStorage.setItem("__BroadcastMessage__", JSON.stringify(message));
      }
    }
    messageIframe();
    function internalBroadcastMessageHandler(event) {
      const message = event.data;
      if (!message) {
        return false;
      }
      if (message.data === "readyTest") {
        window.__broadcastMessageReadyInfo__ = message;
        const sendMessageToParentWindow = self.__sendMessageToParentWindow__ || window.__sendMessageToParentWindow__;
        if (sendMessageToParentWindow instanceof Function) {
          sendMessageToParentWindow("ready");
        }
      }
    }
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (!message || !message.type) {
        return false;
      }
      if (message.type === "BroadcastMessage") {
        transportMessage(event);
      } else if (message.type === "Internal-BroadcastMessage") {
        internalBroadcastMessageHandler(event);
      }
    }, true);
    this.__hasRegisterPostMessageListener__ = true;
  }
  __registerBroadcastChannelListener__() {
    if (!window.BroadcastChannel || !BroadcastChannel.prototype.postMessage) {
      console.error(`[BroadcastChannel][${location.origin}]`, "\u4E0D\u652F\u6301BroadcastChannel");
      return false;
    }
    if (this.__BroadcastChannelInstance__) {
      return true;
    }
    const BroadcastChannelInstance = new BroadcastChannel("__BroadcastChannelMessage__");
    BroadcastChannelInstance.addEventListener("message", (event) => {
      const message = event.data;
      if (!message || !message.windowId || !message.data) {
        return false;
      }
      const channelId = window.__broadcastMessageChannelId__;
      if (!message.channelId || channelId && message.channelId !== channelId) {
        message.debug && console.info("[transportMessage] channelId\u4E0D\u5B58\u5728\u6216\u4E0D\u5339\u914D\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012", channelId, message);
        return false;
      }
      if (!message.allowLocalBroadcast && window.__windowId__ && window.__windowId__ === message.windowId) {
        message.debug && console.info("[BroadcastChannel-event] \u6D88\u606F\u6E90\u63A5\u6536\u7AEF\u548C\u6D88\u606F\u6E90\u7684\u6765\u6E90\u7AEF\u4E00\u81F4\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012");
        return false;
      }
      const targetOriginList = Array.isArray(message.targetOrigin) ? message.targetOrigin : [message.targetOrigin];
      targetOriginList.forEach((targetOrigin) => {
        const readyInfo = window.__broadcastMessageReadyInfo__ || null;
        if (targetOrigin !== "*" && (!readyInfo || !readyInfo.referrer.startsWith(targetOrigin))) {
          if (message.instanceId !== readyInfo.instanceId) {
            message.debug && console.warn(`[BroadcastChannel-event] \u6D88\u606F\u7684targetOrigin\u548C\u5F53\u524D\u7236\u9875\u9762\u7684\u5730\u5740\u4E0D\u5339\u914D\uFF0C\u53D6\u6D88\u6570\u636E\u5411\u4E0A\u4F20\u9012\uFF0C[targetOrigin]${targetOrigin} [parent page]${readyInfo.referrer}`);
          }
          return false;
        }
        window.parent.postMessage(message, targetOrigin);
      });
    });
    this.__BroadcastChannelInstance__ = BroadcastChannelInstance;
  }
  __registerStorageMessageListener__() {
    if (this.__hasRegisterStorageListener__) {
      return false;
    }
    window.addEventListener("storage", (event) => {
      let message = event.newValue;
      if (!message || event.key !== "__BroadcastMessage__") {
        return false;
      }
      try {
        message = JSON.parse(message);
      } catch (e) {
        return false;
      }
      if (!message || !message.windowId || !message.data) {
        return false;
      }
      const channelId = window.__broadcastMessageChannelId__;
      if (!message.channelId || channelId && message.channelId !== channelId) {
        message.debug && console.error("[transportMessage] channelId\u4E0D\u5B58\u5728\u6216\u4E0D\u5339\u914D\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012", channelId, message);
        return false;
      }
      message.debug && console.log(`[storage-event][iframe][${location.origin}]`, event);
      if (!message.allowLocalBroadcast && window.__windowId__ && window.__windowId__ === message.windowId) {
        message.debug && console.info("[storage-event] \u6D88\u606F\u6E90\u63A5\u6536\u7AEF\u548C\u6D88\u606F\u6E90\u7684\u6765\u6E90\u7AEF\u4E00\u81F4\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012");
        return false;
      }
      const targetOriginList = Array.isArray(message.targetOrigin) ? message.targetOrigin : [message.targetOrigin];
      targetOriginList.forEach((targetOrigin) => {
        const readyInfo = window.__broadcastMessageReadyInfo__ || { referrer: "" };
        if (targetOrigin !== "*" && !readyInfo.referrer.startsWith(targetOrigin)) {
          if (message.instanceId !== readyInfo.instanceId) {
            message.debug && console.warn(`[storage-event] \u6D88\u606F\u7684targetOrigin\u548C\u5F53\u524D\u7236\u9875\u9762\u7684\u5730\u5740\u4E0D\u5339\u914D\uFF0C\u53D6\u6D88\u6570\u636E\u5411\u4E0A\u4F20\u9012\uFF0C[targetOrigin]${targetOrigin} [parent page]${readyInfo.referrer}`);
          }
          return false;
        }
        window.parent.postMessage(message, targetOrigin);
      });
    });
    this.__hasRegisterStorageListener__ = true;
  }
  postMessage(message, messageType) {
    if (!this._isReady_ && messageType !== "Internal-BroadcastMessage") {
      if (!this._message_cache_) {
        this.ready(() => {
          if (Array.isArray(this._message_cache_)) {
            this._message_cache_.forEach((message2) => {
              this.postMessage(message2);
            });
            delete this._message_cache_;
          }
        });
      }
      this._message_cache_ = this._message_cache_ || [];
      this._message_cache_.push(message);
      return true;
    }
    const data = {
      data: message,
      type: messageType || "BroadcastMessage",
      origin: location.origin || top.location.origin,
      targetOrigin: this.targetOrigin,
      referrer: location.href || top.location.href,
      timeStamp: window.performance ? performance.now() : Date.now(),
      transportType: this.transportType,
      allowLocalBroadcast: this.allowLocalBroadcast,
      channelId: this.channelId,
      instanceId: this.instanceId,
      debug: this.debug
    };
    if (!this.messageWindow || !this.messageWindow.postMessage) {
      this.debug && console.error("[messageWindow error] \u65E0\u6CD5\u53D1\u9001message", data, this.messageWindow);
      return false;
    }
    const trustedDomain = this.getTrustedDomain();
    this.messageWindow.postMessage(data, trustedDomain);
  }
  onMessage(handler) {
    this.__messageListener__ = this.__messageListener__ || [];
    if (handler instanceof Function && !this.__messageListener__.includes(handler)) {
      this.__messageListener__.push(handler);
    }
    if (this.__hasMessageListener__) {
      return false;
    }
    this.__hasMessageListener__ = true;
    window.addEventListener("message", (event) => {
      const message = event.data;
      const isBroadcastMessage = message && message.type === "BroadcastMessage" && message.data && message.channelId && message.referrer;
      if (!isBroadcastMessage) {
        return false;
      }
      if (this.channelId !== "*" && message.channelId !== this.channelId) {
        if (message.origin !== location.origin) {
          message.debug && console.error("[messageListener] \u5B58\u5728\u6570\u636E\u5B89\u5168\u9690\u60A3\uFF0C\u8BF7\u5B8C\u5584\u811A\u672C\u903B\u8F91", this.channelId, event);
        }
        return false;
      }
      const fakeEvent = {};
      try {
        for (const key in event) {
          let value = event[key];
          if (key === "data" && !this.emitOriginalMessage) {
            value = message.data;
          } else {
            if (key === "type") {
              value = "BroadcastMessage";
            }
          }
          Object.defineProperty(fakeEvent, key, {
            enumerable: key === "data",
            writable: false,
            configurable: true,
            value
          });
        }
      } catch (e) {
      }
      this.__messageListener__.forEach((handler2) => {
        handler2 instanceof Function && handler2(fakeEvent);
      });
    }, true);
  }
  offMessage(handler) {
    this.__messageListener__ = this.__messageListener__ || [];
    const tempStorageListener = [];
    this.__messageListener__.forEach((item) => {
      if (item !== handler) {
        tempStorageListener.push(item);
      }
    });
    this.__messageListener__ = tempStorageListener;
  }
  postMessageToInternal(message) {
    this.postMessage(message, "Internal-BroadcastMessage");
  }
  onInternalMessage(handler) {
    this.__internalMessageListener__ = this.__internalMessageListener__ || [];
    if (handler instanceof Function && !this.__internalMessageListener__.includes(handler)) {
      this.__internalMessageListener__.push(handler);
    }
    if (this.__hasInternalMessageListener__) {
      return false;
    }
    this.__hasInternalMessageListener__ = true;
    window.addEventListener("message", (event) => {
      const message = event.data;
      const isInternalMessage = message && message.type === "Internal-BroadcastMessage" && message.channelId === this.channelId && message.instanceId === this.instanceId;
      if (!isInternalMessage) {
        return false;
      }
      this.__internalMessageListener__.forEach((handler2) => {
        handler2 instanceof Function && handler2(event);
      });
    }, true);
  }
  offInternalMessage(handler) {
    this.__internalMessageListener__ = this.__internalMessageListener__ || [];
    const tempStorageListener = [];
    this.__internalMessageListener__.forEach((item) => {
      if (item !== handler) {
        tempStorageListener.push(item);
      }
    });
    this.__internalMessageListener__ = tempStorageListener;
  }
  addEventListener(type, listener) {
    if (type !== "message") {
      return false;
    }
    this.onMessage(listener);
  }
  removeEventListener(type, listener) {
    if (type !== "message") {
      return false;
    }
    this.offMessage(listener);
  }
  ready(handler) {
    if (this._isReady_) {
      if (handler instanceof Function) {
        handler(true);
      }
      return true;
    }
    if (!this.__readyHandler__) {
      this._readyStartTime_ = Date.now();
      this.__readyHandler__ = [];
      const readyHandler = (event) => {
        const message = event.data;
        if (message.data === "initReady") {
          this.postMessageToInternal("readyTest");
        } else if (message.data === "ready") {
          this._isReady_ = true;
          this.readyTime = Date.now() - this._readyStartTime_;
          delete this._readyStartTime_;
          if (this.debug) {
            console.log(`[BroadcastMessage][ready] \u8017\u65F6\uFF1A${this.readyTime}`);
          }
          this.__readyHandler__.forEach((handler2) => {
            if (handler2 instanceof Function) {
              handler2(true);
            }
          });
          delete this.__readyHandler__;
          this.offInternalMessage(readyHandler);
        }
      };
      this.onInternalMessage(readyHandler);
    }
    if (handler instanceof Function) {
      this.__readyHandler__.push(handler);
    } else {
      return new Promise((resolve, reject) => {
        this.__readyHandler__.push(resolve);
      });
    }
  }
  close() {
    if (this.__BroadcastChannelInstance__ && this.__BroadcastChannelInstance__.close) {
      this.__BroadcastChannelInstance__.close();
    }
    if (this.messageWindow) {
      document.body.removeChild(this.messageWindow);
    }
    this.__messageListener__ = [];
    this.__readyHandler__ = [];
  }
}
export {
  BroadcastMessage as B
};
