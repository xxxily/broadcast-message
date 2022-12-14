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

### 同域下基本使用示例  

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

### 指定使用`localStorage`来中转消息  

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = { channelId: 'localStorage-demo', allowLocalBroadcast: true, transportType: 'localStorage' }
const broadcastMessage = new BroadcastMessage(bmOpts)

/* 注册接收消息事件 */
broadcastMessage.addEventListener("message", function (event) {
  console.log(`[BroadcastMessage-Event]`, event.data)
})

/* 发送消息 */
broadcastMessage.postMessage(`[localStorage-demo] ${Date.now()}`)
```

`PS: 一般不建议手动指定transportType类型，broadcast-message默认会根据浏览器的支持情况自动选择BroadcastChannel还是localStorage，另外你应该了解的是：BroadcastChannel的通信效率比localStorage高`

### 跨域下基本使用示例  

假设：  

- 域名A是消息接收方  
- 域名B是消息发送方  

域名A的代码示例：

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = { 
  channelId: 'cross-domain-demo', 
  
  /* 必须使用可信域下的broadcast-message页来进行消息的中转，后面会介绍如何自定义可信域页面地址 */
  trustedDomainPages: 'https://broadcast-message.anzz.top/dist/pages/broadcast-message.html',

  /* 指定接收来自哪个域名发送过来的消息，*表示信任所有域名的消息，生产环境推荐必须指定具体域名 */
  // targetOrigin: "https:anzz.top"
  targetOrigin: "*"
}

const broadcastMessage = new BroadcastMessage(bmOpts)

/* 注册接收消息事件 */
broadcastMessage.addEventListener("message", event => {
  console.log(`[BroadcastMessage-Event]`, event.data)
})
```

域名B的代码示例：

```javascript
import BroadcastMessage from 'broadcast-message'

const bmOpts = {
  channelId: 'cross-domain-demo', 
  
  /* 可信域消息中转页的地址必须和域名A定义的一致 */
  trustedDomainPages: 'https://broadcast-message.anzz.top/dist/pages/broadcast-message.html',
}
const broadcastMessage = new BroadcastMessage(bmOpts)

/* 发送消息 */
broadcastMessage.postMessage(`[cross-domain-demo] ${Date.now()}`)
```

附注：当进行跨域通信时，需先确认域名A和域名B的页面都已加载，且都完成了broadcast-message的初始化工作，才能开始通信，否则会出现消息发送出去了，但接收方还没准备好等情况，导致消息通信失败

### 自定义可信域页面

对于有跨域通信需求的项目，加载一个可信域的页面作为消息中转页是必不可少的。默认可以使用项目的自带可信域页面：  
<https://broadcast-message.anzz.top/dist/pages/broadcast-message.html>  

但出于下面的原因你可能需要自定义可信域页面

- 需要更快更稳定的可信域页面
- 项目对第三方网址有严格的限定
- 封装内部使用的跨域消息通信库

自定义可信域页面代码示例如下：

```javascript
import BroadcastMessage from 'broadcast-message'
new BroadcastMessage({
  /* 只需标识当前脚本运行在可信域页面内即可 */
  inTrustedDomainPages: true,
})
```

将初始化了`inTrustedDomainPages`选项的页面发布出去，即可获得一个自定义可信域页面  

附注：为了让自定义可信域页面更快地加载，你应该务必不要掺杂其他无关逻辑进去，它只作为消息中转页面存在，并不需要其他额外内容  

## broadcast-message选项

`new BroadcastMessage(opts)` 中的opts是一个对象它包含的选项和具体说明如下：

```javascript
const bmOpts = {
  /**
   * 指定BroadcastMessage的消息频道id，不同BroadcastMessage实例，只要channelId一致即可通信
   * 默认的channelId为"*" , 这意味着在不指定频道id的情况下，各个实例的消息都会发往同一个频道上
   */
  channelId: '*',

  /**
   * 允许既是消息的发送页，也可以是消息的接收页，从而做到同源同页收发消息
   * postMessage、BroadcastChannel和storage事件都是必须一个页面发送，另一个页面接收
   * 而BroadcastMessage允许同页面收发消息，只需将allowLocalBroadcast设为true即可
   */
  allowLocalBroadcast: false,

  /**
   * 给 broadcastMessage.addEventListener("message", function (event) {}) 事件派发原始消息对象
   * 默认情况下，broadcastMessage.postMessage(msg) 中的 msg 等于接收到的 event.data，但其实为了能准确派送消息，
   * msg会被包装成有很多辅助参数的对象，如果你需要这些辅助参数信息，可以将emitOriginalMessage设为true
   * 则收到的event.data将是如下的对象实体：
   * event.data = {
   *    data: msg,                   // 消息本体
   *    type: 'BroadcastMessage',    // 消息类型，默认为BroadcastMessage，其他类型，则是自定义消息或内部消息
   *    origin: '',                  // 消息来源的域名地址
   *    targetOrigin: '',            // 消息目标源的域名地址
   *    referrer: '',                // 消息来自哪个页面
   *    timeStamp: '',               // 消息发出时的时间戳
   *    transportType: '',           // 中转消息的载体类型，只可能为BroadcastMessage和localStorage
   *    allowLocalBroadcast: false,  // 该消息是否允许被同页面的BroadcastMessage实例接收到
   *    channelId: '*',              // 消息所属的频道id
   *    instanceId: 'xx_xx',         // 消息所属BroadcastMessage实例id
   *    debug: false                 // 是否为开启了调试选项的消息
   * }
   */
  emitOriginalMessage: false,

  /**
   * 指定消息发送的目标域，规则跟postMessage的targetOrigin一样
   * 但不同的是支持定义数组形式的targetOrigin，从而实现批量跨域数据发送
   * 当然如果是"*"的话就是给任意运行了本插件的页面发送数据
   * 默认为 `location.origin`，即只可以在同域名的页面之间进行通信
   */
  targetOrigin: location.origin,

  /**
   * 指定数据中转传输使用的传输类型，可选值：BroadcastChannel、localStorage
   * 不指定的话，优先使用BroadcastChannel，在不兼容BroadcastChannel的浏览器下使用localStorage
   * 无特需情况，不建议修改该项配置
   */
  transportType: 'BroadcastChannel',

  /**
   * 标识BroadcastMessage实例是否处于可信域的页面上运行
   * 如果是，当前页面作为可信域的中介页嵌入到具体运行环境中
   * 该选项只在自定义可信域页面中使用，其他情况不要使用
   */
  inTrustedDomainPages: false,

  /**
   * 指定作为消息中转的可信域页面地址，有需跨域通信需求才会用到该选项
   * 官方提供的可信域页面地址为：
   * https://broadcast-message.anzz.top/dist/pages/broadcast-message.html
   */
  trustedDomainPages: '',

  /* 标识是否开启调试选项 */
  debug: false,
}
```

