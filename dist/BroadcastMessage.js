/*!
 * @name         url.js
 * @description  用于对url进行解析的相关方法
 * @version      0.0.1
 * @author       Blaze
 * @date         27/03/2019 15:52
 * @github       https://github.com/xxxily
 */
function c(o) {
  var e = document.createElement("a");
  return e.href = o || window.location.href, {
    source: o,
    protocol: e.protocol.replace(":", ""),
    host: e.hostname,
    port: e.port,
    origin: e.origin,
    search: e.search,
    query: e.search,
    file: (e.pathname.match(/\/([^/?#]+)$/i) || ["", ""])[1],
    hash: e.hash.replace("#", ""),
    path: e.pathname.replace(/^([^/])/, "/$1"),
    relative: (e.href.match(/tps?:\/\/[^/]+(.+)/) || ["", ""])[1],
    params: function() {
      for (var s = {}, a = [], r = e.search.replace(/^\?/, "").split("&"), t = 0; t < r.length; t++) {
        var n = r[t];
        n !== "" && n.indexOf("=") && a.push(n);
      }
      for (var i = 0; i < a.length; i++) {
        var d = a[i], _ = d.indexOf("="), g = d.substring(0, _), h = d.substring(_ + 1);
        g ? s[g] = h : s[h] = null;
      }
      return s;
    }()
  };
}
function l(o) {
  var e = [];
  if (!Object.prototype.toString.call(o) === "[object Object]")
    return "";
  for (var s in o)
    if (Object.hasOwnProperty.call(o, s)) {
      var a = o[s], r = Object.prototype.toString.call(a);
      if (a === "" || r === "[object Undefined]")
        continue;
      a === null ? e.push(s) : r === "[object Array]" ? e.push(s + "=" + a.join(",")) : (a = (JSON.stringify(a) || "" + a).replace(/(^"|"$)/g, ""), e.push(s + "=" + a));
    }
  return e.join("&");
}
function f(o) {
  var e = l(o.params) || "";
  e && (e = "?" + e);
  var s = o.hash ? "#" + o.hash : "";
  return o.origin + o.path + e + s;
}
/*!
 * @name         BroadcastMessage.js
 * @description  基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/11/07 09:26
 * @github       https://github.com/xxxily
 */
class w {
  constructor(e = {}) {
    this.targetOrigin = e.targetOrigin || location.origin, this.transportType = e.transportType || "BroadcastChannel", this.inTrustedDomainPages = e.inTrustedDomainPages || !1, this.trustedDomainPages = e.trustedDomainPages || "", this.allowLocalBroadcast = e.allowLocalBroadcast || !1, this.channelId = String(e.channelId || "*"), this.instanceId = this.channelId + "_" + (window.performance ? performance.now() : Date.now()), this.debug = e.debug || !1, this.emitOriginalMessage = e.emitOriginalMessage || !1, this.messageWindow = window, this.readyTime = 0, this.init(e);
  }
  init() {
    if (this.trustedDomainPages) {
      const e = c(this.trustedDomainPages);
      e.params.channelId = this.channelId, e.params.instanceId = this.instanceId, this.trustedDomainPages = f(e);
    }
    this.__registerMessageWindow__(), this.inTrustedDomainPages && window !== top.window && (this.__registerPostMessageListener__(), this.__registerStorageMessageListener__(), this.__registerBroadcastChannelListener__(), this.__sendMessageToParentWindow__("initReady"));
  }
  getTrustedDomain() {
    return this.trustedDomainPages ? c(this.trustedDomainPages).origin : location.origin;
  }
  __sendMessageToParentWindow__(e) {
    if (window.parent === window || !e)
      return !1;
    const s = window.__broadcastMessageChannelId__ || this.channelId, a = window.__broadcastMessageInstanceId__ || this.instanceId;
    window.parent.postMessage({
      data: e,
      channelId: s,
      instanceId: a,
      type: "Internal-BroadcastMessage"
    }, "*");
  }
  __registerMessageWindow__() {
    if (this.messageWindow !== window)
      return !1;
    const e = document.createElement("iframe");
    if (e.style.display = "none", e.style.visibility = "hidden", e.src = this.trustedDomainPages, e.className = "broadcast-message-iframe", document.body.appendChild(e), this.messageWindow = e.contentWindow, !this.inTrustedDomainPages && !this.trustedDomainPages && this.messageWindow.document && this.messageWindow.document.write) {
      const s = this.messageWindow.document;
      if (!s.body) {
        const a = s.createElement("body");
        a.innerHTML = "<h1>Broadcast-Message-page</h1>", s.documentElement.appendChild(a);
      }
      s.open(), s.write(`
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
      `), s.close();
    }
  }
  __registerPostMessageListener__() {
    const e = this;
    if (e.__hasRegisterPostMessageListener__ || window.top === window)
      return !1;
    if (window.__windowId__ = String((Date.now() - Math.random() * 1e5).toFixed(2)), !window.__broadcastMessageChannelId__)
      try {
        const t = c(location.href);
        if (t.params.channelId && t.params.instanceId)
          window.__broadcastMessageChannelId__ = t.params.channelId, window.__broadcastMessageInstanceId__ = t.params.instanceId;
        else
          throw new Error("URL\u7F3A\u5931\u76F8\u5173\u53C2\u6570");
      } catch (t) {
        console.error(`[registerPostMessageListener][${location.origin}] \u83B7\u53D6broadcastMessageChannelId\u5931\u8D25`, t);
      }
    function s() {
      let t = document.querySelector("#message-transport-iframe");
      return t || (t = document.createElement("iframe"), t.id = "message-transport-iframe", t.style.display = "none", t.style.visibility = "hidden", document.body.appendChild(t), t);
    }
    function a(t) {
      const n = t.data;
      n.windowId = window.__windowId__, n.debug && console.log(`[transportMessage][iframe][${location.origin}]`);
      const i = s().contentWindow;
      if (i.BroadcastChannel && i.BroadcastChannel.prototype.postMessage && n.transportType !== "localStorage") {
        const _ = i.__BroadcastChannelInstance__ || new i.BroadcastChannel("__BroadcastChannelMessage__");
        i.__BroadcastChannelInstance__ = i.__BroadcastChannelInstance__ || _, _.postMessage(n);
      } else
        i.localStorage.setItem("__BroadcastMessage__", JSON.stringify(n));
    }
    s();
    function r(t) {
      const n = t.data;
      if (!n)
        return !1;
      if (n.data === "readyTest") {
        window.__broadcastMessageReadyInfo__ = n;
        const i = e.__sendMessageToParentWindow__ || window.__sendMessageToParentWindow__;
        i instanceof Function && i("ready");
      }
    }
    window.addEventListener("message", (t) => {
      const n = t.data;
      if (!n || !n.type)
        return !1;
      n.type === "BroadcastMessage" ? a(t) : n.type === "Internal-BroadcastMessage" && r(t);
    }, !0), this.__hasRegisterPostMessageListener__ = !0;
  }
  __registerBroadcastChannelListener__() {
    if (!window.BroadcastChannel || !BroadcastChannel.prototype.postMessage)
      return console.error(`[BroadcastChannel][${location.origin}]`, "\u4E0D\u652F\u6301BroadcastChannel"), !1;
    if (this.__BroadcastChannelInstance__)
      return !0;
    const e = new BroadcastChannel("__BroadcastChannelMessage__");
    e.addEventListener("message", (s) => {
      const a = s.data;
      if (!a || !a.windowId || !a.data)
        return !1;
      const r = window.__broadcastMessageChannelId__;
      if (!a.channelId || r && a.channelId !== r)
        return a.debug && console.info("[transportMessage] channelId\u4E0D\u5B58\u5728\u6216\u4E0D\u5339\u914D\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012", r, a), !1;
      if (!a.allowLocalBroadcast && window.__windowId__ && window.__windowId__ === a.windowId)
        return a.debug && console.info("[BroadcastChannel-event] \u6D88\u606F\u6E90\u63A5\u6536\u7AEF\u548C\u6D88\u606F\u6E90\u7684\u6765\u6E90\u7AEF\u4E00\u81F4\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012"), !1;
      (Array.isArray(a.targetOrigin) ? a.targetOrigin : [a.targetOrigin]).forEach((n) => {
        const i = window.__broadcastMessageReadyInfo__ || null;
        if (n !== "*" && (!i || !i.referrer.startsWith(n)))
          return a.instanceId !== i.instanceId && a.debug && console.warn(`[BroadcastChannel-event] \u6D88\u606F\u7684targetOrigin\u548C\u5F53\u524D\u7236\u9875\u9762\u7684\u5730\u5740\u4E0D\u5339\u914D\uFF0C\u53D6\u6D88\u6570\u636E\u5411\u4E0A\u4F20\u9012\uFF0C[targetOrigin]${n} [parent page]${i.referrer}`), !1;
        window.parent.postMessage(a, n);
      });
    }), this.__BroadcastChannelInstance__ = e;
  }
  __registerStorageMessageListener__() {
    if (this.__hasRegisterStorageListener__)
      return !1;
    window.addEventListener("storage", (e) => {
      let s = e.newValue;
      if (!s || e.key !== "__BroadcastMessage__")
        return !1;
      try {
        s = JSON.parse(s);
      } catch {
        return !1;
      }
      if (!s || !s.windowId || !s.data)
        return !1;
      const a = window.__broadcastMessageChannelId__;
      if (!s.channelId || a && s.channelId !== a)
        return s.debug && console.error("[transportMessage] channelId\u4E0D\u5B58\u5728\u6216\u4E0D\u5339\u914D\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012", a, s), !1;
      if (s.debug && console.log(`[storage-event][iframe][${location.origin}]`, e), !s.allowLocalBroadcast && window.__windowId__ && window.__windowId__ === s.windowId)
        return s.debug && console.info("[storage-event] \u6D88\u606F\u6E90\u63A5\u6536\u7AEF\u548C\u6D88\u606F\u6E90\u7684\u6765\u6E90\u7AEF\u4E00\u81F4\uFF0C\u7981\u6B62\u6570\u636E\u5411\u4E0A\u4F20\u9012"), !1;
      (Array.isArray(s.targetOrigin) ? s.targetOrigin : [s.targetOrigin]).forEach((t) => {
        const n = window.__broadcastMessageReadyInfo__ || { referrer: "" };
        if (t !== "*" && !n.referrer.startsWith(t))
          return s.instanceId !== n.instanceId && s.debug && console.warn(`[storage-event] \u6D88\u606F\u7684targetOrigin\u548C\u5F53\u524D\u7236\u9875\u9762\u7684\u5730\u5740\u4E0D\u5339\u914D\uFF0C\u53D6\u6D88\u6570\u636E\u5411\u4E0A\u4F20\u9012\uFF0C[targetOrigin]${t} [parent page]${n.referrer}`), !1;
        window.parent.postMessage(s, t);
      });
    }), this.__hasRegisterStorageListener__ = !0;
  }
  postMessage(e, s) {
    if (!this._isReady_ && s !== "Internal-BroadcastMessage")
      return this._message_cache_ || this.ready(() => {
        Array.isArray(this._message_cache_) && (this._message_cache_.forEach((t) => {
          this.postMessage(t);
        }), delete this._message_cache_);
      }), this._message_cache_ = this._message_cache_ || [], this._message_cache_.push(e), !0;
    const a = {
      data: e,
      type: s || "BroadcastMessage",
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
    if (!this.messageWindow || !this.messageWindow.postMessage)
      return this.debug && console.error("[messageWindow error] \u65E0\u6CD5\u53D1\u9001message", a, this.messageWindow), !1;
    const r = this.getTrustedDomain();
    this.messageWindow.postMessage(a, r);
  }
  onMessage(e) {
    if (this.__messageListener__ = this.__messageListener__ || [], e instanceof Function && !this.__messageListener__.includes(e) && this.__messageListener__.push(e), this.__hasMessageListener__)
      return !1;
    this.__hasMessageListener__ = !0, window.addEventListener("message", (s) => {
      const a = s.data;
      if (!(a && a.type === "BroadcastMessage" && a.data && a.channelId && a.referrer))
        return !1;
      if (this.channelId !== "*" && a.channelId !== this.channelId)
        return a.origin !== location.origin && a.debug && console.error("[messageListener] \u5B58\u5728\u6570\u636E\u5B89\u5168\u9690\u60A3\uFF0C\u8BF7\u5B8C\u5584\u811A\u672C\u903B\u8F91", this.channelId, s), !1;
      const t = {};
      try {
        for (const n in s) {
          let i = s[n];
          n === "data" && !this.emitOriginalMessage ? i = a.data : n === "type" && (i = "BroadcastMessage"), Object.defineProperty(t, n, {
            enumerable: n === "data",
            writable: !1,
            configurable: !0,
            value: i
          });
        }
      } catch {
      }
      this.__messageListener__.forEach((n) => {
        n instanceof Function && n(t);
      });
    }, !0);
  }
  offMessage(e) {
    this.__messageListener__ = this.__messageListener__ || [];
    const s = [];
    this.__messageListener__.forEach((a) => {
      a !== e && s.push(a);
    }), this.__messageListener__ = s;
  }
  postMessageToInternal(e) {
    this.postMessage(e, "Internal-BroadcastMessage");
  }
  onInternalMessage(e) {
    if (this.__internalMessageListener__ = this.__internalMessageListener__ || [], e instanceof Function && !this.__internalMessageListener__.includes(e) && this.__internalMessageListener__.push(e), this.__hasInternalMessageListener__)
      return !1;
    this.__hasInternalMessageListener__ = !0, window.addEventListener("message", (s) => {
      const a = s.data;
      if (!(a && a.type === "Internal-BroadcastMessage" && a.channelId === this.channelId && a.instanceId === this.instanceId))
        return !1;
      this.__internalMessageListener__.forEach((t) => {
        t instanceof Function && t(s);
      });
    }, !0);
  }
  offInternalMessage(e) {
    this.__internalMessageListener__ = this.__internalMessageListener__ || [];
    const s = [];
    this.__internalMessageListener__.forEach((a) => {
      a !== e && s.push(a);
    }), this.__internalMessageListener__ = s;
  }
  addEventListener(e, s) {
    if (e !== "message")
      return !1;
    this.onMessage(s);
  }
  removeEventListener(e, s) {
    if (e !== "message")
      return !1;
    this.offMessage(s);
  }
  ready(e) {
    if (this._isReady_)
      return e instanceof Function && e(!0), !0;
    if (!this.__readyHandler__) {
      this._readyStartTime_ = Date.now(), this.__readyHandler__ = [];
      const s = (a) => {
        const r = a.data;
        r.data === "initReady" ? this.postMessageToInternal("readyTest") : r.data === "ready" && (this._isReady_ = !0, this.readyTime = Date.now() - this._readyStartTime_, delete this._readyStartTime_, this.debug && console.log(`[BroadcastMessage][ready] \u8017\u65F6\uFF1A${this.readyTime}`), this.__readyHandler__.forEach((t) => {
          t instanceof Function && t(!0);
        }), delete this.__readyHandler__, this.offInternalMessage(s));
      };
      this.onInternalMessage(s);
    }
    if (e instanceof Function)
      this.__readyHandler__.push(e);
    else
      return new Promise((s, a) => {
        this.__readyHandler__.push(s);
      });
  }
  close() {
    this.__BroadcastChannelInstance__ && this.__BroadcastChannelInstance__.close && this.__BroadcastChannelInstance__.close(), this.messageWindow && document.body.removeChild(this.messageWindow), this.__messageListener__ = [], this.__readyHandler__ = [];
  }
}
export {
  w as default
};
