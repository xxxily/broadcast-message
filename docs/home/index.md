# broadcast-message

![broadcast-message](/logo.png)  

> 基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案

## 特性

- 继承了BroadcastChannel通信的优点：支持跨TAB通信
- 继承了localStorage通信的优点：兼容性好
- 继承了postMessage通信的优点：支持跨域通信
- 一套脚本解决前端数据通信面临的众多情况
- 支持同页、弹窗页、父子嵌套页、跨域、跨TAB页的通信

## 安装

```sh
# npm
npm install broadcast-message

# yarn
yarn add broadcast-message
```

中国大陆用户可使用阿里源进行加速安装

```sh
# npm
npm install broadcast-message --registry=https://registry.npmmirror.com

# yarn
yarn add broadcast-message --registry=https://registry.npmmirror.com
```

## 使用

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = { channelId: 'demo', allowLocalBroadcast: true }
const broadcastMessage = new BroadcastMessage(bmOpts)

/* 注册接收消息事件 */
broadcastMessage.addEventListener("message", event => {
  console.log(`[BroadcastMessage-Event]`, event.data)
})

/* 发送消息 */
broadcastMessage.postMessage(`[demo] ${Date.now()}`)
```
