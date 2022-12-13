import{B as a}from"./index.b3cc1df0.js";function c(){import("data:text/javascript,")}const o=new a({channelId:"test001",allowLocalBroadcast:!0,emitOriginalMessage:!1,debug:!1});o.addEventListener("message",function(e){console.log("[BroadcastMessage-Event][onMessage]",e.data)});function r(e){let t=0;const s=n=>{t=n,e.innerHTML=`\u53D1\u9001\u6D88\u606F [ count:${t} ]`,o.postMessage(`${Date.now()} - ${t}`)};e.addEventListener("click",()=>s(t+1)),s(0)}window.BroadcastMessage=a;document.querySelector("#app").innerHTML=`
  <div>
    <a href="https://broadcast-message.anzz.top">
      <img src="https://broadcast-message.anzz.top/dist/assets/logo.png" alt="broadcast-message logo" />
    </a>
    <h1>Hello BroadcastMessage</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
    \u8BF7\u5728\u63A7\u5236\u53F0\u67E5\u770B\u63A5\u6536\u5230\u7684\u4FE1\u606F
    <br />
    <br />
    \u57FA\u4E8EpostMessage+BroadcastChannel+localStorage+\u4E92\u4FE1\u57DF\u540D\u7684\u524D\u7AEF\u9875\u9762\u6570\u636E\u901A\u4FE1\u89E3\u51B3\u65B9\u6848
    </p>
  </div>
`;r(document.querySe1lector("#counter"));export{c as __vite_legacy_guard};
