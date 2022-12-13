# broadcast-message方法

broadcast-message实例包含的方法如下：

- addEventListener
- onMessage
- removeEventListener
- offMessage
- postMessage
- ready
- close

下面对各个函数的使用方式进行逐一说明：

## addEventListener

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

## onMessage

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

## removeEventListener

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

## offMessage

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

## postMessage

函数参数：  

- message {String|Number|Array|Object} 必选，必须为 'message'
- messageType {String} 可选 默认为'BroadcastMessage', 内部消息为：'Internal-BroadcastMessage', 一般不需传入该参数

发送消息

```javascript
import BroadcastMessage from 'broadcast-message'
const broadcastMessage = new BroadcastMessage({...opts})
broadcastMessage.postMessage('test')
```

## ready

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

## close

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
