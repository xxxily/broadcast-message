import './style.css'
import javascriptLogo from './javascript.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://broadcast-message.anzz.top">
      <img src="https://broadcast-message.anzz.top/dist/assets/logo.png" alt="broadcast-message logo" />
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
`

setupCounter(document.querySelector('#counter'))
