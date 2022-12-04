;
(function () {
  System.register(['./index-legacy.303605fc.js'], function (exports, module) {
    'use strict';

    var __vite_style__ = document.createElement('style');
    __vite_style__.textContent = ":root {\n  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 400;\n\n  color-scheme: light dark;\n  color: rgba(255, 255, 255, 0.87);\n  background-color: #242424;\n\n  font-synthesis: none;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-text-size-adjust: 100%;\n}\n\na {\n  font-weight: 500;\n  color: #646cff;\n  text-decoration: inherit;\n}\na:hover {\n  color: #535bf2;\n}\n\nbody {\n  margin: 0;\n  display: flex;\n  place-items: center;\n  min-width: 320px;\n  min-height: 100vh;\n}\n\nh1 {\n  font-size: 3.2em;\n  line-height: 1.1;\n}\n\n#app {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\n.logo {\n  height: 6em;\n  padding: 1.5em;\n  will-change: filter;\n}\n.logo:hover {\n  filter: drop-shadow(0 0 2em #646cffaa);\n}\n.logo.vanilla:hover {\n  filter: drop-shadow(0 0 2em #f7df1eaa);\n}\n\n.card {\n  padding: 2em;\n}\n\n.read-the-docs {\n  color: #888;\n}\n\nbutton {\n  border-radius: 8px;\n  border: 1px solid transparent;\n  padding: 0.6em 1.2em;\n  font-size: 1em;\n  font-weight: 500;\n  font-family: inherit;\n  background-color: #1a1a1a;\n  cursor: pointer;\n  transition: border-color 0.25s;\n}\nbutton:hover {\n  border-color: #646cff;\n}\nbutton:focus,\nbutton:focus-visible {\n  outline: 4px auto -webkit-focus-ring-color;\n}\n\n@media (prefers-color-scheme: light) {\n  :root {\n    color: #213547;\n    background-color: #ffffff;\n  }\n  a:hover {\n    color: #747bff;\n  }\n  button {\n    background-color: #f9f9f9;\n  }\n}\n";
    document.head.appendChild(__vite_style__);
    var BroadcastMessage;
    return {
      setters: [module => {
        BroadcastMessage = module.B;
      }],
      execute: function () {
        const style = '';
        const javascriptLogo = "/assets/javascript.8dac5379.svg";
        const broadcastMessage = new BroadcastMessage({
          channelId: "test001",
          // targetOrigin: '*',
          // transportType: 'localStorage',
          allowLocalBroadcast: true,
          emitOriginalMessage: false,
          debug: false
        });
        broadcastMessage.addEventListener("message", function (event) {
          console.log(`[BroadcastMessage-Event][onMessage]`, event.data);
        });
        function setupCounter(element) {
          let counter = 0;
          const setCounter = count => {
            counter = count;
            element.innerHTML = `发送消息 [ count:${counter} ]`;
            broadcastMessage.postMessage(`${Date.now()} - ${counter}`);
          };
          element.addEventListener("click", () => setCounter(counter + 1));
          setCounter(0);
        }
        window.BroadcastMessage = BroadcastMessage;
        document.querySelector('#app').innerHTML = `
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
    请在控制台查看接收到的信息
    <br />
    <br />
    基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案
    </p>
  </div>
`;
        setupCounter(document.querySelector('#counter'));
      }
    };
  });
})();