## broadcast-message方法

broadcast-message实例包含的方法如下：

- addEventListener
- onMessage
- removeEventListener
- offMessage
- postMessage
- ready
- close

下面对各个函数的使用方式进行逐一说明：

### addEventListener

函数参数：  

- type {String} 必选，必须为 'message'
- listener {Function} 必选

添加消息事件的侦听器

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})

broadcastMessage.addEventListener('message', event => {
  console.log(`[BroadcastMessage-Event]`, event.data)  
})
```

### onMessage

函数参数：  

- handler {Function} 必选

添加消息处理函数，addEventListener是基于onMessage的，只是为了让BroadcastMessage保持跟BroadcastChannel一致的函数调用方式，所以增加了addEventListener事件

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})

broadcastMessage.onMessage(event => {
  console.log(`[BroadcastMessage-Event]`, event.data)  
})
```

### removeEventListener

函数参数：  

- type {String} 必选，必须为 'message'
- listener {Function} 必选

移除消息事件的侦听器

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})

const listener = event => { console.log(`[BroadcastMessage-Event]`, event.data) }
broadcastMessage.addEventListener('message', listener)

/* 一段时间后移除消息事件侦听器 */
setTimeout(() => { broadcastMessage.removeEventListener('message', listener) }, 3000)
```

### offMessage

函数参数：  

- handler {Function} 必选

移除消息处理函数，removeEventListener是基于onMessage的，只是为了让BroadcastMessage保持跟BroadcastChannel一致的函数调用方式，所以增加了removeEventListener事件

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})

const handler = event => { console.log(`[BroadcastMessage-Event]`, event.data) }
broadcastMessage.onMessage(handler)

/* 一段时间后移除消息事件处理函数 */
setTimeout(() => { broadcastMessage.offMessage(listener) }, 3000)
```

### postMessage

函数参数：  

- message {String|Number|Array|Object} 必选，必须为 'message'
- messageType {String} 可选 默认为'BroadcastMessage', 内部消息为：'Internal-BroadcastMessage', 一般不需传入该参数

发送消息

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})
broadcastMessage.postMessage('test')
```

### ready

函数参数：  

- handler {Function} 必选 BroadcastMessage实例创建就绪后的回调函数

侦听BroadcastMessage实例创建就绪后，再执行响应的回调操作，因为BroadcastMessage初始化会创建消息中转的iframe，需要一定的创建时间，所以并不是拥有了BroadcastMessage实例就可以马上postMessage，而是要等到实例就绪才会将消息传送出去  

默认情况下，在执行postMessage前，会自动检测BroadcastMessage实例是否完全就绪，如果没有会将需要发送的消息缓存起来，等BroadcastMessage实例创建就绪之后才将缓存的消息发送出去

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})

broadcastMessage.ready(() => {
  broadcastMessage.postMessage('test')
})

// 如果没使用ready函数，直接调用postMessage也是没问题的
// 这是因为BroadcastMessage会自动判断实例是否创建就绪
// broadcastMessage.postMessage('test')
```

### close

函数参数：  

- 无

需要销毁BroadcastMessage实例时调用的函数，该函数会将BroadcastMessage中转所需的iframe、BroadcastChannel实例和通过addEventListener或onMessage定义的消息函数销毁掉

```javascript
import BroadcastMessage from 'broadcast-message'
let broadcastMessage = new BroadcastMessage({...opts})

broadcastMessage.onMessage(event => { console.log(`[BroadcastMessage-Event]`, event.data) })
broadcastMessage.postMessage('test')

/* 一段时间后销毁broadcastMessage实例 */
setTimeout(() => { 
  broadcastMessage.close() 
  broadcastMessage = null
}, 3000)
```
