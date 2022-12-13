!function(){function e(e,s,t){return s in e?Object.defineProperty(e,s,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[s]=t,e}System.register([],(function(s,t){"use strict";return{execute:function(){
/*!
             * @name         url.js
             * @description  用于对url进行解析的相关方法
             * @version      0.0.1
             * @author       Blaze
             * @date         27/03/2019 15:52
             * @github       https://github.com/xxxily
             */
function t(e){var s=document.createElement("a");return s.href=e||window.location.href,{source:e,protocol:s.protocol.replace(":",""),host:s.hostname,port:s.port,origin:s.origin,search:s.search,query:s.search,file:(s.pathname.match(/\/([^/?#]+)$/i)||["",""])[1],hash:s.hash.replace("#",""),path:s.pathname.replace(/^([^/])/,"/$1"),relative:(s.href.match(/tps?:\/\/[^/]+(.+)/)||["",""])[1],params:function(){const e={},t=[];for(var n=s.search.replace(/^\?/,"").split("&"),a=0;a<n.length;a++){var i=n[a];""!==i&&i.indexOf("=")&&t.push(i)}for(var r=0;r<t.length;r++){var o=t[r],_=o.indexOf("="),d=o.substring(0,_),c=o.substring(_+1);d?e[d]=c:e[c]=null}return e}()}}function n(e){var s=function(e){var s=[];if("[object Object]"!==Object.prototype.toString.call(e))return"";for(var t in e)if(Object.hasOwnProperty.call(e,t)){var n=e[t],a=Object.prototype.toString.call(n);if(""===n||"[object Undefined]"===a)continue;null===n?s.push(t):"[object Array]"===a?s.push(t+"="+n.join(",")):(n=(JSON.stringify(n)||""+n).replace(/(^"|"$)/g,""),s.push(t+"="+n))}return s.join("&")}(e.params)||"";s&&(s="?"+s);var t=e.hash?"#"+e.hash:"";return e.origin+e.path+s+t}
/*!
             * @name         BroadcastMessage.js
             * @description  基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案
             * @version      0.0.1
             * @author       xxxily
             * @date         2022/11/07 09:26
             * @github       https://github.com/xxxily
             */s("B",class{constructor(s={}){e(this,"debug",void 0),e(this,"targetOrigin",void 0),e(this,"transportType",void 0),e(this,"inTrustedDomainPages",void 0),e(this,"allowLocalBroadcast",void 0),e(this,"channelId",void 0),e(this,"instanceId",void 0),e(this,"emitOriginalMessage",void 0),e(this,"readyTime",void 0),e(this,"messageWindow",void 0),e(this,"trustedDomainPages",void 0),e(this,"__hasRegisterPostMessageListener__",void 0),e(this,"__BroadcastChannelInstance__",void 0),e(this,"__hasRegisterStorageListener__",void 0),e(this,"__readyHandler__",void 0),e(this,"_readyStartTime_",void 0),e(this,"_isReady_",void 0),e(this,"__messageListener__",void 0),e(this,"__internalMessageListener__",void 0),e(this,"__hasInternalMessageListener__",void 0),e(this,"__hasMessageListener__",void 0),e(this,"_message_cache_",void 0),this.targetOrigin=s.targetOrigin||location.origin,this.transportType=s.transportType||"BroadcastChannel",this.inTrustedDomainPages=s.inTrustedDomainPages||!1,this.trustedDomainPages=s.trustedDomainPages||"",this.allowLocalBroadcast=s.allowLocalBroadcast||!1,this.channelId=String(s.channelId||"*"),this.instanceId=this.channelId+"_"+(window.performance?performance.now():Date.now()),this.debug=s.debug||!1,this.emitOriginalMessage=s.emitOriginalMessage||!1,this.messageWindow=window,this.readyTime=0,this._isReady_=!1,this.__messageListener__=[],this.__internalMessageListener__=[],this.init()}init(){if(this.trustedDomainPages){const e=t(this.trustedDomainPages);e.params.channelId=this.channelId,e.params.instanceId=this.instanceId,this.trustedDomainPages=n(e)}this.__registerMessageWindow__(),this.inTrustedDomainPages&&window.top&&window!==window.top.window&&(this.__registerPostMessageListener__(),this.__registerStorageMessageListener__(),this.__registerBroadcastChannelListener__(),this.__sendMessageToParentWindow__("initReady"))}getTrustedDomain(){return this.trustedDomainPages?t(this.trustedDomainPages).origin:location.origin}__sendMessageToParentWindow__(e){if(window.parent===window||!e)return;const s=window.__broadcastMessageChannelId__||this.channelId,t=window.__broadcastMessageInstanceId__||this.instanceId;window.parent.postMessage({data:e,channelId:s,instanceId:t,type:"Internal-BroadcastMessage"},"*")}__registerMessageWindow__(){if(this.messageWindow!==window)return;const e=document.createElement("iframe");if(e.style.display="none",e.style.visibility="hidden",e.src=this.trustedDomainPages,e.className="broadcast-message-iframe",document.body.appendChild(e),this.messageWindow=e.contentWindow,!this.inTrustedDomainPages&&!this.trustedDomainPages&&this.messageWindow&&this.messageWindow.document){const e=this.messageWindow.document;if(!e.body){const s=e.createElement("body");s.innerHTML="<h1>Broadcast-Message-page</h1>",e.documentElement.appendChild(s)}e.open(),e.write(`\n        <script>\n        function ${this.__registerPostMessageListener__};\n        function ${this.__registerStorageMessageListener__};\n        function ${this.__registerBroadcastChannelListener__};\n        function ${this.__sendMessageToParentWindow__};\n        function init () {\n          if (window.__hasInit__) { return false; }\n          window.__broadcastMessageChannelId__ = "${this.channelId}";\n          window.__broadcastMessageInstanceId__ = "${this.instanceId}";\n          __registerPostMessageListener__();\n          __registerStorageMessageListener__();\n          __registerBroadcastChannelListener__();\n          __sendMessageToParentWindow__('initReady');\n          window.__hasInit__ = true ;\n        }\n\n        document.addEventListener("DOMContentLoaded", init);\n        window.addEventListener("load", init)\n        setTimeout(init, 100)\n        <\/script>\n      `),e.close()}}__registerPostMessageListener__(){const e=this;if(e.__hasRegisterPostMessageListener__)return!1;if(window.top===window)return!1;if(window.__windowId__=String((Date.now()-1e5*Math.random()).toFixed(2)),!window.__broadcastMessageChannelId__)try{const e=t(location.href);if(!e.params.channelId||!e.params.instanceId)throw new Error("URL缺失相关参数");window.__broadcastMessageChannelId__=e.params.channelId,window.__broadcastMessageInstanceId__=e.params.instanceId}catch(n){console.error(`[registerPostMessageListener][${location.origin}] 获取broadcastMessageChannelId失败`,n)}function s(){let e=document.querySelector("#message-transport-iframe");return e||(e=document.createElement("iframe"),e.id="message-transport-iframe",e.style.display="none",e.style.visibility="hidden",document.body.appendChild(e),e)}s(),window.addEventListener("message",(t=>{const n=t.data;if(!n||!n.type)return!1;"BroadcastMessage"===n.type?function(e){const t=e.data;t.windowId=window.__windowId__,t.debug&&console.log(`[transportMessage][iframe][${location.origin}]`);const n=s().contentWindow;if(!n)throw new Error("[transportMessage][iframe]用于消息中转的iframe不存在，检测是否意外删除了");if(n.BroadcastChannel&&n.BroadcastChannel.prototype.postMessage&&"localStorage"!==t.transportType){const e=n.__BroadcastChannelInstance__||new n.BroadcastChannel("__BroadcastChannelMessage__");n.__BroadcastChannelInstance__=n.__BroadcastChannelInstance__||e,e.postMessage(t)}else n.localStorage.setItem("__BroadcastMessage__",JSON.stringify(t))}(t):"Internal-BroadcastMessage"===n.type&&function(s){const t=s.data;if(!t)return!1;if("readyTest"===t.data){window.__broadcastMessageReadyInfo__=t;const s=e.__sendMessageToParentWindow__||window.__sendMessageToParentWindow__;s instanceof Function&&s("ready")}}(t)}),!0),this.__hasRegisterPostMessageListener__=!0}__registerBroadcastChannelListener__(){if(!window.BroadcastChannel||!BroadcastChannel.prototype.postMessage)return console.error(`[BroadcastChannel][${location.origin}]`,"不支持BroadcastChannel"),!1;if(this.__BroadcastChannelInstance__)return!0;const e=new BroadcastChannel("__BroadcastChannelMessage__");e.addEventListener("message",(e=>{const s=e.data;if(!s||!s.windowId||!s.data)return!1;const t=window.__broadcastMessageChannelId__;if(!s.channelId||t&&s.channelId!==t)return s.debug&&console.info("[transportMessage] channelId不存在或不匹配，禁止数据向上传递",t,s),!1;if(!s.allowLocalBroadcast&&window.__windowId__&&window.__windowId__===s.windowId)return s.debug&&console.info("[BroadcastChannel-event] 消息源接收端和消息源的来源端一致，禁止数据向上传递"),!1;(Array.isArray(s.targetOrigin)?s.targetOrigin:[s.targetOrigin]).forEach((e=>{const t=window.__broadcastMessageReadyInfo__||null;if(!("*"===e||t&&t.referrer.startsWith(e)))return s.instanceId!==t.instanceId&&s.debug&&console.warn(`[BroadcastChannel-event] 消息的targetOrigin和当前父页面的地址不匹配，取消数据向上传递，[targetOrigin]${e} [parent page]${t.referrer}`),!1;window.parent.postMessage(s,e)}))})),this.__BroadcastChannelInstance__=e}__registerStorageMessageListener__(){if(this.__hasRegisterStorageListener__)return!1;window.addEventListener("storage",(e=>{let s=e.newValue;if(!s||"__BroadcastMessage__"!==e.key)return!1;try{s=JSON.parse(s)}catch(n){return!1}if(!s||!s.windowId||!s.data)return!1;const t=window.__broadcastMessageChannelId__;if(!s.channelId||t&&s.channelId!==t)return s.debug&&console.error("[transportMessage] channelId不存在或不匹配，禁止数据向上传递",t,s),!1;if(s.debug&&console.log(`[storage-event][iframe][${location.origin}]`,e),!s.allowLocalBroadcast&&window.__windowId__&&window.__windowId__===s.windowId)return s.debug&&console.info("[storage-event] 消息源接收端和消息源的来源端一致，禁止数据向上传递"),!1;(Array.isArray(s.targetOrigin)?s.targetOrigin:[s.targetOrigin]).forEach((e=>{const t=window.__broadcastMessageReadyInfo__||{referrer:""};if("*"!==e&&!t.referrer.startsWith(e))return s.instanceId!==t.instanceId&&s.debug&&console.warn(`[storage-event] 消息的targetOrigin和当前父页面的地址不匹配，取消数据向上传递，[targetOrigin]${e} [parent page]${t.referrer}`),!1;window.parent.postMessage(s,e)}))})),this.__hasRegisterStorageListener__=!0}postMessage(e,s){if(!this._isReady_&&"Internal-BroadcastMessage"!==s)return this._message_cache_||this.ready((()=>{Array.isArray(this._message_cache_)&&(this._message_cache_.forEach((e=>{this.postMessage(e)})),delete this._message_cache_)})),this._message_cache_=this._message_cache_||[],this._message_cache_.push(e),!0;const t={data:e,type:s||"BroadcastMessage",origin:location.origin||window.top&&window.top.location.origin,targetOrigin:this.targetOrigin,referrer:location.href||window.top&&window.top.location.href,timeStamp:window.performance?performance.now():Date.now(),transportType:this.transportType,allowLocalBroadcast:this.allowLocalBroadcast,channelId:this.channelId,instanceId:this.instanceId,debug:this.debug};if(!this.messageWindow||!this.messageWindow.postMessage)return this.debug&&console.error("[messageWindow error] 无法发送message",t,this.messageWindow),!1;const n=this.getTrustedDomain();this.messageWindow.postMessage(t,n)}onMessage(e){if(this.__messageListener__=this.__messageListener__||[],e instanceof Function&&!this.__messageListener__.includes(e)&&this.__messageListener__.push(e),this.__hasMessageListener__)return!1;this.__hasMessageListener__=!0,window.addEventListener("message",(e=>{const s=e.data;if(!(s&&"BroadcastMessage"===s.type&&s.data&&s.channelId&&s.referrer))return!1;if("*"!==this.channelId&&s.channelId!==this.channelId)return s.origin!==location.origin&&s.debug&&console.error("[messageListener] 存在数据安全隐患，请完善脚本逻辑",this.channelId,e),!1;const t={};try{for(const n in e){let a=e[n];"data"!==n||this.emitOriginalMessage?"type"===n&&(a="BroadcastMessage"):a=s.data,Object.defineProperty(t,n,{enumerable:"data"===n,writable:!1,configurable:!0,value:a})}}catch(n){}this.__messageListener__.forEach((e=>{e instanceof Function&&e(t)}))}),!0)}offMessage(e){this.__messageListener__=this.__messageListener__||[];const s=[];this.__messageListener__.forEach((t=>{t!==e&&s.push(t)})),this.__messageListener__=s}postMessageToInternal(e){this.postMessage(e,"Internal-BroadcastMessage")}onInternalMessage(e){if(this.__internalMessageListener__=this.__internalMessageListener__||[],e instanceof Function&&!this.__internalMessageListener__.includes(e)&&this.__internalMessageListener__.push(e),this.__hasInternalMessageListener__)return!1;this.__hasInternalMessageListener__=!0,window.addEventListener("message",(e=>{const s=e.data;return!(!s||"Internal-BroadcastMessage"!==s.type||s.channelId!==this.channelId||s.instanceId!==this.instanceId)&&(this.__internalMessageListener__.forEach((s=>{s instanceof Function&&s(e)})),!0)}),!0)}offInternalMessage(e){this.__internalMessageListener__=this.__internalMessageListener__||[];const s=[];this.__internalMessageListener__.forEach((t=>{t!==e&&s.push(t)})),this.__internalMessageListener__=s}addEventListener(e,s){if("message"!==e)return!1;this.onMessage(s)}removeEventListener(e,s){if("message"!==e)return!1;this.offMessage(s)}ready(e){if(this._isReady_)return e instanceof Function&&e(!0),!0;if(!this.__readyHandler__){this._readyStartTime_=Date.now(),this.__readyHandler__=[];const e=s=>{const t=s.data;"initReady"===t.data?this.postMessageToInternal("readyTest"):"ready"===t.data&&(this._isReady_=!0,this._readyStartTime_&&(this.readyTime=Date.now()-this._readyStartTime_),delete this._readyStartTime_,this.debug&&console.log(`[BroadcastMessage][ready] 耗时：${this.readyTime}`),Array.isArray(this.__readyHandler__)&&this.__readyHandler__.forEach((e=>{e instanceof Function&&e(!0)})),delete this.__readyHandler__,this.offInternalMessage(e))};this.onInternalMessage(e)}if(!(e instanceof Function))return new Promise((e=>{Array.isArray(this.__readyHandler__)&&this.__readyHandler__.push(e)}));this.__readyHandler__.push(e)}close(){this.__BroadcastChannelInstance__&&this.__BroadcastChannelInstance__.close&&this.__BroadcastChannelInstance__.close(),this.messageWindow&&this.messageWindow instanceof HTMLElement&&document.body.removeChild(this.messageWindow),this.__messageListener__=[],this.__readyHandler__=[]}})}}}))}();
