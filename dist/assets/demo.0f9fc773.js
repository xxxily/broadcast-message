function __vite_legacy_guard() {
  import("data:text/javascript,");
}
;
import { B as BroadcastMessage } from "./index.5f0dc2ea.js";
const style = "";
const javascriptLogo = "/assets/javascript.8dac5379.svg";
const broadcastMessage = new BroadcastMessage({
  channelId: "test001",
  allowLocalBroadcast: true,
  emitOriginalMessage: false,
  debug: false
});
broadcastMessage.addEventListener("message", function(event) {
  console.log(`[BroadcastMessage-Event][onMessage]`, event.data);
});
function setupCounter(element) {
  let counter = 0;
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `\u53D1\u9001\u6D88\u606F [ count:${counter} ]`;
    broadcastMessage.postMessage(`${Date.now()} - ${counter}`);
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
window.BroadcastMessage = BroadcastMessage;
document.querySelector("#app").innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/assets/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
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
`;
setupCounter(document.querySelector("#counter"));
export {
  __vite_legacy_guard
};
